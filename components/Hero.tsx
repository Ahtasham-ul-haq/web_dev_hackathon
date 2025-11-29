<<<<<<< HEAD
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
=======
import React from "react";
import { Upload, Sparkles, FileSearch, Zap } from "lucide-react";

interface HeroProps {
  onGetStarted?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-8 py-15">
      <div className="max-w-5xl mx-auto text-center">
        {/* Main Heading */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Your Resume
            <br />
            <span className="text-yellow-300">Into Insights</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Upload your resume and let AI extract, analyze, and structure your
            professional profile in seconds
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={onGetStarted}
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Get Started Free
          </button>

          <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all">
            Watch Demo
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition-all">
            <div className="bg-yellow-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <FileSearch className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Smart Extraction</h3>
            <p className="text-white/80 text-sm">
              Automatically extract key information from any resume format
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition-all">
            <div className="bg-pink-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
            <p className="text-white/80 text-sm">
              Advanced AI understands context and technical skills
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-white/20 transition-all">
            <div className="bg-green-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Instant Results</h3>
            <p className="text-white/80 text-sm">
              Get structured insights in seconds, not hours
            </p>
          </div>
        </div>

        {/* Stats or Social Proof */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-white">
          <div>
            <div className="text-4xl font-bold">10K+</div>
            <div className="text-white/70">Resumes Analyzed</div>
          </div>
          <div>
            <div className="text-4xl font-bold">95%</div>
            <div className="text-white/70">Accuracy Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold">2sec</div>
            <div className="text-white/70">Average Time</div>
>>>>>>> 4bb8243bce7a3e6c66fb365577a9235d01716344
          </div>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Hero;
=======
export default Hero;
>>>>>>> 4bb8243bce7a3e6c66fb365577a9235d01716344
