import Link from "next/link";
import { ArrowRight, Palette, Sparkles, Zap, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Home page with a hero section and call-to-action to the dashboard.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        {/* Logo/Icon. */}
        <div className="relative mx-auto size-20">
          <div className="flex size-full items-center justify-center rounded-2xl bg-primary/10">
            <Palette className="size-10 text-primary" aria-hidden="true" />
          </div>
          <Sparkles
            className="-top-2 -right-2 absolute size-6 text-amber-500"
            aria-hidden="true"
          />
        </div>

        {/* Heading. */}
        <div className="space-y-4">
          <h1 className="font-bold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Lunalight
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Create stunning Shopify themes with the power of AI. Describe your
            vision, and watch it come to life.
          </p>
        </div>

        {/* Features. */}
        <div className="flex flex-wrap justify-center gap-6 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-primary" aria-hidden="true" />
            AI-Powered
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            Complete Themes
          </div>
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-primary" aria-hidden="true" />
            Easy Customization
          </div>
        </div>

        {/* CTA Buttons. */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              <LogIn className="size-4" aria-hidden="true" />
              Connect Your Store
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
