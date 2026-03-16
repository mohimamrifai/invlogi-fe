"use client";

import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Clock3, Container, Factory, Building2, FileText, CreditCard } from "lucide-react";

const chartConfig = {
  fcl: {
    label: "Rail FCL (Full Container Load)",
    // Rail FCL sebagai layanan kontainer penuh
    color: "#0ea5e9",
  },
  lcl: {
    label: "Rail LCL (Less Container Load)",
    // Rail LCL sebagai layanan gabungan
    color: "#6366f1",
  },
} satisfies ChartConfig;

const shipmentSummary = {
  bookingsToday: 18,
  activeShipments: 54,
  rackUtilization: 82.5,
  overdueInvoices: 7,
  activeCompanies: 42,
  pendingCompanyApprovals: 5,
  unpaidInvoices: 23,
  paymentsToday: 12,
};

const recentShipments = [
  {
    id: "WB-RAIL-0001",
    customer: "PT Nusantara Cargo",
    serviceType: "Rail FCL 40ft",
    route: "Tanjung Priok → Tanjung Perak",
    status: "Train Departed",
  },
  {
    id: "WB-RAIL-0002",
    customer: "PT Mandiri Steel",
    serviceType: "Rail LCL Rack",
    route: "Tanjung Priok → Kalimas",
    status: "Stuffing Container",
  },
  {
    id: "WB-RAIL-0003",
    customer: "PT Sawit Jaya",
    serviceType: "Rail FCL 20ft",
    route: "Tanjung Perak → Kijing",
    status: "Cargo Received",
  },
  {
    id: "WB-RAIL-0004",
    customer: "PT Sinar Logistik",
    serviceType: "Rail LCL Rack",
    route: "Tanjung Priok → Gedebage",
    status: "Booking Created",
  },
];

const shipmentByService = [
  { week: "Minggu 1", fcl: 32, lcl: 18 },
  { week: "Minggu 2", fcl: 28, lcl: 24 },
  { week: "Minggu 3", fcl: 30, lcl: 26 },
  { week: "Minggu 4", fcl: 35, lcl: 29 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const roleLabel = user?.role
    ? user.role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Super Admin";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Dashboard Super Admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan operasional dan finansial.
          </p>
        </div>
        <Badge className="text-xs px-3 py-1" variant="outline">
          {roleLabel}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Booking Baru Hari Ini</CardDescription>
              <span className="rounded-md bg-emerald-100 text-emerald-700 p-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold flex flex-col gap-0.5">
              <span>{shipmentSummary.bookingsToday}</span>
              <span className="text-xs font-normal text-emerald-600">
                booking hari ini
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Shipment Rail Aktif</CardDescription>
              <span className="rounded-md bg-sky-100 text-sky-700 p-1.5">
                <Container className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold flex flex-col gap-0.5">
              <span>{shipmentSummary.activeShipments}</span>
              <span className="text-xs font-normal text-muted-foreground">
                shipment aktif
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Utilisasi Rack LCL</CardDescription>
              <span className="rounded-md bg-amber-100 text-amber-700 p-1.5">
                <Clock3 className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold flex flex-col gap-0.5">
              <span>{shipmentSummary.rackUtilization.toFixed(1)}%</span>
              <span className="text-xs font-normal text-muted-foreground">
                kapasitas terpakai
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Invoice Overdue</CardDescription>
              <span className="rounded-md bg-violet-100 text-violet-700 p-1.5">
                <Factory className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold flex flex-col gap-0.5">
              <span>{shipmentSummary.overdueInvoices}</span>
              <span className="text-xs font-normal text-muted-foreground">
                tagihan lewat jatuh tempo
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribusi Shipment Rail per Service Type</CardTitle>
            <CardDescription>
              Volume Rail Cargo per minggu (FCL vs LCL).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-64 w-full rounded-sm border border-sky-100/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-4 py-3 shadow-sm"
            >
              <BarChart data={shipmentByService}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="fcl" stackId="shipments" fill="var(--color-fcl)" />
                <Bar dataKey="lcl" stackId="shipments" fill="var(--color-lcl)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Admin Internal</CardTitle>
            <CardDescription />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-sky-100 text-sky-700 p-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="font-medium text-zinc-900">Customer Aktif</p>
                  <p className="text-xs text-muted-foreground">
                    Perusahaan aktif yang dapat melakukan booking.
                  </p>
                </div>
              </div>
              <span className="text-base font-semibold text-zinc-900">
                {shipmentSummary.activeCompanies}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-100 text-amber-700 p-1.5">
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="font-medium text-zinc-900">Permintaan Customer Pending</p>
                  <p className="text-xs text-muted-foreground">
                    Perusahaan menunggu approval admin.
                  </p>
                </div>
              </div>
              <span className="text-base font-semibold text-zinc-900">
                {shipmentSummary.pendingCompanyApprovals}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-violet-100 text-violet-700 p-1.5">
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="font-medium text-zinc-900">Invoice Belum Terbayar</p>
                  <p className="text-xs text-muted-foreground">
                    Invoice berstatus unpaid di seluruh customer.
                  </p>
                </div>
              </div>
              <span className="text-base font-semibold text-zinc-900">
                {shipmentSummary.unpaidInvoices}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-100 text-emerald-700 p-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="font-medium text-zinc-900">Pembayaran Masuk Hari Ini</p>
                  <p className="text-xs text-muted-foreground">
                    Transaksi pembayaran via Midtrans hari ini.
                  </p>
                </div>
              </div>
              <span className="text-base font-semibold text-zinc-900">
                {shipmentSummary.paymentsToday}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment Terbaru</CardTitle>
          <CardDescription>
            Shipment Rail Cargo terbaru (data dummy untuk MVP).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Shipment</TableHead>
                <TableHead>Customer</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Rute</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-xs">{shipment.id}</TableCell>
                    <TableCell>{shipment.customer}</TableCell>
                    <TableCell>{shipment.serviceType}</TableCell>
                    <TableCell>{shipment.route}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          shipment.status === "Train Departed"
                            ? "secondary"
                            : shipment.status === "Booking Created"
                            ? "outline"
                            : "default"
                        }
                      >
                        {shipment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
            <TableCaption className="text-xs">
              Data ilustratif untuk scope MVP Rail Cargo (FCL &amp; LCL).
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
