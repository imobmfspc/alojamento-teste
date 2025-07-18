import { INotificationService, Notification } from '../interfaces/IService';

/**
 * Serviço de notificações seguindo os princípios SOLID
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por envio de notificações
 * Aplica o Open-Closed Principle (OCP) - pode ser estendido para novos tipos de notificação
 */
export class NotificationService implements INotificationService {
  private handlers: Map<string, NotificationHandler> = new Map();

  constructor() {
    // Registrar handlers padrão
    this.registerHandler('email', new EmailNotificationHandler());
    this.registerHandler('sms', new SMSNotificationHandler());
    this.registerHandler('push', new PushNotificationHandler());
  }

  async send(notification: Notification): Promise<void> {
    const handler = this.handlers.get(notification.type);
    if (!handler) {
      throw new Error(`Notification handler not found for type: ${notification.type}`);
    }

    try {
      await handler.send(notification);
    } catch (error) {
      console.error(`Failed to send ${notification.type} notification:`, error);
      throw error;
    }
  }

  // Permite extensão sem modificação (OCP)
  registerHandler(type: string, handler: NotificationHandler): void {
    this.handlers.set(type, handler);
  }
}

/**
 * Interface para handlers de notificação
 * Aplica o Interface Segregation Principle (ISP)
 */
export interface NotificationHandler {
  send(notification: Notification): Promise<void>;
}

/**
 * Handler para notificações por email
 * Aplica o Single Responsibility Principle (SRP)
 */
class EmailNotificationHandler implements NotificationHandler {
  async send(notification: Notification): Promise<void> {
    // Implementação do envio de email
    // Por agora, apenas log para demonstração
    console.log('Sending email notification:', {
      to: notification.recipient,
      subject: notification.subject,
      message: notification.message
    });

    // Aqui seria integrado com um serviço de email real
    // como SendGrid, AWS SES, etc.
  }
}

/**
 * Handler para notificações por SMS
 * Aplica o Single Responsibility Principle (SRP)
 */
class SMSNotificationHandler implements NotificationHandler {
  async send(notification: Notification): Promise<void> {
    // Implementação do envio de SMS
    console.log('Sending SMS notification:', {
      to: notification.recipient,
      message: notification.message
    });

    // Aqui seria integrado com um serviço de SMS real
    // como Twilio, AWS SNS, etc.
  }
}

/**
 * Handler para notificações push
 * Aplica o Single Responsibility Principle (SRP)
 */
class PushNotificationHandler implements NotificationHandler {
  async send(notification: Notification): Promise<void> {
    // Implementação do envio de push notification
    console.log('Sending push notification:', {
      to: notification.recipient,
      message: notification.message
    });

    // Aqui seria integrado com um serviço de push real
    // como Firebase Cloud Messaging, etc.
  }
}