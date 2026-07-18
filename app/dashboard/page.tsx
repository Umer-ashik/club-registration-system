// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

// Load charts only on browser
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

const ADMIN_PASSWORD = "BCA2026";

export default function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");

  // --- LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("❌ Incorrect password.");
    }
  };

  // --- FETCH STUDENTS ---
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

  // --- REAL-TIME ---
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

  // ============================================================
  // DATA ANALYSIS
  // ============================================================

  const total = students.length;

  // 1. Department Distribution
  const deptMap = {};
  students.forEach((s) => {
    deptMap[s.department] = (deptMap[s.department] || 0) + 1;
  });
  const deptLabels = Object.keys(deptMap);
  const deptData = Object.values(deptMap);

  // 2. Department Leaderboard (Top 5)
  const deptLeaderboard = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 3. Domain Interest Distribution
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

  // 4. Domain Leaderboard (Top 5)
  const domainLeaderboard = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 5. Semester Distribution
  const semesterMap = {};
  students.forEach((s) => {
    semesterMap[s.semester] = (semesterMap[s.semester] || 0) + 1;
  });
  const semesterLabels = Object.keys(semesterMap).sort((a, b) => a - b);

  // 6. Suggestions
  const suggestions = students
    .filter((s) => s.suggestions && s.suggestions.trim())
    .map((s) => ({
      name: s.name,
      text: s.suggestions,
      department: s.department,
    }));

  // 7. Filtered students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "All" || s.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // 8. Chart Colors
  const colors = [
    "#87CEEB",
    "#4A9FD8",
    "#2E7DA4",
    "#1A5A7A",
    "#0D3B52",
    "#00f5ff",
    "#b44dff",
    "#ff6b6b",
  ];
  const bgColors = deptLabels.map((_, i) => colors[i % colors.length]);
  const domainColors = domainLabels.map(
    (_, i) => colors[(i + 2) % colors.length],
  );

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border-t-8 border-[#87CEEB]">
          <h1 className="text-2xl font-bold text-center text-[#4A9FD8]">
            🔐 Admin Dashboard
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Enter the admin password
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-3 border rounded-xl mb-4"
              required
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#87CEEB] hover:bg-[#4A9FD8] text-white font-bold py-3 rounded-xl transition"
            >
              Unlock Dashboard
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Password: BCA2026
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#4A9FD8]">
              📊 IT Club Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              BCA Department • Real-time Analytics
            </p>
          </div>
          <div className="bg-[#87CEEB] text-white px-4 py-2 rounded-xl font-bold">
            👥 {total} Registered
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#87CEEB] min-w-[150px]"
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
          <div className="bg-white p-20 text-center rounded-2xl shadow-xl">
            <p className="text-gray-400">Loading data...</p>
          </div>
        ) : (
          <>
            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Department Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-[#87CEEB]">
                <h2 className="text-lg font-bold mb-4 text-center">
                  🏛️ Department Distribution
                </h2>
                {deptLabels.length > 0 ? (
                  <div className="h-64 flex justify-center">
                    <Pie
                      data={{
                        labels: deptLabels,
                        datasets: [
                          {
                            data: deptData,
                            backgroundColor: bgColors,
                            borderColor: "#ffffff",
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
                            labels: { font: { size: 12 } },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-10">No data yet</p>
                )}
              </div>

              {/* Domain Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-[#4A9FD8]">
                <h2 className="text-lg font-bold mb-4 text-center">
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
                            borderColor: "#ffffff",
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
                            ticks: { stepSize: 1 },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-10">No data yet</p>
                )}
              </div>
            </div>

            {/* LEADERBOARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Department Leaderboard */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-[#87CEEB]">
                <h2 className="text-lg font-bold mb-4 text-center">
                  🏆 Top Departments
                </h2>
                {deptLeaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {deptLeaderboard.map(([dept, count], i) => (
                      <div
                        key={dept}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-gray-600"}`}
                          >
                            #{i + 1}
                          </span>
                          <span className="text-gray-700">{dept}</span>
                        </div>
                        <span className="text-[#4A9FD8] font-bold">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-10">No data yet</p>
                )}
              </div>

              {/* Domain Leaderboard */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-[#4A9FD8]">
                <h2 className="text-lg font-bold mb-4 text-center">
                  🚀 Top Interests
                </h2>
                {domainLeaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {domainLeaderboard.map(([domain, count], i) => (
                      <div
                        key={domain}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-gray-600"}`}
                          >
                            #{i + 1}
                          </span>
                          <span className="text-gray-700">{domain}</span>
                        </div>
                        <span className="text-[#4A9FD8] font-bold">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-10">No data yet</p>
                )}
              </div>

              {/* Semester Distribution */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-gray-300">
                <h2 className="text-lg font-bold mb-4 text-center">
                  📚 Semester Distribution
                </h2>
                {semesterLabels.length > 0 ? (
                  <div className="space-y-2">
                    {semesterLabels.map((sem) => (
                      <div
                        key={sem}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-700">Semester {sem}</span>
                        <span className="text-[#4A9FD8] font-bold">
                          {semesterMap[sem]}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-10">No data yet</p>
                )}
              </div>
            </div>

            {/* SUGGESTIONS */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-gray-300 mb-6">
              <h2 className="text-lg font-bold mb-4">
                💬 Student Suggestions ({suggestions.length})
              </h2>
              {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 p-3 rounded-xl border border-gray-200"
                    >
                      <p className="text-gray-700 text-sm">"{s.text}"</p>
                      <p className="text-gray-400 text-xs mt-1">
                        — {s.name} ({s.department})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-6">
                  No suggestions yet
                </p>
              )}
            </div>

            {/* STUDENT GALLERY */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-8 border-[#87CEEB]">
              <h2 className="text-lg font-bold mb-4">
                🖼️ Student Gallery ({filteredStudents.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredStudents.map((s, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    {s.photo_url ? (
                      <img
                        src={s.photo_url}
                        alt={s.name}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-4xl">
                        🎓
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-bold text-[#4A9FD8] truncate">
                        {s.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {s.department}
                      </p>
                      <p className="text-xs text-gray-400">Sem {s.semester}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
