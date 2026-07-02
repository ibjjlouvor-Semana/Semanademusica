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
      inscricoes: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string
          data_nascimento: string
          cidade: string
          estado: string
          igreja: string | null
          instrumento_oficina: string | null
          nivel_experiencia: string | null
          opcao_escolhida: string
          tipo_participacao: string | null
          detalhe_participacao: string | null
          descricao_experiencia: string | null
          hospedagem: string | null
          camisa_estilo: string | null
          camisa_tipo: string | null
          camisa_tamanho: string | null
          camisa_obs: string | null
          valor_total: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          telefone: string
          data_nascimento: string
          cidade: string
          estado: string
          igreja?: string | null
          instrumento_oficina?: string | null
          nivel_experiencia?: string | null
          opcao_escolhida: string
          tipo_participacao?: string | null
          detalhe_participacao?: string | null
          descricao_experiencia?: string | null
          hospedagem?: string | null
          camisa_estilo?: string | null
          camisa_tipo?: string | null
          camisa_tamanho?: string | null
          camisa_obs?: string | null
          valor_total: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string
          data_nascimento?: string
          cidade?: string
          estado?: string
          igreja?: string | null
          instrumento_oficina?: string | null
          nivel_experiencia?: string | null
          opcao_escolhida?: string
          tipo_participacao?: string | null
          detalhe_participacao?: string | null
          descricao_experiencia?: string | null
          hospedagem?: string | null
          camisa_estilo?: string | null
          camisa_tipo?: string | null
          camisa_tamanho?: string | null
          camisa_obs?: string | null
          valor_total?: number
          status?: string
          created_at?: string
        }
      }
      configuracoes: {
        Row: {
          id: string
          chave: string
          valor: Json
          created_at: string
        }
        Insert: {
          id?: string
          chave: string
          valor: Json
          created_at?: string
        }
        Update: {
          id?: string
          chave?: string
          valor?: Json
          created_at?: string
        }
      }
      financeiro: {
        Row: {
          id: string
          descricao: string
          tipo: string
          centro_custo: string
          valor: number
          data: string
          created_at: string
        }
        Insert: {
          id?: string
          descricao: string
          tipo: string
          centro_custo: string
          valor: number
          data: string
          created_at?: string
        }
        Update: {
          id?: string
          descricao?: string
          tipo?: string
          centro_custo?: string
          valor?: number
          data?: string
          created_at?: string
        }
      }
      oficinas: {
        Row: {
          id: string
          nome: string
          professor: string
          vagas_limite: number
          vagas_ocupadas: number
        }
        Insert: {
          id?: string
          nome: string
          professor: string
          vagas_limite: number
          vagas_ocupadas?: number
        }
        Update: {
          id?: string
          nome?: string
          professor?: string
          vagas_limite?: number
          vagas_ocupadas?: number
        }
      }
      videos_apresentacao: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          url: string
          youtube_id: string
          created_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          url: string
          youtube_id: string
          created_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          url?: string
          youtube_id?: string
          created_at?: string
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
