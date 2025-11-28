import { Link, useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();

  // Helper: if we're on the home page, use anchor-scroll links
  const isHome = location.pathname === '/';

  const navigate = useNavigate();

  const items = [
    { id: 'about', to: '#about', label: 'About Us' },
    { id: 'services', to: '#services', label: 'Services' },
    { id: 'tutors', to: '/tutors', label: 'Tutors' }, 
    { id: 'pricing', to: '#pricing', label: 'Pricing' },
    { id: 'testimonials', to: '#testimonials', label: 'Testimonials' },
    { id: 'contact', to: '#contact', label: 'Contact' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <ul className="bottom-nav-list">
        {items.map((it) => (
          <li key={it.label} className="bottom-nav-item">
            {it.to.startsWith('#') ? (
              // If currently on home page, normal anchor will scroll; otherwise navigate to home and pass state
              isHome ? (
                <a href={it.to} className="bottom-nav-link">{it.label}</a>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/', { state: { scrollTo: it.id } })}
                  className="bottom-nav-link text-left"
                >
                  {it.label}
                </button>
              )
            ) : (
              <Link to={it.to} className="bottom-nav-link">{it.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
