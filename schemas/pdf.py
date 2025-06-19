from pydantic import BaseModel, Field

class PDFUploadResponse(BaseModel):
    pdf_id: str
    num_chunks: int

class QuestionRequest(BaseModel):
    pdf_id: str
    question: str

class AnswerResponse(BaseModel):
    answer: str 