import { Reveal, TextReveal } from "../components/Reveal";
import { site } from "../lib/site";
import { usePageMeta } from "../lib/meta";

const LAST_UPDATED = "22 October 2026";

const sections = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        This website belongs to {site.practiceName}, a private clinical social work practice run by{" "}
        {site.practitionerName}, registered with the South African Council for Social Service Professions (SACSSP), Reg.
        No. {site.sacsspNumber}. In this policy, &quot;we&quot; and &quot;the practice&quot; mean this practice.
      </p>
    ),
  },
  {
    id: "information-officer",
    title: "Information Officer",
    body: (
      <p>
        The practice&apos;s Information Officer under POPIA is {site.practitionerName}. She is responsible for making sure
        your personal information is handled lawfully and for responding to your privacy requests.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "What information we collect",
    body: (
      <>
        <p>We only collect the information we need to support you. Depending on how you use the website, this can include:</p>
        <ul>
          <li>
            <strong>Contact details</strong> — your name, email address, phone number and how you prefer to be contacted.
          </li>
          <li>
            <strong>Booking details</strong> — the service, session type, date and time you choose, and anything you
            choose to tell us beforehand.
          </li>
          <li>
            <strong>Intake details</strong> — personal details, address, next of kin and, if you share them, ID or
            passport number and referral information.
          </li>
          <li>
            <strong>Medical aid and payment details</strong> — your scheme, plan, membership details and who is
            responsible for the account.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "why-we-collect",
    title: "Why we collect it",
    body: (
      <>
        <p>We use your information only to:</p>
        <ul>
          <li>provide care and psychosocial support;</li>
          <li>manage your appointments and communicate with you about them;</li>
          <li>process payments and, if you choose, submit medical aid claims;</li>
          <li>respond to your enquiries and referrals.</li>
        </ul>
        <p>We never sell your information or use it for advertising.</p>
      </>
    ),
  },
  {
    id: "storage",
    title: "How it is stored and protected",
    body: (
      <p>
        Information you send through this website is encrypted in transit and stored securely, with access limited to
        the practice. We take reasonable technical and organisational steps to protect it against loss, misuse and
        unauthorised access, in line with POPIA and the SACSSP code of ethics.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Who it may be shared with",
    body: (
      <p>
        Your information stays with the practice. It is only shared with your medical aid scheme when you choose to
        claim, or where the law requires us to share it. Any limits to confidentiality — for example, if someone is at
        serious risk of harm — are explained openly in your first session.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long it is kept",
    body: (
      <p>
        We keep your information only for as long as we need it to provide care and to meet our legal and professional
        record-keeping obligations. After that, it is securely deleted or destroyed.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights under POPIA",
    body: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li>ask what personal information we hold about you and request a copy (access);</li>
          <li>ask us to correct information that is wrong or out of date (correction);</li>
          <li>ask us to delete information we no longer need or are not allowed to keep (deletion);</li>
          <li>object to how we process your information (objection);</li>
          <li>
            complain to the Information Regulator if you&apos;re unhappy with how your information has been handled (
            <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="link-draw">
              inforegulator.org.za
            </a>
            ).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        This website uses only essential storage needed for it to work — for example, remembering your progress through
        a booking or intake form within the same browser tab. We do not use tracking, advertising or analytics cookies.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact for privacy requests",
    body: (
      <p>
        To make a privacy request or ask a question about this policy, email{" "}
        <a href={`mailto:${site.email}`} className="link-draw">
          {site.email}
        </a>
        . We&apos;ll respond as soon as we can.
      </p>
    ),
  },
];

export default function Privacy() {
  usePageMeta({
    title: "Privacy Policy & POPIA | Alulutho Xanywa",
    description:
      "How the practice collects, uses and protects your personal information under POPIA, and the rights you have over it.",
    path: "/privacy",
  });
  return (
    <>
      <section className="pt-[clamp(48px,7vw,110px)] pb-[clamp(48px,6vw,80px)]">
        <div className="container-site">
          <Reveal>
            <p className="eyebrow">Privacy &amp; POPIA</p>
          </Reveal>
          <TextReveal as="h1" parts={["Your privacy,", { em: "protected." }]} className="mt-6" />
          <Reveal index={2}>
            <p className="lead measure mt-8">
              How the practice collects, uses and protects your personal information under the Protection of Personal
              Information Act (POPIA).
            </p>
            <p className="mt-4 text-[15px] text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          </Reveal>
        </div>
      </section>
      <section className="border-t border-line bg-surface pt-[clamp(56px,7vw,96px)] pb-[clamp(80px,10vw,150px)]">
        <div className="container-site grid gap-12 lg:grid-cols-[240px_minmax(0,760px)] lg:justify-between lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-[calc(var(--header-h)+32px)]">
              <p className="eyebrow">On this page</p>
              <ol className="mt-4 space-y-1 border-l border-gold-500/50">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[15px] text-muted-foreground transition-colors hover:border-gold-500 hover:text-navy-800"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
          <article className="prose-calm max-w-[760px]">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-[calc(var(--header-h)+24px)] border-b border-line pb-10 [&:not(:first-child)]:pt-10 last:border-0"
              >
                <h2 className="text-[clamp(1.6rem,1.4rem+0.8vw,2.1rem)]">
                  <span className="mr-3 font-display text-gold-700 italic [font-variant-numeric:lining-nums]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </h2>
                <div className="mt-5 space-y-4">{s.body}</div>
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
