"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pie, Bar } from "react-chartjs-2";
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

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

// --- ADMIN PASSWORD (Change this to whatever you want) ---
const ADMIN_PASSWORD = "BCA2026";

export default function DashboardPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  // --- AUTHENTICATION: Only show dashboard if password is correct ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("❌ Incorrect password. Try again.");
    }
  };

  // --- FETCH STUDENTS FROM SUPABASE ---
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

  // --- REAL-TIME SUBSCRIPTION (Live updates when new students register) ---
  useEffect(() => {
    if (isAuthenticated) {
      fetchStudents();

      const channel = supabase
        .channel("students-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "students",
          },
          () => {
            fetchStudents(); // Refresh data when a new student registers
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  // --- CALCULATE STATISTICS ---
  const total = students.length;

  // Department distribution
  const deptMap: Record<string, number> = {};
  students.forEach((s) => {
    deptMap[s.department] = (deptMap[s.department] || 0) + 1;
  });
  const deptLabels = Object.keys(deptMap);
  const deptData = Object.values(deptMap);

  // Domain interests (flatten all arrays)
  const domainMap: Record<string, number> = {};
  students.forEach((s) => {
    if (s.domain_interest && Array.isArray(s.domain_interest)) {
      s.domain_interest.forEach((d: string) => {
        domainMap[d] = (domainMap[d] || 0) + 1;
      });
    }
  });
  const domainLabels = Object.keys(domainMap);
  const domainData = Object.values(domainMap);

  // --- CHART COLORS (Sky Blue theme) ---
  const colors = ["#87CEEB", "#4A9FD8", "#2E7DA4", "#1A5A7A", "#0D3B52"];
  const bgColors = deptLabels.map((_, i) => colors[i % colors.length]);

  // --- IF NOT AUTHENTICATED: Show Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border-t-8 border-[#87CEEB]">
          <h1 className="text-2xl font-bold text-center text-[#4A9FD8]">
            🔐 Admin Dashboard
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Enter the admin password to view analytics
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
            Hint: The password is "BCA2026"
          </p>
        </div>
      </div>
    );
  }

  // --- DASHBOARD RENDER (only if authenticated) ---
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#4A9FD8]">
              📊 IT Club Dashboard
            </h1>
            <p className="text-gray-500">
              BCA Department • Real-time Analytics
            </p>
          </div>
          <div className="bg-[#87CEEB] text-white px-4 py-2 rounded-xl font-bold">
            👥 {total} Registered
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading data...</div>
        ) : (
          <>
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-center text-gray-400">
                    No departments yet.
                  </p>
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
                            label: "Students Interested",
                            data: domainData,
                            backgroundColor: "#87CEEB",
                            borderColor: "#4A9FD8",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
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
                  <p className="text-center text-gray-400">No interests yet.</p>
                )}
              </div>
            </div>

            {/* Suggestions Feed */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-[#F5F0E8] mb-6">
              <h2 className="text-lg font-bold mb-4">💬 Student Suggestions</h2>
              {students.some(
                (s) => s.suggestions && s.suggestions.trim() !== "",
              ) ? (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {students
                    .filter((s) => s.suggestions && s.suggestions.trim() !== "")
                    .map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FDFBF7] p-3 rounded-xl border border-[#F5F0E8]"
                      >
                        <p className="text-sm text-gray-700">
                          "{s.suggestions}"
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          — {s.name} ({s.department})
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">No suggestions yet.</p>
              )}
            </div>

            {/* Student Gallery (Photos + Details) */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-8 border-[#87CEEB]">
              <h2 className="text-lg font-bold mb-4">🖼️ Student Gallery</h2>
              {students.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {students.map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FDFBF7] rounded-xl border border-[#F5F0E8] overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt={s.name}
                          className="w-full h-48 object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                          No Photo
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-bold text-[#4A9FD8]">{s.name}</p>
                        <p className="text-sm text-gray-600">
                          {s.department} • Sem {s.semester}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.domain_interest && Array.isArray(s.domain_interest)
                            ? s.domain_interest.join(", ")
                            : "No interests"}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          {new Date(s.registered_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400">
                  No students registered yet.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
