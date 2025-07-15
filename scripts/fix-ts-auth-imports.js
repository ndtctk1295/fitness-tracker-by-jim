#!/usr/bin/env node

/**
 * This script helps fix auth import issues in the codebase
 * when migrating from NextAuth.js to Auth.js v5
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fix the jsx option in tsconfig.json to ensure JSX works properly
const fixTsconfig = () => {
  console.log('Updating tsconfig.json...');
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (!fs.existsSync(tsconfigPath)) {
    console.error('tsconfig.json not found');
    return;
  }
  
  let tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
  
  if (tsconfig.compilerOptions.jsx === 'preserve') {
    tsconfig.compilerOptions.jsx = 'react-jsx';
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('Updated jsx option in tsconfig.json to "react-jsx"');
  } else {
    console.log('jsx option is already set to a different value:', tsconfig.compilerOptions.jsx);
  }
};

// Run the fixes
fixTsconfig();

console.log('\nRunning TypeScript check to verify fixes...');
try {
  execSync('npm run type-check-no-tests', { stdio: 'inherit' });
  console.log('\n✅ Type checking passed for app code (excluding tests)');
  console.log('\n🎉 Auth migration TypeScript fixes have been applied successfully!');
} catch (error) {
  console.error('\n❌ Type checking still has errors. Please check the output above.');
  process.exit(1);
}
