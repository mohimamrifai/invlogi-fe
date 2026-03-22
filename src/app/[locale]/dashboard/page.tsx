"use client";

import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { DashboardSuperAdmin } from "@/components/dashboard/role/DashboardSuperAdmin";
import { DashboardOperations } from "@/components/dashboard/role/DashboardOperations";
import { DashboardFinance } from "@/components/dashboard/role/DashboardFinance";
import { DashboardSales } from "@/components/dashboard/role/DashboardSales";
import { DashboardCompanyAdmin } from "@/components/dashboard/role/DashboardCompanyAdmin";
import { DashboardOpsPic } from "@/components/dashboard/role/DashboardOpsPic";
import { DashboardFinancePic } from "@/components/dashboard/role/DashboardFinancePic";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const role = user?.role ?? "super_admin";

  const renderDashboardByRole = () => {
    switch (role) {
      case "super_admin":
        return <DashboardSuperAdmin />;
      case "operations":
        return <DashboardOperations />;
      case "finance":
        return <DashboardFinance />;
      case "sales":
        return <DashboardSales />;
      case "company_admin":
        return <DashboardCompanyAdmin />;
      case "ops_pic":
        return <DashboardOpsPic />;
      case "finance_pic":
        return <DashboardFinancePic />;
      default:
        return (
          <div className="flex min-w-0 w-full flex-1 flex-col gap-4">
            <h1 className="text-xl font-semibold">Dashboard tidak tersedia</h1>
            <p className="text-sm text-muted-foreground">
              Role ini belum punya tampilan khusus.
            </p>
          </div>
        );
    }
  };

  const title =
    role === "super_admin"
      ? "Dashboard Super Admin"
      : role === "operations"
      ? "Dashboard Operations"
      : role === "finance"
      ? "Dashboard Finance"
      : role === "sales"
      ? "Dashboard Sales"
      : role === "company_admin"
      ? "Dashboard Company Admin"
      : role === "ops_pic"
      ? "Dashboard Ops PIC"
      : role === "finance_pic"
      ? "Dashboard Finance PIC"
      : "Dashboard";

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {renderDashboardByRole()}
    </div>
  );
}
