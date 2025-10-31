import { GoogleGenAI } from '@google/genai';
import type { TextGenerationRequest, ImageEditRequest, GeneratedImage, UploadedImage, ImageStyle } from '../types';

// The prompt enhancement feature remains, using the Gemini API as it's a separate functionality.
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const API_BASE_URL = 'https://api.whomeai.com/v1';
const DEMO_API_KEY = 'sk-demo';

export const enhancePrompt = async (prompt: string): Promise<string> => {
  if (!prompt) {
    return '';
  }
  const model = 'gemini-2.5-flash';
  try {
    const response = await genAI.models.generateContent({
      model,
      contents: `Expand this into a vivid, detailed prompt for an AI image generator: "${prompt}"`,
      config: {
        systemInstruction: "You are a creative assistant for an AI image generator. Your task is to take a user's simple prompt and expand it into a rich, vivid, and detailed description focusing on visual details, lighting, composition, and artistic style. The output must be only the enhanced prompt, without any conversational text, introductions, or explanations.",
        temperature: 0.8,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw new Error("Failed to get an enhancement from the AI. Please try again.");
  }
};

const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    return response.json();
};

const createFinalPrompt = (prompt: string, style: ImageStyle): string => {
  if (style && style !== 'none') {
    const styleText = style.replace(/-/g, ' ');
    // Append the style description to the prompt
    return `${prompt}, ${styleText} style`;
  }
  return prompt;
};


export const generateImagesFromText = async (params: TextGenerationRequest): Promise<{ data: GeneratedImage[] }> => {
    const finalPrompt = createFinalPrompt(params.prompt, params.style);
    
    const body: any = {
        model: 'nano-banana',
        prompt: finalPrompt,
        n: params.n,
        size: params.size,
        response_format: 'b64_json',
    };
    
    // Note: The 'quality' parameter is included for future API versions,
    // but is not currently supported by the 'whomeai.com' API.
    // if (params.quality) {
    //   body.quality = params.quality;
    // }

    if (params.negativePrompt) {
        body.negative_prompt = params.negativePrompt;
    }

    const response = await fetch(`${API_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEMO_API_KEY}`,
        },
        body: JSON.stringify(body),
    });
    
    return handleApiResponse(response);
};

export const editImages = async (params: ImageEditRequest): Promise<{ data: GeneratedImage[] }> => {
    const finalPrompt = createFinalPrompt(params.prompt, params.style);
    const imageBase64Strings = params.images.map((image: UploadedImage) => image.base64);

    const body: any = {
        model: 'nano-banana-r2i',
        prompt: finalPrompt,
        images: imageBase64Strings,
        n: params.n,
        size: params.size,
        response_format: 'b64_json',
    };
    
    // Note: The 'quality' parameter is included for future API versions,
    // but is not currently supported by the 'whomeai.com' API.
    // if (params.quality) {
    //   body.quality = params.quality;
    // }

    if (params.negativePrompt) {
        body.negative_prompt = params.negativePrompt;
    }

    const response = await fetch(`${API_BASE_URL}/images/image-edit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEMO_API_KEY}`,
        },
        body: JSON.stringify(body),
    });

    return handleApiResponse(response);
};
