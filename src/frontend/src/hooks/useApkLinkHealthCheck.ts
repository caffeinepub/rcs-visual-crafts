import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export type LinkHealthStatus = 'ok' | 'broken' | 'unknown' | 'checking';

export interface LinkHealthResult {
  status: LinkHealthStatus;
  message: string;
}

export function useApkLinkHealthCheck(url: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LinkHealthResult>({
    queryKey: ['apkLinkHealth', url],
    queryFn: async (): Promise<LinkHealthResult> => {
      if (!url) {
        return { status: 'unknown', message: 'No URL configured' };
      }

      try {
        // Attempt HEAD request with CORS to get actual status
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const corsResponse = await fetch(url, { 
          method: 'HEAD',
          mode: 'cors',
          cache: 'no-store', // Prevent caching to get fresh status
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // If we get here, CORS is enabled and we can read the status
        if (corsResponse.ok) {
          return { status: 'ok', message: 'Link is reachable and working' };
        } else if (corsResponse.status === 404) {
          return { status: 'broken', message: 'Link not found (404)' };
        } else if (corsResponse.status === 403) {
          return { status: 'broken', message: 'Access forbidden (403)' };
        } else if (corsResponse.status >= 400 && corsResponse.status < 500) {
          return { status: 'broken', message: `Link error (${corsResponse.status})` };
        } else if (corsResponse.status >= 500) {
          return { status: 'broken', message: 'Server error' };
        } else {
          return { status: 'unknown', message: `Unexpected status (${corsResponse.status})` };
        }
      } catch (corsError: any) {
        // If aborted due to timeout
        if (corsError.name === 'AbortError') {
          return { 
            status: 'unknown', 
            message: 'Link check timed out - could not verify' 
          };
        }

        // CORS failed, try no-cors mode as fallback
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          await fetch(url, { 
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // With no-cors, we can't read the status
          // If fetch doesn't throw, assume the URL is reachable but CORS-restricted
          return { 
            status: 'unknown', 
            message: 'Could not verify link status (CORS restriction)' 
          };
        } catch (noCorsError: any) {
          // If aborted due to timeout
          if (noCorsError.name === 'AbortError') {
            return { 
              status: 'unknown', 
              message: 'Link check timed out - could not verify' 
            };
          }

          // Network error or actual broken link
          if (noCorsError instanceof TypeError) {
            return { 
              status: 'unknown', 
              message: 'Could not verify link (network issue or CORS restriction)' 
            };
          }
          
          return { 
            status: 'broken', 
            message: 'Link appears broken or unreachable' 
          };
        }
      }
    },
    enabled: !!actor && !actorFetching && !!url,
    retry: 1,
    retryDelay: 2000,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
