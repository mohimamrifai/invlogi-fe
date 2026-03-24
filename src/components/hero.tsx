"use client";

import { ArrowRight, Calculator, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 md:grid-cols-2 md:px-12 lg:gap-16">
        <div className="space-y-4 md:space-y-5">
          <h1 className="max-w-2xl text-2xl font-semibold leading-snug tracking-tight text-zinc-900 sm:text-3xl md:text-4xl lg:text-5xl">
            {t("headline")}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-[1.0625rem]">
            {t("subheadline")}
          </p>
          <div className="flex flex-col items-stretch gap-2.5 pt-1 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "inline-flex w-max justify-center gap-2 rounded-full px-5 py-3 text-base shadow-lg sm:w-auto sm:py-6 sm:text-lg"
              )}
            >
              {t("ctaPrimary")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="relative h-[360px] w-full rounded-[2rem] border border-zinc-200 bg-white/70 p-4 shadow-2xl backdrop-blur md:block sm:h-[460px]">
          <div className="absolute inset-4 flex flex-col justify-center rounded-[1.5rem] border border-zinc-200 bg-linear-to-br from-zinc-100 via-white to-zinc-200 p-6">
          </div>
        </div>
      </div>
    </section>
  );
}
