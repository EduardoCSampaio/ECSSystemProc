
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, LayoutDashboard, Trash2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export type ProcessHistoryItem = {
  id: string;
  system: string;
  fileName: string;
  processedAt: string;
};

export default function DashboardPage() {
  const [history, setHistory] = useLocalStorage<ProcessHistoryItem[]>('processHistory', []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sortedHistory = isClient ? [...history].sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()) : [];

  const processCounts = isClient ? history.reduce((acc, item) => {
    acc[item.system] = (acc[item.system] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="flex flex-col min-h-screen">
       <header className="p-4 border-b border-border/50 shadow-sm bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-foreground">
              Dashboard de Atividades
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2" />
                Voltar
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="container mx-auto grid gap-6">
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Processamentos</CardTitle>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isClient ? history.length : 0}</div>
                <p className="text-xs text-muted-foreground">arquivos processados no total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistemas Utilizados</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isClient ? Object.keys(processCounts).length : 0}</div>
                <p className="text-xs text-muted-foreground">bancos diferentes</p>
              </CardContent>
            </Card>
          </section>

          <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Processamento</CardTitle>
                <CardDescription>
                  Veja os últimos arquivos que foram processados.
                </CardDescription>
              </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="destructive" disabled={!isClient || history.length === 0}>
                        <Trash2 className="mr-2" /> Limpar Histórico
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá apagar permanentemente
                        todo o histórico de processamento do seu navegador.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto max-h-[60vh]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card/90 backdrop-blur-sm">
                    <TableRow>
                      <TableHead>Sistema</TableHead>
                      <TableHead>Nome do Arquivo</TableHead>
                      <TableHead className="text-right">Data e Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isClient && sortedHistory.length > 0 ? (
                      sortedHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.system}</TableCell>
                          <TableCell>{item.fileName}</TableCell>
                          <TableCell className="text-right">
                            {new Date(item.processedAt).toLocaleString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <AlertTriangle className="h-8 w-8" />
                            <span>Nenhum histórico de processamento encontrado.</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ECS System. All rights reserved.
      </footer>
    </div>
  );
}

// Re-importing FileText since it's used in the Card.
import { FileText } from "lucide-react";
