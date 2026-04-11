import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

const { fontFamily: spaceFam } = loadFont("normal", { weights: ["500", "700"], subsets: ["latin"] });

const features = [
  { icon: "✍️", title: "10+ Handwriting Fonts", desc: "Caveat, Kalam, Dancing Script & more" },
  { icon: "🎨", title: "Custom Pen Colors", desc: "Blue, black, red ink and beyond" },
  { icon: "📄", title: "PDF & Image Export", desc: "Download as PDF or high-res image" },
  { icon: "🎤", title: "Voice Dictation", desc: "Speak and auto-convert to handwriting" },
];

export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame, fps, config: { damping: 20 } }), [0, 1], [-40, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
        <div style={{
          fontFamily: spaceFam,
          fontSize: 48,
          fontWeight: 700,
          color: "white",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}>
          Packed with Features
        </div>

        <div style={{ display: "flex", gap: 30 }}>
          {features.map((f, i) => {
            const delay = 20 + i * 18;
            const cardScale = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
            const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });

            return (
              <div
                key={i}
                style={{
                  width: 340,
                  padding: "40px 30px",
                  borderRadius: 20,
                  background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                  border: "1px solid rgba(255,255,255,0.1)",
                  opacity: cardOpacity,
                  transform: `scale(${cardScale})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 52 }}>{f.icon}</div>
                <div style={{ fontFamily: spaceFam, fontSize: 24, fontWeight: 700, color: "white" }}>{f.title}</div>
                <div style={{ fontFamily: spaceFam, fontSize: 18, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
