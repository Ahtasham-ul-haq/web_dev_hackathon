import puppeteer, { Browser, Page } from 'puppeteer';
import { connectToDatabase } from './mongodb';
import Job from '@/models/Job';

export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  remote: boolean;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  benefits?: string[];
  industry: string;
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive';
  postedDate: Date;
  applicationDeadline?: Date;
  applicationUrl: string;
  source: string;
  sourceUrl: string;
  companyInfo?: {
    size?: string;
    industry: string;
    description?: string;
    website?: string;
  };
}

export class JobScraperService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeJobsFromIndeed(searchTerm: string = 'software engineer', location: string = 'remote', limit: number = 50): Promise<ScrapedJob[]> {
    if (!this.browser) await this.initialize();

    const jobs: ScrapedJob[] = [];
    const page = await this.browser!.newPage();

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}&l=${encodeURIComponent(location)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle0' });

      // Wait for job cards to load
      await page.waitForSelector('[data-jk]', { timeout: 10000 });

      const jobElements = await page.$$('[data-jk]');

      for (let i = 0; i < Math.min(jobElements.length, limit); i++) {
        try {
          const jobElement = jobElements[i];
          const jobData = await this.extractIndeedJobData(jobElement, page);
          if (jobData) {
            jobs.push(jobData);
          }
        } catch (error) {
          console.error('Error extracting job data:', error);
        }
      }

    } catch (error) {
      console.error('Error scraping Indeed:', error);
    } finally {
      await page.close();
    }

    return jobs;
  }

  async scrapeJobsFromLinkedIn(searchTerm: string = 'software engineer', location: string = 'United States', limit: number = 50): Promise<ScrapedJob[]> {
    if (!this.browser) await this.initialize();

    const jobs: ScrapedJob[] = [];
    const page = await this.browser!.newPage();

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // LinkedIn requires login for full access, so we'll use their public job search
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle0' });

      // Wait for job cards to load
      await page.waitForSelector('.job-search-card', { timeout: 10000 });

      const jobElements = await page.$$('.job-search-card');

      for (let i = 0; i < Math.min(jobElements.length, limit); i++) {
        try {
          const jobElement = jobElements[i];
          const jobData = await this.extractLinkedInJobData(jobElement, page);
          if (jobData) {
            jobs.push(jobData);
          }
        } catch (error) {
          console.error('Error extracting LinkedIn job data:', error);
        }
      }

    } catch (error) {
      console.error('Error scraping LinkedIn:', error);
    } finally {
      await page.close();
    }

    return jobs;
  }

  private async extractIndeedJobData(jobElement: any, page: Page): Promise<ScrapedJob | null> {
    try {
      const jobData = await page.evaluate((element) => {
        const title = element.querySelector('h2 a span')?.textContent?.trim() ||
                     element.querySelector('h2 a')?.textContent?.trim();

        const company = element.querySelector('[data-testid="company-name"]')?.textContent?.trim() ||
                       element.querySelector('.companyName')?.textContent?.trim();

        const location = element.querySelector('[data-testid="job-location"]')?.textContent?.trim() ||
                        element.querySelector('.companyLocation')?.textContent?.trim();

        const salary = element.querySelector('[data-testid="salary-snippet"]')?.textContent?.trim() ||
                      element.querySelector('.salary-snippet')?.textContent?.trim();

        const description = element.querySelector('.job-snippet')?.textContent?.trim();

        const jobLink = element.querySelector('h2 a')?.getAttribute('href');
        const fullJobUrl = jobLink ? (jobLink.startsWith('http') ? jobLink : `https://www.indeed.com${jobLink}`) : '';

        const postedDate = element.querySelector('[data-testid="job-posted-date"]')?.textContent?.trim() ||
                          element.querySelector('.date')?.textContent?.trim();

        return {
          title: title || '',
          company: company || '',
          location: location || '',
          salary: salary || '',
          description: description || '',
          applicationUrl: fullJobUrl,
          postedDate: postedDate || ''
        };
      }, jobElement);

      if (!jobData.title || !jobData.company) return null;

      // Parse salary information
      const salaryInfo = this.parseSalary(jobData.salary);

      // Determine job type and experience level (simplified)
      const jobType = this.determineJobType(jobData.title, jobData.description);
      const experienceLevel = this.determineExperienceLevel(jobData.title, jobData.description);

      // Extract skills from description (basic keyword extraction)
      const skills = this.extractSkillsFromDescription(jobData.description);

      return {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        remote: jobData.location.toLowerCase().includes('remote'),
        type: jobType,
        description: jobData.description,
        requirements: [], // Would need to scrape individual job pages for detailed requirements
        responsibilities: [],
        skills,
        salary: salaryInfo,
        benefits: [],
        industry: 'Technology', // Default, could be improved
        experienceLevel,
        postedDate: this.parsePostedDate(jobData.postedDate),
        applicationUrl: jobData.applicationUrl,
        source: 'Indeed',
        sourceUrl: jobData.applicationUrl,
        companyInfo: {
          industry: 'Technology'
        }
      };
    } catch (error) {
      console.error('Error extracting Indeed job data:', error);
      return null;
    }
  }

  private async extractLinkedInJobData(jobElement: any, page: Page): Promise<ScrapedJob | null> {
    try {
      const jobData = await page.evaluate((element) => {
        const title = element.querySelector('.job-search-card__title')?.textContent?.trim();
        const company = element.querySelector('.job-search-card__company-name')?.textContent?.trim();
        const location = element.querySelector('.job-search-card__location')?.textContent?.trim();
        const description = element.querySelector('.job-search-card__snippet')?.textContent?.trim();
        const jobLink = element.querySelector('a')?.getAttribute('href');

        return {
          title: title || '',
          company: company || '',
          location: location || '',
          description: description || '',
          applicationUrl: jobLink || ''
        };
      }, jobElement);

      if (!jobData.title || !jobData.company) return null;

      // Extract skills from description
      const skills = this.extractSkillsFromDescription(jobData.description);

      // Determine job type and experience level
      const jobType = this.determineJobType(jobData.title, jobData.description);
      const experienceLevel = this.determineExperienceLevel(jobData.title, jobData.description);

      return {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        remote: jobData.location.toLowerCase().includes('remote'),
        type: jobType,
        description: jobData.description,
        requirements: [],
        responsibilities: [],
        skills,
        benefits: [],
        industry: 'Technology',
        experienceLevel,
        postedDate: new Date(),
        applicationUrl: jobData.applicationUrl,
        source: 'LinkedIn',
        sourceUrl: jobData.applicationUrl,
        companyInfo: {
          industry: 'Technology'
        }
      };
    } catch (error) {
      console.error('Error extracting LinkedIn job data:', error);
      return null;
    }
  }

  private parseSalary(salaryText: string): ScrapedJob['salary'] | undefined {
    if (!salaryText) return undefined;

    // Basic salary parsing - this could be much more sophisticated
    const numbers = salaryText.match(/[\d,]+/g);
    if (!numbers) return undefined;

    const amounts = numbers.map(num => parseInt(num.replace(/,/g, '')));
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    let period: 'hourly' | 'monthly' | 'yearly' = 'yearly';
    if (salaryText.toLowerCase().includes('hour')) period = 'hourly';
    else if (salaryText.toLowerCase().includes('month')) period = 'monthly';

    return {
      min,
      max,
      currency: 'USD',
      period
    };
  }

  private determineJobType(title: string, description: string): ScrapedJob['type'] {
    const text = (title + ' ' + description).toLowerCase();

    if (text.includes('contract') || text.includes('freelance') || text.includes('consultant')) {
      return 'Contract';
    }
    if (text.includes('part time') || text.includes('part-time')) {
      return 'Part-time';
    }
    if (text.includes('intern') || text.includes('internship')) {
      return 'Internship';
    }
    if (text.includes('freelance')) {
      return 'Freelance';
    }

    return 'Full-time';
  }

  private determineExperienceLevel(title: string, description: string): ScrapedJob['experienceLevel'] {
    const text = (title + ' ' + description).toLowerCase();

    if (text.includes('senior') || text.includes('sr.') || text.includes('lead') || text.includes('principal')) {
      return 'Senior Level';
    }
    if (text.includes('junior') || text.includes('jr.') || text.includes('entry') || text.includes('graduate')) {
      return 'Entry Level';
    }
    if (text.includes('executive') || text.includes('director') || text.includes('vp') || text.includes('chief')) {
      return 'Executive';
    }

    return 'Mid Level';
  }

  private extractSkillsFromDescription(description: string): string[] {
    const skillKeywords = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
      'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask', 'spring',
      'html', 'css', 'sass', 'tailwind', 'bootstrap',
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
      'machine learning', 'ai', 'data science', 'tensorflow', 'pytorch'
    ];

    const foundSkills = skillKeywords.filter(skill =>
      description.toLowerCase().includes(skill.toLowerCase())
    );

    return [...new Set(foundSkills)]; // Remove duplicates
  }

  private parsePostedDate(postedDateText: string): Date {
    if (!postedDateText) return new Date();

    const text = postedDateText.toLowerCase();

    if (text.includes('today')) return new Date();
    if (text.includes('yesterday')) {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    }

    const daysMatch = text.match(/(\d+)\s*days?\s*ago/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date;
    }

    return new Date();
  }

  async saveJobsToDatabase(jobs: ScrapedJob[]): Promise<void> {
    await connectToDatabase();

    for (const jobData of jobs) {
      try {
        // Check if job already exists (by title, company, and source)
        const existingJob = await Job.findOne({
          title: jobData.title,
          company: jobData.company,
          source: jobData.source
        });

        if (!existingJob) {
          const job = new Job(jobData);
          await job.save();
        }
      } catch (error) {
        console.error('Error saving job to database:', error);
      }
    }
  }
}

// Export singleton instance
export const jobScraper = new JobScraperService();
