import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-part text-sm font-semibold uppercase tracking-wider text-primary">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          The link may be old or mistyped. The equipment you&apos;re looking for can still be
          sourced — tell us what you need.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/request-equipment">Request equipment</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
