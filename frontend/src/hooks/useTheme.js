import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

function hasSavedChoice() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark'
  } catch {
    return false
  }
}

// The theme is "light" or "dark". index.html already applied it before React started;
// here we just read it, let the user change it, and remember the choice.
export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  )

  const toggleTheme = useCallback(() => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // storage blocked: the choice simply won't be remembered
    }
  }, [])

  // Until the user picks a theme themselves, follow the operating system setting.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function onSystemChange(e) {
      if (hasSavedChoice()) return
      const next = e.matches ? 'dark' : 'light'
      applyTheme(next)
      setTheme(next)
    }

    media.addEventListener('change', onSystemChange)
    return () => media.removeEventListener('change', onSystemChange)
  }, [])

  return { theme, toggleTheme }
}
