import { Fragment, useId, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { cn } from "../lib/cn";
import { faqs } from "../lib/site";
import { services } from "../lib/services";
import { AppLink } from "./AppLink";
import { Button } from "./Button";
import { BreathingOrb } from "./BreathingOrb";
import { DrawnRule, noOrphan, Reveal, TextReveal, useInView } from "./Reveal";
import portraitJpg from "../assets/alulutho-portrait.jpg";
import portrait480 from "../assets/alulutho-portrait-480.webp";
import portrait720 from "../assets/alulutho-portrait-720.webp";
import portrait960 from "../assets/alulutho-portrait-960.webp";

/* ---------------- FAQ accordion ---------------- */
export function Faq() {
  const [open, setOpen] = useState(null);
  const id = useId();
  return (
    <section className="section-pad">
      <div className="container-site grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <TextReveal as="h2" parts={["Questions people often ask."]} className="lg:max-w-[12ch]" />
        <Reveal>
          <ul className="border-t border-line-strong">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              const qId = `${id}-q${i}`;
              const aId = `${id}-a${i}`;
              return (
                <li key={f.q} className="border-b border-line-strong">
                  <h3 className="m-0 font-sans text-base! leading-normal! font-normal">
                    <button
                      id={qId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={aId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold text-navy-800 transition-colors hover:text-gold-700 md:text-xl"
                    >
                      <span>{f.q}</span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-500/70 text-gold-700 transition-transform duration-500 ease-[var(--ease-calm)]",
                          isOpen && "rotate-45",
                        )}
                      >
                        <Plus className="size-4" strokeWidth={1.5} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={aId}
                    role="region"
                    aria-labelledby={qId}
                    data-open={isOpen}
                    inert={isOpen ? undefined : ""}
                    className="acc-panel"
                  >
                    <div>
                      <p className="measure pb-7 text-ink md:pr-14">{f.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Image reveal + portrait ---------------- */
export function ImageReveal({ children, className, frameClassName }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={className}>
      <div data-inview={inView} className={cn("ir-frame size-full rounded-[inherit]", frameClassName)}>
        {children}
      </div>
    </div>
  );
}

export function Portrait({ alt, priority = false, className, children }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[460px] lg:max-w-none", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[18%] bg-[image:var(--gradient-glow-sand)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[5%] -right-[7%] aspect-square w-[92%] rounded-full border border-gold-500"
      />
      <ImageReveal className="arch relative aspect-[4/5]" frameClassName="bg-sand">
        <picture className="block size-full">
          <source
            srcSet={`${portrait480} 480w, ${portrait720} 720w, ${portrait960} 960w`}
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 45vw, 90vw"
            type="image/webp"
          />
          <img
            src={portraitJpg}
            width={960}
            height={1280}
            alt={alt}
            {...(priority ? { fetchpriority: "high" } : { loading: "lazy" })}
            decoding="async"
            className="size-full object-cover object-top"
          />
        </picture>
      </ImageReveal>
      {children}
    </div>
  );
}

/* ---------------- Mission & vision ---------------- */
const missionVision = [
  {
    label: "Our Mission",
    text: "To restore hope and build long-term resilience through targeted psychosocial interventions and practical, solution-focused problem-solving.",
  },
  {
    label: "Our Vision",
    text: "To be a trusted pillar of clinical social work and global community wellbeing — delivering accessible online care without boundaries.",
  },
];

export function MissionVision() {
  return (
    <section className="section-pad bg-surface" aria-label="Mission and vision">
      <div className="container-site grid md:grid-cols-[1fr_1px_1fr]">
        {missionVision.map((m, i) => (
          <Fragment key={m.label}>
            {i === 1 && (
              <span
                aria-hidden="true"
                className="my-12 h-px w-full bg-gold-500/60 md:mx-0 md:my-0 md:h-auto md:w-px"
              />
            )}
            <Reveal index={i} className={i === 0 ? "md:pr-14 lg:pr-20" : "md:pl-14 lg:pl-20"}>
              <p className="eyebrow">{m.label}</p>
              <blockquote className="mt-6 font-display text-[clamp(1.875rem,1.6rem+0.8vw,2.25rem)] leading-snug font-medium text-navy-800">
                {m.text}
              </blockquote>
            </Reveal>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Service panels ---------------- */
const PANEL_TONES = ["navy", "sand", "white", "navy", "sand"];
const TONE_CLASS = {
  navy: "on-navy bg-navy-800",
  sand: "bg-sand",
  white: "bg-surface border border-line",
};

function PanelRings() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      className="pointer-events-none absolute top-1/2 -right-40 size-[360px] -translate-y-1/2 opacity-60 transition-transform duration-[1200ms] ease-[var(--ease-calm)] group-hover:rotate-[8deg] md:-right-20 md:size-[420px] lg:right-4"
    >
      <circle cx="200" cy="200" r="190" fill="none" className="stroke-gold-500" strokeWidth="1" />
      <circle cx="200" cy="200" r="160" fill="none" className="stroke-gold-500" strokeWidth="0.6" opacity="0.5" />
      <circle cx="200" cy="10" r="4" className="fill-gold-500" />
    </svg>
  );
}

export function ServicePanels({ withHeading = true, className }) {
  const H = withHeading ? "h3" : "h2";
  return (
    <section className={cn("section-pad", className)} aria-label={withHeading ? undefined : "Services"}>
      <div className="container-site">
        {withHeading && (
          <>
            <Reveal>
              <p className="eyebrow">How I Can Help</p>
            </Reveal>
            <TextReveal
              as="h2"
              parts={["Five areas of support,", { em: "one steady hand" }, "."]}
              className="mt-5 max-w-[16ch]"
            />
          </>
        )}
        <ol className={cn("space-y-6", withHeading && "mt-16")}>
          {services.map((s, i) => {
            const tone = PANEL_TONES[i] ?? "sand";
            const navy = tone === "navy";
            return (
              <Reveal as="li" key={s.slug}>
                <article
                  className={cn(
                    "group relative overflow-hidden rounded-[var(--radius-panel)] p-8 shadow-[var(--shadow-card)] transition-transform duration-500 ease-[var(--ease-calm)] hover:-translate-y-1 md:p-12 lg:p-16",
                    TONE_CLASS[tone],
                  )}
                >
                  <PanelRings />
                  <div className="relative grid gap-6 md:grid-cols-[88px_1fr] md:gap-10">
                    <span
                      className={cn(
                        "font-display text-[2rem] leading-none font-medium italic [font-variant-numeric:lining-nums]",
                        navy ? "text-gold-500" : "text-gold-700",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="max-w-[40rem]">
                      <H className="text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] leading-[1.2] font-semibold">
                        {noOrphan(s.fullTitle)}
                      </H>
                      <p
                        className={cn(
                          "mt-4 font-display text-[1.5rem] leading-snug font-medium italic",
                          navy ? "text-gold-500" : "text-gold-700",
                        )}
                      >
                        {s.promise}
                      </p>
                      <p className={cn("mt-4 text-base md:text-lg", navy ? "text-ivory-soft" : "text-muted-foreground")}>
                        {s.description}
                      </p>
                      <Button asChild variant={navy ? "gold" : "default"} className="mt-8">
                        <AppLink to={`/services/${s.slug}`}>
                          Learn more
                          <span className="sr-only"> about {s.fullTitle}</span>
                          <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
                        </AppLink>
                      </Button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- CTA band ---------------- */
export function CtaBand() {
  return (
    <section className="px-3 pb-[clamp(48px,6vw,80px)] md:px-6">
      <div className="on-navy rounded-[var(--radius-panel)] bg-navy-900 py-[clamp(56px,7vw,96px)]">
        <div className="container-site flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <BreathingOrb size="mini" />
            <DrawnRule className="hidden max-w-16 md:block" />
            <p className="font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] leading-tight font-medium italic text-ivory">
              Let&apos;s take this one step at a time.
            </p>
          </div>
          <Button asChild variant="gold" className="shrink-0">
            <AppLink to="/book">
              Book a Session
              <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
            </AppLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
