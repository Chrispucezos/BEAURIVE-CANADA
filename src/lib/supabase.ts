import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {

      user_profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'admin' | 'client'
          company_name: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string
          phone?: string | null
          role?: 'admin' | 'client'
          company_name?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }

      contact_submissions: {
        Row: {
          id: number
          name: string
          email: string
          phone: string | null
          service_type: string | null
          message: string
          status: 'nouveau' | 'en-cours' | 'traite' | 'archive'
          created_at: string
        }
        Insert: {
          name: string
          email: string
          phone?: string | null
          service_type?: string | null
          message: string
          status?: 'nouveau' | 'en-cours' | 'traite' | 'archive'
        }
        Update: Partial<Database['public']['Tables']['contact_submissions']['Insert']>
      }

      quote_submissions: {
        Row: {
          id: number
          name: string
          email: string
          phone: string | null
          service_type: string
          details: string | null
          estimated_price: number | null
          status: 'nouveau' | 'en-cours' | 'accepte' | 'refuse' | 'archive'
          created_at: string
        }
        Insert: {
          name: string
          email: string
          phone?: string | null
          service_type: string
          details?: string | null
          estimated_price?: number | null
          status?: 'nouveau' | 'en-cours' | 'accepte' | 'refuse' | 'archive'
        }
        Update: Partial<Database['public']['Tables']['quote_submissions']['Insert']>
      }

      projects: {
        Row: {
          id: number
          client_id: string
          title: string
          description: string | null
          type: string
          status: string
          progress_percent: number
          start_date: string | null
          end_date: string | null
          created_at: string
        }
        Insert: {
          client_id: string
          title: string
          description?: string | null
          type?: string
          status?: string
          progress_percent?: number
          start_date?: string | null
          end_date?: string | null
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }

      project_tasks: {
        Row: {
          id: number
          project_id: number
          title: string
          status: 'en-attente' | 'en-cours' | 'complete'
          assigned_to: string | null
          due_date: string | null
          created_at: string
        }
        Insert: {
          project_id: number
          title: string
          status?: 'en-attente' | 'en-cours' | 'complete'
          assigned_to?: string | null
          due_date?: string | null
        }
        Update: Partial<Database['public']['Tables']['project_tasks']['Insert']>
      }

      contracts: {
        Row: {
          id: number
          client_id: string
          title: string
          content: string
          status: string
          client_signature: string | null
          admin_signature: string | null
          signed_at: string | null
          amount: number | null
          created_at: string
        }
        Insert: {
          client_id: string
          title: string
          content?: string
          status?: string
          client_signature?: string | null
          admin_signature?: string | null
          signed_at?: string | null
          amount?: number | null
        }
        Update: Partial<Database['public']['Tables']['contracts']['Insert']>
      }

      invoices: {
        Row: {
          id: number
          client_id: string
          invoice_number: string
          amount: number
          tax: number
          status: 'non-paye' | 'paye' | 'en-retard' | 'annule'
          due_date: string | null
          paid_at: string | null
          description: string | null
          items: any
          created_at: string
        }
        Insert: {
          client_id: string
          invoice_number: string
          amount: number
          tax?: number
          status?: 'non-paye' | 'paye' | 'en-retard' | 'annule'
          due_date?: string | null
          paid_at?: string | null
          description?: string | null
          items?: any
        }
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }

      schedules: {
        Row: {
          id: number
          client_id: string
          title: string
          description: string | null
          scheduled_at: string
          duration_minutes: number
          status: 'planifie' | 'confirme' | 'annule' | 'complete'
          created_at: string
        }
        Insert: {
          client_id: string
          title: string
          description?: string | null
          scheduled_at: string
          duration_minutes?: number
          status?: 'planifie' | 'confirme' | 'annule' | 'complete'
        }
        Update: Partial<Database['public']['Tables']['schedules']['Insert']>
      }

    }
  }
}
