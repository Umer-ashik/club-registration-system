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

    let photo_url = "";
    let photo_path = "";

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `public/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(path, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("student-photos")
          .getPublicUrl(path);
        photo_url = urlData.publicUrl;
        photo_path = path;
      }
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

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/success");
    } else {
      alert("Registration failed. Try again!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-[#87CEEB]"
      >
        <h1 className="text-3xl font-bold text-center text-[#4A9FD8]">
          📝 Join IT Club
        </h1>
        <p className="text-center text-gray-500 mb-6">BCA Department</p>

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-xl"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="College Email"
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-xl"
          required
        />
        <input
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-xl"
          required
        />
        <input
          name="department"
          placeholder="Department (e.g., BCA)"
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-xl"
          required
        />
        <input
          name="semester"
          type="number"
          placeholder="Semester"
          onChange={handleChange}
          className="w-full p-3 mb-3 border rounded-xl"
          required
        />

        <p className="font-semibold mt-2">Select Interests:</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {["Web Dev", "AI/ML", "Cybersecurity", "Cloud", "App Dev"].map(
            (d) => (
              <label
                key={d}
                className="flex items-center gap-1 bg-[#F5F0E8] px-3 py-1 rounded-full"
              >
                <input type="checkbox" value={d} onChange={handleChange} /> {d}
              </label>
            ),
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded-xl mb-3"
          required
        />
        <textarea
          name="suggestions"
          placeholder="Suggestions for the club?"
          onChange={handleChange}
          className="w-full p-3 border rounded-xl mb-4"
        ></textarea>

        <button
          type="submit"
          className="w-full bg-[#87CEEB] hover:bg-[#4A9FD8] text-white font-bold py-3 rounded-xl transition"
        >
          {loading ? "Registering..." : "🚀 Register & Join WhatsApp"}
        </button>
      </form>
    </div>
  );
}
