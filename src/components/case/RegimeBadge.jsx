import { ScanLine, Building2, Globe2, Shield } from 'lucide-react'
import { cx } from '../../lib/utils.js'

const REGIME_META = {
  faceless: { icon: ScanLine, label: 'Faceless · NaFAC', cls: 'border-blue-200 bg-blue-50 text-blue-800' },
  jurisdictional: { icon: Building2, label: 'Jurisdictional', cls: 'border-amber-200 bg-amber-50 text-amber-800' },
  transfer_pricing: { icon: Globe2, label: 'Transfer Pricing', cls: 'border-purple-200 bg-purple-50 text-purple-800' },
  search_case: { icon: Shield, label: 'Search Case', cls: 'border-red-200 bg-red-50 text-red-800' },
}

export default function RegimeBadge({ regime, isFaceless }) {
  const key = regime || (isFaceless ? 'faceless' : 'jurisdictional')
  const meta = REGIME_META[key] || REGIME_META.jurisdictional
  const Icon = meta.icon
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium', meta.cls)}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  )
}
