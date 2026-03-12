'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Technology, Folder } from '@/lib/supabase'

interface TechnologyFormProps {
  initial?: Technology
  folders?: Folder[]
  onSubmit: (data: { name: string; description?: string; folder_id?: string | null }) => void
  onCancel: () => void
  loading?: boolean
}

export function TechnologyForm({ initial, folders = [], onSubmit, onCancel, loading }: TechnologyFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [folderId, setFolderId] = useState<string | null>(initial?.folder_id ?? null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim() || undefined, folder_id: folderId || null })
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
      {folders.length > 0 && (
        <div className="space-y-1">
          <Label>Folder</Label>
          <Select value={folderId ?? 'none'} onValueChange={(v) => setFolderId(v === 'none' ? null : v)}>
            <SelectTrigger id="tech-folder">
              <SelectValue placeholder="Without folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Without folder</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  )
}
