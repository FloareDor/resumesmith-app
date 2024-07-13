import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type PreviewStepProps = {
  pdfUrl: string;
};

export function PreviewStep({ pdfUrl }: PreviewStepProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'generated_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      key="preview"
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Your Generated Resume</h1>
        <p className="text-muted-foreground">Preview your resume and download it.</p>
        <Button onClick={handleDownload} className="mt-4">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>
      <div className="flex flex-col items-center">
        <iframe
          src={pdfUrl}
          className="w-full h-[600px] mb-4 border rounded-lg"
          title="Generated Resume"
        />

      </div>
    </motion.div>
  );
}