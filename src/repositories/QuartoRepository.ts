import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseRepository } from './SupabaseRepository';
import { IQuartoRepository } from '../interfaces/IRepository';
import { Quarto, QuartoWithImages, ImagemQuarto } from '../types/entities';

/**
 * Repositório de quartos seguindo os princípios SOLID
 * Aplica o Open-Closed Principle (OCP) - estende SupabaseRepository sem modificá-lo
 * Aplica o Single Responsibility Principle (SRP) - responsável apenas por persistência de quartos
 * Aplica o Liskov Substitution Principle (LSP) - pode substituir SupabaseRepository
 */
export class QuartoRepository extends SupabaseRepository<Quarto> implements IQuartoRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'quartos');
  }

  async findByAvailability(disponivel: boolean): Promise<Quarto[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectFields())
        .eq('disponivel', disponivel)
        .order('id', { ascending: true });

      if (error) throw error;

      return data ? data.map(item => this.mapToEntity(item)) : [];
    } catch (error) {
      this.handleError('findByAvailability', error);
      throw error;
    }
  }

  async findWithImages(id: number): Promise<QuartoWithImages | null> {
    try {
      // Buscar quarto
      const quarto = await this.findById(id);
      if (!quarto) return null;

      // Buscar imagens
      const { data: imagensData, error: imagensError } = await this.supabase
        .from('imagens_quartos')
        .select('*')
        .eq('quarto_id', id)
        .order('ordem', { ascending: true });

      if (imagensError) throw imagensError;

      const imagens: ImagemQuarto[] = imagensData ? imagensData.map(img => ({
        id: img.id,
        quarto_id: img.quarto_id,
        url: img.url,
        ordem: img.ordem,
        created_at: img.created_at
      })) : [];

      return {
        ...quarto,
        imagens
      };
    } catch (error) {
      this.handleError('findWithImages', error);
      throw error;
    }
  }

  // Implementação dos métodos abstratos (OCP)
  protected getSelectFields(): string {
    return '*';
  }

  protected mapToEntity(data: any): Quarto {
    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao,
      preco_noite: data.preco_noite,
      capacidade: data.capacidade,
      tamanho_m2: data.tamanho_m2,
      comodidades: data.comodidades || [],
      disponivel: data.disponivel,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  protected mapToDatabase(entity: Partial<Quarto>): any {
    const mapped: any = {};

    if (entity.nome !== undefined) mapped.nome = entity.nome;
    if (entity.descricao !== undefined) mapped.descricao = entity.descricao;
    if (entity.preco_noite !== undefined) mapped.preco_noite = entity.preco_noite;
    if (entity.capacidade !== undefined) mapped.capacidade = entity.capacidade;
    if (entity.tamanho_m2 !== undefined) mapped.tamanho_m2 = entity.tamanho_m2;
    if (entity.comodidades !== undefined) mapped.comodidades = entity.comodidades;
    if (entity.disponivel !== undefined) mapped.disponivel = entity.disponivel;

    return mapped;
  }
}