/**
 * Interface base para serviços seguindo o padrão Service
 * Aplica o Dependency Inversion Principle (DIP)
 */
export interface IService<T, K = number> {
  getById(id: K): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(data: CreateData<T>): Promise<T>;
  update(id: K, data: UpdateData<T>): Promise<T>;
  delete(id: K): Promise<void>;
}

/**
 * Interface para serviço de quartos
 * Aplica o Interface Segregation Principle (ISP)
 */
export interface IQuartoService extends IService<Quarto> {
  getAvailableRooms(): Promise<Quarto[]>;
  getRoomWithImages(id: number): Promise<QuartoWithImages | null>;
  toggleAvailability(id: number): Promise<Quarto>;
}

/**
 * Interface para serviço de reservas
 * Aplica o Interface Segregation Principle (ISP)
 */
export interface IReservaService extends IService<Reserva> {
  getByStatus(estado: string): Promise<Reserva[]>;
  updateStatus(id: number, status: string): Promise<Reserva>;
  validateReservation(data: CreateReservaData): Promise<ValidationResult>;
}

/**
 * Interface para serviço de propriedades
 * Aplica o Interface Segregation Principle (ISP)
 */
export interface IPropriedadeService extends IService<Propriedade> {
  getWithAmenities(id: number): Promise<PropriedadeWithAmenities | null>;
  updateAmenities(id: number, amenityIds: number[]): Promise<void>;
}

/**
 * Interface para validação
 * Aplica o Single Responsibility Principle (SRP)
 */
export interface IValidator<T> {
  validate(data: T): ValidationResult;
}

/**
 * Interface para upload de imagens
 * Aplica o Single Responsibility Principle (SRP)
 */
export interface IImageUploader {
  upload(file: File, options: UploadOptions): Promise<string>;
  validate(file: File): Promise<ValidationResult>;
  compress(file: File): Promise<File>;
}

/**
 * Interface para notificações
 * Aplica o Single Responsibility Principle (SRP)
 */
export interface INotificationService {
  send(notification: Notification): Promise<void>;
}

// Types auxiliares
type CreateData<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
type UpdateData<T> = Partial<Omit<T, 'id' | 'created_at'>>;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: Record<string, any>;
}

export interface Notification {
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject?: string;
  message: string;
  data?: Record<string, any>;
}