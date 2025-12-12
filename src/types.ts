export interface VideoScene {
  scene: string;
  visual: string;
  narration: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface AnalysisResult {
  expertSummary: string;
  simpleExplanation: string;
  keyContributions: string[];
  methodologyFlowchart: string; // Mermaid syntax
  visualDiagramDescription: string;
  videoScript: VideoScene[];
  pythonCode: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  additionalInsights: string;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}
