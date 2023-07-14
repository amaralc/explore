import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IRouter, NavigateOptions } from './types';

/**
 * This is a wrapper over `react-router/useNavigate` hook.
 * We use this to help us maintain consistency between CRA and Next.js
 */
export const useRouter = (): IRouter => {
  const navigate = useNavigate();

  return useMemo(() => {
    return {
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => navigate(0),
      push: (href: string, options?: NavigateOptions) => navigate(href),
      replace: (href: string, options?: NavigateOptions) => navigate(href, { replace: true }),
      prefetch: (href: string) => {
        console.log('prefetching', href);
      },
    };
  }, [navigate]);
};
