# CareerPrep AI - AI-Powered Career Preparation Platform

An intelligent career platform that uses AI to analyze resumes, match candidates with job opportunities, and provide personalized career insights.

## Features

### 🚀 Core Functionality
- **PDF Resume Upload**: Drag-and-drop PDF resume upload with validation
- **AI-Powered Resume Analysis**: Extract skills, experience, education, and projects using OpenAI GPT
- **Smart Job Matching**: Intelligent algorithm that matches candidates with relevant job opportunities
- **Real-time Job Scraping**: Automated scraping from Indeed, LinkedIn, and other job boards
- **Comprehensive Dashboard**: User-friendly interface to view profile, skills, and job matches
- **Skill Assessment**: AI-driven skill proficiency evaluation and gap analysis

### 🎯 Key Features
- **Resume Parsing**: Automatic extraction of key information from PDF resumes
- **Profile Building**: Structured user profiles with skills, experience, and preferences
- **Job Recommendations**: Personalized job matches based on skills and career goals
- **Career Analytics**: Insights into skill gaps, career progression, and market trends
- **Authentication**: Secure Clerk authentication
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **React Dropzone** - File upload functionality
- **Clerk** - Authentication

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database for user profiles and job data
- **Mongoose** - MongoDB object modeling
- **Groq AI** - AI-powered resume analysis and matching

### AI & Data Processing
- **OpenAI API** - Resume parsing and skill assessment
- **Puppeteer** - Web scraping for job listings
- **Cheerio** - HTML parsing for scraped data
- **PDF-parse** - PDF text extraction

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database (local or cloud)
- Groq API key
- Clerk account (for authentication)
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web_dev_hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the project root with the following variables:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/career-platform

   # Clerk Authentication (Required for all features - get from Clerk Dashboard)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

   # Groq AI API (Required for resume analysis - get from Groq Console)
   GROQ_API_KEY=your_groq_api_key

   # File Upload
   UPLOAD_DIR=./uploads
   ```

   **Important**: The Clerk environment variables are required for authentication. Without them, users cannot sign in and the app will show "Unauthorized" errors.

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` with your connection string

5. **Clerk Setup**
   - Go to [Clerk Dashboard](https://clerk.com/)
   - Create a new application
   - Copy the publishable key and secret key
   - Configure sign-in/sign-up options (email, social providers)
   - Update environment variables with your Clerk keys

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Resume Management
- `POST /api/resume/upload` - Upload and process PDF resume
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update user profile

### Job Management
- `GET /api/jobs` - Get filtered job listings
- `POST /api/jobs/scrape` - Trigger job scraping
- `POST /api/jobs/match` - Get personalized job matches

### Skills & Assessment
- `POST /api/skills/assess` - Assess user skills with AI

### Authentication
- `/api/auth/[...nextauth]` - NextAuth.js endpoints

## Database Schema

### User Model
```typescript
{
  email: string;
  name: string;
  skills: Array<{
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    yearsOfExperience: number;
  }>;
  experience: Array<{
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
  }>;
  preferences: {
    jobTitles: string[];
    locations: string[];
    remoteWork: boolean;
  };
}
```

### Job Model
```typescript
{
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  applicationUrl: string;
  source: string;
  experienceLevel: string;
}
```

## Usage Guide

### For Job Seekers

1. **Sign Up**: Create an account using Google OAuth
2. **Upload Resume**: Drag and drop your PDF resume
3. **AI Analysis**: Wait for AI to analyze your resume (usually takes 30-60 seconds)
4. **View Dashboard**: Explore your profile, skills assessment, and job matches
5. **Apply to Jobs**: Click on matched jobs to apply directly

### For Developers

#### Adding New Job Sources
1. Extend the `JobScraperService` class in `lib/jobScrapers.ts`
2. Implement scraping logic for new job boards
3. Update the scrape API endpoint to include new sources

#### Customizing AI Prompts
1. Modify prompts in `app/api/resume/upload/route.ts`
2. Adjust parsing logic for different resume formats
3. Update skill assessment prompts in `app/api/skills/assess/route.ts`

#### Extending the Matching Algorithm
1. Modify `JobMatcher` class in `lib/jobMatcher.ts`
2. Adjust scoring weights and criteria
3. Add new matching factors (e.g., company culture, work-life balance)

## Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
GROQ_API_KEY=your_groq_api_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@careerprep.ai or create an issue in the repository.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Integration with LinkedIn and other professional networks
- [ ] Resume optimization suggestions
- [ ] Interview preparation module
- [ ] Salary negotiation tools
- [ ] Career path recommendations