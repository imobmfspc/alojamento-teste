import { SupabaseClient } from '@supabase/supabase-js';
import { IRepository } from '../interfaces/IRepository';
import { BaseEntity } from '../types/entities';

/**
 * Classe base abstrata para repositórios Supabase
 * Aplica o Open-Closed Principle (OCP) - aberta para extensão, fechada para modificação
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por operações de dados
 * Aplica o Dependency Inversion Principle (DIP) - depende da abstração SupabaseClient
 */
export abstract class SupabaseRepository<T extends BaseEntity, K = number> implements IRepository<T, K> {
  protected constructor(
    protected supabase: SupabaseClient,
    protected tableName: string
  ) {}

  async findById(id: K): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectFields())
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (error) {
      this.handleError('findById', error);
      throw error;
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectFields())
        .order('id', { ascending: true });

      if (error) throw error;

      return data ? data.map(item => this.mapToEntity(item)) : [];
    } catch (error) {
      this.handleError('findAll', error);
      throw error;
    }
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(this.mapToDatabase(entity))
        .select(this.getSelectFields())
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create entity');

      return this.mapToEntity(data);
    } catch (error) {
      this.handleError('create', error);
      throw error;
    }
  }

  async update(id: K, entity: Partial<T>): Promise<T> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(this.mapToDatabase(entity))
        .eq('id', id)
        .select(this.getSelectFields())
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update entity');

      return this.mapToEntity(data);
    } catch (error) {
      this.handleError('update', error);
      throw error;
    }
  }

  async delete(id: K): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      this.handleError('delete', error);
      throw error;
    }
  }

  // Métodos abstratos para extensão (OCP)
  protected abstract getSelectFields(): string;
  protected abstract mapToEntity(data: any): T;
  protected abstract mapToDatabase(entity: Partial<T>): any;

  protected handleError(operation: string, error: unknown): void {
    console.error(`Error in ${this.constructor.name}.${operation}:`, error);
  }
}

export { SupabaseRepository }