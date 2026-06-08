import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
export default function Footer() {
  const { language } = useStore()
  return (
    <footer className="border-t border-white/5 py-8 px-4 mt-20">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-orbitron text-sm text-[#00ff88] mb-4">{t('nav.home', language)}</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li>{t('ai.scanner', language)}</li>
              <li>{t('nav.opportunities', language)}</li>
              <li>{t('nav.leaderboard', language)}</li>
              <li>API Access</li>
            </ul>
          </div>
          <div>
            <h4 className="font-orbitron text-sm text-[#00d9ff] mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li>{t('support.docsDesc', language)}</li>
              <li>{t('support.faq', language)}</li>
              <li>{t('nav.support', language)}</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="font-orbitron text-sm text-[#ffd700] mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Risk Disclaimer</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-orbitron text-sm text-white/60 mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li>Telegram</li>
              <li>Discord</li>
              <li>Twitter</li>
              <li>Email</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-white/20 border-t border-white/5 pt-6">
          <p>© 2026 FIFA AI Arbitrage Exchange. All rights reserved.</p>
          <p className="mt-1">{t('common.loading', language)}</p>
        </div>
      </div>
    </footer>
  )
}
