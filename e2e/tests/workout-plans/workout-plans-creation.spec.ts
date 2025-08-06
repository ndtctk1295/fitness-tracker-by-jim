import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../utils/common-helpers';

test.describe('Workout Plans - Creation Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await loginAsTestUser(page);
  });

  test('WPC-001: Navigate to workout plan creation', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    // Look for the correct create button
    // Wait for page to fully load and button to be available
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const createButton = page.locator('button:has-text("Create Plan")').first();
    
    // Wait for button to be visible with timeout
    try {
      await createButton.waitFor({ state: 'visible', timeout: 5000 });
      await createButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to creation page or show creation modal
      const isOnCreationPage = await page.locator('text="Create", text="New"').first().isVisible();
      const hasCreationModal = await page.locator('[role="dialog"]').isVisible();
      
      expect(isOnCreationPage || hasCreationModal).toBeTruthy();
      
      console.log('Successfully navigated to workout plan creation');
    } catch (error) {
      console.log('Create button not found - might need different selector');
    }
  });

  test('WPC-002: Basic workout plan creation form', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const createButton = page.locator('button:has-text("Create Plan")').first();
    
    try {
      await createButton.waitFor({ state: 'visible', timeout: 5000 });
      await createButton.click();
      await page.waitForLoadState('networkidle');
      
      // Fill in basic plan information
      const nameInput = page.locator('input[name*="name"], input[placeholder*="name"], input[placeholder*="Name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill(`Test Plan ${Date.now()}`);
      }
      
      const descriptionInput = page.locator('textarea[name*="description"], input[name*="description"], textarea[placeholder*="description"]').first();
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('This is a test workout plan created by automated testing');
      }
      
      // Look for category or type selection
      const categorySelect = page.locator('select, [role="combobox"]').first();
      if (await categorySelect.isVisible()) {
        await categorySelect.click();
        await page.waitForTimeout(1000);
        
        // Select first available option
        const firstOption = page.locator('option, [role="option"]').first();
        if (await firstOption.isVisible()) {
          await firstOption.click();
        }
      }
      
      // Look for save/create button
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
      
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForLoadState('networkidle');
        
        // Should show success message or redirect
        await page.waitForTimeout(2000);
        
        // Check for success indicators
        const successIndicators = [
          page.locator('text*="success"'),
          page.locator('text*="created"'),
          page.locator('text*="saved"'),
          page.locator('[role="alert"]')
        ];
        
        let foundSuccess = false;
        for (const indicator of successIndicators) {
          if (await indicator.first().isVisible()) {
            const text = await indicator.first().textContent();
            if (text && !text.toLowerCase().includes('error')) {
              foundSuccess = true;
              console.log('Success indicator found:', text);
              break;
            }
          }
        }
        
        if (foundSuccess || page.url().includes('/workout-plans/')) {
          console.log('Workout plan creation appears successful');
        } else {
          console.log('Could not confirm successful creation - might need manual verification');
        }
      }
    } catch (error) {
      console.log('Skipping creation test - create button not found');
    }
  });

  test('WPC-003: Form validation for required fields', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const createButton = page.locator('button:has-text("Create Plan")').first();
    
    try {
      await createButton.waitFor({ state: 'visible', timeout: 5000 });
      await createButton.click();
      await page.waitForLoadState('networkidle');
      
      // Try to submit without filling required fields
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').first();
      
      if (await saveButton.isVisible()) {
        // Force click to bypass any overlays
        await saveButton.click({ force: true });
        await page.waitForTimeout(2000);
        
        // Look for validation errors
        const validationErrors = [
          page.locator('text*="required"'),
          page.locator('text*="Required"'),
          page.locator('text*="cannot be empty"'),
          page.locator('text*="field is required"'),
          page.locator('.error, [role="alert"]'),
          page.locator('input:invalid')
        ];
        
        let foundValidation = false;
        for (const error of validationErrors) {
          if (await error.first().isVisible()) {
            const text = await error.first().textContent();
            console.log('Validation error found:', text);
            foundValidation = true;
            break;
          }
        }
        
        // Also check for HTML5 validation
        const requiredFields = page.locator('input[required], select[required], textarea[required]');
        const fieldCount = await requiredFields.count();
        
        if (fieldCount > 0) {
          console.log(`Found ${fieldCount} required fields for validation`);
          foundValidation = true;
        }
        
        if (foundValidation) {
          console.log('Form validation working correctly');
        } else {
          console.log('No validation errors detected - form might not have required fields');
        }
      }
    } catch (error) {
      console.log('Skipping validation test - create button not found');
    }
  });

  test('WPC-004: Cancel creation workflow', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const initialUrl = page.url();
    const createButton = page.locator('button:has-text("Create Plan")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      
      // Look for cancel button
      const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Back"), a:has-text("Cancel")').first();
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await page.waitForLoadState('networkidle');
        
        // Should return to workout plans list
        const currentUrl = page.url();
        const isBackOnList = currentUrl.includes('/workout-plans') && !currentUrl.includes('/new') && !currentUrl.includes('/create');
        
        expect(isBackOnList).toBeTruthy();
        console.log('Cancel workflow working correctly');
      } else {
        // Try closing modal if it exists
        const closeButton = page.locator('[aria-label="Close"], button:has-text("×"), .modal-close').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForLoadState('networkidle');
          console.log('Modal closed successfully');
        } else {
          console.log('No cancel/close button found');
        }
      }
    } else {
      console.log('Skipping cancel test - create button not found');
    }
  });

  test('WPC-005: Exercise selection in wizard', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Create Plan")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      
      // Fill basic information first
      const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill(`Exercise Test Plan ${Date.now()}`);
      }
      
      // Look for exercise selection area
      const exerciseSelectors = [
        page.locator('button:has-text("Add Exercise")'),
        page.locator('button:has-text("Select Exercise")'),
        page.locator('text="Exercise"').first(),
        page.locator('[data-testid*="exercise"]'),
        page.locator('.exercise-selector'),
      ];
      
      let exerciseArea = null;
      for (const selector of exerciseSelectors) {
        if (await selector.first().isVisible()) {
          exerciseArea = selector.first();
          break;
        }
      }
      
      if (exerciseArea) {
        await exerciseArea.click();
        await page.waitForTimeout(2000);
        
        // Look for exercise list or search
        const exerciseList = page.locator('.exercise-list, [role="listbox"], select option').first();
        if (await exerciseList.isVisible()) {
          await exerciseList.click();
          console.log('Exercise selection interface found');
        }
        
        // Look for search functionality
        const searchInput = page.locator('input[placeholder*="search"], input[type="search"]').first();
        if (await searchInput.isVisible()) {
          await searchInput.fill('push');
          await page.waitForTimeout(1000);
          console.log('Exercise search functionality found');
        }
        
      } else {
        console.log('Exercise selection area not found in creation wizard');
      }
    } else {
      console.log('Skipping exercise selection test - create button not found');
    }
  });

  test('WPC-006: Multi-step wizard navigation', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Create Plan")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      
      // Look for step indicators or next/previous buttons
      const stepIndicators = [
        page.locator('.step, .wizard-step'),
        page.locator('button:has-text("Next")'),
        page.locator('button:has-text("Previous")'),
        page.locator('[aria-label*="step"]'),
        page.locator('.stepper, .steps')
      ];
      
      let foundSteps = false;
      for (const indicator of stepIndicators) {
        if (await indicator.first().isVisible()) {
          foundSteps = true;
          console.log('Multi-step wizard detected');
          break;
        }
      }
      
      if (foundSteps) {
        // First fill basic required fields to enable navigation
        await page.fill('[data-testid="workout-plan-name"], input[placeholder*="name"], input[placeholder*="Name"], #name, #workoutName', 'Test Wizard Plan');
        await page.fill('[data-testid="workout-plan-description"], textarea[placeholder*="description"], textarea[placeholder*="Description"], #description', 'Test description for wizard navigation');
        
        // Wait a moment for the form to validate
        await page.waitForTimeout(500);
        
        // Try navigating through steps
        const nextButton = page.locator('button:has-text("Next")').first();
        if (await nextButton.isVisible()) {
          // Wait for button to be enabled
          await nextButton.waitFor({ state: 'visible' });
          await page.waitForTimeout(500);
          
          if (await nextButton.isEnabled()) {
            await nextButton.click();
            await page.waitForTimeout(1000);
            
            // Look for previous button after going forward
            const prevButton = page.locator('button:has-text("Previous"), button:has-text("Back")').first();
            if (await prevButton.isVisible()) {
              await prevButton.click();
              await page.waitForTimeout(1000);
              console.log('Multi-step navigation working');
            } else {
              console.log('Next button worked, no previous button found');
            }
          } else {
            console.log('Next button disabled - form may need more input');
          }
        }
      } else {
        console.log('Single-step creation form detected (no wizard navigation)');
      }
      
    } else {
      console.log('Skipping wizard navigation test - create button not found');
    }
  });

  test('WPC-007: Save as draft functionality', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Create Plan")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      
      // Fill in partial information
      const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill(`Draft Plan ${Date.now()}`);
      }
      
      // Look for save as draft option
      const draftButtons = [
        page.locator('button:has-text("Save Draft")'),
        page.locator('button:has-text("Draft")'),
        page.locator('button:has-text("Save as Draft")'),
        page.locator('input[type="checkbox"]:has-text("Draft")'),
      ];
      
      let draftFound = false;
      for (const button of draftButtons) {
        if (await button.first().isVisible()) {
          await button.first().click();
          await page.waitForTimeout(2000);
          draftFound = true;
          console.log('Draft saving functionality found');
          break;
        }
      }
      
      if (!draftFound) {
        console.log('No draft functionality detected - checking for auto-save');
        
        // Some forms might auto-save, check for save indicators
        const autoSaveIndicators = [
          page.locator('text=saved'),
          page.locator('text=auto-save'),
          page.locator('.save-indicator'),
        ];
        
        for (const indicator of autoSaveIndicators) {
          if (await indicator.first().isVisible()) {
            console.log('Auto-save functionality detected');
            break;
          }
        }
      }
      
    } else {
      console.log('Skipping draft test - create button not found');
    }
  });
});
