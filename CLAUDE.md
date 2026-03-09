# CLAUDE.md

Project: DevStack Notes

Stack:
- Next.js App Router
- Supabase
- TanStack React Query
- shadcn/ui
- TailwindCSS

Rules:

1. Always use React Query for server data.
2. Do not fetch directly inside components.
3. All UI must use shadcn components.
4. Styling only with Tailwind.
5. Database access only through Supabase client.
6. Keep components small and reusable.

Structure:

- Supabase client in /lib/supabase.ts
- Queries in /lib/queries.ts
- UI components in /components
