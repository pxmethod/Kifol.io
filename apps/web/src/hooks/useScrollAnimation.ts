'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLElement>(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0, // Trigger as soon as any part is visible
    rootMargin = '50px 0px 50px 0px', // Trigger 50px before entering viewport
    triggerOnce = true
  } = options;

  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isClient) return;

    // Check if element is already in view on mount (with margin)
    const checkInitialVisibility = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Apply a similar margin as rootMargin for consistency
      const margin = 100; // pixels
      const isInView = rect.top < (windowHeight + margin) && rect.bottom > -margin;
      
      console.log('Initial visibility check:', {
        elementTop: rect.top,
        windowHeight,
        margin,
        isInView,
        element: element.tagName
      });

      if (isInView) {
        setIsVisible(true);
        return true;
      }
      return false;
    };

    // Check initial visibility
    const initiallyVisible = checkInitialVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('Animation trigger:', {
          isIntersecting: entry.isIntersecting,
          element: element.tagName,
          className: element.className,
          boundingRect: entry.boundingClientRect.top,
          intersectionRatio: entry.intersectionRatio,
          rootBounds: entry.rootBounds,
          threshold: threshold,
          rootMargin: rootMargin
        });
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Only observe if not already visible
    if (!initiallyVisible) {
      observer.observe(element);
    }

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, isClient]);

  return { elementRef, isVisible };
}

// Specific animation variants
export function useFadeUp(options?: UseScrollAnimationOptions) {
  const { elementRef, isVisible } = useScrollAnimation(options);
  
  console.log('useFadeUp isVisible:', isVisible);
  
  // Always start with hidden state for consistent behavior
  const animationClasses = isVisible 
    ? 'opacity-100 translate-y-0' 
    : 'opacity-0 translate-y-8';
  
  return {
    ref: elementRef,
    className: `transition-all duration-1000 ease-out ${animationClasses}`
  };
}

export function useFadeIn(options?: UseScrollAnimationOptions) {
  const { elementRef, isVisible } = useScrollAnimation(options);
  
  return {
    ref: elementRef,
    className: `transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100' 
        : 'opacity-0'
    }`
  };
}

export function useSlideInLeft(options?: UseScrollAnimationOptions) {
  const { elementRef, isVisible } = useScrollAnimation(options);
  
  return {
    ref: elementRef,
    className: `transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100 translate-x-0' 
        : 'opacity-0 -translate-x-8'
    }`
  };
}

export function useSlideInRight(options?: UseScrollAnimationOptions) {
  const { elementRef, isVisible } = useScrollAnimation(options);
  
  return {
    ref: elementRef,
    className: `transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100 translate-x-0' 
        : 'opacity-0 translate-x-8'
    }`
  };
}

export function useScaleIn(options?: UseScrollAnimationOptions) {
  const { elementRef, isVisible } = useScrollAnimation(options);
  
  const animationClasses = isVisible 
    ? 'opacity-100 scale-100' 
    : 'opacity-0 scale-95';
  
  return {
    ref: elementRef,
    className: `transition-all duration-1000 ease-out ${animationClasses}`
  };
}
