'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <Tabs defaultValue="write">
        <TabsList className="h-8">
          <TabsTrigger value="write" className="text-xs">Write</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="mt-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note in Markdown..."
            rows={8}
            className="font-mono text-sm resize-none"
            required
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-2">
          <div className="min-h-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none overflow-auto">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  )
}
