import { describe, it, expect } from 'vitest';
import { ReservaValidator } from '../../validators/ReservaValidator';
import { CreateReservaData } from '../../types/entities';

describe('ReservaValidator', () => {
  let validator: ReservaValidator;

  beforeEach(() => {
    validator = new ReservaValidator();
  });

  describe('validate', () => {
    it('should validate correct reservation data', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const validData: CreateReservaData = {
        quarto_id: 1,
        nome_hospede: 'João Silva',
        email_hospede: 'joao@email.com',
        telefone_hospede: '123456789',
        data_checkin: tomorrow,
        data_checkout: dayAfterTomorrow,
        num_hospedes: 2,
        mensagem: 'Chegada prevista para as 15h'
      };

      const result = validator.validate(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject reservation with short name', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const invalidData: CreateReservaData = {
        quarto_id: 1,
        nome_hospede: 'AB',
        email_hospede: 'joao@email.com',
        telefone_hospede: '123456789',
        data_checkin: tomorrow,
        data_checkout: dayAfterTomorrow,
        num_hospedes: 2
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome deve ter pelo menos 3 caracteres');
    });

    it('should reject reservation with invalid email', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const invalidData: CreateReservaData = {
        quarto_id: 1,
        nome_hospede: 'João Silva',
        email_hospede: 'invalid-email',
        telefone_hospede: '123456789',
        data_checkin: tomorrow,
        data_checkout: dayAfterTomorrow,
        num_hospedes: 2
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email inválido');
    });

    it('should reject reservation with past check-in date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const invalidData: CreateReservaData = {
        quarto_id: 1,
        nome_hospede: 'João Silva',
        email_hospede: 'joao@email.com',
        telefone_hospede: '123456789',
        data_checkin: yesterday,
        data_checkout: tomorrow,
        num_hospedes: 2
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data de check-in não pode ser no passado');
    });

    it('should reject reservation with checkout before checkin', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const today = new Date();

      const invalidData: CreateReservaData = {
        quarto_id: 1,
        nome_hospede: 'João Silva',
        email_hospede: 'joao@email.com',
        telefone_hospede: '123456789',
        data_checkin: tomorrow,
        data_checkout: today,
        num_hospedes: 2
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data de check-out deve ser posterior à data de check-in');
    });

    it('should reject reservation with too many guests', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const invalidData: CreateReservaData = {
        quarto_id: 1,
        nome_hospede: 'João Silva',
        email_hospede: 'joao@email.com',
        telefone_hospede: '123456789',
        data_checkin: tomorrow,
        data_checkout: dayAfterTomorrow,
        num_hospedes: 15
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Não pode exceder 10 hóspedes');
    });
  });
});