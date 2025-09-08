import axios from 'axios';

const ENV_LOG_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LOG_SERVER_URL)
  || import.meta.env.VITE_LOG_SERVER_URL
  || import.meta.env.LOG_SERVER_URL
  || 'https://example-log-server.invalid';

const http = axios.create({
  baseURL: ENV_LOG_URL,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function Log(stack, level, packageName, message) {
  try {
    const payload = {
      stack : "frontend",
      level : "info",
      package: "api",
      message : "received string, expected bool",
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    await http.post('/log', payload);
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.warn('[LoggingMiddleware] Failed to send log', error?.message || error);
    }
  }
}

export default Log;


