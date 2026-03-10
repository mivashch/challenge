'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Note } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface NoteFormProps {
  initial?: Note
  onSubmit: (data: { content: string }) => void
  onCancel: () => void
  loading?: boolean
}

export function NoteForm({ initial, onSubmit, onCancel, loading }: NoteFormProps) {
  const [content, setContent] = useState(initial?.content ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit({ content: content.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 h-full">
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Write</p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note in Markdown..."
            className="flex-1 font-mono text-sm resize-none h-full min-h-[420px]"
            required
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-border shrink-0" />

        {/* Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Preview</p>
          <div className="flex-1 rounded-md border border-input bg-background/50 px-4 py-3 text-sm prose prose-sm dark:prose-invert max-w-none overflow-y-auto min-h-[420px]">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end shrink-0">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  )
}
