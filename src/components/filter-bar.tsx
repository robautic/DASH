'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { FilterOptions } from '@/lib/domain'

export function FilterBar({ options }: { options: FilterOptions }) {
  const router = useRouter()
  const params = useSearchParams()

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value); else next.delete(key)
    router.push(`?${next.toString()}`)
  }

  return (
    <div className="filters">
      <select className="select" value={params.get('source') || ''} onChange={(e) => set('source', e.target.value)}><option value="">Todas as fontes</option>{options.sources?.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select>
      <select className="select" value={params.get('connection') || ''} onChange={(e) => set('connection', e.target.value)}><option value="">Todos os números</option>{options.connections?.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
      <select className="select" value={params.get('owner') || ''} onChange={(e) => set('owner', e.target.value)}><option value="">Todos responsáveis</option>{options.members?.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
      <select className="select" value={params.get('pipeline') || ''} onChange={(e) => set('pipeline', e.target.value)}><option value="">Todos pipelines</option>{options.pipelines?.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
      <select className="select" value={params.get('stage') || ''} onChange={(e) => set('stage', e.target.value)}><option value="">Todas etapas</option>{options.stages?.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
      <select className="select" value={params.get('tag') || ''} onChange={(e) => set('tag', e.target.value)}><option value="">Todas tags</option>{options.tags?.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
      {(params.size > 0) && <button className="btn btn-secondary" onClick={() => router.push('?')}>Limpar filtros</button>}
    </div>
  )
}
