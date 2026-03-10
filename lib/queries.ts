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

// Global Search
export type SearchResults = {
  technologies: { id: string; name: string; description: string | null }[]
  commands: { id: string; command: string; description: string | null; technology_id: string; technology_name: string }[]
  links: { id: string; url: string; title: string | null; technology_id: string; technology_name: string }[]
  notes: { id: string; content: string; technology_id: string; technology_name: string }[]
}

export async function globalSearch(query: string): Promise<SearchResults> {
  const supabase = createClient()
  const q = `%${query}%`

  const [techRes, cmdRes, linkRes, noteRes] = await Promise.all([
    supabase.from('technologies').select('id, name, description').ilike('name', q),
    supabase.from('commands').select('id, command, description, technology_id, technologies(name)').ilike('command', q),
    supabase.from('links').select('id, url, title, technology_id, technologies(name)').or(`url.ilike.${q},title.ilike.${q}`),
    supabase.from('notes').select('id, content, technology_id, technologies(name)').ilike('content', q),
  ])

  return {
    technologies: techRes.data ?? [],
    commands: (cmdRes.data ?? []).map((c: any) => ({ ...c, technology_name: c.technologies?.name ?? '' })),
    links: (linkRes.data ?? []).map((l: any) => ({ ...l, technology_name: l.technologies?.name ?? '' })),
    notes: (noteRes.data ?? []).map((n: any) => ({ ...n, technology_name: n.technologies?.name ?? '' })),
  }
}
