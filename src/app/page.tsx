
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileText, LayoutDashboard, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";


type System = {
  name: string;
  href: string;
  variant: 'default' | 'secondary';
  active: boolean;
};

const systems: System[] = [
    { name: "V8DIGITAL", href: "/v8digital", variant: "default", active: true },
    { name: "UNNO", href: "/unno", variant: "secondary", active: true },
    { name: "PAN", href: "/pan", variant: "secondary", active: true },
    { name: "LEV (Diversos)", href: "/lev", variant: "default", active: true },
    { name: "BRB-INCONTA", href: "/brb-inconta", variant: "default", active: true },
    { name: "GLM - CREFISACP", href: "/glm-crefisacp", variant: "default", active: true },
    { name: "QUERO+", href: "/queromais", variant: "secondary", active: true },
    { name: "QUALIBANKING", href: "/qualibanking", variant: "default", active: true },
    { name: "NEOCREDITO", href: "/neocredito", variant: "secondary", active: true },
    { name: "2TECH", href: "/2tech", variant: "secondary", active: true },
    { name: "FACTA", href: "/facta", variant: "secondary", active: true },
    { name: "TOTALCASH", href: "/totalcash", variant: "default", active: false },
];


export default function Home() {
  const activeSystems = systems.filter(s => s.active);
  const inactiveSystems = systems.filter(s => !s.active);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b border-border/50 shadow-sm bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-foreground">
              Seleção de Sistema
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2" />
                Dashboard
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-xl bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-headline">
              Escolha um sistema
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Cada sistema possui regras específicas para o processamento de
              propostas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
             <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Sistemas Ativos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {activeSystems.map(system => (
                        <Button asChild size="lg" key={system.name} variant={system.variant}>
                            <Link href={system.href}>
                                <CheckCircle className="mr-2" />
                                {system.name}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>

            <Separator />
            
            <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-4 text-center">Sistemas Pendentes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {inactiveSystems.map(system => (
                         <Button asChild size="lg" key={system.name} variant={system.variant}>
                            <Link href={system.href}>
                                <XCircle className="mr-2" />
                                {system.name}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ECS System. All rights reserved.
      </footer>
    </div>
  );
}
