'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Centralized navigation utilities for consistent redirection behavior
 */

/**
 * Redirect to a new page - replaces current history entry
 * Use this for redirects where you don't want back button to return to previous page
 * 
 * @param router Next.js router instance
 * @param path Path to redirect to
 * @param options Additional options
 */
export function redirectTo(
  router: AppRouterInstance,
  path: string,
  options?: {
    preserveQuery?: boolean;
    callbackUrl?: string;
  }
): void {
  let targetPath = path;
  
  // Add callbackUrl if provided
  if (options?.callbackUrl) {
    targetPath += `?callbackUrl=${encodeURIComponent(options.callbackUrl)}`;
  }
  
  router.replace(targetPath);
}

/**
 * Navigate to a new page - adds entry to history stack
 * Use this for normal navigation where back button should work
 * 
 * @param router Next.js router instance  
 * @param path Path to navigate to
 */
export function navigateTo(
  router: AppRouterInstance,
  path: string
): void {
  router.push(path);
}

/**
 * Get query parameters from URL
 * 
 * @returns Object with query parameters
 */
export function getQueryParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Get the callback URL from query parameters or return a default path
 * 
 * @param defaultPath Default path to return if no callback URL is found
 * @returns The callback URL or default path
 */
export function getCallbackUrl(defaultPath = '/'): string {
  const params = getQueryParams();
  return params.callbackUrl ? decodeURIComponent(params.callbackUrl) : defaultPath;
}
