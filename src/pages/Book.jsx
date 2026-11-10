import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarPlus,
  Check,
  ChevronDown,
  LoaderCircle,
  MonitorSmartphone,
} from "lucide-react";
import { AppLink } from "../components/AppLink";
import { Button } from "../components/Button";
import { Logo } from "../components/Brand";
import {
  Alert,
  CheckboxField,
  ChoiceCards,
  ErrorAnnouncer,
  Honeypot,
  SuccessCheck,
  TextareaField,
  TextField,
} from "../components/Form";
import { Reveal, TextReveal } from "../components/Reveal";
import { cn } from "../lib/cn";
import { hasValue, site, telHref } from "../lib/site";
import { getService, services } from "../lib/services";
import { clearBooking, loadBooking, saveBooking, setIntakePrefill } from "../lib/store";
import {
  addDays,
  availableSlots,
  bookingWindow,
  buildIcs,
  downloadFile,
  formatDate,
  loadTakenSlots,
  rememberTakenSlot,
} from "../lib/booking";
import { isValidPhone } from "../lib/validation";
import { makeReference, submitForm } from "../lib/submit";
import { usePageMeta } from "../lib/meta";

const STEPS = ["service", "format", "datetime", "details", "confirmed"];
const STEP_LABEL = {
  service: "Service",
  format: "Format",
  datetime: "Preferred slot",
  details: "Your details",
  confirmed: "Confirmed",
};
const STEP_TITLE = {
  service: "What would you like support with?",
  format: "How would you like to meet?",
  datetime: "Preferred slot",
  details: "Your details",
  confirmed: (
    <>
      Your request <span className="emph">is in.</span>
    </>
  ),
};

const CONSULT = "initial-consultation";
const SERVICE_OPTIONS = [
  ...services.map((s) => ({ value: s.slug, label: s.fullTitle, description: s.promise })),
  {
    value: CONSULT,
    label: "Initial consultation — not sure yet",
    description: "We'll talk it through together and find the right support.",
  },
];
const serviceLabel = (v) => SERVICE_OPTIONS.find((o) => o.value === v)?.label;
const formatLabel = (v) => (v === "in-person" ? "In person" : v === "virtual" ? "Virtual" : undefined);

const detailsSchema = z
  .object({
    firstName: z.string().trim().min(1, "Please enter your first name.").max(80),
    surname: z.string().trim().min(1, "Please enter your surname.").max(80),
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email so we can send your confirmation.")
      .email("Please enter a valid email so we can send your confirmation.")
      .max(255),
    mobile: z
      .string()
      .trim()
      .min(1, "Please enter a mobile number.")
      .refine(isValidPhone, "Please enter a valid mobile number, e.g. 063 063 3412 or +27 63 063 3412."),
    clientType: z.enum(["new", "returning"], {
      errorMap: () => ({ message: "Please let us know if you're new or returning." }),
    }),
    sessionFor: z.enum(["myself", "family", "someone-else"], {
      errorMap: () => ({ message: "Please choose who this session is for." }),
    }),
    theirName: z.string().trim().max(120).optional(),
    relationship: z.string().trim().max(80).optional(),
    notes: z.string().trim().max(2000, "Please keep this under 2,000 characters.").optional(),
    consent: z.boolean().refine((v) => v, "Please tick this box so we can manage your booking."),
    company_website: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.sessionFor !== "someone-else") return;
    if (!v.theirName) ctx.addIssue({ code: "custom", path: ["theirName"], message: "Please enter their name." });
    if (!v.relationship)
      ctx.addIssue({ code: "custom", path: ["relationship"], message: "Please tell us your relationship to them." });
  });

const EMPTY_DETAILS = {
  firstName: "",
  surname: "",
  email: "",
  mobile: "",
  clientType: undefined,
  sessionFor: undefined,
  theirName: "",
  relationship: "",
  notes: "",
  consent: false,
  company_website: "",
};

/* ---------------- Step bodies ---------------- */

function ServiceStep({ value, onChange }) {
  return (
    <ChoiceCards
      name="service"
      legend={<span className="sr-only">Choose a service</span>}
      legendClassName="mb-0"
      options={SERVICE_OPTIONS}
      value={value}
      onChange={onChange}
      columns={2}
    />
  );
}

