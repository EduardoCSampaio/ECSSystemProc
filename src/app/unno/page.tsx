import { EcsDataProcessor } from "@/components/ecs-data-processor";
import { ClipboardPaste, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnnoPage() {
  return (
    <div className="flex flex-col min-h-screen">
       <header className="p-4 border-b border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardPaste className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-foreground">
              UNNO - Processador de Propostas
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
        <EcsDataProcessor system="UNNO" />
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ECS System. All rights reserved.
      </footer>
    </div>
  );
}
