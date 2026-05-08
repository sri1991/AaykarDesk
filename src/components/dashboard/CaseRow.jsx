import { useNavigate } from 'react-router-dom'
import { cx } from '../../lib/utils.js'
import StatusBadge from '../shared/StatusBadge.jsx'
import PriorityBadge from '../shared/PriorityBadge.jsx'
import DeadlineIndicator from './DeadlineIndicator.jsx'

const PRIORITY_BORDER = {
  critical: 'border-l-[3px] border-l-red-600',
  high: 'border-l-[3px] border-l-amber-500',
  medium: 'border-l-[3px] border-l-navy-300',
  low: 'border-l-[3px] border-l-navy-100',
}

export default function CaseRow({ row }) {
  const navigate = useNavigate()
  return (
    <tr
      onClick={() => navigate(`/cases/${row.id}`)}
      className={cx(
        'cursor-pointer border-b border-navy-50 hover:bg-cream-100 transition-colors',
        PRIORITY_BORDER[row.priority] || PRIORITY_BORDER.medium,
      )}
    >
      <td className="px-4 py-3 font-mono text-table text-navy-700">{row.case_number}</td>
      <td className="px-4 py-3">
        <div className="font-medium text-navy-900">{row.client_name}</div>
        <div className="font-mono text-xs text-navy-500">{row.client_pan || '—'}</div>
      </td>
      <td className="px-4 py-3 font-mono text-table text-navy-700">{row.notice_section || '—'}</td>
      <td className="px-4 py-3 font-mono text-table text-navy-700">{row.assessment_year}</td>
      <td className="px-4 py-3"><DeadlineIndicator date={row.deadline} /></td>
      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
      <td className="px-4 py-3"><PriorityBadge priority={row.priority} /></td>
    </tr>
  )
}
