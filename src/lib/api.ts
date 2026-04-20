/**
 * GAIO API Client Utility
 * This utility provides a wrapper around the native fetch API to interact with the GAIO Backend.
 * Security Note: The GAIO_BACKEND_API_KEY is a server-side environment variable.
 * Use this utility only in Server Components or API Routes.
 */

const API_URL = process.env.NEXT_PUBLIC_GAIO_API_URL || 'https://gaioevent.tech';
const API_KEY = process.env.GAIO_BACKEND_API_KEY || 'gaio_prod_3bf9a2e8c1d45f0b8d7c2a1e6f9b4d3c';

export async function gaioFetch(endpoint: string, options: RequestInit = {}) {
  if (!API_KEY) {
    console.warn('GAIO_BACKEND_API_KEY is not defined in environment variables.');
  }

  // Use the dedicated API file for clean JSON response
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const url = `${API_URL}/gaio-api.php?endpoint=${cleanEndpoint}&api_key=${API_KEY}`;
  
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Example usage in an API route:
 * 
 * import { gaioFetch } from '@/lib/api';
 * 
 * export async function GET() {
 *   const response = await gaioFetch('/sponsors');
 *   const data = await response.json();
 *   return Response.json(data);
 * }
 */
