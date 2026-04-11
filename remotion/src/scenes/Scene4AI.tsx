import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily: spaceFam } = loadFont("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const Scene4AI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 15 } });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const brainPulse = 0.9 + 0.1 * Math.sin(frame * 0.08);
  const brainOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });

  const features = ["Solve Homework", "Summarize PDFs", "Write Essays", "Answer Questions"];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 100 }}>
        {/* Left side - AI brain */}
        <div style={{
          opacity: brainOpacity,
          transform: `scale(${brainPulse})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}>
          <div style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(236,72,153,0.2))",
            border: "2px solid rgba(129,140,248,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 80,
            boxShadow: `0 0 ${40 + brainPulse * 20}px rgba(99,102,241,0.2)`,
          }}>
            🧠
          </div>
          <span style={{
            fontFamily: spaceFam,
            fontSize: 22,
            color: "#818cf8",
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}>
            AI Solver
          </span>
        </div>

        {/* Right side - capabilities */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{
            fontFamily: spaceFam,
            fontSize: 46,
            fontWeight: 700,
            color: "white",
            opacity: titleOpacity,
            transform: `translateX(${interpolate(titleSpring, [0, 1], [60, 0])}px)`,
          }}>
            AI-Powered Intelligence
          </div>

          {features.map((f, i) => {
            const delay = 30 + i * 15;
            const itemOpacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
            const itemX = interpolate(
              spring({ frame: frame - delay, fps, config: { damping: 18 } }),
              [0, 1], [80, 0]
            );
            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #818cf8, #ec4899)",
                }} />
                <span style={{
                  fontFamily: spaceFam,
                  fontSize: 30,
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 500,
                }}>
                  {f}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
