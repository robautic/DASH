// Fallback do <Suspense> em torno das rotas lazy-loaded (ver AppRouter.tsx).
// Existe pra evitar tela branca durante o code-splitting por rota (chunk
// sendo baixado) — requisito explícito do spec ("skeleton loading").
export function PageSkeleton() {
  return (
    <div className="space-y-4 p-6 animate-pulse" role="status" aria-label="Carregando página">
      <div className="h-6 w-48 rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  )
}
