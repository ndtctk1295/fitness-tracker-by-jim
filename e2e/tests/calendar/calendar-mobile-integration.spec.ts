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

test.describe('Calendar Page - Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('CAL-020: Mobile tab navigation in exercise dialog', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Click on any date to open dialog
    await page.locator('[data-testid="calendar-date-cell"]').first().click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Verify mobile dropdown selector is visible
    await expect(page.locator('[data-testid="mobile-tab-selector"]')).toBeVisible();
    
    // Verify desktop tabs are hidden on mobile
    await expect(page.locator('[data-testid="desktop-tabs"]')).not.toBeVisible();
    
    // Test dropdown functionality
    await page.locator('[data-testid="mobile-tab-selector"]').click();
    
    // Verify dropdown options
    await expect(page.locator('[data-testid="mobile-tab-option-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-option-add"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-option-edit"]')).toBeVisible();
    
    // Select different tab
    await page.locator('[data-testid="mobile-tab-option-add"]').click();
    
    // Verify tab content changes
    await expect(page.locator('[data-testid="add-exercise-content"]')).toBeVisible();
  });

  test('CAL-021: Mobile calendar layout and interactions', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Verify calendar remains functional on mobile
    await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
    
    // Test navigation controls accessibility
    await expect(page.locator('[data-testid="calendar-prev-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-next-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-today-btn"]')).toBeVisible();
    
    // Test touch interactions (click on date - works on both desktop and mobile)
    const firstDateCell = page.locator('[data-testid="calendar-date-cell"]').first();
    await firstDateCell.click();
    
    // Verify dialog opens properly on mobile
    await expect(page.locator('[data-testid="exercise-detail-dialog"]')).toBeVisible();
    
    // Test exercise entries are tappable
    const exerciseElement = page.locator('[data-testid="calendar-exercise"]').first();
    if (await exerciseElement.isVisible()) {
      await expect(exerciseElement).toHaveCSS('cursor', 'pointer');
    }
  });
});

test.describe('Calendar Page - Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('CAL-026: Timer integration navigation', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Find a date with exercises
    await page.locator('[data-testid="calendar-date-cell"]').first().click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Look for timer link (if exercises exist)
    const timerLink = page.locator('[data-testid="start-timer-link"]');
    
    if (await timerLink.isVisible()) {
      // Click timer link
      await timerLink.click();
      
      // Verify navigation to timer page
      await page.waitForURL('**/timer');
      await expect(page).toHaveURL(/timer/);
      
      // Verify timer page loads
      await expect(page.locator('h1')).toContainText('Timer');
    }
  });

  test('CAL-027: Workout plan integration', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Check if active workout plan is displayed
    const activePlanElement = page.locator('[data-testid="active-plan-name"]');
    
    if (await activePlanElement.isVisible()) {
      // Verify workout plan name is shown
      const planName = await activePlanElement.textContent();
      expect(planName).toBeTruthy();
      expect(planName?.trim().length).toBeGreaterThan(0);
      
      // Look for template exercises (plan-based)
      const templateExercises = page.locator('[data-testid="calendar-exercise"][data-type="template"]');
      
      if (await templateExercises.count() > 0) {
        // Verify template exercises have proper styling
        await expect(templateExercises.first()).toBeVisible();
        
        // Test template exercise behavior (should trigger scope dialog when moved)
        const firstTemplate = templateExercises.first();
        const sourceDate = await firstTemplate.getAttribute('data-date');
        
        if (sourceDate) {
          const sourceDateObj = new Date(sourceDate);
          const targetDateObj = new Date(sourceDateObj);
          targetDateObj.setDate(sourceDateObj.getDate() + 1);
          
          const targetCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${targetDateObj.toISOString().split('T')[0]}"]`);
          
          if (await targetCell.isVisible()) {
            await firstTemplate.dragTo(targetCell);
            
            // Should trigger scope selection for template exercises
            await expect(page.locator('[data-testid="scope-selection-dialog"]')).toBeVisible();
            
            // Close dialog
            await page.locator('[data-testid="cancel-scope"]').click();
          }
        }
      }
    }
  });

  test('CAL-028: Weight unit consistency', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('domcontentloaded'); // Use domcontentloaded instead of networkidle
    
    // Wait for calendar to be visible
    await page.waitForSelector('[data-testid="calendar-grid"]', { state: 'visible' });
    
    // Click on a future date to ensure Add Exercise tab is enabled
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 1);
    
    const futureDateCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${futureDate.toISOString().split('T')[0]}"]`);
    await futureDateCell.click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Go to add exercise tab
    await page.locator('[data-testid="add-exercise-tab"]').click();
    
    // Check current weight unit in weight input/display
    const weightInput = page.locator('[data-testid="weight-input"]');
    const weightPlateSelector = page.locator('[data-testid="weight-plate-selector"]');
    
    if (await weightInput.isVisible()) {
      // Check for unit indicator (kg or lbs)
      const unitIndicator = page.locator('[data-testid="weight-unit-indicator"]');
      
      if (await unitIndicator.isVisible()) {
        const currentUnit = await unitIndicator.textContent();
        expect(currentUnit === 'kg' || currentUnit === 'lbs').toBe(true);
        
        // If weight plate selector is visible, verify it uses same unit
        if (await weightPlateSelector.isVisible()) {
          const plateUnit = page.locator('[data-testid="plate-unit-display"]');
          if (await plateUnit.isVisible()) {
            const plateUnitText = await plateUnit.textContent();
            expect(plateUnitText).toContain(currentUnit);
          }
        }
      }
    }
  });
});
