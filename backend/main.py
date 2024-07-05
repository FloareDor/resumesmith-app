from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PyPDF2 import PdfReader
import google.generativeai as genai
import os
from os import environ as env
import subprocess
import uuid
import io
from dotenv import find_dotenv, load_dotenv
import regex as re


app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ENV_FILE = find_dotenv()
if ENV_FILE:	
    load_dotenv(ENV_FILE)
     
# Configure Gemini API
GOOGLE_API_KEY=env.get('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

@app.post("/generate-resume")
async def generate_resume(file: UploadFile = File(...), template_id: str = Form(...)):
    print("got a request to generate resume template id: " + template_id)
    # Read and extract text from the uploaded PDF
    pdf_content = await file.read()
    pdf_reader = PdfReader(io.BytesIO(pdf_content))
    resume_text = ""
    for page in pdf_reader.pages:
        resume_text += page.extract_text()

    # Read the LaTeX template
    template_path = f"templates/{template_id}.tex"
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")
    
    with open(template_path, "r", encoding='utf-8') as template_file:
        resume_template_latex = template_file.read()

    print(resume_text)
    print(type(resume_text))
    pattern = re.compile(r'[^\x00-\x7F]+')

    resume_text2 = resume_text.encode('utf-8', 'replace').decode('utf-8')
    cleaned_resume_text = resume_text2.replace("#", "sharp").replace(r'/[\x{fffe}-\x{ffff}]/u', '').replace('�', "").replace("&", "and").replace("$", "USD")
    cleaned_resume_text = pattern.sub('', cleaned_resume_text)
    modified_string = re.sub("&", "and", cleaned_resume_text)
    modified_string = re.sub("$", "USD", modified_string)

    print("##############################")



    # Generate new resume content using Gemini API
    prompt = rf"""
    Here is a famous resume template, replace the template's content with picked details from my resume and give me the latex code only as output.
    strictly keep the resume output single page. you can cut down on content from my resume or summarize or pick the good parts based on standard swe job guidelines.
    if there is too much info you need it to only include 2 internships, 2 projects and skills and highest 2 education levels for one page.
    Make sure I don't get errors when compiling your latex code.
    Here is the resume template:
    {resume_template_latex}
    Here is my resume content:
    {modified_string}
    """
    
    response = model.generate_content(prompt)
    latex_response = response.text.replace("```latex", "").replace("```", "").replace(r'/[\x{fffe}-\x{ffff}]/u', '').replace('�', "").encode('utf-8', 'replace').decode('utf-8')
    latex_response = pattern.sub('', latex_response)
    print(latex_response)

    # Compile LaTeX to PDF
    pdf_id = uuid.uuid4().hex
    pdfs_directory = "outputs"
    os.makedirs(pdfs_directory, exist_ok=True)
    
    tex_file_path = f"{pdfs_directory}/{pdf_id}.tex"
    with open(tex_file_path, "w") as tex_file:
        tex_file.write(latex_response)

    subprocess.run(["pdflatex", "-output-directory", pdfs_directory, tex_file_path], check=True)

    pdf_file_path = f"{pdfs_directory}/{pdf_id}.pdf"
    if not os.path.exists(pdf_file_path):
        raise HTTPException(status_code=500, detail="PDF generation failed")

    return FileResponse(pdf_file_path, filename="generated_resume.pdf")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)