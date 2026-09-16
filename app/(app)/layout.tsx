'use client'

import Navbar from '@/components/layout/Navbar'
import HealthReminders from '@/components/HealthReminders'
import DailyCheckIn from '@/components/DailyCheckin'
import { MedicationAlert } from '@/components/MedicationReminder'
import { useAuth } from '@/hooks/useAuth'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
        {children}
      </main>
      <HealthReminders />
      <MedicationAlert />
      {user && <DailyCheckIn userName={user.name} />}
    </div>
  )
}