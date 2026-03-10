'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TechnologyCard } from './TechnologyCard'
import { TechnologyForm } from './TechnologyForm'
import { fetchTechnologies, createTechnology } from '@/lib/queries'
import { SortKey, SORT_OPTIONS, sortItems } from '@/lib/sort'

export function TechnologyList() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('created_desc')

  const { data: technologies, isLoading, isError } = useQuery({
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

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>
  if (isError) return <p className="text-destructive">Failed to load technologies.</p>

  const sorted = sortItems(technologies ?? [], sortKey, (t) => t.name)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Technologies</h2>
        <div className="flex items-center gap-2">
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateOpen(true)}>+ Add</Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground">No technologies yet. Add your first one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((tech) => (
            <TechnologyCard key={tech.id} tech={tech} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Technology</DialogTitle>
          </DialogHeader>
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
