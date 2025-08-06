import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../utils/common-helpers';
import { getMonthYearString } from '../../utils/date-helpers';

test.describe('Calendar Page - Basic Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await loginAsTestUser(page);
  });

  test('CAL-001: Calendar page loads successfully', async ({ page }) => {
    // Navigate to calendar page
    await page.goto('/calendar');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify calendar grid displays
    await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
    
    // Verify navigation controls are visible
    await expect(page.locator('[data-testid="calendar-header"]')).toBeVisible();
    
    // Verify no error messages shown
    // await expect(page.locator('[role="alert"]')).not.toBeVisible();
    
    // Verify title is displayed
    await expect(page.locator('h1')).toContainText('Calendar');
  });

  test('CAL-002: Calendar header components are present', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Verify calendar title
    await expect(page.locator('h1')).toContainText('Calendar');
    
    // Verify current month/year is shown
    const currentMonth = getMonthYearString();
    await expect(page.locator('[data-testid="calendar-month-year"]')).toContainText(currentMonth);
    
    // Verify navigation buttons
    await expect(page.locator('[data-testid="calendar-prev-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-next-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-today-btn"]')).toBeVisible();
    
    // Verify view toggle button
    await expect(page.locator('[data-testid="calendar-view-toggle"]')).toBeVisible();
  });

  test('CAL-003: Navigate to previous month', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Get current month display
    const currentMonthText = await page.locator('[data-testid="calendar-month-year"]').textContent();
    
    // Click previous button
    await page.locator('[data-testid="calendar-prev-btn"]').click();
    
    // Wait for calendar to update
    await page.waitForTimeout(500);
    
    // Verify month changed
    const newMonthText = await page.locator('[data-testid="calendar-month-year"]').textContent();
    expect(newMonthText).not.toBe(currentMonthText);
    
    // Verify calendar grid updated
    await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
  });

  test('CAL-004: Navigate to next month', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Get current month display
    const currentMonthText = await page.locator('[data-testid="calendar-month-year"]').textContent();
    
    // Click next button
    await page.locator('[data-testid="calendar-next-btn"]').click();
    
    // Wait for calendar to update
    await page.waitForTimeout(500);
    
    // Verify month changed
    const newMonthText = await page.locator('[data-testid="calendar-month-year"]').textContent();
    expect(newMonthText).not.toBe(currentMonthText);
    
    // Verify calendar grid updated
    await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
  });

  test('CAL-005: Navigate back to current date with Today button', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Navigate to different month first
    await page.locator('[data-testid="calendar-prev-btn"]').click();
    await page.waitForTimeout(500);
    
    // Click Today button
    await page.locator('[data-testid="calendar-today-btn"]').click();
    await page.waitForTimeout(500);
    
    // Verify returned to current month
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    await expect(page.locator('[data-testid="calendar-month-year"]')).toContainText(currentMonth);
  });

  test('CAL-006: Switch from month view to week view', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Ensure we're in month view initially
    await expect(page.locator('[data-testid="calendar-view-toggle"]')).toContainText('Week View');
    
    // Click view toggle
    await page.locator('[data-testid="calendar-view-toggle"]').click();
    await page.waitForTimeout(500);
    
    // Verify switched to week view
    await expect(page.locator('[data-testid="calendar-view-toggle"]')).toContainText('Month View');
    
    // Verify week layout (7 days in horizontal layout)
    const weekDays = await page.locator('[data-testid="calendar-week-day"]').count();
    expect(weekDays).toBe(7);
  });

  test('CAL-007: Switch from week view to month view', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Switch to week view first
    await page.locator('[data-testid="calendar-view-toggle"]').click();
    await page.waitForTimeout(500);
    
    // Verify we're in week view
    await expect(page.locator('[data-testid="calendar-view-toggle"]')).toContainText('Month View');
    
    // Switch back to month view
    await page.locator('[data-testid="calendar-view-toggle"]').click();
    await page.waitForTimeout(500);
    
    // Verify returned to month view
    await expect(page.locator('[data-testid="calendar-view-toggle"]')).toContainText('Week View');
    
    // Verify month grid layout
    await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
  });
});
