'use client';

import React, { useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { ImageCompressionDialog } from './ImageCompressionDialog';
import { getBase64Size, formatFileSize } from '@/lib/imageUtils';

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
  const setCompressionState = useStore((s) => s.setCompressionState);

  const handleClick = () => {
    if (!isUploading && !isEditingAlt) fileInputRef.current?.click();
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      // Set fast preview
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          onChange(data.url);
        }
      } else {
        console.error('Failed to upload image');
        alert('Failed to upload image to server.');
      }
    } catch (error) {
      console.error('Error uploading image', error);
      alert('Error uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      setCompressionState({
        isOpen: true,
        file,
        onConfirm: (url) => {
          try {
            const compressedFile = dataURLtoFile(url, file.name);
            uploadImage(compressedFile);
          } catch (err) {
            console.error('Failed to parse compressed URL to file', err);
            uploadImage(file);
          }
        },
        onKeepOriginal: () => uploadImage(file)
      });
      return;
    }

    uploadImage(file);
  };

  const currentSize = getBase64Size(src);
  const isLarge = currentSize > 100 * 1024;

  return (
    <div
      className={`relative group cursor-pointer flex justify-center items-center transition-all duration-300 z-10 ${isCircular ? 'rounded-full aspect-square' : ''} ${className}`}
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
            {isLarge && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCompressionState({
                    isOpen: true,
                    file: src,
                    onConfirm: (url) => onChange(url),
                    onKeepOriginal: () => {}
                  });
                }}
                className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg border-none hover:bg-purple-700 hover:scale-110 transition-all animate-pulse"
                title={`Compress Image (Currently ${formatFileSize(currentSize)})`}
              >
                <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
              </button>
            )}
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
        {isLarge && (
           <span className="text-amber-400 text-[8px] font-black uppercase tracking-tighter mt-1 bg-black/40 px-1.5 py-0.5 rounded-full">Optimize for SEO ({formatFileSize(currentSize)})</span>
        )}
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
