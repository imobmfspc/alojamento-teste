import { SupabaseClient } from '@supabase/supabase-js';
import { QuartoService } from '../services/QuartoService';
import { ReservaService } from '../services/ReservaService';
import { NotificationService } from '../services/NotificationService';
import { ImageUploadService } from '../services/ImageUploadService';
import { QuartoRepository } from '../repositories/QuartoRepository';
import { ReservaRepository } from '../repositories/ReservaRepository';
import { QuartoValidator } from '../validators/QuartoValidator';
import { ReservaValidator } from '../validators/ReservaValidator';

/**
 * Factory para criação de serviços seguindo os princípios SOLID
 * Aplica o Dependency Inversion Principle (DIP) - injeta dependências
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por criação de objetos
 * Aplica o Open-Closed Principle (OCP) - pode ser estendido para novos serviços
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, any> = new Map();

  private constructor(private supabase: SupabaseClient) {}

  static getInstance(supabase: SupabaseClient): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(supabase);
    }
    return ServiceFactory.instance;
  }

  getQuartoService(): QuartoService {
    if (!this.services.has('quartoService')) {
      const repository = new QuartoRepository(this.supabase);
      const validator = new QuartoValidator();
      this.services.set('quartoService', new QuartoService(repository, validator));
    }
    return this.services.get('quartoService');
  }

  getReservaService(): ReservaService {
    if (!this.services.has('reservaService')) {
      const repository = new ReservaRepository(this.supabase);
      const validator = new ReservaValidator();
      const notificationService = this.getNotificationService();
      this.services.set('reservaService', new ReservaService(repository, validator, notificationService));
    }
    return this.services.get('reservaService');
  }

  getNotificationService(): NotificationService {
    if (!this.services.has('notificationService')) {
      this.services.set('notificationService', new NotificationService());
    }
    return this.services.get('notificationService');
  }

  getImageUploadService(): ImageUploadService {
    if (!this.services.has('imageUploadService')) {
      this.services.set('imageUploadService', new ImageUploadService());
    }
    return this.services.get('imageUploadService');
  }

  // Método para extensão (OCP)
  registerService<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  getService<T>(name: string): T {
    return this.services.get(name);
  }
}