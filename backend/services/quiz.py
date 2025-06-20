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

async def extract_bullet_points_from_pdf_id(pdf_id, pdf_indexes, pdf_metadata):
    vectorstore = pdf_indexes.get(pdf_id)
    if not vectorstore:
        return []
    docs = vectorstore.similarity_search(".", k=1000)  # Get as many as possible
    if not docs:
        return []
   
    text = "\n".join(doc.page_content for doc in docs)
    llm = get_llm()
    prompt = (
        "Extract the main bullet points from the following PDF content. "
        "List each point as a separate bullet. Be concise and cover each and every key idea \n"
        f"PDF Content:\n{text[:4000]}\nBullet Points:"
    )
    bullets_text = llm(prompt)
    bullet_points = [line.lstrip('-•* ').strip() for line in bullets_text.split('\n') if line.strip()]
    return bullet_points

async def extract_topics_from_pdf_id(pdf_id, pdf_indexes, pdf_metadata):
    vectorstore = pdf_indexes.get(pdf_id)
    if not vectorstore:
        return []
    docs = vectorstore.similarity_search(".", k=1000)
    if not docs:
        return []
    text = "\n".join(doc.page_content for doc in docs)
    llm = get_llm()
    prompt = (
        "Extract the main topics from the following PDF content. "
        "For each topic, provide: a label (short phrase), a list of 3-5 keywords, and a relevance score (0-1, where 1 is most relevant). "
        "Return as a list, one topic per line, in the format: Label | keyword1, keyword2, keyword3 | score\n"
        f"PDF Content:\n{text[:4000]}\nTopics:"
    )
    topics_text = llm(prompt)
    topics = []
    for line in topics_text.split('\n'):
        if not line.strip() or '|' not in line:
            continue
        parts = [p.strip() for p in line.split('|')]
        if len(parts) != 3:
            continue
        label = parts[0]
        keywords = [k.strip() for k in parts[1].split(',') if k.strip()]
        try:
            score = float(parts[2])
        except Exception:
            score = None
        topics.append({"label": label, "keywords": keywords, "score": score})
    return topics 