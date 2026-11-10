import { ArrowRight } from "lucide-react";
import { AppLink } from "../components/AppLink";
import { Button } from "../components/Button";
import { BreathingOrb } from "../components/BreathingOrb";
import { TextReveal } from "../components/Reveal";
import { usePageMeta } from "../lib/meta";

export default function NotFound() {
  usePageMeta({ title: "Page not found | Alulutho Xanywa", robots: "noindex" });
  return (
    <section className="section-pad">
      <div className="container-site flex flex-col items-center text-center">
        <BreathingOrb size="mini" variant="pulse" />
        <p className="eyebrow mt-10">Error 404</p>
        <TextReveal as="h1" parts={["This page has", { em: "wandered off." }]} className="mt-5 max-w-[14ch]" />
        <p className="lead measure mt-6">Let&apos;s get you back to steady ground.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button asChild>
            <AppLink to="/">
              Go Home
              <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
            </AppLink>
          </Button>
          <Button asChild variant="outline">
            <AppLink to="/book">Book a Session</AppLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
