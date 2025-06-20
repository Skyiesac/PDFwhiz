from pydantic import BaseModel
from typing import List

class QuizRequest(BaseModel):
    pdf_id: str

class QuizQuestion(BaseModel):
    question: str
    answer: str = None  # Optional, can be omitted if only questions are needed

class QuizResponse(BaseModel):
    questions: List[QuizQuestion] 