'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchTechnologies, fetchFolders, createTechnology, createFolder } from '@/lib/queries'
import { SortKey, SORT_OPTIONS, sortItems } from '@/lib/sort'
import { TechnologyForm } from './technologies/TechnologyForm'
import { FolderForm } from './technologies/FolderForm'
import { TechRowItem } from './technologies/TechRowItem'
import { FolderRowItem } from './technologies/FolderRowItem'

const UNCATEGORIZED = '__uncategorized__'

export function TechHubView() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set())
  const [expandedTechIds, setExpandedTechIds] = useState<Set<string>>(new Set())
  const [expandedUncategorized, setExpandedUncategorized] = useState(true)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [highlightTechId, setHighlightTechId] = useState<string | null>(null)
  const [expandSection, setExpandSection] = useState<string | null>(null)
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null)
  const [createTechOpen, setCreateTechOpen] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('created_desc')

  const { data: technologies, isLoading: techLoading } = useQuery({
    queryKey: ['technologies'],
    queryFn: fetchTechnologies,
  })
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ['folders'],
    queryFn: fetchFolders,
  })

  const isLoading = techLoading || foldersLoading

  const byFolder = useMemo(() => {
    const map = new Map<string | null, typeof technologies>()
    if (!technologies) return map
    for (const t of technologies) {
      const key = t.folder_id ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }, [technologies])

  const uncategorized = byFolder.get(null) ?? []
  const sortedFolders = useMemo(() => sortItems(folders ?? [], 'alpha_asc', (f) => f.name), [folders])

  useEffect(() => {
    const id = searchParams.get('highlight')
    if (!id) return
    const section = searchParams.get('section')
    const item = searchParams.get('item')
    router.replace('/')
    const tech = technologies?.find((t) => t.id === id)
    const folderId = tech?.folder_id ?? null
    if (folderId) setExpandedFolderIds((prev) => new Set(prev).add(folderId))
    setExpandedTechIds((prev) => new Set(prev).add(id))
    setHighlightId(id)
    if (section) { setExpandSection(section); setHighlightTechId(id) }
    if (item) setHighlightItemId(item)
    setTimeout(() => document.getElementById(`tech-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
    setTimeout(() => setHighlightId(null), 1800)
    setTimeout(() => { setExpandSection(null); setHighlightItemId(null); setHighlightTechId(null) }, 2500)
  }, [searchParams, router, technologies])

  const createTechMutation = useMutation({
    mutationFn: createTechnology,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      setCreateTechOpen(false)
      toast.success('Technology added')
    },
    onError: () => toast.error('Failed to add technology'),
  })

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      setCreateFolderOpen(false)
      toast.success('Folder added')
    },
    onError: () => toast.error('Failed to add folder'),
  })

  const totalCount = technologies?.length ?? 0
  const hasAny = totalCount > 0 || (folders?.length ?? 0) > 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Technologies</span>
          {technologies != null && (
            <span className="text-xs text-muted-foreground bg-accent rounded px-1.5 py-0.5 leading-none">
              {totalCount}
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
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs" onClick={() => setCreateFolderOpen(true)}>
            <FolderPlus className="w-3.5 h-3.5" />
            Folder
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs" onClick={() => setCreateTechOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="px-5 py-4 text-sm text-muted-foreground">Loading...</div>
        )}
        {!hasAny && !isLoading && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No folders or technologies yet. Use <strong>Add</strong> to create a folder or add a technology.
          </div>
        )}
        {sortedFolders.map((folder) => {
          const techs = byFolder.get(folder.id) ?? []
          return (
            <FolderRowItem
              key={folder.id}
              folder={folder}
              technologies={techs}
              folders={sortedFolders}
              sortKey={sortKey}
              isExpanded={expandedFolderIds.has(folder.id)}
              onToggle={() => setExpandedFolderIds((prev) => {
                const next = new Set(prev)
                next.has(folder.id) ? next.delete(folder.id) : next.add(folder.id)
                return next
              })}
              expandedTechIds={expandedTechIds}
              onToggleTech={(id) => setExpandedTechIds((prev) => {
                const next = new Set(prev)
                next.has(id) ? next.delete(id) : next.add(id)
                return next
              })}
              highlightId={highlightId}
              highlightTechId={highlightTechId}
              expandSection={expandSection}
              highlightItemId={highlightItemId}
            />
          )
        })}
        {uncategorized.length > 0 && (
          <div className="border-b border-border">
            <button
              type="button"
              onClick={() => setExpandedUncategorized((v) => !v)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-accent transition-colors text-left"
            >
              {expandedUncategorized ? (
                <span className="text-muted-foreground">▼</span>
              ) : (
                <span className="text-muted-foreground">▶</span>
              )}
              <span className="text-sm font-medium text-muted-foreground">Without folder</span>
              <span className="text-xs text-muted-foreground bg-border rounded px-1.5 py-0.5 leading-none">
                {uncategorized.length}
              </span>
            </button>
            {expandedUncategorized && (
              <div className="pl-2">
                {sortItems(uncategorized, sortKey, (t) => t.name).map((tech) => (
                  <TechRowItem
                    key={tech.id}
                    tech={tech}
                    folders={sortedFolders}
                    isExpanded={expandedTechIds.has(tech.id)}
                    isHighlighted={highlightId === tech.id}
                    onToggle={() => setExpandedTechIds((prev) => {
                      const next = new Set(prev)
                      next.has(tech.id) ? next.delete(tech.id) : next.add(tech.id)
                      return next
                    })}
                    defaultSection={highlightTechId === tech.id ? expandSection : null}
                    highlightItemId={highlightTechId === tech.id ? highlightItemId : null}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={createTechOpen} onOpenChange={setCreateTechOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Technology</DialogTitle></DialogHeader>
          <TechnologyForm
            folders={folders ?? []}
            onSubmit={(data) => createTechMutation.mutate(data)}
            onCancel={() => setCreateTechOpen(false)}
            loading={createTechMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add folder</DialogTitle></DialogHeader>
          <FolderForm
            onSubmit={(data) => createFolderMutation.mutate(data)}
            onCancel={() => setCreateFolderOpen(false)}
            loading={createFolderMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
