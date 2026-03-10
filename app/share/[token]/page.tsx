import { notFound } from 'next/navigation'
import { ExternalLink, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { createClient, createPublicClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PublicNoteCard } from '@/components/notes/PublicNoteCard'
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{tech.name}</h1>
            {tech.description && (
              <p className="text-muted-foreground mt-1">{tech.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            {user && <CopyButton token={token} />}
            <Badge variant="secondary">Read-only</Badge>
          </div>
        </div>

        <Tabs defaultValue="commands">
          <TabsList>
            <TabsTrigger value="commands">
              Commands <Badge variant="secondary" className="ml-1.5 text-xs">{commands?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="links">
              Links <Badge variant="secondary" className="ml-1.5 text-xs">{links?.length ?? 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notes <Badge variant="secondary" className="ml-1.5 text-xs">{notes?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commands" className="mt-4 space-y-3">
            {commands?.length === 0 && <p className="text-muted-foreground text-sm">No commands.</p>}
            {commands?.map((cmd) => (
              <Card key={cmd.id}>
                <CardContent className="pt-4 space-y-1">
                  <code className="block bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                    {cmd.command}
                  </code>
                  {cmd.description && (
                    <p className="text-sm text-muted-foreground">{cmd.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="links" className="mt-4 space-y-3">
            {links?.length === 0 && <p className="text-muted-foreground text-sm">No links.</p>}
            {links?.map((link) => (
              <Card key={link.id}>
                <CardContent className="pt-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{link.title || link.url}</span>
                  </a>
                  {link.title && (
                    <p className="text-xs text-muted-foreground mt-1 ml-6 break-all">{link.url}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="notes" className="mt-4 space-y-3">
            {notes?.length === 0 && <p className="text-muted-foreground text-sm">No notes.</p>}
            {notes?.map((note) => (
              <PublicNoteCard key={note.id} content={note.content} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
