import { ArrowRight } from "lucide-react";
import { AppLink } from "../components/AppLink";
import { Button } from "../components/Button";
import { Reveal, TextReveal } from "../components/Reveal";
import { ServicePanels } from "../components/Sections";
import { usePageMeta } from "../lib/meta";

export default function Services() {
  usePageMeta({
    title: "Social Work & Counselling Services | Alulutho Xanywa",
    description:
      "Counselling, family crisis intervention, chronic illness and palliative support, caregiver coaching and substance use counselling — in person or online.",
    path: "/services",
  });
  return (
    <>
      <section className="pt-[clamp(48px,7vw,110px)] pb-[clamp(48px,6vw,80px)]">
        <div className="container-site">
          <Reveal>
            <p className="eyebrow">Services</p>
          </Reveal>
          <TextReveal
            as="h1"
            parts={["Support for", { em: "every kind" }, "of hard season."]}
            className="mt-6 max-w-[15ch]"
          />
          <Reveal index={2}>
            <p className="lead measure mt-8">
              Five focused areas of care, each offered in person or online, for individuals and families.
            </p>
          </Reveal>
        </div>
      </section>
      <ServicePanels withHeading={false} className="pt-0!" />
      <section className="pb-[clamp(80px,10vw,150px)]">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-col gap-8 rounded-[var(--radius-panel)] border border-gold-500/60 bg-gold-100 p-8 md:flex-row md:items-center md:justify-between md:p-12">
              <div>
                <h2 className="text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)]">
                  Not sure which <span className="emph">fits?</span>
                </h2>
                <p className="measure mt-3 text-ink">
                  That&apos;s completely normal. Book an initial consultation and we&apos;ll work it out together.
                </p>
              </div>
              <Button asChild className="self-start md:self-auto">
                <AppLink to="/book">
                  Book a Session
                  <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
                </AppLink>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
