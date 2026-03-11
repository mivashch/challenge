'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Terminal, Link2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchCommands, fetchLinks, fetchNotes } from '@/lib/queries'
import { CommandList } from '@/components/commands/CommandList'
import { LinkList } from '@/components/links/LinkList'
import { NoteList } from '@/components/notes/NoteList'

type Section = 'commands' | 'links' | 'notes'

export function TechExpandedRow({ technologyId, defaultSection, highlightItemId }: {
  technologyId: string
  defaultSection?: string | null
  highlightItemId?: string | null
}) {
  const [openSections, setOpenSections] = useState<Set<Section>>(
    defaultSection ? new Set([defaultSection as Section]) : new Set()
  )

  const { data: commands } = useQuery({
    queryKey: ['commands', technologyId],
    queryFn: () => fetchCommands(technologyId),
  })
  const { data: links } = useQuery({
    queryKey: ['links', technologyId],
    queryFn: () => fetchLinks(technologyId),
  })
  const { data: notes } = useQuery({
    queryKey: ['notes', technologyId],
    queryFn: () => fetchNotes(technologyId),
  })

  const sections = [
    { key: 'commands' as Section, label: 'Commands', count: commands?.length ?? 0, Icon: Terminal, content: <CommandList technologyId={technologyId} highlightItemId={defaultSection === 'commands' ? highlightItemId : null} /> },
    { key: 'links' as Section, label: 'Links', count: links?.length ?? 0, Icon: Link2, content: <LinkList technologyId={technologyId} highlightItemId={defaultSection === 'links' ? highlightItemId : null} /> },
    { key: 'notes' as Section, label: 'Notes', count: notes?.length ?? 0, Icon: FileText, content: <NoteList technologyId={technologyId} highlightItemId={defaultSection === 'notes' ? highlightItemId : null} /> },
  ]

  return (
    <div className="bg-muted">
      {sections.map((section, i) => (
        <div key={section.key} className={cn(i > 0 && 'border-t border-border')}>
          <button
            onClick={() => setOpenSections(prev => {
              const next = new Set(prev)
              next.has(section.key) ? next.delete(section.key) : next.add(section.key)
              return next
            })}
            className="w-full flex items-center gap-2.5 pl-10 pr-5 py-2.5 hover:bg-accent transition-colors"
          >
            {openSections.has(section.key)
              ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
              : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
            <section.Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{section.label}</span>
            <span className="text-xs bg-accent text-muted-foreground rounded px-1.5 py-0.5 leading-none">
              {section.count}
            </span>
          </button>
          {openSections.has(section.key) && (
            <div className="pl-10 pr-5 pb-4 pt-2">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
