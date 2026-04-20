import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as dotenv from 'dotenv';
import { createRequire } from 'module';
import { ChatGroq } from "@langchain/groq";
import { SYSTEM_PROMPT, MODEL } from './prompt.js';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root (up one level from main.js)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }
}

// IPC Handlers

// 1. PDF Text Extraction
ipcMain.handle('extract-pdf-text', async (event, dataBuffer) => {
  try {
    const data = await pdf(Buffer.from(dataBuffer));
    return { text: data.text };
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
});

// 2. AI Resume Analysis (Streaming)
ipcMain.on('analyze-resume-start', async (event, { resume, jd }) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    console.log('API Key Status:', apiKey ? 'Found' : 'MISSING');
    
    if (!apiKey) {
      event.sender.send('analysis-error', 'GROQ_API_KEY not found in environment.');
      return;
    }

    const llm = new ChatGroq({
      model: MODEL,
      apiKey: apiKey,
      temperature: 0.4,
      streaming: true,
    });

    console.log('Starting stream with model:', MODEL);
    const userMessage = `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jd}`;
    
    const stream = await llm.stream([
      ["system", SYSTEM_PROMPT],
      ["human", userMessage],
    ]);

    let buffer = "";
    let inThought = false;

    for await (const chunk of stream) {
      const token = chunk.content;
      if (!token) continue;
      
      buffer += token;
      
      // Handle <think> blocks
      if (buffer.includes("<think>")) {
        inThought = true;
      }
      if (inThought && buffer.includes("</think>")) {
        inThought = false;
        // Remove the think block from buffer
        buffer = buffer.split("</think>").pop();
      }

      // If we are in a thought block, don't parse anything yet
      if (inThought) {
        // Keep checking for end of thought in next tokens
        // To prevent buffer growth, we can periodically clear bits of it IF we know it's just garbage
        if (buffer.length > 5000) buffer = buffer.slice(-1000); // safety
        continue;
      }

      // Look for complete JSON lines (A2UI envelopes)
      if (buffer.includes("\n")) {
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep incomplete bit
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          let startIdx = trimmed.indexOf('{');
          if (startIdx === -1) continue;

          // Find balanced closing brace
          let braceCount = 0;
          let endIdx = -1;
          for (let i = startIdx; i < trimmed.length; i++) {
            if (trimmed[i] === '{') braceCount++;
            else if (trimmed[i] === '}') braceCount--;

            if (braceCount === 0) {
              endIdx = i;
              break;
            }
          }
          
          if (endIdx !== -1) {
            const jsonPart = trimmed.substring(startIdx, endIdx + 1);
            try {
              const a2uiMsg = JSON.parse(jsonPart);
              event.sender.send('analysis-chunk', a2uiMsg);
            } catch (e) {
              // ignore
            }
          }
        }
      }
    }

    // Final buffer check
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      let startIdx = trimmed.indexOf('{');
      
      if (startIdx !== -1) {
        let braceCount = 0;
        let endIdx = -1;
        for (let i = startIdx; i < trimmed.length; i++) {
          if (trimmed[i] === '{') braceCount++;
          else if (trimmed[i] === '}') braceCount--;
          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }

        if (endIdx !== -1) {
          const jsonPart = trimmed.substring(startIdx, endIdx + 1);
          try {
            const a2uiMsg = JSON.parse(jsonPart);
            event.sender.send('analysis-chunk', a2uiMsg);
          } catch (e) {
            // ignore
          }
        }
      }
    }

    event.sender.send('analysis-end');

  } catch (error) {
    console.error('Analysis Error:', error);
    event.sender.send('analysis-error', error.message);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
