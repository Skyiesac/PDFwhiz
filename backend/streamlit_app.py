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

# Bullet Points Section
st.header("4. Extract Bullet Points from your PDF")
if st.button("Extract Bullet Points"):
    with st.spinner("Extracting bullet points..."):
        data = {"pdf_id": st.session_state["pdf_id"]}
        response = requests.post(f"{API_URL}/bullet-points", json=data)
        if response.status_code == 200:
            bullet_points = response.json()["bullet_points"]
            if bullet_points:
                st.markdown("### Bullet Points:")
                for bp in bullet_points:
                    st.markdown(f"- {bp}")
            else:
                st.info("No bullet points found.")
        else:
            st.error(f"Error: {response.text}")

# Topic Modeling Section (Auto-fetch and display if pdf_id exists)
if "pdf_id" in st.session_state:
    st.header("5. Main Topics in your PDF")
    if "topics" not in st.session_state:
        with st.spinner("Extracting topics..."):
            data = {"pdf_id": st.session_state["pdf_id"]}
            response = requests.post(f"{API_URL}/topics", json=data)
            if response.status_code == 200:
                st.session_state["topics"] = response.json()["topics"]
            else:
                st.session_state["topics"] = None
                st.error(f"Error: {response.text}")
    topics = st.session_state.get("topics")
    if topics:
        st.markdown("### Main Topics:")
        for i, topic in enumerate(topics, 1):
            st.markdown(f"**{i}. {topic['label']}**")
            if topic.get("keywords"):
                st.markdown(f"Keywords: {', '.join(topic['keywords'])}")
            if topic.get("score") is not None:
                st.markdown(f"Relevance: {topic['score']:.2%}")
            st.markdown("---")
    elif topics == []:
        st.info("No topics found.")

    # Manual re-extraction button
    if st.button("Extract Topics Again"):
        with st.spinner("Extracting topics..."):
            data = {"pdf_id": st.session_state["pdf_id"]}
            response = requests.post(f"{API_URL}/topics", json=data)
            if response.status_code == 200:
                st.session_state["topics"] = response.json()["topics"]
                st.rerun()
            else:
                st.error(f"Error: {response.text}")