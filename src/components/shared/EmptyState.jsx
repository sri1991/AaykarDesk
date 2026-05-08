import { Inbox } from 'lucide-react'

export default function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-12 w-12 rounded-full bg-cream-200 text-navy-700 grid place-items-center mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-base font-medium text-navy-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-navy-600">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
