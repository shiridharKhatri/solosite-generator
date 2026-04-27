'use client';

import React, { useRef, useState } from 'react';

interface EditableImageProps {
  src: string;
  onChange: (src: string) => void;
  onRemove?: () => void;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  onChange,
  onRemove,
  className = '',
  alt = 'Editable image',
  style,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Use 0.6 quality for even better compression (still looks great)
          const webpBase64 = canvas.toDataURL('image/webp', 0.6);
          resolve(webpBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Always compress first to save space and prevent OOM
      const compressedBase64 = await compressImage(file);
      
      // Try to upload to server (which will now just store this compressed base64 or save to disk)
      // For now, we'll just use the compressed base64 directly to guarantee it works in production
      onChange(compressedBase64);
      setIsUploading(false);
      
      // Optional: still call the API if you want server-side processing, 
      // but the above line makes it work immediately and reliably.
    } catch (error) {
      console.error('Failed to process image', error);
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`relative group cursor-pointer flex justify-center items-center ${className}`}
      style={{ ...style, display: style?.display || 'flex', width: style?.width || (style?.maxHeight ? 'auto' : '100%'), height: style?.height }}
    >
      <div onClick={handleClick} className="w-full h-full flex justify-center items-center">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full block"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
            }}
            style={{
              objectFit: style?.objectFit || 'contain',
              maxHeight: style?.maxHeight || '70vh',
              minHeight: style?.minHeight || 'auto',
              width: style?.width || '100%',
              height: style?.height || 'auto',
              margin: '0 auto'
            }}
          />
        ) : (
          <div className="w-full h-full bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center p-4 min-h-[100px]">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest text-center">No Image<br /><small className="opacity-50">Click to add</small></span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" style={{ borderRadius: 'inherit' }}>
        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Click to replace</span>
      </div>

      {isUploading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-40 transition-all">
          <i className="fa-solid fa-circle-notch animate-spin text-blue-600 text-xl mb-2"></i>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Uploading...</span>
        </div>
      )}

      {(src || onRemove) && (
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            if (onRemove) {
              onRemove();
            } else {
              onChange(''); 
            }
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-50 shadow-lg border-none hover:bg-red-600 hover:scale-110"
          title="Remove Image"
        >
          <i className="fa-solid fa-times text-[10px]"></i>
        </button>
      )}


      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};
