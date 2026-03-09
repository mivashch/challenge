'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Command } from '@/lib/supabase'

interface CommandFormProps {
  initial?: Command
  onSubmit: (data: { command: string; description: string }) => void
  onCancel: () => void
  loading?: boolean
}

export function CommandForm({ initial, onSubmit, onCancel, loading }: CommandFormProps) {
  const [command, setCommand] = useState(initial?.command ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!command.trim()) return
    onSubmit({ command: command.trim(), description: description.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="command-text">Command</Label>
        <Input
          id="command-text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. docker ps -a"
          required
          className="font-mono"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="command-description">Description (optional)</Label>
        <Textarea
          id="command-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this command do?"
          rows={2}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  )
}
