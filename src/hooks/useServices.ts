import { useMemo } from 'react';
import { supabase } from '../supabase/client';
import { ServiceFactory } from '../factories/ServiceFactory';
import { QuartoService } from '../services/QuartoService';
import { ReservaService } from '../services/ReservaService';
import { NotificationService } from '../services/NotificationService';
import { ImageUploadService } from '../services/ImageUploadService';

/**
 * Hook personalizado para acesso aos serviços
 * Aplica o Dependency Inversion Principle (DIP) - componentes dependem de abstrações
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por fornecer serviços
 */
export function useServices() {
  const serviceFactory = useMemo(() => {
    return ServiceFactory.getInstance(supabase);
  }, []);

  const quartoService = useMemo(() => {
    return serviceFactory.getQuartoService();
  }, [serviceFactory]);

  const reservaService = useMemo(() => {
    return serviceFactory.getReservaService();
  }, [serviceFactory]);

  const notificationService = useMemo(() => {
    return serviceFactory.getNotificationService();
  }, [serviceFactory]);

  const imageUploadService = useMemo(() => {
    return serviceFactory.getImageUploadService();
  }, [serviceFactory]);

  return {
    quartoService,
    reservaService,
    notificationService,
    imageUploadService
  };
}

/**
 * Hook específico para serviço de quartos
 * Aplica o Interface Segregation Principle (ISP) - interface específica
 */
export function useQuartoService(): QuartoService {
  const { quartoService } = useServices();
  return quartoService;
}

/**
 * Hook específico para serviço de reservas
 * Aplica o Interface Segregation Principle (ISP) - interface específica
 */
export function useReservaService(): ReservaService {
  const { reservaService } = useServices();
  return reservaService;
}

/**
 * Hook específico para serviço de notificações
 * Aplica o Interface Segregation Principle (ISP) - interface específica
 */
export function useNotificationService(): NotificationService {
  const { notificationService } = useServices();
  return notificationService;
}

/**
 * Hook específico para serviço de upload de imagens
 * Aplica o Interface Segregation Principle (ISP) - interface específica
 */
export function useImageUploadService(): ImageUploadService {
  const { imageUploadService } = useServices();
  return imageUploadService;
}