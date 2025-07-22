// scripts/init-admin.js

const { MongoClient } = require("mongodb");

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "@dmin!2#4%6"; // Change this in production!

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set!");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // Use default DB from URI
    const users = db.collection("users");

    // Check if admin already exists
    const existing = await users.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log("Admin user already exists:", existing.email);
      process.exit(0);
    }

    // Hash password (use bcrypt if available, else store plain for demo)
    let password = ADMIN_PASSWORD;
    try {
      const bcrypt = require("bcrypt");
      password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    } catch {
      console.warn("bcrypt not found, storing plain password (not secure!)");
    }

    const adminUser = {
      name: "Administrator",
      email: ADMIN_EMAIL,
      password,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await users.insertOne(adminUser);
    console.log("Admin user created successfully:");
    console.log(`- Name: ${adminUser.name}`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Role: ${adminUser.role}`);
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin user:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();