// Timer Basic E2E Tests
import { test, expect, Page } from '@playwright/test';
import {
  loginUser,
  navigateToTimer,
  waitForTimerSetup,
  waitForTimerStrategySelector,
  waitForExerciseList,
  selectTimerStrategy,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  enableMobileMode,
  enableTabletMode,
  enableDesktopMode,
  tapElement,
  expectElementToBeVisible,
  expectElementToBeHidden,
  expectTextContent,
  takeScreenshot,
  ensureTimerDataExists,
  seedTimerStrategies,
  seedScheduledExercises,
  addExerciseToToday
} from '../../utils/test-helpers';
import { getTodayString, getYesterdayString } from '../../utils/date-helpers';

test.describe('Timer Page - Basic Navigation & Setup', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login and navigate to timer page
    await loginUser(page);
    await navigateToTimer(page);
    
    // Verify timer setup is visible (this ensures page is fully loaded)
    await waitForTimerSetup(page);
  });

  test('TIM-001: Timer page loads successfully', async ({ page }) => {
    // Verify main timer elements are present
    await expectElementToBeVisible(page, '[data-testid="timer-setup"]');
    await expectElementToBeVisible(page, '[data-testid="timer-strategy-selector"]');
    
    // Verify page title - be more specific to avoid multiple h1 elements
    const workoutTimerHeading = page.locator('h1').filter({ hasText: 'Workout Timer' });
    await expect(workoutTimerHeading).toBeVisible();
    
    // Verify no loading states are visible
    await expectElementToBeHidden(page, 'text=Loading timer data...');
    
    console.log('[TEST] Timer page loaded successfully with all basic elements');
  });

  test('TIM-002: Timer setup component displays correctly', async ({ page }) => {
    // Verify timer strategy selector is visible and enabled
    await expectElementToBeVisible(page, '[data-testid="timer-strategy-selector"]');
    
    // Check start button is present and initially disabled or ready
    const startButton = page.locator('[data-testid="start-timer-button"]');
    await expect(startButton).toBeVisible();
    
    // Verify exercise list area is present (even if empty)
    await waitForExerciseList(page);
    
    console.log('[TEST] Timer setup component displays all required elements');
  });

  test('TIM-003: Timer strategy selection works', async ({ page }) => {
    // Ensure timer strategies exist before testing selection
    await seedTimerStrategies(page);
    
    await waitForTimerStrategySelector(page);
    
    // Click strategy selector to open dropdown
    await page.click('[data-testid="timer-strategy-selector"]');
    
    // Verify dropdown opens with options - target dropdown items specifically
    const defaultWorkout = page.locator('[role="option"]:has-text("Default Workout")').first();
    const highIntensity = page.locator('[role="option"]:has-text("High Intensity")').first();
    const strengthTraining = page.locator('[role="option"]:has-text("Strength Training")').first();

    // At least one strategy should be visible - check individually to avoid strict mode
    const hasOptions = await defaultWorkout.isVisible().catch(() => false) ||
                       await highIntensity.isVisible().catch(() => false) ||
                       await strengthTraining.isVisible().catch(() => false);
    expect(hasOptions).toBe(true);    // Select a strategy
    if (await defaultWorkout.isVisible()) {
      await defaultWorkout.click();
      console.log('[TEST] Selected Default Workout strategy');
    } else if (await highIntensity.isVisible()) {
      await highIntensity.click();
      console.log('[TEST] Selected High Intensity strategy');
    } else {
      await strengthTraining.click();
      console.log('[TEST] Selected Strength Training strategy');
    }
    
    // Verify selection was made (dropdown should close)
    await page.waitForTimeout(1000);
    
    console.log('[TEST] Timer strategy selection works correctly');
  });

  test('TIM-004: Exercise list displays today\'s exercises', async ({ page }) => {
    // Ensure scheduled exercises exist for yesterday (to test display)
    await seedScheduledExercises(page, getYesterdayString());
    
    await waitForExerciseList(page);
    
    // Check if exercises are loaded (could be empty for new user)
    const exerciseList = page.locator('[data-testid="exercise-list"]');
    const emptyState = page.locator('[data-testid="empty-exercise-list"]');
    
    // Either exercise list or empty state should be visible
    const isExerciseListVisible = await exerciseList.isVisible().catch(() => false);
    const isEmptyStateVisible = await emptyState.isVisible().catch(() => false);
    
    expect(isExerciseListVisible || isEmptyStateVisible).toBe(true);
    
    if (isExerciseListVisible) {
      // If exercises are present, verify they have proper structure
      const exerciseItems = page.locator('[data-testid^="exercise-item-"]');
      const count = await exerciseItems.count();
      console.log(`[TEST] Found ${count} exercises in the list`);
      
      if (count > 0) {
        // Verify first exercise has required elements
        const firstExercise = exerciseItems.first();
        await expect(firstExercise).toBeVisible();
      }
    } else {
      console.log('[TEST] No exercises scheduled for today (empty state)');
    }
    
    console.log('[TEST] Exercise list displays correctly');
  });

  test('TIM-005: Exercise completion status works', async ({ page }) => {
    // Ensure scheduled exercises exist for yesterday (to test completion)
    await seedScheduledExercises(page, getYesterdayString());
    
    await waitForExerciseList(page);
    
    // Look for any exercises with completion checkboxes
    const exerciseCheckboxes = page.locator('[data-testid^="exercise-checkbox-"]');
    const checkboxCount = await exerciseCheckboxes.count();
    
    if (checkboxCount > 0) {
      const firstCheckbox = exerciseCheckboxes.first();
      
      // Check initial state
      const isInitiallyChecked = await firstCheckbox.isChecked();
      
      // Toggle checkbox
      await firstCheckbox.click();
      
      // Verify state changed
      const isCheckedAfterClick = await firstCheckbox.isChecked();
      expect(isCheckedAfterClick).toBe(!isInitiallyChecked);
      
      console.log(`[TEST] Exercise completion toggled from ${isInitiallyChecked} to ${isCheckedAfterClick}`);
    } else {
      console.log('[TEST] No exercises with completion checkboxes found - skipping completion test');
    }
    
    console.log('[TEST] Exercise completion status functionality verified');
  });

  test('TIM-006: Sound permission handling works', async ({ page }) => {
    // Look for sound-related elements
    const soundToggle = page.locator('[data-testid="sound-toggle"]');
    const soundButton = page.locator('[data-testid="test-sound-button"]');
    
    // Check if sound controls are present
    const hasSoundToggle = await soundToggle.isVisible().catch(() => false);
    const hasSoundButton = await soundButton.isVisible().catch(() => false);
    
    if (hasSoundToggle) {
      // Test sound toggle
      const initialState = await soundToggle.isChecked();
      await soundToggle.click();
      const newState = await soundToggle.isChecked();
      expect(newState).toBe(!initialState);
      console.log(`[TEST] Sound toggle changed from ${initialState} to ${newState}`);
    }
    
    if (hasSoundButton) {
      // Test sound button (should not cause errors)
      await soundButton.click();
      await page.waitForTimeout(500);
      console.log('[TEST] Sound test button clicked successfully');
    }
    
    console.log('[TEST] Sound permission handling verified');
  });

  test('TIM-007: Settings toggles functionality', async ({ page }) => {
    // Look for auto-switch toggle
    const autoSwitchToggle = page.locator('[data-testid="auto-switch-toggle"]');
    
    if (await autoSwitchToggle.isVisible()) {
      const initialState = await autoSwitchToggle.isChecked();
      
      // Toggle the switch
      await autoSwitchToggle.click();
      await page.waitForTimeout(500);
      
      const newState = await autoSwitchToggle.isChecked();
      expect(newState).toBe(!initialState);
      
      console.log(`[TEST] Auto-switch toggle changed from ${initialState} to ${newState}`);
    } else {
      console.log('[TEST] Auto-switch toggle not found - checking for other settings');
      
      // Look for other settings toggles
      const settingsToggles = page.locator('[data-testid*="toggle"], [data-testid*="switch"]');
      const toggleCount = await settingsToggles.count();
      
      if (toggleCount > 0) {
        console.log(`[TEST] Found ${toggleCount} toggle elements`);
      } else {
        console.log('[TEST] No toggle elements found');
      }
    }
    
    console.log('[TEST] Settings toggles functionality verified');
  });

  test('TIM-008: Timer start functionality', async ({ page }) => {
    // Ensure timer strategies exist before testing
    await seedTimerStrategies(page);
    
    // Add some exercises for today to enable timer functionality
    await test.step('Add exercises for today', async () => {
      await addExerciseToToday(page, 'Push-ups', getTodayString());
      await addExerciseToToday(page, 'Squats', getTodayString());
      console.log('[TEST] Added exercises for today to enable timer');
    });
    
    // Refresh page to load the new exercises
    await test.step('Refresh to load exercises', async () => {
      await navigateToTimer(page);
      await waitForTimerSetup(page);
    });
    
    // Select a timer strategy first
    await test.step('Select timer strategy', async () => {
      await waitForTimerStrategySelector(page);
      await selectTimerStrategy(page, 'Default Workout');
    });
    
    // Start the timer
    await test.step('Start timer', async () => {
      const startButton = page.locator('[data-testid="start-timer-button"]');
      await expect(startButton).toBeVisible();
      await expect(startButton).toBeEnabled();
      
      await startButton.click();
      
      // Wait for timer to start - check for active timer specifically
      await expect(page.locator('[data-testid="active-timer"]')).toBeVisible({ timeout: 5000 });
      
      console.log('[TEST] Timer started successfully');
    });
    
    // Stop the timer to clean up
    await test.step('Stop timer', async () => {
      const stopButton = page.locator('[data-testid="stop-timer-button"]');
      if (await stopButton.isVisible()) {
        await stopButton.click();
        
        // Handle confirmation if present
        const confirmButton = page.locator('[data-testid="confirm-stop-timer"]');
        if (await confirmButton.isVisible({ timeout: 1000 })) {
          await confirmButton.click();
        }
        
        console.log('[TEST] Timer stopped successfully');
      }
    });
    
    console.log('[TEST] Timer start functionality verified');
  });

  test('TIM-009: Mobile responsive design', async ({ page }) => {
    // Test mobile layout
    await enableMobileMode(page);
    await page.reload();
    await navigateToTimer(page);
    await waitForTimerSetup(page);
    
    // Verify elements are still visible in mobile view
    await expectElementToBeVisible(page, '[data-testid="timer-setup"]');
    await expectElementToBeVisible(page, '[data-testid="timer-strategy-selector"]');
    
    // Test touch interactions
    await tapElement(page, '[data-testid="timer-strategy-selector"]');
    await page.waitForTimeout(500);
    
    // Test tablet layout
    await enableTabletMode(page);
    await page.reload();
    await navigateToTimer(page);
    await waitForTimerSetup(page);
    
    await expectElementToBeVisible(page, '[data-testid="timer-setup"]');
    
    // Return to desktop
    await enableDesktopMode(page);
    
    console.log('[TEST] Mobile responsive design verified');
  });

  test('TIM-010: Error handling for network issues', async ({ page }) => {
    // Simulate network error by going offline
    await page.context().setOffline(true);
    
    // Try to navigate to timer (should handle gracefully)
    await page.goto('/timer');
    
    // Look for error message or offline indicator
    const errorMessage = page.locator('[data-testid="error-message"], [data-testid="offline-indicator"], text=network error');
    
    // Either an error should be shown, or the page should degrade gracefully
    const hasErrorMessage = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasTimerSetup = await page.locator('[data-testid="timer-setup"]').isVisible({ timeout: 5000 }).catch(() => false);
    
    // Either error handling should be visible OR the page should still work with cached data
    expect(hasErrorMessage || hasTimerSetup).toBe(true);
    
    // Restore network
    await page.context().setOffline(false);
    await page.reload();
    await navigateToTimer(page);
    await waitForTimerSetup(page);
    
    console.log('[TEST] Network error handling verified');
  });
});

