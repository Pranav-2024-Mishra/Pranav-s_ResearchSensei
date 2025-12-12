import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Define the response schema strictly to ensure UI consistency
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    expertSummary: { type: Type.STRING, description: "High-level summary for experts" },
    simpleExplanation: { type: Type.STRING, description: "Beginner-friendly explanation using analogies" },
    keyContributions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of key contributions"
    },
    methodologyFlowchart: { 
      type: Type.STRING, 
      description: "Mermaid.js graph TD syntax. IMPORTANT: Use simple alphanumeric IDs (e.g., NodeA). Wrap ALL labels in double quotes. Example: A[\"Input Data\"] --> B[\"Process (Layer 1)\"]" 
    },
    visualDiagramDescription: { type: Type.STRING, description: "Text description of architecture/pipelines" },
    videoScript: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scene: { type: Type.STRING },
          visual: { type: Type.STRING, description: "Visual direction for the scene" },
          narration: { type: Type.STRING, description: "Spoken text" }
        },
        required: ["scene", "visual", "narration"]
      }
    },
    pythonCode: { type: Type.STRING, description: "Reproducible Python code snippet" },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          front: { type: Type.STRING },
          back: { type: Type.STRING }
        },
        required: ["front", "back"]
      }
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER }
        },
        required: ["question", "options", "correctAnswerIndex"]
      }
    },
    additionalInsights: { type: Type.STRING, description: "Future scope or limitations" }
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

export const analyzePaper = async (
  fileData: { base64: string; mimeType: string } | null,
  textInput: string
): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set it in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];
  
  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.base64,
        mimeType: fileData.mimeType,
      },
    });
  }

  const promptText = `
    You are ResearchSensei, an advanced AI designed to transform research papers into comprehensive learning experiences.
    
    ${textInput ? `Additional User Context/Text: ${textInput}` : ''}

    Analyze the provided content (Paper/Image/Text).
    Perform the following tasks and return the result strictly in JSON format matching the schema provided:
    
    1. **Expert Summary**: High-level academic summary.
    2. **Simple Explanation**: Explain it like I'm 15. Use analogies.
    3. **Key Contributions**: Bullet points.
    4. **Flowchart**: Generate VALID Mermaid.js 'graph TD' syntax showing the methodology.
       - Use strictly alphanumeric node IDs (e.g., NodeA, NodeB) with NO spaces or special characters.
       - IMPORTANT: Wrap ALL node labels in double quotes inside the square brackets to handle special characters safely.
       - Example: NodeA["Input Data (Raw)"] --> NodeB["Processing Step"]
    5. **Visual Description**: Describe other necessary diagrams.
    6. **Video Script**: A YouTube-style script with visual cues.
    7. **Python Code**: Pseudo-code or actual code to demonstrate the core concept/algorithm (if applicable).
    8. **Flashcards**: 10 key concepts.
    9. **Quiz**: 5 multiple choice questions.
    10. **Insights**: Future scope/limitations.

    Ensure the Mermaid syntax is clean and runnable.
  `;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert academic researcher and educator. When generating Mermaid diagrams, you MUST wrap all node labels in double quotes to prevent syntax errors.",
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
