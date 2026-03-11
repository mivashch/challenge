'use client'

import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'

export function UserMenu({ email }: { email: string }) {
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const initials = email.slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#FF8B00] text-white flex items-center justify-center text-xs font-bold select-none">
          {initials}
        </div>
        <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[160px]">{email}</span>
      </div>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  )
}
