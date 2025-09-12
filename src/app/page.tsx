import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-foreground">
              Seleção de Sistema
            </h1>
          </div>
          <ThemeToggle />
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
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
            <Button asChild size="lg">
              <Link href="/v8digital">V8DIGITAL</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/unno">UNNO</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/glm-crefisacp">GLM - CREFISACP</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/queromais">QUERO+</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/lev">LEV (Diversos Bancos)</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/facta">FACTA</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/presencabank">PRESENÇABANK</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/qualibanking">QUALIBANKING</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/pan">PAN</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/brb-inconta">BRB-INCONTA</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/neocredito">NEOCREDITO</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/prata-digital">PRATA DIGITAL</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/phtech">PHTECH</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/totalcash">TOTALCASH</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/amigoz">AMIGOZ</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/brb-esteira">BRB ESTEIRA</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/bmg">BMG</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/inter">INTER</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/digio">DIGIO</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ECS System. All rights reserved.
      </footer>
    </div>
  );
}