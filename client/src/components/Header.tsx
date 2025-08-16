"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
              PulseMail
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
            <Link 
              href="/auth" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="#about" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                About
              </Link>
              <Link href="#contact" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Contact
              </Link>
              <Link href="/auth" className="block px-3 py-2 bg-blue-600 text-white rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
