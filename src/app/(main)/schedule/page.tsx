'use client'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
﻿
import ScheduleBracket from '@/components/schedule/ScheduleBracket'

export default function SchedulePage() {
  const { language } = useStore()
  return <ScheduleBracket />
}
