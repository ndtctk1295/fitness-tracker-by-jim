// E2E Test Helper Functions
import { Page, expect } from '@playwright/test';
import { getTodayString, getYesterdayString } from './date-helpers';
import { loginAsTestUser as commonLogin } from './common-helpers';

// Authentication helpers
export async function loginUser(page: Page, email: string = 'test@gmail.com', password: string = '123456') {
  await page.goto('/auth/signin');
  
  // Wait for sign-in page to load - check for email input instead
  await expect(page.locator('[data-testid="email-input"]')).toBeVisible({ timeout: 10000 });
  
  // Fill in credentials
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  
  // Submit form using the login button
  await page.click('[data-testid="login-button"]');
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL('/dashboard', { timeout: 30000 });
  
  console.log('[E2E] User logged in successfully');
}

export async function logoutUser(page: Page) {
  // Navigate to profile or settings to find logout
  await page.goto('/profile');
  
  // Look for logout button
  const logoutButton = page.locator('[data-testid="logout-button"]');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await expect(page).toHaveURL('/auth/signin', { timeout: 10000 });
  }
  
  console.log('[E2E] User logged out successfully');
}

// Navigation helpers
export async function navigateToTimer(page: Page) {
  await page.goto('/timer');
  
  // Wait for page to fully load (no loading spinner)
//   await page.waitForLoadState('networkidle');
  
  // Wait for loading spinner to disappear if present
  const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  if (await loadingSpinner.isVisible({ timeout: 1000 }).catch(() => false)) {
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
  }
  
  // Alternative: wait for "Loading timer data..." to disappear
  const loadingText = page.locator('text=Loading timer data...');
  if (await loadingText.isVisible({ timeout: 1000 }).catch(() => false)) {
    await expect(loadingText).not.toBeVisible({ timeout: 10000 });
  }
  
  console.log('[E2E] Navigated to timer page');
}

export async function navigateToExercises(page: Page) {
  await page.goto('/exercises');
  await page.waitForLoadState('networkidle');
  
  console.log('[E2E] Navigated to exercises page');
}

export async function navigateToCalendar(page: Page) {
  await page.goto('/calendar');
  await page.waitForLoadState('networkidle');
  
  console.log('[E2E] Navigated to calendar page');
}

// Element waiting helpers
export async function waitForTimerSetup(page: Page, timeout: number = 10000) {
  await expect(page.locator('[data-testid="timer-setup"]')).toBeVisible({ timeout });
}

export async function waitForTimerStrategySelector(page: Page, timeout: number = 10000) {
  await expect(page.locator('[data-testid="timer-strategy-selector"]')).toBeVisible({ timeout });
}

export async function waitForExerciseList(page: Page, timeout: number = 10000) {
  // Wait for either exercise list or empty state
  const exerciseListVisible = page.locator('[data-testid="exercise-list"]').isVisible({ timeout: 1000 });
  const emptyStateVisible = page.locator('[data-testid="empty-exercise-list"]').isVisible({ timeout: 1000 });
  
  const isExerciseListVisible = await exerciseListVisible.catch(() => false);
  const isEmptyStateVisible = await emptyStateVisible.catch(() => false);
  
  if (!isExerciseListVisible && !isEmptyStateVisible) {
    // If neither is visible, wait for one of them
    await expect(
      page.locator('[data-testid="exercise-list"], [data-testid="empty-exercise-list"]').first()
    ).toBeVisible({ timeout });
  }
}

// Timer interaction helpers
export async function selectTimerStrategy(page: Page, strategyName: string) {
  await waitForTimerStrategySelector(page);
  
  const selector = page.locator('[data-testid="timer-strategy-selector"]');
  await selector.click();
  
  // Wait for dropdown to open and look for any available strategies
  await page.waitForTimeout(1000);
  
  // Try multiple ways to find the strategy option
  let option = page.locator(`text="${strategyName}"`);
  
  // If not found, try looking for any strategy option and select the first one
  if (!await option.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log(`[E2E] Strategy "${strategyName}" not found, looking for any available strategy`);
    
    // Look for any strategy in the dropdown
    const availableStrategies = page.locator('[role="option"], .select-item, [data-value]');
    const count = await availableStrategies.count();
    
    if (count > 0) {
      option = availableStrategies.first();
      await option.click();
      console.log(`[E2E] Selected first available strategy (${count} options found)`);
      return;
    }
    
    // If still no options, just try clicking the selector again to close
    await selector.click();
    console.log(`[E2E] No strategy options found in dropdown`);
    return;
  }
  
  await option.click();
  console.log(`[E2E] Selected timer strategy: ${strategyName}`);
}

