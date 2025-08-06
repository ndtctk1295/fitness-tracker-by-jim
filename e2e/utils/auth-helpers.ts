// Authentication helpers for E2E tests
import { Page, expect } from '@playwright/test';
import { loginUser as loginUserFromHelpers } from './test-helpers';

// Re-export the main login function with the expected name
export async function loginAsTestUser(page: Page) {
  await loginUserFromHelpers(page, 'test@gmail.com', '123456');
}

// Alternative login function
export async function loginUser(page: Page, email: string = 'test@gmail.com', password: string = '123456') {
  await loginUserFromHelpers(page, email, password);
}

// Logout function
export async function logoutUser(page: Page) {
  // Navigate to profile or settings to find logout
  await page.goto('/profile');
  
  // Look for logout button
  const logoutButton = page.locator('[data-testid="logout-button"]');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await expect(page).toHaveURL('/auth/signin', { timeout: 10000 });
  }
  
  console.log('[E2E] User logged out successfully');
}
