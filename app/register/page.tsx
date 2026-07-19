// @ts-nocheck
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    semester: 1,
    domain_interest: [],
    suggestions: "",
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const arr = form.domain_interest;
      if (checked) {
        setForm({ ...form, domain_interest: [...arr, value] });
      } else {
        setForm({
          ...form,
          domain_interest: arr.filter((v) => v !== value),
        });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!file) {
      alert("⚠️ Please select a photo.");
      setLoading(false);
      return;
    }

    let photo_url = "";
    let photo_path = "";

    try {
      const ext = file.name.split(".").pop();
      const path = `public/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(path, file);

      if (uploadError) {
        alert("❌ Photo upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("student-photos")
        .getPublicUrl(path);

      photo_url = urlData.publicUrl;
      photo_path = path;
    } catch (err) {
      alert("❌ Photo upload error: " + err.message);
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      department: form.department,
      semester: Number(form.semester),
      domain_interest: form.domain_interest,
      suggestions: form.suggestions,
      photo_url,
      photo_path,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/success");
      } else {
        const errorText = await res.text();
        alert("❌ Registration failed: " + errorText);
      }
    } catch (err) {
      alert("❌ Network error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Cyber Card */}
      <div className="bg-[#0f0f1e] rounded-3xl p-8 md:p-10 max-w-md w-full border border-cyan-500/20 shadow-[0_0_60px_rgba(0,245,255,0.04)]">
        {/* LOGO - CENTERED AT TOP */}
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/30 flex items-center justify-center backdrop-blur-sm animate-3d-spin shadow-[0_0_50px_rgba(0,245,255,0.15)] overflow-hidden">
            <img
              src="/club-logo.png"
              alt="Club Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-center text-white">
          ⚡ Join IT Club
        </h1>
        <p className="text-cyan-400/40 text-center text-sm mb-8">
          BCA Department
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_30px_rgba(0,245,255,0.05)] transition"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="College Email"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_30px_rgba(0,245,255,0.05)] transition"
            required
          />
          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_30px_rgba(0,245,255,0.05)] transition"
            required
          />
          <input
            name="department"
            placeholder="Department (e.g., BCA)"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_30px_rgba(0,245,255,0.05)] transition"
            required
          />
          <input
            name="semester"
            type="number"
            placeholder="Semester"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_30px_rgba(0,245,255,0.05)] transition"
            required
          />

          <p className="text-cyan-400/60 text-xs uppercase tracking-wider font-semibold mt-4">
            Select Interests
          </p>
          <div className="flex flex-wrap gap-2">
            {["Web Dev", "AI/ML", "Cybersecurity", "Cloud", "App Dev"].map(
              (d) => (
                <label
                  key={d}
                  className="flex items-center gap-1 bg-white/5 border border-cyan-500/15 px-3 py-1.5 rounded-full text-xs text-white/80 hover:border-cyan-400/30 transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={d}
                    onChange={handleChange}
                    className="accent-cyan-400"
                  />{" "}
                  {d}
                </label>
              ),
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 rounded-xl bg-white/5 border border-cyan-500/20 text-white/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-cyan-500/20 file:text-cyan-400 file:text-xs file:font-semibold hover:file:bg-cyan-500/30 transition"
            required
          />

          <textarea
            name="suggestions"
            placeholder="Suggestions for the club?"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white/5 border border-cyan-500/20 text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_30px_rgba(0,245,255,0.05)] transition h-20 resize-none"
          />

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/25 text-white hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-400/40 transition text-sm uppercase tracking-wider font-semibold disabled:opacity-50 mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Registering...
              </span>
            ) : (
              "🚀 Register & Join"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
