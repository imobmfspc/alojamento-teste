import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReservaService } from '../../services/ReservaService';
import { IReservaRepository } from '../../interfaces/IRepository';
import { IValidator, INotificationService } from '../../interfaces/IService';
import { Reserva, CreateReservaData } from '../../types/entities';

// Mock do repositório
const mockRepository: IReservaRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByStatus: vi.fn(),
  findByQuarto: vi.fn(),
  findByDateRange: vi.fn()
};

// Mock do validador
const mockValidator: IValidator<CreateReservaData> = {
  validate: vi.fn()
};

// Mock do serviço de notificação
const mockNotificationService: INotificationService = {
  send: vi.fn()
};

describe('ReservaService', () => {
  let reservaService: ReservaService;

  beforeEach(() => {
    vi.clearAllMocks();
    reservaService = new ReservaService(mockRepository, mockValidator, mockNotificationService);
  });

  describe('getByStatus', () => {
    it('should return reservations by status', async () => {
      const mockReservas: Reserva[] = [
        {
          id: 1,
          quarto_id: 1,
          nome_hospede: 'João Silva',
          email_hospede: 'joao@email.com',
          telefone_hospede: '123456789',
          data_checkin: '2023-12-01',
          data_checkout: '2023-12-03',
          num_hospedes: 2,
          estado: 'pendente',
          created_at: '2023-11-01'
        }
      ];

      (mockRepository.findByStatus as any).mockResolvedValue(mockReservas);

      const result = await reservaService.getByStatus('pendente');

      expect(mockRepository.findByStatus).toHaveBeenCalledWith('pendente');
      expect(result).toEqual(mockReservas);
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status and send notification', async () => {
      const mockReserva: Reserva = {
        id: 1,
        quarto_id: 1,
        nome_hospede: 'João Silva',
        email_hospede: 'joao@email.com',
        telefone_hospede: '123456789',
        data_checkin: '2023-12-01',
        data_checkout: '2023-12-03',
        num_hospedes: 2,
        estado: 'confirmada',
        created_at: '2023-11-01'
      };

      (mockRepository.update as any).mockResolvedValue(mockReserva);
      (mockNotificationService.send as any).mockResolvedValue(undefined);

      const result = await reservaService.updateStatus(1, 'confirmada');

      expect(mockRepository.update).toHaveBeenCalledWith(1, { estado: 'confirmada' });
      expect(mockNotificationService.send).toHaveBeenCalledWith({
        type: 'email',
        recipient: 'joao@email.com',
        subject: 'Atualização da Reserva - confirmada',
        message: 'Sua reserva foi confirmada!',
        data: { reserva: mockReserva }
      });
      expect(result).toEqual(mockReserva);
    });

    it('should throw error for invalid status', async () => {
      await expect(reservaService.updateStatus(1, 'invalid')).rejects.toThrow('Status inválido');
    });
  });

  describe('validateReservation', () => {
    it('should validate reservation data', async () => {
      const reservationData: CreateReservaData = {
        quarto_id: 1,
        nome_hospede: 'João Silva',
        email_hospede: 'joao@email.com',
        telefone_hospede: '123456789',
        data_checkin: new Date('2023-12-01'),
        data_checkout: new Date('2023-12-03'),
        num_hospedes: 2
      };

      const validationResult = { isValid: true, errors: [] };
      (mockValidator.validate as any).mockReturnValue(validationResult);

      const result = await reservaService.validateReservation(reservationData);

      expect(mockValidator.validate).toHaveBeenCalledWith(reservationData);
      expect(result).toEqual(validationResult);
    });
  });
});