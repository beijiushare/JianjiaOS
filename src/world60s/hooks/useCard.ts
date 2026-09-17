import { useEffect, useRef, useState } from 'react'

export function useCard<T>(fetcher: () => Promise<T | null>): {
  data: T | null
  loading: boolean
  error: boolean
} {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: boolean
  }>({ data: null, loading: true, error: false })
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    let cancelled = false
    fetcher()
      .then((data) => {
        if (cancelled) return
        setState({ data, loading: false, error: data == null })
        fetchedRef.current = true
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, loading: false, error: true })
      })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
