import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
          { text: "Write a short, engaging caption for this social media post in French (use Québec slang/joual if appropriate). Keep it under 20 words. Do not include hashtags. Tone: Casual, fun, authentic." }
        ]
      }
    });

    return response.text || "Wow! 📸";
  } catch (e) {
    console.error("Gemini Caption Error", e);
    return "Wow! 📸 (AI Unavailable)";
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