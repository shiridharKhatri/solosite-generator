
/**
 * Formats bytes into a human-readable string.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets the approximate size of a base64 string in bytes.
 */
export const getBase64Size = (base64String: string): number => {
  if (!base64String || !base64String.includes(',')) return 0;
  const stringLength = base64String.split(',')[1].length;
  const sizeInBytes = Math.ceil((stringLength * 3) / 4);
  return sizeInBytes;
};

/**
 * Compresses an image file or base64 string to a target size or quality.
 */
export const compressImage = (
  source: File | string,
  options: {
    targetSizeKB?: number;
    maxWidth?: number;
    quality?: number;
    format?: 'image/jpeg' | 'image/webp' | 'image/png';
  }
): Promise<{ dataUrl: string; size: number }> => {
  const { targetSizeKB, maxWidth = 1200, quality = 0.8, format = 'image/webp' } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    const processImage = (src: string) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // If targetSizeKB is specified, we try to iterate to find the best quality
        // This is a simplified version; for production we might want a binary search or similar.
        if (targetSizeKB) {
          let currentQuality = 0.9;
          let bestDataUrl = '';
          let bestSize = Infinity;

          const iterate = (q: number) => {
            const dataUrl = canvas.toDataURL(format, q);
            const size = getBase64Size(dataUrl);
            
            if (size / 1024 <= targetSizeKB) {
              resolve({ dataUrl, size });
              return;
            }

            if (q > 0.1) {
              iterate(q - 0.1);
            } else {
              // Best effort
              resolve({ dataUrl, size });
            }
          };

          iterate(currentQuality);
        } else {
          const dataUrl = canvas.toDataURL(format, quality);
          const size = getBase64Size(dataUrl);
          resolve({ dataUrl, size });
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    };

    if (source instanceof File) {
      reader.onload = (e) => processImage(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(source);
    } else {
      processImage(source);
    }
  });
};
