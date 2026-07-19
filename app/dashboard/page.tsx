// @ts-nocheck
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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


export default function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const isMounted = useRef(true);
  const fetchRef = useRef(null);
  const channelRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    const role = ROLE_PASSWORDS[passwordInput];
    if (role) {
      setIsAuthenticated(true);
      setUserRole(role);
      setError("");
    } else {
      setError("❌ hey get out man. Access denied.");
    }
  };

  const fetchStudents = useCallback(async () => {
    if (!isMounted.current) return;

    setIsRefreshing(true);
    if (students.length === 0) setLoading(true);

    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("registered_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching students:", error);
      } else if (isMounted.current) {
        setStudents(data || []);
        setLastUpdate(new Date());
        console.log(`✅ Fetched ${data?.length || 0} students`);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }

    if (isMounted.current) {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRef.current = fetchStudents;
  }, [fetchStudents]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStudents();
    }
  }, [isAuthenticated, fetchStudents]);

  // ============================================================
  // REAL-TIME SUBSCRIPTION
  // ============================================================
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log("🔌 Setting up real-time subscription...");

    const channel = supabase
      .channel("students-changes-stable")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "students",
        },
        (payload) => {
          console.log("🔥 EVENT RECEIVED:", payload);
          if (fetchRef.current) {
            fetchRef.current();
          }
        },
      )
      .subscribe((status) => {
        console.log("📡 Realtime status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ ✅ ✅ SUBSCRIBED – waiting for events...");
        }
      });

    channelRef.current = channel;

    return () => {
      console.log("🔌 Cleaning up subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ============================================================
  // DATA ANALYSIS
  // ============================================================

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

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!isAuthenticated) {
    return (
      <div className="cyber-page">
        <div className="cyber-bg-glow">
          <div className="glow-1"></div>
          <div className="glow-2"></div>
        </div>
        <div className="cyber-card" style={{ maxWidth: "28rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "9999px",
                background:
                  "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(180,77,255,0.2))",
                border: "2px solid rgba(0,245,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
                overflow: "hidden",
                boxShadow: "0 0 40px rgba(0,245,255,0.1)",
                animation: "spin3D 10s ease-in-out infinite",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.animationDuration = "2s")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.animationDuration = "10s")
              }
            >
              <img
                src="/club-logo.png"
                alt="Club Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
          <h1 className="cyber-heading" style={{ fontSize: "2rem" }}>
            🔐 Secure Access
          </h1>
          <p className="cyber-subtitle" style={{ marginBottom: "1.5rem" }}>
            DELITECH IT CLUB Dashboard
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="cyber-input"
              style={{ marginBottom: "1rem" }}
              required
            />
            {error && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginBottom: "0.75rem",
                }}
              >
                {error}
              </p>
            )}
            <button type="submit" className="cyber-btn">
              ⚡ Unlock Dashboard
            </button>
          </form>

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.15)",
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Authorized Personnel Only
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.1)",
                fontSize: "0.6rem",
                marginTop: "0.25rem",
              }}
            >
              Admin: admin2026 • President: president2026
              <br />
              VP: vp2026 • Lecturer: lecturer2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD RENDER - GLASSMORPHISM VERSION
  // ============================================================
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "25%",
            width: "24rem",
            height: "24rem",
            background: "rgba(0, 245, 255, 0.03)",
            borderRadius: "9999px",
            filter: "blur(80px)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            right: "25%",
            width: "24rem",
            height: "24rem",
            background: "rgba(180, 77, 255, 0.03)",
            borderRadius: "9999px",
            filter: "blur(80px)",
          }}
        ></div>
      </div>

      {/* Main Container */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ===== HEADER ===== */}
        <div
          className="dashboard-header glass-card"
          style={{
            padding: "1rem 1.5rem",
            borderRadius: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1 className="dashboard-title">DELITECH.IT.CLUB</h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  color: "rgba(0,245,255,0.4)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {userRole}
              </span>
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "9999px",
                  background: "rgba(0,245,255,0.3)",
                }}
              ></span>
              <span
                style={{
                  color: "rgba(0,245,255,0.3)",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Real-time Analytics
              </span>
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: isRefreshing ? "#fbbf24" : "#00f5ff",
                  animation: isRefreshing
                    ? "pulse 0.5s ease-in-out infinite"
                    : "pulse 2s ease-in-out infinite",
                  marginLeft: "0.5rem",
                }}
              ></span>
              {isRefreshing && (
                <span
                  style={{
                    color: "rgba(251,191,36,0.7)",
                    fontSize: "0.55rem",
                    marginLeft: "0.25rem",
                  }}
                >
                  syncing...
                </span>
              )}
              <span
                style={{
                  color: "rgba(255,255,255,0.15)",
                  fontSize: "0.5rem",
                  marginLeft: "0.25rem",
                }}
              >
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="stat">
              <div className="label">Total</div>
              <div className="value">{total}</div>
            </div>

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "9999px",
                background:
                  "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(180,77,255,0.2))",
                border: "2px solid rgba(0,245,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
                overflow: "hidden",
                boxShadow: "0 0 30px rgba(0,245,255,0.1)",
                animation: "spin3D 10s ease-in-out infinite",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.animationDuration = "2s")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.animationDuration = "10s")
              }
            >
              <img
                src="/club-logo.png"
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <button
              onClick={fetchStudents}
              disabled={isRefreshing}
              style={{
                color: isRefreshing
                  ? "rgba(251,191,36,0.4)"
                  : "rgba(0,245,255,0.4)",
                fontSize: "0.65rem",
                padding: "0.5rem 0.75rem",
                border: "1px solid rgba(0,245,255,0.1)",
                borderRadius: "0.75rem",
                background: isRefreshing
                  ? "rgba(251,191,36,0.05)"
                  : "transparent",
                cursor: isRefreshing ? "default" : "pointer",
                transition: "all 0.3s",
              }}
              title={isRefreshing ? "Syncing..." : "Manual Refresh"}
            >
              {isRefreshing ? "⏳" : "🔄"}
            </button>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPasswordInput("");
              }}
              className="dashboard-logout"
            >
              ⚡ Logout
            </button>
          </div>
        </div>

        {/* ===== SEARCH ===== */}
        <div
          className="dashboard-search glass-card"
          style={{
            padding: "1rem",
            borderRadius: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option
              value="All"
              style={{ background: "#0a0a0f", color: "#ffffff" }}
            >
              All Departments
            </option>
            {deptLabels.map((dept) => (
              <option
                key={dept}
                value={dept}
                style={{ background: "#0a0a0f", color: "#ffffff" }}
              >
                {dept}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div
            className="glass-card"
            style={{
              textAlign: "center",
              padding: "5rem",
              borderRadius: "1.5rem",
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading data...</p>
          </div>
        ) : (
          <>
            {/* ===== CHARTS ===== */}
            <div className="dashboard-grid-2">
              <div className="dashboard-section glass-card">
                <h2>🏛️ Department Distribution</h2>
                {deptLabels.length > 0 ? (
                  <div style={{ height: "256px" }}>
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
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      textAlign: "center",
                      padding: "2rem 0",
                    }}
                  >
                    No data yet
                  </p>
                )}
              </div>

              <div className="dashboard-section glass-card">
                <h2>🎯 Domain Interests</h2>
                {domainLabels.length > 0 ? (
                  <div style={{ height: "256px" }}>
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
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      textAlign: "center",
                      padding: "2rem 0",
                    }}
                  >
                    No data yet
                  </p>
                )}
              </div>
            </div>

            {/* ===== LEADERBOARDS ===== */}
            <div className="dashboard-grid-3">
              <div className="dashboard-section glass-card">
                <h2>🏆 Top Departments</h2>
                {deptLeaderboard.length > 0 ? (
                  deptLeaderboard.map(([dept, count], i) => (
                    <div key={dept} className="dashboard-leaderboard-item">
                      <span
                        className={`rank ${
                          i === 0
                            ? "gold"
                            : i === 1
                              ? "silver"
                              : i === 2
                                ? "bronze"
                                : "normal"
                        }`}
                      >
                        #{i + 1}
                      </span>
                      <span className="name">{dept}</span>
                      <span className="count">{count}</span>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      textAlign: "center",
                      padding: "1rem 0",
                    }}
                  >
                    No data yet
                  </p>
                )}
              </div>

              <div className="dashboard-section glass-card">
                <h2>🚀 Top Interests</h2>
                {domainLeaderboard.length > 0 ? (
                  domainLeaderboard.map(([domain, count], i) => (
                    <div key={domain} className="dashboard-leaderboard-item">
                      <span
                        className={`rank ${
                          i === 0
                            ? "gold"
                            : i === 1
                              ? "silver"
                              : i === 2
                                ? "bronze"
                                : "normal"
                        }`}
                      >
                        #{i + 1}
                      </span>
                      <span className="name">{domain}</span>
                      <span className="count">{count}</span>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      textAlign: "center",
                      padding: "1rem 0",
                    }}
                  >
                    No data yet
                  </p>
                )}
              </div>

              <div className="dashboard-section glass-card">
                <h2>📚 Semester Distribution</h2>
                {semesterLabels.length > 0 ? (
                  semesterLabels.map((sem) => (
                    <div key={sem} className="dashboard-leaderboard-item">
                      <span className="name">Semester {sem}</span>
                      <span className="count">{semesterMap[sem]}</span>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      textAlign: "center",
                      padding: "1rem 0",
                    }}
                  >
                    No data yet
                  </p>
                )}
              </div>
            </div>

            {/* ===== SUGGESTIONS ===== */}
            <div className="dashboard-section glass-card">
              <h2>💬 Student Suggestions ({suggestions.length})</h2>
              {suggestions.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "0.75rem",
                    maxHeight: "192px",
                    overflowY: "auto",
                  }}
                >
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "0.75rem",
                        padding: "0.75rem",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <p
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.875rem",
                        }}
                      >
                        "{s.text}"
                      </p>
                      <p
                        style={{
                          color: "rgba(0,245,255,0.3)",
                          fontSize: "0.75rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        — {s.name} ({s.department})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    textAlign: "center",
                    padding: "1rem 0",
                  }}
                >
                  No suggestions yet
                </p>
              )}
            </div>

            {/* ===== GALLERY ===== */}
            <div className="dashboard-section glass-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2>🖼️ Student Gallery ({filteredStudents.length})</h2>
              </div>
              {filteredStudents.length > 0 ? (
                <div className="dashboard-gallery">
                  {filteredStudents.map((s, i) => (
                    <div key={i} className="dashboard-gallery-item">
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt={s.name}
                          style={{
                            width: "100%",
                            height: "160px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "160px",
                            background: "rgba(255,255,255,0.02)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2.5rem",
                            color: "rgba(255,255,255,0.15)",
                          }}
                        >
                          🎓
                        </div>
                      )}
                      <div className="info">
                        <div className="name">{s.name}</div>
                        <div className="dept">{s.department}</div>
                        <div
                          style={{
                            color: "rgba(255,255,255,0.15)",
                            fontSize: "0.6rem",
                            marginTop: "0.25rem",
                          }}
                        >
                          Sem {s.semester}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    textAlign: "center",
                    padding: "2rem 0",
                  }}
                >
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
