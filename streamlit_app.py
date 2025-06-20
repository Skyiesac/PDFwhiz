import streamlit as st
import requests

API_URL = "http://localhost:8000/api/v1/pdf-chat"

st.title("Chat with your PDF")

# Upload PDF
st.header("1. Upload a PDF")
uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
if uploaded_file is not None:
    with st.spinner("Uploading and indexing PDF..."):
        files = {"file": (uploaded_file.name, uploaded_file, "application/pdf")}
        response = requests.post(f"{API_URL}/upload", files=files)
        if response.status_code == 200:
            pdf_id = response.json()["pdf_id"]
            st.success(f"PDF uploaded! PDF ID: {pdf_id}")
            st.session_state["pdf_id"] = pdf_id
        else:
            st.error(f"Upload failed: {response.text}")

#Chat with PDF
if "pdf_id" in st.session_state:
    st.header("2. Ask a question about your PDF")
    question = st.text_input("Your question")
    if st.button("Ask") and question:
        with st.spinner("Getting answer..."):
            data = {"pdf_id": st.session_state["pdf_id"], "question": question}
            response = requests.post(f"{API_URL}/ask", json=data)
            if response.status_code == 200:
                answer = response.json()["answer"]
                st.success(f"Answer: {answer}")
            else:
                st.error(f"Error: {response.text}")
else:
    st.info("Upload a PDF to start chatting.")

# Quiz Section
if "pdf_id" in st.session_state:
    st.header("3. Generate a Quiz from your PDF")
    if st.button("Generate Quiz"):
        with st.spinner("Generating quiz..."):
            data = {"pdf_id": st.session_state["pdf_id"]}
            response = requests.post(f"{API_URL}/quiz", json=data)
            if response.status_code == 200:
                quiz = response.json()["questions"]
                for i, qa in enumerate(quiz, 1):
                    st.markdown(f"**Q{i}: {qa['question']}**")
                    if qa.get("answer"):
                        st.markdown(f"- *Answer:* {qa['answer']}")
            else:
                st.error(f"Error: {response.text}")