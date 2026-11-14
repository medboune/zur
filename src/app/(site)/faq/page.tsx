import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { faqJsonLd, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ — Buying and Selling Equipment with Zuronix",
  description:
    "How buying from Zuronix works: quotes, condition grades, photos and test results, warranty cover, payment by wire, worldwide shipping and export — and how to sell surplus equipment.",
  alternates: { canonical: "/faq" },
};

const FAQ_GROUPS: { heading: string; faqs: { question: string; answer: string }[] }[] = [
  {
    heading: "Buying from Zuronix",
    faqs: [
      {
        question: "Is Zuronix a supplier or a broker?",
        answer:
          "A supplier. When you buy, you buy from Zuronix: the quote, the contract and the invoice are ours, and so is the responsibility for delivering what was quoted. We do not introduce you to a third party and leave you to deal with them. Equipment comes from our available inventory or is sourced to order through our supply network.",
      },
      {
        question: "How do I get a quote?",
        answer:
          "Send the manufacturer, model or part number, quantity and your timeline through the quote form, by email or by phone — or press Make offer on any listing. No account is needed. You can also send a bill of materials with several lines.",
      },
      {
        question: "How fast do you reply?",
        answer:
          "Most requests get a firm quote or a clear answer within one business day, Pacific Time. If we cannot supply the exact model, we say so and propose the closest workable alternative.",
      },
      {
        question: "How do I check the status of my request?",
        answer:
          "Every request gets a reference number on screen and by email. Enter it with the email you used on the Track a request page (zuronix.com/track) to see whether it is received, under review, or has an offer — no account needed.",
      },
      {
        question: "Is the equipment's condition verified?",
        answer:
          "Yes. Every listing and quote states the condition grade (new, used-tested, used-untested, refurbished, as-is, or for parts), what was actually tested, and the date availability was last confirmed. Before you pay, we share photos and serial numbers of the unit you are buying, and test results wherever a test applies.",
      },
      {
        question: "Is there a warranty?",
        answer:
          "Every quote states the warranty or dead-on-arrival cover that applies to that unit, in writing, before you commit. Cover depends on the condition grade — as-is and for-parts items are sold without an operational warranty.",
      },
      {
        question: "What does a quote include?",
        answer:
          "Price and currency, unit or lot pricing, condition grade and test summary, warranty cover, lead time and shipping options. Quotes are firm for the validity period stated on them. Nothing is charged online.",
      },
      {
        question: "How do I pay, and is it safe?",
        answer:
          "By bank wire to Zuronix's US business account, against our invoice. Before your first payment we confirm the bank details with you by phone. We never change bank details by email — if you ever receive such a message, call us before sending anything.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes. We arrange packing, crating and freight worldwide, and prepare the export paperwork. As a US exporter we screen every order against US export restrictions, so we may ask who the end user is and where the equipment will be installed.",
      },
      {
        question: "Can I inspect equipment before buying?",
        answer:
          "Yes. Inspection before purchase can be arranged directly or through a third-party inspector, under the terms agreed in the offer.",
      },
    ],
  },
  {
    heading: "Selling surplus equipment",
    faqs: [
      {
        question: "How do I sell surplus equipment to Zuronix?",
        answer:
          "Send a single unit through the short form, or upload a CSV/Excel inventory list. We review it with you, agree the terms in writing, and handle the rest — buyers, payment and logistics.",
      },
      {
        question: "Is my inventory kept confidential?",
        answer:
          "Yes. Your file goes to our team only. Serial numbers and original asset lists are never published, and nothing is offered to buyers until you approve it in writing.",
      },
      {
        question: "What does it cost to sell through Zuronix?",
        answer:
          "Nothing up front. Zuronix earns when the equipment sells, under the terms agreed with you in writing, and you are paid as that agreement sets out.",
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
        answer: `${SITE.name} is a US supplier of data center hardware, semiconductor equipment and industrial machinery, based in Vancouver, Washington. We supply GPUs, servers, networking, wafer test and probe tools, CNC machines, robots and power equipment — from available inventory or sourced to order — and help companies sell the surplus equipment they no longer need.`,
      },
      {
        question: "Are you an authorized reseller of the brands you sell?",
        answer:
          "Zuronix is an independent supplier. We are not affiliated with, or an authorized reseller of, the manufacturers whose equipment we supply unless a listing says otherwise. Each quote states the condition grade and the warranty cover Zuronix provides.",
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
            <Link href="/request-equipment">Request a quote</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
