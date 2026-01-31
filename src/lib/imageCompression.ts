import imageCompression from 'browser-image-compression';

const MAX_SIZE_MB = 1;
const MAX_WIDTH_OR_HEIGHT = 1200;

export async function compressImage(file: File): Promise<File> {
  // すでに1MB以下なら圧縮不要
  if (file.size <= MAX_SIZE_MB * 1024 * 1024) {
    // ただしリサイズはする（表示速度向上のため）
    const options = {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
    };
    
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
      return file;
    }
  }

  // 1MB超えの場合は圧縮
  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(
      `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
    );
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('画像の圧縮に失敗しました');
  }
}

export function generateFileName(userId: string, originalName: string): string {
  const timestamp = Date.now();
  const extension = 'jpg'; // 圧縮後は常にJPEG
  return `${userId}/${timestamp}.${extension}`;
}
