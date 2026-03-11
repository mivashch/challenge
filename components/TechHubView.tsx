'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchTechnologies, createTechnology } from '@/lib/queries'
import { TechnologyForm } from './technologies/TechnologyForm'
import { TechRowItem } from './technologies/TechRowItem'

export function TechHubView() {
  const queryClient = useQueryClient()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)

  const { data: technologies, isLoading } = useQuery({
    queryKey: ['technologies'],
    queryFn: fetchTechnologies,
  })

  const createMutation = useMutation({
    mutationFn: createTechnology,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      setCreateOpen(false)
      toast.success('Technology added')
    },
    onError: () => toast.error('Failed to add technology'),
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Technologies</span>
          {technologies && (
            <span className="text-xs text-muted-foreground bg-accent rounded-full px-1.5 py-0.5 leading-none">
              {technologies.length}
            </span>
          )}
        </div>
        <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="px-5 py-4 text-sm text-muted-foreground">Loading...</div>
        )}
        {technologies?.length === 0 && !isLoading && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No technologies yet. Click <strong>Add</strong> to get started.
          </div>
        )}
        {technologies?.map((tech) => (
          <TechRowItem
            key={tech.id}
            tech={tech}
            isExpanded={expandedIds.has(tech.id)}
            onToggle={() => setExpandedIds(prev => {
              const next = new Set(prev)
              next.has(tech.id) ? next.delete(tech.id) : next.add(tech.id)
              return next
            })}
          />
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Technology</DialogTitle></DialogHeader>
          <TechnologyForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setCreateOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
