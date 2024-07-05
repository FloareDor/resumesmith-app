import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { UploadStep } from "./UploadStep";
import { TemplateStep } from "./TemplateStep";
import { PreviewStep } from "./PreviewStep";

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_id", selectedTemplate.toString());

    try {
      const response = await fetch("http://localhost:8000/generate-resume", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        setGeneratedPdfUrl(pdfUrl);
        setStep("preview");
      } else {
        throw new Error("Failed to generate resume");
      }
    } catch (error) {
      console.error("Error generating resume:", error);
      alert("Failed to generate resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex-1 container mx-auto px-12 py-20 md:py-24 lg:py-8 xl:py-8">
      <AnimatePresence mode="wait">
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
          />
        )}
        {step === "preview" && generatedPdfUrl && (
          <PreviewStep pdfUrl={generatedPdfUrl} />
        )}
      </AnimatePresence>
    </main>
  );
}