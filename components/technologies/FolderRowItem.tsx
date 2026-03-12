'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { FolderForm } from './FolderForm'
import { TechRowItem } from './TechRowItem'
import { Folder, Technology } from '@/lib/supabase'
import { updateFolder, deleteFolder } from '@/lib/queries'
import { SortKey, sortItems } from '@/lib/sort'

export function FolderRowItem({
  folder,
  technologies,
  folders,
  sortKey,
  isExpanded,
  onToggle,
  expandedTechIds,
  onToggleTech,
  highlightId,
  highlightTechId,
  expandSection,
  highlightItemId,
}: {
  folder: Folder
  technologies: Technology[]
  folders: Folder[]
  sortKey: SortKey
  isExpanded: boolean
  onToggle: () => void
  expandedTechIds: Set<string>
  onToggleTech: (id: string) => void
  highlightId?: string | null
  highlightTechId?: string | null
  expandSection?: string | null
  highlightItemId?: string | null
}) {
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => updateFolder(folder.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      setEditOpen(false)
      toast.success('Folder updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteFolder(folder.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      toast.success('Folder deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const sorted = sortItems(technologies, sortKey, (t) => t.name)

  return (
    <>
      <div className={cn('border-b border-border', isExpanded && 'bg-accent/50 dark:bg-[#18191a]/50')}>
        <div className="group flex items-center gap-2 px-4 py-2.5 hover:bg-accent transition-colors">
          <button
            onClick={onToggle}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
          >
            {isExpanded
              ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            <span className={cn('text-sm font-medium truncate', isExpanded && 'text-primary')}>
              {folder.name}
            </span>
            <span className="text-xs text-muted-foreground bg-border rounded px-1.5 py-0.5 leading-none">
              {technologies.length}
            </span>
          </button>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete folder &quot;{folder.name}&quot;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The folder will be removed. Technologies inside will stay but will become uncategorized.
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
        {isExpanded && (
          <div className="pl-2">
            {sorted.map((tech) => (
              <TechRowItem
                key={tech.id}
                tech={tech}
                folders={folders}
                isExpanded={expandedTechIds.has(tech.id)}
                isHighlighted={highlightId === tech.id}
                onToggle={() => onToggleTech(tech.id)}
                defaultSection={highlightTechId === tech.id ? expandSection : null}
                highlightItemId={highlightTechId === tech.id ? highlightItemId : null}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit folder</DialogTitle></DialogHeader>
          <FolderForm
            initialName={folder.name}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setEditOpen(false)}
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
