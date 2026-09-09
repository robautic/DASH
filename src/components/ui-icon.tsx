type IconName='dashboard'|'pipeline'|'chat'|'link'|'settings'|'search'|'bell'|'arrow'|'whatsapp'|'extension'|'team'|'tag'|'user'|'chart'

export function UiIcon({name,size=18}:{name:IconName;size?:number}){
  const paths:Record<IconName,React.ReactNode>={
    dashboard:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    pipeline:<><path d="M5 5h14M5 12h9M5 19h5"/><circle cx="19" cy="12" r="2"/><circle cx="15" cy="19" r="2"/></>,
    chat:<><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/></>,
    link:<><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2.8 2.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.6V21h-4v-.1A1.8 1.8 0 0 0 8.8 19a1.8 1.8 0 0 0-2 .4l-.1.1-2.8-2.8.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 2.8 13H2v-4h.8a1.8 1.8 0 0 0 1.6-1.1 1.8 1.8 0 0 0-.4-2l-.1-.1L6.7 3l.1.1a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 9.9 2H14v.1a1.8 1.8 0 0 0 1.1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1L20 6l-.1.1a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21 9.2h1V13h-1a1.8 1.8 0 0 0-1.6 2z"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,arrow:<><path d="M5 19 19 5M10 5h9v9"/></>,
    whatsapp:<><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5z"/><path d="M8.4 7.8c.3 3.9 3 6.5 6.8 7.5"/></>,
    extension:<><path d="M8 3h5v5h5v5h3v5h-5v3h-5v-5H6v-5H3V6h5z"/></>,team:<><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M15 15c3 0 5 1.5 5 4"/></>,tag:<><path d="M20 12 12 20l-9-9V4h7z"/><circle cx="7.5" cy="8.5" r="1"/></>,user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3-8 8-8s8 3 8 8"/></>,chart:<><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
