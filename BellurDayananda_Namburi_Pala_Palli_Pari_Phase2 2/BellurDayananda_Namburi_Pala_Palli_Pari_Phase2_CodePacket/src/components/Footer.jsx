import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  function goToSection(id) {
    if (isHome) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  }

  const Column = ({ title, links }) => (
    <div className="footer-col">
      <h4 className="footer-col-title">{title}</h4>
      <ul className="footer-col-list">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="footer-link">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-gray-900 text-gray-300 mt-8">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-white text-xl font-bold">P2P</div>
            </div>
            <p className="text-sm text-gray-400">Connect with tutors and fellow learners. Small description or tagline can live here.</p>
          </div>

          {/* Simplified single column with the six items (non-clickable) */}
          <div className="col-span-1 md:col-span-4">
            <div className="grid grid-cols-3 gap-6 md:gap-8">
              <div>
                <button onClick={() => goToSection('about')} className="text-white font-semibold hover:text-gray-200 transition-colors">About Us</button>
              </div>
              <div>
                <button onClick={() => goToSection('services')} className="text-white font-semibold hover:text-gray-200 transition-colors">Services / Features</button>
              </div>
              <div>
                <button onClick={() => goToSection('pricing')} className="text-white font-semibold hover:text-gray-200 transition-colors">Pricing / Plans</button>
              </div>
              <div>
                <button onClick={() => goToSection('testimonials')} className="text-white font-semibold hover:text-gray-200 transition-colors">Testimonials / Reviews</button>
              </div>
              <div>
                <button onClick={() => goToSection('contact')} className="text-white font-semibold hover:text-gray-200 transition-colors">Contact Us</button>
              </div>
            </div>
          </div>

        </div>

        {/* Legal/social/app-badges row removed as requested */}

        <div className="mt-6 text-sm text-gray-500">© {year} P2P™ Ltd. All rights reserved.</div>
      </div>
    </footer>
  );
}
