// lib/api.ts - مساعدات للتعامل مع Django API

// ✅ FIX #1: Validate API URLs at build time to prevent production failures
function getApiBaseUrl(): string {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    // In development, warn and use localhost
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '⚠️ API_URL and NEXT_PUBLIC_API_URL not set. Using localhost for development.'
      );
      return 'http://127.0.0.1:8000/api';
    }
    
    // In production, fail hard
    throw new Error(
      'CRITICAL: API_URL or NEXT_PUBLIC_API_URL must be set in production. ' +
      'Check your .env.local or deployment configuration.'
    );
  }
  
  return apiUrl.replace(/\/$/, '');
}

function getMediaBaseUrl(): string {
  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;
  
  if (!mediaUrl) {
    // In development, warn and use localhost
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '⚠️ NEXT_PUBLIC_MEDIA_URL not set. Using localhost for development.'
      );
      return 'http://127.0.0.1:8000';
    }
    
    // In production, fail hard
    throw new Error(
      'CRITICAL: NEXT_PUBLIC_MEDIA_URL must be set in production. ' +
      'Check your .env.local or deployment configuration.'
    );
  }
  
  return mediaUrl.replace(/\/$/, '');
}

const API_BASE_URL = getApiBaseUrl();
const MEDIA_BASE_URL = getMediaBaseUrl();

// ✅ FIX #2: Add timeout support and better error handling
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 2;

interface FetchOptions extends RequestInit {
  timeout?: number;
  skipRetry?: boolean;
}

// Helper to create AbortController with timeout
function createTimeoutAbort(timeoutMs: number): { signal: AbortSignal; timeoutId: NodeJS.Timeout } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, timeoutId };
}

// Retry logic for failed requests
async function fetchWithRetry(
  url: string,
  options: FetchOptions,
  retryCount: number = 0
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT_MS, skipRetry = false, ...fetchOptions } = options;
  const { signal, timeoutId } = createTimeoutAbort(timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal,
    });

    clearTimeout(timeoutId);

    // Retry on network errors or 5xx status codes (but not 4xx)
    if (!response.ok && response.status >= 500 && retryCount < MAX_RETRIES && !skipRetry) {
      console.warn(
        `⚠️ Server error (${response.status}). Retrying... (${retryCount + 1}/${MAX_RETRIES})`
      );
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      return fetchWithRetry(url, options, retryCount + 1);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    // Retry on network errors (but not on abort/timeout)
    if (retryCount < MAX_RETRIES && !skipRetry) {
      console.warn(
        `⚠️ Network error: ${error instanceof Error ? error.message : 'Unknown error'}. Retrying... (${retryCount + 1}/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      return fetchWithRetry(url, options, retryCount + 1);
    }

    throw error;
  }
}

interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

// مساعد لجلب البيانات من API
export async function fetchFromAPI(endpoint: string, options?: FetchOptions) {
  const url = `${API_BASE_URL}${endpoint}`;
  const { headers, timeout = DEFAULT_TIMEOUT_MS, ...requestOptions } = options || {};

  try {
    const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  if (!(requestOptions.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetchWithRetry(url, {
      ...requestOptions,
      timeout,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = result.detail || result.error || response.statusText;
      const error = new Error(`API request failed (${response.status}): ${message}`) as ApiError;
      error.status = response.status;
      error.details = result;
      throw error;
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ API Error [${endpoint}]:`, error.message);
    }
    throw error;
  }
}

export async function fetchRawFromAPI(endpoint: string, options?: FetchOptions) {
  const url = `${API_BASE_URL}${endpoint}`;
  const { headers, timeout = DEFAULT_TIMEOUT_MS, ...requestOptions } = options || {};

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  if (!(requestOptions.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetchWithRetry(url, {
    ...requestOptions,
    timeout,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = result.detail || result.error || response.statusText;
    const error = new Error(`API request failed (${response.status}): ${message}`) as ApiError;
    error.status = response.status;
    error.details = result;
    throw error;
  }

  return result;
}

// مساعد لإرسال البيانات إلى API
export async function postToAPI<TResponse = unknown>(endpoint: string, data: unknown, timeout?: number) {
  return fetchFromAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    timeout,
  }) as Promise<TResponse>;
}

export { getApiBaseUrl };

// تحويل رابط الصورة من Django إلى رابط كامل
export function getImageUrl(imagePath: string) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  try {
    const mediaUrl = new URL(MEDIA_BASE_URL);
    const mediaPath = mediaUrl.pathname.replace(/\/$/, '');
    if (normalizedPath === mediaPath || normalizedPath.startsWith(`${mediaPath}/`)) {
      return `${mediaUrl.origin}${normalizedPath}`;
    }
  } catch {
    // Keep the simple relative join below for non-absolute media URLs.
  }

  return `${MEDIA_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
}

// أنواع البيانات
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  featured_image: string;
  author_data: unknown;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  category_id?: number;
  read_time: string;
  is_featured: boolean;
  published_at: string;
  updated_at: string;
  status: string;
}

// ================= Leadership =================
export interface LeadershipMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

// ================= Team Members =================
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  image: string;
  display_order: number;
  is_active: boolean;
}

// ================= Testimonials =================
export interface Testimonial {
  id: number;
  author_name: string;
  author_title?: string;
  quote: string;
  author_image?: string | null;
  display_order: number;
}

// ================= API Functions =================

export async function getLeadership() {
  return fetchFromAPI('/leadership/');
}

export async function getTeamMembers() {
  return fetchFromAPI('/team-members/');
}

export async function getTestimonials() {
  return fetchFromAPI('/testimonials/');
}
export interface Course {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  main_image: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  instructor: {
    id: number;
    name: string;
    title: string;
  };
  course_type: string;
  level: string;
  duration: string;
  language: string;
  start_date?: string;
  end_date?: string;
  curriculum: string;
  requirements: string;
  full_description: string;
  price: string;
  currency: string;
  certificate: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Webinar {
  id: number;
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  speakers: {
    id: number;
    name: string;
    title: string;
  };
  main_image: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  is_live: boolean;
  is_recorded: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  brand: string;
  short_description: string;
  full_description: string;
  main_image: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  status: string;
  features: string;
  created_at: string;
  updated_at: string;
}

export interface ContactInquiryData {
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  id_number?: string;
  job_position?: string;
  message?: string;
  form_type: 'contact' | 'course' | 'product' | 'webinar' | 'training';
  related_item_id?: number;
  related_item_title?: string;
  page_url?: string;
}
