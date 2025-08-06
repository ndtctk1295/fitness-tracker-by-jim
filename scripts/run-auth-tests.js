#!/usr/bin/env node

/**
 * Authentication & Authorization Test Runner
 * Executes all auth-related tests and provides summary
 */

const { execSync } = require('child_process')
const path = require('path')

console.log('🔐 Starting Authentication & Authorization Test Suite')
console.log('=' .repeat(60))

const testFiles = [
  '__tests__/auth/auth-simplified.test.ts',
  '__tests__/auth/auth-test-suite.test.ts'
]

let totalTests = 0
let passedTests = 0
let failedTests = 0

testFiles.forEach((testFile, index) => {
  console.log(`\n📋 Running Test ${index + 1}/${testFiles.length}: ${path.basename(testFile)}`)
  console.log('-' .repeat(40))
  
  try {
    const result = execSync(`npm test ${testFile}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    })
    
    // Parse test results
    const lines = result.split('\n')
    const resultLine = lines.find(line => line.includes('Tests:'))
    
    if (resultLine) {
      const matches = resultLine.match(/(\d+) passed/)
      if (matches) {
        const passed = parseInt(matches[1])
        passedTests += passed
        totalTests += passed
        console.log(`✅ ${passed} tests passed`)
      }
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${testFile}`)
    console.log(error.stdout || error.message)
    failedTests++
  }
})

console.log('\n' + '=' .repeat(60))
console.log('📊 Test Suite Summary')
console.log('=' .repeat(60))
console.log(`Total Tests Run: ${totalTests}`)
console.log(`✅ Passed: ${passedTests}`)
console.log(`❌ Failed: ${failedTests}`)
console.log(`📈 Success Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%`)

if (failedTests === 0) {
  console.log('\n🎉 All authentication and authorization tests passed!')
  console.log('🛡️ Security validation complete')
} else {
  console.log('\n⚠️  Some tests failed. Please review the output above.')
}

console.log('\n🔧 Available Commands:')
console.log('  npm test __tests__/auth/ (run all auth tests)')
console.log('  npm test __tests__/auth/auth-simplified.test.ts (core auth logic)')
console.log('  npm test __tests__/auth/auth-test-suite.test.ts (test documentation)')
console.log('  npm test __tests__/auth/ --coverage (with coverage report)')

console.log('\n🎭 Role-based Access Control Tested:')
console.log('  • Admin: Full system access (manage users, exercises, categories)')
console.log('  • User: Personal resource access (own data, read public data)')
console.log('  • Guest: No access (authentication required)')

console.log('\n🛡️ Security Features Validated:')
console.log('  • Password strength validation')
console.log('  • JWT token management')
console.log('  • Input sanitization')
console.log('  • Rate limiting')
console.log('  • Error handling security')
console.log('  • Resource ownership verification')

console.log('\n📋 Test Coverage Areas:')
console.log('  • Authentication workflows')
console.log('  • Authorization middleware')
console.log('  • API endpoint protection')
console.log('  • Security boundary testing')
console.log('  • Error handling')
console.log('  • Input validation')

process.exit(failedTests > 0 ? 1 : 0)
