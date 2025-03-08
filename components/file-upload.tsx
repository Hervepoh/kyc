"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: Record<string, string[]>;
  label: string;
}

export function FileUpload({ onFileSelect, accept, label }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file); // Stocker le fichier uploadé
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
    setUploadedFile(null); // Supprimer le fichier
    onFileSelect(null); // Réinitialiser la valeur du champ
  };

  return (
    <div>
      {/* Afficher l'aperçu du fichier uploadé */}
      {uploadedFile && (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-700">{uploadedFile.name}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
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


// "use client";

// import { useCallback } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { Upload } from 'lucide-react';

// interface FileUploadProps {
//   onFileSelect: (file: File) => void;
//   accept?: Record<string, string[]>;
//   label: string;
// }

// export function FileUpload({ onFileSelect, accept, label }: FileUploadProps) {
//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     if (acceptedFiles.length > 0) {
//       onFileSelect(acceptedFiles[0]);
//     }
//   }, [onFileSelect]);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept,
//     maxFiles: 1,
//   });

//   return (
//     <div
//       {...getRootProps()}
//       className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
//         ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
//     >
//       <input {...getInputProps()} />
//       <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
//       <p className="text-sm text-muted-foreground">{label}</p>
//       <p className="text-xs text-muted-foreground mt-1">
//         Drag & drop or click to select
//       </p>
//     </div>
//   );
// }

