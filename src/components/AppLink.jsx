import { forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Router link that marks itself with data-status="active" when the current
 * path matches (exact, or as a prefix) — mirrors the original site's styling hooks.
 */
export const AppLink = forwardRef(function AppLink({ to, exact = false, children, ...props }, ref) {
  const { pathname } = useLocation();
  const target = typeof to === "string" ? to.split(/[?#]/)[0] : to.pathname;
  const clean = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  const here = clean(pathname);
  const there = clean(target || "/");
  const active = exact || there === "/" ? here === there : here === there || here.startsWith(`${there}/`);
  return (
    <Link
      ref={ref}
      to={to}
      data-status={active ? "active" : undefined}
      aria-current={here === there ? "page" : undefined}
      {...props}
    >
      {children}
    </Link>
  );
});
