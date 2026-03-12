export type Folder = {
  id: string
  user_id: string
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type Technology = {
  id: string
  name: string
  description: string | null
  folder_id: string | null
  created_at: string
  updated_at: string
  public_token: string | null
}

export type Command = {
  id: string
  technology_id: string
  command: string
  description: string | null
  created_at: string
  updated_at: string
}

export type Link = {
  id: string
  technology_id: string
  url: string
  title: string | null
  created_at: string
  updated_at: string
}

export type Note = {
  id: string
  technology_id: string
  content: string
  created_at: string
  updated_at: string
}
