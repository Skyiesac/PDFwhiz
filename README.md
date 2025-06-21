# PDFwhiz 🚀

A powerful PDF chat application that allows you to upload PDF documents and interact with them through natural language conversations. Built with FastAPI, React, and LangChain.

## ✨ Features

- **PDF Upload & Processing**: Upload PDF files and automatically process them for chat interactions
- **Intelligent Chat**: Ask questions about your PDF content and get contextual answers
- **Quiz Generation**: Automatically generate quizzes from PDF content
- **Bullet Points Extraction**: Extract key bullet points from documents
- **Topic Extraction**: Identify main topics covered in the document
- **Redis Caching**: Fast response times with intelligent caching
- **Modern UI**: Beautiful, responsive React frontend with particle effects
- **Real-time Processing**: Streamlined PDF processing with progress tracking

## 🏗️ Architecture

- **Backend**: FastAPI with Python
- **Frontend**: React with Vite
- **AI/ML**: LangChain with OpenAI integration
- **Caching**: Redis for performance optimization
- **PDF Processing**: PyPDF2 and FAISS for document indexing

## 🧠 Technical Concepts

### 🤖 RAG (Retrieval-Augmented Generation)
The core technology that powers intelligent PDF chat. Documents are split into chunks, converted to vectors, and retrieved when users ask questions to provide contextual responses.

### 🔍 Vector Search & Embeddings
- **FAISS**: Facebook's similarity search library for fast vector retrieval
- **Hugging Face**: Sentence transformers for creating semantic embeddings
- **Model**: `all-MiniLM-L6-v2` for efficient text-to-vector conversion

### 🧩 LangChain Framework
Orchestrates the entire RAG pipeline with document loaders, text splitters, vector stores, and conversation chains.

### ⚡ Redis Caching
High-performance caching for quiz questions, bullet points, and topics to reduce API calls and improve response times.

### 🚀 FastAPI & Swagger
Modern Python web framework with automatic API documentation at `/docs` for easy testing and integration.

### 🤖 AI Models
- **Google Gemini 2.0 Flash**: Primary LLM for generating responses and quizzes
- **Hugging Face Transformers**: For text embeddings and semantic understanding

### 📄 PDF Processing
- **PyPDF2**: PDF text extraction and processing
- **Text Chunking**: Recursive character splitting for optimal context windows
- **Vector Indexing**: FAISS-based similarity search for relevant content retrieval

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- Docker (for Redis)
- Gemini API key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PDFwhiz
```

### 2. Initial Setup (One-time)

```bash
In backend and frontend directories , add .env files and add the respective things. 

Setup virtual environment for python (Recommended)
```

### 3. Start Everything with One Command! 🎉

```bash
./start.sh
```

That's it! The script will automatically:
- 🐳 Start Redis container
- 🔧 Start the FastAPI backend
- 🎨 Start the React frontend
- ✅ Show you the URLs to access

**Access your app:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

**To stop everything:** Press `Ctrl+C` in the terminal


## 🔍 Troubleshooting

### Common Issues

1. **Redis Connection Error**
   ```bash
   # Check if Redis is running
   docker ps | grep redis
   
   # Restart Redis
   ./redis-setup.sh restart
   ```

2. **API Key Issues**
   - Ensure your Gemini API key is correctly set in `backend/.env`
   - Check API key permissions and quota

3. **Port Conflicts**
   - Backend: Change port in `uvicorn main:app --port 8001`
   - Frontend: Change in `vite.config.js`
   - Redis: Change in `docker run -p 6380:6379`

4. **PDF Processing Errors**
   - Ensure PDF is not corrupted
   - Check file size limits
   - Verify PDF is text-based (not scanned images)

5. **Start Script Issues**
   ```bash
   # Make sure script is executable
   chmod +x start.sh
   
   # Check if all dependencies are installed
   ./start.sh

   #Check the environment activation command as it is different for different OS.
   ```

**Happy PDF chatting! 📚✨** 