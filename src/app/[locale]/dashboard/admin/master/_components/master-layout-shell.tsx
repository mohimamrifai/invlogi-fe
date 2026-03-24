"use client";

import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";
import { Box, Layers, MapPin, PackagePlus, Plus, Settings2, Truck } from "lucide-react";

const NAV = [
  { href: "/dashboard/admin/master/locations", label: "Lokasi", Icon: MapPin },
  { href: "/dashboard/admin/master/transport-modes", label: "Moda transport", Icon: Truck },
  { href: "/dashboard/admin/master/service-types", label: "Service types", Icon: Layers },
  { href: "/dashboard/admin/master/container-types", label: "Jenis kontainer", Icon: Box },
  { href: "/dashboard/admin/master/additional-services", label: "Layanan tambahan", Icon: PackagePlus },
];

export function MasterLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();
  const roles = user?.roles ?? [];
  const canManageMaster = authHydrated && (roles.includes("super_admin") || roles.includes("operations"));

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <Settings2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Master Operational</h1>
            <p className="mt-1 text-sm text-muted-foreground">Master operasional (API admin).</p>
          </div>
        </div>
        {canManageMaster ? (
          <div className="flex w-full shrink-0 sm:w-auto sm:justify-end">
            <Button className="h-9 w-full gap-1.5 px-4 sm:w-auto" type="button" disabled>
              <Plus className="h-4 w-4 shrink-0" />
              Tambah Master Data
            </Button>
          </div>
        ) : null}
      </div>

      <nav
        className="-mx-1 flex gap-2 overflow-x-auto border-b border-border px-1 pb-3 sm:flex-wrap"
        aria-label="Master data"
      >
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
