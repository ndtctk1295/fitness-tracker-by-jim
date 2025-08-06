import { Page, expect } from '@playwright/test';
import { usersMockData } from '../fixtures/users';

const validUser = usersMockData.valid;

/**
 * Common authentication helpers for E2E tests
 */

/**
 * Login as the test user
 * Standardized login function used across all test files
 */
export async function loginAsTestUser(page: Page, timeout: number = 30000): Promise<void> {
  await page.goto('/auth/signin');
  await page.fill('[data-testid="email-input"]', validUser.email);
  await page.fill('[data-testid="password-input"]', validUser.password);
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL(/dashboard/, { timeout });
  console.log('[E2E] User logged in successfully');
}

/**
 * Navigate to a specific page with error handling
 */
export async function navigateToPage(page: Page, url: string, timeout: number = 15000): Promise<void> {
  try {
    await page.goto(url, { timeout });
    await page.waitForLoadState('domcontentloaded');
    console.log(`[E2E] Navigated to ${url}`);
  } catch (error) {
    console.log(`[E2E] Navigation to ${url} failed, retrying...`);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  }
}

/**
 * Common timer page helpers
 */

/**
 * Navigate to timer page and wait for setup
 */
export async function navigateToTimer(page: Page): Promise<void> {
  await navigateToPage(page, '/timer');
  await waitForTimerSetup(page);
}

/**
 * Wait for timer setup component to be ready
 */
export async function waitForTimerSetup(page: Page, timeout: number = 10000): Promise<void> {
  await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible({ timeout });
  console.log('[E2E] Timer setup ready');
}

/**
 * Wait for timer strategy selector to be ready
 */
export async function waitForTimerStrategySelector(page: Page, timeout: number = 10000): Promise<void> {
  await expect(page.locator('[data-testid="timer-strategy-selector"]')).toBeVisible({ timeout });
  console.log('[E2E] Timer strategy selector ready');
}

/**
 * Common calendar page helpers
 */

/**
 * Navigate to calendar page and wait for content
 */
export async function navigateToCalendar(page: Page): Promise<void> {
  await navigateToPage(page, '/calendar');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible({ timeout: 10000 });
  console.log('[E2E] Calendar loaded');
}

/**
 * Common page elements and interactions
 */

/**
 * Wait for page to be fully loaded with all resources
 */
export async function waitForPageLoad(page: Page, timeout: number = 15000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
  console.log('[E2E] Page fully loaded');
}

/**
 * Handle mobile vs desktop viewport detection
 */
export async function isMobileViewport(page: Page): Promise<boolean> {
  const viewport = await page.viewportSize();
  return viewport ? viewport.width < 640 : false;
}

/**
 * Common error handling
 */

/**
 * Retry an operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`[E2E] Operation failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Common assertions
 */

/**
 * Expect text content to be visible
 */
export async function expectTextContent(page: Page, selector: string, text: string): Promise<void> {
  await expect(page.locator(selector)).toContainText(text);
}

/**
 * Expect element to be visible with retry
 */
export async function expectElementVisible(page: Page, selector: string, timeout: number = 10000): Promise<void> {
  await expect(page.locator(selector)).toBeVisible({ timeout });
}
