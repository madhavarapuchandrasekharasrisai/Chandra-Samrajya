import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { pbkdf2Sync, randomBytes } from 'crypto';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

// Manual .env loader for maximum reliability
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.warn('Failed to parse .env file manually:', e.message);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('\n✗ Error: DATABASE_URL is not set in your .env file!');
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

// Define user schema locally for isolated script run without typescript compilation overhead
const userTable = pgTable('User', {
  id: varchar('id', { length: 30 }).primaryKey(),
  name: varchar('name'),
  email: varchar('email'),
  password: varchar('password').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// Secure hash helper
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=============================================');
console.log('👑 DHANAVI SAMRAJYA — SECURITY COMMAND CENTER');
console.log('=============================================\n');

rl.question('Enter Admin Name (e.g., Chandra): ', (name) => {
  rl.question('Enter Login Email (e.g., chandra@samrajya.co): ', (email) => {
    rl.question('Enter Secure Password: ', async (password) => {
      if (!name || !email || !password) {
        console.error('\n✗ Error: All fields are strictly required!');
        rl.close();
        process.exit(1);
      }

      console.log('\nSyncing with database archive...');

      try {
        const hashedPassword = hashPassword(password);
        const generateId = () => Math.random().toString(36).substring(2, 15);

        const [createdUser] = await db.insert(userTable).values({
          id: generateId(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        }).returning();

        console.log(`\n✓ Success! Sovereign Admin Account Created:`);
        console.log(`---------------------------------------------`);
        console.log(`ID:      ${createdUser.id}`);
        console.log(`Name:    ${createdUser.name}`);
        console.log(`Email:   ${createdUser.email}`);
        console.log(`---------------------------------------------`);
      } catch (err) {
        console.error('\n✗ Transaction failed:', err.message);
      } finally {
        await client.end();
        rl.close();
      }
    });
  });
});
