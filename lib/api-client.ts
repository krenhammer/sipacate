import { getSessionCookie } from './auth-client';

/**
 * Utility function to make authenticated API requests
 * Uses Better Auth's credential mechanism to ensure session is included
 */
export async function apiClient<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  // Set up headers 
  const headers = new Headers(options.headers);
  
  // Add session cookie if available (helps with certain edge cases)
  const sessionCookie = getSessionCookie();
  if (sessionCookie) {
    headers.set('Cookie', sessionCookie);
  }
  
  // Make the API request with proper credentials
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important: always include credentials
  });
  
  // Handle non-200 responses
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.details || errorMessage;
    } catch (e) {
      // If unable to parse JSON, use the status text
      errorMessage = `${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  // Parse and return JSON response
  return response.json();
} 