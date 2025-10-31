import React from 'react';
import type { GeneratedImage } from '../types';
import { DownloadIcon, ZoomIcon, CloseIcon } from './Icons';

interface ImageGridProps {
  images: GeneratedImage[];
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  const [zoomImage, setZoomImage] = React.useState<GeneratedImage | null>(null);

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.b64_json}`;
    // Create a safe filename from the prompt
    const safePrompt = image.revised_prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safePrompt.substring(0, 30)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {images.map((image, index) => (
        <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg bg-base-200 aspect-[9/16] sm:aspect-auto">
          <img
            src={`data:image/png;base64,${image.b64_json}`}
            alt={image.revised_prompt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 w-full p-4 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1">Revised Prompt</p>
            <p className="text-sm leading-tight">{image.revised_prompt}</p>
             <button onClick={() => handleDownload(image)} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm transition">
                <DownloadIcon className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setZoomImage(image)} className="absolute top-4 left-4 p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm transition">
              <ZoomIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        ))}
      </div>

      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm transition"
            aria-label="Close zoomed image"
          >
            <CloseIcon className="w-6 h-6 text-white" />
          </button>
          <img
            src={`data:image/png;base64,${zoomImage.b64_json}`}
            alt={zoomImage.revised_prompt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      )}
    </>
  );
};