'use client';

import { useEffect, useRef, useState } from 'react';

interface UseStaggeredAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  staggerDelay?: number;
  triggerOnce?: boolean;
}

export function useStaggeredAnimation<T extends HTMLElement = HTMLElement>(
  itemCount: number,
  options: UseStaggeredAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    staggerDelay = 100,
    triggerOnce = true
  } = options;

  const containerRef = useRef<T>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the animation of items
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => {
                const newState = [...prev];
                newState[i] = true;
                return newState;
              });
            }, i * staggerDelay);
          }
          
          if (triggerOnce) {
            observer.unobserve(container);
          }
        } else if (!triggerOnce) {
          setVisibleItems(new Array(itemCount).fill(false));
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      observer.unobserve(container);
    };
  }, [itemCount, threshold, rootMargin, staggerDelay, triggerOnce]);

  const getItemClassName = (index: number, baseAnimation: string = 'fadeUp') => {
    const isVisible = visibleItems[index];
    
    const animations = {
      fadeUp: isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-8',
      fadeIn: isVisible 
        ? 'opacity-100' 
        : 'opacity-0',
      slideInLeft: isVisible 
        ? 'opacity-100 translate-x-0' 
        : 'opacity-0 -translate-x-8',
      slideInRight: isVisible 
        ? 'opacity-100 translate-x-0' 
        : 'opacity-0 translate-x-8',
      scaleIn: isVisible 
        ? 'opacity-100 scale-100' 
        : 'opacity-0 scale-95'
    };

    return `transition-all duration-700 ease-out ${animations[baseAnimation as keyof typeof animations] || animations.fadeUp}`;
  };

  return {
    containerRef,
    getItemClassName,
    visibleItems
  };
}
