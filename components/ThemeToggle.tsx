'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'relative flex items-center h-6 w-11 rounded-full border transition-colors duration-200 cursor-pointer shrink-0',
        isDark
          ? 'bg-primary border-primary'
          : 'bg-muted border-border'
      )}
    >
      {/* Sliding knob */}
      <span
        className={cn(
          'absolute flex items-center justify-center w-4 h-4 rounded-full bg-card shadow-sm transition-all duration-200',
          isDark ? 'left-[calc(100%-1.25rem)]' : 'left-0.5'
        )}
      >
        {isDark
          ? <Moon className="w-2.5 h-2.5 text-primary" />
          : <Sun className="w-2.5 h-2.5 text-muted-foreground" />}
      </span>
    </button>
  )
}
