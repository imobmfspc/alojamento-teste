import { BaseService } from './BaseService';
import { IReservaService, ValidationResult } from '../interfaces/IService';
import { IReservaRepository } from '../interfaces/IRepository';
import { IValidator, INotificationService } from '../interfaces/IService';
import { Reserva, CreateReservaData, ReservaStatus } from '../types/entities';

/**
 * Serviço de reservas seguindo os princípios SOLID
 * Aplica o Open-Closed Principle (OCP) - estende BaseService sem modificá-lo
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por lógica de negócio de reservas
 * Aplica o Dependency Inversion Principle (DIP) - depende de abstrações
 */
export class ReservaService extends BaseService<Reserva> implements IReservaService {
  constructor(
    protected repository: IReservaRepository,
    private validator: IValidator<CreateReservaData>,
    private notificationService: INotificationService
  ) {
    super(repository);
  }

  async getByStatus(estado: string): Promise<Reserva[]> {
    try {
      return await this.repository.findByStatus(estado);
    } catch (error) {
      this.handleError('getByStatus', error);
      throw error;
    }
  }

  async updateStatus(id: number, status: string): Promise<Reserva> {
    try {
      const validStatuses: ReservaStatus[] = ['pendente', 'confirmada', 'cancelada', 'concluida'];
      if (!validStatuses.includes(status as ReservaStatus)) {
        throw new Error('Status inválido');
      }

      const reserva = await this.repository.update(id, { 
        estado: status as ReservaStatus 
      } as Partial<Reserva>);

      // Enviar notificação (SRP - responsabilidade delegada)
      await this.sendStatusNotification(reserva, status as ReservaStatus);

      return reserva;
    } catch (error) {
      this.handleError('updateStatus', error);
      throw error;
    }
  }

  async validateReservation(data: CreateReservaData): Promise<ValidationResult> {
    return this.validator.validate(data);
  }

  // Implementação dos métodos abstratos (OCP)
  protected async validateCreate(data: Omit<Reserva, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationResult> {
    const createData: CreateReservaData = {
      quarto_id: data.quarto_id,
      nome_hospede: data.nome_hospede,
      email_hospede: data.email_hospede,
      telefone_hospede: data.telefone_hospede,
      data_checkin: new Date(data.data_checkin),
      data_checkout: new Date(data.data_checkout),
      num_hospedes: data.num_hospedes,
      mensagem: data.mensagem
    };

    return this.validator.validate(createData);
  }

  protected async validateUpdate(id: number, data: Partial<Reserva>): Promise<ValidationResult> {
    const errors: string[] = [];

    const existingReserva = await this.repository.findById(id);
    if (!existingReserva) {
      errors.push('Reserva não encontrada');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  protected async canDelete(id: number): Promise<ValidationResult> {
    const errors: string[] = [];

    const reserva = await this.repository.findById(id);
    if (!reserva) {
      errors.push('Reserva não encontrada');
      return { isValid: false, errors };
    }

    // Não permitir deletar reservas confirmadas ou concluídas
    if (['confirmada', 'concluida'].includes(reserva.estado)) {
      errors.push('Não é possível deletar reservas confirmadas ou concluídas');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async sendStatusNotification(reserva: Reserva, status: ReservaStatus): Promise<void> {
    try {
      const messages = {
        confirmada: 'Sua reserva foi confirmada!',
        cancelada: 'Sua reserva foi cancelada.',
        concluida: 'Obrigado por sua estadia!'
      };

      if (messages[status]) {
        await this.notificationService.send({
          type: 'email',
          recipient: reserva.email_hospede,
          subject: `Atualização da Reserva - ${status}`,
          message: messages[status],
          data: { reserva }
        });
      }
    } catch (error) {
      // Log error but don't throw - notification failure shouldn't break the main operation
      console.error('Failed to send notification:', error);
    }
  }
}