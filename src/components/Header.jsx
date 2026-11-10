import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "../lib/cn";
import { contactItems, navItems, site } from "../lib/site";
import { services } from "../lib/services";
import { AppLink } from "./AppLink";
import { Button } from "./Button";
import { ContactStrip, Wordmark } from "./Brand";

const EASE = [0.22, 1, 0.36, 1];

function MobileMenu({ open, onClose, returnFocusRef }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const reduce = useReducedMotion();
  const { pathname } = useLocation();
  const quick = contactItems(site).filter((i) => i.kind === "phone" || i.kind === "email");

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 20);
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const els = Array.from(
        panelRef.current.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      );
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const ret = returnFocusRef.current;
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      ret?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  const item = (n) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: EASE, delay: 0.12 + n * 0.06 },
        };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="on-navy bg-navy-900 fixed inset-0 z-50 flex flex-col overflow-y-auto lg:hidden"
          initial={!reduce && { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <div className="container-site flex h-[var(--main-h)] shrink-0 items-center justify-between">
            <Wordmark tone="navy" onNavigate={onClose} />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="inline-flex size-11 items-center justify-center rounded-full border border-line-on-navy text-ivory transition-colors hover:border-gold-500 hover:text-gold-500"
            >
              <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
          <div className="container-site flex flex-1 flex-col pt-6 pb-10">
            <nav aria-label="Mobile">
              <ul className="space-y-1">
                {navItems.map((n, i) => (
                  <motion.li key={n.to} {...item(i)}>
                    <AppLink
                      to={n.to}
                      exact={n.to === "/"}
                      onClick={onClose}
                      className="group flex min-h-14 items-center gap-3 font-display text-[clamp(2.25rem,8vw,3rem)] leading-tight font-medium text-ivory transition-colors hover:text-gold-500 data-[status=active]:text-gold-500"
                    >
                      {n.label}
                    </AppLink>
                  </motion.li>
                ))}
              </ul>
              <motion.ul className="mt-6 space-y-1 border-l border-gold-500/40 pl-5" {...item(navItems.length)}>
                {services.map((s) => (
                  <li key={s.slug}>
                    <AppLink
                      to={`/services/${s.slug}`}
                      onClick={onClose}
                      className="flex min-h-11 items-center text-base text-ivory-soft transition-colors hover:text-gold-500 data-[status=active]:text-gold-500"
                    >
                      {s.title}
                    </AppLink>
                  </li>
                ))}
              </motion.ul>
            </nav>
            <motion.div className="mt-auto pt-10" {...item(navItems.length + 1)}>
              <span className="hairline mb-6" aria-hidden="true" />
              {quick.length > 0 && (
                <ul className="mb-6 space-y-1 text-base">
                  {quick.map((q) => (
                    <li key={q.kind}>
                      <a
                        href={q.href}
                        className="inline-flex min-h-11 items-center text-ivory-soft hover:text-gold-500 [overflow-wrap:anywhere]"
                      >
                        {q.value}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="gold">
                  <AppLink to="/book" onClick={onClose}>
                    Book a Session
                    <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
                  </AppLink>
                </Button>
                <Button asChild variant="outline-ivory">
                  <AppLink to="/intake" onClick={onClose}>
                    Client Intake
                  </AppLink>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const NAV_LINK =
  "relative inline-flex min-h-11 items-center px-3.5 text-[15px] font-medium text-navy-800 transition-colors hover:text-gold-700";

function NavDot() {
  return (
    <span
      aria-hidden="true"
      className="nav-dot pointer-events-none absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-gold-500 opacity-0 transition-opacity duration-300 group-data-[status=active]:opacity-100"
    />
  );
}

function NavLinkItem({ to, label, exact }) {
  return (
    <AppLink to={to} exact={exact} className={cn(NAV_LINK, "group")}>
      {label}
      <NavDot />
    </AppLink>
  );
}

function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const closeTimer = useRef(undefined);
  const openedBy = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) openedBy.current = null;
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        wrapRef.current?.querySelector("button")?.focus();
      }
    };
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center"
      onMouseEnter={() => {
        window.clearTimeout(closeTimer.current);
        if (openedBy.current === null) openedBy.current = "hover";
        setOpen(true);
      }}
      onMouseLeave={() => {
        closeTimer.current = window.setTimeout(() => setOpen(false), 160);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <AppLink to="/services" className={cn(NAV_LINK, "group pr-1")}>
        Services
        <NavDot />
      </AppLink>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="services-panel"
        aria-label="Show services"
        onClick={() => {
          if (openedBy.current === "hover") {
            openedBy.current = "click";
            setOpen(true);
            return;
          }
          openedBy.current = "click";
          setOpen((o) => !o);
        }}
        className="inline-flex size-11 items-center justify-center rounded-full text-navy-800 hover:text-gold-700"
      >
        <ChevronDown
          className={cn("size-4 transition-transform duration-300", open && "rotate-180")}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>
      <div
        id="services-panel"
        hidden={!open}
        className="absolute left-1/2 top-full w-[min(560px,90vw)] -translate-x-1/2 pt-3"
      >
        <div className="animate-in fade-in slide-in-from-top-1 rounded-[var(--radius-panel)] border border-line bg-surface p-3 shadow-[var(--shadow-panel)] duration-300">
          <ul>
            {services.map((s) => (
              <li key={s.slug}>
                <AppLink
                  to={`/services/${s.slug}`}
                  className="group flex items-start gap-4 rounded-[var(--radius-card)] px-4 py-3.5 transition-colors hover:bg-ivory"
                >
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>
                    <span className="block text-[15px] font-semibold text-navy-800">{s.title}</span>
                    <span className="block text-[15px] leading-snug text-muted-foreground">{s.short}</span>
                  </span>
                </AppLink>
              </li>
            ))}
          </ul>
          <div className="mx-4 mt-2 border-t border-line pt-3 pb-1">
            <AppLink to="/services" className="link-draw inline-flex min-h-11 items-center gap-2 text-[15px]">
              View all services
              <ArrowRight className="btn-arrow size-4" strokeWidth={1.5} aria-hidden="true" />
            </AppLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtn = useRef(null);
  const close = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-ivory transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled ? "border-line bg-ivory/85 backdrop-blur-md" : "border-transparent",
        )}
      >
        <div className="h-[var(--strip-h)] border-b border-navy-800 bg-navy-900">
          <div className="container-site flex h-full items-center justify-end">
            <ContactStrip items={contactItems(site)} tone="navy" />
          </div>
        </div>
        <div className="container-site flex h-[var(--main-h)] items-center justify-between gap-4">
          <Wordmark />
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((n) =>
                n.to === "/services" ? (
                  <li key={n.to}>
                    <ServicesMenu />
                  </li>
                ) : (
                  <li key={n.to}>
                    <NavLinkItem to={n.to} label={n.label} exact={n.to === "/"} />
                  </li>
                ),
              )}
            </ul>
          </nav>
          <div className="hidden items-center gap-6 lg:flex">
            <AppLink to="/intake" className="link-draw inline-flex min-h-11 items-center text-[15px]">
              Client Intake
            </AppLink>
            <Button asChild>
              <AppLink to="/book">
                Book a Session
                <ArrowRight className="btn-arrow" strokeWidth={1.5} aria-hidden="true" />
              </AppLink>
            </Button>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <Button asChild size="sm">
              <AppLink to="/book">Book</AppLink>
            </Button>
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-navy-800 transition-colors hover:bg-gold-100"
            >
              <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={close} returnFocusRef={menuBtn} />
    </>
  );
}
