import './globals.css'

export const metadata = {
  title: 'CogniMente',
  description: 'Brain training for older adults: simple games, a daily health check-in and a weekly report for the family.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
