import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { AppLink } from "../components/AppLink";
import { Button } from "../components/Button";
import {
  Alert,
  CheckboxField,
  ErrorAnnouncer,
  Honeypot,
  SelectField,
  SuccessCheck,
  TextareaField,
  TextField,
} from "../components/Form";
import { Reveal, TextReveal } from "../components/Reveal";
import { contactItems, credentials, site } from "../lib/site";
import { isValidPhone, PHONE_MESSAGE } from "../lib/validation";
import { submitForm } from "../lib/submit";
import { usePageMeta } from "../lib/meta";

const ENQUIRY_TYPES = ["General enquiry", "Professional referral", "Organisational services", "Other"];
const CONTACT_METHODS = ["Email", "Phone", "WhatsApp"];

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please tell us your name.")
    .max(120, "Please keep your name under 120 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email so we can reply.")
    .email("Please enter a valid email so we can reply.")
    .max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || isValidPhone(v), PHONE_MESSAGE),
  enquiryType: z.string().refine((v) => ENQUIRY_TYPES.includes(v), "Please choose an enquiry type."),
  contactMethod: z.enum(CONTACT_METHODS),
  message: z
    .string()
    .trim()
    .min(10, "Please add a short message (at least a sentence).")
    .max(4000, "Please keep your message under 4,000 characters."),
  consent: z.boolean().refine((v) => v, "Please tick this box so we can respond to your enquiry."),
  company_website: z.string().optional(),
});

function ContactForm() {
  const [status, setStatus] = useState("idle");
  const loadedAt = useRef(Date.now());
  const thanksRef = useRef(null);

  useEffect(() => {
    if (status === "sent") thanksRef.current?.focus();
  }, [status]);

  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      enquiryType: "",
      contactMethod: "Email",
      message: "",
      consent: false,
      company_website: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setStatus("sending");
    const res = await submitForm({
      kind: "Contact",
      subject: `${data.enquiryType} from ${data.fullName}`,
      replyTo: data.email,
      fromName: data.fullName,
      honeypot: data.company_website,
      formLoadedAt: loadedAt.current,
      fields: {
        "Full name": data.fullName,
        Email: data.email,
        Phone: data.phone,
        "Enquiry type": data.enquiryType,
        "Preferred contact method": data.contactMethod,
        Message: data.message,
        "Privacy consent": data.consent,
      },
    });
    if (res.ok) setStatus("sent");
    else setStatus(res.reason === "rate_limited" ? "limited" : "error");
  });

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start py-6" role="status" aria-live="polite">
        <SuccessCheck />
        <h2 ref={thanksRef} tabIndex={-1} className="mt-8 text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] outline-none">
          Thank <span className="emph">you.</span>
        </h2>
        <p className="measure mt-4 text-lg text-ink">Your message is on its way — you&apos;ll hear back soon.</p>
        <Button asChild variant="outline" className="mt-8">
          <AppLink to="/">Back to Home</AppLink>
        </Button>
      </div>
    );
  }

  const sending = status === "sending";
  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6" aria-describedby="contact-urgent">
      <TextField label="Full name" required autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Email"
          required
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          label="Enquiry type"
          required
          placeholder="Choose one"
          options={ENQUIRY_TYPES}
          error={errors.enquiryType?.message}
          {...register("enquiryType")}
        />
        <SelectField
          label="Preferred contact method"
          options={CONTACT_METHODS}
          error={errors.contactMethod?.message}
          {...register("contactMethod")}
        />
      </div>
      <TextareaField label="Message" required error={errors.message?.message} {...register("message")} />
      <CheckboxField
        required
        label={
          <>
            I agree that my information may be used to respond to my enquiry, in line with the{" "}
            <AppLink to="/privacy" className="link-draw">
              Privacy Policy
            </AppLink>
            .
          </>
        }
        error={errors.consent?.message}
        {...register("consent")}
      />
      <Honeypot {...register("company_website")} />
      <ErrorAnnouncer count={Object.keys(errors).length} attempt={submitCount} />
      {(status === "error" || status === "limited") && (
        <Alert tone="error">
          {status === "limited" ? "We've received several messages from this connection in the last hour. " : ""}
          Sorry — your message couldn&apos;t be sent just now. Please try again, or email{" "}
          <a href={`mailto:${site.email}`} className="link-draw">
            {site.email}
          </a>
          .
        </Alert>
      )}
      <Button type="submit" size="lg" disabled={sending} aria-busy={sending} className="w-full sm:w-auto">
        {sending ? (
          <>
            <LoaderCircle className="animate-spin" strokeWidth={1.5} aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Send Message
            <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
          </>
        )}
      </Button>
      <p id="contact-urgent" className="text-[15px] text-muted-foreground">
        Please don&apos;t share urgent or emergency information here. If you&apos;re in danger, call{" "}
        <a href="tel:10111" className="font-semibold text-navy-800 underline underline-offset-4">
          10111
        </a>{" "}
        or{" "}
        <a href="tel:112" className="font-semibold text-navy-800 underline underline-offset-4">
          112
        </a>
        .
      </p>
    </form>
  );
}

