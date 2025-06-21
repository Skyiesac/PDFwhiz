export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: (() => {
    const url = import.meta.env.VITE_API_BASE_URL;
    if (!url) {
      throw new Error('VITE_API_BASE_URL is not set! Please configure it in your environment variables.');
    }
    return url;
  })(),
  
  // API endpoints
  ENDPOINTS: {
    UPLOAD: '/api/v1/pdf-chat/upload',
    ASK: '/api/v1/pdf-chat/ask',
    QUIZ: '/api/v1/pdf-chat/quiz',
    QUIZ_FILE: '/api/v1/pdf-chat/quiz/file',
    BULLET_POINTS: '/api/v1/pdf-chat/bullet-points',
    TOPICS: '/api/v1/pdf-chat/topics',
    HEALTH_CACHE: '/health/cache'
  }
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  
  return {
    ...API_CONFIG,
    BASE_URL: API_CONFIG.BASE_URL
  };
};