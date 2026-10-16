import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl" aria-hidden>
        🌫️
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold">This page floated away.</h1>
      <p className="mt-2 text-muted">Let&apos;s get you back somewhere real.</p>
      <Link href="/" className="mt-6 rounded-2xl bg-lavender-600 px-5 py-3 font-semibold text-white dark:bg-lavender-400 dark:text-midnight-900">
        Go home
      </Link>
    </div>
  );
}
