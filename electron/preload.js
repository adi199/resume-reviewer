const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Trigger analysis
  analyzeResume: (resume, jd) => ipcRenderer.send('analyze-resume-start', { resume, jd }),
  
  // Listen for analysis results
  onAnalysisChunk: (callback) => {
    const wrapper = (event, data) => callback(data);
    ipcRenderer.on('analysis-chunk', wrapper);
    return () => ipcRenderer.removeListener('analysis-chunk', wrapper);
  },
  onAnalysisEnd: (callback) => {
    const wrapper = () => callback();
    ipcRenderer.on('analysis-end', wrapper);
    return () => ipcRenderer.removeListener('analysis-end', wrapper);
  },
  onAnalysisError: (callback) => {
    const wrapper = (event, err) => callback(err);
    ipcRenderer.on('analysis-error', wrapper);
    return () => ipcRenderer.removeListener('analysis-error', wrapper);
  },
  
  // PDF Extraction
  extractPdfText: (pdfBuffer) => ipcRenderer.invoke('extract-pdf-text', pdfBuffer),

  // Settings Management
  saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key),
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  
  // Helper to handle file path for electron
  // In a real app, you'd use dialog.showOpenDialog but for this drop-zone style,
  // we can use the web-exposed file.path if available (standard in Electron)
});
