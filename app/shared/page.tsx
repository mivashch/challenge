'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Copy, Check, X, Share2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { fetchTechnologies, revokePublicToken } from '@/lib/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SharedLinksPage() {
  const queryClient = useQueryClient()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data: technologies, isLoading } = useQuery({
    queryKey: ['technologies'],
    queryFn: fetchTechnologies,
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokePublicToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] })
      toast.success('Link revoked')
    },
    onError: () => toast.error('Failed to revoke link'),
  })

  function copyLink(id: string, token: string) {
    const url = `${window.location.origin}/share/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const shared = technologies?.filter((t) => t.public_token) ?? []

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground">Loading...</p></div>

  return (
    <div className="p-6 max-w-3xl mx-auto overflow-y-auto h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Shared Links</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage public read-only links for your technologies
          </p>
        </div>
        <Badge variant="secondary">{shared.length} active</Badge>
      </div>

      {shared.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <Share2 className="w-8 h-8 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No shared technologies yet. Open any technology card and click <strong>Share</strong> to generate a public link.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shared.map((tech) => {
            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${tech.public_token}`
            return (
              <Card key={tech.id}>
                <CardContent className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/technologies/${tech.id}`}
                      className="font-medium text-sm hover:underline text-primary"
                    >
                      {tech.name}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{url}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyLink(tech.id, tech.public_token!)}
                    >
                      {copiedId === tech.id
                        ? <Check className="w-3.5 h-3.5 text-green-500" />
                        : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => revokeMutation.mutate(tech.id)}
                      disabled={revokeMutation.isPending}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
