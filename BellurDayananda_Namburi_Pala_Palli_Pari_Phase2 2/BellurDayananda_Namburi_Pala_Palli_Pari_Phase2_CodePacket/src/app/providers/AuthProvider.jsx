import { createContext, useContext, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";

const AuthCtx = createContext(null);

// No demo users: registered users persist in localStorage and start empty by default

// Route lists used to assign permissions for roles
const STUDENT_ROUTES = ["overview", "tutors", "documents", "chat", "profile"];
const TUTOR_ROUTES = ["create-exam", "planner", "documents", "profile"];

const REGISTERED_USERS_KEY = 'registered_users';

// Helper to read initial registry from localStorage or seed with demo users
function loadRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('failed to parse registered users from localStorage', e);
  }

  // start with an empty registry by default
  return [];
}

export function AuthProvider({ children }) {
  // Persist user to sessionStorage so it clears when the browser/tab is closed
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // Registered users persist across reloads via localStorage
  const [registry, setRegistry] = useState(() => loadRegisteredUsers());

  const value = useMemo(
    () => ({
      user,
      // Login checks the persisted registry
      login: (email, password) => {
        const found = registry.find(u => u.email === email && u.password === password);
        if (found) {
          const { password: _, ...userWithoutPassword } = found;
          setUser(userWithoutPassword);
          sessionStorage.setItem("user", JSON.stringify(userWithoutPassword));
          return true;
        }
        return false;
      },
      // Register a new user and persist to registry + localStorage
      register: ({ name, email, password, userRole, subjects = [], bio = "" }) => {
        // Prevent duplicate emails
        if (registry.some(u => u.email === email)) return null;

        const isStudent = userRole && userRole.toLowerCase().includes('student');
        const isTutor = userRole && userRole.toLowerCase().includes('tutor');

        let role = 'student';
        if (isStudent && isTutor) role = 'both';
        else if (isTutor) role = 'tutor';

        const allowedRoutes = role === 'both'
          ? Array.from(new Set([...STUDENT_ROUTES, ...TUTOR_ROUTES]))
          : role === 'tutor'
            ? TUTOR_ROUTES
            : STUDENT_ROUTES;

        const newUser = {
          id: Date.now(),
          email,
          name,
          password,
          role,
          allowedRoutes,
          subjects,
          bio
        };

        const updatedRegistry = [...registry, newUser];
        setRegistry(updatedRegistry);
        try {
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedRegistry));
        } catch (e) {
          console.warn('failed to persist registered users', e);
        }

        const { password: _, ...userPublic } = newUser;
        setUser(userPublic);
        sessionStorage.setItem('user', JSON.stringify(userPublic));
        return userPublic;
      },
      logout: () => {
        setUser(null);
        sessionStorage.removeItem("user");
      },
      hasAccess: (route) => {
        if (!user) return false;
        return Array.isArray(user.allowedRoutes) && user.allowedRoutes.includes(route);
      }
    }),
    [user, registry]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

export function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export function RequireRole({ children, allowedRoutes }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Check if user has access to at least one of the allowed routes
  const hasAccess = allowedRoutes.some(route => user.allowedRoutes.includes(route));
  
  if (!hasAccess) {
    return <Navigate to="/app" replace />;
  }
  
  return children;
}
