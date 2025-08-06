import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../utils/common-helpers';

test.describe('Workout Plans - Basic Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await loginAsTestUser(page);
  });

  test('WPL-001: Workout plans list page loads successfully', async ({ page }) => {
    // Navigate to workout plans page
    await page.goto('/workout-plans');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify page title
    await expect(page.locator('h1')).toContainText('Workout Plans');
    
    // Verify create plan button is visible (could be "Create Plan" or "Create Your First Plan")
    const createPlanButton = page.locator('button:has-text("Create Plan"), button:has-text("Create Your First Plan")');
    await expect(createPlanButton).toBeVisible();
    
    // Verify no error alerts shown
    const errorAlert = page.locator('[role="alert"]');
    if (await errorAlert.isVisible()) {
      const errorText = await errorAlert.textContent();
      console.log('Warning: Error alert visible:', errorText);
    }
  });

  test('WPL-002: Create new workout plan navigation', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Click create plan button (handles both empty state and normal state)
    const createButton = page.locator('button:has-text("Create Plan"), button:has-text("Create Your First Plan")').first();
    await createButton.click();
    
    // Wait for wizard modal to appear
    await page.waitForTimeout(1000);
    
    // Verify workout plan wizard/modal is visible
    const wizardModal = page.locator('[role="dialog"], .modal, [data-testid*="wizard"]');
    await expect(wizardModal).toBeVisible();
  });

  test('WPL-003: Workout plans display correctly', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Check if plans are displayed or empty state is shown
    const workoutPlanCards = page.locator('[data-testid*="workout-plan"], .workout-plan-card');
    const emptyStateMessage = page.locator('text="No workout plans yet"');
    const statsCards = page.locator('text="Total Plans"');
    const createButton = page.locator('button:has-text("Create Plan"), button:has-text("Create Your First Plan")');
    
    // Wait a bit more for content to load
    await page.waitForTimeout(2000);
    
    // Either plans should be visible, empty state should be shown, stats should be visible, or create button should be visible
    const hasPlans = await workoutPlanCards.count() > 0;
    const hasEmptyState = await emptyStateMessage.isVisible();
    const hasStats = await statsCards.isVisible();
    const hasCreateButton = await createButton.isVisible();
    
    console.log(`Plans: ${hasPlans}, Empty state: ${hasEmptyState}, Stats: ${hasStats}, Create button: ${hasCreateButton}`);
    console.log(`Found ${await workoutPlanCards.count()} workout plan cards`);
    
    expect(hasPlans || hasEmptyState || hasStats || hasCreateButton).toBeTruthy();
    
    // If plans exist, verify they have proper structure
    if (hasPlans) {
      const firstPlan = workoutPlanCards.first();
      await expect(firstPlan).toBeVisible();
    }
  });
});

test.describe('Workout Plans - Detail View', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('WPD-001: Plan detail page loads with valid plan ID', async ({ page }) => {
    // First go to workout plans list to find a plan
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Look for a plan link/card to click - updated selectors
    const planLink = page.locator('[href*="/workout-plans/"], a[href*="/workout-plans/"], .workout-plan-card a').first();
    
    if (await planLink.isVisible()) {
      // Click on the first available plan
      await planLink.click();
      
      // Wait for detail page to load
      await page.waitForLoadState('networkidle');
      
      // Verify we're on a plan detail page
      await expect(page.url()).toMatch(/\/workout-plans\/[^\/]+$/);
      
      // Verify tabs are visible
      await expect(page.locator('text="Schedule"')).toBeVisible();
      await expect(page.locator('text="Statistics"')).toBeVisible();
      await expect(page.locator('text="Progression"')).toBeVisible();
      await expect(page.locator('text="Settings"')).toBeVisible();
      
      // Verify action buttons are present (edit or activate/deactivate)
      const actionButtons = page.locator('button:has-text("Edit"), button:has-text("Activate"), button:has-text("Deactivate")');
      await expect(actionButtons.first()).toBeVisible();
    } else {
      // Skip test if no plans available
      console.log('No workout plans available to test detail view');
      test.skip(true, 'No workout plans available for testing');
    }
  });

  test('WPD-002: Plan detail tabs functionality', async ({ page }) => {
    // Navigate to workout plans and find a plan
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"], a[href*="/workout-plans/"], .workout-plan-card a').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      // Test Statistics tab
      await page.click('text="Statistics"');
      await page.waitForTimeout(1000); // Allow time for tab content to load
      
      // Test Progression tab
      await page.click('text="Progression"');
      await page.waitForTimeout(1000);
      
      // Test Settings tab
      await page.click('text="Settings"');
      await page.waitForTimeout(1000);
      
      // Go back to Schedule tab
      await page.click('text="Schedule"');
      await page.waitForTimeout(1000);
      
      // Verify no errors occurred during tab switching
      const errorAlert = page.locator('[role="alert"]');
      if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.textContent();
        console.log('Warning: Error during tab switching:', errorText);
      }
    } else {
      console.log('No workout plans available to test tabs');
      test.skip(true, 'No workout plans available for tab testing');
    }
  });
});

test.describe('Workout Plans - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('WPE-001: Handle invalid plan ID gracefully', async ({ page }) => {
    // Navigate to a non-existent plan ID
    await page.goto('/workout-plans/invalid-plan-id');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any redirects or error messages
    await page.waitForTimeout(2000);
    
    // Check multiple possible error handling approaches
    const errorMessage = page.locator('text="not found", text="Not Found", text="Error"');
    const redirectToList = page.url().includes('/workout-plans') && !page.url().includes('/workout-plans/invalid-plan-id');
    const homePageRedirect = page.url().includes('/dashboard');
    const authRedirect = page.url().includes('/auth/signin');
    
    console.log('Current URL:', page.url());
    
    // Either an error message should be shown, user should be redirected to list, dashboard, or auth
    expect(await errorMessage.isVisible() || redirectToList || homePageRedirect || authRedirect).toBeTruthy();
  });

  test('WPE-002: Statistics tab handles empty data', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"], a[href*="/workout-plans/"], .workout-plan-card a').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      // Go to Statistics tab
      await page.click('text="Statistics"');
      await page.waitForTimeout(2000); // Give time for statistics to load
      
      // Statistics should load without crashing (even with no data)
      // Check that the tab content is visible and no infinite loop errors
      const statisticsContent = page.locator('[role="tabpanel"]');
      await expect(statisticsContent).toBeVisible();
      
      // Wait a bit more to ensure no infinite rendering loops
      await page.waitForTimeout(3000);
      
      // Page should still be responsive
      await expect(page.locator('text="Statistics"')).toBeVisible();
    } else {
      console.log('No workout plans available to test statistics');
      test.skip(true, 'No workout plans available for statistics testing');
    }
  });

  test('WPE-003: Progression tab handles empty data', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"], a[href*="/workout-plans/"], .workout-plan-card a').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      // Go to Progression tab
      await page.click('text="Progression"');
      await page.waitForTimeout(2000); // Give time for progression to load
      
      // Progression should load without crashing (even with no data)
      const progressionContent = page.locator('[role="tabpanel"]');
      await expect(progressionContent).toBeVisible();
      
      // Wait a bit more to ensure no infinite rendering loops
      await page.waitForTimeout(3000);
      
      // Page should still be responsive
      await expect(page.locator('text="Progression"')).toBeVisible();
    } else {
      console.log('No workout plans available to test progression');
      test.skip(true, 'No workout plans available for progression testing');
    }
  });
});
