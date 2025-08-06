# Workout Plans E2E Test Outline

## Overview
The Workout Plans system is a comprehensive workout planning and management feature with the following key components:
- Workout plan listing and management
- Workout plan creation wizard
- Workout plan detail view with multiple tabs
- Plan activation/deactivation flows
- Exercise scheduling and calendar integration
- Statistics and progression tracking
- Weekly schedule management

## Test Categories

### 1. Workout Plans List Page (WPL-001 to WPL-020)

#### WPL-001: Workout plans list page loads successfully
- Verify page loads without errors at `/workout-plans`
- Check main components are visible (header, plan grid/list)
- Validate "Create New Plan" button is present
- Verify navigation breadcrumbs

#### WPL-002: Workout plans display correctly
- Verify existing plans show in grid/list format
- Check plan cards show: name, description, level, status
- Validate active vs inactive plan visual indicators
- Test empty state when no plans exist

#### WPL-003: Plan filtering and search
- Test plan filtering by level (beginner/intermediate/advanced)
- Verify search functionality by plan name
- Check filter combinations work correctly
- Test clearing filters

#### WPL-004: Plan sorting functionality
- Test sorting by name, created date, level
- Verify ascending/descending sort directions
- Check sort state persistence

#### WPL-005: Plan actions from list view
- Test "View Details" action
- Verify "Edit Plan" action
- Check "Duplicate Plan" functionality
- Test "Delete Plan" with confirmation
- Verify "Activate/Deactivate Plan" toggle

### 2. Workout Plan Creation Wizard (WPC-001 to WPC-030)

#### WPC-001: Plan creation wizard opens
- Verify "Create New Plan" button navigates to wizard
- Check wizard step indicators display
- Validate first step (Basic Info) loads correctly

#### WPC-002: Basic Info step validation
- Test required field validation (name)
- Verify description field accepts input
- Check level selection (beginner/intermediate/advanced)
- Test form submission validation

#### WPC-003: Mode and dates step
- Test mode selection (ongoing vs dated)
- Verify date picker functionality for dated plans
- Check date validation (end date after start date)
- Test conditional field display

#### WPC-004: Weekly template step
- Verify days of week display correctly
- Test adding exercises to specific days
- Check exercise search and selection
- Verify exercise template configuration (sets, reps, weight)

#### WPC-005: Exercise management within template
- Test drag-and-drop reordering of exercises
- Verify exercise removal functionality
- Check bulk exercise operations
- Test exercise duplication across days

#### WPC-006: Wizard navigation
- Test step-by-step navigation (Next/Previous)
- Verify step validation before proceeding
- Check wizard state persistence
- Test cancel/exit functionality

#### WPC-007: Plan creation completion
- Test final plan creation submission
- Verify success message and redirect
- Check created plan appears in list
- Test error handling for creation failures

### 3. Workout Plan Detail View (WPD-001 to WPD-050)

#### WPD-001: Plan detail page loads
- Verify navigation to plan detail page
- Check all tabs are visible (Schedule, Statistics, Progression, Settings)
- Validate plan header information displays
- Test back navigation functionality

#### WPD-002: Plan header information
- Verify plan name and description display
- Check plan status badges (Active/Currently Active)
- Validate creation date and metadata
- Test plan type and exercise count display

#### WPD-003: Plan action buttons
- Test Edit button navigation
- Verify Duplicate button functionality
- Check Activate/Deactivate button states
- Test Delete button with confirmation dialog

#### WPD-004: Schedule tab functionality
- Verify weekly schedule grid displays
- Check exercises show for each day
- Test read-only mode for schedule display
- Validate exercise details in schedule

#### WPD-005: Statistics tab functionality  
- Verify statistics components load
- Test timeframe selection (week/month/all)
- Check completion rate calculations
- Validate workout streak display
- Test statistics refresh functionality

#### WPD-006: Progression tab functionality
- Verify progression graphs display
- Test exercise progress tracking
- Check trend indicators (up/down/stable)
- Validate data filtering options

#### WPD-007: Settings tab functionality
- Verify plan controls display
- Test plan modification options
- Check advanced settings availability
- Validate settings persistence

### 4. Plan Activation/Deactivation Flow (WPA-001 to WPA-020)

#### WPA-001: Plan activation process
- Test activate button click
- Verify confirmation modal/flow
- Check activation API call
- Validate success message display

#### WPA-002: Post-activation state
- Verify plan status updates to "Active"
- Check only one plan can be active
- Validate UI updates after activation
- Test calendar integration (exercises scheduled)

#### WPA-003: Plan deactivation process
- Test deactivate button on active plan
- Verify deactivation confirmation
- Check deactivation API call
- Validate success message

#### WPA-004: Post-deactivation state
- Verify plan status updates to "Inactive"
- Check no currently active plan state
- Validate UI updates after deactivation
- Test calendar cleanup (exercises removed)

