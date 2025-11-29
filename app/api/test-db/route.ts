import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('Testing database connection...');
    await connectToDatabase();

    // Get database name and connection info
    const mongoose = require('mongoose');
    const dbName = mongoose.connection.db.databaseName;
    console.log('Connected to database:', dbName);
    console.log('Full connection string:', process.env.MONGODB_URI);
    console.log('Mongoose connection readyState:', mongoose.connection.readyState);
    console.log('Mongoose connection name:', mongoose.connection.name);
    console.log('Mongoose connection db:', mongoose.connection.db?.databaseName);

    // Try to count users (this might fail due to SSL)
    let userCount = 0;
    let users: any[] = [];

    try {
      userCount = await User.countDocuments();
      console.log('Total users in database:', userCount);

      // List all users (basic info only)
      users = await User.find({}, 'clerkId name email').limit(10);
      console.log('Sample users:', users.map(u => ({
        clerkId: u.clerkId,
        name: u.name,
        email: u.email
      })));
    } catch (countError) {
      console.error('Error counting users:', countError);
      return NextResponse.json(
        {
          success: false,
          database: dbName,
          error: countError instanceof Error ? countError.message : String(countError),
          message: 'Connected to database but operations failed'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      database: dbName,
      userCount,
      sampleUsers: users,
      message: 'Database connection successful'
    });
  } catch (error: unknown) {
    console.error('Database test error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'Database connection failed'
      },
      { status: 500 }
    );
  }
}
