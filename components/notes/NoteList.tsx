'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'
import { fetchNotes, createNote } from '@/lib/queries'
import { SortKey, SORT_OPTIONS, sortItems } from '@/lib/sort'

export function NoteList({ technologyId }: { technologyId: string }) {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_desc')

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
  ) ?? []

  const sorted = sortItems(filtered, sortKey, (n) => n.content)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-32">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
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
        {sorted.length} of {notes?.length ?? 0} note(s)
      </p>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {search ? `No results for "${search}"` : 'No notes yet.'}
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((note) => (
            <NoteCard key={note.id} note={note} technologyId={technologyId} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <NoteForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setCreateOpen(false)}
              loading={createMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
