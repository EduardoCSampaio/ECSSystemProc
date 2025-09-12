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

const stepMessages: Record<ProcessStep, string> = {
  idle: "Awaiting file upload.",
  processing: "Processing your spreadsheet...",
  success: "Your file is ready for download.",
  error: "An error occurred during processing.",
};

export function EcsDataProcessor() {
  const [step, setStep] = useState<ProcessStep>("idle");
  const [progress, setProgress] = useState(0);
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (step === "processing") setProgress(50);
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
            title: "File Read Error",
            description: "Could not read the uploaded file.",
          });
          setStep("error");
          return;
        }

        startTransition(async () => {
          setStep("processing");
          const result = await processExcelFile(dataUri);

          if (result.success) {
            try {
              const jsonData = JSON.parse(result.data);
              setProcessedData(jsonData);
              setStep("success");
            } catch (e) {
              toast({
                variant: "destructive",
                title: "Data Parse Error",
                description:
                  "Could not parse the processed data. Please try again.",
              });
              setStep("error");
            }
          } else {
            toast({
              variant: "destructive",
              title: "Processing Error",
              description: result.error,
            });
            setStep("error");
          }
        });
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: "An error occurred while reading the file.",
        });
        setStep("error");
      };
      reader.readAsDataURL(file);
    },
    [startTransition, toast]
  );

  const handleDownload = () => {
    if (!processedData || processedData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(processedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados Processados");

    const bankName = processedData[0]?.NOM_BANCO || 'BANCO';
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}${month}${year}`;

    const fileName = `WORKBANK${bankName.toUpperCase()}${dateStr}.xlsx`;
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
              We have successfully processed the data from{" "}
              <span className="font-semibold">{originalFileName}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button onClick={handleReset} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Process Another File
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download File
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
              Something went wrong while processing{" "}
              <span className="font-semibold">{originalFileName}</span>. Please
              try again.
            </p>
            <Button
              onClick={handleReset}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl transition-all border-none bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-center text-2xl">
          Upload Your Excel File
        </CardTitle>
        <CardDescription className="text-center">
          Drag & drop your file or click to select a file to begin processing.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px] flex items-center justify-center p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
