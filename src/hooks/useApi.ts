import { supabase } from '@/lib/supabase';

export function useApi() {
  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`
    };
  };

  const apiCall = async <T,>(method: string, path: string, body?: any): Promise<{ data: T | null; error: string | null }> => {
    try {
      const headers = await getHeaders();
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json.error || 'Request failed' };
      return { data: json, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Network error' };
    }
  };

  return {
    get: <T,>(path: string) => apiCall<T>('GET', path),
    post: <T,>(path: string, body?: any) => apiCall<T>('POST', path, body),
    put: <T,>(path: string, body?: any) => apiCall<T>('PUT', path, body),
    del: <T,>(path: string) => apiCall<T>('DELETE', path)
  };
}
