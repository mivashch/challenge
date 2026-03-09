'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CommandCard } from './CommandCard'
import { CommandForm } from './CommandForm'
import { fetchCommands, createCommand } from '@/lib/queries'

export function CommandList({ technologyId }: { technologyId: string }) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data: commands, isLoading, isError } = useQuery({
    queryKey: ['commands', technologyId],
    queryFn: () => fetchCommands(technologyId),
  })

  const createMutation = useMutation({
    mutationFn: (data: { command: string; description: string }) =>
      createCommand({ technology_id: technologyId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands', technologyId] })
      setCreateOpen(false)
      toast.success('Command added')
    },
    onError: () => toast.error('Failed to add command'),
  })

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>
  if (isError) return <p className="text-destructive text-sm">Failed to load commands.</p>

  const filtered = commands?.filter((c) =>
    c.command.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>+ Add</Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered?.length ?? 0} of {commands?.length ?? 0} command(s)
      </p>

      {filtered?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {search ? `No results for "${search}"` : 'No commands yet.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered?.map((cmd) => (
            <CommandCard key={cmd.id} cmd={cmd} technologyId={technologyId} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Command</DialogTitle>
          </DialogHeader>
          <CommandForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setCreateOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
