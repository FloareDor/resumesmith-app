import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PreviewStepProps = {
  pdfUrl: string;
  latex: string;
  onUpdate: (newPdfUrl: string, newLatex: string) => void;
};

export function PreviewStep({ pdfUrl, latex, onUpdate }: PreviewStepProps) {
  const [prompt, setPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'generated_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setIsEditing(true);
    try {
      const resp = await fetch('/api/edit-latex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latex, prompt, compile: true }),
      });
      if (!resp.ok) throw new Error('Edit failed');
      const data = await resp.json();
      const pdfBlob = new Blob([Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0))], { type: 'application/pdf' });
      const newUrl = URL.createObjectURL(pdfBlob);
      onUpdate(newUrl, data.latex as string);
      setPrompt("");
    } catch (e) {
      console.error('Edit error', e);
      alert('Edit failed. Please try refining your request.');
    } finally {
      setIsEditing(false);
    }
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
        <div className="w-full max-w-3xl flex gap-2">
          <Input
            placeholder="Ask Gemini to edit your LaTeX (e.g., increase project bullet points)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button onClick={handleEdit} disabled={isEditing || !prompt.trim()}>
            <Wand2 className="mr-2 h-4 w-4" /> {isEditing ? 'Editing...' : 'Edit with Gemini'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}