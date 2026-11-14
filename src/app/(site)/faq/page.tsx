import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { faqJsonLd, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Sourcing & Selling Equipment",
  description:
    "How Zuronix sources and sells semiconductor, data center, and industrial equipment: quotes, condition verification, shipping, payment terms, and how to list your idle equipment.",
  alternates: { canonical: "/faq" },
};

const FAQ_GROUPS: { heading: string; faqs: { question: string; answer: string }[] }[] = [
  {
    heading: "Buying & sourcing",
    faqs: [
      {
        question: "How do I request equipment?",
        answer:
          "Send the manufacturer, model or part number, quantity, and your timeline through the request form, by email, or by phone. No account is needed. We reply with what we can source, when it can ship, and at what price.",
      },
      {
        question: "How fast do you respond to a sourcing request?",
        answer:
          "Most requests get a first answer within one business day, Pacific Time. If the exact model is in our network we confirm configuration and availability with the owner before quoting; if it is not, we say so and propose the closest workable alternative.",
      },
      {
        question: "Is the equipment's condition verified?",
        answer:
          "Yes. Every listing and quote states the condition grade (new, used-tested, used-untested, refurbished, as-is, or for parts), what was actually tested and by whom, and the date availability was last confirmed with the owner. Ask for the test report on any tested item.",
      },
      {
        question: "What does a quote include?",
        answer:
          "Price and currency, unit or lot pricing, condition and test summary, physical location, lead time, and shipping options. Nothing is charged online — payment follows the documents agreed for the deal.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, we arrange freight worldwide from the equipment's stated location, including crating and export paperwork when required. The listing's location is the ship-from point.",
      },
      {
        question: "Can I inspect equipment before buying?",
        answer:
          "Yes. Inspection before purchase can be arranged directly or through a third-party inspector, under the terms agreed in the offer.",
      },
    ],
  },
  {
    heading: "Selling & listing equipment",
    faqs: [
      {
        question: "How do I list my equipment for sale?",
        answer:
          "Send a single unit through the short form, or upload a CSV/Excel inventory list. Our sourcing desk reviews it with you, agrees what can be marketed, and handles the rest — buyers, questions, and logistics.",
      },
      {
        question: "Is my inventory kept confidential?",
        answer:
          "Yes. Your file reaches our sourcing desk only. Serial numbers and original asset lists are never published, and nothing goes live until you approve it in writing.",
      },
      {
        question: "What does it cost to list equipment?",
        answer:
          "Listing and marketing are free to the seller. Zuronix earns per the agreed terms when the equipment sells — owner proceeds are settled according to collected payments and the approved agreement.",
      },
      {
        question: "What equipment do you accept?",
        answer:
          "Semiconductor manufacturing and test tools, data center servers, storage and networking, and industrial machinery such as CNC machining centers, lathes, inspection equipment, chillers, and plant support equipment.",
      },
    ],
  },
  {
    heading: "About Zuronix",
    faqs: [
      {
        question: "Who is Zuronix?",
        answer: `${SITE.name} is an industrial equipment sourcing and sales company based in Vancouver, Washington, USA. We connect buyers of semiconductor, data center, and industrial equipment with verified sources, and help owners sell idle equipment.`,
      },
      {
        question: "How can I contact Zuronix?",
        answer: `Call or text ${SITE.phone}, or email ${SITE.email} — ${SITE.hours}. The office address is ${SITE.address.street}, ${SITE.address.city}, ${SITE.address.state} ${SITE.address.zip}, USA.`,
      },
    ],
  },
];

export default function FaqPage() {
  const allFaqs = FAQ_GROUPS.flatMap((g) => g.faqs);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <script {...jsonLdScript(faqJsonLd(allFaqs))} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground/80">
            FAQ
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Frequently asked questions
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        How sourcing, selling, condition verification, and payment work at Zuronix. If your
        question isn&apos;t here, call or email — a person answers.
      </p>

      {FAQ_GROUPS.map((group) => (
        <section key={group.heading} aria-labelledby={`faq-${group.heading.replace(/\s+/g, "-")}`} className="mt-10">
          <h2
            id={`faq-${group.heading.replace(/\s+/g, "-")}`}
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {group.heading}
          </h2>
          <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {group.faqs.map((faq) => (
              <details key={faq.question} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground transition-transform group-open:rotate-90"
                  >
                    <ArrowRight className="size-4" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-12 flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Still have a question?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask directly — we answer every inquiry within one business day.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/request-equipment">Request equipment</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
