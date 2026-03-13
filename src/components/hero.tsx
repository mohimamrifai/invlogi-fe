import { ArrowRight, ChartLine, ShieldCheck, TrainFront, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden pt-28 pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-16 right-10 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-12 lg:gap-16">
        <div className="space-y-7">
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            {t("headline")}
          </h1>
          <p className="md:text-xl">{t("subheadline")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" className="rounded-full py-6 px-8 text-lg shadow-lg">
              {t("cta")}
              <ArrowRight className="size-4" />
            </Button>
          </div>

        </div>
        <div className="relative h-[360px] w-full rounded-[2rem] border border-zinc-200 bg-white/70 p-4 shadow-2xl backdrop-blur sm:h-[460px]">
          <div className="absolute inset-4 rounded-[1.5rem] border border-zinc-200 bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400" />
        </div>
      </div>
    </section>
  );
}
