import { NextRequest, NextResponse } from 'next/server';
import { jobMatcher } from '@/lib/jobMatcher';
import { auth } from '@clerk/nextjs/server';

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

    const body = await request.json();
    const { options = {} } = body;

    const matches = await jobMatcher.findMatchingJobs(clerkUserId, options);

    return NextResponse.json({
      success: true,
      matches,
      totalMatches: matches.length
    });
  } catch (error) {
    console.error('Job matching error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
