import { useEffect, useState } from 'react'
import { demoStore } from '../lib/demoStore.js'

export function useCases() {
  const [cases, setCases] = useState(() => demoStore.listCases())
  useEffect(() => demoStore.subscribe(() => setCases(demoStore.listCases())), [])
  return cases
}

export function useCase(id) {
  const [data, setData] = useState(() => ({
    case: demoStore.getCase(id),
    checklist: demoStore.getChecklist(id),
    magicLink: demoStore.getMagicLink(id),
    triage: demoStore.getTriage(id),
    uploads: demoStore.getUploads(id),
  }))
  useEffect(
    () =>
      demoStore.subscribe(() =>
        setData({
          case: demoStore.getCase(id),
          checklist: demoStore.getChecklist(id),
          magicLink: demoStore.getMagicLink(id),
          triage: demoStore.getTriage(id),
          uploads: demoStore.getUploads(id),
        }),
      ),
    [id],
  )
  return data
}

export function useCaseByToken(token) {
  const [data, setData] = useState(() => {
    const found = demoStore.getCaseByToken(token)
    if (!found) return null
    return {
      ...found,
      checklist: demoStore.getChecklist(found.case.id),
      uploads: demoStore.getUploads(found.case.id),
    }
  })
  useEffect(
    () =>
      demoStore.subscribe(() => {
        const found = demoStore.getCaseByToken(token)
        if (!found) return setData(null)
        setData({
          ...found,
          checklist: demoStore.getChecklist(found.case.id),
          uploads: demoStore.getUploads(found.case.id),
        })
      }),
    [token],
  )
  return data
}
