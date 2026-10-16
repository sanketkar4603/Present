"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SupportResources from "@/components/SupportResources";
import { LinkButton } from "@/components/ui";

export default function Support() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-xl px-1 pb-10 pt-4">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> Back
      </button>
      <h1 className="mt-3 font-display text-3xl font-extrabold">Talk to a real person</h1>
      <p className="mt-2 text-muted">
        PRESENT is a wellness tool — it can&apos;t replace a human who can really be there for you. If things feel like too much, these services are free, confidential, and staffed by people trained for exactly this.
      </p>

      <div className="mt-6">
        <SupportResources />
      </div>

      <section className="mt-8 space-y-3 rounded-4xl border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-bold">When to reach out to a professional</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] text-muted">
          <li>Heavy feelings have stuck around for more than a couple of weeks.</li>
          <li>It&apos;s getting hard to sleep, eat, study, work, or see people.</li>
          <li>You&apos;re using something (scrolling included) to numb out more than you&apos;d like.</li>
          <li>You just want to talk to someone who knows what they&apos;re doing. That&apos;s reason enough.</li>
        </ul>
        <p className="text-sm text-muted">
          A GP or doctor, a school or uni counsellor, or your workplace EAP are good places to start. Telling one trusted person in your life is a brave, solid first step too.
        </p>
      </section>

      <LinkButton href="/exercise/grounding" variant="soft" block size="lg" className="mt-6">
        Do a grounding reset while you decide
      </LinkButton>
    </div>
  );
}
