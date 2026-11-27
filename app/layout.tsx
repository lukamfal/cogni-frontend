import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { PreferencesProvider, PREFERENCES_SCRIPT } from '@/hooks/usePreferences'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: 'CogniMente — Exercícios para a mente',
  description: 'App de treinamento cognitivo para idosos com jogos interativos',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6efe2',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The preferences script sets font size and data-theme on <html> before React hydrates.
    <html lang="pt-BR" className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }} />
      </head>
      <body>
        <PreferencesProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  )
}
