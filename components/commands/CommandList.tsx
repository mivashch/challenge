'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CommandCard } from './CommandCard'
import { CommandForm } from './CommandForm'
import { fetchCommands, createCommand } from '@/lib/queries'

export function CommandList({ technologyId }: { technologyId: string }) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{commands?.length ?? 0} command(s)</p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>+ Add Command</Button>
      </div>

      {commands?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No commands yet.</p>
      ) : (
        <div className="space-y-2">
          {commands?.map((cmd) => (
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
