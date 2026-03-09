'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TechnologyCard } from './TechnologyCard'
import { TechnologyForm } from './TechnologyForm'
import { fetchTechnologies, createTechnology } from '@/lib/queries'

export function TechnologyList() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')

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

  const filtered = technologies?.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold shrink-0">Technologies</h2>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Add</Button>
      </div>

      {filtered?.length === 0 ? (
        <p className="text-muted-foreground">
          {search ? `No results for "${search}"` : 'No technologies yet. Add your first one!'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map((tech) => (
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
