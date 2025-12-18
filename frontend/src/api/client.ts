import { showError } from '@/utils/toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If sending FormData, let the browser set Content-Type (it needs boundary)
  if (options.body instanceof FormData) {
      delete headers['Content-Type'];
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch (e) {
            // response not json
        }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    console.error('API Request Failed:', error);
    showError(error.message || 'Something went wrong');
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchClient<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) => fetchClient<T>(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) => fetchClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => fetchClient<T>(endpoint, { method: 'DELETE' }),
};