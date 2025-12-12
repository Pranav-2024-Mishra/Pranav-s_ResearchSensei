import React, { useState } from 'react';
import { Upload, FileText, Loader2, Sparkles, X, BrainCircuit } from 'lucide-react';
import { analyzePaper } from './services/geminiService';
import AnalysisView from './components/AnalysisView';
import { AnalysisResult, FileData } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔥 FIXED FILE UPLOAD + BASE64 HANDLER
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (!result) {
        setError("Could not read the file.");
        return;
      }

      // Case 1: Standard DataURL format
      if (typeof result === "string" && result.startsWith("data:")) {
        const base64 = result.split(",")[1] || "";

        setFile({
          base64,
          mimeType: selectedFile.type || "application/octet-stream",
          name: selectedFile.name
        });

        setError(null);
        return;
      }

      // Case 2: ArrayBuffer fallback (fixes Vercel inconsistencies)
      if (result instanceof ArrayBuffer) {
        const binary = new Uint8Array(result).reduce(
          (acc, b) => acc + String.fromCharCode(b),
          ""
        );
        const base64 = btoa(binary);

        setFile({
          base64,
          mimeType: selectedFile.type || "application/octet-stream",
          name: selectedFile.name
        });

        setError(null);
        return;
      }

      setError("Unsupported file format.");
    };

    reader.onerror = () => {
      setError("Failed to read file. Try uploading again.");
    };

    reader.readAsDataURL(selectedFile);
  };

  // Analyze Paper
  const handleAnalyze = async () => {
    if (!file && !textInput.trim()) {
      setError("Please upload a file or paste text to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzePaper(file, textInput);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the paper. Please try again or check the file format.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setTextInput('');
    setResult(null);
    setError(null);
  };

  // Render Analysis Screen
  if (result) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8">
        <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BrainCircuit size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              ResearchSensei
            </h1>
          </div>
          <button 
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700"
          >
            <Upload size={18} />
            <span>Analyze New Paper</span>
          </button>
        </header>
        
        <main className="max-w-7xl mx-auto">
          <AnalysisView data={result} />
        </main>
      </div>
    );
  }

  // Render Initial Screen
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl z-10">

        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20">
            <BrainCircuit size={48} className="text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ResearchSensei
          </h1>
          <p className="text-lg text-slate-400">
            Turn complex papers into simple explanations, diagrams, and quizzes instantly.
          </p>
        </div>

        {/* Upload Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-slate-700/50">
          
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Upload Research Paper (PDF/Image)
            </label>

            <div className="relative group">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <div className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center ${
                file 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-slate-600 bg-slate-800/50 group-hover:border-indigo-400 group-hover:bg-slate-800'
              }`}>
                
                {file ? (
                  <>
                    <FileText className="text-green-400 mb-3" size={32} />
                    <p className="text-green-300 font-medium">{file.name}</p>
                    <p className="text-xs text-green-500/70 mt-1">Ready to analyze</p>
                  </>
                ) : (
                  <>
                    <Upload className="text-indigo-400 mb-3" size={32} />
                    <p className="text-slate-300 font-medium">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF, PNG, JPG</p>
                  </>
                )}

              </div>

              {file && (
                <button 
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="absolute top-2 right-2 p-1 bg-slate-900 rounded-full text-slate-400 hover:text-white z-20"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Or paste text</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          {/* Text Input */}
          <div className="mb-8 mt-2">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste raw text or additional context here..."
              className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-slate-600 resize-none transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!file && !textInput)}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" />
                Analyzing Paper...
              </>
            ) : (
              <>
                <Sparkles />
                Generate Learning Package
              </>
            )}
          </button>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">Powered by Gemini 2.5 Flash • Multimodal Analysis</p>
        </div>

      </div>
    </div>
  );
};

export default App;

