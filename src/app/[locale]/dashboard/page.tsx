"use client";

import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { getDashboardUiRole } from "@/lib/auth-role";
import {
  fetchAdminDashboard,
  fetchCustomerDashboard,
  type AdminDashboardPayload,
  type CustomerDashboardPayload,
} from "@/lib/dashboard-api";
import { fetchCustomerShipments, fetchCustomerInvoices } from "@/lib/customer-api";
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
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminDashboardPayload | null>(null);
  const [customerSummary, setCustomerSummary] = useState<CustomerDashboardPayload | null>(null);
  const [customerShipments, setCustomerShipments] = useState<
    Array<{
      id: number;
      shipment_number?: string;
      waybill_number?: string;
      status: string;
      origin_location?: { name?: string };
      destination_location?: { name?: string };
    }>
  >([]);
  const [customerInvoices, setCustomerInvoices] = useState<
    Array<{
      invoice_number: string;
      status: string;
      due_date?: string;
      total_amount: string | number;
    }>
  >([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (user.user_type === "internal") {
          const r = await fetchAdminDashboard();
          if (!cancelled) setAdminData(r.data);
        } else {
          const [d, shipRes, invRes] = await Promise.all([
            fetchCustomerDashboard(),
            fetchCustomerShipments(5),
            fetchCustomerInvoices(5),
          ]);
          if (!cancelled) {
            setCustomerSummary(d.data);
            setCustomerShipments((shipRes.data as unknown[]) as typeof customerShipments);
            setCustomerInvoices((invRes.data as unknown[]) as typeof customerInvoices);
          }
        }
      } catch {
        if (!cancelled) {
          setAdminData(null);
          setCustomerSummary(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!mounted) return null;

  const uiRole = getDashboardUiRole(user);
  const effectiveRole = uiRole === "internal_other" ? "operations" : uiRole;

  const renderDashboardByRole = () => {
    const adminProps = { data: adminData, loading };
    const customerProps = {
      summary: customerSummary,
      shipments: customerShipments,
      invoices: customerInvoices,
      loading,
    };

    switch (effectiveRole) {
      case "super_admin":
        return <DashboardSuperAdmin {...adminProps} />;
      case "operations":
        return <DashboardOperations {...adminProps} />;
      case "finance":
        return <DashboardFinance {...adminProps} />;
      case "sales":
        return <DashboardSales {...adminProps} />;
      case "company_admin":
        return <DashboardCompanyAdmin {...customerProps} />;
      case "ops_pic":
        return <DashboardOpsPic {...customerProps} />;
      case "finance_pic":
        return <DashboardFinancePic {...customerProps} />;
      default:
        return (
          <div className="flex min-w-0 w-full flex-1 flex-col gap-4">
            <h1 className="text-xl font-semibold">Dashboard tidak tersedia</h1>
            <p className="text-sm text-muted-foreground">Role tidak dikenali.</p>
          </div>
        );
    }
  };

  const title =
    effectiveRole === "super_admin"
      ? "Dashboard Super Admin"
      : effectiveRole === "operations"
        ? "Dashboard Operations"
        : effectiveRole === "finance"
          ? "Dashboard Finance"
          : effectiveRole === "sales"
            ? "Dashboard Sales"
            : effectiveRole === "company_admin"
              ? "Dashboard Company Admin"
              : effectiveRole === "ops_pic"
                ? "Dashboard Ops PIC"
                : effectiveRole === "finance_pic"
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
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{title}</h1>
          </div>
        </div>
      </div>

      {renderDashboardByRole()}
    </div>
  );
}
