import { IRepository } from '../interfaces/IRepository';
import { IService, ValidationResult } from '../interfaces/IService';
import { BaseEntity } from '../types/entities';

/**
 * Classe base abstrata para serviços
 * Aplica o Open-Closed Principle (OCP) - aberta para extensão, fechada para modificação
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por operações CRUD básicas
 */
export abstract class BaseService<T extends BaseEntity, K = number> implements IService<T, K> {
  protected constructor(protected repository: IRepository<T, K>) {}

  async getById(id: K): Promise<T | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      this.handleError('getById', error);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      this.handleError('getAll', error);
      throw error;
    }
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    try {
      const validationResult = await this.validateCreate(data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      return await this.repository.create(data);
    } catch (error) {
      this.handleError('create', error);
      throw error;
    }
  }

  async update(id: K, data: Partial<T>): Promise<T> {
    try {
      const validationResult = await this.validateUpdate(id, data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      return await this.repository.update(id, data);
    } catch (error) {
      this.handleError('update', error);
      throw error;
    }
  }

  async delete(id: K): Promise<void> {
    try {
      const canDelete = await this.canDelete(id);
      if (!canDelete.isValid) {
        throw new Error(canDelete.errors.join(', '));
      }

      await this.repository.delete(id);
    } catch (error) {
      this.handleError('delete', error);
      throw error;
    }
  }

  // Métodos protegidos para extensão (OCP)
  protected abstract validateCreate(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationResult>;
  protected abstract validateUpdate(id: K, data: Partial<T>): Promise<ValidationResult>;
  protected abstract canDelete(id: K): Promise<ValidationResult>;

  protected handleError(operation: string, error: unknown): void {
    console.error(`Error in ${this.constructor.name}.${operation}:`, error);
  }
}

export { BaseService }