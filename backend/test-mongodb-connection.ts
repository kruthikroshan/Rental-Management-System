import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  try {
    // Test 1: Check if URI is configured
    console.log('✅ Step 1: Environment Check');
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }
    console.log(`   MongoDB URI configured: ${MONGODB_URI.substring(0, 30)}...`);
    
    // Test 2: Connect to MongoDB
    console.log('\n✅ Step 2: Attempting Connection...');
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ Connected to MongoDB successfully!');
    
    // Test 3: Get connection info
    const db = mongoose.connection;
    console.log('\n✅ Step 3: Connection Details');
    console.log(`   Database: ${db.name}`);
    console.log(`   Host: ${db.host}`);
    console.log(`   Port: ${db.port || 'N/A (MongoDB Atlas)'}`);
    console.log(`   State: ${db.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    
    // Test 4: List collections
    console.log('\n✅ Step 4: Collections');
    const collections = await db.db?.listCollections().toArray();
    if (collections && collections.length > 0) {
      console.log(`   Found ${collections.length} collection(s):`);
      collections.forEach((col: any) => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('   No collections found yet (this is normal for a new database)');
    }
    
    // Test 5: Test a simple operation
    console.log('\n✅ Step 5: Testing Database Operations');
    const testCollection = db.collection('test_connection');
    
    // Insert test document
    await testCollection.insertOne({ 
      test: true, 
      message: 'MongoDB connection test',
      timestamp: new Date() 
    });
    console.log('   ✅ Successfully inserted test document');
    
    // Read test document
    const doc = await testCollection.findOne({ test: true });
    console.log('   ✅ Successfully read test document:', doc?.message);
    
    // Delete test document
    await testCollection.deleteOne({ test: true });
    console.log('   ✅ Successfully deleted test document');
    
    console.log('\n🎉 All MongoDB Connection Tests PASSED!\n');
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Test FAILED:');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    }
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed gracefully\n');
  }
}

// Run the test
testMongoDBConnection();
