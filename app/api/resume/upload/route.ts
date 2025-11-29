import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import * as pdfParse from 'pdf-parse';
import Groq from 'groq';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';

// const groq = new Groq(process.env.GROQ_API_KEY!);

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
        { error: 'Unauthorized - Please sign in first' },
        { status: 401 }
      );
    }

    // Check for required environment variables
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: GROQ_API_KEY not set' },
        { status: 500 }
      );
    }


    // Connect to database
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const pdfData = await (pdfParse as any)(buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json(
        { error: 'Unable to extract text from PDF. Please ensure the PDF contains readable text.' },
        { status: 400 }
      );
    }

    // Save file to disk (optional - for backup)
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Use AI to parse resume content
    let parsedResume;
    try {
      parsedResume = await parseResumeWithAI(resumeText);
    } catch (aiError) {
      console.error('AI parsing error:', aiError);
      return NextResponse.json(
        { error: 'Failed to analyze resume content. Please try again.' },
        { status: 500 }
      );
    }

    // Check if user profile already exists
    try {
      console.log('Checking for existing user with clerkId:', userId);
      let user = await User.findOne({ clerkId: userId });
      console.log('User found in database:', user ? 'YES' : 'NO');

      if (user) {
        // Update existing user
        console.log('Updating existing user profile...');
        user = await updateUserProfile(user, parsedResume);
        console.log('User profile updated successfully');
      } else {
        // Create new user profile
        console.log('Creating new user profile...');
        user = await createUserProfile(userId, parsedResume);
        console.log('New user profile created successfully');
      }

      console.log('Final user data:', {
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        skillsCount: user.skills?.length || 0
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save user profile to database. Please try again.' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      fileName,
      filePath,
      resumeText: resumeText.substring(0, 500) + '...', // Truncated for response
      parsedData: parsedResume,
      message: 'Resume uploaded and processed successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function parseResumeWithAI(resumeText: string) {
  try {
    // Temporary mock response until Groq is properly configured
    console.log('Using mock AI response - Groq not yet configured');

    // Extract basic information from resume text
    const nameMatch = resumeText.match(/(?:^|\n)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
    const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

    return {
      personalInfo: {
        name: nameMatch ? nameMatch[1] : 'Unknown',
        email: emailMatch ? emailMatch[1] : '',
        phone: '',
        location: '',
        linkedin: '',
        github: ''
      },
      summary: 'Professional summary extracted from resume',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      experience: [{
        title: 'Software Developer',
        company: 'Tech Company',
        location: '',
        startDate: '01/2020',
        endDate: 'Present',
        current: true,
        description: 'Developed web applications using modern technologies',
        technologies: ['JavaScript', 'React', 'Node.js']
      }],
      education: [{
        institution: 'University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '09/2016',
        endDate: '05/2020',
        gpa: ''
      }],
      projects: [{
        name: 'Portfolio Website',
        description: 'Personal portfolio website built with React',
        technologies: ['React', 'JavaScript', 'CSS'],
        url: ''
      }],
      certifications: ['AWS Certified Developer'],
      languages: ['JavaScript', 'Python', 'Java']
    };
  } catch (error) {
    console.error('AI parsing error:', error);
    // Return basic fallback structure
    return {
      personalInfo: {},
      summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      languages: []
    };
  }
}

async function createUserProfile(clerkId: string, parsedData: any): Promise<any> {
  try {
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
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    throw error;
  }
}

async function updateUserProfile(existingUser: any, parsedData: any): Promise<any> {
  try {
    // Update user data with new parsed information
    existingUser.name = parsedData.personalInfo?.name || existingUser.name;
    existingUser.contactInfo = {
      ...existingUser.contactInfo,
      phone: parsedData.personalInfo?.phone || existingUser.contactInfo.phone,
      linkedin: parsedData.personalInfo?.linkedin || existingUser.contactInfo.linkedin,
      github: parsedData.personalInfo?.github || existingUser.contactInfo.github,
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
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
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
