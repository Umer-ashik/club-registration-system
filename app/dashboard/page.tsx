// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const Pie = dynamic(() => import("react-chartjs-2").then((mod) => mod.Pie), {
  ssr: false,
});
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

const ROLES = {
  ADMIN: "ADMIN",
  PRESIDENT: "PRESIDENT",
  VICE_PRESIDENT: "VICE_PRESIDENT",
  LECTURER: "LECTURER",
};

const ROLE_PASSWORDS = {
  admin2026: ROLES.ADMIN,
  president2026: ROLES.PRESIDENT,
  vp2026: ROLES.VICE_PRESIDENT,
  lecturer2026: ROLES.LECTURER,
};

export default function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");

  const handleLogin = (e) => {
    e.preventDefault();
    const role = ROLE_PASSWORDS[passwordInput];
    if (role) {
      setIsAuthenticated(true);
      setUserRole(role);
      setError("");
    } else {
      setError("❌ Invalid credentials. Access denied.");
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("registered_at", { ascending: false });

    if (error) {
      console.error("Error fetching students:", error);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStudents();
      const channel = supabase
        .channel("students-changes")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "students" },
          () => {
            fetchStudents();
          },
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  const total = students.length;

  const deptMap = {};
  students.forEach((s) => {
    deptMap[s.department] = (deptMap[s.department] || 0) + 1;
  });
  const deptLabels = Object.keys(deptMap);
  const deptData = Object.values(deptMap);

  const deptLeaderboard = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const domainMap = {};
  students.forEach((s) => {
    if (s.domain_interest && Array.isArray(s.domain_interest)) {
      s.domain_interest.forEach((d) => {
        domainMap[d] = (domainMap[d] || 0) + 1;
      });
    }
  });
  const domainLabels = Object.keys(domainMap);
  const domainData = Object.values(domainMap);

  const domainLeaderboard = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const semesterMap = {};
  students.forEach((s) => {
    semesterMap[s.semester] = (semesterMap[s.semester] || 0) + 1;
  });
  const semesterLabels = Object.keys(semesterMap).sort((a, b) => a - b);

  const suggestions = students
    .filter((s) => s.suggestions && s.suggestions.trim())
    .map((s) => ({
      name: s.name,
      text: s.suggestions,
      department: s.department,
    }));

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "All" || s.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const colors = [
    "#00f5ff",
    "#b44dff",
    "#ff6b6b",
    "#ffd93d",
    "#6bcb77",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
  ];
  const bgColors = deptLabels.map((_, i) => colors[i % colors.length]);
  const domainColors = domainLabels.map(
    (_, i) => colors[(i + 2) % colors.length],
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="bg-[#0f0f1e] rounded-3xl p-6 md:p-8 max-w-sm w-full relative border border-cyan-500/20">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/30 flex items-center justify-center backdrop-blur-sm overflow-hidden shadow-[0_0_40px_rgba(0,245,255,0.1)] animate-3d-spin">
              <img
                src="/club-logo.png"
                alt="Club Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white">
            🔐 Secure Access
          </h1>
          <p className="text-cyan-400/40 text-center text-sm mb-6">
            BCA IT Club Dashboard
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none"
              required
            />
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-white hover:bg-cyan-500/30 transition"
            >
              ⚡ Unlock Dashboard
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-white/15 text-[10px] uppercase tracking-wider">
              Authorized Personnel Only
            </p>
            <p className="text-white/10 text-[10px] mt-1">
              Admin: admin2026 • President: president2026
              <br />
              VP: vp2026 • Lecturer: lecturer2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ===== HEADER WITH LOGO ON THE RIGHT ===== */}
        <div className="flex flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              BCA IT Club
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-cyan-400/40 text-xs uppercase tracking-wider">
                {userRole}
              </p>
              <span className="w-1 h-1 rounded-full bg-cyan-500/30"></span>
              <p className="text-cyan-400/30 text-[10px] uppercase tracking-wider">
                Real-time Analytics
              </p>
            </div>
          </div>

          {/* ===== SMALL LOGO - TOP RIGHT ===== */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/30 flex items-center justify-center backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(0,245,255,0.1)] animate-3d-spin flex-shrink-0">
            <img
              src="/club-logo.png"
              alt="Club Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none"
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="p-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white focus:border-cyan-400 focus:outline-none min-w-[150px]"
          >
            <option value="All">All Departments</option>
            {deptLabels.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="bg-white/5 rounded-3xl p-20 text-center">
            <p className="text-cyan-400/40">Loading data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 rounded-3xl p-6 border border-cyan-500/10">
                <h2 className="text-cyan-400/60 text-xs uppercase tracking-wider font-semibold mb-4">
                  🏛️ Department Distribution
                </h2>
                {deptLabels.length > 0 ? (
                  <div className="h-64">
                    <Pie
                      data={{
                        labels: deptLabels,
                        datasets: [
                          {
                            data: deptData,
                            backgroundColor: bgColors,
                            borderColor: "#0a0a0f",
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { color: "#ffffff60", font: { size: 10 } },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-white/30 text-sm text-center py-10">
                    No data yet
                  </p>
                )}
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-cyan-500/10">
                <h2 className="text-cyan-400/60 text-xs uppercase tracking-wider font-semibold mb-4">
                  🎯 Domain Interests
                </h2>
                {domainLabels.length > 0 ? (
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: domainLabels,
                        datasets: [
                          {
                            label: "Students",
                            data: domainData,
                            backgroundColor: domainColors,
                            borderColor: "#0a0a0f",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: "#ffffff40" },
                            grid: { color: "#ffffff05" },
                          },
                          x: {
                            ticks: { color: "#ffffff40", font: { size: 10 } },
                            grid: { display: false },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-white/30 text-sm text-center py-10">
                    No data yet
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/5 rounded-3xl p-6 border border-cyan-500/10">
                <h2 className="text-cyan-400/60 text-xs uppercase tracking-wider font-semibold mb-4">
                  🏆 Top Departments
                </h2>
                {deptLeaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {deptLeaderboard.map(([dept, count], i) => (
                      <div
                        key={dept}
                        className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-cyan-500/5 hover:border-cyan-500/20 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-white/40"}`}
                          >
                            #{i + 1}
                          </span>
                          <span className="text-white/80 text-sm">{dept}</span>
                        </div>
                        <span className="text-cyan-400 font-bold text-sm">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm text-center py-10">
                    No data yet
                  </p>
                )}
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-cyan-500/10">
                <h2 className="text-cyan-400/60 text-xs uppercase tracking-wider font-semibold mb-4">
                  🚀 Top Interests
                </h2>
                {domainLeaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {domainLeaderboard.map(([domain, count], i) => (
                      <div
                        key={domain}
                        className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-cyan-500/5 hover:border-cyan-500/20 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-white/40"}`}
                          >
                            #{i + 1}
                          </span>
                          <span className="text-white/80 text-sm">
                            {domain}
                          </span>
                        </div>
                        <span className="text-purple-400 font-bold text-sm">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm text-center py-10">
                    No data yet
                  </p>
                )}
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-cyan-500/10">
                <h2 className="text-cyan-400/60 text-xs uppercase tracking-wider font-semibold mb-4">
                  📚 Semester Distribution
                </h2>
                {semesterLabels.length > 0 ? (
                  <div className="space-y-2">
                    {semesterLabels.map((sem) => (
                      <div
                        key={sem}
                        className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-cyan-500/5"
                      >
                        <span className="text-white/80 text-sm">
                          Semester {sem}
                        </span>
                        <span className="text-cyan-400 font-bold text-sm">
                          {semesterMap[sem]}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm text-center py-10">
                    No data yet
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-cyan-500/10 mb-6">
              <h2 className="text-cyan-400/60 text-xs uppercase tracking-wider font-semibold mb-4">
                💬 Student Suggestions ({suggestions.length})
              </h2>
              {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-cyan-500/5 rounded-xl p-3 hover:border-cyan-500/20 transition"
                    >
                      <p className="text-white/60 text-sm">"{s.text}"</p>
                      <p className="text-cyan-400/30 text-xs mt-1">
                        — {s.name} ({s.department})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm text-center py-6">
                  No suggestions yet
                </p>
              )}
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-cyan-500/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-cyan-400/60 text-xs uppercase tracking-wider font-semibold">
                  🖼️ Student Gallery ({filteredStudents.length})
                </h2>
                <p className="text-white/20 text-xs">Click photo to view</p>
              </div>
              {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredStudents.map((s, i) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-cyan-500/5 rounded-xl overflow-hidden hover:border-cyan-500/20 hover:scale-[1.02] transition-all duration-300 group"
                    >
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt={s.name}
                          className="w-full h-40 object-cover group-hover:brightness-110 transition"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-40 bg-white/5 flex items-center justify-center text-white/20 text-4xl">
                          🎓
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-white/80 text-sm font-semibold truncate">
                          {s.name}
                        </p>
                        <p className="text-cyan-400/40 text-xs truncate">
                          {s.department}
                        </p>
                        <p className="text-white/20 text-[10px] mt-1">
                          Sem {s.semester}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm text-center py-10">
                  No students match your search
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
