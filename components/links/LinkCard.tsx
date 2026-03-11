'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { LinkForm } from './LinkForm'
import { Link } from '@/lib/supabase'
import { updateLink, deleteLink } from '@/lib/queries'

export function LinkCard({ link, technologyId }: { link: Link; technologyId: string }) {
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const updateMutation = useMutation({
    mutationFn: (data: { url: string; title: string }) => updateLink(link.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', technologyId] })
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      setEditOpen(false)
      toast.success('Link updated')
    },
    onError: () => toast.error('Failed to update link'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteLink(link.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', technologyId] })
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      toast.success('Link deleted')
    },
    onError: () => toast.error('Failed to delete link'),
  })

  return (
    <>
      <Card>
        <CardContent className="pt-4 flex items-center justify-between gap-2">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:underline text-primary min-w-0"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span className="truncate">{link.title || link.url}</span>
          </a>
          <div className="flex gap-1 shrink-0">
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
                  <AlertDialogTitle>Delete link?</AlertDialogTitle>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <LinkForm
            initial={link}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setEditOpen(false)}
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
