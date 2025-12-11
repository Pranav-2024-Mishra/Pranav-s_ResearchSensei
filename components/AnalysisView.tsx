import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import Mermaid from './Mermaid';
import { 
  BookOpen, Lightbulb, GitGraph, FileCode, 
  Tv, Layers, Brain, CheckSquare, Sparkles, Copy, Check
} from 'lucide-react';

interface AnalysisViewProps {
  data: AnalysisResult;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [copiedCode, setCopiedCode] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<number[]>(new Array(data.quiz.length).fill(-1));
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.pythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleQuizOption = (qIndex: number, oIndex: number) => {
    if (quizSubmitted) return;
    const newAnswers = [...quizAnswers];
    newAnswers[qIndex] = oIndex;
    setQuizAnswers(newAnswers);
  };

  const calculateScore = () => {
    return quizAnswers.reduce((acc, ans, idx) => 
      ans === data.quiz[idx].correctAnswerIndex ? acc + 1 : acc, 0
    );
  };

  // Flip card state
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                <BookOpen size={20} /> Expert Summary
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg">{data.expertSummary}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl border-l-4 border-l-green-400">
              <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center gap-2">
                <Lightbulb size={20} /> Beginner Explanation
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-line">{data.simpleExplanation}</p>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-purple-300 mb-4">Key Contributions</h3>
              <ul className="space-y-3">
                {data.keyContributions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      
      case 'diagrams':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                <GitGraph size={20} /> Methodology Flowchart
              </h3>
              <div className="overflow-hidden rounded-lg bg-slate-900 border border-slate-700">
                <Mermaid chart={data.methodologyFlowchart} />
              </div>
            </div>
             <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">Additional Architecture Notes</h3>
              <p className="text-slate-300 leading-relaxed">{data.visualDiagramDescription}</p>
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="glass-panel p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-pink-300 flex items-center gap-2">
                  <FileCode size={20} /> Implementation
                </h3>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 rounded-md hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm text-slate-400"
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  {copiedCode ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800 font-mono text-sm text-green-400">
                {data.pythonCode}
              </pre>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-red-300 mb-6 flex items-center gap-2">
                <Tv size={20} /> Video Storyboard & Script
              </h3>
              <div className="space-y-8">
                {data.videoScript.map((scene, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-6 border-b border-slate-700 pb-6 last:border-0">
                    <div className="md:w-1/3 bg-slate-800 rounded-lg p-4 flex flex-col justify-center items-center text-center border border-slate-600">
                      <span className="text-xs font-bold text-slate-500 uppercase mb-2">Visual Scene {idx + 1}</span>
                      <p className="text-slate-200 font-medium italic">{scene.visual}</p>
                    </div>
                    <div className="md:w-2/3">
                      <h4 className="text-sm font-bold text-red-400 uppercase mb-2">Narration</h4>
                      <p className="text-slate-300 leading-relaxed">"{scene.scene}: {scene.narration}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'flashcards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {data.flashcards.map((card, idx) => (
              <div 
                key={idx}
                onClick={() => setFlippedCard(flippedCard === idx ? null : idx)}
                className="cursor-pointer h-64 perspective-1000 group relative"
              >
                 <div className={`relative w-full h-full duration-500 preserve-3d transition-all ${flippedCard === idx ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: flippedCard === idx ? 'rotateY(180deg)' : '' }}>
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden glass-panel rounded-xl p-6 flex flex-col items-center justify-center text-center border-2 border-indigo-500/30 hover:border-indigo-400 transition-colors">
                      <Layers className="text-indigo-400 mb-4" size={32} />
                      <h4 className="text-xl font-bold text-white">{card.front}</h4>
                      <p className="mt-4 text-xs text-slate-400 uppercase tracking-wider">Click to Flip</p>
                    </div>
                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden glass-panel rounded-xl p-6 flex flex-col items-center justify-center text-center bg-indigo-900/40 border-2 border-indigo-400" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                      <p className="text-lg text-slate-200">{card.back}</p>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        );

      case 'quiz':
        return (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-xl flex justify-between items-center">
              <h3 className="text-xl font-semibold text-orange-300 flex items-center gap-2">
                <CheckSquare size={20} /> Knowledge Check
              </h3>
              {quizSubmitted && (
                <span className="text-2xl font-bold text-white">
                  Score: <span className="text-orange-400">{calculateScore()}</span> / {data.quiz.length}
                </span>
              )}
            </div>
            
            {data.quiz.map((q, qIdx) => (
              <div key={qIdx} className="glass-panel p-6 rounded-xl border border-slate-700">
                <p className="text-lg font-medium text-white mb-4">{qIdx + 1}. {q.question}</p>
                <div className="space-y-3">
                  {q.options.map((opt, oIdx) => {
                    let btnClass = "w-full text-left p-4 rounded-lg border transition-all ";
                    
                    if (quizSubmitted) {
                      if (oIdx === q.correctAnswerIndex) {
                         btnClass += "bg-green-900/50 border-green-500 text-green-200";
                      } else if (quizAnswers[qIdx] === oIdx && oIdx !== q.correctAnswerIndex) {
                         btnClass += "bg-red-900/50 border-red-500 text-red-200";
                      } else {
                         btnClass += "bg-slate-800 border-slate-700 text-slate-400 opacity-50";
                      }
                    } else {
                      if (quizAnswers[qIdx] === oIdx) {
                        btnClass += "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20";
                      } else {
                        btnClass += "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500";
                      }
                    }

                    return (
                      <button 
                        key={oIdx}
                        onClick={() => handleQuizOption(qIdx, oIdx)}
                        className={btnClass}
                        disabled={quizSubmitted}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!quizSubmitted && (
              <button 
                onClick={() => setQuizSubmitted(true)}
                disabled={quizAnswers.includes(-1)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit Answers
              </button>
            )}
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-teal-300 mb-4 flex items-center gap-2">
                <Sparkles size={20} /> Future Scope & Limitations
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg">{data.additionalInsights}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'summary', icon: BookOpen, label: 'Summary' },
    { id: 'diagrams', icon: GitGraph, label: 'Diagrams' },
    { id: 'code', icon: FileCode, label: 'Code' },
    { id: 'video', icon: Tv, label: 'Script' },
    { id: 'flashcards', icon: Layers, label: 'Flashcards' },
    { id: 'quiz', icon: CheckSquare, label: 'Quiz' },
    { id: 'insights', icon: Brain, label: 'Insights' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <div className="flex overflow-x-auto pb-4 gap-2 mb-6 border-b border-slate-700 hide-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-10">
        {renderContent()}
      </div>
    </div>
  );
};

export default AnalysisView;
