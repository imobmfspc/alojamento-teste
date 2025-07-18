import { describe, it, expect } from 'vitest';
import { QuartoValidator } from '../../validators/QuartoValidator';
import { CreateQuartoData } from '../../types/entities';

describe('QuartoValidator', () => {
  let validator: QuartoValidator;

  beforeEach(() => {
    validator = new QuartoValidator();
  });

  describe('validate', () => {
    it('should validate correct room data', () => {
      const validData: CreateQuartoData = {
        nome: 'Quarto Deluxe',
        descricao: 'Um quarto espaçoso e confortável com vista para o mar',
        preco_noite: 150,
        capacidade: 2,
        tamanho_m2: 25,
        comodidades: ['Wi-Fi', 'TV', 'Ar condicionado'],
        disponivel: true,
        imagens: [
          { url: 'https://example.com/image1.jpg', ordem: 0 },
          { url: 'https://example.com/image2.jpg', ordem: 1 }
        ]
      };

      const result = validator.validate(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject room with short name', () => {
      const invalidData: CreateQuartoData = {
        nome: 'AB',
        descricao: 'Um quarto espaçoso e confortável com vista para o mar',
        preco_noite: 150,
        capacidade: 2,
        tamanho_m2: 25,
        comodidades: ['Wi-Fi'],
        disponivel: true,
        imagens: []
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome deve ter pelo menos 3 caracteres');
    });

    it('should reject room with short description', () => {
      const invalidData: CreateQuartoData = {
        nome: 'Quarto Deluxe',
        descricao: 'Curto',
        preco_noite: 150,
        capacidade: 2,
        tamanho_m2: 25,
        comodidades: ['Wi-Fi'],
        disponivel: true,
        imagens: []
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Descrição deve ter pelo menos 10 caracteres');
    });

    it('should reject room with invalid price', () => {
      const invalidData: CreateQuartoData = {
        nome: 'Quarto Deluxe',
        descricao: 'Um quarto espaçoso e confortável com vista para o mar',
        preco_noite: 0,
        capacidade: 2,
        tamanho_m2: 25,
        comodidades: ['Wi-Fi'],
        disponivel: true,
        imagens: []
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Preço por noite deve ser maior que zero');
    });

    it('should reject room with invalid capacity', () => {
      const invalidData: CreateQuartoData = {
        nome: 'Quarto Deluxe',
        descricao: 'Um quarto espaçoso e confortável com vista para o mar',
        preco_noite: 150,
        capacidade: 15,
        tamanho_m2: 25,
        comodidades: ['Wi-Fi'],
        disponivel: true,
        imagens: []
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Capacidade não pode ser maior que 10');
    });

    it('should reject room with invalid image URLs', () => {
      const invalidData: CreateQuartoData = {
        nome: 'Quarto Deluxe',
        descricao: 'Um quarto espaçoso e confortável com vista para o mar',
        preco_noite: 150,
        capacidade: 2,
        tamanho_m2: 25,
        comodidades: ['Wi-Fi'],
        disponivel: true,
        imagens: [
          { url: 'invalid-url', ordem: 0 }
        ]
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Imagem 1: URL inválida');
    });
  });
});