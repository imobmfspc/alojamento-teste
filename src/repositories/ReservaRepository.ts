import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseRepository } from './SupabaseRepository';
import { IReservaRepository } from '../interfaces/IRepository';
import { Reserva, ReservaStatus } from '../types/entities';

/**
 * Repositório de reservas seguindo os princípios SOLID
 * Aplica o Open-Closed Principle (OCP) - estende SupabaseRepository sem modificá-lo
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por persistência de reservas
 * Aplica o Liskov Substitution Principle (LSP) - pode substituir SupabaseRepository
 */
export class ReservaRepository extends SupabaseRepository<Reserva> implements IReservaRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'reservas');
  }

  async findByStatus(estado: string): Promise<Reserva[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectFields())
        .eq('estado', estado)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data ? data.map(item => this.mapToEntity(item)) : [];
    } catch (error) {
      this.handleError('findByStatus', error);
      throw error;
    }
  }

  async findByQuarto(quartoId: number): Promise<Reserva[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectFields())
        .eq('quarto_id', quartoId)
        .order('data_checkin', { ascending: true });

      if (error) throw error;

      return data ? data.map(item => this.mapToEntity(item)) : [];
    } catch (error) {
      this.handleError('findByQuarto', error);
      throw error;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Reserva[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectFields())
        .gte('data_checkin', startDate.toISOString().split('T')[0])
        .lte('data_checkout', endDate.toISOString().split('T')[0])
        .order('data_checkin', { ascending: true });

      if (error) throw error;

      return data ? data.map(item => this.mapToEntity(item)) : [];
    } catch (error) {
      this.handleError('findByDateRange', error);
      throw error;
    }
  }

  // Implementação dos métodos abstratos (OCP)
  protected getSelectFields(): string {
    return `
      *,
      quarto:quarto_id (
        id,
        nome,
        preco_noite
      )
    `;
  }

  protected mapToEntity(data: any): Reserva {
    return {
      id: data.id,
      quarto_id: data.quarto_id,
      nome_hospede: data.nome_hospede,
      email_hospede: data.email_hospede,
      telefone_hospede: data.telefone_hospede,
      data_checkin: data.data_checkin,
      data_checkout: data.data_checkout,
      num_hospedes: data.num_hospedes,
      mensagem: data.mensagem,
      estado: data.estado as ReservaStatus,
      created_at: data.created_at,
      updated_at: data.updated_at,
      quarto: data.quarto ? {
        id: data.quarto.id,
        nome: data.quarto.nome,
        preco_noite: data.quarto.preco_noite,
        descricao: '',
        capacidade: 0,
        tamanho_m2: 0,
        comodidades: [],
        disponivel: true,
        created_at: ''
      } : undefined
    };
  }

  protected mapToDatabase(entity: Partial<Reserva>): any {
    const mapped: any = {};

    if (entity.quarto_id !== undefined) mapped.quarto_id = entity.quarto_id;
    if (entity.nome_hospede !== undefined) mapped.nome_hospede = entity.nome_hospede;
    if (entity.email_hospede !== undefined) mapped.email_hospede = entity.email_hospede;
    if (entity.telefone_hospede !== undefined) mapped.telefone_hospede = entity.telefone_hospede;
    if (entity.data_checkin !== undefined) mapped.data_checkin = entity.data_checkin;
    if (entity.data_checkout !== undefined) mapped.data_checkout = entity.data_checkout;
    if (entity.num_hospedes !== undefined) mapped.num_hospedes = entity.num_hospedes;
    if (entity.mensagem !== undefined) mapped.mensagem = entity.mensagem;
    if (entity.estado !== undefined) mapped.estado = entity.estado;

    return mapped;
  }
}