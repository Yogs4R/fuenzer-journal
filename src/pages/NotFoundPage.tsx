import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, ArrowRight, Home, Feather } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Footer } from '../components/Footer';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#fbfaf5] text-[#2c2c26] flex flex-col justify-between selection:bg-[#7d8461] selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-[#ecece0] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#7d8461] flex items-center justify-center text-white shadow-xs group-hover:bg-[#6c7351] transition">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-serif italic font-bold text-base text-[#2c2c26]">
              Fuenzer Journal
            </span>
          </Link>

          <Link
            to={user ? '/app' : '/'}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5c5c52] hover:text-[#2c2c26] bg-[#f4f4ea] hover:bg-[#ecece0] border border-[#e8e8df] px-3 py-1.5 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{user ? 'Go to Journal' : 'Home'}</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-lg w-full text-center bg-white border border-[#ecece0] p-8 sm:p-12 shadow-sm rounded-none">
          <div className="w-14 h-14 mx-auto bg-[#7d8461]/10 border border-[#7d8461]/25 flex items-center justify-center text-[#7d8461] mb-5">
            <Compass className="w-7 h-7" />
          </div>

          <span className="font-mono text-xs font-bold text-[#7d8461] tracking-widest uppercase block mb-1">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#2c2c26]">
            Lost in Reflection?
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-[#5c5c52] leading-relaxed italic">
            &ldquo;Even in wandering, clarity can be found. The page you are looking for does not exist or has been relocated.&rdquo;
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>

            <Link
              to={user ? '/app' : '/login'}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#f4f4ea] hover:bg-[#ecece0] border border-[#e8e8df] text-[#2c2c26] text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <Feather className="w-3.5 h-3.5 text-[#7d8461]" />
              <span>{user ? 'Open Reflection Studio' : 'Sign In to Journal'}</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[#ecece0] flex items-center justify-center gap-4 text-xs text-[#5c5c52]">
            <Link to="/privacy" className="hover:underline hover:text-[#2c2c26]">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:underline hover:text-[#2c2c26]">
              Terms of Service
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
