import { Routes, Route } from "react-router-dom";
import PublicLayout from "../../components/layouts/PublicLayout";
import AppLayout from "../../components/layouts/AppLayout";
import Home from "../../pages/Home";
import SignIn from "../../pages/SignIn";
import NotFound from "../../pages/NotFound";
import Overview from "../../pages/app/Overview";
import Tutors from "../../pages/app/Tutors";
import Planner from "../../pages/app/Planner";
import Chat from "../../pages/app/Chat";
import Profile from "../../pages/app/Profile";
import CreateExam from "../../pages/app/CreateExam";
import Documents from "../../pages/app/Documents";
import { RequireAuth, RequireRole } from "../providers/AuthProvider";
import AdminDashboard from "../../pages/admin/AdminDashboard"; // ✅ NEW IMPORT

// ✅ Simple guard for the hardcoded admin
const RequireAdmin = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user?.role !== "admin") {
    window.location.href = "/signin";
    return null;
  }
  return children;
};

export default function AppRouter() {
  return (
    <Routes>
      {/* ---------- Public Routes ---------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="/signin" element={<SignIn />} />

      {/* ---------- Authenticated App Routes ---------- */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* Student Routes */}
        <Route
          index
          element={
            <RequireRole allowedRoutes={["overview"]}>
              <Overview />
            </RequireRole>
          }
        />
        <Route
          path="tutors"
          element={
            <RequireRole allowedRoutes={["tutors"]}>
              <Tutors />
            </RequireRole>
          }
        />
        <Route
          path="chat"
          element={
            <RequireRole allowedRoutes={["chat"]}>
              <Chat />
            </RequireRole>
          }
        />

        {/* Tutor Routes */}
        <Route
          path="create-exam"
          element={
            <RequireRole allowedRoutes={["create-exam"]}>
              <CreateExam />
            </RequireRole>
          }
        />
        <Route
          path="planner"
          element={
            <RequireRole allowedRoutes={["planner"]}>
              <Planner />
            </RequireRole>
          }
        />

        {/* Shared Routes */}
        <Route
          path="documents"
          element={
            <RequireRole allowedRoutes={["documents"]}>
              <Documents />
            </RequireRole>
          }
        />
        <Route
          path="profile"
          element={
            <RequireRole allowedRoutes={["profile"]}>
              <Profile />
            </RequireRole>
          }
        />
      </Route>

      {/* ---------- Admin Route ---------- */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
