import { cn } from "../lib/cn";

export function BreathingOrb({ size = "full", variant = "breathe", className }) {
  const mini = size === "mini";
  const pulse = variant === "pulse";
  return (
    <div
      {...(pulse
        ? { "aria-hidden": true }
        : {
            role: "img",
            "aria-label": "A slowly breathing circle. Breathe in as it grows and out as it shrinks.",
          })}
      className={cn("relative aspect-square shrink-0", mini ? "w-[120px]" : "w-full max-w-[400px]", className)}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-0 rounded-full border border-gold-500/50", !pulse && "orb-ring")}
      />
      <span
        aria-hidden="true"
        className={cn("absolute inset-[9%] rounded-full", pulse ? "orb-fill orb-pulse" : "orb-core")}
      />
      {!mini && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-medium italic text-navy-900"
        >
          <span className="cue-in absolute">breathe in</span>
          <span className="cue-out absolute">breathe out</span>
          <span className="cue-static">breathe in · breathe out</span>
        </span>
      )}
    </div>
  );
}
