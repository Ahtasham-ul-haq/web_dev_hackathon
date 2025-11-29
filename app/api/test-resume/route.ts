import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing resume creation without auth...');
    await connectToDatabase();

    // Create a test user with resume data (simulating what resume upload should do)
    const testUser = new User({
      clerkId: 'resume-test-user-' + Date.now(),
      email: 'resume-test@example.com',
      name: 'Resume Test User',
      resumeText: 'This is a test resume text extracted from PDF. It contains information about skills, experience, and education.',
      contactInfo: {
        email: 'resume-test@example.com',
        phone: '123-456-7890',
        location: 'Test City, TC'
      },
      summary: 'Experienced software developer with expertise in web technologies.',
      skills: [
        {
          name: 'JavaScript',
          level: 'Advanced' as const,
          yearsOfExperience: 5,
          endorsements: 0
        },
        {
          name: 'React',
          level: 'Intermediate' as const,
          yearsOfExperience: 3,
          endorsements: 0
        }
      ],
      experience: [
        {
          title: 'Software Developer',
          company: 'Test Company',
          location: 'Test City',
          startDate: new Date('2020-01-01'),
          endDate: new Date('2023-12-31'),
          current: false,
          description: 'Developed web applications using modern technologies.',
          skills: ['JavaScript', 'React', 'Node.js']
        }
      ],
      education: [
        {
          institution: 'Test University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: new Date('2016-09-01'),
          endDate: new Date('2020-05-01')
        }
      ],
      projects: [],
      certifications: ['AWS Certified Developer'],
      languages: [
        {
          language: 'English',
          proficiency: 'Fluent' as const
        }
      ],
      preferences: {
        jobTitles: ['Software Developer', 'Full Stack Developer'],
        locations: ['Test City', 'Remote'],
        remoteWork: true,
        salaryRange: { min: 50000, max: 80000, currency: 'USD' },
        industries: ['Technology', 'Software']
      }
    });

    console.log('Saving resume test user...');
    const savedUser = await testUser.save();
    console.log('Resume test user saved successfully:', savedUser._id);

    return NextResponse.json({
      success: true,
      userId: savedUser._id,
      message: 'Resume test user created successfully'
    });
  } catch (error: any) {
    console.error('Resume test creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Failed to create resume test user'
      },
      { status: 500 }
    );
  }
}