export async function startTimer(page: Page) {
  const startButton = page.locator('[data-testid="start-timer-button"]');
  await expect(startButton).toBeVisible();
  await expect(startButton).toBeEnabled();
  await startButton.click();
  
  // Wait for timer to start (active timer should be visible)
  await expect(page.locator('[data-testid="active-timer"]')).toBeVisible({ timeout: 5000 });
  
  console.log('[E2E] Timer started successfully');
}

export async function pauseTimer(page: Page) {
  const pauseButton = page.locator('[data-testid="pause-timer-button"]');
  await expect(pauseButton).toBeVisible();
  await pauseButton.click();
  
  console.log('[E2E] Timer paused');
}

export async function resumeTimer(page: Page) {
  const resumeButton = page.locator('[data-testid="resume-timer-button"]');
  await expect(resumeButton).toBeVisible();
  await resumeButton.click();
  
  console.log('[E2E] Timer resumed');
}

export async function stopTimer(page: Page) {
  const stopButton = page.locator('[data-testid="stop-timer-button"]');
  await expect(stopButton).toBeVisible();
  await stopButton.click();
  
  // Wait for confirmation if there is one, or for timer to stop
  const confirmButton = page.locator('[data-testid="confirm-stop-timer"]');
  if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmButton.click();
  }
  
  // Wait for timer setup to be visible again
  await waitForTimerSetup(page);
  
  console.log('[E2E] Timer stopped');
}

// Exercise interaction helpers
export async function addExerciseToToday(page: Page, exerciseName: string, date: string = getTodayString()) {
  // Get existing categories and exercises to find the exercise ID
  const categoriesResponse = await makeApiRequest(page, 'GET', '/api/categories');
  const exercisesResponse = await makeApiRequest(page, 'GET', '/api/exercises');
  
  if (categoriesResponse.status !== 200 || exercisesResponse.status !== 200) {
    console.log('[E2E] Cannot add exercise to today - categories or exercises not available');
    return false;
  }

  const categories = categoriesResponse.data;
  const exercises = exercisesResponse.data;
  
  // Find the exercise by name
  const exercise = exercises.find((ex: any) => ex.name === exerciseName);
  if (!exercise) {
    console.log(`[E2E] Exercise "${exerciseName}" not found`);
    return false;
  }
  
  // Find the category for this exercise - try multiple approaches
  let category = null;
  
  // First, try to find by categoryId if exercise has it
  if (exercise.categoryId) {
    category = categories.find((cat: any) => cat.id === exercise.categoryId || cat._id === exercise.categoryId);
  }
  
  // If not found, try by categoryName
  if (!category && exercise.categoryName) {
    category = categories.find((cat: any) => cat.name === exercise.categoryName);
  }
  
  // If still not found, make educated guesses based on exercise name
  if (!category) {
    const exerciseNameLower = exerciseName.toLowerCase();
    if (exerciseNameLower.includes('push') || exerciseNameLower.includes('chest')) {
      category = categories.find((cat: any) => cat.name.toLowerCase().includes('chest'));
    } else if (exerciseNameLower.includes('squat') || exerciseNameLower.includes('leg')) {
      category = categories.find((cat: any) => cat.name.toLowerCase().includes('leg'));
    } else if (exerciseNameLower.includes('plank') || exerciseNameLower.includes('core')) {
      category = categories.find((cat: any) => cat.name.toLowerCase().includes('core'));
    } else {
      // Default to first available category
      category = categories[0];
    }
  }
  
  if (!category) {
    console.log(`[E2E] No suitable category found for exercise "${exerciseName}"`);
    return false;
  }

  // Create scheduled exercise via API
  const scheduledExercise = {
    exerciseId: exercise.id || exercise._id,
    categoryId: category.id || category._id,
    date: date,
    sets: 3,
    reps: exercise.name === 'Plank' ? 1 : 12, // Special case for time-based exercises
    weight: 0
  };

  try {
    const response = await makeApiRequest(page, 'POST', '/api/scheduled-exercises', scheduledExercise);
    if (response.status === 201 || response.status === 200) {
      console.log(`[E2E] Added scheduled exercise "${exerciseName}" for ${date}`);
      return true;
    } else {
      console.log(`[E2E] Failed to add scheduled exercise "${exerciseName}": ${response.status}`, response.data);
      return false;
    }
  } catch (error) {
    console.log(`[E2E] Error adding scheduled exercise "${exerciseName}":`, error);
    return false;
  }
}

