"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  PlusCircle,
  Package,
  Activity,
  FileText,
  CreditCard,
  Building,
  LogOut,
  User,
  Users,
  Truck,
  Tags,
  Settings
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/routing"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";

// Menu configuration
const allMenuItems = [
  // ... (keep menu items defined outside or inside component)
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("Dashboard.menu")
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Define all possible menu items
  const allMenuItems = [
    // Common
    {
      title: t("dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["super_admin", "operations", "finance", "sales", "company_admin", "ops_pic", "finance_pic"],
    },
    
    // Internal Team - Admin/Sales
    {
      title: t("customerManagement"),
      url: "/dashboard/admin/customers",
      icon: Users,
      roles: ["super_admin", "sales", "operations", "finance"],
    },
    
    // Internal Team - Admin/Ops
    {
      title: t("bookingManagement"),
      url: "/dashboard/admin/bookings",
      icon: FileText,
      roles: ["super_admin", "operations"],
    },
    {
      title: t("shipmentManagement"),
      url: "/dashboard/admin/shipments",
      icon: Truck,
      roles: ["super_admin", "operations"],
    },
    {
      title: t("masterOperational"),
      url: "/dashboard/admin/master",
      icon: Settings,
      roles: ["super_admin", "operations"],
    },

    // Internal Team - Admin/Finance
    {
      title: t("invoiceManagement"),
      url: "/dashboard/admin/invoices",
      icon: FileText,
      roles: ["super_admin", "finance"],
    },
    {
      title: t("paymentManagement"),
      url: "/dashboard/admin/payments",
      icon: CreditCard,
      roles: ["super_admin", "finance"],
    },

    // Internal Team - Admin/Sales
    {
      title: t("vendorPricing"),
      url: "/dashboard/admin/vendor",
      icon: Tags,
      roles: ["super_admin", "sales"],
    },

    // Customer Portal - Common
    {
      title: t("createBooking"),
      url: "/dashboard/booking/create",
      icon: PlusCircle,
      roles: ["company_admin", "ops_pic"],
    },
    {
      title: t("myShipments"),
      url: "/dashboard/shipments",
      icon: Package,
      roles: ["company_admin", "ops_pic"],
    },
    {
      title: t("shipmentTracking"),
      url: "/dashboard/tracking",
      icon: Activity,
      roles: ["company_admin", "ops_pic"],
    },
    {
      title: t("invoices"),
      url: "/dashboard/invoices",
      icon: FileText,
      roles: ["company_admin", "finance_pic"],
    },
    {
      title: t("payments"),
      url: "/dashboard/payments",
      icon: CreditCard,
      roles: ["company_admin", "finance_pic"],
    },
    {
      title: t("companySettings"),
      url: "/dashboard/settings",
      icon: Building,
      roles: ["company_admin"],
    },
  ];

  const role = mounted ? user?.role : null;
  const navItems = role ? allMenuItems.filter(item => item.roles.includes(role)) : [];

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-sidebar-primary-foreground">
                  <span className="text-lg font-bold text-white">I</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">IDNVerse</span>
                  <span className="truncate text-xs">Logistics Platform</span>
                </div>
              </Link>
            } />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium px-4 mb-2">Menu</SidebarGroupLabel>
          <SidebarMenu className="gap-2 px-2">
            {navItems.map((item) => {
              let normalizedPathname = pathname
              if (normalizedPathname.startsWith("/en/") || normalizedPathname.startsWith("/id/")) {
                normalizedPathname = normalizedPathname.replace(/^\/[a-zA-Z-]+(?=\/)/, "")
              }

              const isDashboardItem = item.url === "/dashboard"
              const isActive = isDashboardItem
                ? normalizedPathname === item.url
                : normalizedPathname === item.url || normalizedPathname.startsWith(`${item.url}/`)

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    size="default"
                    className={
                      "h-9 text-sm font-medium px-3 rounded-md transition-colors " +
                      (isActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900")
                    }
                    render={
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
                  render={
                    <div className="flex w-full items-center gap-3 px-1">
                       <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
                        <span className="truncate font-semibold">{user?.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                      <User className="ml-auto size-4 shrink-0" />
                    </div>
                  }
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
