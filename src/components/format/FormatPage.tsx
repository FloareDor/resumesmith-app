import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadStep } from "./UploadStep";
import { TemplateStep } from "./TemplateStep";
import { PreviewStep } from "./PreviewStep";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export type Template = {
  id: number;
  name: string;
  image: string;
};

const templates: Template[] = [
  { id: 3, name: "Minimalist", image: "/images/minimal-resume.png" },
  { id: 2, name: "Modern", image: "/images/modern-resume.png" },
  { id: 1, name: "Professional", image: "/images/jakes-resume.jpeg" },
];

export function FormatPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [step, setStep] = useState<"upload" | "template" | "preview">("upload");
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [singlePage, setSinglePage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLatex, setGeneratedLatex] = useState<string | null>(null);

  const handleSinglePageToggle = (checked: boolean) => {
    setSinglePage(checked);
  };

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setStep("template");
  };

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplate(templateId);
  };

  const handleGenerateResume = async () => {
    if (!file || !selectedTemplate) return;
    setIsGenerating(true);
    setError(null); // Clear any previous errors
    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_id", selectedTemplate.toString());
    formData.append("single_page", singlePage.toString());
    formData.append("return_json", "true");
    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        const pdfBlob = new Blob([Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0))], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setGeneratedLatex(data.latex as string);
        setGeneratedPdfUrl(pdfUrl);
        setStep("preview");
      } else {
        throw new Error("Failed to generate resume");
      }
    } catch (error) {
      console.error("Error generating resume:", error);
      setError("Could not generate your resume :(\nTry a different mode.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex-1 container mx-auto px-12 py-20 md:py-24 lg:py-8 xl:py-8">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Oops! Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        {step === "upload" && (
          <UploadStep onFileUpload={handleFileUpload} />
        )}
        {step === "template" && (
          <TemplateStep
            templates={templates}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            onGenerateResume={handleGenerateResume}
            onBack={() => setStep("upload")}
            isGenerating={isGenerating}
            singlePage={singlePage}
            onSinglePageToggle={handleSinglePageToggle}
          />
        )}
        {step === "preview" && generatedPdfUrl && (
          <PreviewStep pdfUrl={generatedPdfUrl} latex={generatedLatex || ''} onUpdate={(newPdfUrl, newLatex) => { setGeneratedPdfUrl(newPdfUrl); setGeneratedLatex(newLatex); }} />
        )}
      </AnimatePresence>
    </main>
  );
}