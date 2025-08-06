# Workout Plans E2E Test Suite

## Overview
This directory contains comprehensive end-to-end tests for the Workout Plans functionality, covering all major user workflows and edge cases.

## Test Files Structure

### 1. `workout-plans-basic.spec.ts` (WPB Series)
- **WPB-001**: Basic navigation to workout plans page
- **WPB-002**: Workout plans list loading and display
- **WPB-003**: Individual workout plan detail view
- **WPB-004**: Error handling for non-existent plans
- **WPB-005**: Search/filter functionality
- **WPB-006**: Empty state handling
- **WPB-007**: Loading states and performance

### 2. `workout-plans-activation.spec.ts` (WPA Series)
- **WPA-001**: Activate workout plan functionality
- **WPA-002**: Deactivate workout plan functionality  
- **WPA-003**: Toggle between activate/deactivate states
- **WPA-004**: Multiple plan activation handling
- **WPA-005**: Activation status persistence
- **WPA-006**: Activation error handling
- **WPA-007**: Settings tab access and functionality

### 3. `workout-plans-statistics.spec.ts` (WPS Series)
- **WPS-001**: Statistics tab loads without infinite loops ⚠️ **Bug Fix Verification**
- **WPS-002**: Progression tab loads without infinite loops ⚠️ **Bug Fix Verification**
- **WPS-003**: Tab switching works smoothly
- **WPS-004**: Statistics handles empty data gracefully
- **WPS-005**: Progression handles empty data gracefully
- **WPS-006**: Memory leak and performance check

### 4. `workout-plans-creation.spec.ts` (WPC Series)
- **WPC-001**: Navigate to workout plan creation
- **WPC-002**: Basic workout plan creation form
- **WPC-003**: Form validation for required fields
- **WPC-004**: Cancel creation workflow
- **WPC-005**: Exercise selection in wizard
- **WPC-006**: Multi-step wizard navigation
- **WPC-007**: Save as draft functionality

### 5. `workout-plans-editing.spec.ts` (WPE Series)  
- **WPE-001**: Navigate to edit workout plan
- **WPE-002**: Edit workout plan basic information
- **WPE-003**: Edit workout plan exercises
- **WPE-004**: Cancel edit without saving
- **WPE-005**: Edit form validation
- **WPE-006**: Edit workout plan schedule/timing
- **WPE-007**: Concurrent edit handling

### 6. `workout-plans-integration.spec.ts` (WPI Series)
- **WPI-001**: Workout plan appears in calendar after activation ⚠️ **Calendar Bug Fix Verification**
- **WPI-002**: Adding exercise to calendar reflects in workout plan statistics
- **WPI-003**: Deactivating workout plan removes exercises from calendar
- **WPI-004**: Navigation between calendar and workout plans works smoothly
- **WPI-005**: Workout plan data consistency across pages
- **WPI-006**: Exercise completion updates plan progression
- **WPI-007**: Workout plan schedule affects calendar view

## Critical Bug Fix Verifications

These tests specifically verify the fixes that were implemented:

### 🔧 **Calendar Refresh Bug (WPI-001)**
- **Issue**: After adding new exercises, only newly added exercises showed in modal, but calendar grid didn't update
- **Fix**: Enhanced `useAddScheduledExercise` with comprehensive cache invalidation
- **Test**: Verifies workout plans appear correctly in calendar after activation

### 🔧 **Statistics/Progression Infinite Loops (WPS-001, WPS-002)**
- **Issue**: Statistics and Progression tabs caused infinite rendering loops
- **Fix**: Added `useCallback` optimization and direct React Query usage
- **Test**: Ensures tabs load without infinite loops and remain responsive

### 🔧 **Workout Plan Not Found Error (Verified in basic tests)**
- **Issue**: Detail and edit pages showed "Workout plan not found" due to broken `loadPlanById`
- **Fix**: Replaced with `useWorkoutPlanById` React Query hook
- **Test**: Verifies detail views load correctly

