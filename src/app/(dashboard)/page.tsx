import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Layers, 
  FileCheck, 
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardIndex() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">O resumo da sua atividade e novas oportunidades do PNCP.</p>
        </div>
        <Link href="/dashboard/busca">
          <Button className="gap-2">
            Nova Busca <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Acompanhando" 
          value="12" 
          description="Licitações monitoradas" 
          icon={<Layers className="w-4 h-4 text-primary" />} 
        />
        <StatCard 
          title="Participando" 
          value="3" 
          description="Processos em andamento" 
          icon={<Clock className="w-4 h-4 text-orange-500" />} 
        />
        <StatCard 
          title="Propostas Geradas" 
          value="8" 
          description="Nos últimos 30 dias" 
          icon={<FileCheck className="w-4 h-4 text-emerald-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" /> Próximos Prazos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <DeadlineItem 
                title="Aquisição de Mobiliário" 
                org="Prefeitura Municipal de Belo Horizonte" 
                date="Amanhã, 14:00"
                status="Pendente"
              />
              <DeadlineItem 
                title="Serviços de Manutenção TI" 
                org="Tribunal de Justiça de SP" 
                date="18/04 às 10:00"
                status="Preenchendo"
              />
            </div>
            <Button variant="link" className="mt-4 px-0">Ver todos os prazos</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" /> Novidades para você
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-center py-12">
               <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                 <RefreshCcw className="w-6 h-6 text-muted-foreground animate-spin-slow" />
               </div>
               <p className="text-sm text-muted-foreground">Sincronizando novas oportunidades com base no seu perfil...</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon }: { title: string, value: string, description: string, icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function DeadlineItem({ title, org, date, status }: { title: string, org: string, date: string, status: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{org}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-primary">{date}</p>
        <p className="text-xs text-muted-foreground uppercase">{status}</p>
      </div>
    </div>
  )
}

function RefreshCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}
