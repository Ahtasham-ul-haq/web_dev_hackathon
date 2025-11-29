import { connectToDatabase } from './mongodb';
import Job from '@/models/Job';
import User, { IUser } from '@/models/User';

export interface JobMatch {
  job: any;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

export class JobMatcher {
  /**
   * Find and rank jobs that match a user's profile
   */
  async findMatchingJobs(
    userId: string,
    options: {
      limit?: number;
      location?: string;
      remote?: boolean;
      minScore?: number;
    } = {}
  ): Promise<JobMatch[]> {
    await connectToDatabase();

    const { limit = 50, location, remote, minScore = 0.3 } = options;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all jobs from database
    const jobQuery: any = {};

    // Apply location filter
    if (location) {
      jobQuery.location = { $regex: location, $options: 'i' };
    }

    if (remote !== undefined) {
      jobQuery.remote = remote;
    }

    const jobs = await Job.find(jobQuery).sort({ postedDate: -1 }).limit(200);

    // Calculate match scores for each job
    const jobMatches: JobMatch[] = [];

    for (const job of jobs) {
      const match = this.calculateJobMatch(user, job);
      if (match.score >= minScore) {
        jobMatches.push(match);
      }
    }

    // Sort by score (descending)
    jobMatches.sort((a, b) => b.score - a.score);

    // Return top matches
    return jobMatches.slice(0, limit);
  }

  /**
   * Calculate how well a job matches a user's profile
   */
  private calculateJobMatch(user: IUser, job: any): JobMatch {
    let totalScore = 0;
    const maxScore = 100;
    const reasons: string[] = [];
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    // Extract user skills
    const userSkills = user.skills.map(s => s.name.toLowerCase());
    const jobSkills = job.skills.map((s: string) => s.toLowerCase());

    // Skill matching (40% weight)
    const skillMatches = jobSkills.filter((skill: string) =>
      userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    );

    const skillMatchScore = jobSkills.length > 0 ? (skillMatches.length / jobSkills.length) * 40 : 0;
    totalScore += skillMatchScore;

    if (skillMatches.length > 0) {
      reasons.push(`Matches ${skillMatches.length} of your skills`);
      matchedSkills.push(...skillMatches);
    }

    // Missing skills
    const missing = jobSkills.filter((skill: string) =>
      !userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    );
    missingSkills.push(...missing);

    // Experience level matching (20% weight)
    const experienceMatch = this.calculateExperienceMatch(user, job);
    totalScore += experienceMatch.score * 20;
    reasons.push(experienceMatch.reason);

    // Location preference (15% weight)
    const locationScore = this.calculateLocationMatch(user, job);
    totalScore += locationScore * 15;

    if (locationScore > 0) {
      reasons.push('Matches your location preferences');
    }

    // Job title relevance (10% weight)
    const titleScore = this.calculateTitleMatch(user, job);
    totalScore += titleScore * 10;

    if (titleScore > 0.5) {
      reasons.push('Job title aligns with your preferences');
    }

    // Industry preference (10% weight)
    const industryScore = this.calculateIndustryMatch(user, job);
    totalScore += industryScore * 10;

    if (industryScore > 0) {
      reasons.push('Matches your preferred industries');
    }

    // Salary compatibility (5% weight) - if salary info is available
    if (job.salary && user.preferences?.salaryRange) {
      const salaryScore = this.calculateSalaryMatch(user, job);
      totalScore += salaryScore * 5;

      if (salaryScore > 0.7) {
        reasons.push('Salary range matches your expectations');
      }
    }

    return {
      job,
      score: Math.min(totalScore / maxScore, 1), // Normalize to 0-1
      matchedSkills,
      missingSkills,
      reasons
    };
  }

  private calculateExperienceMatch(user: IUser, job: any): { score: number; reason: string } {
    const userExperienceYears = this.calculateUserExperienceYears(user);
    const jobLevel = job.experienceLevel;

    let expectedYears: [number, number];

    switch (jobLevel) {
      case 'Entry Level':
        expectedYears = [0, 2];
        break;
      case 'Mid Level':
        expectedYears = [2, 5];
        break;
      case 'Senior Level':
        expectedYears = [5, 10];
        break;
      case 'Executive':
        expectedYears = [10, 20];
        break;
      default:
        expectedYears = [0, 20];
    }

    const [min, max] = expectedYears;
    let score = 0;

    if (userExperienceYears >= min && userExperienceYears <= max) {
      score = 1;
    } else if (userExperienceYears < min) {
      score = Math.max(0, userExperienceYears / min * 0.5); // Partial match if close
    } else {
      score = Math.max(0, 1 - (userExperienceYears - max) / (max + 2)); // Partial match if slightly over
    }

    const reason = `Your ${userExperienceYears} years of experience ${score > 0.7 ? 'matches' : score > 0.3 ? 'partially matches' : `may be ${userExperienceYears < min ? 'insufficient' : 'more than needed'}`} for ${jobLevel} roles`;

    return { score, reason };
  }

