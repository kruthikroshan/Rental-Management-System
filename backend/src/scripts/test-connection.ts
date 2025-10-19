import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'rental_management',
  synchronize: false,
  logging: true,
  entities: [],
});

const testConnection = async () => {
  try {
    console.log('🏓 Testing PostgreSQL connection...');
    console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Username: ${process.env.DB_USERNAME}`);
    
    await AppDataSource.initialize();
    console.log('✅ PostgreSQL connected successfully!');
    
    const result = await AppDataSource.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1]);
    
    await AppDataSource.destroy();
    console.log('📤 Connection closed');
    
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your credentials in .env file');
    console.log('3. Ensure the database exists');
    console.log('4. Try: createdb rental_management');
  }
};

testConnection();
