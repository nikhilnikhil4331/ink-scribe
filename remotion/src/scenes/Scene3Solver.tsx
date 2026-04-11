import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["500", "700", "900"], subsets: ["latin"] });

const steps = [
  { label: "Step 1", text: "Apply the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1)" },
  { label: "Step 2", text: "= 3·(x³/3) + 2·(x²/2) − 5x + C" },
  { label: "✅ Answer", text: "= x³ + x² − 5x + C" },
];

export const Scene3Solver: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 10, fps, config: { damping: 18 } }), [0, 1], [40, 0]);
  const descOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });

  /* Card */
  const cardOpacity = interpolate(frame, [35, 50], [0, 1], { extrapolateRight: "clamp" });
  const cardY = interpolate(spring({ frame: frame - 35, fps, config: { damping: 16 } }), [0, 1], [50, 0]);

  /* Question */
  const qOpacity = interpolate(frame, [45, 60], [0, 1], { extrapolateRight: "clamp" });

  /* Spinner */
  const spinnerOpacity = interpolate(frame, [60, 70], [0, 1], { extrapolateRight: "clamp" }) *
                          interpolate(frame, [80, 90], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 900 }}>
        
        {/* Label */}
        <div style={{ opacity: labelOpacity, fontSize: 15, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#a78bfa", marginBottom: 16 }}>
          Feature 02
        </div>

        {/* Title */}
        <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, fontSize: 68, fontWeight: 900, textAlign: "center", lineHeight: 1.1, marginBottom: 12 }}>
          <span style={{ color: "white" }}>Stuck? Just Ask </span>
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Niknote.</span>
        </div>

        {/* Description */}
        <div style={{ opacity: descOpacity, fontSize: 22, color: "rgba(255,255,255,0.4)", textAlign: "center", maxWidth: 600, marginBottom: 40 }}>
          From calculus to history, our AI Solver breaks down complex problems in seconds.
        </div>

        {/* Solver card */}
        <div style={{
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
          width: "100%",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          overflow: "hidden",
        }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#ef4444" }} />
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#eab308" }} />
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#22c55e" }} />
            </div>
            <span style={{ marginLeft: 8, fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>AI Solver — Math Mode</span>
          </div>

          <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Question */}
            <div style={{
              opacity: qOpacity,
              padding: 24,
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Question</div>
              <div style={{ fontSize: 28, fontFamily: "monospace", color: "rgba(255,255,255,0.8)" }}>∫ (3x² + 2x − 5) dx = ?</div>
            </div>

            {/* Spinner */}
            {spinnerOpacity > 0.01 && (
              <div style={{ opacity: spinnerOpacity, display: "flex", alignItems: "center", gap: 10, fontSize: 16, color: "#a78bfa" }}>
                <div style={{
                  width: 18,
                  height: 18,
                  border: "2px solid #a78bfa",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  transform: `rotate(${frame * 8}deg)`,
                }} />
                AI Solving...
              </div>
            )}

            {/* Steps */}
            {steps.map((s, i) => {
              const delay = 75 + i * 22;
              const stepOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });
              const stepX = interpolate(spring({ frame: frame - delay, fps, config: { damping: 18 } }), [0, 1], [-30, 0]);
              const isAnswer = i === steps.length - 1;

              return (
                <div key={i} style={{
                  opacity: stepOpacity,
                  transform: `translateX(${stepX}px)`,
                  padding: 20,
                  borderRadius: 12,
                  background: isAnswer ? "linear-gradient(135deg, rgba(147,51,234,0.12), rgba(236,72,153,0.08))" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isAnswer ? "rgba(147,51,234,0.25)" : "rgba(255,255,255,0.06)"}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: isAnswer ? "#4ade80" : "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    {s.label}
                  </div>
                  <div style={{
                    fontFamily: "monospace",
                    fontSize: isAnswer ? 24 : 20,
                    fontWeight: isAnswer ? 700 : 400,
                    color: isAnswer ? "white" : "rgba(255,255,255,0.6)",
                  }}>
                    {s.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
