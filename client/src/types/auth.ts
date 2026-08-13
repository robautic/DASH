export type Role = 'ADMIN' | 'SUPERVISOR' | 'ATTENDANT' | 'VIEWER'

export interface AuthUser {
  uid: string
  email: string
  role: Role
  departmentIds: string[]
  attendantId: string | null
}
