import { config } from 'dotenv';
import { resolve } from 'path';

console.log('Loading environment variables...');
const envPath = resolve(process.cwd(), '.env.local');
console.log('Env file path:', envPath);

const result = config({ path: envPath });
console.log('Config result:', result);

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '[HIDDEN]' : 'undefined');
