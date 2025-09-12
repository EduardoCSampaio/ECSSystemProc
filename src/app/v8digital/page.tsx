import { EcsDataProcessor } from "@/components/ecs-data-processor";
import { FileCog } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function V8DigitalPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b border-border shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCog className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-foreground">
              V8DIGITAL - Processador de Dados
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <EcsDataProcessor />
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ECS System. All rights reserved.
      </footer>
    </div>
  );
}
