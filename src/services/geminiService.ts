import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Define strict response schema
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    expertSummary: { type: Type.STRING },
    simpleExplanation: { type: Type.STRING },
    keyContributions: { type: Type.ARRAY, items: { type: Type.STRING } },
    methodologyFlowchart: { type: Type.STRING },
    visualDiagramDescription: { type: Type.STRING },
    videoScript: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scene: { type: Type.STRING },
          visual: { type: Type.STRING },
          narration: { type: Type.STRING }
        }
      }
    },
    pythonCode: { type: Type.STRING },
    flashcards: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { front: { type: Type.STRING }, back: { type: Type.STRING } } }
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER }
        }
      }
    },
    additionalInsights: { type: Type.STRING }
  },
  required: [
    "expertSummary",
    "simpleExplanation",
    "keyContributions",
    "methodologyFlowchart",
    "visualDiagramDescription",
    "videoScript",
    "pythonCode",
    "flashcards",
    "quiz",
    "additionalInsights"
  ]
};

// MAIN FUNCTION
export const analyzePaper = async (
  fileData: { base64: string; mimeType: string } | null,
  textInput: string
): Promise<AnalysisResult> => {

  // Correct environment variable for Vercel + Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key missing. Set VITE_GEMINI_API_KEY in Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build parts for Gemini
  const parts: any[] = [];

  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.base64,
        mimeType: fileData.mimeType
      }
    });
  }

  parts.push({
    text: `
      You are ResearchSensei, an AI that turns research papers into learning modules.

      ${textInput ? `Extra context:\n${textInput}` : ""}

      Extract:
      - Expert Summary
      - Beginner Explanation
      - Key Contributions
      - Valid Mermaid "graph TD" flowchart (use NodeA["text"] format)
      - Visual Diagram Description
      - Video Script
      - Python Code
      - Flashcards
      - Quiz
      - Additional Insights

      Respond ONLY in JSON matching the response schema.
    `
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: parts
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction:
          "You are an expert academic researcher. All Mermaid nodes must use quotes around text: NodeA[\"Description\"]"
      }
    });

    const resultText = response.text();
    if (!resultText) throw new Error("Empty response from Gemini.");

    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to process paper. Please upload a valid PDF or image.");
  }
};


