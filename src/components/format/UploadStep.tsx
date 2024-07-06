import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

type UploadStepProps = {
  onFileUpload: (file: File) => void;
};

export function UploadStep({ onFileUpload }: UploadStepProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      onFileUpload(uploadedFile);
    } else {
      alert("Please upload a PDF file.");
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive: dropzoneIsDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Update isDragActive when dropzone state changes
  useState(() => {
    setIsDragActive(dropzoneIsDragActive);
  });

  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Upload Your Resume</h1>
        <p className="text-muted-foreground">
          Upload your existing resume in PDF format to get started.
        </p>
      </div>
      <div className="max-w-md mx-auto">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${
            isDragActive ? "border-primary bg-primary/10" : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className={`w-10 h-10 mb-3 ${isDragActive ? "text-primary" : "text-gray-400"}`} />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF only (MAX. 10MB)</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}