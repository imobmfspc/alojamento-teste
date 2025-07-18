import { IValidator, ValidationResult } from '../interfaces/IService';
import { CreateQuartoData } from '../types/entities';

/**
 * Validador para quartos seguindo o Single Responsibility Principle (SRP)
 * Responsável apenas por validar dados de quartos
 */
export class QuartoValidator implements IValidator<CreateQuartoData> {
  validate(data: CreateQuartoData): ValidationResult {
    const errors: string[] = [];

    // Validação do nome
    if (!data.nome || data.nome.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }
    if (data.nome && data.nome.length > 100) {
      errors.push('Nome não pode ter mais de 100 caracteres');
    }

    // Validação da descrição
    if (!data.descricao || data.descricao.trim().length < 10) {
      errors.push('Descrição deve ter pelo menos 10 caracteres');
    }
    if (data.descricao && data.descricao.length > 1000) {
      errors.push('Descrição não pode ter mais de 1000 caracteres');
    }

    // Validação do preço
    if (!data.preco_noite || data.preco_noite <= 0) {
      errors.push('Preço por noite deve ser maior que zero');
    }

    // Validação da capacidade
    if (!data.capacidade || data.capacidade <= 0) {
      errors.push('Capacidade deve ser maior que zero');
    }
    if (data.capacidade > 10) {
      errors.push('Capacidade não pode ser maior que 10');
    }

    // Validação do tamanho
    if (!data.tamanho_m2 || data.tamanho_m2 <= 0) {
      errors.push('Tamanho deve ser maior que zero');
    }

    // Validação das comodidades
    if (!Array.isArray(data.comodidades)) {
      errors.push('Comodidades deve ser um array');
    }

    // Validação das imagens
    if (!Array.isArray(data.imagens)) {
      errors.push('Imagens deve ser um array');
    } else {
      data.imagens.forEach((img, index) => {
        if (!img.url || !this.isValidUrl(img.url)) {
          errors.push(`Imagem ${index + 1}: URL inválida`);
        }
        if (typeof img.ordem !== 'number' || img.ordem < 0) {
          errors.push(`Imagem ${index + 1}: Ordem deve ser um número não negativo`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}