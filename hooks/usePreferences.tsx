'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export const TEXT_SIZES = [
  { label: 'A', px: 17, name: 'Padrão' },
  { label: 'A+', px: 19, name: 'Grande' },
  { label: 'A++', px: 21, name: 'Extra grande' },
]

export type Theme = 'light' | 'dark'

const SIZE_KEY = 'cogni_text_size'
const THEME_KEY = 'cogni_theme'

/**
 * Runs in <head> before the page paints, so a saved text size or night mode
 * never flashes the default first. Keep it in sync with the keys above.
 */
export const PREFERENCES_SCRIPT = `try{var s=+localStorage.getItem('${SIZE_KEY}');var px=[${TEXT_SIZES.map(t => t.px).join(',')}][s];if(px)document.documentElement.style.fontSize=px+'px';if(localStorage.getItem('${THEME_KEY}')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`

interface Prefs {
  size: number
  setSize: (i: number) => void
  theme: Theme
  setTheme: (t: Theme) => void
}

const Ctx = createContext<Prefs>({ size: 0, setSize: () => {}, theme: 'light', setTheme: () => {} })

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [size, setSizeState] = useState(0)
  const [theme, setThemeState] = useState<Theme>('light')

  // localStorage only exists in the browser, so it is read after mount to keep hydration in sync.
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(SIZE_KEY))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved >= 0 && saved < TEXT_SIZES.length) setSizeState(saved)
      if (localStorage.getItem(THEME_KEY) === 'dark') setThemeState('dark')
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.style.fontSize = `${TEXT_SIZES[size].px}px`
  }, [size])

  useEffect(() => {
    if (theme === 'dark') document.documentElement.dataset.theme = 'dark'
    else delete document.documentElement.dataset.theme
  }, [theme])

  const setSize = (i: number) => {
    setSizeState(i)
    try { localStorage.setItem(SIZE_KEY, String(i)) } catch {}
  }
  const setTheme = (t: Theme) => {
    setThemeState(t)
    try { localStorage.setItem(THEME_KEY, t) } catch {}
  }

  return <Ctx.Provider value={{ size, setSize, theme, setTheme }}>{children}</Ctx.Provider>
}

export const usePreferences = () => useContext(Ctx)
