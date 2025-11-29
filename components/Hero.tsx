'use client';

import React from 'react';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Upload, Search, TrendingUp } from 'lucide-react';

const Hero = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Your AI-Powered
            <span className="text-blue-600 dark:text-blue-400"> Career Platform</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Upload your resume and let our AI find the perfect job matches. Get personalized career insights,
            skill assessments, and connect with opportunities that fit your profile.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {isSignedIn ? (
              <>
                <Link href="/upload">
                  <Button size="lg" className="text-lg px-8 py-3">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Your Resume
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Get Started Free
                </Button>
              </Link>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Smart Resume Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI extracts skills, experience, and qualifications from your resume automatically
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Job Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find jobs that perfectly match your skills, experience, and career goals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Career Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get detailed analytics and recommendations to advance your career
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
              <div className="text-gray-600 dark:text-gray-400">Resumes Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">50K+</div>
              <div className="text-gray-600 dark:text-gray-400">Job Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">95%</div>
              <div className="text-gray-600 dark:text-gray-400">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;