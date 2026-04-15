'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  Search, 
  Layers, 
  FileCheck, 
  BookOpen, 
  Settings,
  Bell,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigations = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Buscar Licitações', href: '/dashboard/busca', icon: Search },
  { name: 'Meus Itens', href: '/dashboard/itens', icon: Layers },
  { name: 'Propostas', href: '/dashboard/propostas', icon: FileCheck },
  { name: 'Meu Acervo', href: '/dashboard/acervo', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full sticky top-0">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">
              PNCP<span className="text-primary italic">Insight</span>
            </span>
          </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigations.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "group-hover:text-foreground")} />
              {item.name}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link href="/dashboard/configuracoes">
          <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
            <Settings className="w-4 h-4" /> Configurações
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" 
          size="sm"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" /> Sair
        </Button>
      </div>
    </aside>
  )
}
