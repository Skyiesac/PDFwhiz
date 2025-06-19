from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.pdf import PDFUploadResponse, QuestionRequest, AnswerResponse
from services.pdf_chat import process_pdf, answer_question

router = APIRouter()
pdf_indexes = {}

@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    pdf_id, num_chunks = await process_pdf(file, pdf_indexes)
    return PDFUploadResponse(pdf_id=pdf_id, num_chunks=num_chunks)

@router.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    if request.pdf_id not in pdf_indexes:
        raise HTTPException(status_code=404, detail="PDF not found. Please upload first.")
    answer = await answer_question(request, pdf_indexes[request.pdf_id])
    return AnswerResponse(answer=answer) 