"use client";

import { useState, useCallback, DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];
const MAX_SIZE_MB = 10;

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileValidation = (file: File | null): boolean => {
    if (!file) return false;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a valid Excel (.xls, .xlsx) or CSV file.",
      });
      return false;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: `Please upload a file smaller than ${MAX_SIZE_MB}MB.`,
      });
      return false;
    }
    return true;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (handleFileValidation(file)) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (handleFileValidation(file)) {
      onFileSelect(file);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = "";
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative w-full h-full p-8 border-2 border-dashed rounded-lg transition-colors duration-200 flex flex-col justify-center items-center text-center",
        isDragging
          ? "border-primary bg-accent/30"
          : "border-border hover:border-primary/50",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:bg-accent/10"
      )}
    >
      <input
        id="file-upload"
        type="file"
        className="sr-only"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className={cn(
          "w-full h-full flex flex-col justify-center items-center",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <UploadCloud
          className={cn(
            "h-12 w-12 mb-4 text-muted-foreground transition-colors",
            isDragging ? "text-primary" : ""
          )}
        />
        <p className="font-semibold text-foreground">
          <span className="text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          XLSX, XLS, or CSV (max {MAX_SIZE_MB}MB)
        </p>
      </label>
    </div>
  );
}
