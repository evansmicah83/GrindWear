const BASE = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('grind-token');
}

function headers(auth = false) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) h['Authorization'] = `Bearer ${t}`;
  }
  return h;
}

async function req<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...options, headers: headers(auth) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    req<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, name: string) =>
    req<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  me: () => req<any>('/auth/me', {}, true),

  // Products
  getProducts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<any[]>(`/products${qs}`);
  },
  getProduct: (id: string) => req<any>(`/products/${id}`),

  // Orders
  createOrder: (data: any) => req<any>('/orders', { method: 'POST', body: JSON.stringify(data) }, true),
  getMyOrders: () => req<any[]>('/orders/my', {}, true),
  getOrder: (id: string) => req<any>(`/orders/${id}`, {}, true),
  cancelOrder: (id: string) => req<any>(`/orders/${id}/cancel`, { method: 'PATCH' }, true),

  // Chat
  getMessages: () => req<any[]>('/chat/messages', {}, true),
  sendMessage: (content: string) => req<any>('/chat/messages', { method: 'POST', body: JSON.stringify({ content }) }, true),

  // Admin
  adminGetUsers: () => req<any[]>('/admin/users', {}, true),
  adminGetOrders: () => req<any[]>('/admin/orders', {}, true),
  adminUpdateOrderStatus: (id: string, status: string) =>
    req<any>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, true),
  adminGetProducts: () => req<any[]>('/admin/products', {}, true),
  adminCreateProduct: (data: any) => req<any>('/admin/products', { method: 'POST', body: JSON.stringify(data) }, true),
  adminUpdateProduct: (id: string, data: any) => req<any>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  adminDeleteProduct: (id: string) => req<any>(`/admin/products/${id}`, { method: 'DELETE' }, true),
};
