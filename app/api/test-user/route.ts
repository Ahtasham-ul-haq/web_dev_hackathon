import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST() {
  try {
    console.log('Testing user creation...');
    await connectToDatabase();

    // Create a test user
    const testUser = new User({
      clerkId: 'test-user-' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      resumeText: 'This is a test resume',
      contactInfo: {
        email: 'test@example.com'
      },
      skills: [{
        name: 'JavaScript',
        level: 'Intermediate' as const,
        yearsOfExperience: 2,
        endorsements: 0
      }],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      languages: [],
      preferences: {
        jobTitles: [],
        locations: [],
        remoteWork: false,
        salaryRange: { min: 0, max: 0, currency: 'USD' },
        industries: []
      }
    });

    console.log('Saving test user...');
    const savedUser = await testUser.save();
    console.log('Test user saved successfully:', savedUser._id);

    return NextResponse.json({
      success: true,
      userId: savedUser._id,
      message: 'Test user created successfully'
    });
  } catch (error: any) {
    console.error('Test user creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Failed to create test user'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Testing user retrieval...');
    await connectToDatabase();

    const users = await User.find({}, 'clerkId name email').limit(5);
    console.log('Found users:', users.length);

    return NextResponse.json({
      success: true,
      userCount: users.length,
      users: users,
      message: 'Users retrieved successfully'
    });
  } catch (error: any) {
    console.error('User retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Failed to retrieve users'
      },
      { status: 500 }
    );
  }
}
