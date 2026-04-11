import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["500", "700", "900"], subsets: ["latin"] });

const features = [
  { icon: "📝", title: "Smart Summarizer", desc: "Turn 50-page lectures into crisp, exam-ready notes in one click." },
  { icon: "🧠", title: "Auto Quiz Generator", desc: "Create practice questions from any topic. Test yourself instantly." },
  { icon: "🎤", title: "Voice to Handwriting", desc: "Dictate your thoughts. Niknote writes them in your handwriting." },
];

const orbs = [
  { x: 250, y: 180, size: 90, hue: 30, delay: 0 },
  { x: 700, y: 120, size: 110, hue: 330, delay: 0.3 },
  { x: 1150, y: 200, size: 80, hue: 270, delay: 0.6 },
  { x: 450, y: 380, size: 70, hue: 350, delay: 0.9 },
  { x: 950, y: 350, size: 100, hue: 25, delay: 1.2 },
];

const connections = [
  [0, 1], [1, 2], [0, 3], [3, 4], [1, 4], [2, 4],
] as const;

export const Scene4Power: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 10, fps, config: { damping: 18 } }), [0, 1], [40, 0]);
  const descOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 1400, width: "100%" }}>

        <div style={{ opacity: labelOpacity, fontSize: 15, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#fb923c", marginBottom: 16 }}>
          Feature 03
        </div>

        <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, fontSize: 68, fontWeight: 900, textAlign: "center", lineHeight: 1.1, marginBottom: 12 }}>
          <span style={{ color: "white" }}>Unlimited </span>
          <span style={{ background: "linear-gradient(135deg, #fb923c, #ec4899, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Power.</span>
        </div>

        <div style={{ opacity: descOpacity, fontSize: 22, color: "rgba(255,255,255,0.4)", textAlign: "center", maxWidth: 600, marginBottom: 50 }}>
          Summarize lectures, organize messy notes, and generate quizzes automatically.
        </div>

        {/* Feature cards */}
        <div style={{ display: "flex", gap: 24, marginBottom: 50, padding: "0 40px", width: "100%" }}>
          {features.map((f, i) => {
            const delay = 35 + i * 14;
            const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });
            const cardY = interpolate(spring({ frame: frame - delay, fps, config: { damping: 16 } }), [0, 1], [40, 0]);

            return (
              <div key={i} style={{
                flex: 1,
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                padding: 36,
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.desc}</div>
                {/* Bottom gradient line */}
                <div style={{
                  marginTop: 20,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, hsl(${[30, 330, 270][i]}, 80%, 60%, 0.4), transparent)`,
                }} />
              </div>
            );
          })}
        </div>

        {/* Neural network orbs */}
        <div style={{ position: "relative", width: 1400, height: 420 }}>
          {/* Connection lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {connections.map(([a, b], i) => {
              const lineDelay = 70 + i * 8;
              const lineOpacity = interpolate(frame, [lineDelay, lineDelay + 15], [0, 0.15], { extrapolateRight: "clamp" });
              return (
                <line
                  key={i}
                  x1={orbs[a].x}
                  y1={orbs[a].y}
                  x2={orbs[b].x}
                  y2={orbs[b].y}
                  stroke="rgba(255,255,255,1)"
                  strokeWidth={1}
                  opacity={lineOpacity}
                />
              );
            })}
          </svg>

          {/* Orbs */}
          {orbs.map((orb, i) => {
            const orbDelay = 65 + i * 10;
            const orbScale = spring({ frame: frame - orbDelay, fps, config: { damping: 12, stiffness: 80 } });
            const orbFloat = Math.sin(frame * 0.04 + i * 1.5) * 10;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: orb.x - orb.size / 2,
                  top: orb.y - orb.size / 2 + orbFloat,
                  width: orb.size,
                  height: orb.size,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, hsla(${orb.hue}, 80%, 60%, 0.35), hsla(${orb.hue}, 80%, 60%, 0.05) 70%)`,
                  transform: `scale(${orbScale})`,
                  boxShadow: `0 0 40px hsla(${orb.hue}, 80%, 60%, 0.2)`,
                }}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
