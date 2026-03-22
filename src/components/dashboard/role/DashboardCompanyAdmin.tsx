import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Truck, CreditCard, AlertTriangle } from "lucide-react";

const companySummary = {
  activeBookings: 5,
  activeShipments: 12,
  unpaidInvoices: 6,
  overdueInvoices: 2,
};

const companyShipments = [
  { id: "WB-RAIL-0011", route: "Tanjung Priok → Kalimas", status: "Train Departed" },
  { id: "WB-RAIL-0012", route: "Tanjung Priok → Gedebage", status: "Stuffing Container" },
  { id: "WB-RAIL-0013", route: "Tanjung Perak → Kijing", status: "Cargo Received" },
];

const companyInvoices = [
  { number: "INV-CP-0008", status: "Unpaid", dueDate: "18 Mar 2026", amount: "IDR 120jt" },
  { number: "INV-CP-0009", status: "Overdue", dueDate: "10 Mar 2026", amount: "IDR 95jt" },
];

export function DashboardCompanyAdmin() {
  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Booking Aktif</CardDescription>
              <span className="rounded-md bg-emerald-100 text-emerald-700 p-1.5">
                <FileText className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {companySummary.activeBookings}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Shipment Aktif</CardDescription>
              <span className="rounded-md bg-sky-100 text-sky-700 p-1.5">
                <Truck className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {companySummary.activeShipments}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Invoice Unpaid</CardDescription>
              <span className="rounded-md bg-amber-100 text-amber-700 p-1.5">
                <CreditCard className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {companySummary.unpaidInvoices}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Invoice Overdue</CardDescription>
              <span className="rounded-md bg-red-100 text-red-700 p-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {companySummary.overdueInvoices}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Terbaru</CardTitle>
            <CardDescription>Pengiriman perusahaan yang sedang berjalan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Shipment</TableHead>
                  <TableHead>Rute</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-xs">{shipment.id}</TableCell>
                    <TableCell>{shipment.route}</TableCell>
                    <TableCell>{shipment.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Status Invoice</CardTitle>
            <CardDescription>Ringkasan invoice penting untuk perusahaan ini.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyInvoices.map((invoice) => (
                  <TableRow key={invoice.number}>
                    <TableCell className="font-mono text-xs">{invoice.number}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

