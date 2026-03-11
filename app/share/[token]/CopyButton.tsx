'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyTechnology } from './actions'

export function CopyButton({ token }: { token: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  async function handleCopy() {
    setLoading(true)
    try {
      const newId = await copyTechnology(token)
      await queryClient.refetchQueries({ queryKey: ['technologies'] })
      router.push(`/?highlight=${newId}`)
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCopy} disabled={loading} size="sm" variant="secondary">
      <Copy className="w-4 h-4 mr-2" />
      {loading ? 'Copying...' : 'Copy to my account'}
    </Button>
  )
}
