import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b border-border shadow-sm">
        <div className="container mx-auto flex items-center gap-3">
          <Building className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-foreground">
            Seleção de Sistema
          </h1>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">
              Escolha um sistema para continuar
            </CardTitle>
            <CardDescription className="text-center">
              Cada sistema possui funcionalidades específicas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button asChild size="lg">
              <Link href="/v8digital">V8DIGITAL</Link>
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
