from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
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
import asyncio

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

single_page_conditioning_prompt = """
Task: Fill the provided LaTeX resume template with relevant details from the user's resume, maintaining a strict single-page format.

Instructions:
1. Use the exact LaTeX structure and commands from the provided template.
2. Only replace the placeholder content within the template with information from the user's resume.
3. Do not modify the template's layout, styling, or LaTeX commands in any way.
4. Strictly adhere to a single-page limit.

Content selection and placement:
1. Prioritize the following sections in this order:
   a. Professional experience (most recent and relevant)
   b. Skills (focus on technical skills for software engineering)
   c. Projects (up to 3 most relevant)
   d. Education (highest 2 levels only)
   e. Summarized achievements

2. If space is limited:
   a. Summarize or omit less critical details.
   b. Focus on the most recent and relevant information.
   c. Use concise language.

3. Ensure all information fits within the existing template structure without overflow.

Output: Provide only the complete LaTeX code of the filled template. Do not include any explanations or comments outside the LaTeX code.

Important: Do not alter the template's LaTeX structure or styling. Only replace the content within the existing fields and commands.
"""

strict_single_page_conditioning_prompt = """
Task: Fill the provided LaTeX resume template with relevant details from the user's resume, strictly adhering to the template's existing sections and maintaining a single-page format.

Instructions:
1. Use the exact LaTeX structure and commands from the provided template.
2. Only fill in sections that already exist in the template.
3. Do not add, remove, or modify any sections or LaTeX commands.
4. Maintain the single-page format of the template.

Content placement:
1. For each section in the template:
   a. Identify the corresponding information in the user's resume.
   b. Select and summarize relevant details to fit the template's allocated space.
   c. If a section in the template doesn't have a direct match in the user's resume, leave it blank or use a placeholder like "[Not Applicable]".

2. Prioritize recent and relevant information within each section.

3. If the user's resume has information that doesn't fit any section in the template, omit it.

4. Ensure all text fits within the template's existing structure without causing overflow to a second page.

Formatting:
1. Match the style and format of the placeholder text in the template.
2. Use bullet points, short phrases, or brief sentences as dictated by the template's existing format.

Output: Provide only the complete LaTeX code of the filled template. Do not include any explanations or comments outside the LaTeX code.

Critical: Only fill sections that exist in the template. Do not add new sections or modify the template structure in any way. Ensure the result remains a single page.
"""

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
model = genai.GenerativeModel('gemini-2.5-flash')

@app.get("/health")
@limiter.limit("3/minute")
def health(request: Request):
    return {"status":"ok"}

@app.post("/generate-resume")
@limiter.limit("5/minute")
async def generate_resume(request: Request, file: UploadFile = File(...), template_id: str = Form(...), single_page: str = Form(...)):
    try:
            
        print("got a request to generate resume template id: " + template_id)
        print(single_page, type(single_page))
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

        if len(resume_text) > 0:
            print("extracted content from resume")
        print(type(resume_text))
        pattern = re.compile(r'[^\x00-\x7F]+')

        resume_text2 = resume_text.encode('utf-8', 'replace').decode('utf-8')
        cleaned_resume_text = resume_text2.replace("#", "sharp").replace(r'/[\x{fffe}-\x{ffff}]/u', '').replace('�', "").replace("&", "and").replace("$", "USD")
        cleaned_resume_text = pattern.sub('', cleaned_resume_text)
        modified_string = re.sub("&", "and", cleaned_resume_text)
        modified_string = re.sub("$", "USD", modified_string)

        print("##############################")


        single_page_conditioning_prompt = """
        Here is a famous resume template, replace the template's content with picked details from my resume and give me the latex code only as output.
        strictly keep the resume output single page. you can cut down on content from my resume or summarize or pick the good parts based on standard swe job guidelines.
        
        if there is too much info you need it to only include:
            strictly 2 max highest education level for one page.
            recent experience,
            2 projects,
            skills,
            summarized achievements
        Summarize my resume to Fit the template.
        Make sure I don't get errors when compiling your latex code.\n
        """

        normal_conditioning_prompt = """
        Here is a famous resume template, replace the template's content with picked details from my resume and give me the latex code only as output.
        Make sure I don't get errors when compiling your latex code.\n
        """

        conditioning_prompt = ""
        if single_page == "false":
            print("not summarized to fit")
            conditioning_prompt = normal_conditioning_prompt
        else:
            print("summarized to fit")
            conditioning_prompt = single_page_conditioning_prompt
        
        # Generate new resume content using Gemini API
        prompt = conditioning_prompt + rf"""
        Here is the resume template:
        {resume_template_latex}
        Here is my resume content:
        {modified_string}
        """

        def replace_color_package(text):
            pattern = r'\\usepackage\[usenames,dvips[^\]]*\]\{color\}'
            replacement = r'\\usepackage[usenames,dvipsnames]{color}'
            return re.sub(pattern, replacement, text)

        
        response = model.generate_content(prompt)
        latex_response = response.text.replace("```latex", "").replace("```", "").replace(r'/[\x{fffe}-\x{ffff}]/u', '').replace('�', "").encode('utf-8', 'replace').decode('utf-8')
        latex_response = pattern.sub('', latex_response)
        latex_response = latex_response.replace("dvipsyn", "dvipsnames").replace("dvipsypes", "dvipsnames").replace("dvipsines", "dvipsnames").replace("dvipshade", "dvipsnames")
        # print(latex_response)

        pattern = r"(\\usepackage\[usenames,)(.*?)(,dvipsnames)\]"

        # Replacement function
        def replace_func(match):
            # Return the first and third captured groups, effectively removing the second group
            return match.group(1) + match.group(3)
        if template_id == "1":
            latex_response = re.sub(pattern, replace_func, latex_response)
        latex_response = replace_color_package(latex_response)
        
        print("generated final latex response")

        # Compile LaTeX to PDF
        pdf_id = uuid.uuid4().hex
        pdfs_directory = "outputs"
        os.makedirs(pdfs_directory, exist_ok=True)
        
        tex_file_path = f"{pdfs_directory}/{pdf_id}.tex"
        with open(tex_file_path, "w") as tex_file:
            tex_file.write(latex_response)

        try:
            subprocess.run(["pdflatex", "-interaction=nonstopmode", "-halt-on-error", "-output-directory", pdfs_directory, tex_file_path], check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            print(f"Error in LaTeX compilation: {e.stdout}\n{e.stderr}")
            raise HTTPException(status_code=500, detail="PDF generation failed")

        pdf_file_path = f"{pdfs_directory}/{pdf_id}.pdf"
        if not os.path.exists(pdf_file_path):
            raise HTTPException(status_code=500, detail="PDF generation failed")

        return FileResponse(pdf_file_path, filename="generated_resume.pdf")
    except Exception as e:
        print("error generating:", e)
        raise HTTPException(status_code=400, detail="An error occurred while processing your request")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global exception handler caught: {str(exc)}")
    return {"error": "An unexpected error occurred"}

if __name__ == "__main__":
    import uvicorn
    # uvicorn.run(app, host="0.0.0.0", port=8000)
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        ssl_keyfile="/etc/letsencrypt/live/ratemuprofs.live/privkey.pem",
        ssl_certfile="/etc/letsencrypt/live/ratemuprofs.live/fullchain.pem"
    )