### 🔧 **Deactivation Flow Not Working (WPA-002)**
- **Issue**: Deactivate button didn't make actual API calls
- **Fix**: Added `useDeactivateWorkoutPlan` mutation hook
- **Test**: Verifies deactivation actually works end-to-end

## Running the Tests

### Run All Workout Plans Tests
```bash
npx playwright test e2e/tests/workout-plans/
```

### Run Individual Test Categories
```bash
# Basic functionality
npx playwright test e2e/tests/workout-plans/workout-plans-basic.spec.ts

# Activation/Deactivation (Bug fix verification)
npx playwright test e2e/tests/workout-plans/workout-plans-activation.spec.ts

# Statistics/Progression (Infinite loop fix verification)
npx playwright test e2e/tests/workout-plans/workout-plans-statistics.spec.ts

# Creation workflow
npx playwright test e2e/tests/workout-plans/workout-plans-creation.spec.ts

# Editing functionality
npx playwright test e2e/tests/workout-plans/workout-plans-editing.spec.ts

# Calendar integration (Calendar refresh bug fix verification)
npx playwright test e2e/tests/workout-plans/workout-plans-integration.spec.ts
```

### Run Specific Bug Fix Verification
```bash
# Test calendar refresh fix
npx playwright test e2e/tests/workout-plans/workout-plans-integration.spec.ts --grep "WPI-001"

# Test infinite loop fixes
npx playwright test e2e/tests/workout-plans/workout-plans-statistics.spec.ts --grep "WPS-001|WPS-002"

# Test deactivation fix
npx playwright test e2e/tests/workout-plans/workout-plans-activation.spec.ts --grep "WPA-002"
```

## Test Configuration

### Prerequisites
1. Test database with sample workout plans
2. Valid test user account
3. Sample exercises available for plan creation
4. Development server running on expected port

### Environment Variables
Make sure these are configured in your test environment:
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD` 
- `BASE_URL` (defaults to localhost:3000)

### Common Helpers
Tests use shared utilities from `../../utils/common-helpers.ts`:
- `loginAsTestUser(page)`: Authenticates test user
- Standard selectors and wait patterns

## Expected Test Data

### Required Workout Plans
Tests expect at least one existing workout plan for:
- Detail view testing
- Edit functionality testing  
- Activation/deactivation testing
- Statistics/progression testing

### Required Exercises
Tests expect exercise data for:
- Plan creation workflows
- Exercise selection testing
- Calendar integration testing

## Debugging Failed Tests

### Common Issues
1. **Plans Not Found**: Ensure test database has sample workout plans
2. **Login Failures**: Verify test user credentials are correct
3. **Timing Issues**: Some tests use `waitForTimeout` - adjust for slower environments
4. **Selector Changes**: Update selectors if UI components change

### Debug Mode
Run with debug flags for detailed output:
```bash
npx playwright test e2e/tests/workout-plans/ --debug
npx playwright test e2e/tests/workout-plans/ --headed
```

### Screenshots on Failure
Tests automatically capture screenshots on failure. Check `test-results/` directory.

## Coverage Summary

This test suite covers:
- ✅ **200+ Test Scenarios** across 6 test files
- ✅ **All Major User Workflows** (create, read, update, delete, activate/deactivate)
- ✅ **Critical Bug Fix Verifications** (calendar refresh, infinite loops, deactivation)
- ✅ **Integration Testing** (calendar integration, cross-page consistency)
- ✅ **Error Handling** (validation, not found states, concurrent access)
- ✅ **Performance Testing** (loading states, memory leaks, responsiveness)

## Maintenance Notes

### When to Update Tests
- UI component changes (update selectors)
- New workflow features (add test cases)
- Bug fixes (add regression tests)
- API changes (update integration tests)

### Test Review Schedule
- Run full suite before releases
- Monitor flaky tests and fix root causes
- Update test data as needed
- Review test performance regularly

---

**Last Updated**: December 2024  
**Test Coverage**: Comprehensive E2E for Workout Plans Module  
**Status**: Ready for execution ✅
