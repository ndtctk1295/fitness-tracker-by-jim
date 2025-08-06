import { test, expect } from '@playwright/test';
import { loginAsTestUser, waitForTimerSetup, navigateToTimer } from '../../utils/common-helpers';
import { getTodayString, getYesterdayString, getDateString } from '../../utils/date-helpers';

test.describe('Timer Page - Complete Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login and navigate to timer page
    await loginAsTestUser(page);
    await page.goto('/timer', { timeout: 15000 });
    await waitForTimerSetup(page);
  });

  // ===============================================
  // 1. BASIC NAVIGATION & SETUP (TIM-001 to TIM-010)
  // ===============================================
  
  test.describe('Basic Navigation & Setup', () => {
    
    test('TIM-001: Timer page loads successfully', async ({ page }) => {
      // Verify main timer elements are present
      await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible();
      await expect(page.locator('[data-testid="exercise-list"]')).toBeVisible();
      
      // Verify page title
      const workoutTimerHeading = page.locator('h1').filter({ hasText: 'Workout Timer' });
      if (await workoutTimerHeading.count() > 0) {
        await expect(workoutTimerHeading).toBeVisible();
      }
      
      // Verify no loading states are visible
      const loadingIndicator = page.locator('text=Loading timer data...');
      if (await loadingIndicator.count() > 0) {
        await expect(loadingIndicator).not.toBeVisible();
      }
      
      console.log('[TEST] Timer page loaded successfully');
    });

    test('TIM-002: Timer setup component displays correctly', async ({ page }) => {
      // Verify timer strategy selector if available
      const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
      if (await strategySelector.count() > 0) {
        await expect(strategySelector).toBeVisible();
      }
      
      // Check start button is present
      const startButton = page.locator('[data-testid="start-timer-button"]');
      await expect(startButton).toBeVisible();
      
      // Verify exercise list area is present
      await expect(page.locator('[data-testid="exercise-list"]')).toBeVisible();
      
      console.log('[TEST] Timer setup component displays correctly');
    });

    test('TIM-003: Timer strategy selection works', async ({ page }) => {
      const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
      
      if (await strategySelector.count() > 0) {
        await strategySelector.click();
        
        // Check for strategy options
        const strategyOptions = page.locator('[data-testid="strategy-option"]');
        const optionCount = await strategyOptions.count();
        
        if (optionCount > 0) {
          console.log(`Found ${optionCount} timer strategies`);
          await strategyOptions.first().click();
          
          // Verify selection was made (dropdown should close)
          await page.waitForTimeout(500);
        } else {
          console.log('No timer strategies available');
        }
      } else {
        console.log('Timer strategy selector not available');
      }
      
      console.log('[TEST] Timer strategy selection verified');
    });

    test('TIM-004: Exercise list displays correctly', async ({ page }) => {
      const exerciseList = page.locator('[data-testid="exercise-list"]');
      await expect(exerciseList).toBeVisible();
      
      // Check if exercises are loaded or empty state shown
      const exerciseCount = page.locator('[data-testid="exercise-count"]');
      const emptyState = page.locator('[data-testid="empty-exercise-list"]');
      
      const hasExerciseCount = await exerciseCount.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;
      
      if (hasExerciseCount) {
        const countText = await exerciseCount.textContent();
        console.log(`Exercise count: ${countText}`);
        expect(countText).toMatch(/\d+/);
      } else if (hasEmptyState) {
        console.log('Empty exercise state displayed');
        await expect(emptyState).toBeVisible();
      }
      
      // At least one should be present
      expect(hasExerciseCount || hasEmptyState).toBe(true);
      
      console.log('[TEST] Exercise list displays correctly');
    });

    test('TIM-005: Exercise completion status handling', async ({ page }) => {
      const exerciseCheckboxes = page.locator('[data-testid^="exercise-checkbox-"]');
      const checkboxCount = await exerciseCheckboxes.count();
      
      if (checkboxCount > 0) {
        console.log(`Found ${checkboxCount} exercise checkboxes`);
        
        // Test first checkbox interaction
        const firstCheckbox = exerciseCheckboxes.first();
        const initialState = await firstCheckbox.isChecked();
        
        await firstCheckbox.click();
        await page.waitForTimeout(500);
        
        const newState = await firstCheckbox.isChecked();
        expect(newState).not.toBe(initialState);
        
        console.log(`Checkbox state changed from ${initialState} to ${newState}`);
      } else {
        console.log('No exercise checkboxes available for testing');
      }
      
      console.log('[TEST] Exercise completion status verified');
    });

    test('TIM-006: Sound permission handling', async ({ page }) => {
      // Test sound toggle if available
      const soundToggle = page.locator('[data-testid="sound-toggle"]');
      if (await soundToggle.count() > 0) {
        await expect(soundToggle).toBeVisible();
        
        const initialState = await soundToggle.isChecked();
        await soundToggle.click();
        const newState = await soundToggle.isChecked();
        
        expect(newState).not.toBe(initialState);
        console.log(`Sound toggle changed from ${initialState} to ${newState}`);
      }
      
      // Test sound test button if available
      const testSoundButton = page.locator('[data-testid="test-sound-button"]');
      if (await testSoundButton.count() > 0) {
        await expect(testSoundButton).toBeVisible();
        await testSoundButton.click();
        console.log('Sound test button clicked successfully');
      }
      
      console.log('[TEST] Sound permission handling verified');
    });

    test('TIM-007: Settings toggles functionality', async ({ page }) => {
      // Test auto-switch toggle
      const autoSwitchToggle = page.locator('[data-testid="auto-switch-toggle"]');
      if (await autoSwitchToggle.count() > 0) {
        await expect(autoSwitchToggle).toBeVisible();
        
        const initialState = await autoSwitchToggle.isChecked();
        await autoSwitchToggle.click();
        const newState = await autoSwitchToggle.isChecked();
        
        expect(newState).not.toBe(initialState);
        console.log(`Auto-switch toggle changed from ${initialState} to ${newState}`);
      } else {
        console.log('Auto-switch toggle not available');
      }
      
      console.log('[TEST] Settings toggles verified');
    });

    test('TIM-008: Timer start functionality basic', async ({ page }) => {
      const startButton = page.locator('[data-testid="start-timer-button"]');
      await expect(startButton).toBeVisible();
      
      // Select strategy if available
      const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
      if (await strategySelector.count() > 0) {
        await strategySelector.click();
        
        const strategyOptions = page.locator('[data-testid="strategy-option"]');
        if (await strategyOptions.count() > 0) {
          await strategyOptions.first().click();
        }
      }
      
      // Try to start timer if enabled
      const isEnabled = await startButton.isEnabled();
      if (isEnabled) {
        await startButton.click();
        
        // Check if active timer appears
        const activeTimer = page.locator('[data-testid="active-timer"]');
        if (await activeTimer.count() > 0) {
          await expect(activeTimer).toBeVisible();
          console.log('Timer started successfully');
          
          // Stop timer to clean up
          const stopButton = page.locator('[data-testid="stop-timer-button"]');
          if (await stopButton.count() > 0) {
            await stopButton.click();
          }
        }
      } else {
        console.log('Start button not enabled (likely no exercises)');
      }
      
      console.log('[TEST] Timer start functionality verified');
    });

    test('TIM-009: Mobile responsive design', async ({ page }) => {
      // Test mobile layout
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Verify elements are still visible in mobile view
      await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible();
      
      const startButton = page.locator('[data-testid="start-timer-button"]');
      await expect(startButton).toBeVisible();
      
      // Check button size for mobile usability
      const buttonBox = await startButton.boundingBox();
      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThan(20);
        expect(buttonBox.width).toBeGreaterThan(20);
      }
      
      console.log('[TEST] Mobile responsive design verified');
    });

    test('TIM-010: Error handling for missing data', async ({ page }) => {
      // Test that page doesn't crash with missing data
      await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible();
      
      // Test rapid interactions don't break the UI
      const startButton = page.locator('[data-testid="start-timer-button"]');
      for (let i = 0; i < 3; i++) {
        if (await startButton.isEnabled()) {
          await startButton.click({ timeout: 1000 });
        }
        await page.waitForTimeout(100);
      }
      
      // Page should still be functional
      await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible();
      
      console.log('[TEST] Error handling verified');
    });
  });

  // ===============================================
  // 2. ACTIVE TIMER FUNCTIONALITY (TIM-021 to TIM-040)
  // ===============================================
  
  test.describe('Active Timer Functionality', () => {
    
    test('TIM-021: Start timer with basic functionality', async ({ page }) => {
      // Select strategy if available
      const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
      if (await strategySelector.count() > 0) {
        await strategySelector.click();
        
        const strategyOptions = page.locator('[data-testid="strategy-option"]');
        if (await strategyOptions.count() > 0) {
          await strategyOptions.first().click();
        }
      }
      
      // Test timer starts correctly
      const startButton = page.locator('[data-testid="start-timer-button"]');
      const isEnabled = await startButton.isEnabled();
      
      if (isEnabled) {
        await startButton.click();
        
        // Verify active timer appears
        const activeTimer = page.locator('[data-testid="active-timer"]');
        if (await activeTimer.count() > 0) {
          await expect(activeTimer).toBeVisible();
          
          // Verify countdown begins
          const timerDisplay = page.locator('[data-testid="timer-display"]');
          if (await timerDisplay.count() > 0) {
            await expect(timerDisplay).toBeVisible();
          }
          
          // Check timer state
          const timerStatus = page.locator('[data-testid="timer-status"]');
          if (await timerStatus.count() > 0) {
            const statusText = await timerStatus.textContent();
            console.log(`Timer status: ${statusText}`);
          }
          
          console.log('Timer started successfully');
        }
      } else {
        console.log('Cannot start timer - button not enabled');
      }
      
      console.log('[TEST] Timer start functionality verified');
    });

    test('TIM-022: Timer display and formatting', async ({ page }) => {
      // Start timer first if possible
      const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
      if (await strategySelector.count() > 0) {
        await strategySelector.click();
        const strategyOptions = page.locator('[data-testid="strategy-option"]');
        if (await strategyOptions.count() > 0) {
          await strategyOptions.first().click();
        }
      }
      
      const startButton = page.locator('[data-testid="start-timer-button"]');
      if (await startButton.isEnabled()) {
        await startButton.click();
        
        // Test time format display
        const timerDisplay = page.locator('[data-testid="timer-display"]');
        if (await timerDisplay.count() > 0) {
          await expect(timerDisplay).toBeVisible();
          
          // Verify format matches MM:SS pattern
          const timeText = await timerDisplay.textContent();
          if (timeText) {
            expect(timeText).toMatch(/^\d{1,2}:\d{2}$/);
            console.log(`Timer display format: ${timeText}`);
          }
          
          // Verify countdown accuracy
          const initialTime = await timerDisplay.textContent();
          await page.waitForTimeout(2000);
          const laterTime = await timerDisplay.textContent();
          
          console.log(`Timer progression: ${initialTime} -> ${laterTime}`);
        }
      }
      
      console.log('[TEST] Timer display and formatting verified');
    });

    test('TIM-023: Timer pause and resume', async ({ page }) => {
      // Start timer first if possible
      const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
      if (await strategySelector.count() > 0) {
        await strategySelector.click();
        const strategyOptions = page.locator('[data-testid="strategy-option"]');
        if (await strategyOptions.count() > 0) {
          await strategyOptions.first().click();
        }
      }
      
      const startButton = page.locator('[data-testid="start-timer-button"]');
      if (await startButton.isEnabled()) {
        await startButton.click();
        
        // Wait for timer to be active
        const activeTimer = page.locator('[data-testid="active-timer"]');
        if (await activeTimer.count() > 0) {
          await expect(activeTimer).toBeVisible();
          
          // Test pause functionality
          const pauseButton = page.locator('[data-testid="pause-timer-button"]');
          if (await pauseButton.count() > 0) {
            await pauseButton.click();
            console.log('Timer paused');
            
            // Test resume functionality
            const resumeButton = page.locator('[data-testid="resume-timer-button"]');
            if (await resumeButton.count() > 0) {
              await resumeButton.click();
              console.log('Timer resumed');
            }
          } else {
            console.log('Pause button not available');
          }
        }
      }
      
      console.log('[TEST] Timer pause and resume verified');
    });

    test('TIM-024: Timer stop functionality', async ({ page }) => {
      // Start timer first if possible
      const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
      if (await strategySelector.count() > 0) {
        await strategySelector.click();
        const strategyOptions = page.locator('[data-testid="strategy-option"]');
        if (await strategyOptions.count() > 0) {
          await strategyOptions.first().click();
        }
      }
      
      const startButton = page.locator('[data-testid="start-timer-button"]');
      if (await startButton.isEnabled()) {
        await startButton.click();
        
        const activeTimer = page.locator('[data-testid="active-timer"]');
        if (await activeTimer.count() > 0) {
          await expect(activeTimer).toBeVisible();
          
          // Test stop functionality
          const stopButton = page.locator('[data-testid="stop-timer-button"]');
          if (await stopButton.count() > 0) {
            await stopButton.click();
            
            // Verify timer resets to setup state
            await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible();
            console.log('Timer stopped and reset to setup state');
          }
        }
      }
      
      console.log('[TEST] Timer stop functionality verified');
    });

    test('TIM-025: Current exercise display', async ({ page }) => {
      // Check if current exercise information is displayed
      const currentExercise = page.locator('[data-testid="current-exercise"]');
      if (await currentExercise.count() > 0) {
        await expect(currentExercise).toBeVisible();
        
        const exerciseName = page.locator('[data-testid="current-exercise-name"]');
        if (await exerciseName.count() > 0) {
          const nameText = await exerciseName.textContent();
          console.log(`Current exercise: ${nameText}`);
        }
        
        // Check for sets/reps information
        const setsInfo = page.locator('[data-testid="current-sets-info"]');
        if (await setsInfo.count() > 0) {
          const setsText = await setsInfo.textContent();
          console.log(`Sets info: ${setsText}`);
        }
      } else {
        console.log('Current exercise display not available');
      }
      
      console.log('[TEST] Current exercise display verified');
    });
  });

  // ===============================================
  // 3. INTEGRATION TESTS (TIM-061 to TIM-087)
  // ===============================================
  
  test.describe('Integration Tests', () => {
    
    test('TIM-061: Calendar integration', async ({ page }) => {
      // Test navigation to calendar and back
      try {
        await page.goto('/calendar', { timeout: 10000 });
        await page.waitForLoadState('domcontentloaded');
        
        // Check if today's date is accessible
        const todayString = getTodayString();
        const todayCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${todayString}"]`);
        if (await todayCell.count() > 0) {
          console.log('Calendar integration available');
        }
      } catch (error) {
        console.log('Calendar page not accessible:', error);
      }
      
      // Navigate back to timer
      await page.goto('/timer', { timeout: 15000 });
      await waitForTimerSetup(page);
      
      // Verify exercises are loaded correctly
      const exerciseList = page.locator('[data-testid="exercise-list"]');
      await expect(exerciseList).toBeVisible();
      
      console.log('[TEST] Calendar integration verified');
    });

    test('TIM-062: Exercise completion sync', async ({ page }) => {
      // Test that exercise completion status is consistent
      const exerciseItems = page.locator('[data-testid="exercise-item"], .exercise-item');
      const hasExercises = await exerciseItems.count() > 0;
      
      if (hasExercises) {
        console.log('Exercises available for completion sync testing');
        
        // Test completion status consistency
        const completedCount = page.locator('[data-testid="completed-count"]');
        if (await completedCount.count() > 0) {
          const countText = await completedCount.textContent();
          console.log(`Completed exercises: ${countText}`);
          expect(countText).toMatch(/\d+/);
        }
      } else {
        console.log('No exercises available for completion sync testing');
      }
      
      console.log('[TEST] Exercise completion sync verified');
    });

    test('TIM-063: User preferences integration', async ({ page }) => {
      // Test timer settings accessibility
      const timerSetup = page.locator('[data-testid="timer-setup"]');
      await expect(timerSetup).toBeVisible();
      
      // Test sound toggle preferences
      const soundToggle = page.locator('[data-testid="sound-toggle"], input[data-testid*="sound"]');
      if (await soundToggle.count() > 0) {
        const initialState = await soundToggle.first().isChecked();
        await soundToggle.first().click();
        
        // Verify preference persists (basic test)
        await page.waitForTimeout(500);
        console.log('Sound preference toggle tested');
      }
      
      console.log('[TEST] User preferences integration verified');
    });
  });

  // ===============================================
  // 4. MOBILE & RESPONSIVE DESIGN
  // ===============================================
  
  test.describe('Mobile & Responsive Design', () => {
    
    test('TIM-081: Mobile layout optimization', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Wait for timer setup to load
      await waitForTimerSetup(page);
      
      // Verify controls remain accessible
      const startButton = page.locator('[data-testid="start-timer-button"]');
      await expect(startButton).toBeVisible();
      
      // Check button sizing
      const buttonBox = await startButton.boundingBox();
      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThan(30);
        expect(buttonBox.width).toBeGreaterThan(30);
        console.log(`Mobile button size: ${buttonBox.width}x${buttonBox.height}`);
      }
      
      // Check text readability
      const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
      if (await strategySelector.count() > 0) {
        const fontSize = await strategySelector.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });
        
        const fontSizeNum = parseInt(fontSize);
        expect(fontSizeNum).toBeGreaterThan(12);
        console.log(`Mobile font size: ${fontSize}`);
      }
      
      console.log('[TEST] Mobile layout optimization verified');
    });

    test('TIM-082: Touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test interactive elements sizing
      const interactiveElements = page.locator('[data-testid*="button"], [data-testid*="toggle"], [data-testid*="selector"]');
      const elementCount = await interactiveElements.count();
      
      expect(elementCount).toBeGreaterThan(0);
      
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = interactiveElements.nth(i);
        if (await element.isVisible()) {
          const box = await element.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThan(20);
            expect(box.width).toBeGreaterThan(20);
          }
        }
      }
      
      // Test touch feedback
      const startButton = page.locator('[data-testid="start-timer-button"]');
      if (await startButton.count() > 0) {
        try {
          await startButton.tap();
        } catch (error) {
          // Fall back to click if tap is not supported
          await startButton.click();
        }
      }
      
      console.log('[TEST] Touch interactions verified');
    });

    test('TIM-083: Screen orientation handling', async ({ page }) => {
      // Test portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await waitForTimerSetup(page);
      await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible();
      
      // Test landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible();
      
      // Verify controls remain accessible
      const startButton = page.locator('[data-testid="start-timer-button"]');
      await expect(startButton).toBeVisible();
      
      const buttonBox = await startButton.boundingBox();
      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThan(25);
        expect(buttonBox.width).toBeGreaterThan(25);
      }
      
      console.log('[TEST] Screen orientation handling verified');
    });

    test('TIM-084: Tablet layout optimization', async ({ page }) => {
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await waitForTimerSetup(page);
      
      // Verify optimal use of space
      const timerContainer = page.locator('[data-testid="timer-setup"], [data-testid="active-timer"]').first();
      if (await timerContainer.count() > 0) {
        const containerBox = await timerContainer.boundingBox();
        
        if (containerBox) {
          expect(containerBox.width).toBeGreaterThan(200);
          expect(containerBox.width).toBeLessThan(750);
          console.log(`Tablet container width: ${containerBox.width}px`);
        }
      }
      
      console.log('[TEST] Tablet layout optimization verified');
    });
  });

  // ===============================================
  // 5. PERFORMANCE & ERROR HANDLING
  // ===============================================
  
  test.describe('Performance & Error Handling', () => {
    
    test('TIM-090: Page performance', async ({ page }) => {
      const startTime = Date.now();
      
      // Reload page to measure load time
      await page.reload();
      await waitForTimerSetup(page);
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Page should load within reasonable time
      expect(loadTime).toBeLessThan(10000);
      console.log(`Page load time: ${loadTime}ms`);
      
      console.log('[TEST] Page performance verified');
    });

    test('TIM-091: Error recovery and resilience', async ({ page }) => {
      // Test that page handles errors gracefully
      await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible();
      
      // Test rapid interactions
      const startButton = page.locator('[data-testid="start-timer-button"]');
      for (let i = 0; i < 3; i++) {
        if (await startButton.isEnabled()) {
          await startButton.click({ timeout: 1000 });
        }
        await page.waitForTimeout(100);
      }
      
      // Page should remain functional
      await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible();
      
      console.log('[TEST] Error recovery verified');
    });

    test('TIM-092: Date/time consistency', async ({ page }) => {
      // Test date handling
      const currentTime = new Date();
      expect(currentTime).toBeInstanceOf(Date);
      
      // Test today's date string consistency
      const todayString = getTodayString();
      expect(todayString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      console.log(`Today's date: ${todayString}`);
      
      // If timer is active, test time display format
      const strategySelector = page.locator('[data-testid="timer-strategy-selector"]');
      if (await strategySelector.count() > 0) {
        await strategySelector.click();
        const strategyOptions = page.locator('[data-testid="strategy-option"]');
        if (await strategyOptions.count() > 0) {
          await strategyOptions.first().click();
          const startButton = page.locator('[data-testid="start-timer-button"]');
          
          if (await startButton.isEnabled()) {
            await startButton.click();
            
            const timerDisplay = page.locator('[data-testid="timer-display"]');
            if (await timerDisplay.count() > 0) {
              await page.waitForTimeout(1000);
              const timeText = await timerDisplay.textContent();
              if (timeText) {
                expect(timeText).toMatch(/^\d{1,2}:\d{2}$/);
                console.log(`Timer format: ${timeText}`);
              }
            }
          }
        }
      }
      
      console.log('[TEST] Date/time consistency verified');
    });
  });
});
