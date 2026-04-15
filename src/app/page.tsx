import { LandingHeader } from "@/components/layout/LandingHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Zap, 
  FileText, 
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm font-medium border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-3 duration-500">
                🚀 Inteligência Artificial aplicada ao PNCP
              </Badge>
              
              <h1 className="font-heading text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                Domine as Licitações Públicas com <span className="text-primary italic">Insight</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000">
                Acompanhe oportunidades, analise editais complexos com IA e gere propostas vencedoras de forma automatizada. A escala que sua empresa precisa para vender ao governo.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-base gap-2 group">
                    Começar Gratuitamente <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#solutions">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                    Ver Demonstração
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-50" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-400/10 blur-[100px] rounded-full opacity-30" />
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Search className="w-6 h-6 text-primary" />}
                title="Busca Inteligente"
                description="Filtre licitações por UF, modalidade e valor em tempo real com dados sincronizados do PNCP."
              />
              <FeatureCard 
                icon={<BrainCircuit className="w-6 h-6 text-primary" />}
                title="Análise com Gemini IA"
                description="Identifique riscos e requisitos técnicos em editais de centenas de páginas em segundos."
              />
              <FeatureCard 
                icon={<FileText className="w-6 h-6 text-primary" />}
                title="Automação de Propostas"
                description="Gere propostas de habilitação e técnicas personalizadas com base no seu acervo."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; 2026 PNCP Insight. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card border p-8 rounded-2xl hover:shadow-lg hover:border-primary/50 transition-all duration-300">
      <div className="mb-4 bg-primary/5 w-12 h-12 flex items-center justify-center rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
