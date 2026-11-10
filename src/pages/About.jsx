import { ArrowRight, HeartHandshake, LockKeyhole, ShieldCheck } from "lucide-react";
import { AppLink } from "../components/AppLink";
import { Button } from "../components/Button";
import { DrawnRule, Reveal, RevealGroup, TextReveal } from "../components/Reveal";
import { MissionVision, Portrait } from "../components/Sections";
import { hasValue, site } from "../lib/site";
import { usePageMeta } from "../lib/meta";

function Hero() {
  return (
    <section className="pt-[clamp(32px,6vw,88px)] pb-[clamp(80px,9vw,140px)]">
      <div className="container-site grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">About</p>
          </Reveal>
          <TextReveal as="h1" parts={["Meet", { em: "Alulutho." }]} className="mt-6" />
          <Reveal index={2}>
            <p className="lead measure mt-8">
              {site.practitionerName} — {site.practitionerTitle}
            </p>
          </Reveal>
        </div>
        <Portrait
          className="max-w-[420px] lg:col-span-5"
          priority
          alt="Portrait of Alulutho Charmaine Xanywa, registered clinical social worker."
        />
      </div>
    </section>
  );
}

const story = [
  "I'm a registered clinical social worker with six years of intensive front-line experience across district and tertiary hospitals.",
  "That work was built on crisis intervention and complex case management — walking alongside clients and families through some of the most critical transitions of their lives, often in high-pressure clinical environments.",
  "Along the way, I learned to connect the dots between hospital care and the community resources people need once they go home, so that no one is left to navigate it alone.",
  "In private practice, that background means you receive care that is highly structured, resource-informed and solution-focused — offered with warmth, and available to you wherever you are.",
];

function Story() {
  return (
    <section className="section-pad bg-surface" aria-labelledby="story-heading">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <h2 id="story-heading" className="eyebrow lg:sticky lg:top-[calc(var(--header-h)+40px)]">
            My Story
          </h2>
        </div>
        <div className="lg:col-span-8">
          <div className="space-y-6">
            {story.map((p, i) => (
              <Reveal key={i} index={i}>
                <p
                  className={
                    i === 0
                      ? "font-display text-[clamp(1.5rem,1.3rem+0.6vw,1.75rem)] leading-snug font-medium text-navy-800"
                      : "measure text-ink"
                  }
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
          <figure className="mt-16">
            <DrawnRule />
            <Reveal>
              <blockquote className="py-10 font-display text-[clamp(2rem,1.5rem+2vw,3.25rem)] leading-[1.15] font-medium italic text-navy-800 [text-wrap:balance]">
                No one should have to navigate life&apos;s hardest transitions <span className="text-gold-700">alone.</span>
              </blockquote>
            </Reveal>
            <DrawnRule />
          </figure>
        </div>
      </div>
    </section>
  );
}

const expectations = [
  {
    icon: HeartHandshake,
    title: "Compassionate Care",
    body: "You'll be met with warmth, patience and respect — never judgement. Your pace sets the pace.",
  },
  {
    icon: ShieldCheck,
    title: "Professionalism",
    body: "Structured, ethical, evidence-informed practice, guided by the SACSSP code of ethics and years of clinical experience.",
  },
  {
    icon: LockKeyhole,
    title: "Private Practice",
    body: "A confidential space that is entirely yours. Your story and your information are protected.",
  },
];

function Expect() {
  return (
    <section className="section-pad bg-sand">
      <div className="container-site">
        <TextReveal as="h2" parts={["What you can expect."]} />
        <RevealGroup className="mt-14 grid gap-5 md:grid-cols-3" itemClassName="h-full">
          {expectations.map(({ icon: Icon, title, body }) => (
            <article key={title} className="card-calm flex h-full flex-col p-8 md:p-10">
              <span className="inline-flex size-12 items-center justify-center rounded-full border border-gold-500/70 text-gold-700">
                <Icon className="size-[22px]" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span aria-hidden="true" className="hairline mt-8 max-w-12" />
              <h3 className="mt-6">{title}</h3>
              <p className="mt-3 text-base text-muted-foreground md:text-lg">{body}</p>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function qualifications(s) {
  return [
    { title: "Bachelor of Social Work (BSW)" },
    { title: "Bachelor of Arts Honours in Psychology", detail: "BA (Hons) Psych" },
    {
      title: "Registered with the South African Council for Social Service Professions (SACSSP)",
      detail: `Reg. No. ${s.sacsspNumber}`,
    },
    ...(hasValue(s.practiceNumber) ? [{ title: "Practice Number", detail: s.practiceNumber }] : []),
    { title: "Six years' clinical social work experience in district and tertiary hospitals" },
  ];
}

function Credentials() {
  const items = qualifications(site);
  return (
    <section className="section-pad bg-surface">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="eyebrow">Credentials</p>
          </Reveal>
          <TextReveal
            as="h2"
            parts={["Qualifications &", { em: "registration" }, "."]}
            className="mt-5 max-w-[12ch]"
          />
        </div>
        <ul className="border-t border-gold-500/60 lg:col-span-8">
          {items.map((q, i) => (
            <Reveal
              as="li"
              key={q.title}
              index={i}
              className="flex flex-col gap-1 border-b border-gold-500/60 py-6 md:flex-row md:items-baseline md:justify-between md:gap-10"
            >
              <span className="text-lg font-semibold text-navy-800">{q.title}</span>
              {q.detail && <span className="shrink-0 text-base text-gold-700 font-semibold">{q.detail}</span>}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

const audiences = [
  { title: "Individuals", body: "Adults facing grief, crisis, illness, life transitions or substance use." },
  { title: "Families", body: "Families moving through crisis, conflict, illness, caregiving or change — together." },
  {
    title: "Organisations",
    body: "Hospitals, doctors, employers and community organisations seeking psychosocial support, referrals or assessment reports for the people they serve.",
    referral: true,
  },
];

function WhoIWorkWith() {
  return (
    <section className="on-navy section-pad bg-navy-800">
      <div className="container-site">
        <TextReveal as="h2" parts={["Who I", { em: "work with" }, "."]} />
        <RevealGroup className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
          {audiences.map((a) => (
            <div key={a.title} className="border-t border-gold-500/60 pt-8">
              <h3>{a.title}</h3>
              <p className="mt-4 text-base text-ivory-soft md:text-lg">{a.body}</p>
              {a.referral && (
                <AppLink to="/contact" className="link-draw mt-6 inline-flex min-h-11 items-center gap-2">
                  Make a referral
                  <ArrowRight className="btn-arrow size-4" strokeWidth={1.5} aria-hidden="true" />
                </AppLink>
              )}
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="section-pad">
      <div className="container-site flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
        <TextReveal as="h2" parts={["When you're ready,", { em: "I'm here." }]} className="max-w-[14ch]" />
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button asChild>
            <AppLink to="/book">
              Book a Session
              <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
            </AppLink>
          </Button>
          <Button asChild variant="outline">
            <AppLink to="/contact">Get in Touch</AppLink>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export default function About() {
  usePageMeta({
    title: "About Alulutho Charmaine Xanywa | Clinical Social Worker",
    description:
      "Registered clinical social worker with six years of district and tertiary hospital experience in crisis intervention and complex case management.",
    path: "/about",
  });
  return (
    <>
      <Hero />
      <Story />
      <Expect />
      <Credentials />
      <WhoIWorkWith />
      <MissionVision />
      <ClosingCta />
    </>
  );
}
