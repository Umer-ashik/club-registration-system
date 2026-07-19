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
  const [fileError, setFileError] = useState("");

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFileError("");

    if (selectedFile) {
      // 1 MB = 1,048,576 bytes
      const maxSize = 1 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setFileError("❌ File is too large. Please upload a photo under 1 MB.");
        e.target.value = ""; // reset input
        setFile(null);
        return;
      }
      setFile(selectedFile);
    } else {
      setFile(null);
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
    <div className="cyber-page">
      <div className="cyber-bg-glow">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
      </div>

      <div className="cyber-card">
        {/* Logo - Centered at Top */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: "112px",
              height: "112px",
              borderRadius: "9999px",
              background:
                "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(180,77,255,0.2))",
              border: "2px solid rgba(0,245,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
              overflow: "hidden",
              boxShadow: "0 0 50px rgba(0,245,255,0.15)",
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

        <h2 className="cyber-heading">⚡ Join</h2>
        <h1 className="cyber-heading"> DELITECH </h1>
        <p className="cyber-subtitle" style={{ marginBottom: "1.5rem" }}>
          CHANGE IS CONSTANT, DELITECH KEEPS YOU AHEAD
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="cyber-input"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            onChange={handleChange}
            className="cyber-input"
            required
          />
          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="cyber-input"
            required
          />
          <input
            name="department"
            placeholder="Department (e.g., BCA)"
            onChange={handleChange}
            className="cyber-input"
            required
          />
          <input
            name="semester"
            type="number"
            placeholder="Your Current Semester"
            onChange={handleChange}
            className="cyber-input"
            required
          />

          <span className="cyber-label">Select Interests</span>
          <div className="cyber-checkbox-group">
            {["Web Dev", "AI/ML", "Cybersecurity", "Cloud", "App Dev"].map(
              (d) => (
                <label key={d} className="cyber-checkbox-label">
                  <input type="checkbox" value={d} onChange={handleChange} />{" "}
                  {d}
                </label>
              ),
            )}
          </div>

          {/* ===== UPDATED FILE INPUT WITH CUSTOM MESSAGE & VALIDATION ===== */}
          <div style={{ marginTop: "0.5rem" }}>
            <label className="cyber-label" style={{ marginBottom: "0.25rem" }}>
              📸 Upload Photo (max 1 MB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cyber-file"
              required
            />
            {!file && !fileError && (
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.7rem",
                  marginTop: "0.25rem",
                }}
              >
                Please upload a photo under 1 MB (recommended ~500 KB)
              </p>
            )}
            {file && !fileError && (
              <p
                style={{
                  color: "rgba(0,245,255,0.6)",
                  fontSize: "0.7rem",
                  marginTop: "0.25rem",
                }}
              >
                ✅ {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {fileError && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {fileError}
              </p>
            )}
          </div>

          <textarea
            name="suggestions"
            placeholder="Your intention to join this club?"
            onChange={handleChange}
            className="cyber-input textarea"
          />

          <button type="submit" className="cyber-btn" disabled={loading}>
            {loading ? "Registering..." : "🚀 Register & Join"}
          </button>
        </form>
      </div>
    </div>
  );
}