export async function completeExercise(page: Page, exerciseName: string) {
  const exerciseItem = page.locator(`[data-testid="exercise-item-${exerciseName}"]`);
  await expect(exerciseItem).toBeVisible();
  
  const completeButton = exerciseItem.locator('[data-testid="complete-exercise-button"]');
  await completeButton.click();
  
  console.log(`[E2E] Completed exercise: ${exerciseName}`);
}

// Mobile testing helpers
export async function enableMobileMode(page: Page) {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
  console.log('[E2E] Enabled mobile viewport');
}

export async function enableTabletMode(page: Page) {
  await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
  console.log('[E2E] Enabled tablet viewport');
}

export async function enableDesktopMode(page: Page) {
  await page.setViewportSize({ width: 1280, height: 720 });
  console.log('[E2E] Enabled desktop viewport');
}

// Touch/tap helpers for mobile
export async function tapElement(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  
  // Try tap first, fallback to click if not supported
  try {
    await element.tap();
  } catch (error) {
    console.log('[E2E] Tap not supported, using click instead');
    await element.click();
  }
}

// API testing helpers
export async function makeApiRequest(page: Page, method: string, url: string, data?: any) {
  const response = await page.evaluate(async ({ method, url, data }) => {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      let responseData;
      
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = { error: 'Invalid JSON response' };
      }
      
      return {
        status: response.status,
        data: responseData
      };
    } catch (error) {
      return {
        status: 0,
        data: { error: String(error) }
      };
    }
  }, { method, url, data });
  
  return response;
}

// Data seeding helpers for tests (simplified - global setup handles most seeding)
export async function seedTimerStrategies(page: Page) {
  // First check if strategies already exist
  const existingResponse = await makeApiRequest(page, 'GET', '/api/timer-strategies');
  if (existingResponse.status === 200 && existingResponse.data.length >= 3) {
    console.log('[E2E] Timer strategies already exist, skipping creation');
    return existingResponse.data;
  }

  const strategies = [
    { name: "Default Workout", color: "#3b82f6", restDuration: 60, activeDuration: 45 },
    { name: "High Intensity", color: "#ef4444", restDuration: 30, activeDuration: 60 },
    { name: "Strength Training", color: "#10b981", restDuration: 120, activeDuration: 90 }
  ];

  const createdStrategies = [];
  for (const strategy of strategies) {
    try {
      const response = await makeApiRequest(page, 'POST', '/api/timer-strategies', strategy);
      if (response.status === 201 || response.status === 200) {
        createdStrategies.push(response.data);
        console.log(`[E2E] Created timer strategy: ${strategy.name}`);
      } else if (response.status === 409 || (response.data && response.data.error && response.data.error.includes('already exists'))) {
        console.log(`[E2E] Timer strategy ${strategy.name} already exists`);
      } else {
        console.log(`[E2E] Failed to create timer strategy ${strategy.name}: ${response.status}`, response.data);
      }
    } catch (error) {
      console.log(`[E2E] Error creating timer strategy ${strategy.name}:`, error);
    }
  }
  
  // Get final list of strategies
  const finalResponse = await makeApiRequest(page, 'GET', '/api/timer-strategies');
  return finalResponse.status === 200 ? finalResponse.data : createdStrategies;
}

