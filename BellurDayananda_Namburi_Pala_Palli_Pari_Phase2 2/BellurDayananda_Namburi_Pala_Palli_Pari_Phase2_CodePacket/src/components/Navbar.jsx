import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { HandHeart } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-transparent backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:scale-105 transition-transform duration-300"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
            <HandHeart className="w-5 h-5 text-white" />
          </div>
          P2P
        </Link>
        
        {/* Navigation Links - Only show on home page when not logged in */}
        {isHomePage && !user && (
          <nav className="hidden md:flex items-center gap-x-6">
            
            <a 
              href="#services" 
              onClick={(e) => scrollToSection(e, 'services')}
              className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              Our Services
            </a>
            
            <a 
              href="#pricing" 
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              Pricing
            </a>
            <a 
              href="#about" 
              onClick={(e) => scrollToSection(e, 'about')}
              className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              About Us
            </a>
            
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, 'contact')}
              className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              Contact Us
            </a>
          </nav>
        )}

        <div className="flex items-center gap-x-4">
          {user ? (
            <div className="flex items-center gap-x-4">
              <span className="text-sm text-white/90">Hi, <strong className="text-white">{user.name}</strong></span>
              <Link 
                to="/app" 
                className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-150"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/signin" 
              className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
            >
              Sign Up / Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
