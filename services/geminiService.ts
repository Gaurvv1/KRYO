import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MemeResponse, MemeLength, ColorMode } from "../types";
import { SYSTEM_PROMPT, VISION_EXTRACTOR_PROMPT, constructUserPrompt } from "./prompts";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Analyze image to get labels.
 */
export const extractImageLabels = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = getClient();
    
    // We use a lighter model for simple label extraction
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: VISION_EXTRACTOR_PROMPT },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      }
    });

    const text = response.text;
    return text || "no_clear_labels";
  } catch (error) {
    console.error("Error extracting labels:", error);
    return "no_clear_labels";
  }
};

export interface ColorSettings {
  mode: ColorMode;
  primary: string;
  secondary: string;
  intensity: number;
  angle: number;
  randomize: boolean;
  regenerateCount: number;
}

export interface MemeGenerationConfig {
  labels: string;
  textContext: string;
  directGenerate: boolean;
  vibe: string;
  imagePresent: boolean;
  memeLength?: MemeLength;
  colorSettings: ColorSettings;
}

/**
 * Step 2: Generate Meme JSON based on configuration.
 */
export const generateMemeContent = async (config: MemeGenerationConfig): Promise<MemeResponse> => {
  const {
    labels,
    textContext,
    directGenerate,
    vibe,
    imagePresent,
    memeLength = MemeLength.Medium,
    colorSettings
  } = config;

  const ai = getClient();
  const userPrompt = constructUserPrompt(
    labels, 
    textContext, 
    directGenerate, 
    vibe, 
    imagePresent, 
    memeLength,
    colorSettings
  );

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      meme_text: { type: Type.STRING, description: "Meme text line." },
      explain_hint: { type: Type.STRING, description: "4-10 words explaining reference." },
      overlay_style: {
        type: Type.OBJECT,
        properties: {
          position: { type: Type.STRING, enum: ["top", "center", "bottom"] },
          font: { type: Type.STRING },
          shadow: { type: Type.BOOLEAN },
          text_color: { type: Type.STRING, description: "Hex color code" },
          background_gradient: {
            type: Type.OBJECT,
            properties: {
              from: { type: Type.STRING },
              to: { type: Type.STRING },
              angle: { type: Type.NUMBER }
            },
            required: ["from", "to", "angle"],
            nullable: true
          },
          stroke_width: { type: Type.NUMBER },
          color_hint: { type: Type.STRING },
          contrast_override: { type: Type.BOOLEAN }
        },
        required: ["position", "font", "shadow", "text_color", "stroke_width"]
      },
      hashtags: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      safe_alternative: { type: Type.STRING }
    },
    required: ["explain_hint", "overlay_style"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: vibe === "chaotic" ? 0.8 : 0.6,
      },
      contents: userPrompt
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");

    return JSON.parse(jsonText) as MemeResponse;
  } catch (error) {
    console.error("Error generating meme:", error);
    throw error;
  }
};
