import { getSessionCookie, refreshSession } from './auth-client';

// Keep track of refreshing state
let isRefreshingSession = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Utility function to make authenticated API requests
 * Uses Better Auth's credential mechanism to ensure session is included
 */
export async function apiClient<T = any>(
  url: string, 
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  // Set up headers 
  const headers = new Headers(options.headers);
  
  // Add content type if not present
  if (!headers.has('Content-Type') && !url.includes('/upload')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Force credentials to be included
  const credentials: RequestCredentials = 'include';
  
  // Add session cookie if available (helps with certain edge cases)
  const sessionCookie = getSessionCookie();
  if (sessionCookie) {
    headers.set('Cookie', sessionCookie);
  }
  
  // Add auth-specific headers
  headers.set('X-Auth-Include-Session', 'true');
  
  // Make the API request with proper credentials
  const response = await fetch(url, {
    ...options,
    headers,
    credentials, // Important: always include credentials
  });
  
  // Handle non-200 responses
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.details || errorMessage;
      
      // If unauthorized and we have a session cookie, could be a stale session
      if (response.status === 401 && sessionCookie && retryCount < 1) {
        console.warn('Authentication error with existing session, attempting refresh');
        
        // Only allow one refresh at a time
        if (!isRefreshingSession) {
          isRefreshingSession = true;
          refreshPromise = refreshSession();
        }
        
        // Wait for the refresh to complete
        const refreshResult = refreshPromise ? await refreshPromise : false;
        isRefreshingSession = false;
        refreshPromise = null;
        
        if (refreshResult) {
          console.log('Session refreshed, retrying request');
          // Retry the request after session refresh
          return apiClient(url, options, retryCount + 1);
        }
      }
    } catch (e) {
      // If unable to parse JSON, use the status text
      errorMessage = `${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  // For empty responses
  if (response.status === 204) {
    return {} as T;
  }
  
  // Parse and return JSON response
  return response.json();
} 