import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  CreditCard,
  MonitorSmartphone,
  Phone,
  ShieldPlus,
} from "lucide-react";
import { AppLink } from "../components/AppLink";
import { Button } from "../components/Button";
import { Reveal, RevealGroup, TextReveal } from "../components/Reveal";
import { CtaBand, Faq } from "../components/Sections";
import { hasValue, site, telHref } from "../lib/site";
import { usePageMeta } from "../lib/meta";

function InfoCard({ icon, title, children }) {
  return (
    <article className="card-calm flex h-full flex-col p-8 md:p-10">
      <span className="inline-flex size-12 items-center justify-center rounded-full border border-gold-500/70 text-gold-700">
        {icon}
      </span>
      <h3 className="mt-6">{title}</h3>
      <div className="mt-3 flex flex-1 flex-col text-base text-muted-foreground md:text-lg">{children}</div>
    </article>
  );
}

const icon = (Icon) => <Icon className="size-[22px]" strokeWidth={1.5} aria-hidden="true" />;

function WaysToMeet() {
  return (
    <section className="section-pad">
      <div className="container-site">
        <TextReveal as="h2" parts={["Two ways", { em: "to meet" }]} />
        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2" itemClassName="h-full">
          <InfoCard icon={icon(Building2)} title="In person">
            <p>Face-to-face sessions in a private, comfortable setting.</p>
            {hasValue(site.physicalAddress) && (
              <p className="mt-4 font-semibold text-navy-800">{site.physicalAddress}</p>
            )}
          </InfoCard>
          <InfoCard icon={icon(MonitorSmartphone)} title="Virtual">
            <p>
              Secure video sessions from wherever you are, in South Africa or abroad. All you need is a private space
              and a stable connection.
            </p>
          </InfoCard>
        </RevealGroup>
      </div>
    </section>
  );
}

function WaysToBook() {
  const hasPhone = hasValue(site.phone);
  return (
    <section className="section-pad bg-sand">
      <div className="container-site">
        <TextReveal as="h2" parts={["Two ways", { em: "to book" }]} />
        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2" itemClassName="h-full">
          <InfoCard icon={icon(CalendarCheck)} title="Online booking">
            <p>Choose your service, session type and a time that suits you.</p>
            <Button asChild className="mt-8 self-start">
              <AppLink to="/book">
                Book online
                <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
              </AppLink>
            </Button>
          </InfoCard>
          <InfoCard icon={icon(Phone)} title="Telephone referral">
            <p>Doctors, hospitals and organisations are welcome to refer by phone.</p>
            {hasPhone ? (
              <a
                href={telHref(site.phone)}
                className="link-draw mt-8 inline-flex min-h-11 items-center self-start text-lg"
              >
                {site.phone}
              </a>
            ) : (
              <AppLink to="/contact" className="link-draw mt-8 inline-flex min-h-11 items-center gap-2 self-start">
                Get in touch
                <ArrowRight className="btn-arrow size-4" strokeWidth={1.5} aria-hidden="true" />
              </AppLink>
            )}
          </InfoCard>
        </RevealGroup>
      </div>
    </section>
  );
}

function Paying() {
  return (
    <section className="section-pad">
      <div className="container-site">
        <TextReveal as="h2" parts={["Paying for", { em: "sessions" }]} />
        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2" itemClassName="h-full">
          <InfoCard icon={icon(CreditCard)} title="Cash or EFT">
            <p>Pay directly before or after your session. Banking details are shared securely.</p>
          </InfoCard>
          <InfoCard icon={icon(ShieldPlus)} title="Medical aid">
            <p>Many schemes cover social work services. Add your details to the intake form.</p>
          </InfoCard>
        </RevealGroup>
        <Reveal className="mt-10">
          <Button asChild variant="outline">
            <AppLink to="/intake">Complete your intake form</AppLink>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

const bring = [
  "Your ID or passport",
  "Your medical aid card, if claiming",
  "Any referral letter",
  "For virtual sessions: a private space, headphones and a charged device",
];

function BeforeFirst() {
  return (
    <section className="section-pad bg-surface">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <TextReveal as="h2" parts={["Before your", { em: "first session" }]} className="max-w-[12ch]" />
        </div>
        <ul className="border-t border-gold-500/60 lg:col-span-7">
          {bring.map((b, i) => (
            <Reveal
              as="li"
              key={b}
              index={i}
              className="flex items-start gap-4 border-b border-gold-500/60 py-5 text-lg text-navy-800"
            >
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-gold-500 text-gold-700">
                <Check className="size-4" strokeWidth={2} aria-hidden="true" />
              </span>
              {b}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

const timeline = [
  {
    title: "Book your session",
    body: "Choose your service, session type and a time that suits you through the online booking page. Prefer a referral? Your doctor, hospital or organisation can refer you by phone.",
  },
  {
    title: "Complete your intake form",
    body: "A short, secure online form for your personal, address, payment and medical aid details. It takes about five minutes.",
  },
  {
    title: "We’ll confirm your session",
    body: "Once your form is in, we'll contact you by email or WhatsApp to find a time that suits you. Your confirmation will include the date, time and address of your first session.",
  },
  {
    title: "Your first session",
    body: "An unhurried conversation about what brought you here and what you'd like to change. No pressure, no judgement.",
  },
  {
    title: "Ongoing support",
    body: "Together we agree on a plan — short-term or longer — and review it regularly.",
  },
];

function Timeline() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <section className="section-pad bg-surface" aria-labelledby="timeline-heading">
      <div className="container-site">
        <h2 id="timeline-heading" className="sr-only">
          The five steps
        </h2>
        <ol ref={ref} className="relative mx-auto max-w-[820px]">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[27px] w-px bg-line md:left-[39px]" />
          <motion.span
            aria-hidden="true"
            className="timeline-draw absolute top-2 bottom-2 left-[27px] w-px origin-top bg-gold-500 md:left-[39px]"
            style={{ scaleY }}
          />
          {timeline.map((t, i) => (
            <Reveal
              as="li"
              key={t.title}
              className="relative grid grid-cols-[56px_1fr] gap-6 pb-16 last:pb-0 md:grid-cols-[80px_1fr] md:gap-10"
            >
              <span className="relative z-10 inline-flex size-14 items-center justify-center rounded-full border border-gold-500 bg-surface font-display text-[1.6rem] font-medium text-gold-700 [font-variant-numeric:lining-nums] md:size-20 md:text-[2.25rem]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-2 md:pt-5">
                <h3>{t.title}</h3>
                <p className="measure mt-3 text-ink">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function HowItWorks() {
  usePageMeta({
    title: "How Sessions Work · In Person & Online | Alulutho Xanywa",
    description:
      "How to book, what to expect in your first session, payment options and medical aid. Simple steps to getting support.",
    path: "/how-it-works",
  });
  return (
    <>
      <section className="pt-[clamp(48px,7vw,110px)] pb-[clamp(64px,8vw,110px)]">
        <div className="container-site">
          <Reveal>
            <p className="eyebrow">How It Works</p>
          </Reveal>
          <TextReveal as="h1" parts={["Getting started is", { em: "simple." }]} className="mt-6 max-w-[14ch]" />
          <Reveal index={2}>
            <p className="lead measure mt-8">
              Whether you book online or through a referral, here&apos;s exactly what happens.
            </p>
          </Reveal>
        </div>
      </section>
      <Timeline />
      <WaysToMeet />
      <WaysToBook />
      <Paying />
      <BeforeFirst />
      <Faq />
      <CtaBand />
    </>
  );
}
