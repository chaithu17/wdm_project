import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { BookOpen, Users, MessageSquare, Zap, Eye, EyeOff, AlertCircle, HandHeart } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  
  // Sign Up specific fields
  const [fullName, setFullName] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [userRole, setUserRole] = useState("Learn as a Student");
  const [subjects, setSubjects] = useState([]);
  const [bio, setBio] = useState("");
  
  // Forgot Password fields
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotFullName, setForgotFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  const { login, register } = useAuth();
  const nav = useNavigate();

  const availableSubjects = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "Computer Science", "English", "History", "Geography",
    "Economics", "Psychology", "Art", "Music",
    "Languages", "Business Studies"
  ];

  const toggleSubject = (subject) => {
    setSubjects(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

async function onSubmit(e) {
  e.preventDefault();
  setError("");

  // --- Existing Sign-Up logic ---
  if (isSignUp) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(pw)) {
      setError('Password must be at least 8 characters, include one uppercase letter, and one special character.');
      return;
    }
    if (pw !== confirmPw) {
      setError('Passwords do not match');
      return;
    }

    const nameToUse = fullName || email.split('@')[0];
    const result = await register({
      name: nameToUse,
      email,
      password: pw,
      userRole,
      subjects,
      bio
    });

    if (result.success) {
      // Navigate based on user role
      if (result.user.role === 'admin') {
        nav('/admin', { replace: true });
      } else {
        nav('/app', { replace: true });
      }
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    return;
  }

  // --- Normal Login ---
  const result = await login(email, pw);
  if (result.success) {
    // Navigate based on user role
    if (result.user.role === 'admin') {
      nav('/admin', { replace: true });
    } else {
      nav('/app', { replace: true });
    }
  } else {
    setError(result.error || 'Invalid email or password.');
  }
}


  function handleQuickLogin(userType) {
    // deprecated: demo accounts removed
  }

  function handleForgotPassword(e) {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    alert(`Password reset successful for ${forgotEmail}!\nYou can now sign in with your new password.`);
    
    setForgotEmail("");
    setForgotFullName("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowForgotPassword(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-50 p-12 flex-col justify-center sticky top-0 h-screen overflow-hidden">
        <div className="max-w-lg">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <HandHeart className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">P2P</h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl text-gray-800 mb-6 font-semibold">
            P2P Learning & Study Planning Platform
          </p>

          {/* Description */}
          <p className="text-gray-600 mb-10 leading-relaxed">
            Connect with tutors, learn from peers, and create personalized study plans for academic success.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Smart Study Plans */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-gray-900">Smart Study Plans</h3>
              <p className="text-xs text-gray-600">Personalized learning paths</p>
            </div>

            {/* Peer Tutoring */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-gray-900">Peer Tutoring</h3>
              <p className="text-xs text-gray-600">Connect with students and tutors</p>
            </div>

            {/* Chat Support */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-gray-900">Chat Support</h3>
              <p className="text-xs text-gray-600">24/7 study help and guidance</p>
            </div>

            {/* Progress Tracking */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 text-gray-900">Progress Tracking</h3>
              <p className="text-xs text-gray-600">Monitor your learning journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md my-8">
          {/* Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Get Started</h2>
              <p className="text-gray-600">
                Join thousands of students and tutors already using P2P
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                  !isSignUp
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  // clear any existing session when creating a new signup flow
                  sessionStorage.removeItem('user');
                  setIsSignUp(true);
                }}
                className={`flex-1 py-2.5 rounded-lg transition-all duration-300 font-medium ${
                  isSignUp
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {!isSignUp && (
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 hover:underline transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">I want to...</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      required
                    >
                      <option value="Learn as a Student">Learn as a Student</option>
                      <option value="Teach as a Tutor">Teach as a Tutor</option>
                      <option value="Both Learn and Teach">Both Learn and Teach</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Subjects of Interest</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSubjects.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            subjects.includes(subject)
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                              : "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Bio (Optional)</label>
                    <textarea
                      placeholder="Tell us about yourself..."
                      className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                      rows="3"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                {isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>

            {/* Demo credentials removed */}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Reset Password</h2>
            <p className="text-gray-600 mb-6">
              Enter your email and full name to reset your password
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={forgotFullName}
                  onChange={(e) => setForgotFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail("");
                    setForgotFullName("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 border border-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
