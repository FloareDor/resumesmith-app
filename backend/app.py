from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

from os import environ as env
from dotenv import find_dotenv, load_dotenv
import google.generativeai as genai

ENV_FILE = find_dotenv()
if ENV_FILE:	
	load_dotenv(ENV_FILE)
    
GOOGLE_API_KEY=env.get('GOOGLE_API_KEY')

genai.configure(api_key=GOOGLE_API_KEY)

for m in genai.list_models():
  if 'generateContent' in m.supported_generation_methods:
    print(m.name)

model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content("What is the meaning of life?")
print(response.text)


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-resume")
async def generate_resume(file: UploadFile = File(...), template_id: str = Form(...)):
    return {"message": f"Resume generated with template {template_id}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)