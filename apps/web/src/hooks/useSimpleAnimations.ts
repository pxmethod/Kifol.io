'use client';

import { useEffect, useState, useRef } from 'react';

// Simple load animation - triggers immediately on mount
export function useLoadAnimation(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isVisible;
}

// Simple scroll animation with much more reliable detection
export function useScrollAnimation(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Simple scroll handler
    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Element is visible if its top is within the viewport + some margin
      const isInView = rect.top < windowHeight * (1 + threshold);
      
      if (isInView && !isVisible) {
        setIsVisible(true);
      }
    };

    // Check immediately
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, isVisible]);

  return { ref: elementRef, isVisible };
}

// Animation variants
export function useFadeUpOnLoad(delay: number = 0) {
  const isVisible = useLoadAnimation(delay);
  
  const className = isVisible 
    ? 'animate-fade-up-visible' 
    : 'animate-fade-up-hidden';
  
  return { className };
}

export function useFadeUpOnScroll(threshold: number = 0.3) {
  const { ref, isVisible } = useScrollAnimation(threshold);
  
  const className = isVisible 
    ? 'animate-fade-up-visible' 
    : 'animate-fade-up-hidden';
  
  return { ref, className };
}

export function useScaleInOnScroll(threshold: number = 0.3) {
  const { ref, isVisible } = useScrollAnimation(threshold);
  
  const className = isVisible 
    ? 'animate-scale-visible' 
    : 'animate-scale-hidden';
  
  return { ref, className };
}

// Staggered load animations
export function useStaggeredLoadAnimation(itemCount: number, baseDelay: number = 0, staggerDelay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );

  useEffect(() => {
    for (let i = 0; i < itemCount; i++) {
      setTimeout(() => {
        setVisibleItems(prev => {
          const newState = [...prev];
          newState[i] = true;
          return newState;
        });
      }, baseDelay + (i * staggerDelay));
    }
  }, [itemCount, baseDelay, staggerDelay]);

  const getItemClassName = (index: number) => {
    const isVisible = visibleItems[index];
    return isVisible 
      ? 'animate-fade-up-visible' 
      : 'animate-fade-up-hidden';
  };

  return { getItemClassName, visibleItems };
}
