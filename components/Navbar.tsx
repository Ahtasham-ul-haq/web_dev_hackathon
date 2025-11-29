"use client";

import React, { useState } from "react";
import { Upload, Menu, X } from "lucide-react";

interface NavbarProps {
  onUploadClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onUploadClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-white rounded-lg p-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
                RS
              </span>
            </div>
            <span className="text-white text-2xl font-bold">ReSphere</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {/* ADD MORE LINKS HERE - Example below */}
            {/* <a href="#features" className="text-white/90 hover:text-white transition-colors font-medium">
              Features
            </a>
            <a href="#pricing" className="text-white/90 hover:text-white transition-colors font-medium">
              Pricing
            </a>
            <a href="#about" className="text-white/90 hover:text-white transition-colors font-medium">
              About
            </a> */}
          </div>

          {/* Desktop Upload Button */}
          <div className="hidden md:flex items-center space-x-4">
            {/* ADD MORE BUTTONS HERE - Example below */}
            {/* <button className="text-white hover:text-yellow-300 transition-colors font-medium">
              Sign In
            </button> */}

            <button
              onClick={onUploadClick}
              className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 hover:text-indigo-700 transition-all shadow-md flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Resume
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            {/* ADD MOBILE LINKS HERE - Example below */}
            {/* <a
              href="#features"
              className="block text-white/90 hover:text-white transition-colors font-medium py-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block text-white/90 hover:text-white transition-colors font-medium py-2"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="block text-white/90 hover:text-white transition-colors font-medium py-2"
            >
              About
            </a> */}

            {/* ADD MOBILE BUTTONS HERE */}
            {/* <button className="w-full text-left text-white/90 hover:text-white transition-colors font-medium py-2">
              Sign In
            </button> */}

            <button
              onClick={onUploadClick}
              className="w-full bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 hover:text-indigo-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Resume
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
