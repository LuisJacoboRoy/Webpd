
import { GoogleGenAI } from "@google/genai";

// Fix: Initialized GoogleGenAI with process.env.API_KEY directly as per library standards
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStartupVision = async (startupTheme: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, inspiring vision statement and a catchy motto for a startup focused on: ${startupTheme}. 
      Format as JSON: { "vision": "...", "motto": "..." }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      vision: "Empowering global innovation through seamless digital integration.",
      motto: "The future, delivered today."
    };
  }
};
