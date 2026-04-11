import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily: spaceFam } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const Scene1Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const penX = interpolate(
    spring({ frame: frame - 25, fps, config: { damping: 15, stiffness: 80 } }),
    [0, 1], [-200, 0]
  );
  const penOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });

  const tagOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(
    spring({ frame: frame - 50, fps, config: { damping: 20 } }),
    [0, 1], [30, 0]
  );

  const glowPulse = 0.5 + 0.5 * Math.sin(frame * 0.05);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99, 102, 241, ${0.15 + glowPulse * 0.1}), transparent 70%)`,
          filter: "blur(60px)",
          transform: `scale(${logoScale})`,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Logo with pen icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: logoOpacity, transform: `scale(${logoScale})` }}>
          <div style={{ opacity: penOpacity, transform: `translateX(${penX}px)` }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#penGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="penGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </div>
          <span style={{
            fontFamily: spaceFam,
            fontSize: 96,
            fontWeight: 700,
            background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #f9a8d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -2,
          }}>
            NikNote
          </span>
        </div>

        {/* Tagline */}
        <div style={{ opacity: tagOpacity, transform: `translateY(${tagY}px)` }}>
          <span style={{
            fontFamily: spaceFam,
            fontSize: 28,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}>
            Your Handwriting, Digitized
          </span>
        </div>
      </div>

      {/* Decorative lines */}
      {[0, 1].map((i) => {
        const lineW = interpolate(frame, [60 + i * 10, 90 + i * 10], [0, i === 0 ? 300 : 200], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 280 + i * 40,
              left: "50%",
              transform: "translateX(-50%)",
              width: lineW,
              height: 1,
              background: `linear-gradient(90deg, transparent, rgba(${i === 0 ? "129,140,248" : "236,72,153"}, 0.4), transparent)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
