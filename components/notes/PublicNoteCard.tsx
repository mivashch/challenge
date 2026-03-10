'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const firstLine = (content: string) => content.split('\n')[0].replace(/^#+\s*/, '').trim()

export function PublicNoteCard({ content }: { content: string }) {
  const isLong = content.includes('\n') || content.length > 120
  const [expanded, setExpanded] = useState(!isLong)

  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        {expanded ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm truncate">{firstLine(content)}</p>
        )}
        {isLong && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground px-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded
                ? <><ChevronUp className="w-3.5 h-3.5 mr-1" />Collapse</>
                : <><ChevronDown className="w-3.5 h-3.5 mr-1" />Expand</>}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
