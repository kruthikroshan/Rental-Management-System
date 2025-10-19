import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'rental_user',
  // password: 'rental_password', // Try without password for trust auth on 127.0.0.1
  database: 'rental_db',
});

console.log('🔄 Testing direct pg connection...');

try {
  await client.connect();
  console.log('✅ Connected successfully!');
  
  const result = await client.query('SELECT current_user, current_database(), version()');
  console.log('📊 Query result:', result.rows[0]);
  
  await client.end();
  console.log('🔌 Connection closed');
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  console.error('Full error:', error);
}
