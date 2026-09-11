import { storage, isFirebaseConfigured } from './firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

export interface UploadResult {
  url: string;
  storagePath: string;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Subir una fotografía de vehículo a Firebase Storage (Regla 8: Máximo 12 fotos)
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

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `La imagen excede el límite máximo de 5MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Por favor optimízala antes de subirla.`
    );
  }

  if (!storage || !isFirebaseConfigured()) {
    console.info('Firebase Storage no conectado. Generando ObjectURL local simulado.');
    return {
      url: URL.createObjectURL(file),
      storagePath: `local/vehicles/${vehicleId}/photos/${file.name}`,
    };
  }

  const cleanVehicleId = vehicleId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const prefix = typeof slotIndex === 'number' ? `photo_${String(slotIndex + 1).padStart(2, '0')}` : `img_${Date.now()}`;
  const fileName = `${prefix}_${Date.now()}.${extension}`;
  const storagePath = `vehicles/${cleanVehicleId}/photos/${fileName}`;

  const storageReference = ref(storage, storagePath);
  const metadata = {
    contentType: file.type,
    customMetadata: {
      vehicleId: cleanVehicleId,
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
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
 * Subir video promocional en loop silencioso (Reglas 7 y 9: máx 15s recomendado, máx 25MB)
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
      `El video excede el límite máximo de 25MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Debe ser un clip corto optimizado para loop web.`
    );
  }

  if (!storage || !isFirebaseConfigured()) {
    console.info('Firebase Storage no conectado. Generando ObjectURL local simulado para video.');
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
 * Eliminar un recurso multimedia en Firebase Storage
 */
export const deleteVehicleMedia = async (storagePath: string): Promise<void> => {
  if (!storage || !isFirebaseConfigured() || storagePath.startsWith('local/')) {
    return;
  }

  try {
    const storageReference = ref(storage, storagePath);
    await deleteObject(storageReference);
  } catch (error) {
    console.warn(`Error al eliminar archivo en storage (${storagePath}):`, error);
  }
};
