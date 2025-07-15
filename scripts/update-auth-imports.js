const fs = require('fs');
const path = require('path');

// Function to recursively find files
function findFiles(dir, pattern) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findFiles(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Function to update imports in a file
function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Replace getServerSession import from next-auth
  if (content.includes(`import { getServerSession } from 'next-auth'`)) {
    content = content.replace(
      `import { getServerSession } from 'next-auth'`,
      `import { getServerSession } from '@/lib/utils/auth-helpers'`
    );
    updated = true;
  }
  
  // Replace getServerSession import from next-auth/next
  if (content.includes(`import { getServerSession } from 'next-auth/next'`)) {
    content = content.replace(
      `import { getServerSession } from 'next-auth/next'`,
      `import { getServerSession } from '@/lib/utils/auth-helpers'`
    );
    updated = true;
  }
  
  // Replace authOptions import if it exists
  if (content.includes(`import { authOptions } from '@/app/api/auth/[...nextauth]/route'`)) {
    content = content.replace(
      `import { authOptions } from '@/app/api/auth/[...nextauth]/route'`,
      `// Auth options are now directly used via getServerSession from auth-helpers`
    );
    updated = true;
  }
  
  // Update getServerSession calls if they pass authOptions
  if (content.includes(`await getServerSession(authOptions)`)) {
    content = content.replace(
      /await getServerSession\(authOptions\)/g,
      `await getServerSession()`
    );
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
    return true;
  }
  
  return false;
}

// Main function
async function main() {
  console.log('Updating auth imports in API routes...');
  
  // Find all API route files
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  const apiFiles = findFiles(apiDir, /route\.(ts|js)$/);
  
  // Also check middleware files
  const middlewareDir = path.join(__dirname, '..', 'middleware');
  const middlewareFiles = findFiles(middlewareDir, /\.(ts|js)$/);
  
  // And check utility files
  const utilsDir = path.join(__dirname, '..', 'lib', 'utils');
  const utilsFiles = findFiles(utilsDir, /\.(ts|js)$/);
  
  // Combine all files
  const allFiles = [...apiFiles, ...middlewareFiles, ...utilsFiles];
  
  // Update imports in each file
  let totalUpdated = 0;
  
  for (const file of allFiles) {
    if (updateImportsInFile(file)) {
      totalUpdated++;
    }
  }
  
  console.log(`\nUpdated ${totalUpdated} files`);
}

main().catch(console.error);
