"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";

export default function CompanySettingsPage() {
  const t = useTranslations("Dashboard.customer.settings");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <Settings className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              {t("title", { default: "Company Settings" })}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("description", {
                default: "Profil perusahaan & pengguna.",
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="min-w-0 overflow-hidden rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
        <p className="text-sm text-muted-foreground">
          {t("comingSoon", {
            default: "Pengaturan lanjutan profil perusahaan dan pengguna dapat ditambahkan di sini.",
          })}
        </p>
      </div>
    </div>
  );
}
