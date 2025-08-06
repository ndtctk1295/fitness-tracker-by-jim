import { test, expect } from '@playwright/test';
import { usersMockData } from '../../fixtures/users';

const validUser = usersMockData.valid;
//TODO: TEST
// Helper function to login user
async function loginAsTestUser(page: any) {
  await page.goto('/auth/signin');
  await page.fill('[data-testid="email-input"]', validUser.email);
  await page.fill('[data-testid="password-input"]', validUser.password);
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL(/dashboard/, { timeout: 20000 });
}

test.describe('Calendar Page - Exercise Display', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('CAL-008: Exercise rendering on calendar', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Look for exercises on calendar dates
    const exerciseElements = page.locator('[data-testid="calendar-exercise"]');
    
    if (await exerciseElements.count() > 0) {
      // Verify exercises appear on correct dates
      await expect(exerciseElements.first()).toBeVisible();
      
      // Check for different exercise type styling
      const scheduledExercises = page.locator('[data-testid="calendar-exercise"][data-type="scheduled"]');
      const templateExercises = page.locator('[data-testid="calendar-exercise"][data-type="template"]');
      const manualExercises = page.locator('[data-testid="calendar-exercise"][data-type="manual"]');
      
      // Verify exercise names are readable
      const firstExercise = exerciseElements.first();
      const exerciseName = await firstExercise.textContent();
      expect(exerciseName).toBeTruthy();
      expect(exerciseName?.trim().length).toBeGreaterThan(0);
    }
  });

  test('CAL-009: Exercise legend display in detailed view', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Check if legend is visible (might be conditional based on view mode)
    const legend = page.locator('[data-testid="calendar-legend"]');
    
    if (await legend.isVisible()) {
      // Verify legend explains exercise types
      await expect(legend).toContainText('Exercise Types');
      
      // Check for workout plan information
      const planInfo = page.locator('[data-testid="active-plan-name"]');
      if (await planInfo.isVisible()) {
        const planName = await planInfo.textContent();
        expect(planName).toBeTruthy();
      }
    }
  });

  test('CAL-010: Empty date display', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Find dates with no exercises
    const allDateCells = page.locator('[data-testid="calendar-date-cell"]');
    const emptyDateCells = allDateCells.filter({ hasNot: page.locator('[data-testid="calendar-exercise"]') });
    
    if (await emptyDateCells.count() > 0) {
      // Verify empty dates are clickable
      await expect(emptyDateCells.first()).toBeVisible();
      
      // Verify consistent styling
      const firstEmptyDate = emptyDateCells.first();
      await expect(firstEmptyDate).toHaveCSS('cursor', 'pointer');
    }
  });
});

test.describe('Calendar Page - Exercise Detail Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('CAL-011: Open exercise dialog by clicking date', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Click on any calendar date
    const firstDateCell = page.locator('[data-testid="calendar-date-cell"]').first();
    await firstDateCell.click();
    
    // Wait for dialog to open
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Verify dialog opens with correct title
    const dialog = page.locator('[data-testid="exercise-detail-dialog"]');
    await expect(dialog).toBeVisible();
    
    const dialogTitle = page.locator('[data-testid="dialog-title"]');
    await expect(dialogTitle).toContainText('Exercises for');
    
    // Verify tabs are visible
    await expect(page.locator('[data-testid="scheduled-exercises-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-exercise-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="edit-exercise-tab"]')).toBeVisible();
  });

  test('CAL-012: Close exercise dialog', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Open dialog
    await page.locator('[data-testid="calendar-date-cell"]').first().click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Close dialog using close button
    await page.locator('[data-testid="dialog-close"]').click();
    
    // Verify dialog closes
    await expect(page.locator('[data-testid="exercise-detail-dialog"]')).not.toBeVisible();
  });

  test('CAL-013: Scheduled exercises tab content', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Find a date with exercises (or create test data)
    await page.locator('[data-testid="calendar-date-cell"]').first().click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Verify scheduled exercises tab is active by default
    await expect(page.locator('[data-testid="scheduled-exercises-tab"][data-state="active"]')).toBeVisible();
    
    // Check for exercise list or empty state
    const exerciseList = page.locator('[data-testid="exercise-list"]');
    const emptyState = page.locator('[data-testid="no-exercises"]');
    
    // Either exercise list or empty state should be visible
    const hasExercises = await exerciseList.isVisible();
    const isEmpty = await emptyState.isVisible();
    expect(hasExercises || isEmpty).toBe(true);
    
    if (hasExercises) {
      // Verify "Clear All Exercises" button is visible when exercises exist
      await expect(page.locator('[data-testid="clear-all-exercises"]')).toBeVisible();
      
      // Verify timer link is available
      const timerLink = page.locator('[data-testid="start-timer-link"]');
      if (await timerLink.isVisible()) {
        await expect(timerLink).toHaveAttribute('href', '/timer');
      }
    }
  });

  test('CAL-014: Add exercise tab - exercise selection', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Click on a future date
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 1);
    
    const futureDateCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${futureDate.toISOString().split('T')[0]}"]`);
    await futureDateCell.click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Switch to Add Exercise tab
    await page.locator('[data-testid="add-exercise-tab"]').click();
    
    // Verify tab is enabled for future dates (not disabled)  
    const addExerciseTab = page.locator('[data-testid="add-exercise-tab"]');
    await expect(addExerciseTab).not.toHaveAttribute('disabled');
    
    // Check for sub-tabs: Favorites and All Exercises
    await expect(page.locator('[data-testid="favorites-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="all-exercises-tab"]')).toBeVisible();
    
    // Check exercise categories are displayed
    const categories = page.locator('[data-testid="exercise-category"]');
    if (await categories.count() > 0) {
      await expect(categories.first()).toBeVisible();
    }
  });

  test('CAL-015: Add exercise - complete flow', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Click on future date
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 1);
    
    const futureDateCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${futureDate.toISOString().split('T')[0]}"]`);
    await futureDateCell.click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Go to Add Exercise tab
    await page.locator('[data-testid="add-exercise-tab"]').click();
    
    // Select exercise category (if available)
    const firstCategory = page.locator('[data-testid="exercise-category"]').first();
    if (await firstCategory.isVisible()) {
      await firstCategory.click();
      
      // Select specific exercise
      const firstExercise = page.locator('[data-testid="exercise-option"]').first();
      if (await firstExercise.isVisible()) {
        await firstExercise.click();
        
        // Fill in exercise details
        await page.locator('[data-testid="sets-input"]').fill('3');
        await page.locator('[data-testid="reps-input"]').fill('10');
        await page.locator('[data-testid="weight-input"]').fill('50');
        
        // Save exercise
        await page.locator('[data-testid="save-exercise"]').click();
        
        // Verify success notification
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
        
        // Verify exercise appears on calendar
        await page.locator('[data-testid="dialog-close"]').click();
        const addedExercise = page.locator(`[data-testid="calendar-date-cell"][data-date="${futureDate.toISOString().split('T')[0]}"] [data-testid="calendar-exercise"]`);
        await expect(addedExercise).toBeVisible();
      }
    }
  });

  test('CAL-019: Past date restrictions', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Click on a past date
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 1);
    
    const pastDateCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${pastDate.toISOString().split('T')[0]}"]`);
    await pastDateCell.click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Verify Add Exercise tab is disabled for past dates
    const addExerciseTab = page.locator('[data-testid="add-exercise-tab"]');
    await expect(addExerciseTab).toHaveAttribute('disabled');
    
    // Verify visual indication of disabled state
    await expect(addExerciseTab).toHaveClass(/opacity-50/); // Disabled tabs typically have reduced opacity
  });
});
