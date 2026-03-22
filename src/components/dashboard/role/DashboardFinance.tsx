import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, AlertTriangle, CreditCard, Wallet } from "lucide-react";

const financeSummary = {
  unpaidInvoices: 48,
  overdueInvoices: 11,
  paymentsToday: 15,
  totalArValue: "IDR 3.2M",
};

const overdueInvoices = [
  { number: "INV-2026-0012", customer: "PT Nusantara Cargo", dueDate: "10 Mar 2026", amount: "IDR 180jt" },
  { number: "INV-2026-0013", customer: "PT Mandiri Steel", dueDate: "12 Mar 2026", amount: "IDR 240jt" },
  { number: "INV-2026-0014", customer: "PT Sawit Jaya", dueDate: "14 Mar 2026", amount: "IDR 95jt" },
];

const recentPayments = [
  { ref: "MID-903411", customer: "PT Sinar Logistik", method: "Virtual Account", amount: "IDR 120jt" },
  { ref: "MID-903512", customer: "PT Mandiri Steel", method: "QRIS", amount: "IDR 80jt" },
  { ref: "MID-903633", customer: "PT Nusantara Cargo", method: "Bank Transfer", amount: "IDR 150jt" },
];

export function DashboardFinance() {
  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Invoice Belum Terbayar</CardDescription>
              <span className="rounded-md bg-amber-100 text-amber-700 p-1.5">
                <FileText className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {financeSummary.unpaidInvoices}
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
              {financeSummary.overdueInvoices}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Pembayaran Hari Ini</CardDescription>
              <span className="rounded-md bg-emerald-100 text-emerald-700 p-1.5">
                <CreditCard className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {financeSummary.paymentsToday}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Total Piutang (AR)</CardDescription>
              <span className="rounded-md bg-indigo-100 text-indigo-700 p-1.5">
                <Wallet className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {financeSummary.totalArValue}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Invoice Overdue</CardTitle>
            <CardDescription>Invoice yang melewati due date dan belum dibayar.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueInvoices.map((invoice) => (
                  <TableRow key={invoice.number}>
                    <TableCell className="font-mono text-xs">{invoice.number}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
            <CardDescription>Transaksi pembayaran yang tercatat melalui Midtrans.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.ref}>
                    <TableCell className="font-mono text-xs">{payment.ref}</TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
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

