import React from 'react';
import type { ImageSize, ImageQuality, ImageStyle } from '../types';
import { LandscapeIcon, PortraitIcon, StarIcon, CameraIcon, AnimeIcon, CubeIcon, FilmIcon, PaintBrushIcon } from './Icons';

interface SettingsPanelProps {
  imageCount: number;
  onImageCountChange: (count: number) => void;
  imageSize: ImageSize;
  onImageSizeChange: (size: ImageSize) => void;
  quality: ImageQuality;
  onQualityChange: (quality: ImageQuality) => void;
  style: ImageStyle;
  onStyleChange: (style: ImageStyle) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  imageCount,
  onImageCountChange,
  imageSize,
  onImageSizeChange,
  quality,
  onQualityChange,
  style,
  onStyleChange,
}) => {

  const qualityOptions: { id: ImageQuality; label: string }[] = [
    { id: 'standard', label: 'Standard' },
    { id: 'hd', label: 'HD' },
    { id: 'ultra', label: 'Ultra' },
  ];
  
  const styleOptions: { id: ImageStyle; label: string; icon: React.ReactNode }[] = [
    { id: 'photorealistic', label: 'Photo', icon: <CameraIcon className="w-5 h-5" /> },
    { id: 'anime', label: 'Anime', icon: <AnimeIcon className="w-5 h-5" /> },
    { id: '3d-model', label: '3D', icon: <CubeIcon className="w-5 h-5" /> },
    { id: 'cinematic', label: 'Cinematic', icon: <FilmIcon className="w-5 h-5" /> },
    { id: 'digital-art', label: 'Art', icon: <PaintBrushIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col gap-5 bg-base-100/60 p-5 rounded-2xl border border-base-300/50 w-full shadow-xl backdrop-blur-sm">
      {/* Top Row: Count and Dimensions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Image Count Slider */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-grow">
          <label htmlFor="image-count-slider" className="text-sm font-medium text-content-200 whitespace-nowrap">Số lượng</label>
          <div className="flex items-center gap-4 w-full sm:w-auto flex-grow">
            <input
              id="image-count-slider"
              type="range"
              min="1"
              max="4"
              step="1"
              value={imageCount}
              onChange={(e) => onImageCountChange(parseInt(e.target.value, 10))}
              className="image-count-slider w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-semibold text-lg text-content-100 w-12 text-center bg-base-100 border border-base-300 rounded-lg py-1">{imageCount}</span>
          </div>
        </div>
        
        <div className="h-px w-full md:h-10 md:w-px bg-base-300"></div>

        {/* Image Size */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <label className="text-sm font-medium text-content-200">Kích thước</label>
          <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onImageSizeChange('1024x1792')} 
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${imageSize === '1024x1792' ? 'border-brand-primary bg-brand-primary/20 shadow-lg scale-105' : 'border-base-300/50 bg-base-100/80 hover:border-brand-primary/50 hover:shadow-md hover:scale-102'}`}
                aria-label="Portrait 1024x1792"
              >
                  <PortraitIcon className="w-5 h-5"/>
                  <span className="text-xs font-mono text-content-200">9:16</span>
              </button>
              <button 
                onClick={() => onImageSizeChange('1792x1024')} 
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${imageSize === '1792x1024' ? 'border-brand-primary bg-brand-primary/20 shadow-lg scale-105' : 'border-base-300/50 bg-base-100/80 hover:border-brand-primary/50 hover:shadow-md hover:scale-102'}`}
                aria-label="Landscape 1792x1024"
              >
                  <LandscapeIcon className="w-5 h-5"/>
                  <span className="text-xs font-mono text-content-200">16:9</span>
              </button>
          </div>
        </div>
      </div>

       <div className="h-px w-full bg-base-300"></div>

        {/* Middle Row: Style */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <label className="text-sm font-medium text-content-200 whitespace-nowrap">Phong cách</label>
          <div className="w-full grid grid-cols-3 sm:grid-cols-5 gap-2">
            {styleOptions.map((option) => (
               <button
                  key={option.id}
                  onClick={() => onStyleChange(style === option.id ? 'none' : option.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 text-sm h-full ${style === option.id ? 'border-brand-primary bg-brand-primary/20 text-content-100 shadow-lg scale-105' : 'border-base-300/50 bg-base-100/80 hover:border-brand-primary/50 text-content-200 hover:shadow-md hover:scale-102'}`}
                >
                  {option.icon}
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
            ))}
          </div>
        </div>

      <div className="h-px w-full bg-base-300"></div>

      {/* Bottom Row: Quality */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <label className="text-sm font-medium text-content-200 whitespace-nowrap">Chất lượng</label>
        <div className="w-full grid grid-cols-3 gap-2">
          {qualityOptions.map((option) => (
             <button
                key={option.id}
                onClick={() => onQualityChange(option.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 text-sm ${quality === option.id ? 'border-brand-secondary bg-brand-secondary/20 shadow-lg scale-105' : 'border-base-300/50 bg-base-100/80 hover:border-brand-secondary/50 hover:shadow-md hover:scale-102'}`}
              >
                <StarIcon fill={quality === option.id} half={option.id === 'hd'} full={option.id === 'ultra'} />
                <span className="font-medium">{option.label}</span>
              </button>
          ))}
        </div>
      </div>
    </div>
  );
};