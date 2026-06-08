'use client'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
﻿
import NewsCenter from '@/components/news/NewsCenter'

export default function NewsPage() {
  const { language } = useStore()
  return <NewsCenter />
}
