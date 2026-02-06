import type { Document } from '../backend';

const CACHE_KEY = 'documents_metadata_cache';

export function getCachedDocuments(): Document[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Failed to read documents cache:', e);
  }
  return [];
}

export function setCachedDocuments(documents: Document[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(documents));
  } catch (e) {
    console.error('Failed to write documents cache:', e);
  }
}

export function clearDocumentsCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
