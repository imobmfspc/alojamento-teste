import { IImageUploader, ValidationResult, UploadOptions } from '../interfaces/IService';
import { validateImage, compressImage, uploadImage, uploadGeneralImage } from '../utils/imageUtils';

/**
 * Serviço de upload de imagens seguindo os princípios SOLID
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por upload de imagens
 * Aplica o Open-Closed Principle (OCP) - pode ser estendido para novos tipos de upload
 */
export class ImageUploadService implements IImageUploader {
  async upload(file: File, options: UploadOptions): Promise<string> {
    try {
      // Validar arquivo
      const validation = await this.validate(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Comprimir arquivo
      const compressedFile = await this.compress(file);

      // Fazer upload baseado no tipo
      if (options.folder?.includes('quartos') && options.publicId) {
        const quartoId = this.extractQuartoId(options.publicId);
        const ordem = this.extractOrdem(options.publicId);
        return await uploadImage(compressedFile, quartoId, ordem);
      } else {
        const type = options.publicId || 'general';
        return await uploadGeneralImage(compressedFile, type);
      }
    } catch (error) {
      console.error('Error in ImageUploadService.upload:', error);
      throw error;
    }
  }

  async validate(file: File): Promise<ValidationResult> {
    try {
      const result = await validateImage(file);
      return {
        isValid: result.isValid,
        errors: result.error ? [result.error] : []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Erro ao validar imagem']
      };
    }
  }

  async compress(file: File): Promise<File> {
    try {
      return await compressImage(file);
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Falha ao comprimir imagem');
    }
  }

  private extractQuartoId(publicId: string): number {
    const match = publicId.match(/quarto_(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractOrdem(publicId: string): number {
    const match = publicId.match(/imagem_(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}