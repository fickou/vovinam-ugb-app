import { useQuery } from '@tanstack/react-query';
import { cmsApi } from '@/lib/cms';

export function usePublicSettings<K extends 'hero' | 'about' | 'philosophy'>(sectionKey: K) {
  return useQuery({
    queryKey: ['public_settings', sectionKey],
    queryFn: () => cmsApi.getSettings(sectionKey),
    staleTime: 5 * 60_000, // 5 minutes cache (CMS content changes infrequently)
    gcTime: 10 * 60_000,
  });
}

export function usePublicGallery() {
  return useQuery({
    queryKey: ['public_gallery'],
    queryFn: () => cmsApi.getGallery(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
