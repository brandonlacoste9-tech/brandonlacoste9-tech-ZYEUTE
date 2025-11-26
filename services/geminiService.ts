import { GoogleGenAI } from "@google/genai";

// Helper to safely get the API Key
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ VITE_GEMINI_API_KEY not found in environment variables');
    return '';
  }
  
  return apiKey;
};

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your environment.');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

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

/**
 * Generate a Quebec-style caption for an image using Gemini AI
 */
export async function generateCaption(file: File): Promise<string> {
  try {
    const aiClient = getAIClient();
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: `Tu es "Ti-Guy", un assistant IA drôle et authentique pour Zyeuté, LE réseau social québécois.
          
TÂCHE: Écris une légende courte et virale style Instagram/TikTok basée sur cette image.

RÈGLES IMPORTANTES:
1. Utilise du joual québécois naturel: "capoté", "frette", "tiguidou", "jaser", "malade", "le gros"
2. Ajoute 2-3 hashtags pertinents (#Montréal, #Québec, #Zyeuté, etc.)
3. Maximum 280 caractères
4. Sois énergique, drôle, et relatable pour les jeunes Québécois
5. Parle comme un vrai Québécois, pas comme un Français!

IMPORTANT: Réponds UNIQUEMENT avec la légende, sans guillemets ni préfixes.` }
        ]
      }
    });

    const caption = response.text?.trim() || "Wow! 📸 #Zyeuté";
    return caption.replace(/^["']|["']$/g, ''); // Remove quotes if present
  } catch (e: any) {
    console.error("❌ Gemini Caption Error:", e);
    if (e?.message?.includes('API key')) {
      throw new Error('Configuration Gemini manquante. Vérifie ton .env.local');
    }
    return "Tiguidou! 🔥 #Zyeuté #Québec";
  }
}

/**
 * Generate Quebec-relevant hashtags for an image
 */
export async function generateHashtags(file: File): Promise<string[]> {
  try {
    const aiClient = getAIClient();
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: `Analyse cette image et génère 5-7 hashtags pertinents pour une audience québécoise.

CONTEXTE: Zyeuté est un réseau social québécois. Les hashtags populaires incluent:
#Montréal #Québec #QC #Zyeuté #514 #438 #Poutine #Hiver #STM #Frette #Construction #CôneOrange

RÈGLES:
1. Hashtags en français ou franglais (pas anglais pur)
2. Mix de localisations (#Montréal) et thèmes (#Hiver)
3. Retourne UNIQUEMENT les hashtags, séparés par des espaces
4. Format: #hashtag1 #hashtag2 #hashtag3

Exemple: #Montréal #Hiver #Frette #Poutine #QC #Zyeuté` }
        ]
      }
    });

    const text = response.text?.trim() || '';
    const hashtags = text
      .split(/\s+/)
      .filter(tag => tag.startsWith('#'))
      .slice(0, 7);
    
    return hashtags.length > 0 ? hashtags : ['#Québec', '#Zyeuté'];
  } catch (e) {
    console.error("❌ Gemini Hashtag Error:", e);
    return ['#Québec', '#Zyeuté'];
  }
}

/**
 * Edit an image using Gemini's vision capabilities
 * Note: Image generation/editing requires special API access
 */
export async function editImageWithGemini(file: File, prompt: string): Promise<File | null> {
  try {
    const aiClient = getAIClient();
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    // Note: Imagen (image generation) requires special access and different API
    // This is a placeholder for future implementation
    console.warn('⚠️ Image editing feature requires Imagen API access');
    
    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: `${prompt}\n\nNote: Describe the changes needed for this image in detail.` }
        ]
      }
    });

    // Check if response contains generated image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Result = `data:image/png;base64,${part.inlineData.data}`;
        const blob = await base64ToBlob(base64Result);
        return new File([blob], "edited_image.png", { type: "image/png" });
      }
    }
    
    // No image generated - this feature may not be available yet
    throw new Error('Image editing not available. Describes changes instead.');
  } catch (e: any) {
    console.error("❌ Gemini Image Edit Error:", e);
    throw new Error('La modification d\'image n\'est pas encore disponible.');
  }
}

/**
 * Analyze an image and provide a description
 */
export async function analyzeImage(file: File): Promise<string> {
  try {
    const aiClient = getAIClient();
    const base64Data = await fileToBase64(file);
    const mimeType = file.type;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: 'Décris cette image en français de manière concise et engageante (2-3 phrases maximum).' }
        ]
      }
    });

    return response.text?.trim() || 'Image analysée';
  } catch (e) {
    console.error("❌ Gemini Analysis Error:", e);
    return 'Impossible d\'analyser l\'image';
  }
}
