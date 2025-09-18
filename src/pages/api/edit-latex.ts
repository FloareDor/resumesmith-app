import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { spawn } from 'child_process';

async function runPdflatex(texPath: string, outDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', '-output-directory', outDir, texPath], { stdio: 'pipe' });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) return resolve();
      console.error('pdflatex failed:', { code, stdout, stderr });
      reject(new Error('PDF generation failed'));
    });
  });
}

function replaceColorPackage(latex: string): string {
  return latex
    .replace(/```latex/g, '')
    .replace(/```/g, '')
    .replace(/[^\x00-\x7F]+/g, '')
    .replace(/dvipsyn|dvipsypes|dvipsines|dvipshade/g, 'dvipsnames')
    .replace(/\\usepackage\[usenames,dvips[^\]]*\]\{color\}/g, '\\usepackage[usenames,dvipsnames]{color}')
    .replace(/(\\usepackage\[usenames,)(.*?)(,dvipsnames)\]/g, (_m, g1, _g2, g3) => `${g1}${g3}`)
    // Fix common LaTeX syntax errors
    .replace(/\\section\{([^}]*&[^}]*)\}/g, (match, content) => `\\section{${content.replace(/&/g, '\\&')}}`)
    .replace(/\\subsection\{([^}]*&[^}]*)\}/g, (match, content) => `\\subsection{${content.replace(/&/g, '\\&')}}`)
    .replace(/\\subsubsection\{([^}]*&[^}]*)\}/g, (match, content) => `\\subsubsection{${content.replace(/&/g, '\\&')}}`)
    // Remove references to custom document classes that don't exist
    .replace(/\\documentclass\{developercv\}/g, '\\documentclass{article}')
    .replace(/\\documentclass\{resume\}/g, '\\documentclass{article}')
    .replace(/\\documentclass\{cv\}/g, '\\documentclass{article}');
}

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: '10mb',
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { latex, prompt, compile } = req.body as { latex?: string; prompt?: string; compile?: boolean };
    if (!latex || !prompt) {
      return res.status(400).json({ error: 'latex and prompt are required' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });
    }

    const systemInstruction = `You are editing an existing LaTeX resume document. Apply the user's requested changes precisely and return only valid, compilable LaTeX code. Do not add explanations.

CRITICAL: Generate ONLY valid LaTeX code that compiles without errors:
- Use only standard LaTeX document classes (article, report, etc.)
- Escape special characters: & becomes \\&, % becomes \\%, $ becomes \\$, # becomes \\#
- Use \\section{} for section titles, not \\section{Achievements & Leadership}
- Do not reference custom .cls files that don't exist
- Use proper LaTeX syntax for all commands`;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContent([
      { text: systemInstruction },
      { text: `Original LaTeX:\n\n${latex}` },
      { text: `Edit request:\n\n${prompt}` },
    ]);
    const edited = replaceColorPackage(response.response.text());

    if (!compile) {
      return res.status(200).json({ latex: edited });
    }

    const outDir = path.join(process.cwd(), 'outputs');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const texPath = path.join(outDir, 'edit-' + Date.now() + '.tex');
    await fsp.writeFile(texPath, edited, 'utf-8');
    await runPdflatex(texPath, outDir);
    const pdfPath = texPath.replace(/\.tex$/, '.pdf');
    const pdfBuffer = await fsp.readFile(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');
    return res.status(200).json({ latex: edited, pdfBase64 });
  } catch (err: any) {
    console.error('edit-latex error:', err);
    return res.status(400).json({ error: 'Failed to edit LaTeX' });
  }
}


