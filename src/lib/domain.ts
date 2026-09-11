export type TenantRole = 'owner' | 'admin' | 'member' | 'viewer'

export type WorkspaceSummary = {
  tenant_id: string
  name: string
  slug: string | null
  role: TenantRole
}

export type AppBootstrap = {
  profile?: {
    user_id?: string
    email?: string
    display_name?: string | null
    avatar_url?: string | null
  } | null
  active_workspace?: {
    tenant_id?: string
    id?: string
    name?: string
    slug?: string | null
    role?: TenantRole
  } | null
  workspaces?: WorkspaceSummary[]
  permissions?: Record<string, boolean>
  onboarding?: Record<string, unknown> | null
}

export type FilterOptions = {
  sources?: Array<{ value: string; label: string }>
  connections?: Array<{ id: string; label: string; phone_number?: string | null }>
  members?: Array<{ id: string; label: string; email?: string }>
  pipelines?: Array<{ id: string; label: string }>
  stages?: Array<{ id: string; pipeline_id: string; label: string; color?: string | null }>
  tags?: Array<{ id: string; label: string; color?: string }>
}

export type PipelineRow = {
  pipeline_id: string
  pipeline_name: string
  stage_id: string
  stage_name: string
  stage_key: string | null
  stage_color: string | null
  stage_position: number
  item_id: string | null
  contact_id: string | null
  contact_name: string | null
  contact_phone: string | null
  conversation_id: string | null
  owner_id: string | null
  owner_name?: string | null
  item_value: number | null
  currency: string | null
  item_status: 'open' | 'won' | 'lost' | null
  moved_at: string | null
  last_message_preview: string | null
  last_message_at: string | null
  tags?: unknown
}
