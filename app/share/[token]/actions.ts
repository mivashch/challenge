'use server'

import { redirect } from 'next/navigation'
import { createClient, createPublicClient } from '@/lib/supabase-server'

export async function copyTechnology(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const publicSupabase = createPublicClient()

  const { data: tech } = await publicSupabase
    .from('technologies')
    .select('*')
    .eq('public_token', token)
    .single()

  if (!tech) throw new Error('Technology not found')

  const [{ data: commands }, { data: links }, { data: notes }] = await Promise.all([
    publicSupabase.from('commands').select('*').eq('technology_id', tech.id),
    publicSupabase.from('links').select('*').eq('technology_id', tech.id),
    publicSupabase.from('notes').select('*').eq('technology_id', tech.id),
  ])

  const { data: newTech, error } = await supabase
    .from('technologies')
    .insert({ name: tech.name, description: tech.description, user_id: user.id })
    .select()
    .single()

  if (error || !newTech) throw new Error('Failed to create technology')

  await Promise.all([
    commands?.length
      ? supabase.from('commands').insert(
          commands.map((c) => ({ command: c.command, description: c.description, technology_id: newTech.id }))
        )
      : Promise.resolve(),
    links?.length
      ? supabase.from('links').insert(
          links.map((l) => ({ url: l.url, title: l.title, technology_id: newTech.id }))
        )
      : Promise.resolve(),
    notes?.length
      ? supabase.from('notes').insert(
          notes.map((n) => ({ content: n.content, technology_id: newTech.id }))
        )
      : Promise.resolve(),
  ])

  redirect(`/technologies/${newTech.id}`)
}
