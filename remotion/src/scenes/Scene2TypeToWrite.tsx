import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

const { fontFamily: spaceFam } = loadFont("normal", { weights: ["600"], subsets: ["latin"] });
const { fontFamily: caveatFam } = loadCaveat("normal", { weights: ["700"], subsets: ["latin"] });

export const Scene2TypeToWrite: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typedText = "Hello, this is typed text...";
  const charCount = Math.min(
    Math.floor(interpolate(frame, [10, 70], [0, typedText.length], { extrapolateRight: "clamp" })),
    typedText.length
  );

  const arrowProgress = spring({ frame: frame - 75, fps, config: { damping: 15 } });
  const arrowOpacity = interpolate(frame, [75, 85], [0, 1], { extrapolateRight: "clamp" });

  const handwrittenOpacity = interpolate(frame, [85, 100], [0, 1], { extrapolateRight: "clamp" });
  const handwrittenScale = spring({ frame: frame - 85, fps, config: { damping: 12, stiffness: 100 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 60 }}>
        {/* Title */}
        <div style={{
          fontFamily: spaceFam,
          fontSize: 42,
          color: "rgba(255,255,255,0.9)",
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          Type it. We'll handwrite it.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
          {/* Typed text box */}
          <div style={{
            width: 550,
            padding: "30px 40px",
            borderRadius: 16,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <div style={{ fontFamily: "monospace", fontSize: 26, color: "rgba(255,255,255,0.8)", minHeight: 40 }}>
              {typedText.slice(0, charCount)}
              <span style={{ opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0, color: "#818cf8" }}>|</span>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ opacity: arrowOpacity }}>
            <svg width="80" height="40" viewBox="0 0 80 40">
              <path
                d="M0 20 H60 L50 10 M60 20 L50 30"
                stroke="#818cf8"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="120"
                strokeDashoffset={interpolate(arrowProgress, [0, 1], [120, 0])}
              />
            </svg>
          </div>

          {/* Handwritten output */}
          <div style={{
            width: 550,
            padding: "20px 40px",
            borderRadius: 16,
            background: "rgba(255, 253, 240, 0.95)",
            opacity: handwrittenOpacity,
            transform: `scale(${handwrittenScale})`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            {/* Ruled lines */}
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                position: "absolute",
                left: 40,
                right: 40,
                top: 50 + i * 36,
                height: 1,
                background: "rgba(147, 197, 253, 0.3)",
              }} />
            ))}
            <div style={{
              fontFamily: caveatFam,
              fontSize: 34,
              color: "#1e3a5f",
              transform: "rotate(-1deg)",
              position: "relative",
            }}>
              Hello, this is typed text...
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
