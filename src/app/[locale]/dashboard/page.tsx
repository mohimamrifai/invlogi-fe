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
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const role = user?.role ?? "super_admin";

  const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

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
          <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-xl font-semibold">Dashboard tidak tersedia</h1>
            <p className="text-sm text-muted-foreground">
              Role saat ini belum memiliki tampilan dashboard khusus.
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
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {title}
          </h1>
        </div>
      </div>

      {renderDashboardByRole()}
    </div>
  );
}
