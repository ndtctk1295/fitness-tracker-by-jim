# Calendar Page E2E Test Cases

## Overview
This document outlines comprehensive E2E test cases for the Calendar page functionality, covering all user interactions, business logic, and edge cases.

## Test Environment Setup
- **Authentication**: Tests should run with authenticated user
- **Test Data**: Ensure test database has sample exercises, categories, and workout plans
- **Browser Support**: Chrome, Firefox, Safari, Edge
- **Device Testing**: Desktop, Tablet, Mobile viewports

---

## 1. Page Load and Basic Navigation Tests

### 1.1 Calendar Page Load
**Test ID**: CAL-001  
**Description**: Verify calendar page loads successfully  
**Steps**:
1. Navigate to `/calendar`
2. Wait for page to fully load

**Expected Results**:
- Calendar grid displays current month/week
- Navigation controls are visible
- No error messages shown
- Loading states complete properly

### 1.2 Calendar Header Components
**Test ID**: CAL-002  
**Description**: Verify all header components are present and functional  
**Steps**:
1. Load calendar page
2. Verify header elements exist

**Expected Results**:
- "Calendar" title is displayed
- Current month/year shown (e.g., "August 2025")
- Previous/Next navigation buttons visible
- "Today" button present
- View toggle button (Month/Week) available
- Active workout plan name displayed (if exists)

---

## 2. Calendar Navigation Tests

### 2.1 Month Navigation - Previous
**Test ID**: CAL-003  
**Description**: Navigate to previous month  
**Steps**:
1. Note current month displayed
2. Click previous arrow button
3. Verify month changes

**Expected Results**:
- Calendar displays previous month
- Month/year in header updates correctly
- Exercise data loads for new date range
- Navigation state preserved

### 2.2 Month Navigation - Next
**Test ID**: CAL-004  
**Description**: Navigate to next month  
**Steps**:
1. Note current month displayed
2. Click next arrow button
3. Verify month changes

**Expected Results**:
- Calendar displays next month
- Month/year in header updates correctly
- Exercise data loads for new date range

### 2.3 Today Navigation
**Test ID**: CAL-005  
**Description**: Navigate back to current date  
**Steps**:
1. Navigate to different month (previous or next)
2. Click "Today" button

**Expected Results**:
- Calendar returns to current month
- Current date is highlighted/selected
- Exercise data for current period loads

### 2.4 View Toggle - Month to Week
**Test ID**: CAL-006  
**Description**: Switch from month view to week view  
**Steps**:
1. Ensure calendar is in month view
2. Click view toggle button
3. Verify layout changes

**Expected Results**:
- Calendar switches to week view layout
- Shows 7 days in horizontal layout
- Toggle button state indicates week view
- Current week displayed

### 2.5 View Toggle - Week to Month
**Test ID**: CAL-007  
**Description**: Switch from week view to month view  
**Steps**:
1. Ensure calendar is in week view
2. Click view toggle button
3. Verify layout changes

**Expected Results**:
- Calendar switches to month view layout
- Shows full month grid
- Toggle button state indicates month view

---

## 3. Exercise Display Tests

### 3.1 Exercise Rendering on Calendar
**Test ID**: CAL-008  
**Description**: Verify exercises display correctly on calendar dates  
**Steps**:
1. Navigate to calendar page
2. Observe dates with scheduled exercises

**Expected Results**:
- Exercises appear on correct dates
- Different exercise types have distinct visual styling:
  - Scheduled exercises (blue background)
  - Template exercises (specific color coding)
  - Manual exercises (different styling)
- Exercise names are readable
- Exercise counts shown (e.g., "1 planned", "1 manual")

### 3.2 Exercise Legend Display
**Test ID**: CAL-009  
**Description**: Verify exercise type legend is shown in detailed view  
**Steps**:
1. Ensure calendar is in detailed view mode
2. Check for legend display

**Expected Results**:
- Legend explains different exercise type colors
- Shows workout plan name if active
- Legend is clearly visible and informative

### 3.3 Empty Date Display
**Test ID**: CAL-010  
**Description**: Verify empty dates display correctly  
**Steps**:
1. Find dates with no scheduled exercises
2. Observe their appearance

**Expected Results**:
- Empty dates show clean, clickable interface
- No error states on empty dates
- Consistent styling across empty dates

---

## 4. Exercise Detail Dialog Tests

### 4.1 Open Exercise Dialog
**Test ID**: CAL-011  
**Description**: Open exercise detail dialog by clicking on a date  
**Steps**:
1. Click on any calendar date
2. Wait for dialog to open

**Expected Results**:
- Exercise detail dialog opens
- Dialog shows correct date in title (e.g., "Exercises for August 4, 2025")
- Three tabs visible: "Scheduled Exercises", "Add Exercise", "Edit Exercise"
- "Scheduled Exercises" tab is active by default

