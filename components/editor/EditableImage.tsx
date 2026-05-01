'use client';

import React, { useRef, useState } from 'react';

interface EditableImageProps {
  src: string;
  onChange: (src: string) => void;
  onAltChange?: (alt: string) => void;
  isCircular?: boolean;
  onToggleCircular?: () => void;
  onRemove?: () => void;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  onChange,
  onAltChange,
  isCircular = false,
  onToggleCircular,
  onRemove,
  className = '',
  alt = 'Editable image',
  style,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [tempAlt, setTempAlt] = useState(alt);

  const handleClick = () => {
    if (!isUploading && !isEditingAlt) fileInputRef.current?.click();
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
      const compressedBase64 = await compressImage(file);
      onChange(compressedBase64);
      setIsUploading(false);
    } catch (error) {
      console.error('Failed to process image', error);
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`relative group cursor-pointer flex justify-center items-center overflow-hidden transition-all duration-300 z-10 ${isCircular ? 'rounded-full aspect-square' : ''} ${className}`}
      style={style}
    >
      <div onClick={handleClick} className="w-full h-full flex justify-center items-center">
        {src ? (
          <img
            src={src}
            alt={alt}
            className={`w-full h-full block ${isCircular ? 'object-cover' : 'object-contain'}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
            }}
            style={{
              maxHeight: isCircular ? 'none' : (style?.maxHeight || '100%'),
              width: '100%',
              height: '100%',
              objectFit: (style?.objectFit as any) || (isCircular ? 'cover' : 'contain'),
              borderRadius: isCircular ? '9999px' : '0'
            }}
          />
        ) : (
          <div className={`w-full h-full bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center p-4 min-h-[100px] ${isCircular ? 'rounded-full' : ''}`}>
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest text-center">No Image<br /><small className="opacity-50">Click to add</small></span>
          </div>
        )}
      </div>

      <div className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none z-50 ${isCircular ? 'rounded-full' : ''}`}>
        {(src || onRemove || onToggleCircular) && (
          <div className="flex gap-2 pointer-events-auto">
            {onToggleCircular && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCircular();
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-none hover:scale-110 transition-all ${isCircular ? 'bg-amber-500 text-white' : 'bg-white text-gray-900'}`}
                title={isCircular ? "Make Square" : "Make Circular"}
              >
                <i className={`fa-solid ${isCircular ? 'fa-square' : 'fa-circle'} text-[10px]`}></i>
              </button>
            )}
            {onAltChange && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingAlt(!isEditingAlt);
                  setTempAlt(alt);
                }}
                className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-none hover:bg-blue-700 hover:scale-110 transition-all"
                title="Edit Alt Tag"
              >
                <i className="fa-solid fa-tag text-[10px]"></i>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onRemove) {
                  onRemove();
                } else {
                  onChange('');
                }
              }}
              className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-none hover:bg-red-600 hover:scale-110 transition-all"
              title="Remove Image"
            >
              <i className="fa-solid fa-times text-[10px]"></i>
            </button>
          </div>
        )}
        <span className="text-white/90 text-[9px] font-bold uppercase tracking-widest text-center px-2 hidden sm:block">Click to replace</span>
      </div>

      {isUploading && (
        <div className={`absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-40 transition-all ${isCircular ? 'rounded-full' : ''}`}>
          <i className="fa-solid fa-circle-notch animate-spin text-blue-600 text-xl mb-2"></i>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Uploading...</span>
        </div>
      )}

      {isEditingAlt && (
        <div className={`absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 z-[60] animate-in fade-in zoom-in duration-200 ${isCircular ? 'rounded-full' : ''}`}>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Alt Tag</label>
          <input
            type="text"
            className="w-full p-2 border border-zinc-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none mb-3"
            value={tempAlt}
            onChange={(e) => setTempAlt(e.target.value)}
            placeholder="Image description"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex gap-1 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAltChange?.(tempAlt);
                setIsEditingAlt(false);
              }}
              className="flex-1 py-1.5 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest border-none"
            >
              Save
            </button>
          </div>
        </div>
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
