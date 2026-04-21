import React, { useState, useRef, useEffect } from 'react';
import { catalog } from './a2ui/catalog';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Plus, AlertCircle, Loader2, Settings, Key, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import brainIcon from './assets/brain-waves.png';

const LOADING_MESSAGES = [
  "Connecting to the AI agent...",
  "Reading between the bullet points...",
  "Hmm, that's an interesting resume 🤔",
  "Synthesizing insights from the void...",
  "Running resume through the vibe check™",
  "Cross-referencing skills at light speed...",
  "Consulting the ancient scrolls of best practices...",
  "Teaching the AI what 'fast learner' actually means...",
  "Decoding jargon into plain English...",
  "Almost there — the AI is just fixing its tie 👔",
];

function App() {
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [a2uiMessages, setA2uiMessages] = useState([]);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);
  const [msgVisible, setMsgVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  // Setup Electron listeners once
  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanupChunk = window.electronAPI.onAnalysisChunk((msg) => {
      setA2uiMessages(prev => {
        // Prevent duplicate createSurface messages which reset the state
        if (msg.createSurface) {
          const alreadyCreated = prev.some(m => m.createSurface && m.createSurface.surfaceId === msg.createSurface.surfaceId);
          if (alreadyCreated) return prev;
        }
        return [...prev, msg];
      });
    });

    const cleanupEnd = window.electronAPI.onAnalysisEnd(() => {
      setLoading(false);
    });

    const cleanupError = window.electronAPI.onAnalysisError((err) => {
      setError(err);
      setLoading(false);
    });

    // Load API Key
    window.electronAPI.getApiKey().then(key => {
      setApiKey(key);
    });

    return () => {
      if (typeof cleanupChunk === 'function') cleanupChunk();
      if (typeof cleanupEnd === 'function') cleanupEnd();
      if (typeof cleanupError === 'function') cleanupError();
    };
  }, []);

  useEffect(() => {
    if (reportRef.current && a2uiMessages.length > 0) {
      reportRef.current.scrollTop = reportRef.current.scrollHeight;
    }
  }, [a2uiMessages]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
        setMsgVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!resume || !jd) return;

    setLoading(true);
    setError(null);
    setA2uiMessages([]);

    if (window.electronAPI) {
      window.electronAPI.analyzeResume(resume, jd);
    } else {
      setError("Electron API not found. Are you running in a browser?");
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileLoading(true);
    setError(null);

    try {
      if (window.electronAPI) {
        // Read file as ArrayBuffer for reliable transfer to Main process
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const arrayBuffer = reader.result;
            const result = await window.electronAPI.extractPdfText(arrayBuffer);
            setResume(result.text);
            setFileLoading(false);
          } catch (err) {
            setError(err.message);
            setFileLoading(false);
          }
        };
        reader.onerror = () => {
          setError("Failed to read local file.");
          setFileLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        throw new Error("PDF processing requires the Desktop App. Please run via Electron.");
      }
    } catch (err) {
      setError(err.message);
      setFileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Settings Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed top-8 right-8 z-50 rounded-full bg-secondary/50 backdrop-blur-md border border-border"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Settings className="w-5 h-5" />
      </Button>

      {/* FAB */}
      {a2uiMessages.length > 0 && (
        <Button 
          className="fixed top-8 left-8 z-50 rounded-full shadow-2xl shadow-primary/20 gap-2 h-12 px-6"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          <span>New Analysis</span>
        </Button>
      )}

      {/* Setup Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-width-[800px] bg-card border-border max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight">Setup Analysis</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload a resume and the job description to generate AI insights.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 pt-2 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Candidate Resume</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileUpload} 
                  id="resume-upload"
                  className="hidden"
                />
                <label 
                  htmlFor="resume-upload" 
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                >
                  {fileLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  ) : (
                    <FileText className={`w-8 h-8 mb-2 ${resume ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className="text-sm font-medium">
                    {fileLoading ? 'Extracting text...' : (resume ? '✓ Resume Loaded' : 'Upload PDF Resume')}
                  </span>
                </label>
              </div>
              <Textarea 
                placeholder="Or paste full resume text here..." 
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className="min-h-[120px] bg-secondary/20"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Job Description</label>
              <Textarea 
                placeholder="Paste job description here..." 
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="min-h-[150px] bg-secondary/20"
              />
            </div>

            <Button 
              className="w-full h-12 text-md font-semibold" 
              onClick={() => {
                handleAnalyze();
                setIsModalOpen(false);
              }}
              disabled={loading || !resume || !jd}
            >
              {loading ? 'Synthesizing...' : 'Generate Smart Analysis'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              API Settings
            </DialogTitle>
            <DialogDescription>
              Enter your Groq API Key to enable resume analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Groq API Key</label>
              <div className="relative">
                <Input 
                  type="password" 
                  placeholder="gsk_..." 
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setKeySaved(false);
                  }}
                  className="bg-secondary/20 h-11 pr-10"
                />
                {keySaved && (
                  <Check className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                Your key is stored locally on this machine and never shared.
              </p>
            </div>
            <Button 
              className="w-full h-11" 
              onClick={async () => {
                setIsSavingKey(true);
                await window.electronAPI.saveApiKey(apiKey);
                setKeySaved(true);
                setTimeout(() => {
                  setIsSavingKey(false);
                  setIsSettingsOpen(false);
                }, 800);
              }}
              disabled={isSavingKey}
            >
              {isSavingKey ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Key'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-8 pt-20">
        {a2uiMessages.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-secondary rounded-3xl flex items-center justify-center mb-8 shadow-xl">
              <FileText className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              Resume Intel
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mb-10 leading-relaxed">
              Unlock deep AI-powered matching, skill gap analysis, and tailored improvements for any candidate.
            </p>
            <Button size="lg" className="h-14 px-10 text-lg rounded-2xl shadow-xl shadow-primary/20" onClick={() => setIsModalOpen(true)}>
              Get Started
            </Button>
          </div>
        )}

        {loading && a2uiMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-fade-in text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
              <img src={brainIcon} className="w-48 h-48 relative z-10 animate-floating" alt="AI Processing" />
            </div>
            <div className="space-y-4 max-w-sm">
              <p className={`text-xl font-medium tracking-tight h-16 transition-all duration-500 overflow-hidden ${msgVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {LOADING_MESSAGES[loadingMsgIdx]}
              </p>
              <div className="flex gap-2 justify-center">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === loadingMsgIdx % 5 ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-8">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsModalOpen(true)}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {a2uiMessages.length > 0 && (
          <div className="space-y-12 pb-24" ref={reportRef}>
            {a2uiMessages.map((msg, i) => {
              if (!msg.updateComponents) return null;
              const { components } = msg.updateComponents;
              return components.map((node) => {
                const Component = catalog[node.type];
                if (!Component) return null;
                return <Component key={`${i}-${node.id}`} node={node} />;
              });
            })}
            
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse pl-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium tracking-tight">AI is crafting more insights...</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
