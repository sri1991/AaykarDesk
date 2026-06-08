import { useEffect, useState } from 'react'
import { listCases, getCaseBundle, getCaseByToken, subscribeData } from '../lib/api.js'

const EMPTY_BUNDLE = {
  case: null,
  checklist: [],
  magicLink: null,
  triage: null,
  uploads: [],
  referenceGuidance: null,
  clientFinancials: [],
}

export function useCases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const run = () =>
      listCases()
        .then((r) => active && setCases(r))
        .catch(() => active && setCases([]))
        .finally(() => active && setLoading(false))
    run()
    const unsub = subscribeData(run)
    return () => {
      active = false
      unsub()
    }
  }, [])

  return { cases, loading }
}

export function useCase(id) {
  const [data, setData] = useState({ ...EMPTY_BUNDLE })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    const run = () =>
      getCaseBundle(id)
        .then((r) => active && setData(r))
        .catch(() => active && setData({ ...EMPTY_BUNDLE }))
        .finally(() => active && setLoading(false))
    run()
    const unsub = subscribeData(run)
    return () => {
      active = false
      unsub()
    }
  }, [id])

  return { ...data, loading }
}

export function useCaseByToken(token) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    const run = () =>
      getCaseByToken(token)
        .then((r) => active && setData(r))
        .catch(() => active && setData(null))
        .finally(() => active && setLoading(false))
    run()
    const unsub = subscribeData(run)
    return () => {
      active = false
      unsub()
    }
  }, [token])

  return { data, loading }
}
