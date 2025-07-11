"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { truncate } from 'node:fs';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: Record<string, string[]>;
  label: string;
  value?: File | null;  // <-- pour utiliser le fichier venant de react-hook-form
  truncate?: boolean; // Optionnel pour tronquer le nom du fichier
}

export function FileUpload({ onFileSelect, accept, label, value, truncate=true }: FileUploadProps) {
  //const [uploadedFile, setUploadedFile] = useState<File | null>(null); //<-- pour utiliser le fichier venant de react-hook-form

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        // setUploadedFile(file); // Stocker le fichier uploadé // <-- pour utiliser le fichier venant de react-hook-form
        onFileSelect(file); // Appeler la fonction de rappel avec le fichier sélectionné
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
  });

  const handleRemoveFile = () => {
    // setUploadedFile(null); // Supprimer le fichier  <-- pour utiliser le fichier venant de react-hook-form
    onFileSelect(null); // Réinitialiser la valeur du champ
  };

  return (
    <div>
      {/* Afficher l'aperçu du fichier uploadé */}
      {
        value && (
          <div className="w-full flex items-center justify-between border-2 border-dotted rounded-lg p-2 py-1 bg-gray-50 mb-4">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className={cn("text-sm text-gray-700 truncate ", truncate ? "max-w-[100px]" : "max-w-[300px]")}>
                { value.name }
                {/* {value?.name && value.name.length >= 10
                  ? value.name.slice(0, 10) + '...'
                  : value?.name} */}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}

      {/* Zone de dépôt pour uploader un fichier */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Drag & drop or click to select
        </p>
      </div>
    </div>
  );
}

