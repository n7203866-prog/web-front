// hooks/usePosts.ts - Hook لجلب المقالات من Django API

import { useState, useEffect } from 'react';
import { Post } from '@/lib/api';
import { fetchFromAPI } from '@/lib/api';

interface UsePostsOptions {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
}

export function usePosts(options: UsePostsOptions = {}): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options.page) params.append('page', options.page.toString());
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.category) params.append('category', options.category);
        if (options.featured) params.append('is_featured', 'true');

        const data = await fetchFromAPI(`/posts/?${params.toString()}`);

        // افترض أن API يرجع { results: Post[], count: number, next: string | null }
        setPosts(data.results || data);
        setTotal(data.count || data.length);
        setHasMore(!!data.next);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [options.page, options.limit, options.category, options.featured]);

  return { posts, loading, error, total, hasMore };
}