// hooks/useCourses.ts - Hook لجلب الدورات من Django API

import { useState, useEffect } from 'react';
import { Course } from '@/lib/api';

interface UseCoursesOptions {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  type?: string;
  search?: string;
}

interface UseCoursesReturn {
  courses: Course[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
}

export function useCourses(options: UseCoursesOptions = {}): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.category) params.append('category', options.category);
        if (options.level) params.append('level', options.level);
        if (options.type) params.append('type', options.type);
        if (options.search) params.append('search', options.search);

        const response = await fetch(`/api/courses?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();

        setCourses(data.results || data);
        setTotal(data.count || data.length);
        setHasMore(!!data.next);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [options.page, options.limit, options.category, options.level, options.type, options.search]);

  return { courses, loading, error, total, hasMore };
}