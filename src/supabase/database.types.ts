export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      quartos: {
        Row: {
          id: number
          nome: string
          descricao: string
          capacidade: number
          preco_noite: number
          tamanho_m2: number
          created_at: string
          comodidades: string[]
          disponivel: boolean
        }
        Insert: {
          id?: number
          nome: string
          descricao: string
          capacidade: number
          preco_noite: number
          tamanho_m2: number
          created_at?: string
          comodidades?: string[]
          disponivel?: boolean
        }
        Update: {
          id?: number
          nome?: string
          descricao?: string
          capacidade?: number
          preco_noite?: number
          tamanho_m2?: number
          created_at?: string
          comodidades?: string[]
          disponivel?: boolean
        }
      }
      reservas: {
        Row: {
          id: number
          quarto_id: number
          nome_hospede: string
          email_hospede: string
          telefone_hospede: string
          data_checkin: string
          data_checkout: string
          num_hospedes: number
          mensagem: string | null
          created_at: string
          estado: string
        }
        Insert: {
          id?: number
          quarto_id: number
          nome_hospede: string
          email_hospede: string
          telefone_hospede: string
          data_checkin: string
          data_checkout: string
          num_hospedes: number
          mensagem?: string | null
          created_at?: string
          estado?: string
        }
        Update: {
          id?: number
          quarto_id?: number
          nome_hospede?: string
          email_hospede?: string
          telefone_hospede?: string
          data_checkin?: string
          data_checkout?: string
          num_hospedes?: number
          mensagem?: string | null
          created_at?: string
          estado?: string
        }
      }
      imagens_quartos: {
        Row: {
          id: number
          quarto_id: number
          url: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: number
          quarto_id: number
          url: string
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: number
          quarto_id?: number
          url?: string
          ordem?: number
          created_at?: string
        }
      }
      propriedade: {
        Row: {
          id: number
          nome: string
          descricao: string
          morada: string
          sobre_footer: string
          telefone: string
          email: string
          horario_checkin: string
          horario_checkout: string
          horario_rececao: string
          hero_image_url: string | null
          created_at: string
          titulo_quartos: string | null
          descricao_quartos: string | null
          titulo_comodidades: string | null
          descricao_comodidades: string | null
          link_externo_url: string | null
          link_externo_texto: string | null
        }
        Insert: {
          id?: number
          nome: string
          descricao: string
          morada: string
          sobre_footer?: string
          telefone?: string
          email?: string
          horario_checkin?: string
          horario_checkout?: string
          horario_rececao?: string
          hero_image_url?: string | null
          created_at?: string
          titulo_quartos?: string | null
          descricao_quartos?: string | null
          titulo_comodidades?: string | null
          descricao_comodidades?: string | null
          link_externo_url?: string | null
          link_externo_texto?: string | null
        }
        Update: {
          id?: number
          nome?: string
          descricao?: string
          morada?: string
          sobre_footer?: string
          telefone?: string
          email?: string
          horario_checkin?: string
          horario_checkout?: string
          horario_rececao?: string
          hero_image_url?: string | null
          created_at?: string
          titulo_quartos?: string | null
          descricao_quartos?: string | null
          titulo_comodidades?: string | null
          descricao_comodidades?: string | null
          link_externo_url?: string | null
          link_externo_texto?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}