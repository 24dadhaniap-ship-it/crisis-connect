const API_BASE = '/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; pagination?: any }> {
  const token = localStorage.getItem('crisis_access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();
    if (!res.ok && !json.message) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return json;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    return {
      success: false,
      message: err.message || 'Network error occurred. Please check your connection.',
    };
  }
}
