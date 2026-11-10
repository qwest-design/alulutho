import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy, LoaderCircle, Lock } from "lucide-react";
import { AppLink } from "../components/AppLink";
import { Button } from "../components/Button";
import { Logo } from "../components/Brand";
import {
  Alert,
  CheckboxField,
  ChoiceCards,
  FieldShell,
  Honeypot,
  SelectField,
  SuccessCheck,
  TextareaField,
  TextField,
} from "../components/Form";
import { Reveal, TextReveal } from "../components/Reveal";
import { cn } from "../lib/cn";
import { hasValue, site } from "../lib/site";
import { services } from "../lib/services";
import { takeIntakePrefill } from "../lib/store";
import {
  HEARD_ABOUT,
  INTAKE_DEFAULTS,
  INTAKE_STEP_LABEL,
  INTAKE_STEPS,
  PROVINCES,
  REFERRALS,
  SCHEMES,
  stepApplies,
  TITLES,
  validateAll,
  validateStep,
} from "../lib/intake";
import { submitForm } from "../lib/submit";
import { usePageMeta } from "../lib/meta";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));

const STORE_KEY = "ax-intake-v1";

// The booking hand-off is read once per page load and cached, so a remount can't lose it.
let prefillCache;
const getPrefill = () => {
  if (prefillCache === undefined) prefillCache = takeIntakePrefill();
  return prefillCache;
};
const loadDraft = () => {
  try {
    const v = sessionStorage.getItem(STORE_KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};
const saveDraft = (d) => {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
};

/* ---------------- Searchable combobox (medical aid scheme) ---------------- */
function Combobox({ label, required, helper, error, options, value, onChange, name }) {
  const id = useId();
  const listId = `${id}-list`;
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return !q || q === value.toLowerCase() ? options : options.filter((o) => o.toLowerCase().includes(q));
  }, [query, options, value]);

  const choose = (o) => {
    onChange(o);
    setQuery(o);
    setOpen(false);
  };

  return (
    <FieldShell id={id} label={label} required={required} helper={helper} error={error}>
      <div className="relative">
        <input
          id={id}
          name={name}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[active] ? `${id}-opt-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
          autoComplete="off"
          className="field-input pr-12"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
            if (options.includes(e.target.value)) onChange(e.target.value);
            else if (value) onChange("");
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(a + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && open && filtered[active]) {
              e.preventDefault();
              choose(filtered[active]);
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-navy-600"
        />
        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-[14px] border border-line bg-surface p-1.5 shadow-[var(--shadow-panel)]"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[15px] text-muted-foreground">No match — choose &quot;Other&quot;.</li>
            ) : (
              filtered.map((o, i) => (
                <li
                  key={o}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={o === value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(o);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "cursor-pointer rounded-[10px] px-4 py-3 text-base text-navy-800",
                    i === active && "bg-gold-100",
                    o === value && "font-semibold",
                  )}
                >
                  {o}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </FieldShell>
  );
}

/* ---------------- Review summary ---------------- */
function reviewSections(v) {
  const keep = (rows) => rows.filter((r) => typeof r[1] === "string" && r[1].trim() !== "");
  const address = (postal) => {
    const f = (k) => String(v[postal ? `p${k[0].toUpperCase()}${k.slice(1)}` : k] ?? "");
    return [f("street"), f("suburb"), f("city"), f("province"), f("postalCode"), f("country")].filter(Boolean).join(", ");
  };
  const chosen = services.filter((s) => (v.services || []).includes(s.slug)).map((s) => s.fullTitle);
  return [
    {
      step: "client",
      title: "Client details",
      rows: keep([
        ["Completed by", v.onBehalf ? `${v.repName} (${v.repRelationship}), ${v.repPhone}` : undefined],
        ["Name", [v.title, v.firstNames, v.surname].filter(Boolean).join(" ")],
        [
          "Date of birth",
          v.dobDay && v.dobMonth && v.dobYear
            ? `${v.dobDay} ${MONTHS[Number(v.dobMonth) - 1] ?? v.dobMonth} ${v.dobYear}`
            : undefined,
        ],
        ["ID / passport", v.idNumber],
        ["Mobile", v.mobile],
        ["Alternative number", v.altNumber],
        ["Email", v.email],
        ["Next of kin", v.nokName ? `${v.nokName} (${v.nokRelationship}), ${v.nokPhone}` : undefined],
      ]),
    },
    {
      step: "address",
      title: "Address details",
      rows: keep([
        ["Residential", address(false)],
        ["Postal", v.postalSame ? "Same as residential" : address(true)],
      ]),
    },
    {
      step: "financial",
      title: "Financial details",
      rows: keep([
        ["Payment", v.paymentMethod === "cash" ? "Cash / EFT" : v.paymentMethod === "medical" ? "Medical aid" : undefined],
        [
          "Account holder",
          v.responsible === "myself"
            ? "Myself"
            : v.responsible === "someone-else"
              ? [v.payerName, v.payerRelationship && `(${v.payerRelationship})`, v.payerPhone, v.payerEmail]
                  .filter(Boolean)
                  .join(" ")
              : undefined,
        ],
      ]),
    },
    ...(v.paymentMethod === "medical"
      ? [
          {
            step: "medical",
            title: "Medical aid details",
            rows: keep([
              ["Scheme", v.scheme === "Other" ? v.schemeOther : v.scheme],
              ["Plan / option", v.plan],
              ["Membership number", v.memberNumber],
              ["Dependant code", v.dependantCode],
              ["Client is", v.memberType === "main" ? "Main member" : v.memberType === "dependant" ? "Dependant" : undefined],
              [
                "Main member",
                v.memberType === "dependant"
                  ? `${v.mainName} (${v.mainRelationship}), ${v.mainPhone}, ID ${v.mainId}`
                  : undefined,
              ],
            ]),
          },
        ]
      : []),
    {
      step: "additional",
      title: "Additional details",
      rows: keep([
        ["Support with", chosen.join(", ")],
        ["Referred by", v.referral ? (v.referrerName ? `${v.referral} — ${v.referrerName}` : v.referral) : undefined],
        ["Heard about us", v.heardAbout],
        ["Notes", v.notes],
      ]),
    },
  ];
}

/* ---------------- Step helpers ---------------- */
function useField() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (name) => ({ ...register(name), error: errors[name]?.message });
}

function Group({ legend, children, className }) {
  return (
    <fieldset className={cn("space-y-6", className)}>
      <legend className="float-left mb-1 w-full font-display text-[1.6rem] font-semibold text-navy-800">{legend}</legend>
      <div className="clear-both space-y-6">{children}</div>
    </fieldset>
  );
}

function ProviderStep() {
  const rows = [
    ["Practice name", site.practiceName],
    ["Practitioner", site.practitionerName],
    ["Practice type", "Social Worker — Clinical / Private Practice"],
    ["SACSSP Reg. No.", site.sacsspNumber],
    ...(hasValue(site.practiceNumber) ? [["Practice Number", site.practiceNumber]] : []),
  ];
  if (hasValue(site.email)) rows.push(["Email", site.email]);
  if (hasValue(site.phone)) rows.push(["Phone", site.phone]);
  return (
    <div>
      <div className="rounded-[var(--radius-card)] border border-gold-500/60 bg-ivory p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <Logo size={64} />
          <p className="font-display text-[1.5rem] leading-tight font-semibold text-navy-800">{site.practitionerName}</p>
        </div>
        <dl className="mt-6 divide-y divide-gold-500/40 border-t border-gold-500/40">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-6">
              <dt className="text-[15px] text-muted-foreground">{k}</dt>
              <dd className="text-base font-semibold text-navy-800 [overflow-wrap:anywhere]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="measure mt-6 text-base text-ink">
        Please confirm these are the practice details you&apos;re completing this form for.
      </p>
    </div>
  );
}

function ClientStep() {
  const f = useField();
  const { control, formState } = useFormContext();
  const onBehalf = useWatch({ control, name: "onBehalf" });
  const [thisYear] = useState(() => new Date().getFullYear());
  const years = Array.from({ length: 111 }, (_, i) => String(thisYear - i));
  const dobError = formState.errors.dobDay?.message;
  return (
    <div className="space-y-10">
      <CheckboxField
        label="I'm completing this form on behalf of someone else (for example, my child)"
        {...f("onBehalf")}
      />
      {onBehalf && (
        <Group legend="Your details" className="step-enter rounded-[var(--radius-card)] bg-ivory p-5 sm:p-6">
          <TextField label="Your full name" required autoComplete="name" {...f("repName")} />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField label="Relationship to the client" required {...f("repRelationship")} />
            <TextField label="Your phone" required type="tel" inputMode="tel" autoComplete="tel" {...f("repPhone")} />
          </div>
        </Group>
      )}
      <Group legend="Client">
        <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
          <SelectField label="Title" placeholder="Choose" options={TITLES} autoComplete="honorific-prefix" {...f("title")} />
          <TextField
            label="First name(s)"
            required
            autoComplete={onBehalf ? "off" : "given-name"}
            {...f("firstNames")}
          />
        </div>
        <TextField label="Surname" required autoComplete={onBehalf ? "off" : "family-name"} {...f("surname")} />
        <fieldset aria-describedby={dobError ? "dob-error" : undefined}>
          <legend className="mb-2 text-[15px] font-semibold text-navy-800">
            Date of birth
            <span aria-hidden="true" className="ml-1 text-gold-700">
              *
            </span>
            <span className="sr-only"> (Required)</span>
          </legend>
          <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-3">
            <SelectField
              label={<span className="sr-only">Day</span>}
              placeholder="Day"
              options={DAYS}
              {...f("dobDay")}
              error={dobError ? " " : undefined}
            />
            <SelectField
              label={<span className="sr-only">Month</span>}
              placeholder="Month"
              options={MONTH_OPTIONS}
              {...f("dobMonth")}
            />
            <SelectField label={<span className="sr-only">Year</span>} placeholder="Year" options={years} {...f("dobYear")} />
          </div>
          {dobError && (
            <p id="dob-error" className="mt-2 text-[15px] font-medium text-destructive">
              {dobError}
            </p>
          )}
        </fieldset>
        <TextField
          label="SA ID number or passport number"
          helper="Most medical aids require this for claims."
          autoComplete="off"
          {...f("idNumber")}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Mobile number"
            required
            type="tel"
            inputMode="tel"
            autoComplete={onBehalf ? "off" : "tel"}
            {...f("mobile")}
          />
          <TextField label="Alternative number" type="tel" inputMode="tel" {...f("altNumber")} />
        </div>
        <TextField
          label="Email address"
          required
          type="email"
          inputMode="email"
          autoComplete={onBehalf ? "off" : "email"}
          {...f("email")}
        />
      </Group>
      <Group legend="Next of kin">
        <TextField label="Full name" required {...f("nokName")} />
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField label="Relationship" required {...f("nokRelationship")} />
          <TextField label="Contact number" required type="tel" inputMode="tel" {...f("nokPhone")} />
        </div>
      </Group>
    </div>
  );
}

function AddressFields({ prefix }) {
  const f = useField();
  const n = (k) => (prefix ? `p${k[0].toUpperCase()}${k.slice(1)}` : k);
  const ac = (k) => (prefix ? `shipping ${k}` : k);
  return (
    <>
      <TextField label="Street address" required autoComplete={ac("street-address")} {...f(n("street"))} />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Suburb" required autoComplete={ac("address-level3")} {...f(n("suburb"))} />
        <TextField label="City / Town" required autoComplete={ac("address-level2")} {...f(n("city"))} />
      </div>
      <div className="grid gap-6 sm:grid-cols-[1.4fr_1fr]">
        <SelectField
          label="Province"
          required
          placeholder="Choose a province"
          options={PROVINCES}
          {...f(n("province"))}
        />
        <TextField
          label="Postal code"
          required
          inputMode="numeric"
          autoComplete={ac("postal-code")}
          {...f(n("postalCode"))}
        />
      </div>
      <TextField label="Country" required autoComplete={ac("country-name")} {...f(n("country"))} />
    </>
  );
}

function AddressStep() {
  const f = useField();
  const { control } = useFormContext();
  const same = useWatch({ control, name: "postalSame" });
  return (
    <div className="space-y-10">
      <Group legend="Residential address">
        <AddressFields prefix="" />
      </Group>
      <CheckboxField label="My postal address is the same as my residential address" {...f("postalSame")} />
      {!same && (
        <Group legend="Postal address" className="step-enter">
          <AddressFields prefix="p" />
        </Group>
      )}
    </div>
  );
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <dt className="text-[15px] text-muted-foreground">{label}</dt>
        <dd className="text-base font-semibold text-navy-800">{value}</dd>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          });
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-[15px] font-semibold text-navy-800 hover:border-gold-500"
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" strokeWidth={1.5} aria-hidden="true" />}
        {copied ? "Copied" : "Copy"}
        <span className="sr-only"> {label}</span>
      </button>
    </div>
  );
}

function FinancialStep() {
  const f = useField();
  const { control, setValue, formState } = useFormContext();
  const method = useWatch({ control, name: "paymentMethod" });
  const responsible = useWatch({ control, name: "responsible" });
  const bank = [
    ["Bank", site.bank.bankName],
    ["Account name", site.bank.accountName],
    ["Account number", site.bank.accountNumber],
    ["Branch code", site.bank.branchCode],
  ].filter(([, v]) => hasValue(v));
  const fullBank = bank.length === 4;
  return (
    <div className="space-y-10">
      <ChoiceCards
        name="paymentMethod-choice"
        legend="How will you be paying for sessions?"
        required
        value={method}
        onChange={(v) => setValue("paymentMethod", v, { shouldDirty: true })}
        error={formState.errors.paymentMethod?.message}
        options={[
          { value: "cash", label: "Cash / EFT", description: "Pay the practice directly." },
          { value: "medical", label: "Medical aid", description: "Claim from your medical aid scheme." },
        ]}
      />
      {method === "cash" && (
        <div className="step-enter rounded-[var(--radius-card)] border border-gold-500/60 bg-ivory p-6">
          <p className="font-semibold text-navy-800">Practice banking details</p>
          {fullBank ? (
            <>
              <dl className="mt-3 divide-y divide-gold-500/30">
                {bank.map(([k, v]) => (
                  <CopyRow key={k} label={k} value={v} />
                ))}
              </dl>
              <p className="mt-3 text-[15px] text-ink">Payment reference: your surname and initials.</p>
            </>
          ) : (
            <p className="mt-2 text-base text-ink">
              The practice&apos;s banking details will be sent to you with your confirmation email.
            </p>
          )}
        </div>
      )}
      <ChoiceCards
        name="responsible-choice"
        legend="Who is responsible for paying the account?"
        required
        size="sm"
        value={responsible}
        onChange={(v) => setValue("responsible", v, { shouldDirty: true })}
        error={formState.errors.responsible?.message}
        options={[
          { value: "myself", label: "Myself" },
          { value: "someone-else", label: "Someone else" },
        ]}
      />
      {responsible === "someone-else" && (
        <Group legend="Account holder" className="step-enter rounded-[var(--radius-card)] bg-ivory p-5 sm:p-6">
          <TextField label="Full name" required {...f("payerName")} />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField label="Relationship to the client" required {...f("payerRelationship")} />
            <TextField label="Phone" required type="tel" inputMode="tel" {...f("payerPhone")} />
          </div>
          <TextField label="Email" type="email" inputMode="email" {...f("payerEmail")} />
        </Group>
      )}
    </div>
  );
}

function MedicalStep() {
  const f = useField();
  const { control, setValue, formState } = useFormContext();
  const scheme = useWatch({ control, name: "scheme" });
  const memberType = useWatch({ control, name: "memberType" });
  return (
    <div className="space-y-10">
      <Group legend="Scheme">
        <Combobox
          name="scheme"
          label="Medical aid scheme"
          required
          helper="Start typing to search."
          options={SCHEMES}
          value={scheme}
          onChange={(v) => setValue("scheme", v, { shouldDirty: true })}
          error={formState.errors.scheme?.message}
        />
        {scheme === "Other" && <TextField label="Scheme name" required {...f("schemeOther")} />}
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField label="Plan / option" required {...f("plan")} />
          <TextField label="Membership number" required inputMode="numeric" autoComplete="off" {...f("memberNumber")} />
        </div>
        <TextField
          label="Dependant code"
          helper="Usually 00 for the main member."
          inputMode="numeric"
          className="sm:max-w-[240px]"
          {...f("dependantCode")}
        />
      </Group>
      <ChoiceCards
        name="memberType-choice"
        legend="Is the client the main member or a dependant?"
        required
        size="sm"
        value={memberType}
        onChange={(v) => setValue("memberType", v, { shouldDirty: true })}
        error={formState.errors.memberType?.message}
        options={[
          { value: "main", label: "Main member" },
          { value: "dependant", label: "Dependant" },
        ]}
      />
      {memberType === "dependant" && (
        <Group legend="Main member" className="step-enter rounded-[var(--radius-card)] bg-ivory p-5 sm:p-6">
          <TextField label="Full name" required {...f("mainName")} />
          <TextField label="ID or passport number" required autoComplete="off" {...f("mainId")} />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField label="Contact number" required type="tel" inputMode="tel" {...f("mainPhone")} />
            <TextField label="Relationship to the client" required {...f("mainRelationship")} />
          </div>
        </Group>
      )}
    </div>
  );
}

function AdditionalStep() {
  const f = useField();
  const { control, setValue } = useFormContext();
  const chosen = useWatch({ control, name: "services" }) ?? [];
  const referral = useWatch({ control, name: "referral" });
  const toggle = (slug) =>
    setValue("services", chosen.includes(slug) ? chosen.filter((s) => s !== slug) : [...chosen, slug], {
      shouldDirty: true,
    });
  return (
    <div className="space-y-10">
      <fieldset>
        <legend className="mb-3 text-[15px] font-semibold text-navy-800">What would you like support with?</legend>
        <div className="flex flex-wrap gap-2.5">
          {services.map((s) => {
            const on = chosen.includes(s.slug);
            return (
              <button
                key={s.slug}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(s.slug)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-[15px] font-semibold transition-colors",
                  on
                    ? "border-navy-800 bg-navy-800 text-ivory"
                    : "border-line-strong bg-surface text-navy-800 hover:border-gold-500",
                )}
              >
                {on ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-500" />
                )}
                {s.fullTitle}
              </button>
            );
          })}
        </div>
      </fieldset>
      <SelectField label="How were you referred?" placeholder="Choose one" options={REFERRALS} {...f("referral")} />
      {referral && referral !== "Self-referred" && (
        <TextField label="Referrer's name and practice" className="step-enter" {...f("referrerName")} />
      )}
      <SelectField
        label="How did you hear about the practice?"
        placeholder="Choose one"
        options={HEARD_ABOUT}
        {...f("heardAbout")}
      />
      <TextareaField label="Anything else you'd like the practice to know?" {...f("notes")} />
    </div>
  );
}

function ReviewStep({ onEdit, error }) {
  const f = useField();
  const { control } = useFormContext();
  const values = useWatch({ control });
  const sections = reviewSections({ ...INTAKE_DEFAULTS, ...values });
  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.step} className="rounded-[var(--radius-card)] border border-line p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[1.5rem]!">{s.title}</h3>
            <button
              type="button"
              onClick={() => onEdit(s.step)}
              className="link-draw inline-flex min-h-11 items-center text-[15px]"
            >
              Edit<span className="sr-only"> {s.title}</span>
            </button>
          </div>
          {s.rows.length > 0 ? (
            <dl className="mt-3 divide-y divide-line">
              {s.rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <dt className="text-[15px] text-muted-foreground">{k}</dt>
                  <dd className="text-base text-navy-800 [overflow-wrap:anywhere]">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-[15px] text-muted-foreground">Nothing added.</p>
          )}
        </section>
      ))}
      <div className="space-y-4 rounded-[var(--radius-card)] bg-ivory p-5 sm:p-6">
        <CheckboxField required label="I confirm the information I've provided is true and complete." {...f("confirmTrue")} />
        <CheckboxField
          required
          label="I accept responsibility for the payment of this account, including any amounts my medical aid does not cover."
          {...f("acceptPayment")}
        />
        <CheckboxField
          required
          label="I consent to the practice processing my personal and health-related information to provide care, manage my account and submit medical aid claims, in line with the Privacy Policy (POPIA)."
          {...f("consentPopia")}
        />
      </div>
      <Honeypot {...f("company_website")} />
      {error}
      <p className="flex items-center gap-2 text-[15px] text-muted-foreground">
        <Lock className="size-4 text-gold-700" strokeWidth={1.5} aria-hidden="true" />
        Sent securely to the practice only.
      </p>
    </div>
  );
}

/* ---------------- Email body for the practice ---------------- */
function intakeFields(v) {
  const out = {};
  for (const s of reviewSections(v)) {
    for (const [k, val] of s.rows) out[`${s.title} — ${k}`] = val;
  }
  out["Confirmed true and complete"] = v.confirmTrue;
  out["Accepts payment responsibility"] = v.acceptPayment;
  out["POPIA consent"] = v.consentPopia;
  return out;
}

/* ---------------- Flow ---------------- */
function IntakeFlow() {
  const methods = useForm({ defaultValues: INTAKE_DEFAULTS, shouldFocusError: false });
  const { getValues, setError, clearErrors, reset, watch } = methods;
  const [params, setParams] = useSearchParams();
  const rawStep = params.get("step");
  const urlStep = rawStep && INTAKE_STEPS.includes(rawStep) ? rawStep : undefined;
  const step = urlStep ?? "provider";

  const [furthest, setFurthest] = useState("provider");
  const [editing, setEditing] = useState(false);
  const [ready, setReady] = useState(false);
  const [fromBooking, setFromBooking] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [done, setDone] = useState(null);
  const [announce, setAnnounce] = useState("");
  const prevStep = useRef(step);
  const headingRef = useRef(null);
  const panelRef = useRef(null);
  const firstRender = useRef(true);
  const loadedAt = useRef(Date.now());

  const payment = watch("paymentMethod");
  const applies = (s) => stepApplies(s, { paymentMethod: payment });
  const active = INTAKE_STEPS.filter(applies);
  const index = active.indexOf(step);

  const go = (s, replace = false) => setParams(s ? { step: s } : {}, { replace, preventScrollReset: true });

  // Restore draft + booking prefill.
  useEffect(() => {
    const draft = loadDraft();
    const prefill = getPrefill();
    const values = { ...INTAKE_DEFAULTS, ...(draft?.values ?? {}) };
    let booked = draft?.fromBooking ?? false;
    if (prefill) {
      booked = true;
      values.firstNames ||= prefill.firstName;
      values.surname ||= prefill.surname;
      values.email ||= prefill.email;
      values.mobile ||= prefill.phone;
    }
    reset({ ...values, confirmTrue: false, acceptPayment: false, consentPopia: false, company_website: "" });
    if (draft?.step) {
      setFurthest(draft.step);
      if (!urlStep) go(draft.step, true);
    }
    setFromBooking(booked);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  // Persist the draft (never the consent ticks) and clear a field's error as it changes.
  useEffect(() => {
    if (!ready || done) return;
    const sub = watch((all, { name }) => {
      if (name) clearErrors(name);
      // eslint-disable-next-line no-unused-vars
      const { confirmTrue, acceptPayment, consentPopia, company_website, ...rest } = all;
      saveDraft({ values: rest, step: furthest, fromBooking });
    });
    return () => sub.unsubscribe();
  }, [ready, done, watch, clearErrors, furthest, fromBooking]);

  useEffect(() => {
    if (!ready || done) return;
    saveDraft({ ...(loadDraft() ?? { values: {} }), step: furthest, fromBooking });
  }, [furthest, ready, done, fromBooking]);

  // Starting again after a submission.
  useEffect(() => {
    if (!done || !urlStep) return;
    setDone(null);
    reset({ ...INTAKE_DEFAULTS });
    setFurthest("provider");
    loadedAt.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlStep]);

  // Never let the URL jump ahead of the furthest step reached.
  useEffect(() => {
    if (!ready || done) return;
    if (INTAKE_STEPS.indexOf(step) <= INTAKE_STEPS.indexOf(furthest) && applies(step)) return;
    const back =
      [...active].reverse().find((s) => INTAKE_STEPS.indexOf(s) <= INTAKE_STEPS.indexOf(furthest)) ?? "provider";
    go(back, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, done, step, furthest, payment]);

  // Focus + announce on step change.
  useEffect(() => {
    const key = `${step}|${done ? "done" : ""}`;
    if (firstRender.current === true || firstRender.current === key) {
      firstRender.current = key;
      return;
    }
    firstRender.current = key;
    headingRef.current?.focus({ preventScroll: true });
    if (done) panelRef.current?.scrollIntoView({ block: "center" });
    else {
      const top = panelRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0 || top > window.innerHeight * 0.4) window.scrollBy({ top: top - 110, behavior: "smooth" });
    }
    setAnnounce(done ? "Intake form submitted" : `Step ${index + 1} of ${active.length}: ${INTAKE_STEP_LABEL[step]}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, done]);

  const direction = INTAKE_STEPS.indexOf(step) < INTAKE_STEPS.indexOf(prevStep.current) ? "-24px" : "24px";
  useEffect(() => {
    prevStep.current = step;
  }, [step]);

  const visit = (s) => {
    if (INTAKE_STEPS.indexOf(s) > INTAKE_STEPS.indexOf(furthest)) setFurthest(s);
    go(s);
  };

  const showErrors = (errs) => {
    clearErrors();
    for (const e of errs) setError(e.field, { type: "manual", message: e.message });
    const n = errs.length;
    setAnnounce((prev) => `${n} ${n === 1 ? "field needs" : "fields need"} attention.${prev.endsWith("​") ? "" : "​"}`);
    requestAnimationFrame(() => {
      const el = panelRef.current?.querySelector('[aria-invalid="true"]');
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  };

  const next = () => {
    const errs = validateStep(step, getValues());
    if (errs.length) return showErrors(errs);
    if (editing) {
      setEditing(false);
      return visit("review");
    }
    const n = active[index + 1];
    if (n) visit(n);
  };
  const back = () => {
    const p = active[index - 1];
    if (p) visit(p);
  };
  const edit = (s) => {
    setEditing(true);
    visit(s);
  };

  const submit = async () => {
    const v = getValues();
    const errs = validateAll(v);
    if (errs.length) {
      const first = errs[0];
      const owner = INTAKE_STEPS.find((s) => validateStep(s, v).some((e) => e.field === first.field));
      if (owner && owner !== "review") {
        visit(owner);
        setTimeout(() => showErrors(validateStep(owner, v)), 350);
      } else showErrors(errs);
      return;
    }
    setSending(true);
    setSubmitError(null);
    const name = [v.firstNames, v.surname].filter(Boolean).join(" ");
    const res = await submitForm({
      kind: "Client intake",
      subject: `Client intake form: ${name}`,
      replyTo: v.email,
      fromName: name,
      honeypot: v.company_website,
      formLoadedAt: loadedAt.current,
      fields: intakeFields(v),
    });
    setSending(false);
    if (res.ok) {
      try {
        sessionStorage.removeItem(STORE_KEY);
      } catch {
        /* ignore */
      }
      prefillCache = null;
      setDone({ reference: res.reference, emailFailed: res.emailFailed });
      go(null, true);
    } else {
      const limited = res.reason === "rate_limited";
      setSubmitError(
        <Alert tone="error">
          <p>
            {limited ? "We've received several forms from this connection in the last hour. " : ""}
            Sorry — your form couldn&apos;t be sent just now. Everything you&apos;ve entered is still here.
          </p>
          <p className="mt-2">
            Please try again, or email{" "}
            <a href={`mailto:${site.email}`} className="link-draw">
              {site.email}
            </a>
            .
          </p>
        </Alert>,
      );
    }
  };

  if (done) {
    return (
      <div
        ref={panelRef}
        className="rounded-[var(--radius-panel)] border border-line bg-surface p-8 shadow-[var(--shadow-panel)] sm:p-12"
      >
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
        <SuccessCheck />
        <h2 ref={headingRef} tabIndex={-1} className="mt-8 text-[clamp(2rem,1.6rem+1.6vw,2.9rem)] outline-none">
          Thank you. You&apos;re <span className="emph">all set.</span>
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Reference <span className="font-semibold tracking-wide text-navy-800">{done.reference}</span>
        </p>
        <p className="measure mt-4 text-lg text-ink">
          A confirmation has been sent to your email. Your details are now with the practice.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {!fromBooking && (
            <Button asChild>
              <AppLink to="/book">
                Book a Session
                <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
              </AppLink>
            </Button>
          )}
          <Button asChild variant="outline">
            <AppLink to="/">Back to Home</AppLink>
          </Button>
        </div>
      </div>
    );
  }

  const isReview = step === "review";
  const pct = ((index + 1) / active.length) * 100;

  return (
    <FormProvider {...methods}>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
        <nav aria-label="Intake steps" className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+32px)]">
            <ol className="space-y-1">
              {INTAKE_STEPS.map((s) => {
                const pendingMedical = s === "medical" && !payment;
                const shown = pendingMedical || applies(s);
                const i = active.indexOf(s);
                const state = shown
                  ? s === step
                    ? "current"
                    : pendingMedical || i > index
                      ? "upcoming"
                      : i < index
                        ? "done"
                        : "upcoming"
                  : "skip";
                return (
                  <li key={s} aria-current={state === "current" ? "step" : undefined}>
                    <span
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-[22px] px-3 py-1.5 text-[15px]",
                        state === "current" && "bg-surface font-bold text-navy-800 shadow-[var(--shadow-card)]",
                        state === "done" && "text-navy-800",
                        (state === "upcoming" || state === "skip") && "text-muted-foreground",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-[12px]",
                          state === "done" && "border-gold-500 bg-gold-500 text-navy-900",
                          state === "current" && "border-navy-800 text-navy-800",
                          (state === "upcoming" || state === "skip") && "border-line-strong",
                        )}
                      >
                        {state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : null}
                      </span>
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span>{INTAKE_STEP_LABEL[s]}</span>
                        {s === "additional" && <span className="text-[13px] text-muted-foreground">Optional</span>}
                        {pendingMedical && (
                          <span className="text-[13px] text-muted-foreground">If paying by medical aid</span>
                        )}
                        {state === "skip" && <span className="text-[13px]">Not needed for Cash / EFT</span>}
                      </span>
                      <span className="sr-only">
                        {state === "done"
                          ? " (completed)"
                          : state === "skip"
                            ? " (not needed for Cash / EFT)"
                            : state === "upcoming"
                              ? " (upcoming)"
                              : " (current step)"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 px-3 text-[13px] text-muted-foreground">Your progress is saved in this browser tab only.</p>
          </div>
        </nav>
        <div ref={panelRef}>
          <div className="mb-4 lg:hidden">
            <p className="text-[15px] font-semibold text-navy-800">
              Step {index + 1} of {active.length} · {INTAKE_STEP_LABEL[step]}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div
                className="h-full rounded-full bg-gold-500 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">Your progress is saved in this browser tab only.</p>
          </div>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (isReview) submit();
              else next();
            }}
            className="relative rounded-[var(--radius-panel)] border border-line bg-surface p-6 pb-28 shadow-[var(--shadow-panel)] sm:p-10 lg:pb-10"
          >
            <div key={step} className="step-enter" style={{ "--step-from": direction }}>
              <p className="eyebrow">
                Step {index + 1} of {active.length}
                {step === "additional" && " · Optional"}
              </p>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="mt-3 text-[clamp(1.9rem,1.5rem+1.4vw,2.6rem)] leading-tight outline-none"
              >
                {INTAKE_STEP_LABEL[step]}
              </h2>
              <div className="mt-8">
                {!ready ? (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <LoaderCircle className="size-5 animate-spin" strokeWidth={1.5} aria-hidden="true" /> Loading…
                  </div>
                ) : step === "provider" ? (
                  <ProviderStep />
                ) : step === "client" ? (
                  <ClientStep />
                ) : step === "address" ? (
                  <AddressStep />
                ) : step === "financial" ? (
                  <FinancialStep />
                ) : step === "medical" ? (
                  <MedicalStep />
                ) : step === "additional" ? (
                  <AdditionalStep />
                ) : (
                  <ReviewStep onEdit={edit} error={submitError} />
                )}
              </div>
            </div>
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
                <Button type="submit" disabled={sending || !ready} aria-busy={sending}>
                  {sending ? (
                    <>
                      <LoaderCircle className="animate-spin" strokeWidth={1.5} aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      {isReview ? "Submit Intake Form" : step === "provider" ? "Start" : editing ? "Back to review" : "Continue"}
                      <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}

export default function Intake() {
  usePageMeta({
    title: "Client Intake Form | Alulutho Xanywa",
    description:
      "Complete your client intake form for Alulutho Xanywa Social Worker. It takes about five minutes.",
    path: "/intake",
    robots: "noindex, follow",
  });
  return (
    <section className="pt-[clamp(32px,5vw,72px)] pb-[clamp(64px,8vw,120px)]">
      <div className="container-site">
        <Reveal>
          <p className="eyebrow">Client Intake</p>
        </Reveal>
        <TextReveal as="h1" parts={["Your", { em: "intake form." }]} className="mt-5" />
        <Reveal index={2}>
          <p className="measure mt-6 flex items-start gap-3 text-lg text-muted-foreground">
            <Lock className="mt-1.5 size-4 shrink-0 text-gold-700" strokeWidth={1.5} aria-hidden="true" />
            This takes about five minutes. Your information is private, encrypted in transit and only seen by the
            practice.
          </p>
        </Reveal>
        <div className="mt-12">
          <IntakeFlow />
        </div>
      </div>
    </section>
  );
}
