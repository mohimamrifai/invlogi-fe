import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function LandingFooter() {
  const t = await getTranslations("Landing");

  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-12">
        <div className="max-w-md">
          <p className="text-lg font-semibold tracking-tight">{t("footerBrand")}</p>
          <p className="mt-2 text-sm text-zinc-400">{t("footerTagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link className="text-zinc-300 hover:text-white" href="/estimasi">
            {t("footerEstimasi")}
          </Link>
          <Link className="text-zinc-300 hover:text-white" href="/tracking">
            {t("footerTracking")}
          </Link>
          <Link className="text-zinc-300 hover:text-white" href="/login">
            {t("footerLogin")}
          </Link>
          <Link className="text-zinc-300 hover:text-white" href="/register">
            {t("footerRegister")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-zinc-800/80 py-4 text-center text-xs text-zinc-500">
        {t("footerRights")}
      </div>
    </footer>
  );
}
