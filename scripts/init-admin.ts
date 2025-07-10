import connectToMongoDB from '../lib/mongodb';
import { createUser } from '../lib/services/user-service';

/**
 * This script creates an admin user in the database
 * Usage:
 * 1. Add this code to scripts/init-admin.ts
 * 2. Run with: npx ts-node ./scripts/init-admin.ts
 */

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123456';  // Change this in production!

async function initAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    
    console.log('Creating admin user...');
    const adminUser = await createUser({
      name: 'Administrator',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    
    console.log('Admin user created successfully:');
    console.log(`- Name: ${adminUser.name}`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Role: ${adminUser.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

initAdmin();
