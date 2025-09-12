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
        <Card className="w-full max-w-lg shadow-xl bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-headline">
              Escolha um sistema
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Cada sistema possui regras específicas para o processamento de
              propostas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center items-center gap-4 p-6">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/v8digital">V8DIGITAL</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/unno">UNNO</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/glm-crefisacp">GLM - CREFISACP</Link>
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
