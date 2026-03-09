'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Technology } from '@/lib/supabase'

interface TechnologyFormProps {
  initial?: Technology
  onSubmit: (data: { name: string; description: string }) => void
  onCancel: () => void
  loading?: boolean
}

export function TechnologyForm({ initial, onSubmit, onCancel, loading }: TechnologyFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="tech-name">Name</Label>
        <Input
          id="tech-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Docker, Git, Kubernetes"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="tech-description">Description (optional)</Label>
        <Textarea
          id="tech-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of this technology"
          rows={3}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  )
}
