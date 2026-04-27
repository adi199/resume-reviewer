# Resume Reviewer

An AI-powered desktop app that analyzes your resume against a job description and gives instant, structured feedback — built with Electron, React, and Groq. Uses **A2UI** for a structured, schema-driven UI rendering pipeline that bridges the LLM output directly to React components.

---

## Features

- 📄 **PDF Upload** — Drop in your resume as a PDF; text is extracted automatically
- 🤖 **AI Analysis** — Powered by Groq's LLM with real-time streaming output
- 📊 **Structured Feedback** — Scores, gap analysis, and tailored recommendations
- ⚙️ **API Key Management** — Store your Groq API key securely via the Settings panel

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| UI        | React 19, Tailwind CSS v4, A2UI   |
| Desktop   | Electron 41                       |
| AI        | LangChain + Groq (streaming)      |
| PDF       | pdf-parse                         |
| Bundler   | Vite                              |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com/)

### Install & Run

```bash
npm install
npm run electron:dev
```

### Build

```bash
# Windows
npm run electron:build:win

# macOS
npm run electron:build:mac
```

## Configuration

On first launch, open **Settings** and enter your Groq API key. Alternatively, create a `.env` file in the project root:

```
GROQ_API_KEY=your_key_here
```

## Usage

1. Upload your resume (PDF)
2. Paste the job description
3. Click **Analyze** and watch the feedback stream in real time