import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck, Users, GraduationCap, FileSpreadsheet, CreditCard, Activity,
  BarChart3, Settings, MessageSquareWarning, BellRing, Search, Filter, Download,
  Eye, CheckCircle2, XCircle, PauseCircle, RefreshCw, CalendarClock, AlertTriangle,
  DollarSign, Receipt, Reply, Star, Lock, Key, ShieldAlert, UserCheck, UserX
} from "lucide-react";

/** ---------- Local storage helpers ---------- */
const LS = {
  read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

// Seed mock data once
const seedIfEmpty = () => {
  if (!localStorage.getItem("adm:tutors")) {
    const tutors = [
      { id: 1, name: "Sarah Johnson", subjects: ["Calculus", "Algebra"], rate: 45, status: "pending", reviews: 128, rating: 4.8, verified: false },
      { id: 2, name: "Michael Chen", subjects: ["Physics", "Thermo"], rate: 50, status: "approved", reviews: 98, rating: 4.7, verified: true },
      { id: 3, name: "Emma Rodriguez", subjects: ["Data Structures", "Algorithms"], rate: 55, status: "suspended", reviews: 211, rating: 4.9, verified: true },
    ];
    const students = [
      { id: 101, name: "Ava Patel", email: "ava@example.com", status: "active", sessions: 6, payments: 3 },
      { id: 102, name: "John Lee", email: "john@example.com", status: "inactive", sessions: 0, payments: 0 },
    ];
    const sessions = [
      { id: "S-1001", tutorId: 2, tutor: "Michael Chen", student: "Ava Patel", subject: "Physics", time: "2025-10-27 10:00", status: "upcoming" },
      { id: "S-1002", tutorId: 1, tutor: "Sarah Johnson", student: "John Lee", subject: "Algebra", time: "2025-10-26 16:30", status: "cancelled" },
      { id: "S-1003", tutorId: 3, tutor: "Emma Rodriguez", student: "Ava Patel", subject: "Algorithms", time: "2025-10-24 14:00", status: "completed" },
    ];
    const payments = [
      { id: "P-7001", sessionId: "S-1003", tutor: "Emma Rodriguez", student: "Ava Patel", amount: 55, platformFee: 8.25, netToTutor: 46.75, status: "paid", date: "2025-10-24" },
      { id: "P-7002", sessionId: "S-1002", tutor: "Sarah Johnson", student: "John Lee", amount: 45, platformFee: 6.75, netToTutor: 38.25, status: "refunded", date: "2025-10-26" },
    ];
    const disputes = [
      { id: "D-5001", sessionId: "S-1002", raisedBy: "student", issue: "Tutor no-show", status: "open" },
    ];
    const coupons = [
      { code: "WELCOME10", type: "percent", value: 10, active: true, usage: 23 },
    ];
    const commissions = { percent: 15 }; // platform fee %
    LS.write("adm:tutors", tutors);
    LS.write("adm:students", students);
    LS.write("adm:sessions", sessions);
    LS.write("adm:payments", payments);
    LS.write("adm:disputes", disputes);
    LS.write("adm:coupons", coupons);
    LS.write("adm:commissions", commissions);
    LS.write("adm:alerts", [{ id: 1, text: "System maintenance on Nov 2, 1–2 AM UTC", type: "info" }]);
  }
};

seedIfEmpty();

/** ---------- CSV export helper ---------- */
function toCSV(rows) {
  if (!rows?.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const body = rows.map(r => headers.map(h => escape(r[h])).join(",")).join("\n");
  return headers.join(",") + "\n" + body;
}
function downloadCSV(filename, rows) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/** ---------- Tag / Badge ---------- */
const Badge = ({ color = "gray", children }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold
    ${color === "green" ? "bg-green-100 text-green-700" :
      color === "red" ? "bg-red-100 text-red-700" :
      color === "yellow" ? "bg-yellow-100 text-yellow-700" :
      color === "blue" ? "bg-blue-100 text-blue-700" :
      "bg-gray-100 text-gray-700"}`}>
    {children}
  </span>
);

/** ---------- Admin Dashboard ---------- */
export default function AdminDashboard() {
  const [tab, setTab] = useState("overview"); // overview | users | sessions | payments | reports | content | support | security

  // Core state buckets
  const [tutors, setTutors] = useState(() => LS.read("adm:tutors", []));
  const [students, setStudents] = useState(() => LS.read("adm:students", []));
  const [sessions, setSessions] = useState(() => LS.read("adm:sessions", []));
  const [payments, setPayments] = useState(() => LS.read("adm:payments", []));
  const [disputes, setDisputes] = useState(() => LS.read("adm:disputes", []));
  const [coupons, setCoupons] = useState(() => LS.read("adm:coupons", []));
  const [commissions, setCommissions] = useState(() => LS.read("adm:commissions", { percent: 15 }));
  const [alerts, setAlerts] = useState(() => LS.read("adm:alerts", []));

  // Persist
  useEffect(() => { LS.write("adm:tutors", tutors); }, [tutors]);
  useEffect(() => { LS.write("adm:students", students); }, [students]);
  useEffect(() => { LS.write("adm:sessions", sessions); }, [sessions]);
  useEffect(() => { LS.write("adm:payments", payments); }, [payments]);
  useEffect(() => { LS.write("adm:disputes", disputes); }, [disputes]);
  useEffect(() => { LS.write("adm:coupons", coupons); }, [coupons]);
  useEffect(() => { LS.write("adm:commissions", commissions); }, [commissions]);
  useEffect(() => { LS.write("adm:alerts", alerts); }, [alerts]);

  // KPIs
  const kpis = useMemo(() => {
    const totalTutors = tutors.length;
    const totalStudents = students.length;
    const activeSessions = sessions.filter(s => s.status === "upcoming" || s.status === "ongoing").length;
    const revenue = payments.filter(p => p.status !== "refunded").reduce((s, p) => s + (p.amount ?? 0), 0);
    const monthRevenue = revenue; // stub
    const topTutors = [...new Set(payments.map(p => p.tutor))]
      .map(name => ({
        name,
        revenue: payments.filter(p => p.tutor === name && p.status !== "refunded").reduce((s, p) => s + p.amount, 0),
        sessions: sessions.filter(s => s.tutor === name && s.status === "completed").length
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    return { totalTutors, totalStudents, activeSessions, revenue, monthRevenue, topTutors };
  }, [tutors, students, sessions, payments]);

  /** ---------- Actions ---------- */

  // Tutors
  const approveTutor = (id) => setTutors(prev => prev.map(t => t.id === id ? { ...t, status: "approved", verified: true } : t));
  const rejectTutor = (id) => setTutors(prev => prev.map(t => t.id === id ? { ...t, status: "rejected", verified: false } : t));
  const suspendTutor = (id) => setTutors(prev => prev.map(t => t.id === id ? { ...t, status: "suspended" } : t));
  const setTutorRate = (id, rate) => setTutors(prev => prev.map(t => t.id === id ? { ...t, rate } : t));

  // Students
  const setStudentStatus = (id, status) => setStudents(prev => prev.map(s => s.id === id ? ({ ...s, status }) : s));

  // Sessions
  const updateSessionStatus = (sid, status) => setSessions(prev => prev.map(s => s.id === sid ? ({ ...s, status }) : s));
  const createSession = (payload) => setSessions(prev => [{ id: `S-${Math.floor(Math.random() * 9000 + 1000)}`, ...payload }, ...prev]);

  // Payments
  const setCommissionPercent = (p) => setCommissions({ percent: Number(p) || 0 });
  const refundPayment = (pid) => {
    setPayments(prev => prev.map(p => p.id === pid ? { ...p, status: "refunded" } : p));
  };

  // Content
  const addCoupon = (c) => setCoupons(prev => [c, ...prev]);
  const toggleCoupon = (code) => setCoupons(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
  const addAlert = (text) => setAlerts(prev => [{ id: Date.now(), text, type: "info" }, ...prev]);

  // Support
  const setDisputeStatus = (id, status) => setDisputes(prev => prev.map(d => d.id === id ? ({ ...d, status }) : d));

  /** ---------- UI ---------- */

  const TabBtn = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border
        ${tab === id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Control panel for P2P platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-ghost text-sm"><BellRing className="w-4 h-4 mr-1" /> Notifications</button>
            <a href="/app" className="btn-ghost text-sm">Back to App</a>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-6 py-4 flex gap-2 flex-wrap">
        <TabBtn id="overview" icon={Activity} label="Overview" />
        <TabBtn id="users" icon={Users} label="User Management" />
        <TabBtn id="sessions" icon={CalendarClock} label="Sessions" />
        <TabBtn id="payments" icon={CreditCard} label="Pricing & Payments" />
        <TabBtn id="reports" icon={BarChart3} label="Reports & Analytics" />
        <TabBtn id="content" icon={Settings} label="Content & Settings" />
        {/* <TabBtn id="support" icon={MessageSquareWarning} label="Feedback & Support" /> */}
        <TabBtn id="security" icon={ShieldAlert} label="Security & Compliance" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 pb-14">
        {tab === "overview" && (
          <section className="grid md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-500">Total Tutors</p>
              <p className="text-2xl font-bold">{kpis.totalTutors}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-500">Total Students</p>
              <p className="text-2xl font-bold">{kpis.totalStudents}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-500">Active/Upcoming Sessions</p>
              <p className="text-2xl font-bold">{kpis.activeSessions}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-500">Revenue (All-time)</p>
              <p className="text-2xl font-bold">${kpis.revenue.toFixed(2)}</p>
            </div>

            <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="font-semibold mb-2">Top Tutors</h3>
              <ul className="divide-y">
                {kpis.topTutors.map(t => (
                  <li key={t.name} className="py-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span>{t.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{t.sessions} sessions</span>
                      <span className="font-semibold">${t.revenue.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="font-semibold mb-2">Platform Alerts</h3>
              <ul className="space-y-2">
                {alerts.map(a => (
                  <li key={a.id} className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {tab === "users" && (
          <section className="space-y-6">
            {/* Tutors */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Tutors</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                    <input className="pl-7 pr-3 py-1.5 rounded-lg border text-sm" placeholder="Search tutors..." />
                  </div>
                  <button className="btn-ghost text-xs"><Filter className="w-4 h-4 mr-1" /> Filter</button>
                </div>
              </div>
              <div className="overflow-x-auto -mx-2">
                <table className="min-w-[720px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Name</th>
                      <th className="py-2 px-2">Subjects</th>
                      <th className="py-2 px-2">Rate</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2">Reviews</th>
                      <th className="py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutors.map(t => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-2 px-2 font-medium">{t.name}</td>
                        <td className="py-2 px-2">{t.subjects.join(", ")}</td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={t.rate}
                            onChange={(e) => setTutorRate(t.id, Number(e.target.value))}
                            className="w-20 border rounded px-2 py-1"
                          />{" "}
                          $/hr
                        </td>
                        <td className="py-2 px-2">
                          {t.status === "approved" && <Badge color="green">approved</Badge>}
                          {t.status === "pending" && <Badge color="yellow">pending</Badge>}
                          {t.status === "rejected" && <Badge color="red">rejected</Badge>}
                          {t.status === "suspended" && <Badge color="red">suspended</Badge>}
                        </td>
                        <td className="py-2 px-2 flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500" /> {t.rating} <span className="text-gray-400">({t.reviews})</span>
                        </td>
                        <td className="py-2 px-2 flex items-center gap-2">
                          <button onClick={() => approveTutor(t.id)} className="text-green-700 hover:underline flex items-center gap-1 text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button onClick={() => rejectTutor(t.id)} className="text-rose-700 hover:underline flex items-center gap-1 text-xs">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                          <button onClick={() => suspendTutor(t.id)} className="text-amber-700 hover:underline flex items-center gap-1 text-xs">
                            <PauseCircle className="w-4 h-4" /> Suspend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Students */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Students</h3>
              </div>
              <div className="overflow-x-auto -mx-2">
                <table className="min-w-[680px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Name</th>
                      <th className="py-2 px-2">Email</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2">Sessions</th>
                      <th className="py-2 px-2">Payments</th>
                      <th className="py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-2 px-2 font-medium">{s.name}</td>
                        <td className="py-2 px-2">{s.email}</td>
                        <td className="py-2 px-2">{s.status === "active" ? <Badge color="green">active</Badge> : <Badge>inactive</Badge>}</td>
                        <td className="py-2 px-2">{s.sessions}</td>
                        <td className="py-2 px-2">{s.payments}</td>
                        <td className="py-2 px-2 flex items-center gap-2">
                          <button onClick={() => setStudentStatus(s.id, "active")} className="text-green-700 hover:underline text-xs flex items-center gap-1">
                            <UserCheck className="w-4 h-4" /> Activate
                          </button>
                          <button onClick={() => setStudentStatus(s.id, "inactive")} className="text-rose-700 hover:underline text-xs flex items-center gap-1">
                            <UserX className="w-4 h-4" /> Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {tab === "sessions" && (
          <section className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="font-semibold mb-3">Create Session (manual)</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const payload = {
                    tutor: fd.get("tutor"),
                    student: fd.get("student"),
                    subject: fd.get("subject"),
                    time: fd.get("time"),
                    status: "upcoming"
                  };
                  createSession(payload);
                  e.currentTarget.reset();
                }}
                className="grid md:grid-cols-5 gap-2"
              >
                <input name="tutor" placeholder="Tutor name" className="border rounded px-2 py-2 text-sm" required />
                <input name="student" placeholder="Student name" className="border rounded px-2 py-2 text-sm" required />
                <input name="subject" placeholder="Subject" className="border rounded px-2 py-2 text-sm" required />
                <input name="time" type="datetime-local" className="border rounded px-2 py-2 text-sm" required />
                <button className="btn-primary text-sm">Add</button>
              </form>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">All Sessions</h3>
              </div>
              <div className="overflow-x-auto -mx-2">
                <table className="min-w-[760px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">ID</th>
                      <th className="py-2 px-2">Tutor</th>
                      <th className="py-2 px-2">Student</th>
                      <th className="py-2 px-2">Subject</th>
                      <th className="py-2 px-2">Time</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="py-2 px-2 font-mono">{s.id}</td>
                        <td className="py-2 px-2">{s.tutor}</td>
                        <td className="py-2 px-2">{s.student}</td>
                        <td className="py-2 px-2">{s.subject}</td>
                        <td className="py-2 px-2">{s.time}</td>
                        <td className="py-2 px-2">
                          <Badge color={s.status === "completed" ? "green" : s.status === "cancelled" ? "red" : "blue"}>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 flex items-center gap-2">
                          <button onClick={() => updateSessionStatus(s.id, "ongoing")} className="text-blue-700 hover:underline text-xs">Mark Ongoing</button>
                          <button onClick={() => updateSessionStatus(s.id, "completed")} className="text-green-700 hover:underline text-xs">Complete</button>
                          <button onClick={() => updateSessionStatus(s.id, "cancelled")} className="text-rose-700 hover:underline text-xs">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Disputes */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Disputes</h4>
                <div className="space-y-2">
                  {disputes.map(d => (
                    <div key={d.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-medium">{d.id} • Session {d.sessionId}</p>
                        <p className="text-gray-500">Issue: {d.issue} • Raised by: {d.raisedBy}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={d.status === "open" ? "yellow" : d.status === "resolved" ? "green" : "gray"}>{d.status}</Badge>
                        <button onClick={() => setDisputeStatus(d.id, "resolved")} className="btn-ghost text-xs">Resolve</button>
                        <button onClick={() => setDisputeStatus(d.id, "rejected")} className="btn-ghost text-xs">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "payments" && (
          <section className="space-y-6">
            {/* Commission */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="font-semibold mb-3">Platform Commission</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Platform fee (%)</span>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-24"
                  value={commissions.percent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Transactions</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => downloadCSV("transactions.csv", payments)} className="btn-ghost text-xs">
                    <Download className="w-4 h-4 mr-1" /> Export CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto -mx-2">
                <table className="min-w-[860px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">ID</th>
                      <th className="py-2 px-2">Session</th>
                      <th className="py-2 px-2">Tutor</th>
                      <th className="py-2 px-2">Student</th>
                      <th className="py-2 px-2">Amount</th>
                      <th className="py-2 px-2">Platform Fee</th>
                      <th className="py-2 px-2">Net to Tutor</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2">Date</th>
                      <th className="py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-2 px-2 font-mono">{p.id}</td>
                        <td className="py-2 px-2">{p.sessionId}</td>
                        <td className="py-2 px-2">{p.tutor}</td>
                        <td className="py-2 px-2">{p.student}</td>
                        <td className="py-2 px-2">${p.amount.toFixed(2)}</td>
                        <td className="py-2 px-2">${p.platformFee.toFixed(2)}</td>
                        <td className="py-2 px-2">${p.netToTutor.toFixed(2)}</td>
                        <td className="py-2 px-2">
                          {p.status === "paid" ? <Badge color="green">paid</Badge> :
                           p.status === "refunded" ? <Badge color="red">refunded</Badge> :
                           <Badge color="yellow">{p.status}</Badge>}
                        </td>
                        <td className="py-2 px-2">{p.date}</td>
                        <td className="py-2 px-2">
                          {p.status !== "refunded" && (
                            <button onClick={() => refundPayment(p.id)} className="text-rose-700 hover:underline text-xs flex items-center gap-1">
                              <Reply className="w-4 h-4" /> Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>💳 Integrations: plug real payments via Stripe/PayPal/Supabase functions later (webhooks → update <code>payments</code> state).</p>
              </div>
            </div>
          </section>
        )}

        {tab === "reports" && (
          <section className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white border rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Revenue (30d)</p>
                <p className="text-2xl font-bold">${kpis.monthRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-white border rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Bookings (30d)</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.status === "completed").length}</p>
              </div>
              <div className="bg-white border rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Retention (stub)</p>
                <p className="text-2xl font-bold">62%</p>
              </div>
              <div className="bg-white border rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-1">Repeat Bookings (stub)</p>
                <p className="text-2xl font-bold">38%</p>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Export</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => downloadCSV("tutors.csv", tutors)} className="btn-ghost text-xs"><Download className="w-4 h-4 mr-1" />Tutors CSV</button>
                  <button onClick={() => downloadCSV("students.csv", students)} className="btn-ghost text-xs"><Download className="w-4 h-4 mr-1" />Students CSV</button>
                  <button onClick={() => downloadCSV("sessions.csv", sessions)} className="btn-ghost text-xs"><Download className="w-4 h-4 mr-1" />Sessions CSV</button>
                  <button onClick={() => downloadCSV("payments.csv", payments)} className="btn-ghost text-xs"><Download className="w-4 h-4 mr-1" />Payments CSV</button>
                </div>
              </div>
              <p className="text-xs text-gray-500">📄 PDF export can be added later using a client library like jsPDF or server-side rendering.</p>
            </div>
          </section>
        )}

        {tab === "content" && (
          <section className="space-y-6">
            {/* Banners / Copy (stub) */}
            <div className="bg-white border rounded-2xl p-4">
              <h3 className="font-semibold mb-3">Homepage & Pricing Copy</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <textarea className="border rounded p-2 text-sm min-h-28" placeholder="Homepage banner text (stub)"></textarea>
                <textarea className="border rounded p-2 text-sm min-h-28" placeholder="Pricing section wording (stub)"></textarea>
              </div>
              <div className="mt-2">
                <button className="btn-primary text-sm">Save</button>
              </div>
            </div>

            {/* Coupons */}
            <div className="bg-white border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Coupons / Promotions</h3>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const c = {
                    code: fd.get("code").toUpperCase(),
                    type: fd.get("type"),
                    value: Number(fd.get("value") || 0),
                    active: true,
                    usage: 0
                  };
                  addCoupon(c);
                  e.currentTarget.reset();
                }}
                className="flex flex-wrap gap-2 mb-3"
              >
                <input name="code" placeholder="CODE" className="border rounded px-2 py-2 text-sm" required />
                <select name="type" className="border rounded px-2 py-2 text-sm">
                  <option value="percent">Percent %</option>
                  <option value="flat">Flat $</option>
                </select>
                <input name="value" type="number" placeholder="Value" className="border rounded px-2 py-2 text-sm w-28" required />
                <button className="btn-primary text-sm">Add</button>
              </form>

              <div className="overflow-x-auto -mx-2">
                <table className="min-w-[560px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 px-2">Code</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Value</th>
                      <th className="py-2 px-2">Usage</th>
                      <th className="py-2 px-2">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.code} className="border-b last:border-0">
                        <td className="py-2 px-2 font-mono">{c.code}</td>
                        <td className="py-2 px-2">{c.type}</td>
                        <td className="py-2 px-2">{c.type === "percent" ? `${c.value}%` : `$${c.value}`}</td>
                        <td className="py-2 px-2">{c.usage}</td>
                        <td className="py-2 px-2">
                          <button onClick={() => toggleCoupon(c.code)} className="btn-ghost text-xs">{c.active ? "Disable" : "Enable"}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white border rounded-2xl p-4">
              <h3 className="font-semibold mb-3">Platform-wide Announcements</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const text = fd.get("text");
                  if (text?.trim()) addAlert(text.trim());
                  e.currentTarget.reset();
                }}
                className="flex gap-2"
              >
                <input name="text" placeholder="Write an alert…" className="border rounded px-3 py-2 text-sm flex-1" />
                <button className="btn-primary text-sm">Post</button>
              </form>
            </div>
          </section>
        )}

        {tab === "support" && (
          <section className="space-y-6">
            <div className="bg-white border rounded-2xl p-4">
              <h3 className="font-semibold mb-3">Ratings & Reviews (read-only demo)</h3>
              <div className="text-sm text-gray-500">Surface tutor performance metrics here (tie into real reviews later).</div>
            </div>
            <div className="bg-white border rounded-2xl p-4">
              <h3 className="font-semibold mb-3">Support Tickets (stub)</h3>
              <p className="text-sm text-gray-500">Build a simple inbox for admin ↔ tutor/student messaging later.</p>
            </div>
          </section>
        )}

        {tab === "security" && (
          <section className="space-y-6">
            <div className="bg-white border rounded-2xl p-4">
              <h3 className="font-semibold mb-3">Roles & Access</h3>
              <ul className="text-sm list-disc ml-5 text-gray-700 space-y-1">
                <li><b>Super Admin</b>: full access.</li>
                <li><b>Support Staff</b>: users, sessions, disputes.</li>
                <li><b>Finance Manager</b>: payments, refunds, invoices.</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">Hook into your `AuthProvider` to enforce route-level & action-level checks.</p>
            </div>
            <div className="bg-white border rounded-2xl p-4">
              <h3 className="font-semibold mb-3">Compliance</h3>
              <ul className="text-sm list-disc ml-5 text-gray-700 space-y-1">
                <li>GDPR/Data deletion requests (add UI + audit logs)</li>
                <li>Login activity & suspicious account monitoring</li>
                <li>Backup & restore (link to ops runbooks)</li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
