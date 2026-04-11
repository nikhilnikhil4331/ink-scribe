import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily: spaceFam } = loadFont("normal", { weights: ["600", "700"], subsets: ["latin"] });

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 10, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const urlOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateRight: "clamp" });
  const urlY = interpolate(spring({ frame: frame - 40, fps, config: { damping: 18 } }), [0, 1], [20, 0]);

  const badgeOpacity = interpolate(frame, [60, 75], [0, 1], { extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 60, fps, config: { damping: 12 } });

  const glowIntensity = 0.3 + 0.2 * Math.sin(frame * 0.06);

  // Shimmer effect on button
  const shimmerX = interpolate(frame, [70, 130], [-300, 600], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Central glow */}
      <div style={{
        position: "absolute",
        width: 800,
        height: 800,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(99,102,241,${glowIntensity}), transparent 60%)`,
        filter: "blur(80px)",
      }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, position: "relative" }}>
        <div style={{
          fontFamily: spaceFam,
          fontSize: 72,
          fontWeight: 700,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #f9a8d4 80%, #ffffff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          lineHeight: 1.2,
        }}>
          Start Writing<br />Beautifully
        </div>

        {/* CTA button */}
        <div style={{
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
          padding: "20px 60px",
          borderRadius: 50,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
          boxShadow: "0 10px 40px rgba(99,102,241,0.4)",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Shimmer */}
          <div style={{
            position: "absolute",
            top: 0,
            left: shimmerX,
            width: 100,
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            transform: "skewX(-20deg)",
          }} />
          <span style={{
            fontFamily: spaceFam,
            fontSize: 28,
            fontWeight: 700,
            color: "white",
            letterSpacing: 1,
            position: "relative",
          }}>
            Try NikNote Free →
          </span>
        </div>

        {/* URL */}
        <div style={{
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
          fontFamily: spaceFam,
          fontSize: 24,
          color: "rgba(255,255,255,0.4)",
          fontWeight: 600,
          letterSpacing: 2,
        }}>
          homenik.lovable.app
        </div>
      </div>
    </AbsoluteFill>
  );
};
