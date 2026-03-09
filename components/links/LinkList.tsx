'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LinkCard } from './LinkCard'
import { LinkForm } from './LinkForm'
import { fetchLinks, createLink } from '@/lib/queries'

export function LinkList({ technologyId }: { technologyId: string }) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)

  const { data: links, isLoading, isError } = useQuery({
    queryKey: ['links', technologyId],
    queryFn: () => fetchLinks(technologyId),
  })

  const createMutation = useMutation({
    mutationFn: (data: { url: string; title: string }) =>
      createLink({ technology_id: technologyId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', technologyId] })
      setCreateOpen(false)
      toast.success('Link added')
    },
    onError: () => toast.error('Failed to add link'),
  })

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>
  if (isError) return <p className="text-destructive text-sm">Failed to load links.</p>

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{links?.length ?? 0} link(s)</p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>+ Add Link</Button>
      </div>

      {links?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No links yet.</p>
      ) : (
        <div className="space-y-2">
          {links?.map((link) => (
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
