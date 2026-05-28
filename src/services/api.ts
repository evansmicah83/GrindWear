const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

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
  if (!res.ok) {
    // Only throw auth errors as a special type so callers can distinguish
    const err: any = new Error(data.error || 'Request failed');
    err.status = res.status;
    throw err;
  }
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
    return req<{ data: any[]; pagination: any }>(`/products${qs}`);
  },
  getProduct: (slug: string) => req<{ data: any }>(`/products/${slug}`),
  getCategories: () => req<{ data: any[] }>('/products/categories'),

  // Orders
  createOrder: (data: any) => req<{ data: any }>('/orders', { method: 'POST', body: JSON.stringify(data) }, true),
  getMyOrders: () => req<{ data: any[] }>('/orders/my', {}, true),
  getOrder: (id: string) => req<{ data: any }>(`/orders/${id}`, {}, true),
  cancelOrder: (id: string) => req<{ data: any }>(`/orders/${id}/cancel`, { method: 'PATCH' }, true),

  // Users
  getProfile: () => req<{ data: any }>('/users/profile', {}, true),
  updateProfile: (data: any) => req<{ data: any }>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }, true),
  getAddresses: () => req<{ data: any[] }>('/users/addresses', {}, true),
  addAddress: (data: any) => req<{ data: any }>('/users/addresses', { method: 'POST', body: JSON.stringify(data) }, true),
  updateAddress: (id: string, data: any) => req<{ data: any }>(`/users/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  deleteAddress: (id: string) => req<{ data: any }>(`/users/addresses/${id}`, { method: 'DELETE' }, true),
  getWishlist: () => req<{ data: any[] }>('/users/wishlist', {}, true),
  addToWishlist: (product_id: string) => req<{ data: any }>('/users/wishlist', { method: 'POST', body: JSON.stringify({ product_id }) }, true),
  removeFromWishlist: (productId: string) => req<{ data: any }>(`/users/wishlist/${productId}`, { method: 'DELETE' }, true),

  // Reviews
  getReviews: (productId: string) => req<{ data: any[] }>(`/reviews/${productId}`),
  checkReviewed: (productId: string) => req<{ reviewed: boolean }>(`/reviews/${productId}/mine`, {}, true),
  addReview: (data: any) => req<{ data: any }>('/reviews', { method: 'POST', body: JSON.stringify(data) }, true),

  // Newsletter
  subscribe: (email: string) => req<{ data: any }>('/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),

  // Coupons
  validateCoupon: (code: string, cart_total: number) =>
    req<{ data: { coupon: any; discount: number } }>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, cart_total }) }),

  // Chat
  getMessages: () => req<any[]>('/chat/messages', {}, true),
  sendMessage: (content: string) => req<any>('/chat/messages', { method: 'POST', body: JSON.stringify({ content }) }, true),

  // Admin
  adminDashboard: () => req<{ data: any }>('/admin/dashboard', {}, true),
  adminGetUsers: () => req<{ data: any[] }>('/admin/users', {}, true),
  adminGetOrders: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<{ data: any[] }>(`/admin/orders${qs}`, {}, true);
  },
  adminUpdateOrder: (id: string, data: any) => req<{ data: any }>(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  adminGetProducts: () => req<{ data: any[] }>('/admin/products', {}, true),
  adminCreateProduct: (data: any) => req<{ data: any }>('/admin/products', { method: 'POST', body: JSON.stringify(data) }, true),
  adminUpdateProduct: (id: string, data: any) => req<{ data: any }>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  adminDeleteProduct: (id: string) => req<{ data: any }>(`/admin/products/${id}`, { method: 'DELETE' }, true),
  adminGetCoupons: () => req<{ data: any[] }>('/admin/coupons', {}, true),
  adminCreateCoupon: (data: any) => req<{ data: any }>('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }, true),
  adminGetReviews: () => req<{ data: any[] }>('/admin/reviews', {}, true),
  adminUpdateReview: (id: string, data: any) => req<{ data: any }>(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, true),
  adminDeleteReview: (id: string) => req<{ data: any }>(`/admin/reviews/${id}`, { method: 'DELETE' }, true),

  // Admin Categories
  adminGetCategories: () => req<{ data: any[] }>('/admin/categories', {}, true),
  adminCreateCategory: (data: any) => req<{ data: any }>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }, true),
  adminUpdateCategory: (id: string, data: any) => req<{ data: any }>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  adminDeleteCategory: (id: string) => req<{ data: any }>(`/admin/categories/${id}`, { method: 'DELETE' }, true),

  // Admin Inventory
  adminGetInventory: () => req<{ data: any[] }>('/admin/inventory', {}, true),
  adminUpdateStock: (variantId: string, stock_qty: number) => req<{ data: any }>(`/admin/inventory/${variantId}`, { method: 'PATCH', body: JSON.stringify({ stock_qty }) }, true),

  // Admin Newsletter
  adminGetNewsletter: () => req<{ data: any[] }>('/admin/newsletter', {}, true),
  adminToggleSubscriber: (id: string, is_active: boolean) => req<{ data: any }>(`/admin/newsletter/${id}`, { method: 'PATCH', body: JSON.stringify({ is_active }) }, true),
  adminDeleteSubscriber: (id: string) => req<{ data: any }>(`/admin/newsletter/${id}`, { method: 'DELETE' }, true),

  // Admin management
  adminGetAdmins: () => req<{ data: any[] }>('/admin/admins', {}, true),
  adminCreateAdmin: (data: any) => req<{ data: any }>('/admin/admins', { method: 'POST', body: JSON.stringify(data) }, true),
  adminUpdateAdmin: (id: string, data: any) => req<{ data: any }>(`/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),

  // Settings
  getSettings: () => req<{ data: Record<string, string> }>('/settings'),
  saveSettings: (data: Record<string, string>) => req<{ data: any }>('/settings', { method: 'PUT', body: JSON.stringify(data) }, true),

  // Notifications
  getNotifications: () => req<{ data: any[] }>('/notifications', {}, true),
  markNotificationRead: (id: string) => req<{ data: any }>(`/notifications/${id}/read`, { method: 'PATCH' }, true),
  markAllNotificationsRead: () => req<{ data: any }>('/notifications/read-all', { method: 'PATCH' }, true),
  deleteNotification: (id: string) => req<{ data: any }>(`/notifications/${id}`, { method: 'DELETE' }, true),
  clearNotifications: () => req<{ data: any }>('/notifications', { method: 'DELETE' }, true),
};
