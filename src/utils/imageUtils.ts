import imageCompression from 'browser-image-compression';
import { cloudinaryConfig, generateUploadUrl, generatePublicId, generateGeneralPublicId } from '../config/cloudinary';

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateImage(file: File): Promise<ImageValidationResult> {
  if (!file.type.match(/^image\/(jpeg|jpg)$/)) {
    return {
      isValid: false,
      error: `Tipo de arquivo não suportado: ${file.type}. Apenas imagens JPG/JPEG são permitidas.`
    };
  }

  if (file.size > cloudinaryConfig.maxFileSize) {
    const maxSizeMB = (cloudinaryConfig.maxFileSize / 1024 / 1024).toFixed(1);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
    return {
      isValid: false,
      error: `Arquivo muito grande: ${fileSizeMB}MB. O tamanho máximo permitido é ${maxSizeMB}MB.`
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width < cloudinaryConfig.minWidth || img.height < cloudinaryConfig.minHeight) {
        const currentDimensions = `${img.width}x${img.height}`;
        const minDimensions = `${cloudinaryConfig.minWidth}x${cloudinaryConfig.minHeight}`;
        resolve({
          isValid: false,
          error: `Resolução muito baixa: ${currentDimensions}px. A imagem deve ter no mínimo ${minDimensions}px.`
        });
      } else {
        resolve({ isValid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: 'Arquivo de imagem corrompido ou inválido. Tente com outra imagem.'
      });
    };

    img.src = objectUrl;
  });
}

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    throw new Error(`Falha ao comprimir imagem: ${errorMessage}`);
  }
}

export async function uploadImage(
  file: File,
  quartoId: number,
  ordem: number,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    if (onProgress) onProgress(10);

    const publicId = generatePublicId(quartoId, ordem);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', `${cloudinaryConfig.folder}/${quartoId}`);
    formData.append('public_id', publicId);

    // Add transformation parameters individually instead of as JSON
    formData.append('width', '800');
    formData.append('height', '500');
    formData.append('crop', 'fill');
    formData.append('gravity', 'auto');

    const uploadPromise = new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 90) + 10;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.error) {
              const errorMsg = `Erro do Cloudinary: ${response.error.message || JSON.stringify(response.error)}`;
              console.error('Cloudinary error response:', response.error);
              reject(new Error(errorMsg));
              return;
            }
            if (!response.secure_url) {
              const errorMsg = 'Resposta inválida do servidor: URL da imagem não encontrada';
              console.error('Invalid Cloudinary response:', response);
              reject(new Error(errorMsg));
              return;
            }
            console.log('Upload successful:', {
              quartoId,
              ordem,
              url: response.secure_url,
              publicId: response.public_id
            });
            resolve(response.secure_url);
          } catch (parseError) {
            const errorMsg = `Erro ao processar resposta do servidor (Status ${xhr.status})`;
            console.error('Parse error:', parseError, 'Response:', xhr.responseText);
            reject(new Error(errorMsg));
          }
        } else {
          let errorMsg = `Erro no upload: ${xhr.status} ${xhr.statusText}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.error && errorResponse.error.message) {
              errorMsg += ` - ${errorResponse.error.message}`;
            }
          } catch {
            // Se não conseguir fazer parse da resposta, usar a mensagem padrão
            if (xhr.responseText) {
              errorMsg += ` - ${xhr.responseText.substring(0, 100)}`;
            }
          }
          console.error('Upload failed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText
          });
          reject(new Error(errorMsg));
        }
      };
      
      xhr.onerror = () => {
        const errorMsg = 'Erro de rede durante o upload. Verifique sua conexão com a internet.';
        console.error('Network error during upload');
        reject(new Error(errorMsg));
      };

      xhr.ontimeout = () => {
        const errorMsg = 'Timeout no upload. A imagem pode ser muito grande ou a conexão está lenta.';
        console.error('Upload timeout');
        reject(new Error(errorMsg));
      };

      xhr.timeout = 30000; // 30 segundos de timeout
      xhr.open('POST', generateUploadUrl(), true);
      xhr.send(formData);
    });

    const url = await uploadPromise;
    if (onProgress) onProgress(100);
    console.log('Upload completed successfully:', url);
    return url;
  } catch (error) {
    console.error('Erro durante o upload:', error);
    if (error instanceof Error) {
      throw error; // Re-throw the specific error
    }
    throw new Error(`Falha no upload da imagem: ${String(error)}`);
  }
}

export async function uploadGeneralImage(
  file: File,
  type: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    if (onProgress) onProgress(10);

    const publicId = generateGeneralPublicId(type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', cloudinaryConfig.generalFolder);
    formData.append('public_id', publicId);

    // Add transformation parameters individually instead of as JSON
    formData.append('width', '1920');
    formData.append('height', '1080');
    formData.append('crop', 'fill');
    formData.append('gravity', 'auto');

    const uploadPromise = new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 90) + 10;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
            if (response.error) {
              reject(new Error(`Erro do Cloudinary: ${response.error.message || 'Erro desconhecido do servidor'}`));
              return;
            }
            if (!response.secure_url) {
              reject(new Error('Resposta inválida do servidor: URL da imagem não encontrada'));
            reject(new Error(`Erro ao processar resposta do servidor (Status ${xhr.status}): ${xhr.responseText.substring(0, 200)}`));
            }
        } else {
          let errorMessage = `Erro HTTP ${xhr.status}: ${xhr.statusText}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.error && errorResponse.error.message) {
              errorMessage += ` - ${errorResponse.error.message}`;
            }
          } catch {
            // Se não conseguir fazer parse da resposta, usar a mensagem padrão
            if (xhr.responseText) {
              errorMessage += ` - ${xhr.responseText.substring(0, 100)}`;
            }
          }
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Erro de rede durante o upload. Verifique sua conexão com a internet.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Timeout no upload. A imagem pode ser muito grande ou a conexão está lenta.'));
      };

      xhr.timeout = 30000; // 30 segundos de timeout
      xhr.open('POST', generateUploadUrl(), true);
      xhr.send(formData);
    });

    const url = await uploadPromise;
    if (onProgress) onProgress(100);
    return url;
  } catch (error) {
    console.error('Erro durante o upload:', error);
    if (error instanceof Error) {
      throw error; // Re-throw the specific error
    }
    throw new Error(`Falha no upload da imagem: ${String(error)}`);
  }
}