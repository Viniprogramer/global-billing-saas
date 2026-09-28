const TOKEN_KEY = 'crm_token';
const LOCALE_KEY = 'crm_locale';

export function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getLocalePreference() {
  if (typeof window === 'undefined') {
    return 'en';
  }
  return localStorage.getItem(LOCALE_KEY) ?? 'en';
}

export function setLocalePreference(locale: 'en' | 'pt-BR') {
  localStorage.setItem(LOCALE_KEY, locale);
}

export async function authedFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Request failed');
  }

  return data as T;
}
