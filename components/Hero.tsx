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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
