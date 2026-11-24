// hooks/useEnrollments.ts - Hook للتسجيل في الدورات

import { useState } from 'react';

interface EnrollmentData {
  name: string;
  email: string;
  phone?: string;
  nationality: string;
  id_number: string;
  job_position: string;
  trainingId: string;
  training: string;
  message?: string;
  page_url?: string;
}

interface UseEnrollmentsReturn {
  submitEnrollment: (data: EnrollmentData) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

export function useEnrollments(): UseEnrollmentsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEnrollment = async (data: EnrollmentData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit enrollment');
      }

      const result = await response.json();

      return {
        success: true,
        message: result.message || 'Enrollment submitted successfully',
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return { submitEnrollment, loading, error };
}
