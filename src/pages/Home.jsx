import { ArrowRight } from "lucide-react";
import { AppLink } from "../components/AppLink";
import { Button } from "../components/Button";
import { BreathingOrb } from "../components/BreathingOrb";
import { DrawnRule, Reveal, TextReveal } from "../components/Reveal";
import { Faq, ImageReveal, MissionVision, Portrait, ServicePanels } from "../components/Sections";
import { hasValue, site } from "../lib/site";
import { usePageMeta } from "../lib/meta";
import portraitJpg from "../assets/alulutho-portrait.jpg";
import portrait480 from "../assets/alulutho-portrait-480.webp";
import portrait720 from "../assets/alulutho-portrait-720.webp";
import portrait960 from "../assets/alulutho-portrait-960.webp";

const heroChips = [
  `SACSSP Registered · ${site.sacsspNumber}`,
  ...(hasValue(site.practiceNumber) ? [`Practice Number ${site.practiceNumber}`] : []),
  "6 years in hospital practice",
  "In person & online",
];

function Hero() {
  return (
    <section className="relative pt-[clamp(32px,6vw,88px)] pb-[clamp(80px,9vw,140px)]">
      <div className="container-site grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">Registered Social Worker · In person &amp; online</p>
          </Reveal>
          <TextReveal
            as="h1"
            parts={["Steady support for life's", { em: "hardest seasons." }]}
            className="mt-6 max-w-[13ch]"
          />
          <Reveal index={3}>
            <p className="lead measure mt-8">
              Compassionate, professional psychosocial support for individuals, families and organisations — in
              person or online, wherever you are.
            </p>
          </Reveal>
          <Reveal index={4} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button asChild>
              <AppLink to="/book">
                Book a Session
                <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
              </AppLink>
            </Button>
            <Button asChild variant="outline">
              <AppLink to="/services">Explore Services</AppLink>
            </Button>
          </Reveal>
          <Reveal index={5}>
            <p className="mt-7 text-[15px] text-muted-foreground">
              New here? You can also complete your{" "}
              <AppLink to="/intake" className="link-draw">
                client intake form
              </AppLink>{" "}
              online.
            </p>
          </Reveal>
        </div>
        <Portrait
          className="lg:col-span-5"
          priority
          alt="Alulutho Charmaine Xanywa, registered social worker, smiling on a sunny balcony."
        >
          <ul className="relative mt-6 flex flex-wrap gap-2.5 lg:absolute lg:bottom-10 lg:-left-12 lg:mt-0 lg:flex-col lg:items-start">
            {heroChips.map((c, i) => (
              <Reveal as="li" key={c} index={i + 4} stagger={180}>
                <span className="chip">{c}</span>
              </Reveal>
            ))}
          </ul>
        </Portrait>
      </div>
    </section>
  );
}

const values = ["Private Practice", "Compassionate Care", "Professionalism"];

function ValueRow() {
  return values.map((v) => (
    <span key={v} className="flex items-center">
      <span className="font-display text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] font-medium italic text-navy-800">{v}</span>
      <span className="px-8 text-[15px] text-gold-500" aria-hidden="true">
        ✦
      </span>
    </span>
  ));
}

function Marquee() {
  return (
    <section aria-label="Practice values" className="marquee overflow-hidden border-y border-gold-500/60 py-6">
      <p className="sr-only">{values.join(", ")}</p>
      <div className="marquee-track" aria-hidden="true">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            <ValueRow />
            <ValueRow />
            <ValueRow />
          </div>
        ))}
      </div>
      <div className="marquee-static container-site flex-wrap items-center justify-center" aria-hidden="true">
        <ValueRow />
      </div>
    </section>
  );
}

