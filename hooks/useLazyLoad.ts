// 🚀 懒加载 Hook - 用于组件和图片的懒加载

'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 元素可见性检测 Hook
 * 当元素进入视口时触发回调
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
}: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
} = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * 图片懒加载 Hook
 */
export function useImageLazyLoad(src: string | undefined) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { ref, isVisible } = useIntersectionObserver<HTMLImageElement>({
    threshold: 0.01,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isVisible && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      img.onerror = () => {
        setError(true);
        setIsLoading(false);
      };
      img.src = src;
    }
  }, [isVisible, src]);

  return { ref, imageSrc, isLoading, error };
}

/**
 * 组件懒加载 Hook
 */
export function useComponentLazyLoad() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '200px',
  });

  useEffect(() => {
    if (isVisible) {
      setShouldLoad(true);
    }
  }, [isVisible]);

  return { ref, shouldLoad };
}

