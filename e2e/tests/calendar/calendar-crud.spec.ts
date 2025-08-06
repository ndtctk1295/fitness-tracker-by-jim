import { test, expect } from '@playwright/test';
import { usersMockData } from '../../fixtures/users';

const validUser = usersMockData.valid;

// Helper function to login user
async function loginAsTestUser(page: any) {
  await page.goto('/auth/signin');
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');
  
  // Add debugging for mobile
  const viewport = await page.viewportSize();
  console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
  
  // Fill credentials
  await page.fill('[data-testid="email-input"]', validUser.email);
  await page.fill('[data-testid="password-input"]', validUser.password);
  
  // Click login and wait for navigation or error
  await page.click('[data-testid="login-button"]');
  
  // Wait for either success or error
  try {
    await page.waitForURL(/dashboard/, { timeout: 20000 });
  } catch (error) {
    // Log current URL and any error messages on page
    const currentUrl = page.url();
    console.log(`Login failed - Current URL: ${currentUrl}`);
    
    // Check for error messages
    const errorElements = await page.locator('[data-testid*="error"], .error, [role="alert"]').all();
    for (const element of errorElements) {
      const text = await element.textContent();
      if (text) console.log(`Error on page: ${text}`);
    }
    
    throw error;
  }
}

test.describe('Calendar Page - Exercise CRUD Operations', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear any existing storage/cookies to ensure clean state
    await context.clearCookies();
    await context.clearPermissions();
    
    await loginAsTestUser(page);
  });

  test('CAL-016: Edit existing exercise', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Find a date with existing exercises
    const exerciseElement = page.locator('[data-testid="calendar-exercise"]').first();
    
    if (await exerciseElement.isVisible()) {
      // Get the date of the exercise
      const exerciseDate = await exerciseElement.getAttribute('data-date');
      
      // Click on the date to open dialog
      const dateCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${exerciseDate}"]`);
      await dateCell.click();
      await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
      
      // Find and click edit button on first exercise
      const editButton = page.locator('[data-testid="edit-exercise-btn"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Verify Edit Exercise tab becomes enabled and active
        await expect(page.locator('[data-testid="edit-exercise-tab"][data-state="active"]')).toBeVisible();
        
        // Verify form populates with existing data
        const setsInput = page.locator('[data-testid="sets-input"]');
        const repsInput = page.locator('[data-testid="reps-input"]');
        const weightInput = page.locator('[data-testid="weight-input"]');
        
        await expect(setsInput).not.toHaveValue('');
        await expect(repsInput).not.toHaveValue('');
        
        // Modify exercise details
        await setsInput.fill('4');
        await repsInput.fill('15');
        await weightInput.fill('60');
        
        // Save changes
        await page.locator('[data-testid="update-exercise"]').click();
        
        // Verify success notification
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
        await expect(page.locator('[data-testid="toast-success"]')).toContainText(/updated/i);
        
        // Verify changes are reflected
        await page.locator('[data-testid="scheduled-exercises-tab"]').click();
        const updatedExercise = page.locator('[data-testid="exercise-item"]').first();
        await expect(updatedExercise).toContainText('4');
        await expect(updatedExercise).toContainText('15');
      }
    }
  });

  test('CAL-017: Delete single exercise', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Find a date with exercises
    const exerciseElement = page.locator('[data-testid="calendar-exercise"]').first();
    
    if (await exerciseElement.isVisible()) {
      const exerciseDate = await exerciseElement.getAttribute('data-date');
      
      // Click on the date to open dialog
      const dateCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${exerciseDate}"]`);
      await dateCell.click();
      await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
      
      // Get initial exercise count
      const exerciseItems = page.locator('[data-testid="exercise-item"]');
      const initialCount = await exerciseItems.count();
      
      if (initialCount > 0) {
        // Click delete button on first exercise
        const deleteButton = page.locator('[data-testid="delete-exercise-btn"]').first();
        await deleteButton.click();
        
        // Verify confirmation dialog appears
        await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible();
        await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toContainText(/delete.*exercise/i);
        
        // Confirm deletion
        await page.locator('[data-testid="confirm-delete"]').click();
        
        // Verify success notification
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
        
        // Verify exercise count decreased
        const newCount = await exerciseItems.count();
        expect(newCount).toBe(initialCount - 1);
        
        // Close dialog and verify exercise removed from calendar
        await page.locator('[data-testid="dialog-close"]').click();
        
        if (newCount === 0) {
          // If no exercises left, the date should show empty
          const calendarExercises = page.locator(`[data-testid="calendar-date-cell"][data-date="${exerciseDate}"] [data-testid="calendar-exercise"]`);
          await expect(calendarExercises).toHaveCount(0);
        }
      }
    }
  });

  test('CAL-018: Clear all exercises for a date', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Find a date with multiple exercises (or at least one)
    const exerciseElement = page.locator('[data-testid="calendar-exercise"]').first();
    
    if (await exerciseElement.isVisible()) {
      const exerciseDate = await exerciseElement.getAttribute('data-date');
      
      // Click on the date to open dialog
      const dateCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${exerciseDate}"]`);
      await dateCell.click();
      await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
      
      // Verify exercises exist
      const exerciseItems = page.locator('[data-testid="exercise-item"]');
      const exerciseCount = await exerciseItems.count();
      
      if (exerciseCount > 0) {
        // Click "Clear All Exercises" button
        const clearAllButton = page.locator('[data-testid="clear-all-exercises"]');
        await expect(clearAllButton).toBeVisible();
        await clearAllButton.click();
        
        // Verify confirmation dialog with appropriate warning
        await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toBeVisible();
        await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toContainText(/clear.*all.*exercises/i);
        await expect(page.locator('[data-testid="delete-confirmation-dialog"]')).toContainText(/cannot be undone/i);
        
        // Confirm clearing all exercises
        await page.locator('[data-testid="confirm-delete"]').click();
        
        // Verify success notification
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
        
        // Verify all exercises are removed
        await expect(exerciseItems).toHaveCount(0);
        
        // Verify empty state is shown
        await expect(page.locator('[data-testid="no-exercises"]')).toBeVisible();
        
        // Close dialog and verify date shows as empty on calendar
        await page.locator('[data-testid="dialog-close"]').click();
        const calendarExercises = page.locator(`[data-testid="calendar-date-cell"][data-date="${exerciseDate}"] [data-testid="calendar-exercise"]`);
        await expect(calendarExercises).toHaveCount(0);
      }
    }
  });

  test('CAL-015: Add exercise - complete flow with weight plates', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Click on future date
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 2);
    
    const futureDateCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${futureDate.toISOString().split('T')[0]}"]`);
    await futureDateCell.click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Go to Add Exercise tab (mobile vs desktop)
    const viewport = await page.viewportSize();
    const isMobile = viewport && viewport.width < 640; // sm breakpoint is 640px
    
    if (isMobile) {
      // Mobile: Use dropdown selector
      await page.locator('[data-testid="mobile-tab-selector"]').click();
      await page.locator('[data-testid="mobile-tab-option-add"]').click();
    } else {
      // Desktop: Use tabs
      await page.locator('[data-testid="add-exercise-tab"]').click();
    }
    
    // Test exercise selection flow
    const allExercisesTab = page.locator('[data-testid="all-exercises-tab"]');
    await allExercisesTab.click();
    
    // Select exercise category
    const exerciseCategories = page.locator('[data-testid="exercise-category"]');
    if (await exerciseCategories.count() > 0) {
      await exerciseCategories.first().click();
      
      // Select specific exercise
      const exerciseOptions = page.locator('[data-testid="exercise-option"]');
      if (await exerciseOptions.count() > 0) {
        const selectedExercise = exerciseOptions.first();
        const exerciseName = await selectedExercise.textContent();
        await selectedExercise.click();
        
        // Fill in exercise details
        await page.locator('[data-testid="sets-input"]').fill('3');
        await page.locator('[data-testid="reps-input"]').fill('10');
        
        // Test weight plate selector
        const weightPlateSelector = page.locator('[data-testid="weight-plate-selector"]');
        if (await weightPlateSelector.isVisible()) {
          // Select some weight plates
          const plate20kg = page.locator('[data-testid="plate-20"]');
          const plate10kg = page.locator('[data-testid="plate-10"]');
          
          if (await plate20kg.isVisible()) {
            await plate20kg.click(); // Add 20kg plate
            
            if (await plate10kg.isVisible()) {
              await plate10kg.click(); // Add 10kg plate
            }
            
            // Verify total weight calculation
            const totalWeight = page.locator('[data-testid="total-weight"]');
            await expect(totalWeight).toContainText('30'); // 20 + 10
          }
        } else {
          // If no weight plate selector, use direct weight input
          await page.locator('[data-testid="weight-input"]').fill('50');
        }
        
        // Save exercise
        await page.locator('[data-testid="save-exercise"]').click();
        
        // Verify form validation passes
        await expect(page.locator('[data-testid="validation-error"]')).not.toBeVisible();
        
        // Verify success notification
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
        
        // Verify exercise appears in scheduled list
        await page.locator('[data-testid="scheduled-exercises-tab"]').click();
        const addedExercise = page.locator('[data-testid="exercise-item"]').filter({ hasText: exerciseName || '' });
        await expect(addedExercise).toBeVisible();
        
        // Verify exercise appears on calendar
        await page.locator('[data-testid="dialog-close"]').click();
        const calendarExercise = page.locator(`[data-testid="calendar-date-cell"][data-date="${futureDate.toISOString().split('T')[0]}"] [data-testid="calendar-exercise"]`);
        await expect(calendarExercise).toBeVisible();
      }
    }
  });

  test('CAL-014: Exercise selection - favorites vs all exercises', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Open dialog for future date
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 1);
    
    const futureDateCell = page.locator(`[data-testid="calendar-date-cell"][data-date="${futureDate.toISOString().split('T')[0]}"]`);
    await futureDateCell.click();
    await page.waitForSelector('[data-testid="exercise-detail-dialog"]', { state: 'visible' });
    
    // Switch to Add Exercise tab (mobile vs desktop)
    const viewport = await page.viewportSize();
    const isMobile = viewport && viewport.width < 640; // sm breakpoint is 640px
    
    if (isMobile) {
      // Mobile: Use dropdown selector
      await page.locator('[data-testid="mobile-tab-selector"]').click();
      await page.locator('[data-testid="mobile-tab-option-add"]').click();
    } else {
      // Desktop: Use tabs
      await page.locator('[data-testid="add-exercise-tab"]').click();
    }
    
    // Test Favorites tab
    const favoritesTab = page.locator('[data-testid="favorites-tab"]');
    await favoritesTab.click();
    
    // Check favorites content
    const favoritesContent = page.locator('[data-testid="favorites-content"]');
    const favoriteExercises = page.locator('[data-testid="favorite-exercise"]');
    
    if (await favoriteExercises.count() > 0) {
      // Verify favorite exercises are displayed
      await expect(favoriteExercises.first()).toBeVisible();
      
      // Verify heart icon or favorite indicator
      const favoriteIcon = page.locator('[data-testid="favorite-icon"]').first();
      await expect(favoriteIcon).toBeVisible();
    } else {
      // Verify empty favorites message
      await expect(page.locator('[data-testid="no-favorites-message"]')).toBeVisible();
    }
    
    // Test All Exercises tab
    const allExercisesTab = page.locator('[data-testid="all-exercises-tab"]');
    await allExercisesTab.click();
    
    // Verify all exercises are shown
    const allExerciseCategories = page.locator('[data-testid="exercise-category"]');
    if (await allExerciseCategories.count() > 0) {
      await expect(allExerciseCategories.first()).toBeVisible();
      
      // Click on first category to see exercises
      await allExerciseCategories.first().click();
      
      const exerciseOptions = page.locator('[data-testid="exercise-option"]');
      if (await exerciseOptions.count() > 0) {
        await expect(exerciseOptions.first()).toBeVisible();
      }
    }
  });
});