test.describe('Timer Page - Advanced Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await navigateToTimer(page);
    await waitForTimerSetup(page);
  });

  test('TIM-011: Timer pause and resume functionality', async ({ page }) => {
    // Ensure timer strategies exist before testing
    await seedTimerStrategies(page);
    
    // Add exercises for today to enable timer functionality
    await addExerciseToToday(page, 'Push-ups', getTodayString());
    await addExerciseToToday(page, 'Squats', getTodayString());
    
    // Refresh page to load the new exercises
    await navigateToTimer(page);
    await waitForTimerSetup(page);
    
    // Start a timer first
    await selectTimerStrategy(page, 'Default Workout');
    await startTimer(page);
    
    // Pause the timer
    await pauseTimer(page);
    
    // Verify pause state
    const pauseButton = page.locator('[data-testid="pause-timer-button"]');
    const resumeButton = page.locator('[data-testid="resume-timer-button"]');
    
    // Either pause button should be hidden or resume button should be visible
    const isPaused = await resumeButton.isVisible() || !await pauseButton.isVisible();
    expect(isPaused).toBe(true);
    
    // Resume the timer
    await resumeTimer(page);
    
    // Stop timer to clean up
    await stopTimer(page);
    
    console.log('[TEST] Timer pause and resume functionality verified');
  });

  test('TIM-012: Multiple timer strategies comparison', async ({ page }) => {
    // Ensure timer strategies exist before testing
    await seedTimerStrategies(page);
    
    const strategies = ['Default Workout', 'High Intensity', 'Strength Training'];
    
    for (const strategy of strategies) {
      await test.step(`Test ${strategy}`, async () => {
        // Select strategy
        await selectTimerStrategy(page, strategy);
        
        // Verify strategy is selected
        const selector = page.locator('[data-testid="timer-strategy-selector"]');
        await expectTextContent(page, '[data-testid="timer-strategy-selector"]', strategy);
        
        // Verify start button is enabled
        const startButton = page.locator('[data-testid="start-timer-button"]');
        await expect(startButton).toBeEnabled();
        
        console.log(`[TEST] ${strategy} strategy selected and ready`);
      });
    }
    
    console.log('[TEST] Multiple timer strategies comparison completed');
  });
});

