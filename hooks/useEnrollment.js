'use client';

import { useCallback, useState } from 'react';

const ENROLLMENT_STORAGE_KEY = 'enrolledItems';

const parseEnrollmentIds = (value) => {
  try {
    const parsed = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === 'string');
  } catch {
    return [];
  }
};

export default function useEnrollment() {
  const [enrolledItems, setEnrolledItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    const stored = window.localStorage.getItem(ENROLLMENT_STORAGE_KEY);
    return parseEnrollmentIds(stored);
  });

  const enrollItem = useCallback((itemId) => {
    if (!itemId || typeof window === 'undefined') return;

    setEnrolledItems((prev) => {
      if (prev.includes(itemId)) return prev;
      const next = [...prev, itemId];
      window.localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isEnrolled = useCallback(
    (itemId) => enrolledItems.includes(itemId),
    [enrolledItems]
  );

  return {
    enrolledItems,
    isEnrolled,
    enrollItem,
  };
}