function FormatStep({ value, onChange }) {
  const icon = (Icon) => <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />;
  return (
    <ChoiceCards
      name="format"
      legend={<span className="sr-only">Choose how to meet</span>}
      legendClassName="mb-0"
      value={value}
      onChange={onChange}
      options={[
        {
          value: "in-person",
          label: "In person",
          icon: icon(Building2),
          description: (
            <>
              Venue details are confirmed by email.
              {hasValue(site.physicalAddress) && (
                <span className="mt-1 block font-semibold text-navy-800">{site.physicalAddress}</span>
              )}
            </>
          ),
        },
        {
          value: "virtual",
          label: "Virtual",
          icon: icon(MonitorSmartphone),
          description: "A secure video link will be emailed to you.",
        },
      ]}
    />
  );
}

function DateTimeStep({ date, slot, onDate, onSlot, refreshKey, notice }) {
  const [now] = useState(() => Date.now());
  const { first, last } = bookingWindow(now);
  const [taken, setTaken] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTaken(loadTakenSlots());
    setLoading(false);
  }, [first, last, refreshKey]);

  const days = useMemo(() => {
    const out = [];
    for (let d = first; d <= last; d = addDays(d, 1)) if (availableSlots(d, now, taken).length > 0) out.push(d);
    return out;
  }, [first, last, now, taken]);

  const slots = useMemo(() => (date ? availableSlots(date, now, taken) : []), [date, now, taken]);
  const selectClass =
    "min-h-12 w-full rounded-[var(--radius-field,12px)] border border-line-strong bg-background px-4 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-800 disabled:opacity-60";

  return (
    <div className="max-w-xl">
      {notice}
      <p className="text-base text-muted-foreground">
        Choose the day and time that suit you best. Alulutho will confirm, or suggest another time if she&apos;s
        unavailable.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pref-day" className="mb-2 block text-base font-semibold">
            Preferred day
          </label>
          <select
            id="pref-day"
            className={selectClass}
            value={date && days.includes(date) ? date : ""}
            disabled={loading}
            onChange={(e) => e.target.value && onDate(e.target.value)}
          >
            <option value="">{loading ? "Loading days…" : "Select a day"}</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {formatDate(d)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pref-time" className="mb-2 block text-base font-semibold">
            Preferred time
          </label>
          <select
            id="pref-time"
            className={selectClass}
            value={slot && slots.some((s) => s.start === slot) ? slot : ""}
            disabled={!date || slots.length === 0}
            onChange={(e) => e.target.value && onSlot(e.target.value)}
          >
            <option value="">{date ? "Select a time" : "Choose a day first"}</option>
            {slots.map((s) => (
              <option key={s.start} value={s.start}>
                {s.label} SAST
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-4 text-[15px] text-muted-foreground">Times are in South African time (SAST).</p>
    </div>
  );
}

function DetailsStep({ initial, onChange, onSubmit, submitError }) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(detailsSchema),
    mode: "onTouched",
    defaultValues: { ...EMPTY_DETAILS, ...initial, consent: false, company_website: "" },
  });
  const values = useWatch({ control });
  const serialised = JSON.stringify(values);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    const { consent, company_website, ...rest } = values;
    onChange(rest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialised]);

  const sessionFor = values.sessionFor;
  return (
    <form id="booking-details" noValidate onSubmit={handleSubmit(onSubmit)} className="relative space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="First name"
          required
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <TextField
          label="Surname"
          required
          autoComplete="family-name"
          error={errors.surname?.message}
          {...register("surname")}
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Email"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Mobile number"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          helper="South African or international, e.g. 063 063 3412 or +27 63 063 3412."
          error={errors.mobile?.message}
          {...register("mobile")}
        />
      </div>
      <input type="hidden" {...register("clientType")} />
      <ChoiceCards
        name="clientType-choice"
        legend="Have you had a session with Alulutho before?"
        size="sm"
        value={values.clientType}
        onChange={(v) => setValue("clientType", v, { shouldValidate: true })}
        error={errors.clientType?.message}
        options={[
          { value: "new", label: "New client" },
          { value: "returning", label: "Returning client" },
        ]}
      />
      <input type="hidden" {...register("sessionFor")} />
      <ChoiceCards
        name="sessionFor-choice"
        legend="Who is this session for?"
        size="sm"
        columns={3}
        value={sessionFor}
        onChange={(v) => setValue("sessionFor", v, { shouldValidate: true })}
        error={errors.sessionFor?.message}
        options={[
          { value: "myself", label: "Myself" },
          { value: "family", label: "My family or couple" },
          { value: "someone-else", label: "Someone else" },
        ]}
      />
      {sessionFor === "someone-else" && (
        <div className="step-enter grid gap-6 rounded-[var(--radius-card)] bg-ivory p-5 sm:grid-cols-2">
          <TextField label="Their name" required error={errors.theirName?.message} {...register("theirName")} />
          <TextField
            label="Your relationship to them"
            required
            error={errors.relationship?.message}
            {...register("relationship")}
          />
        </div>
      )}
      <TextareaField
        label="Anything you'd like Alulutho to know beforehand?"
        helper="Optional — a sentence is plenty. You can also share this in your session."
        error={errors.notes?.message}
        {...register("notes")}
      />
      <CheckboxField
        required
        label={
          <>
            I agree that my information may be used to manage my booking, in line with the{" "}
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
      {submitError}
    </form>
  );
}