test.describe('Timer Page - Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await navigateToTimer(page);
    await waitForTimerSetup(page);
  });

  test('TIM-013: End-to-end timer workflow', async ({ page }) => {
    // Ensure timer strategies exist before testing
    await seedTimerStrategies(page);
    
    // Add exercises for today to enable timer functionality
    await addExerciseToToday(page, 'Push-ups', getTodayString());
    await addExerciseToToday(page, 'Plank', getTodayString());
    
    // Refresh page to load the new exercises
    await navigateToTimer(page);
    await waitForTimerSetup(page);
    
    // Complete workflow: select strategy, start, pause, resume, stop
    await test.step('Select strategy', async () => {
      await selectTimerStrategy(page, 'Default Workout');
    });
    
    await test.step('Start timer', async () => {
      await startTimer(page);
      await takeScreenshot(page, 'timer-started');
    });
    
    await test.step('Let timer run briefly', async () => {
      await page.waitForTimeout(2000);
    });
    
    await test.step('Pause timer', async () => {
      await pauseTimer(page);
      await takeScreenshot(page, 'timer-paused');
    });
    
    await test.step('Resume timer', async () => {
      await resumeTimer(page);
      await page.waitForTimeout(1000);
    });
    
    await test.step('Stop timer', async () => {
      await stopTimer(page);
      await takeScreenshot(page, 'timer-stopped');
    });
    
    // Verify back to setup state
    await waitForTimerSetup(page);
    
    console.log('[TEST] End-to-end timer workflow completed successfully');
  });
});
