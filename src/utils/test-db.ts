import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '.env' });

const testDatabase = async () => {
  try {
    console.log('🔍 Testing database connection...\n');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gbs-ecommerce';
    console.log('📡 Connection URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    // Connect to database
    await connectDatabase();
    
    // Get connection info
    const connection = mongoose.connection;
    const dbName = connection.db?.databaseName;
    const host = connection.host;
    const port = connection.port;
    const readyState = connection.readyState;
    
    console.log('\n✅ Database connected successfully!');
    console.log('📊 Connection Details:');
    console.log(`   - Database Name: ${dbName || 'N/A'}`);
    console.log(`   - Host: ${host || 'N/A'}`);
    console.log(`   - Port: ${port || 'N/A'}`);
    console.log(`   - Ready State: ${readyState} (${getReadyStateName(readyState)})`);
    
    // Test a simple query - list collections
    try {
      const collections = await connection.db?.listCollections().toArray();
      console.log(`\n📁 Collections (${collections?.length || 0}):`);
      if (collections && collections.length > 0) {
        collections.forEach((col) => {
          console.log(`   - ${col.name}`);
        });
      } else {
        console.log('   (No collections found)');
      }
    } catch (error) {
      console.log('\n⚠️  Could not list collections:', (error as Error).message);
    }
    
    // Test server info
    try {
      const adminDb = connection.db?.admin();
      if (adminDb) {
        const serverStatus = await adminDb.serverStatus();
        console.log(`\n🖥️  Server Info:`);
        console.log(`   - MongoDB Version: ${serverStatus.version || 'N/A'}`);
        console.log(`   - Uptime: ${Math.floor((serverStatus.uptime || 0) / 60)} minutes`);
      }
    } catch (error) {
      console.log('\n⚠️  Could not get server info:', (error as Error).message);
    }
    
    console.log('\n✅ Database test completed successfully!');
    
    // Disconnect
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error(error);
    await disconnectDatabase();
    process.exit(1);
  }
};

const getReadyStateName = (state: number): string => {
  const states: { [key: number]: string } = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state] || 'unknown';
};

// Run if called directly
if (require.main === module) {
  testDatabase();
}

