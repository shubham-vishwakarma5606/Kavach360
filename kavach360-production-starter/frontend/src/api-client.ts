const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function login(email: string, password: string) {
  const result = await api<{ token: string; user: any }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('token', result.token);
  localStorage.setItem('user', JSON.stringify(result.user));
  return result.user;
}

export const dashboardApi = () => api('/api/dashboard');
export const usersApi = () => api('/api/users');
export const modulesApi = () => api('/api/modules');
export const phishingTemplatesApi = () => api('/api/phishing/templates');
export const phishingCampaignsApi = () => api('/api/phishing/campaigns');
export const complianceReportApi = () => api('/api/reports/compliance');
