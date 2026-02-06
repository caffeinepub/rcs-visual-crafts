import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ApkDownloadInfo } from '../backend';
import { ExternalBlob } from '../backend';
import { validateHttpUrl } from '../utils/validateHttpUrl';

export function useApkDownloadInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<ApkDownloadInfo | null>({
    queryKey: ['apkDownloadInfo'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getApkDownloadInfo();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useUpdateApkDownloadInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, version }: { url: string; version: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Validate URL format with clear English error
      const validation = validateHttpUrl(url);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid URL');
      }
      
      // Convert URL to ExternalBlob as required by backend
      const diskFile = ExternalBlob.fromURL(url);
      
      // Create complete ApkDownloadInfo object with all required fields
      const newInfo: ApkDownloadInfo = {
        version,
        diskFile,
        url, // Include the url field as required by backend
      };
      
      await actor.updateApkDownloadInfo(newInfo);
      
      // Optimistically update the cache immediately
      queryClient.setQueryData(['apkDownloadInfo'], newInfo);
    },
    onSuccess: () => {
      // Invalidate queries to trigger refetch and health check
      queryClient.invalidateQueries({ queryKey: ['apkDownloadInfo'] });
      queryClient.invalidateQueries({ queryKey: ['apkLinkHealth'] });
    },
    onError: (error: any) => {
      // Normalize error messages to clear English
      if (error.message?.includes('Unauthorized') || error.message?.includes('Only admins')) {
        throw new Error('You do not have permission to update APK information. Admin access required.');
      }
      // Re-throw with original message if it's already user-friendly
      throw error;
    },
  });
}
