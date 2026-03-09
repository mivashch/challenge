'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Copy, Check, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { CommandForm } from './CommandForm'
import { Command } from '@/lib/supabase'
import { updateCommand, deleteCommand } from '@/lib/queries'

export function CommandCard({ cmd, technologyId }: { cmd: Command; technologyId: string }) {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(cmd.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const updateMutation = useMutation({
    mutationFn: (data: { command: string; description: string }) => updateCommand(cmd.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands', technologyId] })
      setEditOpen(false)
      toast.success('Command updated')
    },
    onError: () => toast.error('Failed to update command'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCommand(cmd.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands', technologyId] })
      toast.success('Command deleted')
    },
    onError: () => toast.error('Failed to delete command'),
  })

  return (
    <>
      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <code className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1 break-all">
              {cmd.command}
            </code>
            <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy command">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {cmd.description && (
            <p className="text-sm text-muted-foreground">{cmd.description}</p>
          )}
          <div className="flex gap-2 justify-end">
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
                  <AlertDialogTitle>Delete command?</AlertDialogTitle>
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
            <DialogTitle>Edit Command</DialogTitle>
          </DialogHeader>
          <CommandForm
            initial={cmd}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setEditOpen(false)}
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
