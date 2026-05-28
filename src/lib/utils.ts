import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return 'just now';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}m ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h ago`;
  } else if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days}d ago`;
  } else {
    return formatDate(date);
  }
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


function looksLikeRawBase64Image(value: string): boolean {
  if (!value || value.startsWith('data:') || value.startsWith('http')) return false;
  const clean = value.trim();
  // Known base64 image prefixes: PNG, JPEG, GIF, WebP, AVIF, SVG, BMP
  return /^(iVBORw0K|\/9j\/|R0lGOD|UklGR|AAAAI|AAAAB|AAAAIG|AAAAGw|PHN2Zy|Qk0|77u\/|AAAAAA)/.test(clean) && clean.length > 100;
}

function normalizeRawImageValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) return trimmed;
  // AVIF container (ftyp box starts with AAAAI or similar)
  if (/^AAAAI/.test(trimmed) && trimmed.length > 100) return `data:image/avif;base64,${trimmed}`;
  // JPEG
  if (trimmed.startsWith('/9j/')) return `data:image/jpeg;base64,${trimmed}`;
  // PNG
  if (trimmed.startsWith('iVBORw0K')) return `data:image/png;base64,${trimmed}`;
  // GIF
  if (trimmed.startsWith('R0lGOD')) return `data:image/gif;base64,${trimmed}`;
  // WebP (RIFF)
  if (trimmed.startsWith('UklGR')) return `data:image/webp;base64,${trimmed}`;
  // SVG
  if (trimmed.startsWith('PHN2Zy')) return `data:image/svg+xml;base64,${trimmed}`;
  // Generic fallback for other base64 image data
  if (looksLikeRawBase64Image(trimmed)) return `data:image/*;base64,${trimmed}`;
  return trimmed;
}

function extractImageCandidate(image: unknown): string {
  if (typeof image === 'string') {
    const value = normalizeRawImageValue(image);
    if (!value) return '';

    if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
      try {
        const parsed = JSON.parse(value) as unknown;
        const parsedCandidate = extractImageCandidate(parsed);
        if (parsedCandidate) return parsedCandidate;
      } catch {
        // fall through to the raw string below
      }
    }

    return value;
  }

  if (image && typeof image === 'object') {
    const keys = ['url', 'image', 'image_url', 'src', 'path', 'thumbnail', 'publicUrl', 'public_url', 'downloadUrl', 'download_url', 'file', 'file_url', 'fileUrl', 'uri', 'data', 'base64'];
    for (const key of keys) {
      const candidate = (image as Record<string, unknown>)[key];
      const extracted = extractImageCandidate(candidate);
      if (extracted) return extracted;
    }
  }

  return '';
}

// Returns a usable image URL or a fallback placeholder
export function normalizeImageSource(image: unknown): string {
  const candidate = extractImageCandidate(image);
  if (candidate) return candidate;

  if (image instanceof File || image instanceof Blob) {
    return '';
  }

  // Fallback: placeholder SVG (gray box)
  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%25" height="100%25" fill="%23f3f4f6"/><text x="50%25" y="50%25" font-size="32" fill="%239ca3af" text-anchor="middle" alignment-baseline="middle">No Image</text></svg>';
}

export function normalizeImageList(images: unknown): string[] {
  return (Array.isArray(images) ? images : [])
    .map((image) => normalizeImageSource(image))
    .filter(Boolean);
}

// Backend utilities (browser-safe version)
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export const formatKES = formatPrice;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function paginate(page: number = 1, limit: number = 12): { skip: number; take: number } {
  const p = Math.max(1, page);
  const l = Math.min(100, Math.max(1, limit));
  return { skip: (p - 1) * l, take: l };
}

export interface CartTotal {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export function calculateCartTotals(
  subtotal: number,
  discountAmount: number = 0,
  shippingCost: number = 0,
  taxRate: number = 0.16
): CartTotal {
  const discount = Math.min(discountAmount, subtotal);
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * taxRate;
  const shipping = shippingCost;
  const total = subtotal - discount + shipping + tax;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
  };
}

export function getSkipTake(page: number, limit: number): [number, number] {
  const p = Math.max(1, parseInt(String(page)) || 1);
  const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 12));
  return [(p - 1) * l, l];
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const pages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
  };
}
