'use client'

import { useAuth } from '@/hooks/useAuth'
import BreakGuard from '@/components/BreakGuard'
import MedicationAlert from '@/components/MedicationAlert'
import DailyCheckin from '@/components/DailyCheckin'

/** Care features for the person who plays: daily check-in, medication reminders and the break after long use. */
export default function PlayerGuards() {
  const { user } = useAuth()
  if (!user || user.role === 'caregiver') return null
  return (
    <>
      <DailyCheckin userId={user.id} firstName={user.name.split(' ')[0]} />
      <MedicationAlert />
      {/* Last, so the break always sits on top of the other windows. */}
      <BreakGuard />
    </>
  )
}
