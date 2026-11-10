import { Children, createElement, Fragment, isValidElement, useRef } from "react";
import { useInView as useMotionInView } from "motion/react";
import { cn } from "../lib/cn";

export function useInView(amount = 0.12) {
  const ref = useRef(null);
  const inView = useMotionInView(ref, { once: true, amount, margin: "0px 0px -4% 0px" });
  return { ref, inView: inView ? "true" : "false" };
}

export function Reveal({ children, className, index = 0, stagger = 80, as: Tag = "div", ...rest }) {
  const { ref, inView } = useInView();
  return (
    <Tag
      ref={ref}
      data-inview={inView}
      className={cn("reveal", className)}
      style={{ "--i": index, "--stagger": `${stagger}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function RevealGroup({ children, className, itemClassName }) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, i) => (
        <Reveal key={isValidElement(child) && child.key != null ? child.key : i} index={i} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

/** Keeps the last two short words together so headings never end with an orphan. */
export function noOrphan(text) {
  let t = text.replace(/ & /g, " & ");
  const m = t.match(/^(.*\S) (\S+) (\S+)$/);
  if (m) {
    const [, head, a, b] = m;
    const letters = b.replace(/[^\p{L}\p{N}]/gu, "").length;
    if (letters <= 7 && a.length + b.length <= 15 && !a.includes(" ")) t = `${head} ${a} ${b}`;
  }
  return t;
}

/**
 * Word-by-word heading reveal. `parts` is an array of strings and { em: "..." }
 * objects; em parts render in the gold italic display face.
 */
export function TextReveal({ parts, as = "h2", className, id }) {
  const { ref, inView } = useInView(0.15);
  let i = 0;
  const words = parts
    .flatMap((part, idx) => {
      const isEm = typeof part !== "string";
      const text = isEm ? part.em : part;
      return (idx === parts.length - 1 ? noOrphan(text) : text.replace(/ & /g, " & "))
        .split(/[ \t\n\r]+/)
        .filter(Boolean)
        .map((w) => ({ w, isEm }));
    })
    .map(({ w, isEm }, n) => {
      const punct = n > 0 && /^[.,;:!?…]+$/.test(w);
      return (
        <Fragment key={n}>
          {n > 0 && !punct ? " " : null}
          <span className="tr-line">
            <span className={cn("tr-word", isEm && "emph")} style={{ "--i": i++ }}>
              {w}
            </span>
          </span>
        </Fragment>
      );
    });
  return createElement(
    as,
    { ref, id, "data-tr": as === "h1" ? "blur" : "rise", "data-inview": inView, className },
    words,
  );
}

export function DrawnRule({ className }) {
  const { ref, inView } = useInView(0.5);
  return (
    <span ref={ref} aria-hidden="true" className={cn("block w-full", className)}>
      <span data-inview={inView} className="hairline hr-draw" />
    </span>
  );
}
