import React, { useState, useRef } from 'react';
import './App.css';
import Cursor from './Cursor';
import Particles from './Particles';
import { getApiUrl, API_CONFIG } from './config';

function App() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [page, setPage] = useState('upload'); // 'upload' or 'options'
  const [activeOption, setActiveOption] = useState(null); // 'ask', 'quiz', 'topics', 'bullets'
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [topics, setTopics] = useState(null);
  const [bullets, setBullets] = useState(null);
  const [quizAnswersVisible, setQuizAnswersVisible] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const fileInputRef = useRef();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const handleFileChange = async (e) => {
    setError(null);
    setSuccess(null);
    setPdfId(null);
    setPage('upload');
    setActiveOption(null);
    setAnswer(null);
    setQuiz(null);
    setTopics(null);
    setBullets(null);
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD), {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Upload failed');
      }
      const data = await res.json();
      setSuccess('PDF uploaded! PDF ID: ' + data.pdf_id);
      setPdfId(data.pdf_id);
      setPage('options');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Feature handlers
  const handleAsk = async () => {
    setAnswer(null);
    setError(null);
    if (!question.trim()) return;
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ASK), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_id: pdfId, question }),
      });
      if (!res.ok) throw new Error('Failed to get answer');
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const handleQuiz = async () => {
    setQuiz(null);
    setQuizAnswersVisible([]);
    setError(null);
    setQuizLoading(true);
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.QUIZ), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_id: pdfId }),
      });
      if (!res.ok) throw new Error('Failed to get quiz');
      const data = await res.json();
      setQuiz(data.questions);
      setQuizAnswersVisible(Array(data.questions.length).fill(false));
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleTopics = async () => {
    setTopics(null);
    setError(null);
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TOPICS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_id: pdfId }),
      });
      if (!res.ok) throw new Error('Failed to get topics');
      const data = await res.json();
      setTopics(data.topics);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const handleBullets = async () => {
    setBullets(null);
    setError(null);
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.BULLET_POINTS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_id: pdfId }),
      });
      if (!res.ok) throw new Error('Failed to get bullet points');
      const data = await res.json();
      setBullets(data.bullet_points);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // UI for each feature page
  const renderAskPage = () => (
    <div className="main-content">
      <button className="back-icon-btn" onClick={() => { setActiveOption(null); setQuizLoading(false); }} aria-label="Back to Options">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <h1 className="fun-title">Ask a Question</h1>
      <div style={{ width: '100%', maxWidth: 500, margin: '2em auto 0 auto' }}>
        <input
          type="text"
          className="fun-upload-label"
          style={{ width: '100%', marginBottom: 16, padding: 16, borderRadius: 10, border: '2px solid #2979ff', fontSize: 20 }}
          placeholder="Type your question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        <button className="fun-upload-btn" onClick={handleAsk} style={{ marginBottom: 20, fontSize: 18 }}>Get Answer</button>
        {answer && <div className="fun-success-message" style={{ fontSize: 18 }}>{answer}</div>}
        {error && <div className="fun-error-message">{error}</div>}
      </div>
    </div>
  );

  const renderQuizPage = () => (
    <div className="main-content">
      <button className="back-icon-btn" onClick={() => { setActiveOption(null); setQuizLoading(false); }} aria-label="Back to Options">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <h1 className="fun-title">Quiz</h1>
      <div style={{ width: '100%', maxWidth: 600, margin: '2em auto 0 auto' }}>
        {quiz ? quiz.map((q, i) => (
          <div key={i} style={{ marginBottom: 22, background: 'var(--card-bg, #181b23)', borderRadius: 14, padding: '1.1em 1.2em', boxShadow: '0 2px 10px rgba(41,121,255,0.07)', border: '1.5px solid #2979ff', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18, color: '#eaeaea' }}>
              <span style={{ flex: 1 }}>{i + 1}. {q.question}</span>
              {q.answer && (
                <button
                  aria-label={quizAnswersVisible[i] ? 'Hide answer' : 'Show answer'}
                  onClick={() => setQuizAnswersVisible(v => v.map((val, idx) => idx === i ? !val : val))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 10, color: '#2979ff', fontSize: 22 }}
                >
                  {quizAnswersVisible[i] ? (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.61 2.93-4.77 5.34-6.13M9.53 9.53A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .47-.11.91-.29 1.3M21 21L3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><ellipse cx="12" cy="12" rx="10" ry="7" strokeWidth="2"/><circle cx="12" cy="12" r="3" strokeWidth="2"/></svg>
                  )}
                </button>
              )}
            </div>
            {q.answer && quizAnswersVisible[i] && (
              <div style={{ color: '#2979ff', marginTop: 12, fontSize: 17, fontWeight: 500, transition: 'opacity 0.2s', opacity: 1 }}>
                Answer: {q.answer}
              </div>
            )}
          </div>
        )) : <div className="fun-upload-label" style={{ marginTop: 20 }}>Loading quiz...</div>}
        {error && <div className="fun-error-message">{error}</div>}
        <button 
          className="fun-upload-btn" 
          style={{ marginTop: 30, fontSize: 17, float: 'right', opacity: quizLoading ? 0.5 : 1, cursor: quizLoading ? 'not-allowed' : 'pointer' }} 
          onClick={handleQuiz}
          disabled={quizLoading}
        >
          {quizLoading ? 'Loading...' : 'Take Another Quiz →'}
        </button>
      </div>
    </div>
  );

  const renderTopicsPage = () => (
    <div className="main-content">
      <button className="back-icon-btn" onClick={() => { setActiveOption(null); setQuizLoading(false); }} aria-label="Back to Options">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <h1 className="fun-title">Topics</h1>
      <div style={{ width: '100%', maxWidth: 700, margin: '2em auto 0 auto', display: 'flex', flexWrap: 'wrap', gap: '1.2em', justifyContent: 'center' }}>
        {topics ? topics.map((t, i) => (
          <div key={i} style={{ background: 'var(--card-bg, #181b23)', borderRadius: 16, padding: '1.2em 1.3em', boxShadow: '0 4px 18px rgba(41,121,255,0.13)', borderLeft: '6px solid #2979ff', minWidth: 260, maxWidth: 340, flex: '1 1 260px', color: '#eaeaea', position: 'relative', transition: 'transform 0.13s, box-shadow 0.13s', display: 'flex', flexDirection: 'column', gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 22, color: '#2979ff' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 7a5 5 0 0 0-10 0c0 2.5 2.5 4.5 5 7 2.5-2.5 5-4.5 5-7z" strokeWidth="2"/><circle cx="12" cy="7" r="2" strokeWidth="2"/></svg>
              </span>
              <span style={{ fontWeight: 700, fontSize: 20, color: '#2979ff' }}>{t.label}</span>
            </div>
            {t.keywords && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 2 }}>
              {t.keywords.map((kw, idx) => (
                <span key={idx} style={{ background: '#2979ff', color: '#fff', borderRadius: 8, padding: '2px 10px', fontSize: 13, fontWeight: 600 }}>{kw}</span>
              ))}
            </div>}
            {t.score !== undefined && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 7, background: '#222', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round(t.score * 100)}%`, height: '100%', background: '#2979ff', borderRadius: 5, transition: 'width 0.3s' }}></div>
                </div>
                <span style={{ color: '#2979ff', fontWeight: 700, fontSize: 13 }}>{Math.round(t.score * 100)}%</span>
              </div>
            )}
          </div>
        )) : <div className="fun-upload-label" style={{ marginTop: 20 }}>Loading topics...</div>}
        {error && <div className="fun-error-message">{error}</div>}
      </div>
    </div>
  );

  const renderBulletsPage = () => (
    <div className="main-content">
      <button className="back-icon-btn" onClick={() => { setActiveOption(null); setQuizLoading(false); }} aria-label="Back to Options">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <h1 className="fun-title">Bullet Summary</h1>
      <div style={{ width: '100%', maxWidth: 600, margin: '2em auto 0 auto', display: 'flex', flexDirection: 'column', gap: '1.1em' }}>
        {bullets ? bullets.map((b, i) => (
          <div key={i} style={{ background: 'var(--card-bg, #181b23)', borderRadius: 12, padding: '1.1em 1.3em', boxShadow: '0 2px 10px rgba(41,121,255,0.07)', border: '1.5px solid #2979ff', color: '#eaeaea', fontSize: 17, marginBottom: 0, width: '100%' }}>{b}</div>
        )) : <div className="fun-upload-label" style={{ marginTop: 20 }}>Loading summary...</div>}
        {error && <div className="fun-error-message">{error}</div>}
      </div>
    </div>
  );

  // UI for options page
  const renderOptions = () => (
    <div className="main-content">
      <button className="back-icon-btn" onClick={() => { setPage('upload'); setPdfId(null); setActiveOption(null); setSuccess(null); setAnswer(null); setQuiz(null); setTopics(null); setBullets(null); setQuizLoading(false); }} aria-label="Back to Upload">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <h1 className="fun-title">PDF Options</h1>
      <div className="options-grid">
        <div className="option-card" onClick={() => setActiveOption('ask')}>
          <div className="option-icon">
            <svg width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="1"/></svg>
          </div>
          Ask
        </div>
        <div className="option-card" onClick={() => { setActiveOption('quiz'); handleQuiz(); }}>
          <div className="option-icon">
            <svg width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="2"/><path d="M7 8h10M7 12h6M7 16h2" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          Quiz
        </div>
        <div className="option-card" onClick={() => { setActiveOption('topics'); handleTopics(); }}>
          <div className="option-icon">
            <svg width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M8 15s1.5-2 4-2 4 2 4 2" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>
          </div>
          Topics
        </div>
        <div className="option-card" onClick={() => { setActiveOption('bullets'); handleBullets(); }}>
          <div className="option-icon">
            <svg width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="6" cy="6" r="2" strokeWidth="2"/><circle cx="6" cy="12" r="2" strokeWidth="2"/><circle cx="6" cy="18" r="2" strokeWidth="2"/><path d="M10 6h8M10 12h8M10 18h8" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          Bullets
        </div>
      </div>
      {error && <div className="fun-error-message">{error}</div>}
    </div>
  );

  if (loading) {
    return (
      <>
        <Cursor />
        <Particles />
        <div className={`splash-screen ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
          <div className="pdfwhiz-animation big">PDFwhiz</div>
          <div className="splash-tagline">Loading your PDF magic...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Cursor />
      <Particles />
      <div className={`fun-bg ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`} style={{ minHeight: '100vh', width: '100vw', boxSizing: 'border-box' }}>
        <header className="fun-header">
          <div className="logo-wordmark">PDFwhiz</div>
          <div className="fun-nav" style={{gap: '1.5em'}}>
            <a href="https://www.linkedin.com/in/sachi-0abjain/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{verticalAlign: 'middle'}}><path d="M16 8a6 6 0 0 1 6 6v5h-4v-5a2 2 0 0 0-4 0v5h-4v-9h4v1.5A4 4 0 0 1 16 8zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://github.com/Skyiesac" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{verticalAlign: 'middle'}}><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.49 2.87 8.3 6.84 9.64.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>
            </a>
            <a href="mailto:jainsachi1202@gmail.com" aria-label="Mail">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{verticalAlign: 'middle'}}><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M4 4l8 8 8-8" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
        </a>
      </div>
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle dark/light mode">
            {theme === 'light' ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
            )}
          </button>
        </header>
        {page === 'upload' ? (
          <div className="main-content">
            <h1 className="fun-title">
              Unleash Your <span className="fun-title-huge">PDF Magic!</span>
            </h1>
            <p className="fun-tagline">Turn boring PDFs into <span className="fun-highlight">fun, interactive</span> experiences.<br/>Upload your PDF and let PDFwhiz do the magic!</p>
            <section className="fun-upload-section" id="upload">
              <label htmlFor="pdf-upload" className="fun-upload-label">
                Upload your PDF
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                className="fun-file-input"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <button className="fun-upload-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Choose PDF'}
        </button>
              {success && <div className="fun-success-message">{success}</div>}
              {error && <div className="fun-error-message">{error}</div>}
            </section>
          </div>
        ) : (
          page === 'options' && !activeOption ? renderOptions() :
          activeOption === 'ask' ? renderAskPage() :
          activeOption === 'quiz' ? renderQuizPage() :
          activeOption === 'topics' ? renderTopicsPage() :
          activeOption === 'bullets' ? renderBulletsPage() : null
        )}
        <footer className="fun-footer">Developed by Sachi Jain</footer>
      </div>
    </>
  );
}

export default App;
