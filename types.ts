export type GenerationMode = 'text-to-image' | 'image-to-image';

export type ImageSize = '1024x1792' | '1792x1024';

export type ImageQuality = 'standard' | 'hd' | 'ultra';

export type ImageStyle = 'none' | 'photorealistic' | 'anime' | '3d-model' | 'cinematic' | 'digital-art';

// Fix: Add UploadedImage type to hold base64 data and its mime type for the API.
export interface UploadedImage {
  base64: string;
  mimeType: string;
}

export interface TextGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  n: number;
  size: ImageSize;
  quality: ImageQuality;
  style: ImageStyle;
}

export interface ImageEditRequest {
  prompt: string;
  negativePrompt?: string;
  // Fix: Use an array of UploadedImage for image editing.
  images: UploadedImage[];
  n: number;
  size: ImageSize;
  quality: ImageQuality;
  style: ImageStyle;
}

export interface GeneratedImage {
  b64_json: string;
  revised_prompt: string;
}
