import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Technology = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export type Command = {
  id: string
  technology_id: string
  command: string
  description: string | null
  created_at: string
}

export type Link = {
  id: string
  technology_id: string
  url: string
  title: string | null
  created_at: string
}

export type Note = {
  id: string
  technology_id: string
  content: string
  created_at: string
}
