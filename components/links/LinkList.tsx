'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LinkCard } from './LinkCard'
import { LinkForm } from './LinkForm'
import { fetchLinks, createLink } from '@/lib/queries'
import { SortKey, SORT_OPTIONS, sortItems } from '@/lib/sort'

export function LinkList({ technologyId }: { technologyId: string }) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_desc')

  const { data: links, isLoading, isError } = useQuery({
    queryKey: ['links', technologyId],
    queryFn: () => fetchLinks(technologyId),
  })

  const createMutation = useMutation({
    mutationFn: (data: { url: string; title: string }) =>
      createLink({ technology_id: technologyId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', technologyId] })
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      setCreateOpen(false)
      toast.success('Link added')
    },
    onError: () => toast.error('Failed to add link'),
  })

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>
  if (isError) return <p className="text-destructive text-sm">Failed to load links.</p>

  const filtered = links?.filter((l) =>
    l.url.toLowerCase().includes(search.toLowerCase()) ||
    l.title?.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const sorted = sortItems(filtered, sortKey, (l) => l.title ?? l.url)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-32">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-40 h-8 text-sm shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="shrink-0">+ Add</Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {sorted.length} of {links?.length ?? 0} link(s)
      </p>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {search ? `No results for "${search}"` : 'No links yet.'}
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((link) => (
            <LinkCard key={link.id} link={link} technologyId={technologyId} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <LinkForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setCreateOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
