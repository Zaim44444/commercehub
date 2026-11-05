const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is missing.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const headers = new Headers(options.headers);

    if (options.body) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        body?.message ??
          body?.detail ??
          body?.title ??
          `Request failed (${response.status}).`,
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Check your backend connection.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}