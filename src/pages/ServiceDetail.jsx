import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { AppLink } from "../components/AppLink";
import { Button } from "../components/Button";
import { noOrphan, Reveal, RevealGroup, TextReveal } from "../components/Reveal";
import { CtaBand } from "../components/Sections";
import { getService, relatedServices, serviceNumber } from "../lib/services";
import { site } from "../lib/site";
import { usePageMeta } from "../lib/meta";
import NotFound from "./NotFound";

function splitLastWord(title) {
  const words = title.split(" ");
  const last = words.pop() ?? "";
  return [words.join(" "), { em: last }];
}

function Hero({ service }) {
  const [head, em] = splitLastWord(service.fullTitle);
  return (
    <section className="pt-[clamp(32px,5vw,72px)] pb-[clamp(72px,8vw,120px)]">
      <div className="container-site">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[15px] text-muted-foreground">
            <li>
              <AppLink to="/" className="inline-flex min-h-11 items-center hover:text-navy-800">
                Home
              </AppLink>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5 text-gold-700" strokeWidth={1.5} />
            </li>
            <li>
              <AppLink to="/services" className="inline-flex min-h-11 items-center hover:text-navy-800">
                Services
              </AppLink>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5 text-gold-700" strokeWidth={1.5} />
            </li>
            <li aria-current="page" className="font-semibold text-navy-800">
              {service.fullTitle}
            </li>
          </ol>
        </nav>
        <Reveal className="mt-10">
          <p className="font-display text-[2.25rem] leading-none font-medium italic text-gold-700 [font-variant-numeric:lining-nums]">
            {serviceNumber(service.slug)}
          </p>
        </Reveal>
        <TextReveal
          as="h1"
          parts={[head, em]}
          className="mt-5 max-w-[18ch] text-[clamp(2.2rem,1.1rem+4.6vw,5rem)]!"
        />
        <Reveal index={2}>
          <p className="mt-8 max-w-[34ch] font-display text-[clamp(1.5rem,1.25rem+1vw,2.25rem)] leading-snug font-medium italic text-gold-700">
            {service.promise}
          </p>
        </Reveal>
        <Reveal index={3} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button asChild>
            <AppLink to={`/book?service=${service.slug}`}>
              Book this service
              <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
            </AppLink>
          </Button>
          <Button asChild variant="outline">
            <AppLink to="/contact">Ask a question</AppLink>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

function Overview({ service }) {
  return (
    <section className="section-pad bg-surface" aria-labelledby="overview-heading">
      <div className="container-site">
        <h2 id="overview-heading" className="sr-only">
          Overview
        </h2>
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="font-display text-[clamp(1.5rem,1.3rem+0.7vw,1.875rem)] leading-snug font-medium text-navy-800">
              {service.intro}
            </p>
          </Reveal>
          <Reveal index={1}>
            <p className="measure text-ink">{service.body}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HelpsWith({ service }) {
  return (
    <section className="section-pad">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <TextReveal as="h2" parts={["This can", { em: "help with" }]} className="max-w-[10ch]" />
        </div>
        <ul className="grid gap-x-10 border-t border-gold-500/60 sm:grid-cols-2 lg:col-span-8">
          {service.helpsWith.map((h, i) => (
            <Reveal
              as="li"
              key={h}
              index={i}
              className="flex items-start gap-4 border-b border-gold-500/60 py-5 text-lg text-navy-800"
            >
              <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-gold-500" />
              {h}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Expect({ service }) {
  return (
    <section className="section-pad bg-surface">
      <div className="container-site">
        <TextReveal as="h2" parts={["What to", { em: "expect" }]} />
        <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
          {service.steps.map((s, i) => (
            <Reveal as="li" key={s} index={i} stagger={140} className="border-t border-gold-500/60 pt-8">
              <span className="font-display text-[4rem] leading-none font-medium text-gold-700 [font-variant-numeric:lining-nums]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-5 max-w-[30ch] text-lg text-ink">{s}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function WhoFor({ service }) {
  return (
    <section className="section-pad bg-sand">
      <div className="container-site grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <TextReveal as="h2" parts={["Who it's", { em: "for" }]} />
        </div>
        <Reveal className="lg:col-span-8">
          <p className="font-display text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] leading-snug font-medium text-navy-800">
            {service.whoFor}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Formats() {
  return (
    <section aria-label="Session formats" className="border-b border-gold-500/60 py-8">
      <div className="container-site flex flex-wrap items-center gap-3">
        <span className="eyebrow mr-3">Available as</span>
        <span className="chip">In-person sessions</span>
        <span className="chip">Virtual sessions</span>
      </div>
    </section>
  );
}

function Related({ service }) {
  const related = relatedServices(service.slug);
  if (related.length === 0) return null;
  return (
    <section className="section-pad">
      <div className="container-site">
        <TextReveal as="h2" parts={["Related", { em: "support" }]} />
        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2" itemClassName="h-full">
          {related.map((r) => (
            <AppLink
              key={r.slug}
              to={`/services/${r.slug}`}
              className="card-calm group flex h-full flex-col p-8 md:p-10"
            >
              <span className="font-display text-[1.75rem] leading-none font-medium italic text-gold-700 [font-variant-numeric:lining-nums]">
                {serviceNumber(r.slug)}
              </span>
              <h3 className="mt-5">{noOrphan(r.fullTitle)}</h3>
              <p className="mt-3 text-base text-muted-foreground md:text-lg">{r.promise}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-8 text-[15px] font-semibold text-navy-800">
                Learn more
                <ArrowRight className="btn-arrow size-4" strokeWidth={1.5} aria-hidden="true" />
              </span>
            </AppLink>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function ServiceSchema({ service }) {
  useEffect(() => {
    const data = [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.fullTitle,
        description: service.seo.description,
        url: `${site.domain}/services/${service.slug}`,
        serviceType: service.title,
        provider: { "@id": `${site.domain}/#practice`, "@type": "ProfessionalService", name: site.practiceName },
        areaServed: { "@type": "Country", name: "South Africa" },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.domain}/` },
          { "@type": "ListItem", position: 2, name: "Services", item: `${site.domain}/services` },
          { "@type": "ListItem", position: 3, name: service.fullTitle, item: `${site.domain}/services/${service.slug}` },
        ],
      },
    ];
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
    return () => el.remove();
  }, [service]);
  return null;
}

function Detail({ service }) {
  usePageMeta({ title: service.seo.title, description: service.seo.description, path: `/services/${service.slug}` });
  return (
    <>
      <ServiceSchema service={service} />
      <Hero service={service} />
      <Overview service={service} />
      <HelpsWith service={service} />
      <Expect service={service} />
      <WhoFor service={service} />
      <Formats />
      <Related service={service} />
      <CtaBand />
    </>
  );
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getService(slug);
  if (!service) return <NotFound />;
  return <Detail key={service.slug} service={service} />;
}