function Practice() {
  return (
    <section className="section-pad">
      <div className="container-site">
        <Reveal>
          <p className="eyebrow">The Practice</p>
        </Reveal>
        <TextReveal
          as="h2"
          parts={["A calm, confidential place to", { em: "find your footing" }, "."]}
          className="mt-5 max-w-[18ch]"
        />
        <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="font-display text-[clamp(1.5rem,1.3rem+0.6vw,1.75rem)] leading-snug font-medium text-navy-800">
              An independent clinical social work and psychosocial consulting practice, specialising in client-centred
              therapeutic care and crisis stabilisation.
            </p>
          </Reveal>
          <Reveal index={1}>
            <p className="measure text-ink">
              This is a confidential, non-judgemental space, equipped to offer rapid crisis intervention when you need
              it most. Together we work through complex life transitions, mental health concerns and relationship
              challenges — one practical step at a time.
            </p>
            <AppLink to="/about" className="link-draw mt-8 inline-flex min-h-11 items-center gap-2">
              Meet Alulutho
              <ArrowRight className="btn-arrow size-4" strokeWidth={1.5} aria-hidden="true" />
            </AppLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const familiar = [
  "A diagnosis has turned your family's world upside down.",
  "You're caring for someone you love, and you're running on empty.",
  "Home has started to feel like a place of conflict.",
  "Grief arrived, and the world didn't slow down for you.",
  "Alcohol or drugs are costing you more than they give.",
];

function Familiar() {
  return (
    <section className="section-pad bg-sand">
      <div className="container-site">
        <TextReveal as="h2" parts={["Maybe this sounds familiar."]} />
        <Reveal index={1}>
          <p className="lead measure mt-6">
            People rarely arrive with the right words. Most arrive with a feeling they&apos;ve carried for a while.
          </p>
        </Reveal>
        <ul className="mt-14 border-t border-gold-500/60">
          {familiar.map((f, i) => (
            <Reveal
              as="li"
              key={f}
              index={i}
              className="flex items-start gap-5 border-b border-gold-500/60 py-7 md:gap-7 md:py-9"
            >
              <span aria-hidden="true" className="mt-[0.85em] size-2 shrink-0 rounded-full bg-gold-500" />
              <span className="font-display text-[clamp(1.6rem,1.3rem+1.2vw,2.4rem)] leading-tight font-medium text-navy-800">
                {f}
              </span>
            </Reveal>
          ))}
        </ul>
        <Reveal>
          <p className="mt-12 font-display text-[clamp(1.6rem,1.35rem+1vw,2.25rem)] leading-snug font-medium italic text-gold-700">
            Whatever brought you here, we can start there.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function BreathSection() {
  return (
    <section className="px-3 md:px-6" aria-labelledby="breathe-heading">
      <div className="on-navy rounded-[var(--radius-panel)] bg-navy-900 section-pad">
        <div className="container-site grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <Reveal>
              <p className="eyebrow">A Moment for You</p>
            </Reveal>
            <TextReveal
              as="h2"
              id="breathe-heading"
              parts={["Before anything else,", { em: "one slow breath" }, "."]}
              className="mt-5 max-w-[14ch]"
            />
            <Reveal index={2}>
              <p className="measure mt-8 text-ivory/80">
                Reaching out can feel like a lot. You don&apos;t need to have the right words or a plan. Let&apos;s
                start here.
              </p>
            </Reveal>
          </div>
          <div className="flex flex-col items-center text-center">
            <BreathingOrb />
            <p className="mt-10 font-display text-2xl font-medium italic text-ivory">
              Let&apos;s take this one step at a time.
            </p>
            <Button asChild variant="gold" className="mt-8">
              <AppLink to="/book">
                Take the First Step
                <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
              </AppLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const quals = [
  "Bachelor of Social Work (BSW)",
  "BA Honours in Psychology",
  `SACSSP Reg. No. ${site.sacsspNumber}`,
  ...(hasValue(site.practiceNumber) ? [`Practice Number ${site.practiceNumber}`] : []),
];

function MeetSection() {
  return (
    <section className="section-pad">
      <div className="container-site grid items-center gap-14 md:grid-cols-[5fr_7fr] md:gap-16 lg:gap-24">
        <div className="relative mx-auto w-full max-w-[380px]">
          <span aria-hidden="true" className="absolute -inset-4 rounded-full border border-gold-500 md:-inset-5" />
          <ImageReveal className="relative aspect-square rounded-full" frameClassName="bg-sand">
            <picture className="block size-full">
              <source
                srcSet={`${portrait480} 480w, ${portrait720} 720w, ${portrait960} 960w`}
                sizes="(min-width: 768px) 380px, 80vw"
                type="image/webp"
              />
              <img
                src={portraitJpg}
                width={960}
                height={1280}
                loading="lazy"
                decoding="async"
                alt="Portrait of Alulutho Charmaine Xanywa."
                className="size-full object-cover object-[50%_12%]"
              />
            </picture>
          </ImageReveal>
        </div>
        <div>
          <Reveal>
            <p className="eyebrow">Your Social Worker</p>
          </Reveal>
          <TextReveal as="h2" parts={[site.practitionerName]} className="mt-5" />
          <Reveal index={1}>
            <p className="mt-4 text-muted-foreground">{site.practitionerTitle}</p>
          </Reveal>
          <Reveal index={2}>
            <p className="measure mt-8 text-ink">
              Six years of front-line work in district and tertiary hospitals — supporting clients and families through
              crisis, complex care and life-changing news. Today, that experience shapes care that is structured,
              resource-informed and solution-focused, wherever you are.
            </p>
          </Reveal>
          <ul className="mt-10 border-t border-gold-500/60">
            {quals.map((q, i) => (
              <Reveal
                as="li"
                key={q}
                index={i}
                className="border-b border-gold-500/60 py-4 text-base font-semibold text-navy-800"
              >
                {q}
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <Button asChild className="mt-10">
              <AppLink to="/about">
                Read Her Story
                <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
              </AppLink>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Book a session",
    body: "Choose a time online or arrange a telephone referral. In-person and virtual sessions available.",
  },
  {
    title: "Complete your intake form",
    body: "A short, secure form with your details and payment or medical aid information.",
  },
  {
    title: "Meet in person or online",
    body: "We'll talk about what brought you here and what support looks like for you.",
  },
];

function GettingStarted() {
  return (
    <section className="section-pad bg-sand">
      <div className="container-site">
        <TextReveal as="h2" parts={["Getting started is simple."]} className="max-w-[16ch]" />
        <div className="relative mt-16">
          <DrawnRule className="absolute top-[2.4rem] left-0 hidden md:block" />
          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-10">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} index={i} stagger={140}>
                <span className="inline-block bg-sand pr-5 font-display text-[4.5rem] leading-none font-medium text-gold-700 [font-variant-numeric:lining-nums]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6">{s.title}</h3>
                <p className="mt-3 max-w-[34ch] text-base text-muted-foreground md:text-lg">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal className="mt-16 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button asChild>
            <AppLink to="/book">
              Book a Session
              <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
            </AppLink>
          </Button>
          <Button asChild variant="outline">
            <AppLink to="/how-it-works">How It Works</AppLink>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta({
    title: "Alulutho Xanywa | Registered Social Worker · Counselling In Person & Online",
    description:
      "Compassionate, professional psychosocial support for individuals, families and organisations in South Africa — in person or online. Book a session today.",
    path: "/",
  });
  return (
    <>
      <Hero />
      <Marquee />
      <Practice />
      <Familiar />
      <ServicePanels />
      <BreathSection />
      <MeetSection />
      <GettingStarted />
      <MissionVision />
      <Faq />
    </>
  );
}
