import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, CreditCard } from "lucide-react";

const financePicSummary = {
  unpaidInvoices: 4,
  overdueInvoices: 1,
  paymentsToday: 2,
};

const invoices = [
  { number: "INV-CP-0110", status: "Unpaid", dueDate: "20 Mar 2026", amount: "IDR 75jt" },
  { number: "INV-CP-0111", status: "Overdue", dueDate: "10 Mar 2026", amount: "IDR 55jt" },
];

const payments = [
  { ref: "MID-CP-1001", method: "Virtual Account", amount: "IDR 40jt" },
  { ref: "MID-CP-1002", method: "Bank Transfer", amount: "IDR 60jt" },
];

export function DashboardFinancePic() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Invoice Unpaid</CardDescription>
              <span className="rounded-md bg-amber-100 text-amber-700 p-1.5">
                <FileText className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {financePicSummary.unpaidInvoices}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Invoice Overdue</CardDescription>
              <span className="rounded-md bg-red-100 text-red-700 p-1.5">
                <FileText className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {financePicSummary.overdueInvoices}
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
              {financePicSummary.paymentsToday}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Perusahaan</CardTitle>
            <CardDescription>Invoice yang perlu dimonitor oleh Finance PIC.</CardDescription>
          </CardHeader>
          <CardContent>
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
                {invoices.map((invoice) => (
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

        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
            <CardDescription>Transaksi yang sudah masuk sistem pembayaran.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.ref}>
                    <TableCell className="font-mono text-xs">{payment.ref}</TableCell>
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

