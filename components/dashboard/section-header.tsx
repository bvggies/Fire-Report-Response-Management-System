type SectionHeaderProps = {
  label?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function SectionHeader({ label = 'Overview', title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-red-600">{label}</p>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
