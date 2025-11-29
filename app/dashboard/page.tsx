'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  summary?: string;
  skills: Array<{
    name: string;
    level: string;
    yearsOfExperience: number;
  }>;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
  }>;
  contactInfo: {
    location?: string;
  };
}

interface JobMatch {
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    remote: boolean;
    type: string;
    description: string;
    skills: string[];
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
    applicationUrl: string;
    postedDate: string;
  };
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin?redirect=/dashboard');
      return;
    }

    if (isLoaded && user) {
      loadDashboardData();
    }
  }, [isLoaded, user, router]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load user profile
      const profileResponse = await fetch('/api/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.profile);
      }

      // Load job matches
      const matchesResponse = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options: { limit: 20 } }),
      });

      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        setJobMatches(matchesData.matches);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Welcome to CareerPrep AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload your resume to get started with personalized job matching.
          </p>
          <Button onClick={() => router.push('/upload')}>
            Upload Resume
          </Button>
        </div>
      </div>
    );
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Advanced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Beginner': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {profile.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here&apos;s your career dashboard with personalized job matches
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="jobs">Job Matches</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.skills.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Job Matches</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobMatches.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Experience</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.experience.length} roles</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Education</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.education.length} degrees</div>
                </CardContent>
              </Card>
            </div>

            {/* Top Job Matches */}
            <Card>
              <CardHeader>
                <CardTitle>Top Job Matches</CardTitle>
                <CardDescription>
                  Jobs that best match your profile and skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobMatches.slice(0, 5).map((match, index) => (
                    <div key={match.job._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{match.job.title}</h3>
                          <Badge variant="secondary">{match.job.company}</Badge>
                          <Badge variant="outline" className={getSkillLevelColor('Intermediate')}>
                            {Math.round(match.score * 100)}% match
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {match.job.location}
                          </span>
                          {match.job.salary && (
                            <span>
                              ${match.job.salary.min.toLocaleString()} - ${match.job.salary.max.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {match.job.description}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <a href={match.job.applicationUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Apply
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                    <p className="text-lg">{profile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                    <p>{profile.email}</p>
                  </div>
                  {profile.contactInfo.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
                      <p>{profile.contactInfo.location}</p>
                    </div>
                  )}
                  {profile.summary && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Summary</label>
                      <p className="mt-1">{profile.summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4">
                        <h3 className="font-semibold">{exp.title}</h3>
                        <p className="text-blue-600 dark:text-blue-400">{exp.company}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(exp.startDate)} - {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </p>
                        <p className="text-sm mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index}>
                        <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                        <p className="text-blue-600 dark:text-blue-400">{edu.institution}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Matches ({jobMatches.length})</CardTitle>
                <CardDescription>
                  Jobs ranked by how well they match your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobMatches.map((match, index) => (
                    <Card key={match.job._id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold">{match.job.title}</h3>
                              <Badge variant="secondary">{match.job.company}</Badge>
                              <Badge className={getSkillLevelColor('Intermediate')}>
                                {Math.round(match.score * 100)}% match
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {match.job.location} {match.job.remote && '(Remote)'}
                              </span>
                              <span>{match.job.type}</span>
                              {match.job.salary && (
                                <span>
                                  ${match.job.salary.min.toLocaleString()} - ${match.job.salary.max.toLocaleString()}
                                </span>
                              )}
                            </div>

                            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                              {match.job.description}
                            </p>

                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium">Matched Skills:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {match.matchedSkills.map((skill, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {match.missingSkills.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium">Missing Skills:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {match.missingSkills.map((skill, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <span className="text-sm font-medium">Why this matches:</span>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {match.reasons.map((reason, i) => (
                                    <li key={i}>• {reason}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <Button asChild className="ml-4">
                            <a href={match.job.applicationUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Apply Now
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Your Skills ({profile.skills.length})
                </CardTitle>
                <CardDescription>
                  Skills extracted from your resume with proficiency levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{skill.name}</h3>
                        <Badge className={getSkillLevelColor(skill.level)}>
                          {skill.level}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Experience</span>
                          <span>{skill.yearsOfExperience} years</span>
                        </div>
                        <Progress value={(skill.yearsOfExperience / 10) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
