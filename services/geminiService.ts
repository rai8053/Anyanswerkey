import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiModel } from "../types";

// Initialize the Gemini Client
// API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an image or document (base64) and answers questions found within it.
 */
export const analyzeImage = async (dataUrl: string): Promise<string> => {
  try {
    // Default to jpeg if parsing fails
    let mimeType = 'image/jpeg';
    let base64Data = dataUrl;

    // Check if the string is a Data URL (e.g., data:image/png;base64,...)
    if (dataUrl.includes('data:') && dataUrl.includes(';base64,')) {
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    } else if (dataUrl.includes(',')) {
      // Fallback for simple comma separation
      const parts = dataUrl.split(',');
      base64Data = parts[1];
      // Try to extract mime from the header part
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GeminiModel.FLASH,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Analyze this image/document. Identify any questions present (math, science, or general text). For each question found, provide the question text followed by a clear, step-by-step solution and the final answer. Format the output with clear headings or bullet points."
          }
        ]
      }
    });

    return response.text || "I couldn't generate a text response for this content.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the content. Please try again.");
  }
};

/**
 * Sends a follow-up text message to the chat (optional feature for future expansion)
 */
export const sendTextMessage = async (history: {role: string, parts: any[]}[], newMessage: string): Promise<string> => {
  try {
    // Note: implementing full chat history with images requires managing the history array carefully.
    // For this simple stateless version, we just ping the model with text.
    // Real implementation would pass `contents` array with history.
    const response = await ai.models.generateContent({
      model: GeminiModel.FLASH,
      contents: newMessage
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return "Sorry, I encountered an error.";
  }
};