"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = "BCA2026";

export default function DashboardPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("❌ Incorrect password. Try again.");
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
    }
  }, [isAuthenticated]);

  const total = students.length;

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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPasswordInput(e.target.value)
              }
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#4A9FD8]">
              📊 IT Club Dashboard
            </h1>
            <p className="text-gray-500">Total Registrations: {total}</p>
          </div>
          <div className="bg-[#87CEEB] text-white px-4 py-2 rounded-xl font-bold">
            👥 {total} Students
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-xl border-t-8 border-[#87CEEB]">
            <h2 className="text-lg font-bold mb-4">🖼️ Registered Students</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {students.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-[#FDFBF7] rounded-xl border border-[#F5F0E8] overflow-hidden shadow-sm"
                >
                  {s.photo_url ? (
                    <img
                      src={s.photo_url}
                      alt={s.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                      No Photo
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-[#4A9FD8]">{s.name}</p>
                    <p className="text-sm text-gray-600">{s.department}</p>
                    <p className="text-xs text-gray-400">
                      Semester: {s.semester}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
