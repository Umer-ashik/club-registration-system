// @ts-nocheck
"use client";

import Link from "next/link";

export default function SuccessPage() {
  const link = process.env.WHATSAPP_GROUP_LINK || "#";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="cyber-card text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/30 flex items-center justify-center backdrop-blur-sm animate-3d-spin shadow-[0_0_40px_rgba(0,245,255,0.1)] overflow-hidden">
            <img
              src="/club-logo.png"
              alt="Club Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Welcome Aboard!
        </h1>
        <p className="text-cyan-400/40 text-sm mb-6">
          You're now part of the future
        </p>

        <div className="bg-white/5 border border-cyan-500/10 rounded-xl p-4 mb-6">
          <p className="text-cyan-400/80 text-sm font-semibold">
            📱 Join Our Community
          </p>
          <p className="text-white/30 text-xs mt-1">
            Connect with fellow tech enthusiasts
          </p>
        </div>

        <a href={link} target="_blank" className="cyber-btn block text-center">
          📱 Join WhatsApp Group
        </a>

        <Link
          href="/"
          className="block mt-3 text-cyan-400/30 hover:text-cyan-400/60 text-xs transition"
        >
          ← Back to Home
        </Link>

        <p className="text-white/10 text-[10px] mt-6">
          🔒 Your data is encrypted & secure
        </p>
      </div>
    </div>
  );
}
