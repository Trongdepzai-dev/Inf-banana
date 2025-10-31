import React, { useState, useCallback, useEffect } from 'react';
import { generateImagesFromText, editImages, enhancePrompt } from './services/apiService';
import type { GenerationMode, ImageSize, GeneratedImage, UploadedImage, ImageQuality, ImageStyle } from './types';
import { ImageUploader } from './components/ImageUploader';
import { SettingsPanel } from './components/SettingsPanel';
import { ImageGrid } from './components/ImageGrid';
import { ErrorNotification } from './components/ErrorNotification';
import { LogoIcon, SparklesIcon, PhotoIcon, GeneratorIcon, MagicWandIcon } from './components/Icons';

const App: React.FC = () => {
  const [mode, setMode] = useState<GenerationMode>('text-to-image');
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [imageCount, setImageCount] = useState<number>(2);
  const [imageSize, setImageSize] = useState<ImageSize>('1024x1792');
  const [quality, setQuality] = useState<ImageQuality>('standard');
  const [style, setStyle] = useState<ImageStyle>('none');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    if (imageCount > 4) {
      setImageCount(4);
    }
  }, [imageCount]);


  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Vui lòng nhập mô tả ảnh.');
      return;
    }
    if (mode === 'image-to-image' && uploadedImages.length === 0) {
      setError('Vui lòng tải lên ít nhất một ảnh để chỉnh sửa.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setGenerationProgress({ current: 0, total: imageCount });

    try {
      const MAX_IMAGES_PER_REQUEST = 4;
      const totalImagesToGenerate = imageCount;
      const allGeneratedImages: GeneratedImage[] = [];

      // Create a list of batch sizes to process
      const batches: number[] = [];
      let remaining = totalImagesToGenerate;
      while (remaining > 0) {
        const batchSize = Math.min(MAX_IMAGES_PER_REQUEST, remaining);
        batches.push(batchSize);
        remaining -= batchSize;
      }

      let completedCount = 0;
      // Process each batch sequentially
      for (const [index, batchSize] of batches.entries()) {
        const params = {
          prompt,
          negativePrompt,
          n: batchSize,
          size: imageSize,
          quality,
          style,
        };
        
        let response;
        if (mode === 'text-to-image') {
          response = await generateImagesFromText(params);
        } else {
          response = await editImages({ ...params, images: uploadedImages });
        }
        
        allGeneratedImages.push(...response.data);
        setGeneratedImages([...allGeneratedImages]); // Update grid as images arrive
        
        completedCount += batchSize;
        setGenerationProgress({ current: completedCount, total: totalImagesToGenerate });
        
        // Add a 5-second delay between batches, but not after the last one
        if (index < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('Lỗi Mạng: Không thể kết nối đến API. Điều này có thể do sự cố mạng, chính sách CORS trên máy chủ hoặc điểm cuối API đang ngoại tuyến. Vui lòng kiểm tra kết nối của bạn và thử lại.');
      } else if (err instanceof Error && err.message.includes('status 500')) {
        setError('Server quá tải. Vui lòng thử lại sau ít phút.');
      } else {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setIsLoading(false);
      setGenerationProgress(null);
    }
  }, [prompt, negativePrompt, imageCount, imageSize, mode, uploadedImages, quality, style]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt || isEnhancing) return;

    setIsEnhancing(true);
    setError(null);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (err) {
       if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
         setError('Lỗi Mạng: Không thể kết nối đến API nâng cao. Vui lòng kiểm tra kết nối của bạn.');
      } else {
        setError(err instanceof Error ? err.message : 'Không thể nâng cao mô tả.');
      }
    } finally {
      setIsEnhancing(false);
    }
  }, [prompt, isEnhancing]);
  
  const handleRetry = () => {
    setError(null);
    handleGenerate();
  }

  const isGenerateDisabled = isLoading || isEnhancing || !prompt || (mode === 'image-to-image' && uploadedImages.length === 0);

  return (
    <div className="min-h-screen bg-base-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-2xl flex flex-col items-center justify-center mb-8 space-y-4">
        <LogoIcon className="h-12 w-12 text-brand-primary" />
        <div className="w-full h-2.5 bg-base-300 rounded-full">
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2.5 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-grow">
        <div className="bg-base-200/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl shadow-black/20 border border-base-300">
          
          {/* Mode Switcher V2 */}
          <div className="relative flex bg-base-300 rounded-full p-1 mb-6">
              <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-transform duration-300 ease-out" style={{ transform: mode === 'text-to-image' ? 'translateX(4px)' : 'translateX(calc(100% + 4px))' }}/>
              <button
                onClick={() => setMode('text-to-image')}
                className="relative z-10 w-1/2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <SparklesIcon className="h-5 w-5" /> Text to Image
              </button>
              <button
                onClick={() => setMode('image-to-image')}
                className="relative z-10 w-1/2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <PhotoIcon className="h-5 w-5" /> Image to Image
              </button>
            </div>

          {/* Prompt Input */}
          <div className="relative mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Một chú chó German Shepherd oai vệ, mạnh mẽ với vẻ mặt lanh lợi, thông minh..."
              className="prompt-textarea w-full h-28 p-4 pr-32 bg-base-100 border-2 border-base-300 rounded-lg focus:ring-0 focus:outline-none transition-all duration-300 resize-none text-content-100 placeholder:text-content-200"
            />
             <button
              onClick={handleEnhancePrompt}
              disabled={!prompt || isEnhancing || isLoading}
              className="absolute bottom-3 right-3 flex items-center gap-2 text-sm bg-base-300 hover:bg-gradient-to-r from-brand-primary to-brand-secondary text-content-200 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enhance Prompt"
            >
              {isEnhancing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang nâng cao...</span>
                </>
              ) : (
                <>
                  <MagicWandIcon className="h-4 w-4" />
                  <span>Nâng cao</span>
                </>
              )}
            </button>
          </div>

          {/* Negative Prompt Input */}
          <div className="relative mb-4">
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Mô tả phủ định (ví dụ: mờ, chữ, watermark, thừa ngón tay)"
              className="prompt-textarea w-full h-20 p-4 bg-base-100 border-2 border-base-300 rounded-lg focus:ring-0 focus:outline-none transition-all duration-300 resize-none text-content-100 placeholder:text-content-200"
            />
          </div>

          {mode === 'image-to-image' && (
            <div className="mb-4">
              <ImageUploader onImagesUploaded={setUploadedImages} />
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <SettingsPanel
              imageCount={imageCount}
              onImageCountChange={setImageCount}
              imageSize={imageSize}
              onImageSizeChange={setImageSize}
              quality={quality}
              onQualityChange={setQuality}
              style={style}
              onStyleChange={setStyle}
            />
          </div>
          
          {/* Generate Button V2 */}
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className="generate-button-glow w-full h-16 flex items-center justify-center gap-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-lg py-3 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              {isLoading ? (
                <div className="generative-loader">
                  <span /><span /><span /><span /><span />
                </div>
              ) : (
                <>
                  <GeneratorIcon className="h-7 w-7" />
                  <span>Tạo ảnh</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <ErrorNotification 
            message={error} 
            onRetry={handleRetry} 
            onClose={() => setError(null)} 
          />
        )}

        <div className="mt-10">
            {isLoading && (
                <div className="text-center text-content-200 space-y-4">
                    {generationProgress && generationProgress.total > 1 ? (
                      <>
                        <p>Đang tạo ảnh {generationProgress.current} trên {generationProgress.total}...</p>
                        <div className="w-full bg-base-300 rounded-full h-2.5">
                          <div 
                            className="bg-brand-primary h-2.5 rounded-full transition-all duration-300" 
                            style={{width: `${(generationProgress.current / generationProgress.total) * 100}%`}}>
                          </div>
                        </div>
                      </>
                    ) : (
                       <p className="animate-pulse">Đang tạo ra kiệt tác của bạn... việc này có thể mất một chút thời gian.</p>
                    )}
                </div>
            )}
            {generatedImages.length > 0 && (
                <ImageGrid images={generatedImages} />
            )}
            {!isLoading && !generatedImages.length && !error && (
                 <div className="text-center text-content-200 pt-12">
                    <div className="inline-block p-5 bg-base-200/50 rounded-full border border-base-300">
                      <GeneratorIcon className="w-12 h-12 text-brand-secondary opacity-50" />
                    </div>
                    <p className="text-xl mt-4 font-semibold">Tác phẩm của bạn sẽ xuất hiện ở đây</p>
                    <p className="text-sm text-content-200">Hãy để trí tưởng tượng của bạn bay xa!</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default App;