import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Template } from "./FormatPage";
import Image from "next/image";

type TemplateStepProps = {
  templates: Template[];
  selectedTemplate: number | null;
  onTemplateSelect: (templateId: number) => void;
  onGenerateResume: () => void;
  onBack: () => void;
  isGenerating: boolean;
};

export function TemplateStep({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onGenerateResume,
  onBack,
  isGenerating,
}: TemplateStepProps) {
  return (
    <motion.div
      key="template"
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose a Template</h1>
        <p className="text-muted-foreground">Select a template for your resume.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all ${
              selectedTemplate === template.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image src={template.image} alt={template.name} width={400} height={460} className="w-full max-h-[460px] lg:h-48 lg:opacity-5 rounded-md hover:block lg:hover:opacity-100 lg:hover:h-auto lg:hover:scale-[101%] duration-300 " />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          <X className="mr-2 h-4 w-4" /> Change File
        </Button>
        <Button 
          onClick={onGenerateResume} 
          disabled={!selectedTemplate || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Resume'
          )}
        </Button>
      </div>
    </motion.div>
  );
}