import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'admin' | 'client'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      contact_submissions: {
        Row: {
          id: number
          name: string
          email: string
          phone: string | null
          service_type: string | null
          message: string
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contact_submissions']['Row'], 'id' | 'created_at'>
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
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quote_submissions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quote_submissions']['Insert']>
      }
      client_profiles: {
        Row: {
          id: number
          user_id: string
          company_name: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['client_profiles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['client_profiles']['Insert']>
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
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
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
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contracts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contracts']['Insert']>
      }
      invoices: {
        Row: {
          id: number
          client_id: string
          invoice_number: string
          amount: number
          tax: number
          status: string
          due_date: string | null
          paid_at: string | null
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at'>
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
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['schedules']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['schedules']['Insert']>
      }
    }
  }
}
