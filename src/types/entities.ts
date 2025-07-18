/**
 * Tipos de entidades do domínio
 * Seguindo o Domain-Driven Design (DDD)
 */

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at?: string;
}

export interface Quarto extends BaseEntity {
  nome: string;
  descricao: string;
  preco_noite: number;
  capacidade: number;
  tamanho_m2: number;
  comodidades: string[];
  disponivel: boolean;
}

export interface QuartoWithImages extends Quarto {
  imagens: ImagemQuarto[];
}

export interface ImagemQuarto extends BaseEntity {
  quarto_id: number;
  url: string;
  ordem: number;
}

export interface Reserva extends BaseEntity {
  quarto_id: number;
  nome_hospede: string;
  email_hospede: string;
  telefone_hospede: string;
  data_checkin: string;
  data_checkout: string;
  num_hospedes: number;
  mensagem?: string;
  estado: ReservaStatus;
  quarto?: Quarto;
}

export interface Propriedade extends BaseEntity {
  nome: string;
  descricao: string;
  morada: string;
  sobre_footer: string;
  telefone: string;
  email: string;
  horario_checkin: string;
  horario_checkout: string;
  horario_rececao: string;
  hero_image_url?: string;
  titulo_quartos?: string;
  descricao_quartos?: string;
  titulo_comodidades?: string;
  descricao_comodidades?: string;
  link_externo_url?: string;
  link_externo_texto?: string;
}

export interface PropriedadeWithAmenities extends Propriedade {
  comodidades: Comodidade[];
}

export interface Comodidade extends BaseEntity {
  nome: string;
  descricao: string;
  icone: string;
}

export type ReservaStatus = 'pendente' | 'confirmada' | 'cancelada' | 'concluida';

export interface CreateReservaData {
  quarto_id: number;
  nome_hospede: string;
  email_hospede: string;
  telefone_hospede: string;
  data_checkin: Date;
  data_checkout: Date;
  num_hospedes: number;
  mensagem?: string;
}

export interface CreateQuartoData {
  nome: string;
  descricao: string;
  preco_noite: number;
  capacidade: number;
  tamanho_m2: number;
  comodidades: string[];
  disponivel: boolean;
  imagens: { url: string; ordem: number }[];
}