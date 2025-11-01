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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {images.map((image, index) => (
        <div key={index} className="group relative overflow-hidden rounded-2xl shadow-2xl bg-base-200 aspect-[9/16] sm:aspect-auto border border-base-300/50 hover:border-brand-primary/50 transition-all duration-500">
          <img
            src={`data:image/png;base64,${image.b64_json}`}
            alt={image.revised_prompt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 left-0 w-full p-6 text-white translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-brand-primary">Revised Prompt</p>
            <p className="text-sm leading-relaxed">{image.revised_prompt}</p>
             <button onClick={() => handleDownload(image)} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-lg border border-white/20">
                <DownloadIcon className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => setZoomImage(image)} className="absolute top-6 left-6 p-3 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-lg border border-white/20">
              <ZoomIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        ))}
      </div>

      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-6 right-6 p-4 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-2xl border border-white/20"
            aria-label="Close zoomed image"
          >
            <CloseIcon className="w-7 h-7 text-white" />
          </button>
          <img
            src={`data:image/png;base64,${zoomImage.b64_json}`}
            alt={zoomImage.revised_prompt}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
          />
        </div>
      )}
    </>
  );
};