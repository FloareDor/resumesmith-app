import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Files, Fields } from 'formidable';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { spawn } from 'child_process';
import os from 'os';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '25mb',
  },
};

const SINGLE_PAGE_PROMPT = `
Here is a famous resume template, replace the template's content with picked details from my resume and give me the latex code only as output.
strictly keep the resume output single page. you can cut down on content from my resume or summarize or pick the good parts based on standard swe job guidelines.

if there is too much info you need it to only include:
    strictly 2 max highest education level for one page.
    recent experience,
    2 projects,
    skills,
    summarized achievements
Summarize my resume to Fit the template.
Make sure I don't get errors when compiling your latex code.
`;

const NORMAL_PROMPT = `
Here is a famous resume template, replace the template's content with picked details from my resume and give me the latex code only as output.
Make sure I don't get errors when compiling your latex code.
`;

function sanitizeResumeText(input: string): string {
  // Remove non-ASCII and problematic characters, and replace some LaTeX specials
  const asciiOnly = input.replace(/[^\x00-\x7F]+/g, '');
  return asciiOnly
    .replace(/�/g, '')
    .replace(/#/g, 'sharp')
    .replace(/&/g, 'and')
    .replace(/\$/g, 'USD');
}

function replaceColorPackage(latex: string): string {
  return latex
    .replace(/```latex/g, '')
    .replace(/```/g, '')
    .replace(/[^\x00-\x7F]+/g, '')
    .replace(/dvipsyn|dvipsypes|dvipsines|dvipshade/g, 'dvipsnames')
    .replace(/\\usepackage\[usenames,dvips[^\]]*\]\{color\}/g, '\\usepackage[usenames,dvipsnames]{color}')
    .replace(/(\\usepackage\[usenames,)(.*?)(,dvipsnames)\]/g, (_m, g1, _g2, g3) => `${g1}${g3}`);
}

async function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }>
{
  const form = new IncomingForm({ multiples: false, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

async function readUploadedPdf(files: Files): Promise<Buffer> {
  const file = files.file as any;
  if (!file) throw new Error('file is required');
  const filepath: string = Array.isArray(file) ? file[0].filepath : file.filepath;
  return fs.readFileSync(filepath);
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text || '';
}

function generateTmpDir(): string {
  const dir = path.join(process.cwd(), 'outputs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function runPdflatex(texPath: string, outDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', '-output-directory', outDir, texPath], { stdio: 'pipe' });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) return resolve();
      // Log for debugging
      console.error('pdflatex failed:', { code, stdout, stderr });
      reject(new Error('PDF generation failed'));
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { fields, files } = await parseForm(req);
    const templateId = String(fields.template_id ?? fields.templateId ?? '1');
    const singlePage = String(fields.single_page ?? fields.singlePage ?? 'true');

    const pdfBuffer = await readUploadedPdf(files);
    const extracted = await extractTextFromPdf(pdfBuffer);
    const cleanedText = sanitizeResumeText(extracted);

    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    const templatePath = path.join(templatesDir, `${templateId}.tex`);
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }
    const resumeTemplate = await fsp.readFile(templatePath, 'utf-8');

    const prompt = `${singlePage === 'false' ? NORMAL_PROMPT : SINGLE_PAGE_PROMPT}\nHere is the resume template:\n${resumeTemplate}\nHere is my resume content:\n${cleanedText}`;

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const latex = replaceColorPackage(text);

    const outDir = generateTmpDir();
    const texFilename = `${crypto.randomUUID()}.tex`;
    const texPath = path.join(outDir, texFilename);
    await fsp.writeFile(texPath, latex, 'utf-8');

    await runPdflatex(texPath, outDir);
    const pdfPath = texPath.replace(/\.tex$/, '.pdf');
    if (!fs.existsSync(pdfPath)) {
      return res.status(500).json({ error: 'PDF generation failed' });
    }

    const stat = await fsp.stat(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated_resume.pdf"');
    res.setHeader('Content-Length', stat.size.toString());
    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
  } catch (err: any) {
    console.error('generate-resume error:', err);
    res.status(400).json({ error: 'An error occurred while processing your request' });
  }
}


