// The studio's theme, which its screens follow: the visitor's choice, kept in their browser, or
// their system's when they have not chosen.
import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../canvas/protocol.ts'

const KEY = 'mylder-design/theme'

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function savedTheme(): Theme | undefined {
  try {
    const saved = localStorage.getItem(KEY)
    return saved === 'light' || saved === 'dark' ? saved : undefined
  } catch {
    return undefined
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => savedTheme() ?? systemTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // the choice lasts for this visit
    }
  }, [])

  return [theme, setTheme] as const
}
