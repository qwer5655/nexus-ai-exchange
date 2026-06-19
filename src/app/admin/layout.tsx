'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthUser } from '@/lib/use-auth-user'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, Users, Shield, Settings, BarChart3,
  ShoppingCart, Wallet, Bell, FileText, MessageSquare,
  Gift, Activity, Megaphone, ChevronDown, ChevronRight,
  LogOut, Menu, X, Search, CreditCard, UserPlus,
  TrendingUp, Target, Flag, Tag, Package, DollarSign,
  RefreshCw, PieChart, UserCheck, Lock, Globe,
  Mail, Key, Eye, AlertTriangle, BookOpen,
  Image, HeadphonesIcon, Link2, Download,
  Filter, MoreHorizontal, Plus, Edit, Trash2
} from 'lucide-react'

interface NavItem {
  label: string
  href?: string
  icon?: any
  children?: NavItem[]
  divider?: boolean
}

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: '概览',
    items: [
      { label: '仪表盘', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    group: '用户中心',
    items: [
      { label: '用户列表', href: '/admin/users', icon: Users },
      { label: 'VIP会员', href: '/admin/users/vip', icon: UserCheck },
      { label: '登录记录', href: '/admin/users/login-logs', icon: Eye },
    ]
  },
  {
    group: '内容中心',
    items: [
      { label: '项目管理', href: '/admin/content/projects', icon: Package },
      { label: '分类管理', href: '/admin/content/categories', icon: Tag },
      { label: '标签管理', href: '/admin/content/tags', icon: Flag },
    ]
  },
  {
    group: '订单中心',
    items: [
      { label: '订单管理', href: '/admin/orders/list', icon: ShoppingCart },
      { label: '解锁记录', href: '/admin/orders/unlocks', icon: Lock },
    ]
  },
  {
    group: '财务中心',
    items: [
      { label: '收入统计', href: '/admin/finance/revenue', icon: TrendingUp },
      { label: '余额流水', href: '/admin/finance/balance-flow', icon: RefreshCw },
      { label: '人工加款', href: '/admin/finance/manual-topup', icon: DollarSign },
    ]
  },
  {
    group: '支付中心',
    items: [
      { label: '钱包管理', href: '/admin/payment/wallets', icon: Wallet },
      { label: '充值记录', href: '/admin/payment/recharges', icon: CreditCard },
    ]
  },
  {
    group: '运营中心',
    items: [
      { label: '公告管理', href: '/admin/operations/announcements', icon: Megaphone },
      { label: 'Banner管理', href: '/admin/operations/banners', icon: Image },
      { label: '客服工单', href: '/admin/operations/tickets', icon: HeadphonesIcon },
    ]
  },
  {
    group: '推广中心',
    items: [
      { label: '邀请系统', href: '/admin/promotion/invitations', icon: Gift },
      { label: '返佣管理', href: '/admin/promotion/commissions', icon: DollarSign },
    ]
  },
  {
    group: '风控中心',
    items: [
      { label: '审计日志', href: '/admin/risk/audit', icon: FileText },
      { label: '风险监控', href: '/admin/risk/monitoring', icon: AlertTriangle },
    ]
  },
  {
    group: '系统设置',
    items: [
      { label: '网站设置', href: '/admin/settings/site', icon: Globe },
      { label: '邮件设置', href: '/admin/settings/email', icon: Mail },
      { label: '支付设置', href: '/admin/settings/payment', icon: Settings },
    ]
  },
  {
    group: '数据分析',
    items: [
      { label: '用户分析', href: '/admin/analytics/users', icon: Activity },
      { label: '转化分析', href: '/admin/analytics/conversion', icon: Target },
      { label: '收益分析', href: '/admin/analytics/revenue', icon: PieChart },
    ]
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
const { user, logout, init } = useAuthStore()
const [sidebarOpen, setSidebarOpen] = useState(false)
const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
const [mounted, setMounted] = useState(false)
const { user: authUser, loading: authLoading } = useAuthUser()

useEffect(() => { init() }, [])

useEffect(() => {
  if (authLoading) return
  var effectiveUser = authUser || user
  if (!effectiveUser) { router.push('/'); return }
  if (effectiveUser.role !== 'admin' && effectiveUser.role !== 'super_admin') { router.push('/'); return }
  setMounted(true)
  // Auto-expand current group
  const currentGroup = navGroups.find(g =>
    g.items.some(i => i.href && pathname.startsWith(i.href))
  )
    if (currentGroup) {
      setExpandedGroups(prev => ({ ...prev, [currentGroup.group]: true }))
    }
  }, [user, authUser, authLoading, pathname])

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }))
  }

  if (!mounted) return (
    <div className="h-screen bg-[#020305] flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-2 border-[#00ff88] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020305] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0E1A] border-r border-white/[0.04] transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-5 px-6 border-b border-white/[0.04]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#00d9ff] flex items-center justify-center">
            <span className="text-sm font-bold text-[#05070c]">N</span>
          </div>
          <div>
            <div className="text-base font-bold text-white">NEXUS AI</div>
            <div className="text-[13px] text-white/20 tracking-wider">ADMIN PANEL</div>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-3 pb-1">
          <div className="flex items-center gap-5 px-6 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/30 text-sm">
            <Search size={15} />
            <span style={{fontSize: '13px'}}>搜索菜单...</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-5 overflow-y-auto" style={{ height: 'calc(100vh - 130px)' }}>
          {navGroups.map(group => (
            <div key={group.group} className="mb-1">
              <button
                onClick={() => toggleGroup(group.group)}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-[13px] text-white/30 hover:text-white/50 transition-all tracking-wider"
              >
                <span>{group.group}</span>
                {expandedGroups[group.group] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {expandedGroups[group.group] && (
                <div className="space-y-0.5 mt-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon
                    const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href || '/admin/')
                    return (
                      <button
                        key={item.label}
                        onClick={() => { router.push(item.href || '/admin'); setSidebarOpen(false) }}
                        className={`flex items-center gap-5.5 w-full px-6 py-2.5 rounded-lg text-sm transition-all ${
                          active
                            ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                            : 'text-white/50 hover:text-white/70 hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        {Icon && <Icon size={16} className={active ? 'text-[#00ff88]' : 'text-white/30'} />}
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/[0.04] bg-[#0A0E1A]">
          <button
            onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-5.5 px-6 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 w-full transition-all"
          >
            <LogOut size={16} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-[#0A0E1A] border-b border-white/[0.04] flex items-center justify-between px-6 lg:px-6">
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-5 ml-auto">
            <div className="text-[13px] text-white/40">{user?.username || 'Admin'}</div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d9ff] flex items-center justify-center text-[12px] font-bold text-[#05070c]">
              {(user?.username || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#020305]">
          {children}
        </main>
      </div>
    </div>
  )
}
