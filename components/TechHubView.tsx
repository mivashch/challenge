'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchTechnologies, createTechnology } from '@/lib/queries'
import { SortKey, SORT_OPTIONS, sortItems } from '@/lib/sort'
import { TechnologyForm } from './technologies/TechnologyForm'
import { TechRowItem } from './technologies/TechRowItem'

export function TechHubView() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [highlightTechId, setHighlightTechId] = useState<string | null>(null)
  const [expandSection, setExpandSection] = useState<string | null>(null)
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('created_desc')

  useEffect(() => {
    const id = searchParams.get('highlight')
    if (!id) return
    const section = searchParams.get('section')
    const item = searchParams.get('item')
    router.replace('/')
    setExpandedIds(prev => { const next = new Set(prev); next.add(id); return next })
    setHighlightId(id)
    if (section) { setExpandSection(section); setHighlightTechId(id) }
    if (item) setHighlightItemId(item)
    setTimeout(() => {
      document.getElementById(`tech-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
    setTimeout(() => setHighlightId(null), 1800)
    setTimeout(() => { setExpandSection(null); setHighlightItemId(null); setHighlightTechId(null) }, 2500)
  }, [searchParams, router])

  const { data: technologies, isLoading } = useQuery({
    queryKey: ['technologies'],
    queryFn: fetchTechnologies,
  })

  const createMutation = useMutation({
    mutationFn: createTechnology,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      setCreateOpen(false)
      toast.success('Technology added')
    },
    onError: () => toast.error('Failed to add technology'),
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Technologies</span>
          {technologies && (
            <span className="text-xs text-muted-foreground bg-accent rounded px-1.5 py-0.5 leading-none">
              {technologies.length}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="h-7 text-xs w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="px-5 py-4 text-sm text-muted-foreground">Loading...</div>
        )}
        {technologies?.length === 0 && !isLoading && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No technologies yet. Click <strong>Add</strong> to get started.
          </div>
        )}
        {sortItems(technologies ?? [], sortKey, (t) => t.name).map((tech) => (
          <TechRowItem
            key={tech.id}
            tech={tech}
            isExpanded={expandedIds.has(tech.id)}
            isHighlighted={highlightId === tech.id}
            onToggle={() => setExpandedIds(prev => {
              const next = new Set(prev)
              next.has(tech.id) ? next.delete(tech.id) : next.add(tech.id)
              return next
            })}
            defaultSection={highlightTechId === tech.id ? expandSection : null}
            highlightItemId={highlightTechId === tech.id ? highlightItemId : null}
          />
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Technology</DialogTitle></DialogHeader>
          <TechnologyForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setCreateOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
