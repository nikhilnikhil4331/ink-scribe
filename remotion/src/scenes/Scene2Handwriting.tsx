import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

const { fontFamily } = loadFont("normal", { weights: ["500", "700", "900"], subsets: ["latin"] });
const { fontFamily: handFont } = loadCaveat("normal", { weights: ["700"], subsets: ["latin"] });

const TYPED_TEXT = "The quick brown fox jumps over the lazy dog. This is my assignment for physics class.";

export const Scene2Handwriting: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* Section label + title entrance */
  const labelOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 10, fps, config: { damping: 18 } }), [0, 1], [40, 0]);

  /* Description */
  const descOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });

  /* Cards */
  const leftCardOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });
  const leftCardX = interpolate(spring({ frame: frame - 40, fps, config: { damping: 16 } }), [0, 1], [-60, 0]);

  const rightCardOpacity = interpolate(frame, [55, 70], [0, 1], { extrapolateRight: "clamp" });
  const rightCardX = interpolate(spring({ frame: frame - 55, fps, config: { damping: 16 } }), [0, 1], [60, 0]);

  /* Typing animation */
  const charCount = Math.min(
    Math.floor(interpolate(frame, [50, 120], [0, TYPED_TEXT.length], { extrapolateRight: "clamp" })),
    TYPED_TEXT.length
  );

  /* Arrow */
  const arrowOpacity = interpolate(frame, [70, 85], [0, 1], { extrapolateRight: "clamp" });
  const arrowScale = spring({ frame: frame - 70, fps, config: { damping: 12 } });

  /* Handwritten reveal */
  const handOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });
  const handScale = spring({ frame: frame - 80, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 1400, width: "100%" }}>

        {/* Label */}
        <div style={{
          opacity: labelOpacity,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#f472b6",
          marginBottom: 16,
        }}>
          Feature 01
        </div>

        {/* Title */}
        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 68,
          fontWeight: 900,
          textAlign: "center",
          lineHeight: 1.1,
          marginBottom: 12,
        }}>
          <span style={{ color: "white" }}>It Writes Exactly </span>
          <span style={{
            background: "linear-gradient(135deg, #fb923c, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Like You.</span>
        </div>

        {/* Description */}
        <div style={{
          opacity: descOpacity,
          fontSize: 22,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
          maxWidth: 600,
          marginBottom: 50,
        }}>
          Clone your handwriting with AI. Make your digital notes feel personal and authentic.
        </div>

        {/* Split screen */}
        <div style={{ display: "flex", alignItems: "center", gap: 40, width: "100%", padding: "0 40px" }}>

          {/* LEFT: Typed card */}
          <div style={{
            flex: 1,
            opacity: leftCardOpacity,
            transform: `translateX(${leftCardX}px)`,
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            padding: 40,
          }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ef4444" }} />
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#eab308" }} />
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#22c55e" }} />
              <span style={{ marginLeft: 12, fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>editor.txt</span>
            </div>
            <div style={{
              fontFamily: "monospace",
              fontSize: 22,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              minHeight: 100,
            }}>
              {TYPED_TEXT.slice(0, charCount)}
              <span style={{ opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0, color: "#fb923c" }}>|</span>
            </div>
            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 6, background: "rgba(255,255,255,0.04)" }}>
                Typed Input
              </span>
            </div>
          </div>

          {/* ARROW */}
          <div style={{ opacity: arrowOpacity, transform: `scale(${arrowScale})`, flexShrink: 0 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: "linear-gradient(135deg, #fb923c, #ec4899)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 0 40px rgba(236,72,153,0.4)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* RIGHT: Handwritten card */}
          <div style={{
            flex: 1,
            opacity: rightCardOpacity,
            transform: `translateX(${rightCardX}px) scale(${handScale})`,
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(145deg, rgba(255,251,235,0.97), rgba(254,243,199,0.95))",
            padding: 40,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Ruled lines */}
            <div style={{ position: "absolute", inset: "70px 40px 40px 40px" }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: i * 30,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "rgba(147,197,253,0.3)",
                }} />
              ))}
            </div>
            {/* Margin */}
            <div style={{ position: "absolute", left: 60, top: 0, bottom: 0, width: 1, background: "rgba(252,165,165,0.3)" }} />

            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ef4444" }} />
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#eab308" }} />
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#22c55e" }} />
              <span style={{ marginLeft: 12, fontSize: 13, color: "rgba(0,0,0,0.25)", fontFamily: "monospace" }}>handwritten.pdf</span>
            </div>
            <div style={{
              opacity: handOpacity,
              fontFamily: handFont,
              fontSize: 26,
              color: "#1e3a5f",
              lineHeight: 1.5,
              transform: "rotate(-0.5deg)",
              position: "relative",
              minHeight: 100,
            }}>
              {TYPED_TEXT}
            </div>
            <div style={{ marginTop: 20, position: "relative" }}>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.2)", padding: "4px 12px", borderRadius: 6, background: "rgba(0,0,0,0.04)" }}>
                ✨ AI Handwritten
              </span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
