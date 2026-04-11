import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { Scene1Hero } from "./scenes/Scene1Hero";
import { Scene2Handwriting } from "./scenes/Scene2Handwriting";
import { Scene3Solver } from "./scenes/Scene3Solver";
import { Scene4Power } from "./scenes/Scene4Power";
import { Scene5CTA } from "./scenes/Scene5CTA";

/* Persistent dark background with drifting gradient orbs */
const PersistentBG: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Orange orb — top-left drift */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.18), transparent 70%)",
          filter: "blur(80px)",
          left: -200 + Math.sin(frame * 0.006) * 120,
          top: -300 + Math.cos(frame * 0.005) * 80,
        }}
      />
      {/* Pink orb — center drift */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.14), transparent 70%)",
          filter: "blur(80px)",
          left: 600 + Math.cos(frame * 0.007) * 100,
          top: 200 + Math.sin(frame * 0.008) * 60,
        }}
      />
      {/* Purple orb — bottom-right drift */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(147,51,234,0.15), transparent 70%)",
          filter: "blur(80px)",
          right: -200 + Math.sin(frame * 0.005) * 90,
          bottom: -200 + Math.cos(frame * 0.006) * 70,
        }}
      />
      {/* Subtle grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <PersistentBG />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={165}>
          <Scene1Hero />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene2Handwriting />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene3Solver />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene4Power />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={165}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
