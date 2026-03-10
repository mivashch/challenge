'use client'

import { useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyTechnology } from './actions'

export function CopyButton({ token }: { token: string }) {
  const [loading, setLoading] = useState(false)

  async function handleCopy() {
    setLoading(true)
    try {
      await copyTechnology(token)
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
