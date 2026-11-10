import { forwardRef, useId } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";

export function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="ml-1 text-gold-700">
        *
      </span>
      <span className="sr-only"> (Required)</span>
    </>
  );
}

export function FieldShell({ id, label, required, helper, error, className, children }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="mb-2 text-[15px] font-semibold text-navy-800">
        {label}
        {required && <RequiredMark />}
      </label>
      {children}
      {helper && !error && (
        <p id={`${id}-helper`} className="mt-2 text-[15px] text-muted-foreground">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[15px] font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id, helper, error) => (error ? `${id}-error` : helper ? `${id}-helper` : undefined);

export const TextField = forwardRef(function TextField(
  { label, required, helper, error, className, id, ...props },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} required={required} helper={helper} error={error} className={className}>
      <input
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(fid, helper, error)}
        className="field-input"
        {...props}
      />
    </FieldShell>
  );
});

export const SelectField = forwardRef(function SelectField(
  { label, required, helper, error, className, id, options, placeholder, ...props },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} required={required} helper={helper} error={error} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy(fid, helper, error)}
          className="field-input appearance-none pr-12"
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const value = typeof o === "string" ? o : o.value;
            const text = typeof o === "string" ? o : o.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-navy-600"
        />
      </div>
    </FieldShell>
  );
});

export const TextareaField = forwardRef(function TextareaField(
  { label, required, helper, error, className, id, ...props },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} required={required} helper={helper} error={error} className={className}>
      <textarea
        ref={ref}
        id={fid}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(fid, helper, error)}
        className="field-input field-textarea"
        {...props}
      />
    </FieldShell>
  );
});

export const CheckboxField = forwardRef(function CheckboxField(
  { label, required, error, className, id, ...props },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fid} className="flex cursor-pointer items-start gap-3.5 py-1">
        <span className="relative mt-0.5 inline-flex size-6 shrink-0">
          <input
            ref={ref}
            id={fid}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-required={required || undefined}
            aria-describedby={error ? `${fid}-error` : undefined}
            className="peer size-6 cursor-pointer appearance-none rounded-md border border-navy-600/50 bg-surface transition-colors checked:border-navy-800 checked:bg-navy-800 aria-[invalid=true]:border-destructive"
            {...props}
          />
          <Check
            aria-hidden="true"
            strokeWidth={2.5}
            className="pointer-events-none absolute inset-0 m-auto size-4 text-ivory opacity-0 transition-opacity peer-checked:opacity-100"
          />
        </span>
        <span className="text-base text-ink">
          {label}
          {required && <RequiredMark />}
        </span>
      </label>
      {error && (
        <p id={`${fid}-error`} className="mt-1.5 pl-[38px] text-[15px] font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

/** Large selectable cards that behave like a radio group. */
export function ChoiceCards({
  name,
  legend,
  options,
  value,
  onChange,
  required,
  error,
  columns = 2,
  legendClassName,
  size = "lg",
}) {
  const errId = useId();
  return (
    <fieldset aria-describedby={error ? errId : undefined}>
      <legend className={cn("mb-3 text-[15px] font-semibold text-navy-800", legendClassName)}>
        {legend}
        {required && <RequiredMark />}
      </legend>
      <div
        className={cn(
          "grid gap-3",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "choice-card group relative flex cursor-pointer items-start gap-4 rounded-[var(--radius-card)] border bg-surface transition-[border-color,box-shadow,transform] duration-300",
                size === "lg" ? "p-5 md:p-6" : "px-5 py-4",
                selected
                  ? "border-gold-500 shadow-[var(--shadow-card)] ring-1 ring-gold-500"
                  : "border-line-strong hover:border-gold-500/70",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="sr-only"
                aria-invalid={error ? true : undefined}
              />
              {o.icon && (
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-500/60 text-gold-700">
                  {o.icon}
                </span>
              )}
              <span className="min-w-0 flex-1 pr-8">
                <span className="block text-base font-semibold text-navy-800 md:text-lg">{o.label}</span>
                {o.description && (
                  <span className="mt-1 block text-[15px] leading-snug text-muted-foreground">{o.description}</span>
                )}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-5 right-5 inline-flex size-6 items-center justify-center rounded-full border transition-colors",
                  selected ? "border-gold-500 bg-gold-500 text-navy-900" : "border-line-strong",
                )}
              >
                {selected && <Check className="size-3.5" strokeWidth={3} />}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errId} className="mt-2 text-[15px] font-medium text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Hidden field that only bots fill in. */
export const Honeypot = forwardRef(function Honeypot(props, ref) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label>
        Company website
        <input ref={ref} type="text" tabIndex={-1} autoComplete="off" {...props} name="company_website" />
      </label>
    </div>
  );
});

export function Alert({ tone, children }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-[var(--radius-card)] border p-5 text-base",
        tone === "error"
          ? "border-destructive/40 bg-destructive/5 text-ink"
          : "border-gold-500/60 bg-gold-100 text-navy-800",
      )}
    >
      {children}
    </div>
  );
}

/** Screen-reader announcement of how many fields need attention after a submit attempt. */
export function ErrorAnnouncer({ count, attempt }) {
  const text = count > 0 ? `${count} ${count === 1 ? "field needs" : "fields need"} attention.${"​".repeat(attempt % 2)}` : "";
  return (
    <p className="sr-only" role="status" aria-live="assertive" aria-atomic="true">
      {text}
    </p>
  );
}

export function SuccessCheck({ className }) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true" className={cn("check-draw size-20", className)}>
      <circle cx="28" cy="28" r="26" fill="none" className="stroke-gold-500" strokeWidth="1.5" />
      <path
        d="M17 29l7 7 15-16"
        fill="none"
        className="stroke-gold-700"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
