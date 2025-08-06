# Authentication & Authorization Test Suite

This comprehensive test suite validates the security and functionality of the authentication and authorization system for the fitness tracker application.

## 📋 Test Suite Overview

The test suite consists of four main test files that cover all aspects of authentication and authorization:

### 1. Authorization Middleware Tests (`authorization-middleware.test.ts`)
- **Purpose**: Tests the admin authorization middleware
- **Coverage**: 195 test cases
- **Key Areas**:
  - Admin access validation
  - Role hierarchy verification
  - Resource ownership checks
  - Token validation and parsing
  - Error handling scenarios
  - Edge cases and security boundaries

### 2. API Authorization Tests (`api-authorization.test.ts`)
- **Purpose**: Tests authorization for API endpoints
- **Coverage**: 120+ test cases
- **Key Areas**:
  - Admin-only endpoint protection
  - User-accessible endpoint validation
  - Resource ownership verification
  - Security boundary testing
  - Authorization headers handling
  - Request context preservation

### 3. Auth Integration Tests (`auth-integration.test.ts`)
- **Purpose**: Tests complete authentication workflows
- **Coverage**: 80+ test cases
- **Key Areas**:
  - User registration flow
  - Login and password verification
  - Session management and JWT handling
  - Role-based access control
  - Security validation and input sanitization
  - Error handling and rate limiting

### 4. Test Suite Runner (`auth-test-suite.test.ts`)
- **Purpose**: Orchestrates and documents the entire test suite
- **Features**:
  - Test coverage overview
  - Security checklist validation
  - Role permission matrix
  - Execution guidance

## 🔐 Authentication System Architecture

### Authentication Components
- **NextAuth.js**: JWT-based authentication with custom credentials provider
- **Password Security**: bcrypt hashing with 12-round salt
- **Session Management**: JWT tokens with configurable expiration
- **Role System**: Hierarchical access control (admin > user > guest)

### Authorization Components
- **Middleware Protection**: Route-level authorization using `isAdmin` middleware
- **API Endpoint Security**: Role-based access control for all API routes
- **Resource Ownership**: User-level access control for personal data
- **Permission System**: Granular permissions based on user roles

## 🛡️ Security Features Tested

### Input Validation
- Email format validation
- Username format validation (3-20 chars, alphanumeric)
- Password strength requirements (8+ chars, mixed case, numbers)
- Input sanitization against XSS and injection attacks

### Access Control
- JWT token validation and expiration
- Role-based endpoint protection
- Resource ownership verification
- Admin privilege escalation prevention

### Security Boundaries
- Malformed token handling
- Invalid role validation
- Unauthorized access prevention
- Rate limiting implementation

## 🎭 Role Permission Matrix

### Admin Role
- `read:all` - Read any resource
- `write:all` - Modify any resource
- `delete:all` - Delete any resource
- `manage:users` - User management
- `manage:exercises` - Exercise management
- `manage:categories` - Category management

### User Role
- `read:own` - Read own resources
- `write:own` - Modify own resources
- `delete:own` - Delete own resources
- `read:exercises` - View available exercises
- `read:categories` - View exercise categories

### Guest Role
- No permissions (authentication required)

## 🔒 Protected Endpoints

### Admin-Only Endpoints
- `POST /api/exercises` - Create exercises
- `PUT /api/exercises/:id` - Update exercises
- `DELETE /api/exercises/:id` - Delete exercises
- `POST /api/categories` - Create categories
- `PUT /api/categories/:id` - Update categories
- `DELETE /api/categories/:id` - Delete categories
- `GET /api/admin/*` - Admin dashboard features
- `POST /api/users/manage` - User management

