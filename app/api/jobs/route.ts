import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    // Build filter object
    const filters: any = {};

    // Text search
    const search = searchParams.get('search');
    if (search) {
      filters.$text = { $search: search };
    }

    // Location filter
    const location = searchParams.get('location');
    if (location) {
      filters.location = { $regex: location, $options: 'i' };
    }

    // Remote work filter
    const remote = searchParams.get('remote');
    if (remote === 'true') {
      filters.remote = true;
    }

    // Job type filter
    const type = searchParams.get('type');
    if (type) {
      filters.type = type;
    }

    // Experience level filter
    const experienceLevel = searchParams.get('experienceLevel');
    if (experienceLevel) {
      filters.experienceLevel = experienceLevel;
    }

    // Industry filter
    const industry = searchParams.get('industry');
    if (industry) {
      filters.industry = { $regex: industry, $options: 'i' };
    }

    // Salary range filter
    const minSalary = searchParams.get('minSalary');
    const maxSalary = searchParams.get('maxSalary');
    if (minSalary || maxSalary) {
      if (minSalary) {
        filters['salary.min'] = { $gte: parseInt(minSalary) };
      }
      if (maxSalary) {
        filters['salary.max'] = { $lte: parseInt(maxSalary) };
      }
    }

    // Skills filter (jobs that match any of the user's skills)
    const skills = searchParams.get('skills');
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      filters.skills = { $in: skillArray };
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'postedDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortBy] = sortOrder;

    // Execute query
    const jobs = await Job.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filters);
    const totalPages = Math.ceil(totalJobs / limit);

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        totalJobs,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const jobs = await request.json();

    if (!Array.isArray(jobs)) {
      return NextResponse.json(
        { error: 'Jobs must be an array' },
        { status: 400 }
      );
    }

    // Validate and save jobs
    const savedJobs = [];
    for (const jobData of jobs) {
      try {
        const job = new Job(jobData);
        const savedJob = await job.save();
        savedJobs.push(savedJob);
      } catch (error) {
        console.error('Error saving job:', error);
        // Continue with other jobs
      }
    }

    return NextResponse.json({
      success: true,
      savedJobs: savedJobs.length,
      message: `Successfully saved ${savedJobs.length} jobs`
    });
  } catch (error) {
    console.error('Jobs save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
