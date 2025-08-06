# Calendar Page E2E Tests Implementation

This directory contains comprehensive E2E tests for the Calendar page functionality, based on the test plan in `e2e-test-docs/calendar-page-test.md`.

## Test Files Structure

### 1. `calendar-basic.spec.ts`
**Tests CAL-001 to CAL-007**: Basic navigation and page loading
- Page load verification
- Header components presence
- Month/week navigation
- Today button functionality
- View toggling (month ↔ week)

### 2. `calendar-exercises.spec.ts`
**Tests CAL-008 to CAL-019**: Exercise display and dialog functionality
- Exercise rendering on calendar
- Exercise type legends
- Empty date handling
- Exercise detail dialog operations
- Add/edit exercise workflows
- Past date restrictions

### 3. `calendar-drag-drop.spec.ts`
**Tests CAL-022 to CAL-025**: Drag and drop functionality
- Basic exercise movement within same week
- Cross-week restriction validation
- Template exercise scope selection
- Manual exercise direct moves

### 4. `calendar-mobile-integration.spec.ts`
**Tests CAL-020, CAL-021, CAL-026 to CAL-028**: Mobile responsiveness and integrations
- Mobile tab navigation
- Touch interactions
- Timer integration
- Workout plan integration
- Weight unit consistency

### 5. `calendar-crud.spec.ts`
**Tests CAL-014 to CAL-018**: CRUD operations
- Complete add exercise flow
- Exercise editing
- Single exercise deletion
- Clear all exercises
- Favorites vs all exercises selection

### 6. `calendar-error-performance.spec.ts`
**Tests CAL-029 to CAL-035**: Error handling, performance, and data persistence
- Network error handling
- Invalid data validation
- Loading state management
- Large dataset performance
- Memory usage testing
- Data persistence across sessions

## Key Features Tested

### Authentication
- All tests start with automatic login using test user credentials
- Session management across test flows

### Data-Driven Testing
- Uses test fixtures from `../../fixtures/users`
- Dynamic date calculations for future/past date testing
- Conditional test execution based on available data

### Cross-Browser Support
- Compatible with Playwright's multi-browser testing
- Desktop and mobile viewport testing

### Error Handling
- Network disconnection simulation
- Form validation testing
- Loading state verification

## Data Test IDs Required

The tests expect the following `data-testid` attributes in the application:

### Calendar Structure
- `calendar-grid`: Main calendar grid container
- `calendar-header`: Calendar header section
- `calendar-month-year`: Month/year display
- `calendar-prev-btn`, `calendar-next-btn`, `calendar-today-btn`: Navigation buttons
- `calendar-view-toggle`: Month/week view toggle button
- `calendar-date-cell`: Individual date cells
- `calendar-exercise`: Exercise entries on calendar
- `calendar-legend`: Exercise type legend

### Exercise Dialog
- `exercise-detail-dialog`: Main dialog container
- `dialog-title`, `dialog-close`: Dialog header elements
- `scheduled-exercises-tab`, `add-exercise-tab`, `edit-exercise-tab`: Tab navigation
- `exercise-list`, `exercise-item`: Exercise listing
- `no-exercises`: Empty state display

### Exercise Form
- `sets-input`, `reps-input`, `weight-input`: Form inputs
- `weight-plate-selector`: Weight plate selection component
- `save-exercise`, `update-exercise`: Action buttons
- `exercise-category`, `exercise-option`: Exercise selection
- `favorites-tab`, `all-exercises-tab`: Exercise selection tabs

### Mobile Elements
- `mobile-tab-selector`: Mobile dropdown selector
- `desktop-tabs`: Desktop tab navigation

### Integration Elements
- `start-timer-link`: Timer page navigation
- `active-plan-name`: Workout plan display
- `toast-success`, `toast-error`: Notification toasts

## Running the Tests

```bash
# Run all calendar tests
npx playwright test e2e/tests/calendar

# Run specific test file
npx playwright test e2e/tests/calendar/calendar-basic.spec.ts

# Run specific test by ID
npx playwright test -g "CAL-001"

# Run tests in headed mode
npx playwright test e2e/tests/calendar --headed

# Run tests with specific browser
npx playwright test e2e/tests/calendar --project=chromium
```

## Test Data Setup

Before running tests, ensure:

1. **Database**: Test database with sample exercises and categories
2. **User Account**: Valid test user in `fixtures/users.ts`
3. **Workout Plans**: Sample workout plan data (for integration tests)
4. **Exercise Data**: Various exercise types (manual, scheduled, template)

## Known Limitations

1. **Dynamic Test Data**: Some tests depend on existing exercise data
2. **Date Calculations**: Tests calculate future/past dates dynamically
3. **Drag & Drop**: Complex drag operations may need timing adjustments
4. **Mobile Testing**: Viewport-specific behavior testing

## Maintenance Notes

- Update `data-testid` selectors if UI components change
- Adjust timing/waits if application performance changes
- Add new test cases when calendar features are added
- Review date calculation logic for edge cases (month boundaries, etc.)
