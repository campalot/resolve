import { useLayoutEffect } from 'react';

export function useScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    // Cleanup restores scroll when component unmounts or state changes
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [locked]);
};
