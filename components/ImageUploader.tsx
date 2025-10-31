
import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon, TrashIcon } from './Icons';
// Fix: Import UploadedImage type for handling image data with mime types
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
}

const fileToUploadedImage = (file: File): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const [meta, data] = reader.result.split(',');
        const mimeType = meta.match(/:(.*?);/)?.[1];
        if (data && mimeType) {
          resolve({ base64: data, mimeType });
        } else {
          reject(new Error('Failed to parse file data URL.'));
        }
      } else {
        reject(new Error('Failed to read file as Base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUploaded }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPreviews: string[] = [];

    // Fix: Explicitly type `file` to resolve TypeScript error 'unknown' type.
    const filePromises = Array.from(files).map((file: File) => {
      newPreviews.push(URL.createObjectURL(file));
      return fileToUploadedImage(file);
    });

    try {
      const newImages = await Promise.all(filePromises);
      // Fix: Correctly append new images to the list instead of replacing.
      const allImages = [...uploadedImages, ...newImages];
      setUploadedImages(allImages);
      onImagesUploaded(allImages);
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      console.error("Error converting files to Base64:", error);
    } finally {
        // Clear file input to allow re-uploading the same file
        if (event.target) {
            event.target.value = '';
        }
    }
  }, [onImagesUploaded, uploadedImages]);

  const removeImage = (index: number) => {
      // Fix: Prevent memory leaks by revoking the object URL.
      URL.revokeObjectURL(previews[index]);
      
      // Fix: Correctly remove a single image instead of clearing all images.
      const newPreviews = previews.filter((_, i) => i !== index);
      const newUploadedImages = uploadedImages.filter((_, i) => i !== index);
      
      setPreviews(newPreviews);
      setUploadedImages(newUploadedImages);
      onImagesUploaded(newUploadedImages);
      
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) input.value = '';
  };

  // Fix: Add effect to clean up object URLs on unmount to prevent memory leaks.
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);


  return (
    <div>
      <label htmlFor="file-upload" className="relative flex justify-center w-full h-32 px-4 transition bg-base-100 border-2 border-base-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-brand-primary focus:outline-none">
        <span className="flex items-center space-x-2">
          <UploadIcon className="w-6 h-6 text-content-200" />
          <span className="font-medium text-content-200">
            Drop images to attach, or <span className="text-brand-primary underline">browse</span>
          </span>
        </span>
        <input id="file-upload" type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
      </label>
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((src, index) => (
            <div key={index} className="relative group">
              <img src={src} alt={`Preview ${index + 1}`} className="object-cover w-full h-32 rounded-lg" />
              <button onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
