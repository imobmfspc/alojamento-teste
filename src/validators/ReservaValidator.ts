import { IValidator, ValidationResult } from '../interfaces/IService';
import { CreateReservaData } from '../types/entities';

/**
 * Validador para reservas seguindo o Single Responsibility Principle (SRP)
 * Responsável apenas por validar dados de reservas
 */
export class ReservaValidator implements IValidator<CreateReservaData> {
  validate(data: CreateReservaData): ValidationResult {
    const errors: string[] = [];

    // Validação do nome
    if (!data.nome_hospede || data.nome_hospede.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }
    if (data.nome_hospede && data.nome_hospede.length > 100) {
      errors.push('Nome não pode ter mais de 100 caracteres');
    }

    // Validação do email
    if (!data.email_hospede || !this.isValidEmail(data.email_hospede)) {
      errors.push('Email inválido');
    }

    // Validação do telefone
    if (!data.telefone_hospede || data.telefone_hospede.trim().length === 0) {
      errors.push('Telefone é obrigatório');
    }

    // Validação do número de hóspedes
    if (!data.num_hospedes || data.num_hospedes < 1) {
      errors.push('Deve ter pelo menos 1 hóspede');
    }
    if (data.num_hospedes > 10) {
      errors.push('Não pode exceder 10 hóspedes');
    }

    // Validação das datas
    if (!data.data_checkin) {
      errors.push('Data de check-in é obrigatória');
    } else if (data.data_checkin < new Date()) {
      errors.push('Data de check-in não pode ser no passado');
    }

    if (!data.data_checkout) {
      errors.push('Data de check-out é obrigatória');
    } else if (data.data_checkout <= data.data_checkin) {
      errors.push('Data de check-out deve ser posterior à data de check-in');
    }

    // Validação da mensagem (opcional)
    if (data.mensagem && data.mensagem.length > 500) {
      errors.push('Mensagem não pode exceder 500 caracteres');
    }

    // Validação do quarto_id
    if (!data.quarto_id || data.quarto_id <= 0) {
      errors.push('ID do quarto inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}