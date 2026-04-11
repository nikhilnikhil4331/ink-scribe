import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

export const Scene1Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* Logo entrance */
  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const logoOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  /* Badge */
  const badgeOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const badgeY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 20 } }), [0, 1], [20, 0]);

  /* Headline */
  const h1Opacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });
  const h1Y = interpolate(spring({ frame: frame - 35, fps, config: { damping: 18 } }), [0, 1], [50, 0]);

  /* Subheadline */
  const subOpacity = interpolate(frame, [55, 70], [0, 1], { extrapolateRight: "clamp" });

  /* CTA button */
  const ctaOpacity = interpolate(frame, [70, 85], [0, 1], { extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: frame - 70, fps, config: { damping: 10, stiffness: 100 } });

  /* Social proof */
  const proofOpacity = interpolate(frame, [90, 105], [0, 1], { extrapolateRight: "clamp" });

  /* Pulsing glow behind CTA */
  const glowPulse = 0.5 + 0.3 * Math.sin(frame * 0.06);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, maxWidth: 1200, textAlign: "center" }}>

        {/* Logo */}
        <div style={{ opacity: logoOpacity, transform: `scale(${logoScale})`, marginBottom: 24 }}>
          <Img src={staticFile("images/logo.png")} style={{ height: 70, objectFit: "contain" }} />
        </div>

        {/* Badge */}
        <div style={{
          opacity: badgeOpacity,
          transform: `translateY(${badgeY}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 20px",
          borderRadius: 50,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)",
          marginBottom: 28,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
            AI-Powered Handwriting Generator
          </span>
        </div>

        {/* Headline */}
        <div style={{ opacity: h1Opacity, transform: `translateY(${h1Y}px)` }}>
          <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.05, color: "white", letterSpacing: -3 }}>
            Niknote:
          </div>
          <div style={{
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -3,
            background: "linear-gradient(135deg, #fb923c, #ec4899, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginTop: 4,
          }}>
            Your Notes, Supercharged by AI.
          </div>
        </div>

        {/* Subheadline */}
        <div style={{
          opacity: subOpacity,
          marginTop: 24,
          fontSize: 26,
          color: "rgba(255,255,255,0.45)",
          maxWidth: 700,
          lineHeight: 1.5,
        }}>
          The ultimate study companion that writes like you and solves like a genius.
        </div>

        {/* CTA button */}
        <div style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          marginTop: 40,
          position: "relative",
        }}>
          {/* Blur glow behind */}
          <div style={{
            position: "absolute",
            inset: -20,
            borderRadius: 50,
            background: "linear-gradient(135deg, #fb923c, #ec4899, #a855f7)",
            filter: `blur(30px)`,
            opacity: glowPulse * 0.6,
          }} />
          <div style={{
            position: "relative",
            padding: "20px 56px",
            borderRadius: 50,
            background: "linear-gradient(135deg, #fb923c, #ec4899, #a855f7)",
            fontSize: 24,
            fontWeight: 700,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            ✨ Try Niknote Free
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </div>
        </div>

        {/* Social proof */}
        <div style={{
          opacity: proofOpacity,
          marginTop: 36,
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 16,
          color: "rgba(255,255,255,0.3)",
        }}>
          <span style={{ display: "flex", gap: 2 }}>
            {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#fb923c" }}>★</span>)}
            <span style={{ marginLeft: 4, color: "rgba(255,255,255,0.5)" }}>4.9/5</span>
          </span>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
          <span>Loved by <strong style={{ color: "rgba(255,255,255,0.5)" }}>10,000+</strong> students</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
