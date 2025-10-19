import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

console.log('🔍 Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Nikhil6136',
  database: process.env.DB_NAME || 'rental_db',
  synchronize: false,
  logging: true,
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    await testDataSource.initialize();
    console.log('✅ Database connection successful!');
    await testDataSource.destroy();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
}

testConnection();
