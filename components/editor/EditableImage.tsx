'use client';

import React, { useRef } from 'react';

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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
          return;
        }
      }

      // Fallback to DataURL
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image', error);
      // Fallback to DataURL even on network error
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
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
