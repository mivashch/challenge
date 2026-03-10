import { notFound } from 'next/navigation'
import { BookOpen, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
    <div className="min-h-screen">
      <header className="border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Dev Knowledge Hub</span>
          <Badge variant="secondary" className="ml-auto text-xs">Read-only</Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{tech.name}</h1>
          {tech.description && (
            <p className="text-muted-foreground mt-1">{tech.description}</p>
          )}
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
              <Card key={note.id}>
                <CardContent className="pt-4">
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
