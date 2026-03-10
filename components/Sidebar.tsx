'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Layers, Plus, ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { fetchTechnologies, createTechnology } from '@/lib/queries'
import { TechnologyForm } from '@/components/technologies/TechnologyForm'

export function Sidebar() {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [techsOpen, setTechsOpen] = useState(true)

  const { data: technologies } = useQuery({
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
    <>
      <aside className="w-60 shrink-0 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col fixed top-0 bottom-0 left-0 z-20 overflow-hidden">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border/40 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm leading-tight">Dev Knowledge Hub</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {/* Technologies section */}
          <div>
            <button
              onClick={() => setTechsOpen(!techsOpen)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                TECHNOLOGIES
              </span>
              {techsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {techsOpen && (
              <div className="mt-0.5 space-y-0.5">
                {technologies?.map((tech) => {
                  const isActive = pathname === `/technologies/${tech.id}`
                  return (
                    <Link
                      key={tech.id}
                      href={`/technologies/${tech.id}`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                        isActive
                          ? 'bg-primary/15 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      )}
                    >
                      <span className="truncate">{tech.name}</span>
                    </Link>
                  )
                })}

                <button
                  onClick={() => setCreateOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New technology</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Technology</DialogTitle>
          </DialogHeader>
          <TechnologyForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setCreateOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
