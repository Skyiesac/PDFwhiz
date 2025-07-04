from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.pdf import PDFUploadResponse, QuestionRequest, AnswerResponse
from schemas.quiz import (
    QuizRequest,
    QuizResponse,
    BulletPointsRequest,
    BulletPointsResponse,
)
from services.pdf_chat import process_pdf, answer_question
from services.quiz import (
    generate_quiz_from_pdf,
    generate_quiz_from_pdf_id,
    extract_bullet_points_from_pdf_id,
    extract_topics_from_pdf_id,
)
from services.cache import clear_pdf_cache

router = APIRouter()
pdf_indexes = {}
pdf_metadata = {}


@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    pdf_id, num_chunks = await process_pdf(file, pdf_indexes, pdf_metadata)

    # Clear any existing cache for this PDF ID (in case of re-upload)
    await clear_pdf_cache(pdf_id)

    return PDFUploadResponse(pdf_id=pdf_id, num_chunks=num_chunks)


@router.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    if request.pdf_id not in pdf_indexes:
        raise HTTPException(
            status_code=404, detail="PDF not found. Please upload first."
        )
    answer = await answer_question(
        request, pdf_indexes[request.pdf_id], pdf_metadata.get(request.pdf_id)
    )
    return AnswerResponse(answer=answer)


@router.post("/quiz", response_model=QuizResponse)
async def quiz_by_id(request: QuizRequest):
    if request.pdf_id not in pdf_indexes:
        raise HTTPException(
            status_code=404, detail="PDF not found. Please upload first."
        )
    questions = await generate_quiz_from_pdf_id(
        request.pdf_id, pdf_indexes, pdf_metadata
    )
    return QuizResponse(questions=questions)


@router.post("/quiz/file", response_model=QuizResponse)
async def quiz_by_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    questions = await generate_quiz_from_pdf(file)
    return QuizResponse(questions=questions)


@router.post("/bullet-points", response_model=BulletPointsResponse)
async def bullet_points(request: BulletPointsRequest):
    if request.pdf_id not in pdf_indexes:
        raise HTTPException(
            status_code=404, detail="PDF not found. Please upload first."
        )
    bullet_points = await extract_bullet_points_from_pdf_id(
        request.pdf_id, pdf_indexes, pdf_metadata
    )
    return BulletPointsResponse(bullet_points=bullet_points)


@router.post("/topics")
async def topics_by_id(request: QuizRequest):
    if request.pdf_id not in pdf_indexes:
        raise HTTPException(
            status_code=404, detail="PDF not found. Please upload first."
        )
    topics = await extract_topics_from_pdf_id(request.pdf_id, pdf_indexes, pdf_metadata)
    return {"topics": topics}
