import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Scene1Logo } from "./scenes/Scene1Logo";
import { Scene2TypeToWrite } from "./scenes/Scene2TypeToWrite";
import { Scene3Features } from "./scenes/Scene3Features";
import { Scene4AI } from "./scenes/Scene4AI";
import { Scene5CTA } from "./scenes/Scene5CTA";

const BG: React.FC = () => {
  const frame = useCurrentFrame();
  const hue1 = interpolate(frame, [0, 600], [220, 260]);
  const hue2 = interpolate(frame, [0, 600], [250, 200]);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, hsl(${hue1}, 25%, 8%) 0%, hsl(${hue2}, 30%, 12%) 50%, hsl(210, 20%, 6%) 100%)`,
      }}
    />
  );
};

const FloatingOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 300, y: 200, size: 400, color: "rgba(99, 102, 241, 0.08)", speed: 0.008 },
    { x: 1400, y: 600, size: 500, color: "rgba(236, 72, 153, 0.06)", speed: 0.012 },
    { x: 900, y: 400, size: 350, color: "rgba(34, 211, 238, 0.05)", speed: 0.01 },
  ];
  return (
    <AbsoluteFill>
      {orbs.map((orb, i) => {
        const ox = orb.x + Math.sin(frame * orb.speed + i) * 60;
        const oy = orb.y + Math.cos(frame * orb.speed + i * 2) * 40;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: ox - orb.size / 2,
              top: oy - orb.size / 2,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <BG />
      <FloatingOrbs />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene1Logo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene2TypeToWrite />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene3Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene4AI />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
