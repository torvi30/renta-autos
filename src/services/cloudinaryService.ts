/**
 * Servicio de Almacenamiento y Optimización CDN en Cloudinary
 * Permite subida directa sin servidor (Unsigned Upload) de imágenes y videos.
 * Ofrece compresión inteligente automática (WebP/AVIF) y CDN global de baja latencia.
 */

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

/**
 * Verifica si Cloudinary cuenta con las credenciales mínimas configuradas en .env
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    CLOUD_NAME &&
    CLOUD_NAME.trim() !== '' &&
    CLOUD_NAME !== 'tu_cloud_name_aqui' &&
    UPLOAD_PRESET &&
    UPLOAD_PRESET.trim() !== '' &&
    UPLOAD_PRESET !== 'tu_preset_aqui' &&
    UPLOAD_PRESET !== 'tu_upload_preset_unsigned_aqui'
  );
};

export const getCloudinaryConfig = () => ({
  cloudName: CLOUD_NAME,
  uploadPreset: UPLOAD_PRESET,
  isConfigured: isCloudinaryConfigured(),
});

/**
 * Realiza una prueba de conexión en vivo con Cloudinary subiendo un archivo de prueba mínimo
 */
export const testCloudinaryConnection = async (): Promise<{
  success: boolean;
  message: string;
  url?: string;
  details?: any;
}> => {
  if (!isCloudinaryConfigured()) {
    return {
      success: false,
      message: 'Faltan variables VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET en el archivo .env',
    };
  }

  try {
    const base64Pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = await fetch(base64Pixel);
    const blob = await res.blob();
    const testFile = new File([blob], 'cloudinary_ping.png', { type: 'image/png' });

    const result = await uploadImageToCloudinary(testFile, 'renta-autos/diagnostico');
    return {
      success: true,
      message: `Conexión exitosa con Cloudinary CDN (Cloud: ${CLOUD_NAME})`,
      url: result.url,
      details: result,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error al conectar con la API de Cloudinary.',
    };
  }
};

/**
 * Subir imagen directamente a Cloudinary mediante Unsigned Upload Preset
 */
export const uploadImageToCloudinary = async (
  file: File,
  folder = 'renta-autos/flota'
): Promise<CloudinaryUploadResult> => {
  if (!isCloudinaryConfigured()) {
    console.info('Cloudinary no configurado en .env. Retornando preview local.');
    return {
      url: URL.createObjectURL(file),
      publicId: `local_${Date.now()}`,
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) {
    formData.append('folder', folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message ||
        `Error al subir imagen a Cloudinary (Código HTTP ${response.status}).`
      );
    }

    const data = await response.json();

    // Generar URL con auto-formato (WebP/AVIF) y auto-calidad
    let optimizedUrl = data.secure_url || data.url;
    if (optimizedUrl.includes('/upload/')) {
      optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    return {
      url: optimizedUrl,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
    };
  } catch (error: any) {
    console.error('Fallo en uploadImageToCloudinary:', error);
    throw new Error(error?.message || 'Error de conexión con Cloudinary.');
  }
};

/**
 * Subir video de vehículo directamente a Cloudinary
 */
export const uploadVideoToCloudinary = async (
  file: File,
  folder = 'renta-autos/videos'
): Promise<CloudinaryUploadResult> => {
  if (!isCloudinaryConfigured()) {
    console.info('Cloudinary no configurado en .env. Retornando preview local de video.');
    return {
      url: URL.createObjectURL(file),
      publicId: `local_video_${Date.now()}`,
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) {
    formData.append('folder', folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message ||
        `Error al subir video a Cloudinary (Código HTTP ${response.status}).`
      );
    }

    const data = await response.json();
    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
    };
  } catch (error: any) {
    console.error('Fallo en uploadVideoToCloudinary:', error);
    throw new Error(error?.message || 'Error al procesar el video en Cloudinary.');
  }
};

/**
 * Genera URLs optimizadas de Cloudinary con transformaciones dinámicas
 */
export const getOptimizedCloudinaryUrl = (
  url: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
  }
): string => {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  const transforms: string[] = ['f_auto', 'q_auto'];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);

  const transformString = transforms.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
};
