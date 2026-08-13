import { useState, type FormEvent } from 'react'
import { useAuth } from '@/app/AuthContext'
import { useCreateGoal, useGoals } from '@/features/goals/useGoals'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

function ProgressBar({ actual, target }: { actual: number | null; target: number }) {
  if (actual == null) {
    return <span className="text-sm text-[var(--color-text-muted)]">Dados indisponíveis</span>
  }
  const pct = Math.min((actual / target) * 100, 100)
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-mono-nums text-[var(--color-text-muted)]">
        <span>{actual}</span>
        <span>{target}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-raised)]">
        <div
          className={pct >= 100 ? 'h-full rounded-full bg-[var(--color-positive)]' : 'h-full rounded-full bg-[var(--color-accent)]'}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  )
}

function NewGoalForm() {
  const createGoal = useCreateGoal()
  const [attendantId, setAttendantId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [period, setPeriod] = useState('')
  const [target, setTarget] = useState('')
  const [metric, setMetric] = useState<'leads' | 'conversions' | 'revenue'>('leads')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createGoal.mutateAsync({
        attendantId: attendantId || undefined,
        departmentId: departmentId || undefined,
        period,
        target: Number(target),
        metric,
      })
      setAttendantId('')
      setDepartmentId('')
      setPeriod('')
      setTarget('')
    } catch {
      setError('Não foi possível criar a meta — confira se preencheu exatamente atendente OU departamento.')
    }
  }

  return (
    <Card className="mb-6">
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Nova meta</p>
      <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Input placeholder="attendantId" value={attendantId} onChange={(e) => setAttendantId(e.target.value)} />
        <Input placeholder="departmentId" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} />
        <Input placeholder="YYYY-MM" value={period} onChange={(e) => setPeriod(e.target.value)} required />
        <Select value={metric} onChange={(e) => setMetric(e.target.value as typeof metric)}>
          <option value="leads">Leads</option>
          <option value="conversions">Conversões</option>
          <option value="revenue">Receita</option>
        </Select>
        <Input
          type="number"
          placeholder="meta"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />
        <Button type="submit" className="col-span-2 sm:col-span-1" disabled={createGoal.isPending}>
          Criar
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>}
    </Card>
  )
}

export function MetasPage() {
  const { profile } = useAuth()
  const { data, isLoading, isError } = useGoals()

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Metas</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Meta de receita fica indisponível até existir uma fonte real de valor monetário por conversão.
      </p>

      {profile?.role === 'ADMIN' && <div className="mt-4">{<NewGoalForm />}</div>}

      {isLoading && <p className="mt-6 text-[var(--color-text-muted)]">Carregando…</p>}
      {isError && <p className="mt-6 text-[var(--color-danger)]">Dados indisponíveis.</p>}

      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.map((goal) => (
          <Card key={goal.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text)]">
                {goal.attendantId ?? goal.departmentId} · {goal.metric} · {goal.period}
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar actual={goal.actual} target={goal.target} />
            </div>
          </Card>
        ))}
        {data?.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Nenhuma meta no seu escopo.</p>}
      </div>
    </div>
  )
}