  private calculateUserExperienceYears(user: IUser): number {
    // Calculate total years of experience from work history
    let totalYears = 0;

    for (const exp of user.experience) {
      if (exp.startDate) {
        const startDate = new Date(exp.startDate);
        const endDate = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());

        const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        totalYears += Math.max(0, years);
      }
    }

    // Also consider years from skills
    const skillYears = user.skills.reduce((sum, skill) => sum + (skill.yearsOfExperience || 0), 0);

    return Math.max(totalYears, skillYears / user.skills.length || 0);
  }

  private calculateLocationMatch(user: IUser, job: any): number {
    if (!user.preferences?.locations || user.preferences.locations.length === 0) {
      return job.remote ? 1 : 0.5; // Prefer remote if no preferences
    }

    const userLocations = user.preferences.locations.map(loc => loc.toLowerCase());
    const jobLocation = job.location.toLowerCase();

    // Check for exact matches
    if (userLocations.some(loc => jobLocation.includes(loc) || loc.includes(jobLocation))) {
      return 1;
    }

    // Check for remote work
    if (job.remote && user.preferences.remoteWork) {
      return 0.8;
    }

    return 0;
  }

  private calculateTitleMatch(user: IUser, job: any): number {
    if (!user.preferences?.jobTitles || user.preferences.jobTitles.length === 0) {
      return 0.5; // Neutral if no preferences
    }

    const userTitles = user.preferences.jobTitles.map(title => title.toLowerCase());
    const jobTitle = job.title.toLowerCase();

    // Check for keyword matches
    const matches = userTitles.filter(title =>
      jobTitle.includes(title) || title.includes(jobTitle) ||
      this.hasCommonKeywords(title, jobTitle)
    );

    return matches.length > 0 ? 1 : 0;
  }

  private calculateIndustryMatch(user: IUser, job: any): number {
    if (!user.preferences?.industries || user.preferences.industries.length === 0) {
      return 0.5; // Neutral if no preferences
    }

    const userIndustries = user.preferences.industries.map(ind => ind.toLowerCase());
    const jobIndustry = job.industry.toLowerCase();

    return userIndustries.some(ind => jobIndustry.includes(ind) || ind.includes(jobIndustry)) ? 1 : 0;
  }

  private calculateSalaryMatch(user: IUser, job: any): number {
    if (!user.preferences?.salaryRange || !job.salary) {
      return 0.5;
    }

    const userMin = user.preferences.salaryRange.min;
    const userMax = user.preferences.salaryRange.max;
    const jobMin = job.salary.min;
    const jobMax = job.salary.max;

    // Convert to same period if needed
    const normalizedJobMin = this.normalizeSalary(jobMin, job.salary.period);
    const normalizedJobMax = this.normalizeSalary(jobMax, job.salary.period);
    const normalizedUserMin = this.normalizeSalary(userMin, user.preferences.salaryRange.currency === 'yearly' ? 'yearly' : 'yearly');
    const normalizedUserMax = this.normalizeSalary(userMax, user.preferences.salaryRange.currency === 'yearly' ? 'yearly' : 'yearly');

    // Check if ranges overlap
    if (normalizedJobMax >= normalizedUserMin && normalizedJobMin <= normalizedUserMax) {
      return 1;
    }

    // Partial match if close
    const overlap = Math.min(normalizedJobMax, normalizedUserMax) - Math.max(normalizedJobMin, normalizedUserMin);
    if (overlap > 0) {
      return Math.max(0.3, overlap / Math.min(normalizedJobMax - normalizedJobMin, normalizedUserMax - normalizedUserMin));
    }

    return 0;
  }

  private normalizeSalary(amount: number, period: string): number {
    // Normalize to yearly salary (rough approximation)
    switch (period) {
      case 'hourly':
        return amount * 40 * 52; // 40 hours/week * 52 weeks
      case 'monthly':
        return amount * 12;
      case 'yearly':
      default:
        return amount;
    }
  }

  private hasCommonKeywords(str1: string, str2: string): boolean {
    const keywords1 = str1.split(/\s+/).filter(word => word.length > 2);
    const keywords2 = str2.split(/\s+/).filter(word => word.length > 2);

    return keywords1.some(keyword => keywords2.includes(keyword));
  }
}

// Export singleton instance
export const jobMatcher = new JobMatcher();