### User-Accessible Endpoints
- `GET /api/exercises/available` - View available exercises
- `GET /api/scheduled-exercises` - View user's scheduled exercises
- `POST /api/scheduled-exercises` - Create scheduled exercise
- `PUT /api/scheduled-exercises/:id` - Update own scheduled exercise
- `DELETE /api/scheduled-exercises/:id` - Delete own scheduled exercise
- `GET /api/weights` - View weight records
- `POST /api/weights` - Add weight record
- `GET /api/workout-plans` - View workout plans
- `POST /api/workout-plans` - Create workout plan
- `GET /api/users/profile` - View own profile
- `PUT /api/users/profile` - Update own profile

## 🚀 Running the Tests

### Run All Auth Tests
```bash
npm test __tests__/auth/
```

### Run Individual Test Files
```bash
# Authorization middleware tests
npm test __tests__/auth/authorization-middleware.test.ts

# API authorization tests
npm test __tests__/auth/api-authorization.test.ts

# Authentication integration tests
npm test __tests__/auth/auth-integration.test.ts

# Test suite overview
npm test __tests__/auth/auth-test-suite.test.ts
```

### Run with Coverage
```bash
npm test __tests__/auth/ --coverage
```

### Watch Mode
```bash
npm test __tests__/auth/ --watch
```

## 📊 Test Statistics

- **Total Test Cases**: 400+ scenarios
- **Authorization Middleware**: 195 test cases
- **API Authorization**: 120+ test cases
- **Auth Integration**: 80+ test cases
- **Security Validation**: 50+ edge cases
- **Error Handling**: 30+ error scenarios

## 🔧 Test Configuration

### Prerequisites
```bash
npm install --save-dev jest @types/jest
npm install bcryptjs next-auth
```

### Environment Setup
- Tests use mocked NextAuth JWT functions
- bcrypt operations are mocked for performance
- No database connection required
- All tests are isolated and independent

## 📝 Test Patterns

### Authorization Testing Pattern
```typescript
it('should allow admin to access protected resource', async () => {
  mockGetToken.mockResolvedValue({
    role: 'admin',
    sub: 'admin123'
  })

  const hasAccess = await checkAdminAccess(request)
  expect(hasAccess).toBe(true)
})
```

### Error Handling Pattern
```typescript
it('should handle malformed token gracefully', async () => {
  mockGetToken.mockResolvedValue({
    // Missing required fields
    invalidField: 'value'
  })

  const isValid = validateToken(token)
  expect(isValid).toBe(false)
})
```

### Security Validation Pattern
```typescript
it('should sanitize dangerous input', () => {
  const dangerousInput = '<script>alert("xss")</script>'
  const sanitized = sanitizeInput(dangerousInput)
  expect(sanitized).not.toContain('<script>')
})
```

## 🚨 Security Test Checklist

- ✅ Password hashing and verification
- ✅ JWT token validation and expiration
- ✅ Role-based access control
- ✅ Resource ownership verification
- ✅ Input validation and sanitization
- ✅ Rate limiting implementation
- ✅ Error message security (no information leakage)
- ✅ Session management
- ✅ Admin privilege protection
- ✅ API endpoint authorization
- ✅ Middleware security boundaries
- ✅ Malformed data handling

## 🔍 Manual Testing Complement

While this test suite provides comprehensive automated testing, consider these manual testing scenarios:

1. **Browser Session Testing**
   - Login/logout flow in browser
   - Session persistence across page refreshes
   - Multiple tab behavior

2. **API Testing with Tools**
   - Postman/Insomnia API requests
   - Different authorization headers
   - Malformed request payloads

3. **Security Penetration Testing**
   - SQL injection attempts
   - XSS payload testing
   - CSRF attack simulation
   - JWT token manipulation

## 🤝 Contributing

When adding new authentication features:

1. Add corresponding test cases to appropriate test file
2. Update role permission matrix if roles change
3. Document new security boundaries
4. Add endpoint protection tests for new API routes
5. Update this documentation with changes

## 📚 Related Documentation

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Jest Testing Framework](https://jestjs.io/)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc7519)
- [bcrypt Password Hashing](https://www.npmjs.com/package/bcryptjs)