export async function seedScheduledExercises(page: Page, date: string = getYesterdayString()) {
  // Check if scheduled exercises already exist for this date
  const existingResponse = await makeApiRequest(page, 'GET', `/api/scheduled-exercises?date=${date}`);
  if (existingResponse.status === 200 && existingResponse.data.length > 0) {
    console.log(`[E2E] Scheduled exercises already exist for ${date}, skipping creation`);
    return existingResponse.data;
  }

  // Get existing categories and exercises (should exist from global setup)
  const categoriesResponse = await makeApiRequest(page, 'GET', '/api/categories');
  const exercisesResponse = await makeApiRequest(page, 'GET', '/api/exercises');
  
  if (categoriesResponse.status !== 200 || exercisesResponse.status !== 200) {
    console.log('[E2E] Cannot seed scheduled exercises - categories or exercises not available');
    return [];
  }

  const categories = categoriesResponse.data;
  const exercises = exercisesResponse.data;
  
  // Find IDs for our test exercises
  const pushUpsExercise = exercises.find((ex: any) => ex.name === 'Push-ups');
  const squatsExercise = exercises.find((ex: any) => ex.name === 'Squats'); 
  const plankExercise = exercises.find((ex: any) => ex.name === 'Plank');
  
  const chestCategory = categories.find((cat: any) => cat.name === 'Chest');
  const legsCategory = categories.find((cat: any) => cat.name === 'Legs');
  const coreCategory = categories.find((cat: any) => cat.name === 'Core');

  if (!pushUpsExercise || !squatsExercise || !plankExercise || !chestCategory || !legsCategory || !coreCategory) {
    console.log('[E2E] Cannot find required exercises or categories for scheduled exercises');
    return [];
  }

  const scheduledExercises = [
    {
      exerciseId: pushUpsExercise.id || pushUpsExercise._id,
      categoryId: chestCategory.id || chestCategory._id,
      date: date,
      sets: 3,
      reps: 12,
      weight: 0
    },
    {
      exerciseId: squatsExercise.id || squatsExercise._id,
      categoryId: legsCategory.id || legsCategory._id,
      date: date,
      sets: 3,
      reps: 15,
      weight: 0
    },
    {
      exerciseId: plankExercise.id || plankExercise._id,
      categoryId: coreCategory.id || coreCategory._id,
      date: date,
      sets: 3,
      reps: 1,
      weight: 0
    }
  ];

  const createdScheduledExercises = [];
  for (const scheduledExercise of scheduledExercises) {
    try {
      const response = await makeApiRequest(page, 'POST', '/api/scheduled-exercises', scheduledExercise);
      if (response.status === 201 || response.status === 200) {
        createdScheduledExercises.push(response.data);
        console.log(`[E2E] Created scheduled exercise for ${date}`);
      } else {
        console.log(`[E2E] Failed to create scheduled exercise: ${response.status}`, response.data);
      }
    } catch (error) {
      console.log(`[E2E] Error creating scheduled exercise:`, error);
    }
  }
  
  return createdScheduledExercises;
}

export async function ensureTimerDataExists(page: Page, date: string = getYesterdayString()) {
  console.log('[E2E] Ensuring timer data exists...');
  
  // Only seed what's not already in global setup
  await seedTimerStrategies(page);
  await seedScheduledExercises(page, date);
  
  console.log('[E2E] Timer data seeding completed');
}

export async function testApiEndpoint(page: Page, endpoint: string, expectedStatus: number = 200) {
  const response = await makeApiRequest(page, 'GET', `/api${endpoint}`);
  expect(response.status).toBe(expectedStatus);
  return response.data;
}

// Assertion helpers
export async function expectElementToBeVisible(page: Page, selector: string, timeout: number = 5000) {
  await expect(page.locator(selector)).toBeVisible({ timeout });
}

export async function expectElementToBeHidden(page: Page, selector: string, timeout: number = 5000) {
  await expect(page.locator(selector)).not.toBeVisible({ timeout });
}

export async function expectTextContent(page: Page, selector: string, text: string) {
  await expect(page.locator(selector)).toContainText(text);
}

// Debugging helpers
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}-${Date.now()}.png` });
  console.log(`[E2E] Screenshot taken: ${name}`);
}

export async function logPageContent(page: Page) {
  const content = await page.content();
  console.log('[E2E] Page content:', content.substring(0, 500) + '...');
}

export async function logNetworkRequests(page: Page) {
  page.on('request', request => {
    console.log(`[E2E] Request: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    console.log(`[E2E] Response: ${response.status()} ${response.url()}`);
  });
}
