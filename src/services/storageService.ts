import { storage, isFirebaseConfigured } from './firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
  isCloudinaryConfigured,
} from './cloudinaryService';

export interface UploadResult {
  url: string;
  storagePath: string;
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (Cloudinary handles compression and CDN)
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB (Cloudinary handles transcoding)

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Automatically compresses any image to WebP format in the browser before upload.
 * Drastically reduces payload size (up to 80-90%) preserving visual quality.
 */
export const compressImageToWebP = async (
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
): Promise<File> => {
  // If already a small WebP under 400KB, return as-is
  if (file.type === 'image/webp' && file.size < 400 * 1024) {
    return file;
  }

  // If in environment without DOM (e.g. SSR or Node), return file
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      // Maintain aspect ratio without exceeding maximum dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback to original file if canvas fails
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      resolve(file); // Fallback
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Upload vehicle photo to Cloudinary CDN (or Firebase Storage fallback)
 */
export const uploadVehiclePhoto = async (
  vehicleId: string,
  file: File,
  slotIndex?: number
): Promise<UploadResult> => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Formato no soportado (${file.type}). Por favor utiliza imágenes en formato WebP, JPG o PNG.`
    );
  }

  // 1. Si Cloudinary está configurado, subir directamente a Cloudinary CDN
  if (isCloudinaryConfigured()) {
    const cleanVehicleId = vehicleId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const folder = `renta-autos/flota/${cleanVehicleId}`;
    const cloudRes = await uploadImageToCloudinary(file, folder);
    return {
      url: cloudRes.url,
      storagePath: `cloudinary:${cloudRes.publicId}`,
    };
  }

  // Optimización automática a WebP antes de procesar si se usa Firebase
  let fileToUpload = file;
  try {
    fileToUpload = await compressImageToWebP(file);
  } catch (err) {
    console.warn('Aviso: no se pudo pre-comprimir la imagen, procediendo con archivo original:', err);
  }

  if (fileToUpload.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `La imagen excede el límite máximo permitido (${(fileToUpload.size / (1024 * 1024)).toFixed(1)}MB).`
    );
  }

  if (!storage || !isFirebaseConfigured()) {
    console.info('Storage en la nube no conectado. Generando ObjectURL local simulado.');
    return {
      url: URL.createObjectURL(fileToUpload),
      storagePath: `local/vehicles/${vehicleId}/photos/${fileToUpload.name}`,
    };
  }

  const cleanVehicleId = vehicleId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const extension = fileToUpload.name.split('.').pop()?.toLowerCase() || 'webp';
  const prefix = typeof slotIndex === 'number' ? `photo_${String(slotIndex + 1).padStart(2, '0')}` : `img_${Date.now()}`;
  const fileName = `${prefix}_${Date.now()}.${extension}`;
  const storagePath = `vehicles/${cleanVehicleId}/photos/${fileName}`;

  const storageReference = ref(storage, storagePath);
  const metadata = {
    contentType: fileToUpload.type,
    customMetadata: {
      vehicleId: cleanVehicleId,
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
      compressed: String(fileToUpload !== file),
    },
  };

  const uploadTask = await uploadBytes(storageReference, fileToUpload, metadata);
  const downloadUrl = await getDownloadURL(uploadTask.ref);

  return {
    url: downloadUrl,
    storagePath,
  };
};

/**
 * Subir video promocional en loop silencioso a Cloudinary CDN (o Firebase Storage)
 */
export const uploadVehicleVideo = async (
  vehicleId: string,
  file: File
): Promise<UploadResult> => {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error(
      `Formato de video no soportado (${file.type}). Por favor utiliza formato MP4 o WebM.`
    );
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(
      `El video excede el límite máximo de 50MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Debe ser un clip corto optimizado para loop web.`
    );
  }

  // 1. Si Cloudinary está configurado, subir directamente a Cloudinary CDN
  if (isCloudinaryConfigured()) {
    const cleanVehicleId = vehicleId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const folder = `renta-autos/videos/${cleanVehicleId}`;
    const cloudRes = await uploadVideoToCloudinary(file, folder);
    return {
      url: cloudRes.url,
      storagePath: `cloudinary:${cloudRes.publicId}`,
    };
  }

  if (!storage || !isFirebaseConfigured()) {
    console.info('Storage en la nube no conectado. Generando ObjectURL local simulado para video.');
    return {
      url: URL.createObjectURL(file),
      storagePath: `local/vehicles/${vehicleId}/videos/${file.name}`,
    };
  }

  const cleanVehicleId = vehicleId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  const fileName = `showroom_loop_${Date.now()}.${extension}`;
  const storagePath = `vehicles/${cleanVehicleId}/videos/${fileName}`;

  const storageReference = ref(storage, storagePath);
  const metadata = {
    contentType: file.type,
    customMetadata: {
      vehicleId: cleanVehicleId,
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
      loopReady: 'true',
    },
  };

  const uploadTask = await uploadBytes(storageReference, file, metadata);
  const downloadUrl = await getDownloadURL(uploadTask.ref);

  return {
    url: downloadUrl,
    storagePath,
  };
};

/**
 * Eliminar un recurso multimedia (Firebase Storage o Cloudinary)
 */
export const deleteVehicleMedia = async (storagePath: string): Promise<void> => {
  if (!storagePath || storagePath.startsWith('local/')) {
    return;
  }

  if (storagePath.startsWith('cloudinary:')) {
    console.info('Recurso Cloudinary registrado para eliminación:', storagePath);
    return;
  }

  if (!storage || !isFirebaseConfigured()) {
    return;
  }

  try {
    const storageReference = ref(storage, storagePath);
    await deleteObject(storageReference);
  } catch (error) {
    console.warn(`Error al eliminar archivo en storage (${storagePath}):`, error);
  }
};
