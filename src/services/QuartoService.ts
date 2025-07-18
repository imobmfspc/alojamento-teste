import { BaseService } from './BaseService';
import { IQuartoService, ValidationResult } from '../interfaces/IService';
import { IQuartoRepository } from '../interfaces/IRepository';
import { IValidator } from '../interfaces/IService';
import { Quarto, QuartoWithImages, CreateQuartoData } from '../types/entities';

/**
 * Serviço de quartos seguindo os princípios SOLID
 * Aplica o Open-Closed Principle (OCP) - estende BaseService sem modificá-lo
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por lógica de negócio de quartos
 * Aplica o Dependency Inversion Principle (DIP) - depende de abstrações, não de implementações
 */
export class QuartoService extends BaseService<Quarto> implements IQuartoService {
  constructor(
    protected repository: IQuartoRepository,
    private validator: IValidator<CreateQuartoData>
  ) {
    super(repository);
  }

  async getAvailableRooms(): Promise<Quarto[]> {
    try {
      return await this.repository.findByAvailability(true);
    } catch (error) {
      this.handleError('getAvailableRooms', error);
      throw error;
    }
  }

  async getRoomWithImages(id: number): Promise<QuartoWithImages | null> {
    try {
      return await this.repository.findWithImages(id);
    } catch (error) {
      this.handleError('getRoomWithImages', error);
      throw error;
    }
  }

  async toggleAvailability(id: number): Promise<Quarto> {
    try {
      const quarto = await this.repository.findById(id);
      if (!quarto) {
        throw new Error('Quarto não encontrado');
      }

      return await this.repository.update(id, { 
        disponivel: !quarto.disponivel 
      } as Partial<Quarto>);
    } catch (error) {
      this.handleError('toggleAvailability', error);
      throw error;
    }
  }

  // Implementação dos métodos abstratos (OCP)
  protected async validateCreate(data: Omit<Quarto, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationResult> {
    return this.validator.validate(data as CreateQuartoData);
  }

  protected async validateUpdate(id: number, data: Partial<Quarto>): Promise<ValidationResult> {
    const errors: string[] = [];

    // Verificar se o quarto existe
    const existingQuarto = await this.repository.findById(id);
    if (!existingQuarto) {
      errors.push('Quarto não encontrado');
    }

    // Validações específicas de atualização
    if (data.preco_noite !== undefined && data.preco_noite <= 0) {
      errors.push('Preço por noite deve ser maior que zero');
    }

    if (data.capacidade !== undefined && data.capacidade <= 0) {
      errors.push('Capacidade deve ser maior que zero');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  protected async canDelete(id: number): Promise<ValidationResult> {
    const errors: string[] = [];

    // Verificar se existem reservas futuras para este quarto
    // Esta lógica seria implementada com uma dependência do ReservaRepository
    // Por agora, assumimos que é possível deletar
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}