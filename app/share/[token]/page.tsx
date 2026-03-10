import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PublicNoteCard } from '@/components/notes/PublicNoteCard'

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: tech } = await supabase
    .from('technologies')
    .select('*')
    .eq('public_token', token)
    .single()

  if (!tech) notFound()

  const [{ data: commands }, { data: links }, { data: notes }] = await Promise.all([
    supabase.from('commands').select('*').eq('technology_id', tech.id).order('created_at', { ascending: false }),
    supabase.from('links').select('*').eq('technology_id', tech.id).order('created_at', { ascending: false }),
    supabase.from('notes').select('*').eq('technology_id', tech.id).order('created_at', { ascending: false }),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{tech.name}</h1>
          {tech.description && (
            <p className="text-muted-foreground mt-1">{tech.description}</p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0 mt-1">Read-only</Badge>
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
  )
}
