'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Terminal, Link2, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Input } from '@/components/ui/input'
import { globalSearch, SearchResults } from '@/lib/queries'

type Group = {
  techId: string
  techName: string
  techDescription?: string | null
  isTechMatch: boolean
  commands: SearchResults['commands']
  links: SearchResults['links']
  notes: SearchResults['notes']
}

function buildGroups(results: SearchResults): Group[] {
  const map = new Map<string, Group>()

  function getOrCreate(techId: string, techName: string, techDescription?: string | null, isTechMatch = false) {
    if (!map.has(techId)) {
      map.set(techId, { techId, techName, techDescription, isTechMatch, commands: [], links: [], notes: [] })
    }
    if (isTechMatch) map.get(techId)!.isTechMatch = true
    return map.get(techId)!
  }

  for (const t of results.technologies) {
    getOrCreate(t.id, t.name, t.description, true)
  }
  for (const c of results.commands) {
    getOrCreate(c.technology_id, c.technology_name).commands.push(c)
  }
  for (const l of results.links) {
    getOrCreate(l.technology_id, l.technology_name).links.push(l)
  }
  for (const n of results.notes) {
    getOrCreate(n.technology_id, n.technology_name).notes.push(n)
  }

  return Array.from(map.values())
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await globalSearch(query.trim())
        setResults(data)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function navigate(path: string) {
    setOpen(false)
    setQuery('')
    setResults(null)
    router.push(path)
  }

  const groups = results ? buildGroups(results) : []
  const total = results
    ? results.technologies.length + results.commands.length + results.links.length + results.notes.length
    : 0

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 h-9 rounded border border-input bg-background text-sm text-muted-foreground hover:bg-accent transition-colors w-48 lg:w-64"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left truncate">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span>⌘K</span>
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setQuery(''); setResults(null) } }}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <VisuallyHidden><DialogTitle>Search</DialogTitle></VisuallyHidden>
          <div className="flex items-center border-b px-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search technologies, commands, links, notes..."
              className="border-0 shadow-none focus-visible:ring-0 h-12 text-sm"
            />
            {loading && <span className="text-xs text-muted-foreground">Searching...</span>}
          </div>

          {results && (
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {total === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No results for "{query}"</p>
              )}

              {groups.map((group) => (
                <div key={group.techId} className="mb-1">
                  {/* Technology header — clickable */}
                  <button
                    onClick={() => navigate(`/?highlight=${group.techId}`)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-accent flex items-center gap-2"
                  >
                    <span className="text-sm font-semibold">{group.techName}</span>
                    {group.isTechMatch && group.techDescription && (
                      <span className="text-xs text-muted-foreground truncate">{group.techDescription}</span>
                    )}
                  </button>

                  {/* Commands */}
                  {group.commands.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/?highlight=${group.techId}&section=commands&item=${c.id}`)}
                      className="w-full text-left pl-7 pr-3 py-1.5 rounded hover:bg-accent flex items-center gap-2"
                    >
                      <Terminal className="w-3 h-3 text-muted-foreground shrink-0" />
                      <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-xs">{c.command}</code>
                      {c.description && <span className="text-xs text-muted-foreground truncate">{c.description}</span>}
                    </button>
                  ))}

                  {/* Links */}
                  {group.links.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/?highlight=${group.techId}&section=links&item=${l.id}`)}
                      className="w-full text-left pl-7 pr-3 py-1.5 rounded hover:bg-accent flex items-center gap-2"
                    >
                      <Link2 className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-xs truncate">{l.title || l.url}</span>
                    </button>
                  ))}

                  {/* Notes */}
                  {group.notes.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => navigate(`/?highlight=${group.techId}&section=notes&item=${n.id}`)}
                      className="w-full text-left pl-7 pr-3 py-1.5 rounded hover:bg-accent flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{n.content.slice(0, 80)}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {!results && !query && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Type to search across all your technologies
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