export default function Contact() {
  usePageMeta({
    title: "Contact & Referrals | Alulutho Xanywa Social Worker",
    description: "Get in touch or make a professional referral. Doctors, hospitals and organisations welcome.",
    path: "/contact",
  });
  const items = contactItems(site);
  const creds = credentials(site);
  return (
    <>
      <section className="pt-[clamp(48px,7vw,110px)] pb-[clamp(48px,6vw,80px)]">
        <div className="container-site">
          <Reveal>
            <p className="eyebrow">Contact</p>
          </Reveal>
          <TextReveal
            as="h1"
            parts={["Reach out in whatever way feels", { em: "easiest." }]}
            className="mt-6 max-w-[16ch]"
          />
        </div>
      </section>
      <section className="pb-[clamp(80px,10vw,150px)]">
        <div className="container-site grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-5">
            <Reveal>
              <div className="card-calm p-8 hover:translate-y-0">
                <h2 className="text-[1.75rem]">Contact details</h2>
                <dl className="mt-6 divide-y divide-gold-500/40 border-y border-gold-500/40">
                  {items.map((item) => (
                    <div key={item.kind} className="py-4">
                      <dt className="eyebrow">{item.label}</dt>
                      <dd className="mt-1.5 text-lg">
                        {item.href ? (
                          <a
                            href={item.href}
                            className="link-draw hit-area [overflow-wrap:break-word]"
                            {...(item.kind === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          >
                            {item.kind === "email" ? (
                              <>
                                {item.value.split("@")[0]}@<wbr />
                                {item.value.split("@")[1]}
                              </>
                            ) : (
                              item.value
                            )}
                          </a>
                        ) : (
                          <span className="text-ink">{item.value}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                {creds.length > 0 && (
                  <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-5">
                    {creds.map((c) => (
                      <div key={c.label}>
                        <dt className="eyebrow">{c.label}</dt>
                        <dd className="mt-1.5 text-lg font-semibold text-navy-800">{c.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </Reveal>
            <Reveal index={1}>
              <div className="rounded-[var(--radius-card)] border border-gold-500/60 bg-gold-100 p-8">
                <h2 className="text-[1.75rem]">
                  Prefer to book <span className="emph">directly?</span>
                </h2>
                <Button asChild className="mt-6">
                  <AppLink to="/book">
                    Book a Session
                    <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
                  </AppLink>
                </Button>
              </div>
            </Reveal>
            <Reveal index={2}>
              <div className="border-l-2 border-gold-500 pl-6">
                <p className="eyebrow">For professionals</p>
                <p className="mt-2 text-base text-ink">
                  Doctors, hospitals and organisations: referrals are welcome. Choose &apos;Professional
                  referral&apos; in the form.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal index={1} className="lg:col-span-7">
            <div className="rounded-[var(--radius-panel)] border border-line bg-surface p-6 shadow-[var(--shadow-panel)] sm:p-10">
              <h2 className="mb-8 text-[clamp(1.75rem,1.5rem+1vw,2.25rem)]">Send a message</h2>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
