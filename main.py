import os
from fastapi import FastAPI
from dotenv import load_dotenv
from routers import pdf_chat

load_dotenv()

app = FastAPI(title="PDFwhizz", description="Chat with PDF feature.")

app.include_router(pdf_chat.router, prefix="/api/v1/pdf-chat", tags=["PDF Chat"])

@app.get("/")
def read_root():
    return {"message": "PDFwhiz it is!"} 