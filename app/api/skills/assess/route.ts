import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';

const groq: any = new (Groq as any)({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Check if Clerk is properly configured
    if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: 'Authentication not configured. Please set CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variables.' },
        { status: 500 }
      );
    }

    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { skills } = body;

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'Skills array is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Assess skill levels using AI
    const assessedSkills = await assessSkillLevels(skills, user.experience, user.projects);

    // Update user skills
    user.skills = assessedSkills;
    await user.save();

    return NextResponse.json({
      success: true,
      skills: assessedSkills,
      message: 'Skills assessed and updated successfully'
    });
  } catch (error) {
    console.error('Skill assessment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function assessSkillLevels(
  skills: string[],
  experience: any[],
  projects: any[]
): Promise<Array<{ name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'; yearsOfExperience: number; endorsements: number }>> {
  try {
    console.log('Using mock skill assessment - Groq not yet configured');

    // Mock assessment based on common skill levels
    const skillLevels: Record<string, { level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'; years: number }> = {
      'javascript': { level: 'Advanced', years: 4 },
      'typescript': { level: 'Intermediate', years: 2 },
      'react': { level: 'Advanced', years: 3 },
      'node.js': { level: 'Intermediate', years: 2 },
      'python': { level: 'Intermediate', years: 2 },
      'aws': { level: 'Beginner', years: 1 },
      'docker': { level: 'Intermediate', years: 1 },
      'mongodb': { level: 'Intermediate', years: 2 },
      'postgresql': { level: 'Beginner', years: 1 },
    };

    return skills.map(skill => {
      const normalizedSkill = skill.toLowerCase();
      const assessment = skillLevels[normalizedSkill] || { level: 'Intermediate' as const, years: 2 };

      return {
        name: skill,
        level: assessment.level,
        yearsOfExperience: assessment.years,
        endorsements: 0
      };
    });
  } catch (error) {
    console.error('Skill assessment error:', error);

    // Fallback: assign intermediate level to all skills
    return skills.map(skill => ({
      name: skill,
      level: 'Intermediate' as const,
      yearsOfExperience: 2,
      endorsements: 0
    }));
  }
}
