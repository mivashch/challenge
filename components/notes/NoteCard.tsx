'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { NoteForm } from './NoteForm'
import { Note } from '@/lib/supabase'
import { updateNote, deleteNote } from '@/lib/queries'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const firstLine = (content: string) => content.split('\n')[0].replace(/^#+\s*/, '').trim()

export function NoteCard({ note, technologyId }: { note: Note; technologyId: string }) {
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const isLong = note.content.includes('\n') || note.content.length > 120
  const [expanded, setExpanded] = useState(!isLong)

  const updateMutation = useMutation({
    mutationFn: (data: { content: string }) => updateNote(note.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', technologyId] })
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      setEditOpen(false)
      toast.success('Note updated')
    },
    onError: () => toast.error('Failed to update note'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(note.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', technologyId] })
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      toast.success('Note deleted')
    },
    onError: () => toast.error('Failed to delete note'),
  })

  return (
    <>
      <Card>
        <CardContent className="pt-4 space-y-2">
          {expanded ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm truncate">{firstLine(note.content)}</p>
          )}
          <div className="flex gap-2 justify-end items-center">
            {isLong && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground px-2" onClick={() => setExpanded(!expanded)}>
                {expanded ? <><ChevronUp className="w-3.5 h-3.5 mr-1" />Collapse</> : <><ChevronDown className="w-3.5 h-3.5 mr-1" />Expand</>}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete note?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>

      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <NoteForm
              initial={note}
              onSubmit={(data) => updateMutation.mutate(data)}
              onCancel={() => setEditOpen(false)}
              loading={updateMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
