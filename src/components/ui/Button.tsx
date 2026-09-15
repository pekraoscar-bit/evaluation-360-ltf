import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-brand-primary text-white hover:bg-brand-primary-light",
        variant === "secondary" &&
          "bg-brand-surface border border-brand-border text-foreground hover:bg-brand-border/40",
        variant === "ghost" && "text-foreground/70 hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}
