'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Share2, Copy, Check, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { TechnologyForm } from './TechnologyForm'
import { Technology } from '@/lib/supabase'
import { updateTechnology, deleteTechnology, generatePublicToken, revokePublicToken } from '@/lib/queries'

export function TechnologyCard({ tech }: { tech: Technology }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = tech.public_token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${tech.public_token}`
    : null

  function copyLink() {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  const generateMutation = useMutation({
    mutationFn: () => generatePublicToken(tech.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      toast.success('Public link generated')
    },
    onError: () => toast.error('Failed to generate link'),
  })

  const revokeMutation = useMutation({
    mutationFn: () => revokePublicToken(tech.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      toast.success('Public link revoked')
    },
    onError: () => toast.error('Failed to revoke link'),
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
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
            <Share2 className="w-3.5 h-3.5 mr-1" />
            Share
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

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{tech.name}"</DialogTitle>
          </DialogHeader>
          {publicUrl ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Anyone with this link can view this technology read-only.
              </p>
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly className="text-xs" />
                <Button size="sm" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => revokeMutation.mutate()}
                disabled={revokeMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Revoke link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a public read-only link for this technology.
              </p>
              <Button
                className="w-full"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Generate public link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
