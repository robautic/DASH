export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-neutral-500">LeadDash</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">Fase 1 concluída — esta tela chega em uma fase futura.</p>
      </div>
    </div>
  )
}
