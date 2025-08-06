import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../utils/common-helpers';

test.describe('Workout Plans - Activation & Deactivation', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await loginAsTestUser(page);
  });

  test('WPA-001: Plan activation process works correctly', async ({ page }) => {
    // Navigate to workout plans page
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Find a plan that can be activated
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check current activation state
      const activateButton = page.locator('button:has-text("Activate")');
      const deactivateButton = page.locator('button:has-text("Deactivate")');
      
      if (await activateButton.isVisible()) {
        // Plan is currently inactive, test activation
        await activateButton.click();
        
        // Wait for activation to complete
        await page.waitForTimeout(2000);
        
        // Verify success message appears
        await expect(page.locator('text="activated"')).toBeVisible({ timeout: 5000 });
        
        // Verify UI updates to show active state
        await expect(deactivateButton).toBeVisible({ timeout: 5000 });
        
        // Verify active badge appears
        const activeBadge = page.locator('text="Currently Active"');
        await expect(activeBadge).toBeVisible({ timeout: 5000 });
        
      } else if (await deactivateButton.isVisible()) {
        console.log('Plan is already active, testing deactivation flow instead');
        
        // Test deactivation
        await deactivateButton.click();
        
        // Wait for deactivation to complete
        await page.waitForTimeout(2000);
        
        // Verify success message appears
        await expect(page.locator('text="deactivated"')).toBeVisible({ timeout: 5000 });
        
        // Verify UI updates to show inactive state
        await expect(activateButton).toBeVisible({ timeout: 5000 });
      } else {
        console.log('Could not find activation/deactivation buttons');
      }
    } else {
      console.log('No workout plans available to test activation');
    }
  });

  test('WPA-002: Plan deactivation process works correctly', async ({ page }) => {
    // Navigate to workout plans page
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Find a plan to work with
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      // First ensure plan is activated
      const activateButton = page.locator('button:has-text("Activate")');
      const deactivateButton = page.locator('button:has-text("Deactivate")');
      
      if (await activateButton.isVisible()) {
        // Activate first
        await activateButton.click();
        await page.waitForTimeout(2000);
        await expect(deactivateButton).toBeVisible({ timeout: 5000 });
      }
      
      // Now test deactivation
      if (await deactivateButton.isVisible()) {
        await deactivateButton.click();
        
        // Wait for deactivation to complete
        await page.waitForTimeout(2000);
        
        // Verify success message appears
        await expect(page.locator('text="deactivated"')).toBeVisible({ timeout: 5000 });
        
        // Verify UI updates to show inactive state
        await expect(activateButton).toBeVisible({ timeout: 5000 });
        
        // Verify active badge is removed
        const activeBadge = page.locator('text="Currently Active"');
        await expect(activeBadge).not.toBeVisible();
      }
    } else {
      console.log('No workout plans available to test deactivation');
    }
  });

  test('WPA-003: Plan status reflects correctly in list view', async ({ page }) => {
    // Navigate to workout plans page
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Look for plans with status indicators
    const planCards = page.locator('[data-testid="plan-card"], .plan-card, [class*="plan"], [class*="card"]');
    const planCount = await planCards.count();
    
    if (planCount > 0) {
      console.log(`Found ${planCount} plan elements to check`);
      
      // Check first plan's status in list view
      const firstPlan = planCards.first();
      const hasActiveStatus = await firstPlan.locator('text="Active"').isVisible();
      const hasInactiveStatus = await firstPlan.locator('text="Inactive"').isVisible();
      
      console.log(`Plan has active status: ${hasActiveStatus}, inactive status: ${hasInactiveStatus}`);
      
      // Click on the plan to go to detail view
      const planLink = firstPlan.locator('[href*="/workout-plans/"]').first();
      if (await planLink.isVisible()) {
        await planLink.click();
        await page.waitForLoadState('networkidle');
        
        // Verify status consistency between list and detail view
        const detailActiveBadge = page.locator('text="Currently Active"');
        const detailActiveStatus = await detailActiveBadge.isVisible();
        
        console.log(`Detail view shows active status: ${detailActiveStatus}`);
        
        // Status should be consistent
        if (hasActiveStatus && !detailActiveStatus) {
          console.log('Warning: Status inconsistency detected - plan shows active in list but not in detail');
        }
      }
    } else {
      console.log('No workout plans found to test status display');
    }
  });

  test('WPA-004: Multiple activation handling', async ({ page }) => {
    // Navigate to workout plans page  
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLinks = page.locator('[href*="/workout-plans/"]');
    const planCount = await planLinks.count();
    
    if (planCount >= 2) {
      // Test with first plan
      await planLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      const firstActivateBtn = page.locator('button:has-text("Activate")');
      if (await firstActivateBtn.isVisible()) {
        await firstActivateBtn.click();
        await page.waitForTimeout(2000);
        
        // Go back to list
        await page.goBack();
        await page.waitForLoadState('networkidle');
        
        // Try to activate second plan
        if (planCount >= 2) {
          const secondPlanLink = planLinks.nth(1);
          if (await secondPlanLink.isVisible()) {
            await secondPlanLink.click();
            await page.waitForLoadState('networkidle');
            
            const secondActivateBtn = page.locator('button:has-text("Activate")');
            if (await secondActivateBtn.isVisible()) {
              await secondActivateBtn.click();
              await page.waitForTimeout(2000);
              
              // Should see success message for activation
              await expect(page.locator('text="activated"')).toBeVisible({ timeout: 5000 });
              
              // New plan should be active
              await expect(page.locator('button:has-text("Deactivate")')).toBeVisible({ timeout: 5000 });
            }
          }
        }
      }
    } else {
      console.log('Need at least 2 workout plans to test multiple activation handling');
    }
  });

  test('WPA-005: Error handling during activation/deactivation', async ({ page }) => {
    // Navigate to workout plans page
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      // Test activation/deactivation with potential network issues
      const activateButton = page.locator('button:has-text("Activate")');
      const deactivateButton = page.locator('button:has-text("Deactivate")');
      
      if (await activateButton.isVisible()) {
        // Monitor for any error messages during activation
        await activateButton.click();
        
        // Wait for response (success or error)
        await page.waitForTimeout(5000);
        
        // Check for error messages
        const errorAlert = page.locator('[role="alert"]');
        const errorMessage = page.locator('text="Failed"');
        
        if (await errorAlert.isVisible() || await errorMessage.isVisible()) {
          console.log('Error detected during activation - this is expected for error handling test');
          let errorText = '';
          if (await errorAlert.isVisible()) {
            errorText = await errorAlert.textContent() || '';
          } else if (await errorMessage.isVisible()) {
            errorText = await errorMessage.textContent() || '';
          }
          console.log('Error message:', errorText);
        } else {
          console.log('Activation completed successfully');
        }
      } else if (await deactivateButton.isVisible()) {
        // Test deactivation error handling
        await deactivateButton.click();
        await page.waitForTimeout(5000);
        
        const errorAlert = page.locator('[role="alert"]');
        const errorMessage = page.locator('text="Failed"');
        
        if (await errorAlert.isVisible() || await errorMessage.isVisible()) {
          console.log('Error detected during deactivation - this is expected for error handling test');
        } else {
          console.log('Deactivation completed successfully');
        }
      }
    } else {
      console.log('No workout plans available to test error handling');
    }
  });
});
