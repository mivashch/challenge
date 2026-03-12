'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, Folder, FolderOpen, Pencil, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Folder as FolderType, Technology } from '@/lib/supabase'
import { updateFolder, deleteFolder } from '@/lib/queries'
import { SortKey, sortItems } from '@/lib/sort'
import { TechRowItem } from './TechRowItem'

export function FolderRow({
  folder,
  technologies,
  sortKey,
  expandedIds,
  highlightId,
  highlightTechId,
  expandSection,
  highlightItemId,
  onToggleTech,
  allFolders,
}: {
  folder: FolderType
  technologies: Technology[]
  sortKey: SortKey
  expandedIds: Set<string>
  highlightId: string | null
  highlightTechId: string | null
  expandSection: string | null
  highlightItemId: string | null
  onToggleTech: (id: string) => void
  allFolders?: FolderType[]
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(folder.name)

  const updateMutation = useMutation({
    mutationFn: (n: string) => updateFolder(folder.id, { name: n }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      setEditing(false)
      toast.success('Folder renamed')
    },
    onError: () => toast.error('Failed to rename folder'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteFolder(folder.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      toast.success('Folder deleted')
    },
    onError: () => toast.error('Failed to delete folder'),
  })

  function submitRename(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    updateMutation.mutate(name.trim())
  }

  const sorted = sortItems(technologies, sortKey, (t) => t.name)

  return (
    <div>
      {/* Folder header */}
      <div className="group flex items-center gap-1 px-3 py-1.5 border-b border-border hover:bg-accent transition-colors">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
        >
          {open
            ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          {open
            ? <FolderOpen className="w-3.5 h-3.5 text-primary shrink-0" />
            : <Folder className="w-3.5 h-3.5 text-primary shrink-0" />}

          {editing ? (
            <form onSubmit={submitRename} className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
              <Input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-6 text-xs px-1.5 py-0 flex-1"
              />
              <Button type="submit" variant="ghost" size="icon" className="h-5 w-5 shrink-0">
                <Check className="w-3 h-3" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => { setEditing(false); setName(folder.name) }}>
                <X className="w-3 h-3" />
              </Button>
            </form>
          ) : (
            <span className="text-xs font-semibold text-foreground truncate">
              {folder.name}
            </span>
          )}

          {!editing && (
            <span className="text-xs text-muted-foreground bg-accent rounded px-1 py-0.5 leading-none ml-1 shrink-0">
              {technologies.length}
            </span>
          )}
        </button>

        {!editing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditing(true)}>
              <Pencil className="w-3 h-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete folder "{folder.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The technologies inside will not be deleted — they will become ungrouped.
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
        )}
      </div>

      {/* Technologies inside folder */}
      {open && sorted.map(tech => (
        <div key={tech.id} className="pl-5">
          <TechRowItem
            tech={tech}
            folders={allFolders}
            isExpanded={expandedIds.has(tech.id)}
            isHighlighted={highlightId === tech.id}
            onToggle={() => onToggleTech(tech.id)}
            defaultSection={highlightTechId === tech.id ? expandSection : null}
            highlightItemId={highlightTechId === tech.id ? highlightItemId : null}
          />
        </div>
      ))}
    </div>
  )
}
