import { Mail, MapPin, Phone } from "lucide-react";
import logo from "../assets/logo.png";
import { cn } from "../lib/cn";
import { AppLink } from "./AppLink";

export function Logo({ size = 44, className, decorative = false }) {
  return (
    <img
      src={logo}
      width={size}
      height={size}
      alt={decorative ? "" : "Alulutho Xanywa Social Worker logo"}
      decoding="async"
      className={cn("shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function Wordmark({ tone = "light", className, onNavigate }) {
  return (
    <AppLink
      to="/"
      exact
      onClick={onNavigate}
      className={cn("flex min-h-11 items-center gap-3", className)}
      aria-label="Alulutho Xanywa — home"
    >
      <Logo size={44} decorative />
      <span className="hidden flex-col leading-none min-[400px]:flex">
        <span
          className={cn(
            "font-display text-[20px] font-semibold leading-tight",
            tone === "navy" ? "text-ivory" : "text-navy-800",
          )}
        >
          Alulutho Xanywa
        </span>
        <span className="eyebrow mt-1">Social Worker</span>
      </span>
    </AppLink>
  );
}

export function WhatsAppIcon({ size = 24, className, ...props }) {
  return (
    <svg
      viewBox="0 0 448 512"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

export function ContactIcon({ kind, size = 17 }) {
  const style = { width: size, height: size };
  switch (kind) {
    case "whatsapp":
      return <WhatsAppIcon size={size} />;
    case "email":
      return <Mail style={style} strokeWidth={1.6} aria-hidden="true" />;
    case "address":
      return <MapPin style={style} strokeWidth={1.6} aria-hidden="true" />;
    default:
      return <Phone style={style} strokeWidth={1.6} aria-hidden="true" />;
  }
}

const QUICK = ["phone", "whatsapp"];

export function ContactStrip({ items, tone = "navy" }) {
  const navy = tone === "navy";
  return (
    <ul className="flex items-center gap-4 sm:gap-6">
      {items
        .filter((i) => QUICK.includes(i.kind))
        .map((item) => (
          <li key={item.kind}>
            <a
              href={item.href}
              {...(item.kind === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn(
                "inline-flex min-h-9 items-center gap-2 text-[13px] font-medium transition-colors",
                navy ? "text-ivory-soft hover:text-ivory" : "text-navy-800 hover:text-gold-700",
              )}
            >
              <span className={navy ? "text-gold-500" : "text-gold-700"} aria-hidden="true">
                <ContactIcon kind={item.kind} size={15} />
              </span>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="tabular-nums whitespace-nowrap">{item.value}</span>
            </a>
          </li>
        ))}
    </ul>
  );
}

export function FooterContactList({ items }) {
  return items.map((item) =>
    QUICK.includes(item.kind) ? (
      <li key={item.kind} className="text-base">
        <a
          href={item.href}
          {...(item.kind === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="footer-link gap-3 text-[15px]! [overflow-wrap:anywhere]"
        >
          <span className="text-gold-500" aria-hidden="true">
            <ContactIcon kind={item.kind} size={17} />
          </span>
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-ivory-soft">{item.label}</span>
            <span className="font-semibold text-ivory tabular-nums whitespace-nowrap">{item.value}</span>
          </span>
        </a>
      </li>
    ) : (
      <li key={item.kind} className="text-base">
        <span className="sr-only">{item.label}: </span>
        {item.href ? (
          <a href={item.href} className="footer-link text-[15px]! [overflow-wrap:anywhere]">
            {item.value}
          </a>
        ) : (
          <span className="block py-2.5 text-ivory-soft">{item.value}</span>
        )}
      </li>
    ),
  );
}
