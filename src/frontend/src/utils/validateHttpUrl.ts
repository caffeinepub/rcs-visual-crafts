/**
 * Validates that a string is a valid HTTP or HTTPS URL
 * @param url - The URL string to validate
 * @returns An object with isValid boolean and optional error message
 */
export function validateHttpUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  try {
    const urlObj = new URL(trimmedUrl);
    
    // Must be http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { 
        isValid: false, 
        error: 'URL must use HTTP or HTTPS protocol' 
      };
    }

    // Basic sanity check - should have a hostname
    if (!urlObj.hostname) {
      return { 
        isValid: false, 
        error: 'URL must include a valid hostname' 
      };
    }

    return { isValid: true };
  } catch {
    return { 
      isValid: false, 
      error: 'Please enter a valid URL (e.g., https://example.com/file.apk)' 
    };
  }
}