function Confirmation({ c }) {
  const startMs = Date.parse(c.start);
  const day = c.start.slice(0, 10);
  const time = c.start.slice(11, 16);
  return (
    <div className="flex flex-col items-start">
      <SuccessCheck />
      <dl className="mt-8 w-full divide-y divide-gold-500/40 border-y border-gold-500/40">
        {[
          ["Reference", c.reference],
          ["Service", c.serviceLabel],
          ["Format", c.formatLabel],
          ["Date", formatDate(day)],
          ["Time", `${time} SAST`],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:justify-between sm:gap-6">
            <dt className="text-[15px] text-muted-foreground">{k}</dt>
            <dd className={cn("text-base font-semibold text-navy-800", k === "Reference" && "tracking-wide")}>{v}</dd>
          </div>
        ))}
      </dl>
      {c.emailFailed ? (
        <div className="mt-6 w-full">
          <Alert tone="error">
            Your request is saved, but we couldn&apos;t send the confirmation email just now. Alulutho will still be in
            touch — if you don&apos;t hear back, please email{" "}
            <a href={`mailto:${site.email}`} className="link-draw">
              {site.email}
            </a>{" "}
            with your reference.
          </Alert>
        </div>
      ) : (
        <p className="measure mt-6 text-lg text-ink">
          You&apos;ll receive an email shortly. Alulutho will confirm your appointment by email.
        </p>
      )}
      {c.isNewClient && (
        <div className="mt-8 w-full rounded-[var(--radius-card)] border border-gold-500/60 bg-gold-100 p-6">
          <p className="font-semibold text-navy-800">New to the practice?</p>
          <p className="mt-1 text-base text-ink">Completing your intake form now saves time at your first session.</p>
          <Button asChild className="mt-5">
            <AppLink to="/intake">
              <Check strokeWidth={1.5} aria-hidden="true" />
              Complete Your Intake Form
            </AppLink>
          </Button>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const ics = buildIcs({
              uid: `${c.reference}@aluluthoinpractice.co.za`,
              startMs,
              durationMinutes: 60,
              title: `${c.serviceLabel} with Alulutho Xanywa (requested)`,
              description: `Booking reference ${c.reference}. ${c.formatLabel} session. Alulutho will confirm your appointment by email.`,
              location:
                c.formatLabel === "Virtual" ? "Online — video link to follow by email" : site.physicalAddress || undefined,
            });
            downloadFile(`${c.reference}.ics`, ics);
          }}
        >
          <CalendarPlus strokeWidth={1.5} aria-hidden="true" />
          Add to Calendar
        </Button>
        {!c.isNewClient && (
          <Button asChild variant="outline">
            <AppLink to="/intake">Complete Your Intake Form</AppLink>
          </Button>
        )}
        <Button asChild variant="ghost">
          <AppLink to="/">Back to Home</AppLink>
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Flow ---------------- */

function furthestStep(b) {
  return b.service ? (b.format ? (b.slot ? "details" : "datetime") : "format") : "service";
}

function canVisit(step, b, confirmed) {
  if (step === "confirmed") return confirmed;
  return STEPS.indexOf(step) <= STEPS.indexOf(furthestStep(b));
}

function SummaryRow({ label, value }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 border-b border-line-on-navy pb-4 last:border-0 last:pb-0">
      <dt className="text-ivory-soft">{label}</dt>
      <dd className={cn("font-semibold", value ? "text-ivory" : "text-ivory-soft/60")}>{value ?? "—"}</dd>
    </div>
  );
}

