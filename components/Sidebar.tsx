'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Layers, BookOpen, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchTechnologies } from '@/lib/queries'

export function Sidebar() {
  const pathname = usePathname()

  const { data: technologies } = useQuery({
    queryKey: ['technologies'],
    queryFn: fetchTechnologies,
  })

  return (
    <aside className="w-60 shrink-0 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col fixed top-0 bottom-0 left-0 z-20 overflow-hidden">
      {/* Logo */}
      <Link href="/" className="h-14 flex items-center gap-2.5 px-4 border-b border-border/40 shrink-0 hover:opacity-80 transition-opacity">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm leading-tight">Dev Knowledge Hub</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
            pathname === '/'
              ? 'bg-primary/15 text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>Technologies</span>
          {technologies?.length ? (
            <span className="ml-auto text-xs bg-accent text-muted-foreground rounded-full px-1.5 py-0.5 leading-none">
              {technologies.length}
            </span>
          ) : null}
        </Link>

        <Link
          href="/shared"
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
            pathname === '/shared'
              ? 'bg-primary/15 text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          <span>Shared Links</span>
          {technologies?.filter(t => t.public_token).length ? (
            <span className="ml-auto text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5 leading-none">
              {technologies.filter(t => t.public_token).length}
            </span>
          ) : null}
        </Link>
      </nav>
    </aside>
  )
}
