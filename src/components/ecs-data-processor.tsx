"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import { processExcelFile } from "@/app/actions";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

type ProcessStep =
  | "idle"
  | "processing"
  | "success"
  | "error";

type System = "V8DIGITAL" | "UNNO" | "GLM-CREFISACP" | "QUEROMAIS" | "LEV" | "FACTA" | "PRESENCABANK" | "QUALIBANKING" | "PAN" | "BRB-INCONTA" | "NEOCREDITO" | "PRATA DIGITAL" | "PHTECH" | "TOTALCASH" | "AMIGOZ" | "BRB ESTEIRA" | "BMG" | "INTER" | "DIGIO";

interface EcsDataProcessorProps {
    system: System;
}

const stepMessages: Record<ProcessStep, string> = {
  idle: "Aguardando o envio do arquivo.",
  processing: "Processando sua planilha...",
  success: "Seu arquivo está pronto para download.",
  error: "Ocorreu um erro durante o processamento.",
};

export function EcsDataProcessor({ system }: EcsDataProcessorProps) {
  const [step, setStep] = useState<ProcessStep>("idle");
  const [progress, setProgress] = useState(0);
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (step === "processing") {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress >= 90) {
          clearInterval(interval);
        }
        setProgress(currentProgress);
      }, 200);
      return () => clearInterval(interval);
    }
    else if (step === "success") setProgress(100);
    else if (step === "idle" || step === "error") setProgress(0);
  }, [step]);

  const handleFileProcess = useCallback(
    (file: File) => {
      setOriginalFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (!dataUri) {
          toast({
            variant: "destructive",
            title: "Erro de Leitura",
            description: "Não foi possível ler o arquivo enviado.",
          });
          setStep("error");
          return;
        }

        startTransition(async () => {
          setStep("processing");
          const result = await processExcelFile(dataUri, system);

          if (result.success) {
            try {
              const jsonData = JSON.parse(result.data);
              setProcessedData(jsonData);
              setProgress(100);
              setStep("success");
            } catch (e) {
              toast({
                variant: "destructive",
                title: "Erro de Análise",
                description:
                  "Não foi possível interpretar os dados processados.",
              });
              setStep("error");
            }
          } else {
            toast({
              variant: "destructive",
              title: "Erro no Processamento",
              description: result.error,
            });
            setStep("error");
          }
        });
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Erro de Leitura",
          description: "Ocorreu um erro ao ler o arquivo.",
        });
        setStep("error");
      };
      reader.readAsDataURL(file);
    },
    [startTransition, toast, system]
  );

  const handleDownload = () => {
    if (!processedData || processedData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(processedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados Processados");

    const bankName = processedData[0]?.NOM_BANCO || system;
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}${month}${year}`;

    const fileName = `WORKBANK${bankName.toUpperCase().replace(/[^A-Z0-9]/g, '')}${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleReset = () => {
    setStep("idle");
    setProgress(0);
    setProcessedData(null);
    setOriginalFileName("");
  };

  const renderContent = () => {
    switch (step) {
      case "idle":
        return (
          <FileUpload onFileSelect={handleFileProcess} disabled={isPending} />
        );

      case "processing":
        return (
          <div className="text-center w-full">
            <div className="flex justify-center items-center mb-4">
              <FileSpreadsheet className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground mb-2 font-medium">
              {stepMessages[step]}
            </p>
            <Progress
              value={progress}
              className="w-full transition-all duration-500"
            />
            <p className="text-sm text-muted-foreground mt-2 truncate">
              {originalFileName}
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center w-full flex flex-col items-center gap-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-lg font-medium text-foreground">
              {stepMessages.success}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Os dados de{" "}
              <span className="font-semibold">{originalFileName}</span> foram processados com sucesso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button onClick={handleReset} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Processar Outro
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Baixar Arquivo
              </Button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center w-full flex flex-col items-center gap-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <p className="text-lg font-medium text-foreground">
              {stepMessages.error}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
             Algo deu errado ao processar {" "}
              <span className="font-semibold">{originalFileName}</span>. Por favor, tente novamente.
            </p>
            <Button
              onClick={handleReset}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl transition-all bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="font-headline text-center text-3xl">
          Upload de Planilha
        </CardTitle>
        <CardDescription className="text-center pt-2">
          Arraste e solte seu arquivo ou clique para selecionar e iniciar o processamento.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px] flex items-center justify-center p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}

    