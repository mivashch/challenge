'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ChevronLeft, ChevronDown, ChevronRight, Terminal, Link2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CommandList } from '@/components/commands/CommandList'
import { LinkList } from '@/components/links/LinkList'
import { NoteList } from '@/components/notes/NoteList'
import { fetchTechnology, fetchCommands, fetchLinks, fetchNotes } from '@/lib/queries'

type Section = 'commands' | 'links' | 'notes'

export function TechnologyDetailClient({ id }: { id: string }) {
  const [openSections, setOpenSections] = useState<Set<Section>>(new Set())

  const { data: tech, isLoading, isError } = useQuery({
    queryKey: ['technology', id],
    queryFn: () => fetchTechnology(id),
  })
  const { data: commands } = useQuery({
    queryKey: ['commands', id],
    queryFn: () => fetchCommands(id),
  })
  const { data: links } = useQuery({
    queryKey: ['links', id],
    queryFn: () => fetchLinks(id),
  })
  const { data: notes } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => fetchNotes(id),
  })

  function toggle(key: Section) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground">Loading...</p></div>
  if (isError || !tech) return <div className="p-6"><p className="text-destructive">Technology not found.</p></div>

  const sections = [
    { key: 'commands' as Section, label: 'Commands', count: commands?.length ?? 0, Icon: Terminal, content: <CommandList technologyId={id} /> },
    { key: 'links' as Section, label: 'Links', count: links?.length ?? 0, Icon: Link2, content: <LinkList technologyId={id} /> },
    { key: 'notes' as Section, label: 'Notes', count: notes?.length ?? 0, Icon: FileText, content: <NoteList technologyId={id} /> },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto overflow-y-auto h-full space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-5">
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

      <div className="border border-border rounded overflow-hidden">
        {sections.map((section, i) => (
          <div key={section.key} className={cn(i > 0 && 'border-t border-border')}>
            <button
              onClick={() => toggle(section.key)}
              className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-accent transition-colors text-left"
            >
              {openSections.has(section.key)
                ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              <section.Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">{section.label}</span>
              <span className="text-xs bg-accent text-muted-foreground rounded px-1.5 py-0.5 leading-none">
                {section.count}
              </span>
            </button>
            {openSections.has(section.key) && (
              <div className="px-4 pb-4 pt-1 border-t border-border bg-muted">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
