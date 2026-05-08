'use client';

import React, { useState, useEffect } from 'react';
import { formatFileSize, compressImage } from '@/lib/imageUtils';
import { useStore } from '@/lib/store';

export const ImageCompressionDialog: React.FC = () => {
  const { compressionState, setCompressionState } = useStore();
  const { isOpen, file, onConfirm, onKeepOriginal } = compressionState;
  
  const [targetSize, setTargetSize] = useState(100);
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      if (file instanceof File) {
        setOriginalSize(file.size);
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        const stringLength = file.split(',')[1]?.length || 0;
        setOriginalSize(Math.ceil((stringLength * 3) / 4));
        setPreviewUrl(file);
      }
    } else {
        setPreviewUrl(null);
        setOriginalSize(0);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleClose = () => {
    setCompressionState({ isOpen: false, file: null });
  };

  const handleCompress = async () => {
    setIsCompressing(true);
    try {
      const result = await compressImage(file, { targetSizeKB: targetSize });
      onConfirm(result.dataUrl);
      handleClose();
    } catch (error) {
      console.error('Compression failed', error);
      alert('Compression failed. Please try a different setting.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleKeepOriginal = () => {
    onKeepOriginal();
    handleClose();
  };

  const savingsPercentage = Math.max(0, Math.round((1 - (targetSize * 1024 / originalSize)) * 100));

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Compact Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                <i className="fa-solid fa-weight-hanging"></i>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">Image Size Warning</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Current: <span className="text-amber-600">{formatFileSize(originalSize)}</span></p>
              </div>
            </div>
            <div className="text-right">
                <span className="text-[18px] font-black text-emerald-500 tracking-tighter">-{savingsPercentage}%</span>
                <span className="text-[8px] font-black uppercase text-slate-400 block -mt-1">Savings</span>
            </div>
          </div>
        </div>

        {/* Compression Control - More Compact */}
        <div className="px-6 space-y-4">
          <div className="flex justify-between items-end">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">{targetSize}</span>
                <span className="text-xs font-black text-purple-600 uppercase">KB</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Size</span>
          </div>

          <div className="relative h-6 flex items-center group">
              <div className="absolute inset-x-0 h-1.5 bg-slate-100 rounded-full">
                  <div 
                      className="h-full bg-purple-600 rounded-full transition-all duration-300" 
                      style={{ width: `${(targetSize / 500) * 100}%` }}
                  ></div>
              </div>
              <input 
                  type="range" 
                  min="20" 
                  max="500" 
                  step="10"
                  value={targetSize} 
                  onChange={(e) => setTargetSize(parseInt(e.target.value))}
                  className="absolute inset-x-0 w-full opacity-0 cursor-pointer h-6 z-20"
              />
              <div 
                  className="absolute w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-md z-10 pointer-events-none group-hover:scale-125 transition-transform"
                  style={{ left: `calc(${(targetSize / 500) * 100}% - 8px)` }}
              ></div>
          </div>
          
          <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
              <span>Max Savings</span>
              <span>High Quality</span>
          </div>
        </div>

        {/* Smaller Preview */}
        <div className="p-6">
            <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-[16/9]">
                {previewUrl && (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/5 rounded-full">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Preview</span>
                </div>
            </div>
        </div>

        {/* Footer Actions - Refined Size */}
        <div className="px-6 pb-8 pt-2 flex flex-col gap-3">
          <button
            onClick={handleCompress}
            disabled={isCompressing}
            className="w-full py-3 bg-slate-900 text-white rounded-[14px] font-bold text-[13px] hover:bg-black transition-all flex items-center justify-center gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompressing ? (
              <i className="fa-solid fa-circle-notch animate-spin text-sm"></i>
            ) : (
              <i className="fa-solid fa-wand-magic-sparkles text-sm text-amber-400"></i>
            )}
            {isCompressing ? 'Optimizing...' : 'Optimize & Save'}
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleKeepOriginal}
              className="py-2.5 bg-slate-100 text-slate-700 rounded-[14px] font-bold text-[12px] hover:bg-slate-200 transition-all text-center"
            >
              Keep Original
            </button>
            <button
              onClick={handleClose}
              className="py-2.5 bg-white border border-slate-200 text-slate-500 rounded-[14px] font-bold text-[12px] hover:bg-slate-50 transition-all text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
