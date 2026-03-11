'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { X, Pencil, Trash2, Share2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { CommandList } from '@/components/commands/CommandList'
import { LinkList } from '@/components/links/LinkList'
import { NoteList } from '@/components/notes/NoteList'
import { TechnologyForm } from './TechnologyForm'
import { fetchTechnology, updateTechnology, deleteTechnology, generatePublicToken, revokePublicToken } from '@/lib/queries'

export function TechDetailPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: tech, isLoading } = useQuery({
    queryKey: ['technology', id],
    queryFn: () => fetchTechnology(id),
  })

  const publicUrl = tech?.public_token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${tech.public_token}`
    : null

  function copyLink() {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => updateTechnology(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      queryClient.invalidateQueries({ queryKey: ['technology', id] })
      setEditOpen(false)
      toast.success('Technology updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTechnology(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      onClose()
      toast.success('Technology deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const generateMutation = useMutation({
    mutationFn: () => generatePublicToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      queryClient.invalidateQueries({ queryKey: ['technology', id] })
      toast.success('Public link generated')
    },
    onError: () => toast.error('Failed to generate link'),
  })

  const revokeMutation = useMutation({
    mutationFn: () => revokePublicToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      queryClient.invalidateQueries({ queryKey: ['technology', id] })
      toast.success('Public link revoked')
    },
    onError: () => toast.error('Failed to revoke link'),
  })

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
  if (!tech) return <div className="p-6 text-sm text-destructive">Not found.</div>

  return (
    <div className="flex flex-col h-full border-l border-border/50">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{tech.name}</h2>
            {tech.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{tech.description}</p>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShareOpen(true)}>
              <Share2 className="w-3.5 h-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
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
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto p-5 pt-4">
        <Tabs defaultValue="commands">
          <TabsList className="w-full">
            <TabsTrigger value="commands" className="flex-1">Commands</TabsTrigger>
            <TabsTrigger value="links" className="flex-1">Links</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="commands" className="mt-4">
            <CommandList technologyId={id} />
          </TabsContent>
          <TabsContent value="links" className="mt-4">
            <LinkList technologyId={id} />
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            <NoteList technologyId={id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Technology</DialogTitle></DialogHeader>
          <TechnologyForm
            initial={tech}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setEditOpen(false)}
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Share "{tech.name}"</DialogTitle></DialogHeader>
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
                variant="destructive" size="sm" className="w-full"
                onClick={() => revokeMutation.mutate()}
                disabled={revokeMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />Revoke link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a public read-only link for this technology.
              </p>
              <Button className="w-full" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                <Share2 className="w-4 h-4 mr-2" />Generate public link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
