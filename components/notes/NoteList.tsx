'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'
import { fetchNotes, createNote } from '@/lib/queries'

export function NoteList({ technologyId }: { technologyId: string }) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')

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

  const filtered = notes?.filter((n) =>
    n.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>+ Add</Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered?.length ?? 0} of {notes?.length ?? 0} note(s)
      </p>

      {filtered?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {search ? `No results for "${search}"` : 'No notes yet.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered?.map((note) => (
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
