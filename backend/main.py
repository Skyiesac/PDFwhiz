from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import pdf_chat
from services.cache import cache

load_dotenv()

app = FastAPI(title="PDFwhizz", description="Chat with PDF feature.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf_chat.router, prefix="/api/v1/pdf-chat", tags=["PDF Chat"])


@app.get("/")
def read_root():
    return {"message": "PDFwhiz it is!"}


@app.get("/health/cache")
async def cache_health_check():
    """Health check for Redis cache"""
    try:
        client = await cache.get_client()
        await client.ping()
        return {"status": "healthy", "cache": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "cache": "disconnected", "error": str(e)}
