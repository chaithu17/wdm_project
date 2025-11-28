import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import apiClient from "../../services/api";

const AuthCtx = createContext(null);

// Route lists used to assign permissions for roles
const STUDENT_ROUTES = ["overview", "tutors", "documents", "chat", "profile"];
const TUTOR_ROUTES = ["create-exam", "planner", "documents", "profile"];
const ADMIN_ROUTES = ["overview", "tutors", "documents", "chat", "profile", "create-exam", "planner"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        try {
          // Verify token and get current user
          const response = await apiClient.get('/auth/me');
          const userData = mapUserFromBackend(response.user);
          setUser(userData);
        } catch (error) {
          console.error('Failed to restore auth session:', error);
          // Clear invalid token
          apiClient.setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Helper function to map backend user data to frontend format
  const mapUserFromBackend = (backendUser) => {
    if (!backendUser) return null;

    const { _id, id, fullName, email, role, subjects, bio } = backendUser;

    // Determine allowed routes based on role
    let allowedRoutes = [];
    if (role === 'admin') {
      allowedRoutes = ADMIN_ROUTES;
    } else if (role === 'both') {
      allowedRoutes = Array.from(new Set([...STUDENT_ROUTES, ...TUTOR_ROUTES]));
    } else if (role === 'tutor') {
      allowedRoutes = TUTOR_ROUTES;
    } else {
      allowedRoutes = STUDENT_ROUTES;
    }

    return {
      id: _id || id,
      name: fullName,
      email,
      role,
      allowedRoutes,
      subjects: subjects || [],
      bio: bio || ""
    };
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      // Login with backend API
      login: async (email, password) => {
        try {
          const response = await apiClient.post('/auth/login', { email, password });

          if (response.token && response.user) {
            // Store JWT token
            apiClient.setToken(response.token);

            // Map and set user data
            const userData = mapUserFromBackend(response.user);
            setUser(userData);

            return { success: true, user: userData };
          }

          return { success: false, error: 'Invalid response from server' };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: error.message || 'Login failed' };
        }
      },

      // Register new user with backend API
      register: async ({ name, email, password, userRole, subjects = [], bio = "" }) => {
        try {
          const response = await apiClient.post('/auth/register', {
            fullName: name,
            email,
            password,
            role: userRole,
            subjects,
            bio
          });

          if (response.token && response.user) {
            // Store JWT token
            apiClient.setToken(response.token);

            // Map and set user data
            const userData = mapUserFromBackend(response.user);
            setUser(userData);

            return { success: true, user: userData };
          }

          return { success: false, error: 'Invalid response from server' };
        } catch (error) {
          console.error('Registration error:', error);
          return { success: false, error: error.message || 'Registration failed' };
        }
      },

      // Logout
      logout: async () => {
        try {
          // Call backend logout endpoint
          await apiClient.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear local state regardless of backend response
          apiClient.setToken(null);
          setUser(null);
        }
      },

      // Check if user has access to a route
      hasAccess: (route) => {
        if (!user) return false;
        return Array.isArray(user.allowedRoutes) && user.allowedRoutes.includes(route);
      }
    }),
    [user, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export function RequireRole({ children, allowedRoutes }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
