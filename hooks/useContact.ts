// hooks/useContact.ts - Hook لإرسال الاستفسارات

import { useState } from 'react';
import { ContactInquiryData } from '@/lib/api';

interface UseContactReturn {
  submitInquiry: (data: ContactInquiryData | FormData, timeout?: number) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

export function useContact(): UseContactReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitInquiry = async (data: ContactInquiryData | FormData, timeout = 30000) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIX #3: Handle both JSON and FormData intelligently
      const isFormData = data instanceof FormData;
      
      const fetchOptions: RequestInit = {
        method: 'POST',
      };

      if (isFormData) {
        // For FormData: Don't set Content-Type, let browser set it
        // Include multipart boundary
        fetchOptions.body = data;
        // fetchOptions.headers are NOT set, so browser auto-detects multipart/form-data
      } else {
        // For JSON: Set explicit Content-Type
        fetchOptions.body = JSON.stringify(data);
        fetchOptions.headers = {
          'Content-Type': 'application/json',
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('/api/contact', {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        message: result.message || 'Inquiry sent successfully',
      };

    } catch (err) {
      let errorMessage = 'An error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = `Request timeout after ${timeout}ms`;
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return { submitInquiry, loading, error };
}