function Progress({ current }) {
  return (
    <nav aria-label="Booking progress">
      <ol className="flex items-center gap-2 overflow-x-auto pb-1 text-[13px] font-semibold sm:gap-3 sm:text-[14px]">
        {STEPS.map((s, i) => (
          <li key={s} className="flex shrink-0 items-center gap-2 sm:gap-3" aria-current={i === current ? "step" : undefined}>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors",
                i === current ? "bg-navy-800 text-ivory" : i < current ? "text-gold-700" : "text-muted-foreground",
              )}
            >
              <span aria-hidden="true" className={cn("size-1.5 rounded-full", i <= current ? "bg-gold-500" : "bg-line-strong")} />
              <span className={cn(i !== current && "hidden sm:inline")}>{STEP_LABEL[s]}</span>
              {i !== current && <span className="sr-only sm:hidden">{STEP_LABEL[s]}</span>}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function BookingFlow({ urlStep, preselect }) {
  const [, setSearchParams] = useSearchParams();
  const [booking, setBooking] = useState({});
  const [ready, setReady] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [slotNotice, setSlotNotice] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [announce, setAnnounce] = useState("");
  const loadedAt = useRef(Date.now());
  const headingRef = useRef(null);
  const prevIndex = useRef(null);

  const step = urlStep ?? "service";
  const index = STEPS.indexOf(step);

  const go = useCallback(
    (s, replace = false) => setSearchParams({ step: s }, { replace, preventScrollReset: true }),
    [setSearchParams],
  );

  useEffect(() => {
    let b = loadBooking();
    if (preselect) {
      b = { ...b, service: preselect };
      saveBooking(b);
    }
    setBooking(b);
    setReady(true);
    if (preselect && !urlStep) go("format", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wasConfirmed = useRef(false);
  useEffect(() => {
    if (!ready) return;
    if (step === "confirmed") wasConfirmed.current = confirmation !== null;
    else if (wasConfirmed.current) {
      wasConfirmed.current = false;
      setBooking({});
      setConfirmation(null);
      go("service", true);
      return;
    }
    if (!canVisit(step, booking, confirmation !== null)) go(furthestStep(booking), true);
  }, [ready, step, booking, confirmation, go]);

  useEffect(() => {
    if (prevIndex.current !== null && prevIndex.current !== index) {
      headingRef.current?.focus({ preventScroll: true });
      setAnnounce(`Step ${index + 1} of ${STEPS.length}: ${STEP_LABEL[step]}`);
      const top = headingRef.current?.closest("[data-booking-card]")?.getBoundingClientRect().top;
      if (top !== undefined && top < 0) window.scrollBy({ top: top - 100, behavior: "smooth" });
    }
    prevIndex.current = index;
  }, [index, step]);

  const update = (patch) =>
    setBooking((b) => {
      const next = { ...b, ...patch };
      saveBooking(next);
      return next;
    });

  const direction = prevIndex.current !== null && prevIndex.current > index ? "-24px" : "24px";
  const continueDisabled =
    (step === "service" && !booking.service) ||
    (step === "format" && !booking.format) ||
    (step === "datetime" && !booking.slot) ||
    sending;

  const next = () => {
    if (step === "service") go("format");
    else if (step === "format") go("datetime");
    else if (step === "datetime") {
      setSlotNotice(null);
      go("details");
    }
  };
  const back = () => {
    const prev = STEPS[index - 1];
    if (prev) go(prev);
  };

  const submit = async (d) => {
    if (!booking.service || !booking.format || !booking.slot) return;
    if (loadTakenSlots().has(Date.parse(booking.slot))) {
      update({ slot: undefined });
      setRefreshKey((k) => k + 1);
      setSlotNotice(
        <div className="mb-6">
          <Alert tone="error">Sorry — that time was just booked. Please choose another.</Alert>
        </div>,
      );
      go("datetime");
      return;
    }
    setSending(true);
    setSubmitError(null);
    const reference = booking.reference ?? makeReference("AX");
    if (!booking.reference) update({ reference });
    const day = booking.slot.slice(0, 10);
    const time = booking.slot.slice(11, 16);
    const res = await submitForm({
      kind: "Booking request",
      subject: `Booking request: ${d.firstName} ${d.surname} — ${formatDate(day)} ${time}`,
      replyTo: d.email,
      fromName: `${d.firstName} ${d.surname}`,
      honeypot: d.company_website,
      formLoadedAt: loadedAt.current,
      reference,
      fields: {
        Service: serviceLabel(booking.service) ?? booking.service,
        Format: formatLabel(booking.format) ?? booking.format,
        "Preferred date": formatDate(day),
        "Preferred time": `${time} SAST`,
        Duration: "60 minutes",
        "First name": d.firstName,
        Surname: d.surname,
        Email: d.email,
        Mobile: d.mobile,
        "Client type": d.clientType === "new" ? "New client" : "Returning client",
        "Session for":
          d.sessionFor === "myself" ? "Myself" : d.sessionFor === "family" ? "My family or couple" : "Someone else",
        ...(d.sessionFor === "someone-else" ? { "Their name": d.theirName, Relationship: d.relationship } : {}),
        Notes: d.notes,
        "Privacy consent": d.consent,
        "Visitor timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
    setSending(false);
    if (res.ok) {
      rememberTakenSlot(booking.slot);
      setIntakePrefill({ firstName: d.firstName, surname: d.surname, email: d.email, phone: d.mobile });
      clearBooking();
      setConfirmation({
        reference: res.reference,
        serviceLabel: serviceLabel(booking.service) ?? booking.service,
        formatLabel: formatLabel(booking.format) ?? booking.format,
        start: booking.slot,
        isNewClient: d.clientType === "new",
        emailFailed: res.emailFailed,
      });
      go("confirmed");
    } else {
      const limited = res.reason === "rate_limited";
      setSubmitError(
        <Alert tone="error">
          {limited ? "We've received several requests from this connection in the last hour. " : ""}
          Sorry — we couldn&apos;t send your request just now. Please try again, or email{" "}
          <a href={`mailto:${site.email}`} className="link-draw">
            {site.email}
          </a>
          .
        </Alert>,
      );
    }
  };

  const live = {
    service: serviceLabel(booking.service),
    format: formatLabel(booking.format),
    date: booking.slot ? formatDate(booking.slot.slice(0, 10)) : booking.date ? formatDate(booking.date) : undefined,
    time: booking.slot ? booking.slot.slice(11, 16) : undefined,
  };
  const summary =
    confirmation && step === "confirmed"
      ? {
          service: confirmation.serviceLabel,
          format: confirmation.formatLabel,
          date: formatDate(confirmation.start.slice(0, 10)),
          time: confirmation.start.slice(11, 16),
        }
      : live;

  return (
    <div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
      <Progress current={index} />
      <div
        data-booking-card
        className="mt-6 overflow-hidden rounded-[var(--radius-panel)] border border-line bg-surface shadow-[var(--shadow-panel)] lg:grid lg:grid-cols-[35fr_65fr]"
      >
        <section className="on-navy bg-navy-800" aria-label="Booking summary">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left lg:hidden"
            aria-expanded={summaryOpen}
            aria-controls="booking-summary-rows"
            onClick={() => setSummaryOpen((o) => !o)}
          >
            <span className="min-w-0">
              <span className="eyebrow block">Your booking</span>
              <span className="mt-0.5 block truncate text-[15px] text-ivory">
                {[summary.service, summary.date && `${summary.date}${summary.time ? `, ${summary.time}` : ""}`]
                  .filter(Boolean)
                  .join(" · ") || "Nothing chosen yet"}
              </span>
            </span>
            <ChevronDown
              className={cn("size-5 shrink-0 text-gold-500 transition-transform", summaryOpen && "rotate-180")}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </button>
          <div id="booking-summary-rows" className={cn("px-5 pb-6 lg:block lg:p-10", !summaryOpen && "hidden")}>
            <div className="hidden items-center gap-4 lg:flex">
              <Logo size={56} />
              <div>
                <p className="font-display text-[1.4rem] leading-tight font-semibold text-ivory">
                  {site.practitionerName}
                </p>
                <p className="eyebrow mt-1">Registered Social Worker</p>
              </div>
            </div>
            <span aria-hidden="true" className="hairline my-8 hidden lg:block" />
            <dl className="space-y-4 text-[15px]">
              <SummaryRow label="Service" value={summary.service} />
              <SummaryRow label="Session type" value={summary.format} />
              <SummaryRow label="Duration" value="60 minutes" />
              <SummaryRow label="Date" value={summary.date} />
              <SummaryRow label="Time" value={summary.time && `${summary.time} SAST`} />
              <SummaryRow label="Timezone" value="South African time (Africa/Johannesburg)" />
            </dl>
          </div>
        </section>
        <div className="p-6 pb-28 sm:p-10 lg:pb-10">
          <div key={step} className="step-enter" style={{ "--step-from": direction }}>
            <p className="eyebrow">
              Step {index + 1} of {STEPS.length}
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mt-3 text-[clamp(1.9rem,1.5rem+1.4vw,2.6rem)] leading-tight outline-none"
            >
              {STEP_TITLE[step]}
            </h2>
            <div className="mt-8">
              {!ready ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <LoaderCircle className="size-5 animate-spin" strokeWidth={1.5} aria-hidden="true" /> Loading…
                </div>
              ) : step === "service" ? (
                <ServiceStep value={booking.service} onChange={(v) => update({ service: v })} />
              ) : step === "format" ? (
                <FormatStep value={booking.format} onChange={(v) => update({ format: v })} />
              ) : step === "datetime" ? (
                <DateTimeStep
                  date={booking.date}
                  slot={booking.slot}
                  onDate={(d) => update({ date: d, slot: booking.slot?.startsWith(d) ? booking.slot : undefined })}
                  onSlot={(s) => update({ slot: s })}
                  refreshKey={refreshKey}
                  notice={slotNotice}
                />
              ) : step === "details" ? (
                <DetailsStep
                  initial={booking.details}
                  onChange={(d) => update({ details: d })}
                  onSubmit={submit}
                  submitError={submitError}
                />
              ) : confirmation ? (
                <Confirmation c={confirmation} />
              ) : null}
            </div>
          </div>
          {step !== "confirmed" && (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur-md lg:static lg:mt-10 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <div className="flex items-center justify-between gap-3">
                {index > 0 ? (
                  <Button type="button" variant="ghost" onClick={back} className="px-5">
                    <ArrowLeft strokeWidth={1.5} aria-hidden="true" />
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                {step === "details" ? (
                  <Button type="submit" form="booking-details" disabled={sending} aria-busy={sending}>
                    {sending ? (
                      <>
                        <LoaderCircle className="animate-spin" strokeWidth={1.5} aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Request Booking
                        <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button type="button" onClick={next} disabled={continueDisabled}>
                    Continue
                    <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Book() {
  usePageMeta({
    title: "Book a Session | Alulutho Xanywa Social Worker",
    description: "Choose your service, session type and a time that suits you. In-person and virtual sessions available.",
    path: "/book",
  });
  const [params] = useSearchParams();
  const rawStep = params.get("step");
  const rawService = params.get("service");
  const urlStep = rawStep && STEPS.includes(rawStep) ? rawStep : undefined;
  const preselect = rawService && (getService(rawService) || rawService === CONSULT) ? rawService : undefined;

  return (
    <section className="pt-[clamp(32px,5vw,72px)] pb-[clamp(64px,8vw,120px)]">
      <div className="container-site">
        <Reveal>
          <p className="eyebrow">Book a Session</p>
        </Reveal>
        <TextReveal as="h1" parts={["Let's find a time that", { em: "suits you." }]} className="mt-5 max-w-[15ch]" />
        <Reveal index={2}>
          <p className="mt-6 text-base text-muted-foreground">
            Prefer a telephone referral?{" "}
            {hasValue(site.phone) ? (
              <a href={telHref(site.phone)} className="link-draw">
                Call {site.phone}
              </a>
            ) : (
              <AppLink to="/contact" className="link-draw">
                Get in touch
              </AppLink>
            )}
          </p>
        </Reveal>
        <div className="mt-10">
          <BookingFlow urlStep={urlStep} preselect={preselect} />
        </div>
      </div>
    </section>
  );
}
