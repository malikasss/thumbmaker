import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Ensure API Key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

const TEMPLATE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    critique: { type: Type.STRING, description: "A brief professional creative director critique of the uploaded image and topic." },
    backgroundSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 alternative background descriptions (e.g., 'Dark gradient', 'Studio grid')."
    },
    templates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          headline: { type: Type.STRING, description: "Short, punchy headline (3-6 words)." },
          highlightWord: { type: Type.STRING, description: "The single most emotional word to highlight." },
          layoutDescription: { type: Type.STRING },
          colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
          psychology: { type: Type.STRING, description: "Why this works (CTR principles)." },
          graphicElements: { type: Type.ARRAY, items: { type: Type.STRING } },
          bestUseCase: { type: Type.STRING },
          layoutType: { type: Type.STRING, enum: ['split', 'full-face', 'minimal', 'grid'] },
          suggestedBackground: { type: Type.STRING, description: "Prompt to generate the background image." },
        },
        required: ["id", "name", "headline", "highlightWord", "colorPalette", "psychology", "layoutType", "suggestedBackground"]
      }
    }
  },
  required: ["critique", "backgroundSuggestions", "templates"]
};

export const analyzeImageAndGetTemplates = async (
  imageBase64: string,
  topic: string
): Promise<AnalysisResult> => {
  try {
    const prompt = `
      You are a Professional Thumbnail Design Engine and Creative Director.
      
      User Topic: "${topic}"
      
      Analyze the provided image (user's face/subject) and the topic.
      Generate 4 high-CTR YouTube thumbnail templates based on marketing psychology.
      
      Follow these rules:
      1. Headlines must be short (3-6 words), engaging, and click-worthy.
      2. Highlight ONE emotional keyword per template.
      3. Colors should be business-style: Black, White, Blue, Cyan, with high contrast accents.
      4. Templates should vary in style:
         - A: Bold Headline + Face
         - B: Split Screen (Before/After vibe)
         - C: Minimalist/Podcast
         - D: High Tech/Grid
      
      Provide a critique of the image and how to best use it.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: TEMPLATE_SCHEMA,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateBackgroundImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", // Using flash-image as requested for defaults
      contents: `Generate a high-quality background texture for a YouTube thumbnail. Style: ${prompt}. No text. Abstract, high contrast, professional. Aspect ratio 16:9.`,
      config: {
        // imageConfig: { aspectRatio: "16:9" } // Only supported on specific models, defaulting to 1:1 if 16:9 fails or cropping later.
        // gemini-2.5-flash-image generates 1:1 by default.
      }
    });

    // Extract image
    // Note: 2.5 flash image returns base64 in inlineData
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Background generation failed", error);
    // Return a fallback placeholder if gen fails
    return `https://picsum.photos/1280/720?grayscale&blur=2`; 
  }
};
