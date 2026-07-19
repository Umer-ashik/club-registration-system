// @ts-nocheck
"use client";

import Link from "next/link";

export default function SuccessPage() {
  // ✅ MUST use NEXT_PUBLIC_ prefix for client components
  const link = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || "";

  const handleWhatsAppClick = (e) => {
    if (link && link !== "#" && link.startsWith("http")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      alert(
        "⚠️ WhatsApp group link not configured. Please contact the club admin.",
      );
    }
  };

  return (
    <div className="cyber-page">
      <div className="cyber-bg-glow">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
      </div>

      <div className="cyber-card" style={{ textAlign: "center" }}>
        {/* Logo */}
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

        <h1 className="cyber-heading" style={{ fontSize: "2.5rem" }}>
          Welcome Aboard!
        </h1>
        <p className="cyber-subtitle" style={{ marginBottom: "1.5rem" }}>
          You're now part of the future
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(0,245,255,0.1)",
            borderRadius: "0.75rem",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <p
            style={{
              color: "rgba(0,245,255,0.8)",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            📱 Join Our Community
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
            }}
          >
            Connect with fellow tech enthusiasts
          </p>
        </div>

        <button
          onClick={handleWhatsAppClick}
          className="cyber-btn"
          style={{
            textAlign: "center",
            display: "block",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          📱 Join WhatsApp Group
        </button>

        <Link
          href="/"
          style={{
            display: "block",
            marginTop: "0.75rem",
            color: "rgba(0,245,255,0.3)",
            fontSize: "0.75rem",
            textDecoration: "none",
          }}
        >
          ← Back to Home
        </Link>

        <p
          style={{
            color: "rgba(255,255,255,0.1)",
            fontSize: "0.6rem",
            marginTop: "1.5rem",
          }}
        >
          🔒 Your data is encrypted & secure
        </p>
      </div>
    </div>
  );
}
