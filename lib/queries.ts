import { createClient } from './supabase-browser'
import { Technology, Command, Link, Note } from './supabase'

// Technologies
export async function fetchTechnologies(): Promise<Technology[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('technologies')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchTechnology(id: string): Promise<Technology> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('technologies')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createTechnology(payload: { name: string; description?: string }): Promise<Technology> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('technologies')
    .insert({ ...payload, user_id: user!.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTechnology(id: string, payload: { name: string; description?: string }): Promise<Technology> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('technologies')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTechnology(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('technologies').delete().eq('id', id)
  if (error) throw error
}

export async function generatePublicToken(id: string): Promise<Technology> {
  const supabase = createClient()
  const token = crypto.randomUUID()
  const { data, error } = await supabase
    .from('technologies')
    .update({ public_token: token })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function revokePublicToken(id: string): Promise<Technology> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('technologies')
    .update({ public_token: null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Commands
export async function fetchCommands(technologyId: string): Promise<Command[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('commands')
    .select('*')
    .eq('technology_id', technologyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createCommand(payload: { technology_id: string; command: string; description?: string }): Promise<Command> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('commands')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCommand(id: string, payload: { command: string; description?: string }): Promise<Command> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('commands')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCommand(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('commands').delete().eq('id', id)
  if (error) throw error
}

// Links
export async function fetchLinks(technologyId: string): Promise<Link[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('technology_id', technologyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createLink(payload: { technology_id: string; url: string; title?: string }): Promise<Link> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('links')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLink(id: string, payload: { url: string; title?: string }): Promise<Link> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('links')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLink(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('links').delete().eq('id', id)
  if (error) throw error
}

// Notes
export async function fetchNotes(technologyId: string): Promise<Note[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('technology_id', technologyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createNote(payload: { technology_id: string; content: string }): Promise<Note> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notes')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateNote(id: string, payload: { content: string }): Promise<Note> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}
