import type { AuthUser } from "./auth-api";
import { getDashboardUiRole, isCustomerUser, isInternalUser } from "./auth-role";

/**
 * Definisi item sidebar + aturan akses rute (satu sumber kebenaran).
 * `menuKey` = kunci di namespace next-intl `Dashboard.menu`.
 */
export const DASHBOARD_SIDEBAR_ITEM_DEFS = [
  {
    menuKey: "dashboard",
    url: "/dashboard",
    roles: [
      "super_admin",
      "operations",
      "finance",
      "sales",
      "company_admin",
      "ops_pic",
      "finance_pic",
    ] as const,
  },
  {
    menuKey: "customerManagement",
    url: "/dashboard/admin/customers",
    roles: ["super_admin", "sales", "operations", "finance"] as const,
  },
  {
    menuKey: "bookingManagement",
    url: "/dashboard/admin/bookings",
    roles: ["super_admin", "operations"] as const,
  },
  {
    menuKey: "shipmentManagement",
    url: "/dashboard/admin/shipments",
    roles: ["super_admin", "operations"] as const,
  },
  {
    menuKey: "masterOperational",
    url: "/dashboard/admin/master",
    roles: ["super_admin", "operations"] as const,
  },
  {
    menuKey: "invoiceManagement",
    url: "/dashboard/admin/invoices",
    roles: ["super_admin", "finance"] as const,
  },
  {
    menuKey: "paymentManagement",
    url: "/dashboard/admin/payments",
    roles: ["super_admin", "finance"] as const,
  },
  {
    menuKey: "vendorPricing",
    url: "/dashboard/admin/vendor",
    roles: ["super_admin", "sales"] as const,
  },
  {
    menuKey: "internalUsers",
    url: "/dashboard/admin/users",
    roles: ["super_admin"] as const,
  },
  {
    menuKey: "createBooking",
    url: "/dashboard/booking/create",
    roles: ["company_admin", "ops_pic"] as const,
  },
  {
    menuKey: "myShipments",
    url: "/dashboard/shipments",
    roles: ["company_admin", "ops_pic"] as const,
  },
  {
    menuKey: "shipmentTracking",
    url: "/dashboard/tracking",
    roles: ["company_admin", "ops_pic"] as const,
  },
  {
    menuKey: "invoices",
    url: "/dashboard/invoices",
    roles: ["company_admin", "finance_pic"] as const,
  },
  {
    menuKey: "payments",
    url: "/dashboard/payments",
    roles: ["company_admin", "finance_pic"] as const,
  },
  {
    menuKey: "companySettings",
    url: "/dashboard/settings",
    roles: ["company_admin"] as const,
  },
] as const;

export type DashboardMenuKey = (typeof DASHBOARD_SIDEBAR_ITEM_DEFS)[number]["menuKey"];

export const ADMIN_DASHBOARD_PREFIX = "/dashboard/admin";

/** Hilangkan prefix locale jika ada (/id/dashboard → /dashboard). */
export function normalizeDashboardPathname(pathname: string): string {
  let p = pathname;
  if (p.startsWith("/en/") || p.startsWith("/id/")) {
    p = p.replace(/^\/[a-zA-Z-]+(?=\/)/, "");
  }
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p;
}

function effectiveMenuRole(user: AuthUser | null): string | null {
  const ui = getDashboardUiRole(user);
  if (ui == null) return null;
  return ui === "internal_other" ? "operations" : ui;
}

type AccessResult = { redirectTo: string } | null;

/**
 * Jika akses ditolak, kembalikan { redirectTo: "/dashboard" }.
 * `user` harus sudah terisi (dipanggil setelah auth gate).
 */
export function evaluateDashboardPathAccess(user: AuthUser, pathname: string): AccessResult {
  const path = normalizeDashboardPathname(pathname);

  if (path === "/dashboard") {
    return null;
  }

  if (path.startsWith(`${ADMIN_DASHBOARD_PREFIX}/`) || path === ADMIN_DASHBOARD_PREFIX) {
    if (!isInternalUser(user)) {
      return { redirectTo: "/dashboard" };
    }
    return null;
  }

  const menuRole = effectiveMenuRole(user);
  if (!menuRole) {
    return { redirectTo: "/dashboard" };
  }

  const defs = [...DASHBOARD_SIDEBAR_ITEM_DEFS].sort((a, b) => b.url.length - a.url.length);

  for (const def of defs) {
    if (def.url === "/dashboard") continue;
    if (def.url.startsWith(ADMIN_DASHBOARD_PREFIX)) continue;

    const isThisRoute = path === def.url || path.startsWith(`${def.url}/`);
    if (!isThisRoute) continue;

    if (isInternalUser(user)) {
      return { redirectTo: "/dashboard" };
    }

    if (!isCustomerUser(user)) {
      return { redirectTo: "/dashboard" };
    }

    const allowedRoles = def.roles as readonly string[];
    if (!allowedRoles.includes(menuRole)) {
      return { redirectTo: "/dashboard" };
    }

    return null;
  }

  return null;
}
