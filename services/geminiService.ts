import { GoogleGenAI } from "@google/genai";

// Helper to safely get the API Key in any environment (Vite, Process, etc.)
const getApiKey = () => {
  try {
    const meta = import.meta as any;
    if (meta.env && meta.env.VITE_GEMINI_API_KEY) return meta.env.VITE_GEMINI_API_KEY;
    if (meta.env && meta.env.API_KEY) return meta.env.API_KEY;
  } catch (e) {}
  
  try {
    if (typeof process !== "undefined" && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {}
  
  return "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const base64ToBlob = async (base64: string): Promise<Blob> => {
  const response = await fetch(base64);
  return await response.blob();
};

export async function generateCaption(file: File): Promise<string> {
  try {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: `
            You are "Ti-Guy", a funny social media assistant for a Québec app called Zyeuté.
            Task: Write a short, viral Instagram/TikTok caption based on this image.
            Rules:
            1. Use Québec French slang (Joual) appropriately (e.g., "capoté", "le gros", "frette", "tiguidou", "jaser").
            2. Include 2-3 relevant hashtags.
            3. Keep it under 280 characters.
            4. Be energetic and relatable to young Montrealers/Quebecers.
            Output ONLY the caption.
          ` }
        ]
      }
    });

    return response.text || "Wow! 📸 #Zyeuté";
  } catch (e) {
    console.error("Gemini Caption Error", e);
    return "Wow! 📸 (Ti-Guy dort...)";
  }
}

export async function generateHashtags(file: File): Promise<string> {
  try {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: "Analyze this image and generate 5 relevant, trending hashtags for a Quebec audience. Return ONLY the hashtags separated by spaces. Example: #montreal #hiver #poutine" }
        ]
      }
    });

    return response.text || "#quebec #zyeuté";
  } catch (e) {
    console.error("Gemini Hashtag Error", e);
    return "#quebec";
  }
}

export async function editImageWithGemini(file: File, prompt: string): Promise<File | null> {
  try {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt }
        ]
      }
    });

    // Iterate to find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Result = `data:image/png;base64,${part.inlineData.data}`;
        const blob = await base64ToBlob(base64Result);
        return new File([blob], "edited_image.png", { type: "image/png" });
      }
    }
    return null;
  } catch (e) {
    console.error("Gemini Edit Error", e);
    throw e;
  }
}
