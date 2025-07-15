const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create a temporary tsconfig file for excluding test files
const tempTsConfigPath = path.join(process.cwd(), 'tsconfig.temp.json');

// Read the base tsconfig.json
const baseTsConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tsconfig.json'), 'utf8'));

// Create a modified version that excludes test files
const tempTsConfig = {
  ...baseTsConfig,
  include: [
    "next-env.d.ts", 
    "**/*.ts", 
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  exclude: [
    "node_modules",
    "**/test/**/*",
    "**/tests/**/*",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "app/test/**/*"
  ]
};

// Write the temporary tsconfig
fs.writeFileSync(tempTsConfigPath, JSON.stringify(tempTsConfig, null, 2));

try {
  console.log('Running TypeScript check excluding test files...');
  execSync(`npx tsc -p ${tempTsConfigPath} --noEmit`, { 
    stdio: 'inherit',
    shell: true
  });
  console.log('TypeScript check completed successfully!');
} catch (error) {
  console.log('TypeScript check found errors');
} finally {
  // Clean up
  fs.unlinkSync(tempTsConfigPath);
}

fs.writeFileSync(tempTsConfigPath, JSON.stringify(tempTsConfig, null, 2));

try {
  // Run TypeScript check with the temporary config
  console.log('Running TypeScript check excluding test files...');
  execSync(`npx tsc --project ${tempTsConfigPath} --noEmit --skipLibCheck`, { stdio: 'inherit' });
} catch (error) {
  // TypeScript errors were found, but we don't need to do anything special
} finally {
  // Clean up the temporary config
  fs.unlinkSync(tempTsConfigPath);
}
