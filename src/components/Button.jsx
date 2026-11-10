import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "../lib/cn";

const base =
  "group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-sans font-semibold text-base cursor-pointer select-none transition-[background-color,color,border-color,box-shadow] duration-300 ease-[var(--ease-calm)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0";

const variants = {
  default: "bg-navy-800 text-ivory hover:bg-navy-900",
  gold: "bg-gold-500 text-navy-900 hover:bg-gold-600",
  outline: "border border-navy-800 bg-transparent text-navy-800 hover:bg-navy-800 hover:text-ivory",
  "outline-ivory": "border border-ivory/40 bg-transparent text-ivory hover:border-gold-500 hover:text-gold-500",
  ghost: "text-navy-800 hover:bg-gold-100",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  secondary: "bg-sand text-navy-800 hover:bg-gold-100",
  link: "link-draw rounded-none px-0",
};

const sizes = {
  default: "min-h-[52px] px-7",
  sm: "min-h-11 px-5 text-[15px]",
  lg: "min-h-14 px-8",
  icon: "size-11",
};

export function buttonClass({ variant = "default", size = "default", className } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export const Button = forwardRef(function Button(
  { className, variant, size, asChild = false, children, ...props },
  ref,
) {
  const cls = buttonClass({ variant, size, className });
  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      ref,
      className: cn(cls, children.props.className),
    });
  }
  return (
    <button ref={ref} className={cls} {...props}>
      {children}
    </button>
  );
});
