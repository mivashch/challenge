'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'
import { fetchNotes, createNote } from '@/lib/queries'

export function NoteList({ technologyId }: { technologyId: string }) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)

  const { data: notes, isLoading, isError } = useQuery({
    queryKey: ['notes', technologyId],
    queryFn: () => fetchNotes(technologyId),
  })

  const createMutation = useMutation({
    mutationFn: (data: { content: string }) =>
      createNote({ technology_id: technologyId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', technologyId] })
      setCreateOpen(false)
      toast.success('Note added')
    },
    onError: () => toast.error('Failed to add note'),
  })

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>
  if (isError) return <p className="text-destructive text-sm">Failed to load notes.</p>

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{notes?.length ?? 0} note(s)</p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>+ Add Note</Button>
      </div>

      {notes?.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes?.map((note) => (
            <NoteCard key={note.id} note={note} technologyId={technologyId} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <NoteForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setCreateOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
