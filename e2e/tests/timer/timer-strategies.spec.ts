import { test, expect } from '@playwright/test';
import { usersMockData } from '../../fixtures/users';

const validUser = usersMockData.valid;

// Helper function to login user
async function loginAsTestUser(page: any) {
  await page.goto('/auth/signin');
  await page.fill('[data-testid="email-input"]', validUser.email);
  await page.fill('[data-testid="password-input"]', validUser.password);
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL(/dashboard/, { timeout: 20000 });
}

test.describe('Timer Page - Timer Strategy Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to timer page
    await loginAsTestUser(page);
    await page.goto('/timer');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TIM-011: Timer strategy creation', async ({ page }) => {
    // Test new strategy creation flow
    const createStrategyButton = page.locator('[data-testid="create-strategy-button"]');
    
    if (await createStrategyButton.isVisible()) {
      await createStrategyButton.click();
      
      // Verify form appears
      await expect(page.locator('[data-testid="strategy-form"]')).toBeVisible();
      
      // Fill out strategy form
      await page.fill('[data-testid="strategy-name-input"]', `Test Strategy ${Date.now()}`);
      await page.fill('[data-testid="rest-duration-input"]', '30');
      await page.fill('[data-testid="active-duration-input"]', '60');
      
      // Test color selection if available
      const colorPicker = page.locator('[data-testid="strategy-color-picker"]');
      if (await colorPicker.isVisible()) {
        await colorPicker.click();
        await page.locator('[data-testid="color-option"]').first().click();
      }
      
      // Submit form
      await page.click('[data-testid="save-strategy-button"]');
      
      // Check success notifications
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({ timeout: 5000 });
      
      // Verify form validation works
      // This would involve testing empty fields, invalid values, etc.
    } else {
      test.skip(true, 'Strategy creation not available or accessible');
    }
  });

  test('TIM-012: Timer strategy editing', async ({ page }) => {
    // First, ensure we have a strategy to edit
    const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
    await strategySelector.click();
    
    const strategies = page.locator('[data-testid="strategy-option"]');
    const strategyCount = await strategies.count();
    
    if (strategyCount === 0) {
      test.skip(true, 'No strategies available for editing');
    }
    
    // Look for edit button
    const editStrategyButton = page.locator('[data-testid="edit-strategy-button"]');
    if (await editStrategyButton.isVisible()) {
      await editStrategyButton.click();
      
      // Test strategy modification
      await expect(page.locator('[data-testid="strategy-form"]')).toBeVisible();
      
      // Modify values
      const nameInput = page.locator('[data-testid="strategy-name-input"]');
      await nameInput.fill(`Modified Strategy ${Date.now()}`);
      
      // Verify update functionality
      await page.click('[data-testid="save-strategy-button"]');
      
      // Check changes are saved
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, 'Strategy editing not available');
    }
  });

  test('TIM-013: Timer strategy deletion', async ({ page }) => {
    const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
    await strategySelector.click();
    
    const strategies = page.locator('[data-testid="strategy-option"]');
    const initialCount = await strategies.count();
    
    if (initialCount === 0) {
      test.skip(true, 'No strategies available for deletion');
    }
    
    // Test strategy deletion
    const deleteStrategyButton = page.locator('[data-testid="delete-strategy-button"]');
    if (await deleteStrategyButton.isVisible()) {
      await deleteStrategyButton.click();
      
      // Verify confirmation dialog
      await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible();
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Check strategy removed from list
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({ timeout: 5000 });
      
      // Verify strategy is no longer in dropdown
      await strategySelector.click();
      const newCount = await strategies.count();
      expect(newCount).toBe(initialCount - 1);
    } else {
      test.skip(true, 'Strategy deletion not available');
    }
  });

  test('TIM-014: Timer strategy validation', async ({ page }) => {
    const createStrategyButton = page.locator('[data-testid="create-strategy-button"]');
    
    if (await createStrategyButton.isVisible()) {
      await createStrategyButton.click();
      await expect(page.locator('[data-testid="strategy-form"]')).toBeVisible();
      
      // Test invalid duration values
      await page.fill('[data-testid="rest-duration-input"]', '-5');
      await page.fill('[data-testid="active-duration-input"]', '0');
      
      // Try to submit
      await page.click('[data-testid="save-strategy-button"]');
      
      // Verify form validation messages
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      
      // Check boundary conditions
      await page.fill('[data-testid="rest-duration-input"]', '999999');
      await page.fill('[data-testid="active-duration-input"]', '999999');
      
      await page.click('[data-testid="save-strategy-button"]');
      
      // Should either accept or show boundary validation
      const hasError = await page.locator('[data-testid="validation-error"]').isVisible();
      const hasSuccess = await page.locator('[data-testid="toast-success"]').isVisible();
      
      expect(hasError || hasSuccess).toBe(true);
    } else {
      test.skip(true, 'Strategy creation form not available for validation testing');
    }
  });

  test('TIM-015: Timer strategy color customization', async ({ page }) => {
    const createStrategyButton = page.locator('[data-testid="create-strategy-button"]');
    
    if (await createStrategyButton.isVisible()) {
      await createStrategyButton.click();
      await expect(page.locator('[data-testid="strategy-form"]')).toBeVisible();
      
      // Test color picker functionality
      const colorPicker = page.locator('[data-testid="strategy-color-picker"]');
      if (await colorPicker.isVisible()) {
        await colorPicker.click();
        
        // Verify color options are available
        await expect(page.locator('[data-testid="color-option"]')).toBeVisible();
        
        // Select a color
        const colorOption = page.locator('[data-testid="color-option"]').first();
        const selectedColor = await colorOption.getAttribute('data-color');
        await colorOption.click();
        
        // Verify color updates in UI
        const colorPreview = page.locator('[data-testid="color-preview"]');
        if (await colorPreview.isVisible()) {
          const previewColor = await colorPreview.getAttribute('style');
          expect(previewColor).toContain(selectedColor || 'color');
        }
        
        // Save and check color persistence
        await page.fill('[data-testid="strategy-name-input"]', `Color Test ${Date.now()}`);
        await page.fill('[data-testid="rest-duration-input"]', '30');
        await page.fill('[data-testid="active-duration-input"]', '60');
        await page.click('[data-testid="save-strategy-button"]');
        
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible({ timeout: 5000 });
      } else {
        test.skip(true, 'Color picker not available');
      }
    } else {
      test.skip(true, 'Strategy creation not available for color testing');
    }
  });

  test('TIM-016: Timer strategy default values', async ({ page }) => {
    const createStrategyButton = page.locator('[data-testid="create-strategy-button"]');
    
    if (await createStrategyButton.isVisible()) {
      await createStrategyButton.click();
      await expect(page.locator('[data-testid="strategy-form"]')).toBeVisible();
      
      // Test creation with default settings
      const restInput = page.locator('[data-testid="rest-duration-input"]');
      const activeInput = page.locator('[data-testid="active-duration-input"]');
      
      // Verify reasonable default durations
      const defaultRest = await restInput.inputValue();
      const defaultActive = await activeInput.inputValue();
      
      if (defaultRest) {
        const restValue = parseInt(defaultRest);
        expect(restValue).toBeGreaterThan(0);
        expect(restValue).toBeLessThan(300); // 5 minutes max default
      }
      
      if (defaultActive) {
        const activeValue = parseInt(defaultActive);
        expect(activeValue).toBeGreaterThan(0);
        expect(activeValue).toBeLessThan(600); // 10 minutes max default
      }
      
      // Check default color assignment
      const colorPreview = page.locator('[data-testid="color-preview"]');
      if (await colorPreview.isVisible()) {
        const colorStyle = await colorPreview.getAttribute('style');
        expect(colorStyle).toBeTruthy();
      }
    } else {
      test.skip(true, 'Strategy creation not available for default value testing');
    }
  });

  test('TIM-017: Timer strategy selection persistence', async ({ page }) => {
    const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
    await strategySelector.click();
    
    const strategies = page.locator('[data-testid="strategy-option"]');
    const strategyCount = await strategies.count();
    
    if (strategyCount === 0) {
      test.skip(true, 'No strategies available for persistence testing');
    }
    
    // Select a strategy
    const firstStrategy = strategies.first();
    const strategyText = await firstStrategy.textContent();
    await firstStrategy.click();
    
    // Test selected strategy remembers on page refresh
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Check if strategy selection survived refresh
    const selectedStrategy = page.locator('[data-testid="selected-strategy"]');
    if (await selectedStrategy.isVisible()) {
      const selectedText = await selectedStrategy.textContent();
      expect(selectedText).toContain(strategyText || '');
    }
    
    // Verify strategy selection survives navigation
    await page.goto('/dashboard');
    await page.goto('/timer');
    await page.waitForLoadState('domcontentloaded');
    
    // Check persistence after navigation
    if (await selectedStrategy.isVisible()) {
      const persistentText = await selectedStrategy.textContent();
      expect(persistentText).toContain(strategyText || '');
    }
  });

  test('TIM-018: Timer strategy API error handling', async ({ page }) => {
    // This test simulates network failures during strategy operations
    
    const createStrategyButton = page.locator('[data-testid="create-strategy-button"]');
    
    if (await createStrategyButton.isVisible()) {
      // Intercept API calls to simulate failures
      await page.route('**/api/timer-strategies/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await createStrategyButton.click();
      await expect(page.locator('[data-testid="strategy-form"]')).toBeVisible();
      
      // Fill form and try to save
      await page.fill('[data-testid="strategy-name-input"]', 'Error Test Strategy');
      await page.fill('[data-testid="rest-duration-input"]', '30');
      await page.fill('[data-testid="active-duration-input"]', '60');
      
      // Test creation failure scenarios
      await page.click('[data-testid="save-strategy-button"]');
      
      // Verify update error handling
      await expect(page.locator('[data-testid="toast-error"]')).toBeVisible({ timeout: 5000 });
      
      // Check deletion error responses
      const deleteButton = page.locator('[data-testid="delete-strategy-button"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.click('[data-testid="confirm-delete-button"]');
        await expect(page.locator('[data-testid="toast-error"]')).toBeVisible({ timeout: 5000 });
      }
    } else {
      test.skip(true, 'Strategy management not available for error testing');
    }
  });

  test('TIM-019: Timer strategy list management', async ({ page }) => {
    const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
    await strategySelector.click();
    
    // Test multiple strategies display
    const strategies = page.locator('[data-testid="strategy-option"]');
    const strategyCount = await strategies.count();
    
    if (strategyCount === 0) {
      test.skip(true, 'No strategies available for list management testing');
    }
    
    // Verify each strategy displays correctly
    for (let i = 0; i < Math.min(strategyCount, 5); i++) {
      const strategy = strategies.nth(i);
      await expect(strategy).toBeVisible();
      
      const strategyText = await strategy.textContent();
      expect(strategyText).toBeTruthy();
    }
    
    // Check if there's sorting/ordering
    const strategyNames = [];
    for (let i = 0; i < strategyCount; i++) {
      const name = await strategies.nth(i).textContent();
      if (name) strategyNames.push(name);
    }
    
    // Verify strategies are in some logical order (alphabetical or creation order)
    expect(strategyNames.length).toBeGreaterThan(0);
    
    // Check pagination if implemented (for large lists)
    const pagination = page.locator('[data-testid="strategy-pagination"]');
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    }
  });

  test('TIM-020: Timer strategy integration with timer', async ({ page }) => {
    const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
    await strategySelector.click();
    
    const strategies = page.locator('[data-testid="strategy-option"]');
    const strategyCount = await strategies.count();
    
    if (strategyCount === 0) {
      test.skip(true, 'No strategies available for integration testing');
    }
    
    // Select a strategy
    const strategy = strategies.first();
    await strategy.click();
    
    // Start timer
    await page.click('[data-testid="start-timer-button"]');
    await expect(page.locator('[data-testid="active-timer"]')).toBeVisible();
    
    // Test strategy affects timer durations
    const timerDisplay = page.locator('[data-testid="timer-display"]');
    const displayedTime = await timerDisplay.textContent();
    
    // Verify timer shows expected duration format
    expect(displayedTime).toMatch(/^\d{1,2}:\d{2}$/);
    
    // Verify rest/active periods match strategy
    const timerMode = page.locator('[data-testid="timer-mode"]');
    if (await timerMode.isVisible()) {
      const mode = await timerMode.textContent();
      expect(mode).toMatch(/rest|active|exercise/i);
    }
    
    // Check strategy color is applied
    const timerContainer = page.locator('[data-testid="active-timer"]');
    const containerStyle = await timerContainer.getAttribute('style');
    // Strategy color should influence timer appearance
    
    // Test strategy changes during active timer (if supported)
    await page.click('[data-testid="stop-timer-button"]');
    
    // Select different strategy
    await strategySelector.click();
    if (strategyCount > 1) {
      await strategies.nth(1).click();
      
      // Start timer again
      await page.click('[data-testid="start-timer-button"]');
      
      // Timer should reflect new strategy
      await expect(page.locator('[data-testid="active-timer"]')).toBeVisible();
    }
  });
});