#### WPA-005: Multiple plan activation handling
- Test activating plan when another is active
- Verify previous plan gets deactivated
- Check conflict resolution
- Validate proper state transitions

### 5. Plan Editing and Updates (WPE-001 to WPE-025)

#### WPE-001: Edit plan navigation
- Test edit button navigation to edit page
- Verify edit form pre-populates with current data
- Check edit wizard loads correctly
- Validate cancel functionality

#### WPE-002: Basic info editing
- Test updating plan name
- Verify description modifications
- Check level changes
- Test validation on required fields

#### WPE-003: Weekly template editing
- Test adding new exercises to days
- Verify exercise removal from template
- Check exercise parameter updates (sets/reps/weight)
- Test day template modifications

#### WPE-004: Edit completion and validation
- Test save changes functionality
- Verify update success message
- Check updated data reflects in detail view
- Test error handling for update failures

#### WPE-005: Edit impact on active plans
- Test editing currently active plan
- Verify changes affect scheduled exercises
- Check calendar integration updates
- Validate active plan state maintenance

### 6. Plan Duplication (WPD-001 to WPD-015)

#### WPD-001: Duplicate plan process
- Test duplicate button functionality
- Verify duplication confirmation
- Check new plan creation with modified name
- Test success message and navigation

#### WPD-002: Duplicated plan validation
- Verify duplicated plan appears in list
- Check all template data copied correctly
- Validate new plan has inactive status
- Test duplicated plan independence

### 7. Plan Deletion (WPL-001 to WPL-015)

#### WPL-001: Delete plan confirmation
- Test delete button click
- Verify confirmation dialog displays
- Check warning message content
- Test cancel vs confirm actions

#### WPL-002: Plan deletion execution
- Test confirmed deletion process
- Verify plan removed from list
- Check success message display
- Test error handling for deletion failures

#### WPL-003: Active plan deletion handling
- Test deleting currently active plan
- Verify deactivation before deletion
- Check calendar cleanup
- Validate no active plan state

### 8. Integration Tests (WPI-001 to WPI-030)

#### WPI-001: Calendar integration
- Test plan activation creates scheduled exercises
- Verify exercises appear on calendar
- Check exercise completion affects statistics
- Test plan deactivation removes exercises

#### WPI-002: Statistics accuracy
- Test statistics calculations with real data
- Verify completion rates update correctly
- Check streak calculations
- Test timeframe filtering accuracy

#### WPI-003: Multi-user plan isolation
- Test plans are user-specific
- Verify plan actions don't affect other users
- Check data isolation in statistics

#### WPI-004: Plan and exercise relationship
- Test exercise completion affects plan statistics
- Verify exercise modifications reflect in plans
- Check exercise deletion handling in plans

### 9. Error Handling and Edge Cases (WPE-001 to WPE-020)

#### WPE-001: Network error handling
- Test plan loading with network issues
- Verify error messages display appropriately
- Check retry functionality
- Test offline behavior

#### WPE-002: Invalid plan data handling
- Test accessing non-existent plan
- Verify 404 error handling
- Check graceful degradation
- Test malformed plan data

#### WPE-003: Permission and authorization
- Test unauthorized plan access
- Verify edit restrictions
- Check deletion permissions
- Test cross-user plan access prevention

#### WPE-004: Concurrent modification handling
- Test simultaneous plan edits
- Verify conflict resolution
- Check data consistency
- Test optimistic updates

### 10. Performance and Load Tests (WPP-001 to WPP-015)

#### WPP-001: Plan list loading performance
- Test large number of plans loading
- Verify pagination if implemented
- Check search performance
- Test scroll performance

#### WPP-002: Plan detail loading performance
- Test complex plan loading times
- Verify statistics calculation performance
- Check progression graph rendering
- Test tab switching performance

#### WPP-003: Plan operations performance
- Test plan creation time
- Verify activation/deactivation speed
- Check editing save performance
- Test deletion response time

## Test Data Requirements

### Sample Workout Plans
- **Beginner Full Body**: Simple 3-day routine
- **Intermediate Split**: 4-day upper/lower split
- **Advanced Push/Pull/Legs**: 6-day routine
- **Cardio Plan**: Dated plan with end date
- **Empty Template**: Plan with no exercises

### Exercise Templates
- Strength exercises with sets/reps/weight
- Cardio exercises with duration
- Bodyweight exercises
- Custom exercises

### User Scenarios
- New user with no plans
- User with multiple plans (some active)
- User with completed workout history
- User with partially completed plans

## Test Environment Setup

### Prerequisites
- Test database with sample workout plans
- Sample exercises in database
- Test user accounts with different scenarios
- Mock data for statistics and progression

### Data Cleanup
- Reset active plan state between tests
- Clear scheduled exercises
- Reset statistics data
- Clean up created test plans

## Browser and Device Coverage
- Desktop Chrome, Firefox, Edge, Safari
- Mobile Chrome and Safari (responsive design)
- Tablet view testing
- Keyboard navigation testing
- Screen reader compatibility testing
