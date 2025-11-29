import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Check if Clerk is properly configured
    if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: 'Authentication not configured. Please set CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variables.' },
        { status: 500 }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Clerk is properly configured
    if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: 'Authentication not configured. Please set CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variables.' },
        { status: 500 }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { parsedResumeData } = body;

    if (!parsedResumeData) {
      return NextResponse.json(
        { error: 'Parsed resume data is required' },
        { status: 400 }
      );
    }

    // Check if user profile already exists
    let user = await User.findOne({ clerkId: userId });

    if (user) {
      // Update existing user
      user = await updateUserProfile(user, parsedResumeData);
    } else {
      // Create new user profile
      user = await createUserProfile(userId, parsedResumeData);
    }

    return NextResponse.json({
      success: true,
      profile: user,
      message: 'Profile created/updated successfully'
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createUserProfile(clerkId: string, parsedData: any): Promise<IUser> {
  // Transform parsed data to match our schema
  const userData = {
    clerkId,
    email: parsedData.personalInfo?.email || '',
    name: parsedData.personalInfo?.name || 'Unknown',
    contactInfo: {
      email: parsedData.personalInfo?.email || '',
      phone: parsedData.personalInfo?.phone || '',
      linkedin: parsedData.personalInfo?.linkedin || '',
      github: parsedData.personalInfo?.github || '',
      location: parsedData.personalInfo?.location || ''
    },
    summary: parsedData.summary || '',
    skills: mapSkillsToLevels(parsedData.skills || []),
    experience: mapExperienceData(parsedData.experience || []),
    education: mapEducationData(parsedData.education || []),
    projects: mapProjectData(parsedData.projects || []),
    certifications: parsedData.certifications || [],
    languages: (parsedData.languages || []).map((lang: string) => ({
      language: lang,
      proficiency: 'Fluent' as const
    })),
    preferences: {
      jobTitles: [],
      locations: [parsedData.personalInfo?.location || ''],
      remoteWork: false,
      industries: []
    }
  };

  const user = new User(userData);
  return await user.save();
}

async function updateUserProfile(existingUser: IUser, parsedData: any): Promise<IUser> {
  // Update user data with new parsed information
  existingUser.name = parsedData.personalInfo?.name || existingUser.name;
  existingUser.contactInfo = {
    ...existingUser.contactInfo,
    email: existingUser.contactInfo.email, // Preserve required email field
    phone: parsedData.personalInfo?.phone || existingUser.contactInfo.phone,
    linkedin: parsedData.personalInfo?.linkedin || existingUser.contactInfo.linkedin,
    github: parsedData.personalInfo?.github || existingUser.contactInfo.github,
    portfolio: parsedData.personalInfo?.portfolio || existingUser.contactInfo.portfolio,
    location: parsedData.personalInfo?.location || existingUser.contactInfo.location
  };
  existingUser.summary = parsedData.summary || existingUser.summary;
  existingUser.skills = mapSkillsToLevels(parsedData.skills || []);
  existingUser.experience = mapExperienceData(parsedData.experience || []);
  existingUser.education = mapEducationData(parsedData.education || []);
  existingUser.projects = mapProjectData(parsedData.projects || []);
  existingUser.certifications = parsedData.certifications || existingUser.certifications;
  existingUser.languages = (parsedData.languages || []).map((lang: string) => ({
    language: lang,
    proficiency: 'Fluent' as const
  }));

  return await existingUser.save();
}

function mapSkillsToLevels(skills: string[]) {
  // This is a simplified mapping - in a real app, you'd use AI or manual assessment
  return skills.map(skill => ({
    name: skill,
    level: 'Intermediate' as const, // Default level
    yearsOfExperience: 2, // Default
    endorsements: 0
  }));
}

function mapExperienceData(experience: any[]) {
  return experience.map(exp => ({
    title: exp.title || '',
    company: exp.company || '',
    location: exp.location || '',
    startDate: parseDate(exp.startDate),
    endDate: exp.endDate === 'Present' ? undefined : parseDate(exp.endDate),
    current: exp.current || exp.endDate === 'Present',
    description: exp.description || '',
    skills: exp.technologies || []
  }));
}

function mapEducationData(education: any[]) {
  return education.map(edu => ({
    institution: edu.institution || '',
    degree: edu.degree || '',
    field: edu.field || '',
    startDate: parseDate(edu.startDate),
    endDate: parseDate(edu.endDate),
    gpa: edu.gpa ? parseFloat(edu.gpa) : undefined,
    achievements: []
  }));
}

function mapProjectData(projects: any[]) {
  return projects.map(project => ({
    name: project.name || '',
    description: project.description || '',
    technologies: project.technologies || [],
    url: project.url || '',
    githubUrl: '',
    highlights: []
  }));
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // Handle MM/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 2) {
    const month = parseInt(parts[0]) - 1; // JavaScript months are 0-indexed
    const year = parseInt(parts[1]);
    return new Date(year, month, 1);
  }

  // Try to parse as regular date
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
}
