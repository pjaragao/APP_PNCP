import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'

export function LandingHeader() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">
            PNCP<span className="text-primary">Insight</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Recursos
          </Link>
          <Link href="#solutions" className="text-sm font-medium hover:text-primary transition-colors">
            Soluções
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Preços
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="hidden sm:inline-flex">Começar Agora</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
