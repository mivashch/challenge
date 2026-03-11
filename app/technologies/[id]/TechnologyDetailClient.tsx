'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CommandList } from '@/components/commands/CommandList'
import { LinkList } from '@/components/links/LinkList'
import { NoteList } from '@/components/notes/NoteList'
import { fetchTechnology } from '@/lib/queries'

export function TechnologyDetailClient({ id }: { id: string }) {
  const { data: tech, isLoading, isError } = useQuery({
    queryKey: ['technology', id],
    queryFn: () => fetchTechnology(id),
  })

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground">Loading...</p></div>
  if (isError || !tech) return <div className="p-6"><p className="text-destructive">Technology not found.</p></div>

  return (
    <div className="p-6 max-w-4xl mx-auto overflow-y-auto h-full space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ChevronLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{tech.name}</h2>
          {tech.description && (
            <p className="text-muted-foreground text-sm">{tech.description}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="commands">
        <TabsList>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="mt-4">
          <CommandList technologyId={id} />
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <LinkList technologyId={id} />
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <NoteList technologyId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
