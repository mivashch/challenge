'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Terminal, Link2, FileText, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PublicNoteCard } from '@/components/notes/PublicNoteCard'

type Command = { id: string; command: string; description: string | null }
type Link = { id: string; url: string; title: string | null }
type Note = { id: string; content: string }
type Section = 'commands' | 'links' | 'notes'

export function PublicTechAccordion({
  commands,
  links,
  notes,
}: {
  commands: Command[]
  links: Link[]
  notes: Note[]
}) {
  const [openSections, setOpenSections] = useState<Set<Section>>(new Set())

  function toggle(key: Section) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const sections = [
    {
      key: 'commands' as Section,
      label: 'Commands',
      count: commands.length,
      Icon: Terminal,
      content: commands.length === 0
        ? <p className="text-sm text-muted-foreground py-2">No commands.</p>
        : <div className="space-y-3">
            {commands.map((cmd) => (
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
          </div>,
    },
    {
      key: 'links' as Section,
      label: 'Links',
      count: links.length,
      Icon: Link2,
      content: links.length === 0
        ? <p className="text-sm text-muted-foreground py-2">No links.</p>
        : <div className="space-y-3">
            {links.map((link) => (
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
          </div>,
    },
    {
      key: 'notes' as Section,
      label: 'Notes',
      count: notes.length,
      Icon: FileText,
      content: notes.length === 0
        ? <p className="text-sm text-muted-foreground py-2">No notes.</p>
        : <div className="space-y-3">
            {notes.map((note) => (
              <PublicNoteCard key={note.id} content={note.content} />
            ))}
          </div>,
    },
  ]

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      {sections.map((section, i) => (
        <div key={section.key} className={cn(i > 0 && 'border-t border-border/40')}>
          <button
            onClick={() => toggle(section.key)}
            className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-accent/40 transition-colors text-left"
          >
            {openSections.has(section.key)
              ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            <section.Icon className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium">{section.label}</span>
            <span className="text-xs bg-accent text-muted-foreground rounded-full px-1.5 py-0.5 leading-none">
              {section.count}
            </span>
          </button>
          {openSections.has(section.key) && (
            <div className="px-4 pb-4 pt-1 border-t border-border/30 bg-accent/5">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
