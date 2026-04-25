'use client';

import React, { useRef } from 'react';

interface EditableImageProps {
  src: string;
  onChange: (src: string) => void;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  onChange,
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
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error('Failed to upload image', error);
      alert('Upload failed. Ensure the server has write permissions for the uploads folder.');
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer ${className}`} 
      onClick={handleClick}
      style={{ ...style, display: 'inline-block', width: style?.width || (style?.maxHeight ? 'auto' : '100%'), height: style?.height }}
    >
      <img src={src} alt={alt} className="w-full h-full d-block" style={{ objectFit: style?.objectFit || 'cover', maxHeight: style?.maxHeight, minHeight: '100%' }} />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ borderRadius: 'inherit' }}>
        <span className="text-white text-sm font-medium">Click to replace</span>
      </div>
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
