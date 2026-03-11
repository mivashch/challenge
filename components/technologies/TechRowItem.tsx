'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, Pencil, Trash2, Share2, Copy, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TechnologyForm } from './TechnologyForm'
import { TechExpandedRow } from './TechExpandedRow'
import { Technology } from '@/lib/supabase'
import { updateTechnology, deleteTechnology, generatePublicToken, revokePublicToken } from '@/lib/queries'

export function TechRowItem({ tech, isExpanded, isHighlighted, onToggle, defaultSection, highlightItemId }: {
  tech: Technology
  isExpanded: boolean
  isHighlighted?: boolean
  onToggle: () => void
  defaultSection?: string | null
  highlightItemId?: string | null
}) {
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
    mutationFn: (data: { name: string; description?: string }) => updateTechnology(tech.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      setEditOpen(false)
      toast.success('Technology updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTechnology(tech.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      toast.success('Technology deleted')
    },
    onError: () => toast.error('Failed to delete'),
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
      <div id={`tech-${tech.id}`} className={cn('group border-b border-border transition-colors duration-700', isExpanded && 'bg-accent', isHighlighted && 'bg-primary/20')}>
        <div className="flex items-center gap-2 px-4 py-3 hover:bg-accent transition-colors">
          {/* Expand toggle — takes up most of the row */}
          <button
            onClick={onToggle}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
          >
            {isExpanded
              ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            <span className={cn('text-sm font-medium truncate', isExpanded && 'text-primary')}>
              {tech.name}
            </span>
            {tech.description && (
              <span className="text-sm text-muted-foreground truncate">{tech.description}</span>
            )}
            {tech.public_token && (
              <Share2 className="w-3 h-3 text-green-500 shrink-0" />
            )}
          </button>

          {/* Hover actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); setShareOpen(true) }}
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
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
          </div>
        </div>

        {isExpanded && <TechExpandedRow technologyId={tech.id} defaultSection={defaultSection} highlightItemId={highlightItemId} />}
      </div>

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

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Share "{tech.name}"</DialogTitle></DialogHeader>
          {publicUrl ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Anyone with this link can view this technology read-only.</p>
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly className="text-xs" />
                <Button size="sm" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button variant="destructive" size="sm" className="w-full" onClick={() => revokeMutation.mutate()} disabled={revokeMutation.isPending}>
                <X className="w-4 h-4 mr-1" />Revoke link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Generate a public read-only link for this technology.</p>
              <Button className="w-full" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                <Share2 className="w-4 h-4 mr-2" />Generate public link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
