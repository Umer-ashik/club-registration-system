// @ts-nocheck
"use client";

import Link from "next/link";

export default function SuccessPage() {
  const link = process.env.WHATSAPP_GROUP_LINK || "#";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0f]">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="bg-[#0f0f1e] rounded-3xl p-6 md:p-8 max-w-md w-full text-center border border-cyan-500/20">
        {/* 3D Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/30 flex items-center justify-center text-5xl backdrop-blur-sm animate-3d-spin">
            🎉
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Welcome Aboard!
        </h1>
        <p className="text-cyan-400/40 text-center text-sm mb-6">
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

        <a
          href={link}
          target="_blank"
          className="block w-full py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-white hover:bg-cyan-500/30 transition text-sm uppercase tracking-wider font-semibold"
        >
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
