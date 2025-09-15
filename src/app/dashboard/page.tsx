
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, LayoutDashboard, Trash2, AlertTriangle, Calendar as CalendarIcon, X as XIcon, BarChart } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';


export type ProcessHistoryItem = {
  id: string;
  system: string;
  fileName: string;
  processedAt: string;
};

export default function DashboardPage() {
  const [history, setHistory] = useLocalStorage<ProcessHistoryItem[]>('processHistory', []);
  const [isClient, setIsClient] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClearHistory = () => {
    setHistory([]);
    setDate(undefined);
  };

  const filteredHistory = isClient ? history.filter(item => {
    if (!date) return true;
    const itemDate = new Date(item.processedAt);
    const from = date.from ? new Date(new Date(date.from).setHours(0, 0, 0, 0)) : null;
    const to = date.to ? new Date(new Date(date.to).setHours(23, 59, 59, 999)) : null;
    if (from && to) return itemDate >= from && itemDate <= to;
    if (from) return itemDate >= from;
    if (to) return itemDate <= to;
    return true;
  }) : [];

  const sortedHistory = [...filteredHistory].sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());

  const { processCounts, chartData, chartConfig } = useMemo(() => {
    if (!isClient) return { processCounts: {}, chartData: [], chartConfig: {} };

    const counts = history.reduce((acc, item) => {
      acc[item.system] = (acc[item.system] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(counts).map(([system, count]) => ({
      system,
      count,
    })).sort((a,b) => b.count - a.count);

    const config: ChartConfig = {};
    data.forEach((item, index) => {
        config[item.system] = {
            label: item.system,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
        };
    });
    
    return { processCounts: counts, chartData: data, chartConfig: config };
  }, [history, isClient]);


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
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processamentos (Filtrado)</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isClient ? sortedHistory.length : 0}</div>
                <p className="text-xs text-muted-foreground">arquivos no período selecionado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistema Mais Usado</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isClient && chartData.length > 0 ? chartData[0].system : "N/A"}</div>
                <p className="text-xs text-muted-foreground">com {isClient && chartData.length > 0 ? chartData[0].count : 0} processamentos</p>
              </CardContent>
            </Card>
          </section>

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-border/50 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Processamentos por Sistema</CardTitle>
                    <CardDescription>Visão geral da utilização de cada sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isClient && chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <RechartsBarChart accessibilityLayer data={chartData}>
                            <XAxis
                                dataKey="system"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `${value}`}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="count" radius={4}>
                                {chartData.map((entry, index) => (
                                    <div key={`cell-${index}`} style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ChartContainer>
                     ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-[250px]">
                        <AlertTriangle className="h-8 w-8" />
                        <span>Nenhum dado para exibir no gráfico.</span>
                      </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-border/50 lg:col-span-2">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className='flex-1'>
                  <CardTitle>Histórico</CardTitle>
                  <CardDescription>
                    Últimos arquivos processados.
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full sm:w-[260px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                     {date && (
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDate(undefined)}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                      />
                    </PopoverContent>
                  </Popover>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" disabled={!isClient || history.length === 0}>
                          <Trash2 className="mr-2" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá apagar permanentemente todo o histórico de processamento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearHistory}>Confirmar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto max-h-[55vh]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card/90 backdrop-blur-sm">
                      <TableRow>
                        <TableHead>Sistema</TableHead>
                        <TableHead>Arquivo</TableHead>
                        <TableHead className="text-right">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isClient && sortedHistory.length > 0 ? (
                        sortedHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.system}</TableCell>
                            <TableCell className="truncate max-w-[120px]">{item.fileName}</TableCell>
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
                              <span>Nenhum histórico encontrado.</span>
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
