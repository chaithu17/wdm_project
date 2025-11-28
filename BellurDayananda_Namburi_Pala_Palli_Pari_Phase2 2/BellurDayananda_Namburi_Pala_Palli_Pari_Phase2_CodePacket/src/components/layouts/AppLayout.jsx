import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useEffect } from "react";
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { HandHeart } from "lucide-react";
import BottomNav from './BottomNav';
import Footer from '../Footer';

export default function AppLayout() {
  const { logout, user, hasAccess } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isChatPage = location.pathname.includes('/chat');

  const link = ({ isActive }) =>
    `px-3 py-2 rounded-lg ${isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`;

  // Define all navigation items with their route names
  const navItems = [
    { path: "/app", label: "Overview", routeName: "overview", end: true },
    { path: "/app/tutors", label: "Tutors", routeName: "tutors" },
    { path: "/app/documents", label: "Documents", routeName: "documents" },
    { path: "/app/create-exam", label: "Create Exam", routeName: "create-exam" },
    { path: "/app/planner", label: "Grade Exams", routeName: "planner" },
    { path: "/app/chat", label: "Chat", routeName: "chat" },
    { path: "/app/profile", label: "Profile", routeName: "profile" },
  ];

  // Filter navigation items based on user's allowed routes
  const allowedNavItems = navItems.filter(item => hasAccess(item.routeName));

  // Redirect to first allowed route if on /app and user doesn't have access to overview
  useEffect(() => {
    if (location.pathname === '/app' && !hasAccess('overview') && allowedNavItems.length > 0) {
      navigate(allowedNavItems[0].path, { replace: true });
    }
  }, [location.pathname, hasAccess, allowedNavItems, navigate]);

  return (
  <div className="min-h-screen grid grid-rows-[auto_1fr] bg-gray-50">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                <HandHeart className="w-4 h-4 text-white" />
              </div>
              <div className="font-semibold">P2P</div>
            </div>
            {user && (
              <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200 flex items-center gap-1">
                {user.role === 'student' ? (
                  <>
                    <FaUserGraduate className="w-3 h-3" />
                    <span>Student</span>
                  </>
                ) : (
                  <>
                    <FaChalkboardTeacher className="w-3 h-3" />
                    <span>Tutor</span>
                  </>
                )}
              </span>
            )}
          </div>
          <nav className="flex gap-1">
            {allowedNavItems.map((item) => (
              <NavLink 
                key={item.path}
                end={item.end}
                to={item.path} 
                className={link}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button onClick={logout} className="btn-ghost">Log out</button>
        </div>
      </header>

      <main className={isChatPage ? "" : "px-6"}>
        {isChatPage ? (
          <Outlet />
        ) : (
          <div className="mx-auto max-w-6xl py-10">
            <Outlet />
          </div>
        )}
      </main>

      {/* Footer and bottom navigation (mobile) */}
      {/* <Footer /> */}
      <BottomNav />
    </div>
  );
}
