import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Button } from './Button';

interface ImageUploaderProps {
  currentImage?: string;
  onImageSave: (base64: string) => void;
  onRemove: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImage, onImageSave, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsOpen(true);
        setScale(1);
        setRotate(0);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Default crop full image or aspect ratio
    setCrop(centerAspectCrop(width, height, 16 / 9));
  };

  const handleSave = async () => {
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    
    if (!image || !canvas) {
        if (imgSrc && !completedCrop) {
             // Fallback: Save original if no crop interaction (though crop is auto set)
             onImageSave(imgSrc); 
             setIsOpen(false);
        }
        return;
    }

    const cropToUse = completedCrop || {
        unit: 'px',
        x: 0,
        y: 0,
        width: image.width,
        height: image.height
    };

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Calculate actual pixel dimensions of the crop
    const actualCropWidth = cropToUse.width * scaleX;
    const actualCropHeight = cropToUse.height * scaleY;

    // Limit output size to prevent DB bloat (max 1024px)
    const MAX_DIMENSION = 1024;
    let outputWidth = actualCropWidth;
    let outputHeight = actualCropHeight;

    if (outputWidth > MAX_DIMENSION || outputHeight > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / outputWidth, MAX_DIMENSION / outputHeight);
        outputWidth *= ratio;
        outputHeight *= ratio;
    }

    const pixelRatio = window.devicePixelRatio;
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Revert to standard logic with max size check
    ctx.scale(outputWidth / (completedCrop!.width * scaleX), outputHeight / (completedCrop!.height * scaleY));
    
    ctx.translate(-completedCrop!.x * scaleX, -completedCrop!.y * scaleY);
    
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.translate(centerX, centerY);
    const rotateRads = rotate * Math.PI / 180;
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );

    // Export to base64
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    onImageSave(base64);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {!currentImage ? (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer relative group">
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/gif" 
            onChange={onSelectFile}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-sm font-medium">Tải ảnh minh họa (PNG, JPG, GIF)</span>
          </div>
        </div>
      ) : (
        <div className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <img src={currentImage} alt="Question" className="max-h-60 w-full object-contain mx-auto" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="cursor-pointer bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-50">
              Thay ảnh
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/gif" 
                onChange={onSelectFile}
                className="hidden"
              />
            </label>
            <button 
              onClick={onRemove}
              className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg hover:bg-red-50"
            >
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Chỉnh sửa hình ảnh</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             <div className="flex-1 overflow-auto p-6 bg-slate-900 flex justify-center items-center">
                {!!imgSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    className="max-h-[60vh]"
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imgSrc}
                      style={{ transform: `scale(${scale}) rotate(${rotate}deg)`, maxHeight: '60vh' }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                )}
             </div>

             <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex flex-wrap gap-6 items-center justify-center mb-6">
                   <div className="flex flex-col gap-1 w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Thu phóng: {Math.round(scale * 100)}%</label>
                      <input
                        type="range"
                        min={0.5}
                        max={3}
                        step={0.1}
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                   </div>
                   <div className="flex flex-col gap-1 w-48">
                      <label className="text-xs font-bold text-slate-500 uppercase">Xoay: {rotate}°</label>
                      <div className="flex items-center gap-2">
                         <button onClick={() => setRotate(r => r - 90)} className="p-1 bg-slate-100 rounded hover:bg-slate-200 text-slate-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                         </button>
                         <input
                           type="range"
                           min={0}
                           max={360}
                           value={rotate}
                           onChange={(e) => setRotate(Number(e.target.value))}
                           className="flex-1 accent-purple-600"
                         />
                         <button onClick={() => setRotate(r => r + 90)} className="p-1 bg-slate-100 rounded hover:bg-slate-200 text-slate-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                         </button>
                      </div>
                   </div>
                   <Button variant="secondary" size="sm" onClick={() => { setScale(1); setRotate(0); }}>Đặt lại</Button>
                </div>
                
                <div className="flex justify-end gap-3">
                   <Button variant="ghost" onClick={() => setIsOpen(false)}>Hủy bỏ</Button>
                   <Button variant="primary" onClick={handleSave}>Lưu ảnh</Button>
                </div>
             </div>
             
             {/* Hidden canvas for processing */}
             <canvas ref={previewCanvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
};