### 4.2 Close Exercise Dialog
**Test ID**: CAL-012  
**Description**: Close exercise detail dialog  
**Steps**:
1. Open exercise detail dialog
2. Click close button or outside dialog
3. Verify dialog closes

**Expected Results**:
- Dialog closes properly
- Returns to calendar view
- No data loss or errors

### 4.3 Scheduled Exercises Tab
**Test ID**: CAL-013  
**Description**: View scheduled exercises for a date  
**Steps**:
1. Click on date with existing exercises
2. Observe "Scheduled Exercises" tab content

**Expected Results**:
- List of exercises for selected date displayed
- Each exercise shows: name, sets, reps, weight
- Edit and delete buttons available for each exercise
- "Clear All Exercises" button visible if exercises exist
- "Start Timer" link available if exercises exist

### 4.4 Add Exercise Tab - Exercise Selection
**Test ID**: CAL-014  
**Description**: Add new exercise through dialog  
**Steps**:
1. Click on future date (not past date)
2. Switch to "Add Exercise" tab
3. Explore exercise selection options

**Expected Results**:
- "Add Exercise" tab is enabled for future dates
- Two sub-tabs: "Favorites" and "All Exercises"
- Exercise categories displayed with available exercises
- Exercise selection by category works
- Favorites tab shows user's favorite exercises

### 4.5 Add Exercise - Complete Flow
**Test ID**: CAL-015  
**Description**: Complete flow of adding a new exercise  
**Steps**:
1. Open dialog for future date
2. Go to "Add Exercise" tab
3. Select exercise category
4. Select specific exercise
5. Enter sets, reps, weight
6. Use weight plate selector
7. Save exercise

**Expected Results**:
- Exercise selection works properly
- Form validation prevents invalid entries
- Weight plate selector calculates total weight correctly
- Exercise saves successfully
- Success toast notification shown
- Exercise appears on calendar immediately
- Dialog can be closed after successful save

### 4.6 Edit Exercise Tab
**Test ID**: CAL-016  
**Description**: Edit existing exercise  
**Steps**:
1. Open dialog with existing exercises
2. Click edit button on an exercise
3. Modify exercise details
4. Save changes

**Expected Results**:
- "Edit Exercise" tab becomes enabled
- Form populates with existing exercise data
- All fields are editable (sets, reps, weight, plates)
- Changes save successfully
- Updated exercise reflects on calendar
- Success notification shown

### 4.7 Delete Single Exercise
**Test ID**: CAL-017  
**Description**: Delete individual exercise  
**Steps**:
1. Open dialog with exercises
2. Click delete button on specific exercise
3. Confirm deletion

**Expected Results**:
- Confirmation dialog appears
- Exercise deletes after confirmation
- Exercise removed from calendar
- Success notification shown

### 4.8 Clear All Exercises
**Test ID**: CAL-018  
**Description**: Clear all exercises for a date  
**Steps**:
1. Open dialog with multiple exercises
2. Click "Clear All Exercises" button
3. Confirm action

**Expected Results**:
- Confirmation dialog with appropriate warning
- All exercises deleted after confirmation
- Date shows as empty on calendar
- Success notification shown

### 4.9 Past Date Restrictions
**Test ID**: CAL-019  
**Description**: Verify restrictions on past dates  
**Steps**:
1. Click on past date
2. Try to access "Add Exercise" tab

**Expected Results**:
- "Add Exercise" tab is disabled for past dates
- Appropriate visual indication of disabled state
- Existing exercises can still be viewed
- Edit functionality may be restricted based on business rules

---

## 5. Mobile Responsiveness Tests

### 5.1 Mobile Tab Navigation
**Test ID**: CAL-020  
**Description**: Test mobile-specific UI elements  
**Steps**:
1. Switch to mobile viewport (375px width)
2. Open exercise detail dialog

**Expected Results**:
- Tabs convert to dropdown selector on mobile
- Dropdown shows current tab selection
- Tab switching works through dropdown
- All functionality remains accessible

### 5.2 Mobile Calendar Layout
**Test ID**: CAL-021  
**Description**: Verify calendar layout on mobile  
**Steps**:
1. View calendar on mobile viewport
2. Test navigation and interactions

**Expected Results**:
- Calendar remains functional and readable
- Touch interactions work properly
- Exercise entries are tappable
- Navigation controls accessible

---

## 6. Drag and Drop Tests

### 6.1 Basic Exercise Drag and Drop
**Test ID**: CAL-022  
**Description**: Drag exercise between dates in same week  
**Steps**:
1. Find exercise on calendar
2. Drag exercise to different date in same week
3. Drop exercise

**Expected Results**:
- Drag operation initiates properly
- Visual feedback during drag
- Exercise moves to new date
- Success notification shown
- Calendar updates immediately

### 6.2 Cross-Week Drag Restriction
**Test ID**: CAL-023  
**Description**: Attempt to drag exercise to different week  
**Steps**:
1. Drag exercise to date in different week
2. Attempt to drop

