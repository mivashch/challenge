'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { TechnologyForm } from './TechnologyForm'
import { Technology } from '@/lib/supabase'
import { updateTechnology, deleteTechnology } from '@/lib/queries'

export function TechnologyCard({ tech }: { tech: Technology }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      updateTechnology(tech.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      setEditOpen(false)
      toast.success('Technology updated')
    },
    onError: () => toast.error('Failed to update technology'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTechnology(tech.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      toast.success('Technology deleted')
    },
    onError: () => toast.error('Failed to delete technology'),
  })

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => router.push(`/technologies/${tech.id}`)}
      >
        <CardHeader>
          <CardTitle className="text-lg">{tech.name}</CardTitle>
          {tech.description && (
            <CardDescription className="line-clamp-2">{tech.description}</CardDescription>
          )}
        </CardHeader>
        <CardFooter className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {tech.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this technology and all its commands, links, and notes.
                </AlertDialogDescription>
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
        </CardFooter>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Technology</DialogTitle>
          </DialogHeader>
          <TechnologyForm
            initial={tech}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setEditOpen(false)}
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
