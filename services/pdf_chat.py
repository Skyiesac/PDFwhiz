import uuid
import os
import io
from typing import Tuple, Dict, Any
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import OpenAI
from langchain.chains import RetrievalQA
from schemas.pdf import QuestionRequest

def get_openai_api_key():
    return os.getenv("OPENAI_API_KEY")

def get_embeddings():
    api_key = get_openai_api_key()
    if api_key:
        return OpenAIEmbeddings(openai_api_key=api_key)
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def get_llm():
    api_key = get_openai_api_key()
    if api_key:
        return OpenAI(openai_api_key=api_key, temperature=0)
    raise RuntimeError("No OpenAI API key set. Please set OPENAI_API_KEY in .env for LLM answers.")

async def process_pdf(file, pdf_indexes: Dict[str, Any]) -> Tuple[str, int]:
    pdf_bytes = await file.read()
    pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
    text = "\n".join(page.extract_text() or "" for page in pdf_reader.pages)
    splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=400)
    chunks = splitter.split_text(text)
    embeddings = get_embeddings()
    vectorstore = FAISS.from_texts(chunks, embeddings)
    pdf_id = str(uuid.uuid4())
    pdf_indexes[pdf_id] = vectorstore
    return pdf_id, len(chunks)

async def answer_question(request: QuestionRequest, vectorstore) -> str:
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    try:
        llm = get_llm()
        qa_chain = RetrievalQA.from_chain_type(llm, retriever=retriever)
        result = qa_chain({"query": request.question})
        return result["result"]
    except RuntimeError:
        docs = retriever.get_relevant_documents(request.question)
        if docs:
            return docs[0].page_content
        return "No answer found." 