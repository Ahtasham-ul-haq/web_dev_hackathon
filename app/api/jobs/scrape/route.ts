import { NextRequest, NextResponse } from 'next/server';
import { jobScraper } from '@/lib/jobScrapers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchTerm = 'software engineer', location = 'remote', sources = ['indeed', 'linkedin'], limit = 50 } = body;

    if (!Array.isArray(sources)) {
      return NextResponse.json(
        { error: 'Sources must be an array' },
        { status: 400 }
      );
    }

    const allJobs = [];

    // Scrape from Indeed
    if (sources.includes('indeed')) {
      try {
        console.log('Scraping Indeed...');
        const indeedJobs = await jobScraper.scrapeJobsFromIndeed(searchTerm, location, limit);
        allJobs.push(...indeedJobs);
        console.log(`Scraped ${indeedJobs.length} jobs from Indeed`);
      } catch (error) {
        console.error('Error scraping Indeed:', error);
      }
    }

    // Scrape from LinkedIn
    if (sources.includes('linkedin')) {
      try {
        console.log('Scraping LinkedIn...');
        const linkedinJobs = await jobScraper.scrapeJobsFromLinkedIn(searchTerm, location, limit);
        allJobs.push(...linkedinJobs);
        console.log(`Scraped ${linkedinJobs.length} jobs from LinkedIn`);
      } catch (error) {
        console.error('Error scraping LinkedIn:', error);
      }
    }

    // Save jobs to database
    if (allJobs.length > 0) {
      await jobScraper.saveJobsToDatabase(allJobs);
    }

    return NextResponse.json({
      success: true,
      jobsScraped: allJobs.length,
      message: `Successfully scraped ${allJobs.length} jobs from ${sources.join(', ')}`
    });
  } catch (error) {
    console.error('Job scraping error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
