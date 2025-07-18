export const cloudinaryConfig = {
  cloudName: 'djjvxbsah',
  apiKey: '644762134817948',
  uploadPreset: 'unsigned_preset',
  folder: 'alojamento-local/quartos',
  generalFolder: 'alojamento-local/geral',
  maxFileSize: 10485760, // 10MB em bytes
  minWidth: 800,
  minHeight: 600
} as const;

export function generateUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
}

export function generateImageUrl(publicId: string, options = {}) {
  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  const transformations = Object.entries(options)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');
  
  return `${baseUrl}${transformations ? '/' + transformations : ''}/${publicId}`;
}

export function generatePublicId(quartoId: number, ordem: number): string {
  return `quarto_${quartoId}_imagem_${ordem}_${Date.now()}`;
}

export function generateGeneralPublicId(type: string): string {
  return `${type}_${Date.now()}`;
}

export function getOptimizedImageUrl(url: string, width = 800): string {
  if (!url.includes('res.cloudinary.com')) return url;
  
  const transformations = [
    'f_auto', // Formato automático
    'q_auto:good', // Qualidade automática boa
    `w_${width}`, // Largura específica
    'c_fill' // Crop para preencher
  ];
  
  const baseUrl = url.split('/upload/')[0];
  const publicId = url.split('/upload/')[1];
  
  return `${baseUrl}/upload/${transformations.join(',')}/${publicId}`;
}