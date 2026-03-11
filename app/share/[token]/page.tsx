import { notFound } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { createClient, createPublicClient } from '@/lib/supabase-server'
import { Badge } from '@/components/ui/badge'
import { PublicTechAccordion } from './PublicTechAccordion'
import { CopyButton } from './CopyButton'

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const publicSupabase = createPublicClient()

  const { data: tech } = await publicSupabase
    .from('technologies')
    .select('*')
    .eq('public_token', token)
    .single()

  if (!tech) notFound()

  const [{ data: commands }, { data: links }, { data: notes }] = await Promise.all([
    publicSupabase.from('commands').select('*').eq('technology_id', tech.id).order('created_at', { ascending: false }),
    publicSupabase.from('links').select('*').eq('technology_id', tech.id).order('created_at', { ascending: false }),
    publicSupabase.from('notes').select('*').eq('technology_id', tech.id).order('created_at', { ascending: false }),
  ])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <header className="h-14 border-b border-border/40 bg-card/40 backdrop-blur-sm flex items-center px-6">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">Dev Knowledge Hub</span>
        </Link>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="border-b border-border/50 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{tech.name}</h1>
              {tech.description && (
                <p className="text-muted-foreground mt-1 text-sm">{tech.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              {user && <CopyButton token={token} />}
              <Badge variant="secondary">Read-only</Badge>
            </div>
          </div>
        </div>

        <PublicTechAccordion
          commands={commands ?? []}
          links={links ?? []}
          notes={notes ?? []}
        />
      </div>
    </div>
  )
}
