'use client';

import React, { useRef, useState } from 'react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const compressedBase64 = await compressImage(file);
      onChange(compressedBase64);
      
      const formData = new FormData();
      formData.append('file', file);
      fetch('/api/upload', { method: 'POST', body: formData }).catch(e => {});
    } catch (error) {
      console.error('Failed to upload image', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) uploadFile(file);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</label>

      {/* Upload Zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-1 rounded-none border-2 border-dashed transition-all cursor-pointer min-h-[80px] overflow-hidden
          ${isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'}
          ${isUploading ? 'opacity-60 cursor-wait' : ''}`}
      >
        {/* Image preview */}
        {value ? (
          <img
            src={value}
            alt="Preview"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
            }}
            className="w-full h-full object-cover absolute inset-0 opacity-25"
          />
        ) : null}

        <div className="relative z-10 flex flex-col items-center gap-1 py-3 px-2 text-center">
          {isUploading ? (
            <>
              <i className="fa-solid fa-circle-notch animate-spin text-purple-500 text-lg" />
              <span className="text-[10px] font-bold text-gray-500">Uploading…</span>
            </>
          ) : (
            <>
              {value ? (
                <i className="fa-solid fa-image text-purple-400 text-xl" />
              ) : (
                <i className="fa-solid fa-cloud-arrow-up text-gray-300 text-2xl" />
              )}
              <span className="text-[10px] font-bold text-gray-500 leading-tight">
                {value ? 'Click or drag to replace' : 'Click or drag to upload'}
              </span>
              <span className="text-[8px] text-gray-400 uppercase tracking-tighter">PNG, JPG, WEBP, SVG</span>
            </>
          )}
        </div>
      </div>

      {/* Current URL display — read-only, still editable by typing */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste a URL directly…"
        className="w-full px-2 py-1.5 rounded-none border border-gray-100 bg-gray-50 text-[10px] font-mono text-gray-500 focus:ring-2 focus:ring-purple-400 outline-none transition-all"
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
