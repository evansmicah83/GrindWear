import { supabase } from '../lib/supabase/client';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw Object.assign(new Error(error.message), { status: 401 });
    return { token: data.session?.access_token, user: data.user };
  },

  register: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw Object.assign(new Error(error.message), { status: 409 });
    return { token: data.session?.access_token, user: data.user };
  },

  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data: profile } = await supabase.from('users').select('id,name,email,role,phone,avatar_url').eq('id', user.id).single();
    return profile;
  },

  // ── Products ───────────────────────────────────────────────────────────────
  getProducts: async (params?: Record<string, string>) => {
    const page = Math.max(1, parseInt(params?.page || '1'));
    const limit = Math.min(100, parseInt(params?.limit || '12'));
    const from = (page - 1) * limit;

    let q = supabase.from('products').select(`
      id,name,slug,description,short_description,price,compare_price,sku,is_active,is_featured,is_new,tags,created_at,
      categories(name,slug),
      product_images(id,url,alt_text,is_primary,sort_order),
      product_variants(id,size,color,color_hex,stock_qty,sku_variant),
      reviews(rating)
    `, { count: 'exact' }).eq('is_active', true).range(from, from + limit - 1);

    if (params?.category) q = q.eq('categories.slug', params.category);
    if (params?.featured === 'true') q = q.eq('is_featured', true);
    if (params?.trending === 'true') q = q.eq('is_new', true);
    if (params?.search) q = q.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    if (params?.sort === 'price-asc') q = q.order('price', { ascending: true });
    else if (params?.sort === 'price-desc') q = q.order('price', { ascending: false });
    else q = q.order('created_at', { ascending: false });

    const { data, count, error } = await q;
    if (error) throw new Error(error.message);
    return { data: data || [], pagination: { page, limit, total: count || 0 } };
  },

  getProduct: async (slug: string) => {
    const { data, error } = await supabase.from('products').select(`
      id,name,slug,description,short_description,price,compare_price,sku,is_active,is_featured,is_new,tags,created_at,
      categories(name,slug),
      product_images(id,url,alt_text,is_primary,sort_order),
      product_variants(id,size,color,color_hex,stock_qty,sku_variant)
    `).or(`slug.eq.${slug},id.eq.${slug}`).eq('is_active', true).single();
    if (error) throw Object.assign(new Error('Product not found'), { status: 404 });
    return { data };
  },

  getCategories: async () => {
    const { data, error } = await supabase.from('categories').select('*, products(count)').eq('is_active', true).order('sort_order');
    if (error) throw new Error(error.message);
    return { data: data || [] };
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  createOrder: async (body: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { items, subtotal, shipping_cost = 0, discount_amount = 0, total, shippingAddress, paymentMethod } = body;

    const { data: addr } = await supabase.from('addresses').insert({
      user_id: user?.id || null, label: 'Shipping', street: shippingAddress.street,
      city: shippingAddress.city, county: shippingAddress.county || shippingAddress.state,
      country: shippingAddress.country || 'Kenya', postal_code: shippingAddress.postalCode || ''
    }).select().single();

    const year = new Date().getFullYear();
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', `${year}-01-01`);
    const orderNumber = `GRB-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user?.id || null, order_number: orderNumber, subtotal: subtotal || total,
      shipping_cost, discount_amount, total, shipping_address_id: addr?.id, payment_method: paymentMethod
    }).select().single();
    if (error) throw new Error(error.message);

    for (const item of items) {
      await supabase.from('order_items').insert({
        order_id: order.id, product_id: item.productId || item.product?.id,
        variant_id: item.variantId || null, quantity: item.quantity,
        unit_price: item.price, total_price: item.price * item.quantity,
        product_name: item.productName || item.product?.name,
        variant_info: { size: item.size, color: item.color }
      });
    }
    return { data: order };
  },

  getMyOrders: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return { data: data || [] };
  },

  getOrder: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').or(`id.eq.${id},order_number.eq.${id}`).single();
    if (error) throw Object.assign(new Error('Order not found'), { status: 404 });
    return { data };
  },

  cancelOrder: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data, error } = await supabase.from('orders').update({ status: 'cancelled' }).or(`id.eq.${id},order_number.eq.${id}`).eq('user_id', user.id).select().single();
    if (error) throw new Error(error.message);
    return { data };
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data } = await supabase.from('users').select('id,name,email,role,phone,avatar_url,created_at').eq('id', user.id).single();
    return { data };
  },

  updateProfile: async (body: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data } = await supabase.from('users').update({ ...body, updated_at: new Date().toISOString() }).eq('id', user.id).select('id,name,email,phone,avatar_url,role').single();
    return { data };
  },

  getAddresses: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    return { data: data || [] };
  },

  addAddress: async (body: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    if (body.is_default) await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    const { data } = await supabase.from('addresses').insert({ user_id: user.id, ...body }).select().single();
    return { data };
  },

  updateAddress: async (id: string, body: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    if (body.is_default) await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    const { data } = await supabase.from('addresses').update(body).eq('id', id).eq('user_id', user.id).select().single();
    return { data };
  },

  deleteAddress: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id);
    return { data: { success: true } };
  },

  getWishlist: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data } = await supabase.from('wishlists').select('*, products(name,slug,price,compare_price,product_images(url,is_primary))').eq('user_id', user.id).order('created_at', { ascending: false });
    return { data: data || [] };
  },

  addToWishlist: async (product_id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data } = await supabase.from('wishlists').insert({ user_id: user.id, product_id }).select().single();
    return { data };
  },

  removeFromWishlist: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
    return { data: { success: true } };
  },

  // ── Reviews ────────────────────────────────────────────────────────────────
  getReviews: async (productId: string) => {
    const { data } = await supabase.from('reviews').select('id,rating,title,body,anonymous,created_at,users(name,avatar_url)').eq('product_id', productId).eq('is_approved', true).order('created_at', { ascending: false });
    const mapped = (data || []).map((r: any) => ({
      ...r, user_name: r.anonymous ? 'Anonymous' : r.users?.name, avatar_url: r.anonymous ? null : r.users?.avatar_url, users: undefined
    }));
    return { data: mapped };
  },

  checkReviewed: async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { reviewed: false };
    const { data } = await supabase.from('reviews').select('id').eq('product_id', productId).eq('user_id', user.id).single();
    return { reviewed: !!data };
  },

  addReview: async (body: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data, error } = await supabase.from('reviews').insert({ ...body, user_id: user.id }).select().single();
    if (error) throw new Error(error.message);
    return { data };
  },

  // ── Misc ───────────────────────────────────────────────────────────────────
  subscribe: async (email: string) => {
    const { error } = await supabase.from('newsletters').insert({ email });
    if (error) throw new Error(error.message);
    return { data: { success: true } };
  },

  validateCoupon: async (code: string, cart_total: number) => {
    const { data: coupon, error } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();
    if (error || !coupon) throw Object.assign(new Error('Invalid or expired coupon'), { status: 404 });
    let discount = coupon.type === 'percentage' ? (cart_total * coupon.value) / 100 : coupon.value;
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
    return { data: { coupon, discount } };
  },

  getSettings: async () => {
    const { data } = await supabase.from('settings').select('key,value');
    const map: Record<string, string> = {};
    (data || []).forEach((r: any) => { map[r.key] = r.value; });
    return { data: map };
  },

  saveSettings: async (body: Record<string, string>) => {
    for (const [key, value] of Object.entries(body)) {
      await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    }
    return { data: { success: true } };
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  getNotifications: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    return { data: (data || []).map((n: any) => ({ id: n.id, type: n.type, title: n.title, message: n.message, link: n.link, read: n.read, createdAt: n.created_at })) };
  },

  markNotificationRead: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id);
    return { data: { success: true } };
  },

  markAllNotificationsRead: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
    return { data: { success: true } };
  },

  deleteNotification: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    await supabase.from('notifications').delete().eq('id', id).eq('user_id', user.id);
    return { data: { success: true } };
  },

  clearNotifications: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
    await supabase.from('notifications').delete().eq('user_id', user.id);
    return { data: { success: true } };
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  adminDashboard: async () => {
    const [{ data: rev }, { count: orders }, { count: customers }, { data: lowStock }, { data: recentOrders }] = await Promise.all([
      supabase.from('orders').select('total').eq('payment_status', 'paid'),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('product_variants').select('stock_qty,products(name),size,color').lt('stock_qty', 5),
      supabase.from('orders').select('*, users(name)').order('created_at', { ascending: false }).limit(10),
    ]);
    const revenue = (rev || []).reduce((s: number, r: any) => s + Number(r.total), 0);
    return { data: { revenue, orders, customers, lowStock, recentOrders } };
  },

  adminGetUsers: async () => {
    const { data } = await supabase.from('users').select('id,name,email,role,phone,avatar_url,created_at,orders(total)').order('created_at', { ascending: false });
    return { data: data || [] };
  },

  adminGetOrders: async (params?: Record<string, string>) => {
    const page = parseInt(params?.page || '1');
    const limit = parseInt(params?.limit || '20');
    let q = supabase.from('orders').select('*,users(name,email,phone),addresses(*),order_items(*)', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
    if (params?.status) q = q.eq('status', params.status);
    const { data } = await q;
    return { data: data || [] };
  },

  adminUpdateOrder: async (id: string, body: any) => {
    const { data } = await supabase.from('orders').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    return { data };
  },

  adminGetProducts: async () => {
    const { data } = await supabase.from('products').select('*,categories(name),product_variants(stock_qty),product_images(*)').order('created_at', { ascending: false });
    return { data: data || [] };
  },

  adminCreateProduct: async (body: any) => {
    const { name, description, short_description, price, compare_price, sku, category_id, is_featured, is_new, tags, variants = [], images = [] } = body;
    let slug = body.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data: product } = await supabase.from('products').insert({ name, slug, description, short_description, price, compare_price: compare_price || null, sku: sku?.trim() || null, category_id, is_featured: is_featured || false, is_new: is_new || false, tags: tags || [] }).select().single();
    for (const v of variants) await supabase.from('product_variants').insert({ product_id: product.id, ...v });
    for (let i = 0; i < images.length; i++) await supabase.from('product_images').insert({ product_id: product.id, url: images[i].url, alt_text: images[i].alt_text || name, sort_order: i, is_primary: i === 0 });
    return { data: product };
  },

  adminUpdateProduct: async (id: string, body: any) => {
    const { images, ...fields } = body;
    const { data: product } = await supabase.from('products').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (Array.isArray(images)) {
      await supabase.from('product_images').delete().eq('product_id', id);
      for (let i = 0; i < images.length; i++) {
        const url = typeof images[i] === 'string' ? images[i] : images[i].url;
        if (url) await supabase.from('product_images').insert({ product_id: id, url, alt_text: images[i].alt_text || fields.name, sort_order: i, is_primary: i === 0 });
      }
    }
    return { data: product };
  },

  adminDeleteProduct: async (id: string) => {
    await supabase.from('products').update({ is_active: false }).eq('id', id);
    return { data: { success: true } };
  },

  adminGetCategories: async () => {
    const { data } = await supabase.from('categories').select('*,products(count)').order('sort_order');
    return { data: data || [] };
  },

  adminCreateCategory: async (body: any) => {
    const { name, description, image_url } = body;
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data } = await supabase.from('categories').insert({ name: name.trim(), slug, description: description || null, image_url: image_url || null }).select().single();
    return { data };
  },

  adminUpdateCategory: async (id: string, body: any) => {
    const { data } = await supabase.from('categories').update(body).eq('id', id).select().single();
    return { data };
  },

  adminDeleteCategory: async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    return { data: { success: true } };
  },

  adminGetInventory: async () => {
    const { data } = await supabase.from('product_variants').select('*,products(id,name,slug,sku,categories(name),product_images(url,is_primary))').order('stock_qty');
    return { data: data || [] };
  },

  adminUpdateStock: async (variantId: string, stock_qty: number) => {
    const { data } = await supabase.from('product_variants').update({ stock_qty }).eq('id', variantId).select().single();
    return { data };
  },

  adminGetCoupons: async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    return { data: data || [] };
  },

  adminCreateCoupon: async (body: any) => {
    const { data } = await supabase.from('coupons').insert({ ...body, code: body.code.toUpperCase() }).select().single();
    return { data };
  },

  adminGetReviews: async () => {
    const { data } = await supabase.from('reviews').select('*,users(name,email,avatar_url),products(name,slug,product_images(url,is_primary))').order('created_at', { ascending: false });
    return { data: data || [] };
  },

  adminUpdateReview: async (id: string, body: any) => {
    const { data } = await supabase.from('reviews').update(body).eq('id', id).select().single();
    return { data };
  },

  adminDeleteReview: async (id: string) => {
    await supabase.from('reviews').delete().eq('id', id);
    return { data: { success: true } };
  },

  adminGetNewsletter: async () => {
    const { data } = await supabase.from('newsletters').select('*').order('created_at', { ascending: false });
    return { data: data || [] };
  },

  adminToggleSubscriber: async (id: string, is_active: boolean) => {
    const { data } = await supabase.from('newsletters').update({ is_active }).eq('id', id).select().single();
    return { data };
  },

  adminDeleteSubscriber: async (id: string) => {
    await supabase.from('newsletters').delete().eq('id', id);
    return { data: { success: true } };
  },

  adminGetAdmins: async () => {
    const { data } = await supabase.from('users').select('id,name,email,created_at').eq('role', 'admin').order('created_at');
    return { data: data || [] };
  },
};
