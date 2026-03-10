'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Terminal, Link2, FileText, Layers } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { globalSearch, SearchResults } from '@/lib/queries'

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

  const total = results
    ? results.technologies.length + results.commands.length + results.links.length + results.notes.length
    : 0

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 h-9 rounded-md border border-input bg-background/50 text-sm text-muted-foreground hover:bg-accent transition-colors w-48 lg:w-64"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left truncate">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span>⌘K</span>
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setQuery(''); setResults(null) } }}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
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

              {results.technologies.length > 0 && (
                <section>
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Technologies
                  </p>
                  {results.technologies.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/technologies/${t.id}`)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm flex items-center gap-2"
                    >
                      <span className="font-medium">{t.name}</span>
                      {t.description && <span className="text-muted-foreground truncate text-xs">{t.description}</span>}
                    </button>
                  ))}
                </section>
              )}

              {results.commands.length > 0 && (
                <section>
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                    <Terminal className="w-3 h-3" /> Commands
                  </p>
                  {results.commands.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/technologies/${c.technology_id}`)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm flex items-start gap-2"
                    >
                      <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded shrink-0 max-w-[200px] truncate">{c.command}</code>
                      <Badge variant="outline" className="text-[10px] h-5 shrink-0">{c.technology_name}</Badge>
                    </button>
                  ))}
                </section>
              )}

              {results.links.length > 0 && (
                <section>
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                    <Link2 className="w-3 h-3" /> Links
                  </p>
                  {results.links.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/technologies/${l.technology_id}`)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm flex items-center gap-2"
                    >
                      <span className="truncate">{l.title || l.url}</span>
                      <Badge variant="outline" className="text-[10px] h-5 shrink-0">{l.technology_name}</Badge>
                    </button>
                  ))}
                </section>
              )}

              {results.notes.length > 0 && (
                <section>
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Notes
                  </p>
                  {results.notes.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => navigate(`/technologies/${n.technology_id}`)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent text-sm flex items-center gap-2"
                    >
                      <span className="truncate text-xs">{n.content.slice(0, 80)}</span>
                      <Badge variant="outline" className="text-[10px] h-5 shrink-0">{n.technology_name}</Badge>
                    </button>
                  ))}
                </section>
              )}
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
