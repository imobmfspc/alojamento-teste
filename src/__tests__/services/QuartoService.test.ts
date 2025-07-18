import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuartoService } from '../../services/QuartoService';
import { IQuartoRepository } from '../../interfaces/IRepository';
import { IValidator } from '../../interfaces/IService';
import { Quarto, CreateQuartoData } from '../../types/entities';

// Mock do repositório
const mockRepository: IQuartoRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByAvailability: vi.fn(),
  findWithImages: vi.fn()
};

// Mock do validador
const mockValidator: IValidator<CreateQuartoData> = {
  validate: vi.fn()
};

describe('QuartoService', () => {
  let quartoService: QuartoService;

  beforeEach(() => {
    vi.clearAllMocks();
    quartoService = new QuartoService(mockRepository, mockValidator);
  });

  describe('getAvailableRooms', () => {
    it('should return available rooms', async () => {
      const mockQuartos: Quarto[] = [
        {
          id: 1,
          nome: 'Quarto 1',
          descricao: 'Descrição do quarto 1',
          preco_noite: 100,
          capacidade: 2,
          tamanho_m2: 20,
          comodidades: ['Wi-Fi'],
          disponivel: true,
          created_at: '2023-01-01'
        }
      ];

      (mockRepository.findByAvailability as any).mockResolvedValue(mockQuartos);

      const result = await quartoService.getAvailableRooms();

      expect(mockRepository.findByAvailability).toHaveBeenCalledWith(true);
      expect(result).toEqual(mockQuartos);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Repository error');
      (mockRepository.findByAvailability as any).mockRejectedValue(error);

      await expect(quartoService.getAvailableRooms()).rejects.toThrow('Repository error');
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle room availability', async () => {
      const mockQuarto: Quarto = {
        id: 1,
        nome: 'Quarto 1',
        descricao: 'Descrição do quarto 1',
        preco_noite: 100,
        capacidade: 2,
        tamanho_m2: 20,
        comodidades: ['Wi-Fi'],
        disponivel: true,
        created_at: '2023-01-01'
      };

      const updatedQuarto = { ...mockQuarto, disponivel: false };

      (mockRepository.findById as any).mockResolvedValue(mockQuarto);
      (mockRepository.update as any).mockResolvedValue(updatedQuarto);

      const result = await quartoService.toggleAvailability(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, { disponivel: false });
      expect(result).toEqual(updatedQuarto);
    });

    it('should throw error if room not found', async () => {
      (mockRepository.findById as any).mockResolvedValue(null);

      await expect(quartoService.toggleAvailability(1)).rejects.toThrow('Quarto não encontrado');
    });
  });

  describe('create', () => {
    it('should create room with valid data', async () => {
      const createData = {
        nome: 'Novo Quarto',
        descricao: 'Descrição do novo quarto',
        preco_noite: 150,
        capacidade: 2,
        tamanho_m2: 25,
        comodidades: ['Wi-Fi', 'TV'],
        disponivel: true
      };

      const mockQuarto: Quarto = {
        id: 1,
        ...createData,
        created_at: '2023-01-01'
      };

      (mockValidator.validate as any).mockReturnValue({ isValid: true, errors: [] });
      (mockRepository.create as any).mockResolvedValue(mockQuarto);

      const result = await quartoService.create(createData);

      expect(mockValidator.validate).toHaveBeenCalledWith(createData);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockQuarto);
    });

    it('should throw error with invalid data', async () => {
      const createData = {
        nome: '',
        descricao: 'Descrição do novo quarto',
        preco_noite: 150,
        capacidade: 2,
        tamanho_m2: 25,
        comodidades: ['Wi-Fi', 'TV'],
        disponivel: true
      };

      (mockValidator.validate as any).mockReturnValue({ 
        isValid: false, 
        errors: ['Nome deve ter pelo menos 3 caracteres'] 
      });

      await expect(quartoService.create(createData)).rejects.toThrow('Nome deve ter pelo menos 3 caracteres');
    });
  });
});