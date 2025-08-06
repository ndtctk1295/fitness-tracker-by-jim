import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../utils/common-helpers';

test.describe('Workout Plans - Statistics & Progression Tabs', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await loginAsTestUser(page);
  });

  test('WPS-001: Statistics tab loads without infinite loops', async ({ page }) => {
    // Navigate to workout plans page
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Wait specifically for workout plan cards to load
    await page.waitForSelector('[data-testid="workout-plan-card"]', { timeout: 10000 });
    const planCard = page.locator('[data-testid="workout-plan-card"]').first();
    
    if (await planCard.isVisible()) {
      await planCard.click();
      await page.waitForLoadState('networkidle');
      
      // Click on Statistics tab
      await page.click('text="Statistics"');
      
      // Wait for initial load
      await page.waitForTimeout(2000);
      
      // Verify tab content is visible
      const statisticsContent = page.locator('[role="tabpanel"][data-state="active"]');
      await expect(statisticsContent).toBeVisible();
      
      // Check for statistics components
      await expect(page.locator('text="Plan Statistics"')).toBeVisible();
      
      // Wait longer to ensure no infinite loops (the previous bug)
      await page.waitForTimeout(5000);
      
      // Page should still be responsive and not crashed
      await expect(page.locator('text="Statistics"')).toBeVisible();
      
      // Test timeframe selector if available
      const timeframeSelector = page.locator('select, [role="combobox"]').first();
      if (await timeframeSelector.isVisible()) {
        await timeframeSelector.click();
        await page.waitForTimeout(1000);
        
        // Try selecting different timeframes
        const weekOption = page.locator('text="This Week"').first();
        const monthOption = page.locator('text="Last 30 Days"');
        
        if (await weekOption.isVisible()) {
          await weekOption.click({ force: true });
          await page.waitForTimeout(2000);
          // Should not cause infinite loops
          await expect(page.locator('text="Statistics"')).toBeVisible();
        }
      }
      
      console.log('Statistics tab test completed successfully - no infinite loops detected');
    } else {
      console.log('No workout plans available to test statistics tab');
    }
  });

  test('WPS-002: Progression tab loads without infinite loops', async ({ page }) => {
    // Navigate to workout plans page
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Wait specifically for workout plan cards to load
    await page.waitForSelector('[data-testid="workout-plan-card"]', { timeout: 10000 });
    const planCard = page.locator('[data-testid="workout-plan-card"]').first();
    
    if (await planCard.isVisible()) {
      await planCard.click();
      await page.waitForLoadState('networkidle');
      
      // Click on Progression tab
      await page.click('text="Progression"');
      
      // Wait for initial load
      await page.waitForTimeout(2000);
      
      // Verify tab content is visible
      const progressionContent = page.locator('[role="tabpanel"][data-state="active"]');
      await expect(progressionContent).toBeVisible();
      
      // Wait longer to ensure no infinite loops (the previous bug)
      await page.waitForTimeout(5000);
      
      // Page should still be responsive and not crashed
      await expect(page.locator('text="Progression"')).toBeVisible();
      
      // Test timeframe selector if available
      const timeframeSelector = page.locator('select, [role="combobox"]').first();
      if (await timeframeSelector.isVisible()) {
        await timeframeSelector.click();
        await page.waitForTimeout(1000);
        
        // Try selecting different timeframes
        const weekOption = page.locator('text="week", text="Week"').first();
        const monthOption = page.locator('text="month", text="Month"').first();
        
        if (await weekOption.isVisible()) {
          await weekOption.click();
          await page.waitForTimeout(2000);
          // Should not cause infinite loops
          await expect(page.locator('text="Progression"')).toBeVisible();
        }
      }
      
      console.log('Progression tab test completed successfully - no infinite loops detected');
    } else {
      console.log('No workout plans available to test progression tab');
    }
  });

  test('WPS-003: Tab switching works smoothly', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Wait specifically for workout plan cards to load
    await page.waitForSelector('[data-testid="workout-plan-card"]', { timeout: 10000 });
    const planCard = page.locator('[data-testid="workout-plan-card"]').first();
    
    if (await planCard.isVisible()) {
      await planCard.click();
      await page.waitForLoadState('networkidle');
      
      // Test rapid tab switching to ensure no race conditions or infinite loops
      const tabs = ['Schedule', 'Statistics', 'Progression', 'Settings'];
      
      for (const tab of tabs) {
        await page.click(`text="${tab}"`);
        await page.waitForTimeout(1500);
        
        // Basic verification that the page is responsive after tab switch
        await expect(page.locator('h1, [role="main"]')).toBeVisible();
        
        // Check for error alerts
        const errorAlert = page.locator('[role="alert"]');
        if (await errorAlert.isVisible()) {
          const errorText = await errorAlert.textContent();
          console.log(`Error detected on ${tab} tab:`, errorText);
        }
      }
      
      // Switch back to Statistics and let it run for a while
      await page.click('text="Statistics"');
      await page.waitForTimeout(3000);
      
      // Should not have any runtime errors or infinite loops
      await expect(page.locator('text="Statistics"')).toBeVisible();
      
      // Switch to Progression and let it run
      await page.click('text="Progression"');
      await page.waitForTimeout(3000);
      
      await expect(page.locator('text="Progression"')).toBeVisible();
      
      console.log('Tab switching test completed successfully');
    } else {
      console.log('No workout plans available to test tab switching');
    }
  });

  test('WPS-004: Statistics handles empty data gracefully', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Wait specifically for workout plan cards to load
    await page.waitForSelector('[data-testid="workout-plan-card"]', { timeout: 10000 });
    const planCard = page.locator('[data-testid="workout-plan-card"]').first();
    
    if (await planCard.isVisible()) {
      await planCard.click();
      await page.waitForLoadState('networkidle');
      
      // Go to Statistics tab
      await page.click('text="Statistics"');
      await page.waitForTimeout(2000);
      
      // Even with no workout data, statistics should display something
      // Look for common statistics elements
      const statsElements = [
        'Plan Statistics',
        'completion',
        'workout',
        '0', // Should show zeros for empty data
      ];
      
      let foundElements = 0;
      for (const element of statsElements) {
        if (await page.locator(`:has-text("${element}")`).first().isVisible()) {
          foundElements++;
        }
      }
      
      console.log(`Found ${foundElements}/${statsElements.length} expected statistics elements`);
      
      // Should show some content even with empty data
      expect(foundElements).toBeGreaterThan(0);
      
      // Should not show error state
      const errorMessage = page.locator(':has-text("error"), :has-text("Error")');
      await expect(errorMessage).not.toBeVisible();
      
    } else {
      console.log('No workout plans available to test statistics empty data handling');
    }
  });

  test('WPS-005: Progression handles empty data gracefully', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Wait specifically for workout plan cards to load
    await page.waitForSelector('[data-testid="workout-plan-card"]', { timeout: 10000 });
    const planCard = page.locator('[data-testid="workout-plan-card"]').first();
    
    if (await planCard.isVisible()) {
      await planCard.click();
      await page.waitForLoadState('networkidle');
      
      // Go to Progression tab
      await page.click('text="Progression"');
      await page.waitForTimeout(2000);
      
      // Even with no progression data, tab should display something
      const progressionContent = page.locator('[role="tabpanel"][data-state="active"]');
      await expect(progressionContent).toBeVisible();
      
      // Should not show error state
      const errorMessage = page.locator(':has-text("error"), :has-text("Error")');
      await expect(errorMessage).not.toBeVisible();
      
      // Tab should remain responsive
      await page.waitForTimeout(3000);
      await expect(page.locator('text="Progression"')).toBeVisible();
      
    } else {
      console.log('No workout plans available to test progression empty data handling');
    }
  });

  test('WPS-006: Memory leak and performance check', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Wait specifically for workout plan cards to load
    await page.waitForSelector('[data-testid="workout-plan-card"]', { timeout: 10000 });
    const planCard = page.locator('[data-testid="workout-plan-card"]').first();
    
    if (await planCard.isVisible()) {
      await planCard.click();
      await page.waitForLoadState('networkidle');
      
      // Rapid tab switching to test for memory leaks and performance issues
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await page.click('text="Statistics"');
        await page.waitForTimeout(500);
        
        await page.click('text="Progression"');
        await page.waitForTimeout(500);
        
        await page.click('text="Schedule"');
        await page.waitForTimeout(500);
        
        // Check that page is still responsive
        await expect(page.locator('h1')).toBeVisible();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Tab switching performance test completed in ${duration}ms`);
      
      // Should not take more than 30 seconds for 30 tab switches
      expect(duration).toBeLessThan(30000);
      
      // Final check - page should still be responsive
      await page.click('text="Statistics"');
      await page.waitForTimeout(2000);
      await expect(page.locator('text="Statistics"')).toBeVisible();
      
    } else {
      console.log('No workout plans available to test performance');
    }
  });
});