**Expected Results**:
- Operation rejected
- Error notification: "Exercises can only be rearranged within the same week"
- Exercise returns to original position

### 6.3 Template Exercise Drag - Scope Selection
**Test ID**: CAL-024  
**Description**: Drag template exercise and handle scope selection  
**Steps**:
1. Drag template exercise to new date
2. Handle scope selection dialog

**Expected Results**:
- Scope selection dialog appears
- Options: "This week only" and "Whole plan"
- Selecting scope applies changes appropriately
- Proper feedback based on selection

### 6.4 Manual Exercise Drag
**Test ID**: CAL-025  
**Description**: Drag manual exercise (no scope selection needed)  
**Steps**:
1. Drag manual exercise to new date in same week
2. Drop exercise

**Expected Results**:
- Exercise moves immediately without scope dialog
- Success notification shown
- No additional confirmation required

---

## 7. Integration Tests

### 7.1 Timer Integration
**Test ID**: CAL-026  
**Description**: Navigate to timer from calendar  
**Steps**:
1. Open dialog with exercises
2. Click timer/workout link
3. Verify navigation

**Expected Results**:
- Successfully navigates to timer page
- Exercises from selected date available in timer
- No data loss during navigation

### 7.2 Workout Plan Integration
**Test ID**: CAL-027  
**Description**: Verify workout plan exercises display  
**Steps**:
1. Ensure active workout plan exists
2. View calendar with plan exercises

**Expected Results**:
- Workout plan name shown in header
- Template exercises display with proper styling
- Plan-based exercises behave correctly

### 7.3 Weight Unit Consistency
**Test ID**: CAL-028  
**Description**: Verify weight units are consistent  
**Steps**:
1. Change weight unit preference
2. View exercises with weights
3. Add/edit exercises

**Expected Results**:
- All weight displays use selected unit
- Weight plate selector uses correct unit
- Calculations remain accurate across unit changes

---

## 8. Error Handling Tests

### 8.1 Network Error Handling
**Test ID**: CAL-029  
**Description**: Handle network connectivity issues  
**Steps**:
1. Simulate network disconnection
2. Attempt calendar operations
3. Restore connection

**Expected Results**:
- Appropriate error messages shown
- Graceful degradation of functionality
- Recovery when connection restored
- No data corruption

### 8.2 Invalid Data Handling
**Test ID**: CAL-030  
**Description**: Handle invalid or corrupted exercise data  
**Steps**:
1. Attempt to save exercise with invalid data
2. Test form validation

**Expected Results**:
- Form validation prevents invalid submissions
- Clear error messages for validation failures
- No system crashes or undefined states

### 8.3 Loading State Handling
**Test ID**: CAL-031  
**Description**: Verify loading states and timeouts  
**Steps**:
1. Observe loading states during operations
2. Test timeout scenarios

**Expected Results**:
- Loading indicators shown during operations
- Timeout handling with appropriate messages
- User can retry failed operations

---

## 9. Performance Tests

### 9.1 Large Dataset Handling
**Test ID**: CAL-032  
**Description**: Performance with many exercises  
**Steps**:
1. Load calendar with month containing many exercises
2. Test scrolling and interactions

**Expected Results**:
- Calendar remains responsive
- No significant lag in interactions
- Smooth scrolling and animations

### 9.2 Memory Usage
**Test ID**: CAL-033  
**Description**: Monitor memory usage during extended use  
**Steps**:
1. Navigate between multiple months
2. Open/close dialogs repeatedly
3. Perform various operations

**Expected Results**:
- No memory leaks detected
- Consistent performance over time
- Proper cleanup of resources

---

## 10. Data Persistence Tests

### 10.1 Exercise Data Persistence
**Test ID**: CAL-034  
**Description**: Verify exercise changes persist across sessions  
**Steps**:
1. Add/modify exercises
2. Refresh page or navigate away and back
3. Verify changes persist

**Expected Results**:
- All exercise changes saved properly
- Data consistent across page refreshes
- No data loss on navigation

### 10.2 UI State Persistence
**Test ID**: CAL-035  
**Description**: Verify UI preferences persist  
**Steps**:
1. Change view mode (month/week)
2. Navigate to different date
3. Refresh page

**Expected Results**:
- View preferences may persist based on design
- Calendar returns to appropriate state
- User experience remains consistent

---

## Test Execution Notes

### Prerequisites
- Authenticated user with appropriate permissions
- Test database with sample exercises and categories
- Active workout plan (for plan-related tests)
- Various exercise types in test data

### Test Data Requirements
- Sample exercises across multiple categories
- Mix of manual, scheduled, and template exercises
- User favorite exercises configured
- Weight data in different units
- Past, current, and future date scenarios

### Browser Compatibility
All tests should be executed across:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Device Testing
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

### Automation Considerations
- Use data-testid attributes for reliable selectors
- Implement proper wait strategies for async operations
- Handle drag and drop with appropriate timing
- Mock external dependencies where appropriate
- Implement retry logic for flaky network operations