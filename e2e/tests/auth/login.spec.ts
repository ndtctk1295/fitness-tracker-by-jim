import { test, expect } from '@playwright/test';
import { usersMockData } from '../../fixtures/users';
const validUser = usersMockData.valid;
const invalidUser = usersMockData.invalid;
import mongoose from 'mongoose';

test.describe('Authentication', () => {
  test.beforeAll(async () => {
    // Log the current MongoDB connection string (if connected)
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker-e2e');
      }
      console.log('[E2E] Using MongoDB database:', mongoose.connection.name, 'at', mongoose.connection.host + ':' + mongoose.connection.port);
    } catch (err) {
      console.warn('[E2E] Could not determine MongoDB connection:', err);
    }
  });
  //ok
  test('user can navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="login-link"]');

    await expect(page).toHaveURL('/auth/signin', { timeout: 20000 });
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
  });

  //ok
  test('user can see validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.click('[data-testid="login-button"]');
    // Adjust these selectors/messages to match your actual validation rendering
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
  });

  //ok
  test('user can see error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', invalidUser.email);
    await page.fill('[data-testid="password-input"]', invalidUser.password);
    await page.click('[data-testid="login-button"]');
    // The error message is rendered via toast, so check for the toast content
    await expect(page.locator('text=Signin Failed').first()).toBeVisible();
    await expect(page.locator('text=Invalid Email or Password').first()).toBeVisible();
  });

  //ok
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', validUser.email);
    await page.fill('[data-testid="password-input"]', validUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for the authentication flow to complete (increased timeout)
    await expect(page).toHaveURL(/dashboard/, { timeout: 20000 });
    await expect(page.locator('text=Welcome')).toBeVisible(); // Adjust selector/text as needed
  });

  //ok
  test('session persists after page reload', async ({ page }) => {
    await page.goto('/auth/signin',{ timeout: 5000 });
    await page.fill('[data-testid="email-input"]', validUser.email);
    await page.fill('[data-testid="password-input"]', validUser.password);
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
    await page.reload();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible(); // Adjust as needed
  });
  //ok
  test('unauthenticated user is redirected from protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/auth\/signin/);
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
  });

  //ok
  test('authenticated user is redirected from signin to dashboard', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', validUser.email);
    await page.fill('[data-testid="password-input"]', validUser.password);
    console.log('Testing login with:', validUser.email, validUser.password);
    await page.click('[data-testid="login-button"]');
    console.log('Current URL:', await page.url());
    
    // Wait for either success (redirect to dashboard) or error message
    try {
      await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
      // Try to go back to signin
      await page.goto('/auth/signin');
      await expect(page).toHaveURL(/dashboard/);
    } catch (error) {
      // If URL doesn't match dashboard, check for error messages
      const currentUrl = await page.url();
      console.log('Login failed, current URL:', currentUrl);
      
      // Check for any visible error messages
      const errorMessages = await page.locator('[role="alert"], .toast, [data-testid*="error"]').allTextContents();
      console.log('Error messages:', errorMessages);
      
      throw error;
    }
  });

  //ok
  test('user cannot register with existing email', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('[data-testid="email-input"]', 'testuser@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('text=Email already exists')).toBeVisible();
  });

  //ok
  test('account lockout or warning after multiple failed logins', async ({ page }) => {
    await page.goto('/auth/signin');
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="email-input"]', 'testuser@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      await page.waitForTimeout(500); // Wait for the request to complete
    }
    // After 5 attempts, should see lockout message (use first() to avoid strict mode violation)
    await expect(page.locator('text=Too many failed attempts').first()).toBeVisible({ timeout: 10000 });
  });

  //ok
  test('shows error on network failure during login', async ({ page, context }) => {
    await page.route('**/api/auth/callback/credentials*', route => route.abort());
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', invalidUser.email);
    await page.fill('[data-testid="password-input"]', invalidUser.password);
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('text=An unknown error occurred. Please try again later.').first()).toBeVisible();
  });

  //ok
  // Password visibility toggle (if implemented)
  test('user can toggle password visibility', async ({ page }) => {
 await page.goto('/auth/signin');
await page.fill('[data-testid="password-input"]', 'somepassword');
await page.click('[data-testid="toggle-password-visibility"]');
await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'text');
await page.click('[data-testid="toggle-password-visibility"]');
await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'password');
  });

});
