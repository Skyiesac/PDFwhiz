import uuid
import os
import io
from typing import Tuple, Dict, Any
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from schemas.pdf import QuestionRequest

def get_gemini_api_key():
    return os.getenv("GEMINI_API_KEY")

def get_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def get_llm():
    gemini_key = get_gemini_api_key()
    if gemini_key:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        class GeminiLLM:
            def __init__(self):
                self.model = genai.GenerativeModel("models/gemini-2.0-flash")
            def __call__(self, prompt):
                response = self.model.generate_content(prompt)
                return response.text
        return GeminiLLM()
    raise RuntimeError("No Gemini API key set. Please set GEMINI_API_KEY in .env for LLM answers.")

async def process_pdf(file, pdf_indexes: Dict[str, Any], pdf_metadata: Dict[str, dict]) -> Tuple[str, int]:
    pdf_bytes = await file.read()
    pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
    text = "\n".join(page.extract_text() or "" for page in pdf_reader.pages)
    splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=400)
    chunks = splitter.split_text(text)
    embeddings = get_embeddings()
    vectorstore = FAISS.from_texts(chunks, embeddings)
    pdf_id = str(uuid.uuid4())
    pdf_indexes[pdf_id] = vectorstore
    pdf_metadata[pdf_id] = {}
    return pdf_id, len(chunks)

async def answer_question(request: QuestionRequest, vectorstore, metadata=None) -> str:
    retriever = vectorstore.as_retriever(search_kwargs={"k": 8})
    try:
        docs = retriever.get_relevant_documents(request.question)
        best_chunk = docs[0].page_content.strip().replace('\n', ' ') if docs else ""
        llm = get_llm()
        prompt = (
            "Answer the following question using only the information from the provided PDF chunk. "
            "Be direct, concise, and factual. Do not add any extra explanation, story, or creativity. "
            f"Question: {request.question}\n"
            f"PDF Chunk: {best_chunk}\n"
            "Direct Answer:"
        )
        gemini_response = llm(prompt)
        return gemini_response.strip()
    except Exception:
        return best_chunk or "No answer found." 