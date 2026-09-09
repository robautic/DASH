'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brand } from '@/components/brand'
import { UiIcon } from '@/components/ui-icon'

const nav=[
  ['/dashboard','Dashboard','dashboard'],['/pipeline','Pipeline','pipeline'],['/conversas','Conversas','chat'],['/conexoes','Conexões','link'],['/configuracoes','Configurações','settings'],
] as const

export function AppShell({children,workspaceName,role,email}:{children:React.ReactNode;workspaceName:string;role:string;email:string}){
  const pathname=usePathname();const router=useRouter()
  async function signOut(){await createClient().auth.signOut();router.replace('/login');router.refresh()}
  const initial=(email||workspaceName||'D').slice(0,1).toUpperCase()
  return <div className="app-grid"><aside className="sidebar"><div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><Brand/><span className="brand-beta">BETA</span></div><nav className="nav">{nav.map(([href,label,icon])=><Link href={href} key={href} data-active={pathname.startsWith(href)} title={label}><span className="nav-icon"><UiIcon name={icon}/></span><span className="nav-label">{label}</span></Link>)}</nav><div className="sidebar-bottom"><div className="sidebar-user"><div className="sidebar-avatar">{initial}</div><div className="sidebar-user-copy"><strong>{workspaceName}</strong><span>{email}</span></div></div><button onClick={signOut} className="sidebar-signout">Sair da conta</button></div></aside><main className="main"><header className="topbar"><div className="topbar-left"><span className="workspace-name">{workspaceName}</span><span className="role-pill">{role}</span></div><div className="topbar-tools"><input className="topbar-search" aria-label="Busca rápida" placeholder="Buscar na operação…"/><button className="topbar-icon" title="Buscar"><UiIcon name="search"/></button><button className="topbar-icon" title="Notificações"><UiIcon name="bell"/></button><div className="status-dot"><span/> Ao vivo</div></div></header>{children}</main></div>
}
