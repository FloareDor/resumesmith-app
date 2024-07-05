import { motion } from "framer-motion";
import { Upload } from "lucide-react";

type UploadStepProps = {
  onFileUpload: (file: File) => void;
};

export function UploadStep({ onFileUpload }: UploadStepProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && ["application/pdf", "image/png", "image/jpeg"].includes(uploadedFile.type)) {
      onFileUpload(uploadedFile);
    } else {
      alert("Please upload a PDF, PNG, or JPEG file.");
    }
  };

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
          Upload your existing resume in PDF, PNG, or JPEG format to get started.
        </p>
      </div>
      <div className="max-w-md mx-auto">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, PNG, or JPEG (MAX. 10MB)</p>
          </div>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
        </label>
      </div>
    </motion.div>
  );
}