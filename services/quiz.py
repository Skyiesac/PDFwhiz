import io
import random
from PyPDF2 import PdfReader
from schemas.quiz import QuizQuestion
from services.pdf_chat import get_llm

def parse_quiz_output(quiz_text):
    questions = []
    for block in quiz_text.strip().split('\n\n'):
        lines = block.strip().split('\n')
        if not lines:
            continue
        q = lines[0].lstrip('1234567890. ').strip()
        a = None
        if len(lines) > 1 and lines[1].lower().startswith('answer:'):
            a = lines[1][7:].strip()
        questions.append(QuizQuestion(question=q, answer=a))
    return questions

async def generate_quiz_from_pdf(file):
    pdf_bytes = await file.read()
    pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
    text = "\n".join(page.extract_text() or "" for page in pdf_reader.pages)
    llm = get_llm()
    prompt = (
        "Generate a quiz based on the following PDF content. "
        "Create 5-10 questions that cover the main points. For each question, provide a direct answer. "
        "Format: Each question on a new line, followed by 'Answer: ...' on the next line. Separate each Q&A pair with a blank line.\n"
        f"PDF Content:\n{text[:4000]}\nQuiz:"
    )
    return parse_quiz_output(llm(prompt))

async def generate_quiz_from_pdf_id(pdf_id, pdf_indexes, pdf_metadata):
    vectorstore = pdf_indexes.get(pdf_id)
    if not vectorstore:
        return []
    docs = vectorstore.similarity_search(".", k=50)
    if not docs:
        return []
    num_chunks = min(len(docs), random.randint(5, 10))
    selected_docs = random.sample(docs, num_chunks)
    text = "\n".join(doc.page_content for doc in selected_docs)
    llm = get_llm()
    prompt = (
        "Generate a quiz based on the following PDF content. "
        "Create 5-10 questions that cover the main points. For each question, provide a direct answer. "
        "Format: Each question on a new line, followed by 'Answer: ...' on the next line. Separate each Q&A pair with a blank line.\n"
        f"PDF Content:\n{text[:4000]}\nQuiz:"
    )
    return parse_quiz_output(llm(prompt)) 