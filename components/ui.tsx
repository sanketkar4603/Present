"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { pushBackHandler } from "@/lib/native";
import { cn } from "@/lib/utils";

type Variant = "primary" | "coral" | "soft" | "ghost" | "mint" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-lavender-600 text-white shadow-[0_8px_24px_-8px_rgba(113,82,212,0.7)] hover:bg-lavender-700 dark:bg-lavender-400 dark:text-midnight-900 dark:hover:bg-lavender-300",
  coral:
    "bg-gradient-to-br from-coral-400 to-coral-500 text-white shadow-[0_10px_28px_-10px_rgba(247,109,85,0.8)] hover:brightness-105",
  mint: "bg-mint-400 text-midnight-800 hover:bg-mint-300",
  soft: "bg-surface-2 text-ink hover:bg-lavender-100 dark:hover:bg-midnight-500",
  ghost: "bg-transparent text-ink hover:bg-surface-2",
  danger: "bg-coral-600 text-white hover:bg-coral-500",
};

const SIZES = {
  sm: "h-9 px-3.5 text-sm rounded-xl gap-1.5",
  md: "h-11 px-5 text-[15px] rounded-2xl gap-2",
  lg: "h-14 px-6 text-base rounded-2xl gap-2.5",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof SIZES;
  block?: boolean;
}

export function Button({ variant = "primary", size = "md", block, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
    />
  );
}

interface LinkButtonProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: keyof typeof SIZES;
  block?: boolean;
}

export function LinkButton({ variant = "primary", size = "md", block, className, ...props }: LinkButtonProps) {
  return (
    <Link
      {...props}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition active:scale-[0.97]",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-4xl border border-line bg-surface p-5 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_12px_32px_-20px_rgba(54,40,101,0.35)] dark:shadow-[0_12px_32px_-20px_rgba(0,0,0,0.8)]",
        className,
      )}
    />
  );
}

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  emoji?: string;
}

export function Chip({ active, emoji, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-95",
        active
          ? "border-lavender-500 bg-lavender-500 text-white dark:border-lavender-300 dark:bg-lavender-300 dark:text-midnight-900"
          : "border-line bg-surface text-ink hover:border-lavender-300",
        className,
      )}
    >
      {emoji && <span aria-hidden>{emoji}</span>}
      {children}
    </button>
  );
}

export function ProgressBar({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-label={label}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-lavender-400 via-lavender-500 to-mint-400 transition-[width] duration-700"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-end justify-between gap-3 px-1">
      <h2 className="font-display text-lg font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-3 px-1 pb-2 pt-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function EmptyState({ emoji, title, body, action }: { emoji: string; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-4xl border border-dashed border-line px-6 py-10 text-center">
      <div className="mb-3 text-5xl animate-bob" aria-hidden>
        {emoji}
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  hideClose?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Callers often pass an inline onClose; keep the latest in a ref so typing in
  // the modal doesn't re-run the effect (which would steal focus every keystroke).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const close = () => closeRef.current();
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      // First control (usually Close) — focusing a text field would pop the phone keyboard.
      ref.current?.querySelector<HTMLElement>("button, [href], input, textarea, select")?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // Android back button closes the modal instead of leaving the screen.
    const offBack = pushBackHandler(close);
    return () => {
      offBack();
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="presentation">
      <div className="absolute inset-0 bg-midnight-900/50 backdrop-blur-sm animate-[rise_0.25s_ease-out]" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ paddingBottom: "calc(2rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))" }}
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-4xl border border-line bg-surface p-6 text-left text-ink shadow-2xl animate-rise sm:rounded-4xl"
      >
        {!hideClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full resize-none rounded-3xl border border-line bg-surface-2/60 p-4 text-[15px] leading-relaxed text-ink placeholder:text-muted/70 focus:border-lavender-400 focus:outline-none focus:ring-4 focus:ring-lavender-300/30",
        props.className,
      )}
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-2xl border border-line bg-surface-2/60 px-4 text-[15px] text-ink placeholder:text-muted/70 focus:border-lavender-400 focus:outline-none focus:ring-4 focus:ring-lavender-300/30",
        props.className,
      )}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked ? "bg-lavender-500 dark:bg-lavender-400" : "bg-surface-2 ring-1 ring-line",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}
