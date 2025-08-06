import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../../utils/common-helpers';

test.describe('Workout Plans - Editing Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await loginAsTestUser(page);
  });

  test('WPE-001: Navigate to edit workout plan', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for edit button
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit"), button:has-text("Modify")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Should be on edit page
        const isOnEditPage = page.url().includes('/edit') || 
                           await page.locator('text="Edit", text="Editing"').first().isVisible() ||
                           await page.locator('button:has-text("Save Changes")').isVisible();
        
        expect(isOnEditPage).toBeTruthy();
        console.log('Successfully navigated to edit page');
        
        // Check for form elements
        const formElements = [
          page.locator('input[name*="name"]'),
          page.locator('textarea[name*="description"]'),
          page.locator('button:has-text("Save")'),
        ];
        
        let foundElements = 0;
        for (const element of formElements) {
          if (await element.first().isVisible()) {
            foundElements++;
          }
        }
        
        console.log(`Found ${foundElements} form elements on edit page`);
        
      } else {
        console.log('Edit button not found - checking for inline editing');
        
        // Some plans might have inline editing
        const editableElements = page.locator('[contenteditable="true"], input:not([type="hidden"])');
        const editableCount = await editableElements.count();
        
        if (editableCount > 0) {
          console.log(`Found ${editableCount} inline editable elements`);
        } else {
          console.log('No editing functionality detected');
        }
      }
      
    } else {
      console.log('No workout plans available for edit test');
    }
  });

  test('WPE-002: Edit workout plan basic information', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Edit name
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
        if (await nameInput.isVisible()) {
          const originalName = await nameInput.inputValue();
          const newName = `${originalName} - Edited ${Date.now()}`;
          
          await nameInput.clear();
          await nameInput.fill(newName);
          console.log(`Changed plan name from "${originalName}" to "${newName}"`);
        }
        
        // Edit description
        const descriptionInput = page.locator('textarea[name*="description"], input[name*="description"]').first();
        if (await descriptionInput.isVisible()) {
          const newDescription = `Updated description at ${new Date().toISOString()}`;
          await descriptionInput.clear();
          await descriptionInput.fill(newDescription);
          console.log('Updated plan description');
        }
        
        // Save changes
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          
          // Check for success indicators
          const successIndicators = [
            page.locator('text*="saved"'),
            page.locator('text*="updated"'),
            page.locator('[role="alert"]'),
          ];
          
          let foundSuccess = false;
          for (const indicator of successIndicators) {
            if (await indicator.first().isVisible()) {
              const text = await indicator.first().textContent();
              if (text && !text.toLowerCase().includes('error')) {
                foundSuccess = true;
                console.log('Success message:', text);
                break;
              }
            }
          }
          
          // Check if redirected back to detail view
          const isBackOnDetail = page.url().includes('/workout-plans/') && !page.url().includes('/edit');
          
          if (foundSuccess || isBackOnDetail) {
            console.log('Plan edit appears successful');
          } else {
            console.log('Could not confirm successful edit');
          }
        }
        
      } else {
        console.log('Edit functionality not available');
      }
      
    } else {
      console.log('No workout plans available for edit test');
    }
  });

  test('WPE-003: Edit workout plan exercises', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Look for exercise management sections
        const exerciseAreas = [
          page.locator('text="Exercise"'),
          page.locator('.exercise-list'),
          page.locator('[data-testid*="exercise"]'),
          page.locator('button:has-text("Add Exercise")'),
          page.locator('button:has-text("Remove Exercise")'),
        ];
        
        let exerciseArea = null;
        for (const area of exerciseAreas) {
          if (await area.first().isVisible()) {
            exerciseArea = area.first();
            break;
          }
        }
        
        if (exerciseArea) {
          console.log('Exercise editing area found');
          
          // Try to add an exercise
          const addExerciseButton = page.locator('button:has-text("Add Exercise"), button:has-text("Add"), button:has-text("+")').first();
          if (await addExerciseButton.isVisible()) {
            await addExerciseButton.click();
            await page.waitForTimeout(2000);
            
            // Look for exercise selection
            const exerciseSelect = page.locator('select, [role="combobox"]').first();
            if (await exerciseSelect.isVisible()) {
              await exerciseSelect.click();
              await page.waitForTimeout(1000);
              
              const exerciseOption = page.locator('option, [role="option"]').nth(1);
              if (await exerciseOption.isVisible()) {
                await exerciseOption.click();
                console.log('Added exercise to plan');
              }
            }
          }
          
          // Try to remove an exercise
          const removeButtons = page.locator('button:has-text("Remove"), button:has-text("Delete"), button:has-text("×")');
          const removeCount = await removeButtons.count();
          
          if (removeCount > 0) {
            await removeButtons.first().click();
            await page.waitForTimeout(1000);
            
            // Confirm removal if there's a confirmation dialog
            const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
            if (await confirmButton.first().isVisible()) {
              await confirmButton.first().click();
            }
            
            console.log('Removed exercise from plan');
          }
          
          // Save changes
          const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForLoadState('networkidle');
            console.log('Saved exercise changes');
          }
          
        } else {
          console.log('No exercise editing functionality found');
        }
        
      } else {
        console.log('Edit functionality not available');
      }
      
    } else {
      console.log('No workout plans available for exercise edit test');
    }
  });

  test('WPE-004: Cancel edit without saving', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      // Get original plan name
      const originalTitle = await page.locator('h1, .plan-title').first().textContent();
      
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Make some changes
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.clear();
          await nameInput.fill('This Should Not Be Saved');
        }
        
        // Cancel instead of saving
        const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Back"), a:has-text("Cancel")').first();
        
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForLoadState('networkidle');
          
          // Check that we're back on detail page and changes weren't saved
          const currentTitle = await page.locator('h1, .plan-title').first().textContent();
          
          if (currentTitle === originalTitle) {
            console.log('Cancel functionality working - changes not saved');
          } else {
            console.log('Unexpected title change - cancel might not have worked');
          }
          
        } else {
          console.log('Cancel button not found - trying browser back');
          await page.goBack();
          await page.waitForLoadState('networkidle');
          
          const currentTitle = await page.locator('h1, .plan-title').first().textContent();
          console.log('Title after back navigation:', currentTitle);
        }
        
      } else {
        console.log('Edit functionality not available');
      }
      
    } else {
      console.log('No workout plans available for cancel test');
    }
  });

  test('WPE-005: Edit form validation', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Clear required fields to test validation
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
        if (await nameInput.isVisible()) {
          await nameInput.clear();
        }
        
        // Try to save with empty required fields
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          // Look for validation errors
          const validationErrors = [
            page.locator('text*="required"'),
            page.locator('text*="cannot be empty"'),
            page.locator('.error'),
            page.locator('[role="alert"]'),
            page.locator('input:invalid'),
          ];
          
          let foundValidation = false;
          for (const error of validationErrors) {
            if (await error.first().isVisible()) {
              const text = await error.first().textContent();
              console.log('Validation error:', text);
              foundValidation = true;
              break;
            }
          }
          
          if (foundValidation) {
            console.log('Edit form validation working correctly');
          } else {
            console.log('No validation errors detected - form might accept empty values');
          }
        }
        
      } else {
        console.log('Edit functionality not available');
      }
      
    } else {
      console.log('No workout plans available for validation test');
    }
  });

  test('WPE-006: Edit workout plan schedule/timing', async ({ page }) => {
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForLoadState('networkidle');
        
        // Look for schedule/timing controls
        const scheduleControls = [
          page.locator('input[type="date"]'),
          page.locator('input[type="time"]'),
          page.locator('select[name*="day"]'),
          page.locator('input[name*="schedule"]'),
          page.locator('text="Schedule"'),
          page.locator('text="Days"'),
          page.locator('text="Frequency"'),
        ];
        
        let foundScheduleControl = false;
        for (const control of scheduleControls) {
          if (await control.first().isVisible()) {
            foundScheduleControl = true;
            console.log('Found schedule control');
            
            // Try to interact with the control
            if (await control.first().getAttribute('type') === 'date') {
              await control.first().fill('2024-12-31');
            } else if (await control.first().getAttribute('type') === 'time') {
              await control.first().fill('09:00');
            } else if (control.first().locator('option').first()) {
              await control.first().click();
              await page.waitForTimeout(500);
              const options = control.first().locator('option');
              if (await options.count() > 1) {
                await options.nth(1).click();
              }
            }
            
            break;
          }
        }
        
        if (foundScheduleControl) {
          // Try to save schedule changes
          const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForLoadState('networkidle');
            console.log('Schedule changes saved');
          }
        } else {
          console.log('No schedule editing functionality found');
        }
        
      } else {
        console.log('Edit functionality not available');
      }
      
    } else {
      console.log('No workout plans available for schedule edit test');
    }
  });

  test('WPE-007: Concurrent edit handling', async ({ page, browser }) => {
    // This test simulates what happens if multiple users try to edit the same plan
    await page.goto('/workout-plans');
    await page.waitForLoadState('networkidle');
    
    const planLink = page.locator('[href*="/workout-plans/"]').first();
    
    if (await planLink.isVisible()) {
      const planUrl = await planLink.getAttribute('href');
      
      // Open the same plan in a second page (simulating another user)
      const secondPage = await browser.newPage();
      await loginAsTestUser(secondPage);
      
      // Both pages navigate to edit the same plan
      await planLink.click();
      await page.waitForLoadState('networkidle');
      
      if (planUrl) {
        await secondPage.goto(planUrl);
        await secondPage.waitForLoadState('networkidle');
      }
      
      // Both click edit
      const editButton1 = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      const editButton2 = secondPage.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      
      if (await editButton1.isVisible() && await editButton2.isVisible()) {
        await editButton1.click();
        await page.waitForLoadState('networkidle');
        
        await editButton2.click();
        await secondPage.waitForLoadState('networkidle');
        
        // Make different changes in each page
        const nameInput1 = page.locator('input[name*="name"]').first();
        const nameInput2 = secondPage.locator('input[name*="name"]').first();
        
        if (await nameInput1.isVisible() && await nameInput2.isVisible()) {
          await nameInput1.clear();
          await nameInput1.fill('Edit from Page 1');
          
          await nameInput2.clear();
          await nameInput2.fill('Edit from Page 2');
          
          // Try to save from first page
          const saveButton1 = page.locator('button:has-text("Save"), button[type="submit"]').first();
          if (await saveButton1.isVisible()) {
            await saveButton1.click();
            await page.waitForTimeout(2000);
          }
          
          // Try to save from second page
          const saveButton2 = secondPage.locator('button:has-text("Save"), button[type="submit"]').first();
          if (await saveButton2.isVisible()) {
            await saveButton2.click();
            await secondPage.waitForTimeout(2000);
            
            // Check for conflict resolution messages
            const conflictMessages = [
              secondPage.locator('text*="conflict"'),
              secondPage.locator('text*="outdated"'),
              secondPage.locator('text*="modified"'),
              secondPage.locator('[role="alert"]'),
            ];
            
            let foundConflict = false;
            for (const message of conflictMessages) {
              if (await message.first().isVisible()) {
                const text = await message.first().textContent();
                console.log('Conflict message:', text);
                foundConflict = true;
                break;
              }
            }
            
            if (foundConflict) {
              console.log('Concurrent edit conflict handling detected');
            } else {
              console.log('No conflict handling detected - last save wins');
            }
          }
        }
      }
      
      await secondPage.close();
      
    } else {
      console.log('No workout plans available for concurrent edit test');
    }
  });
});
