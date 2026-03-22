"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoiceStatusBadgeClass } from "@/lib/invoice-status";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Receipt,
} from "lucide-react";

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

const dummyCustomerInvoices = [
  {
    number: "INV-CUST-0101",
    shipmentRef: "WB-RAIL-0001",
    amount: 5_500_000,
    dueDate: "2026-03-25",
    status: "Unpaid",
  },
  {
    number: "INV-CUST-0102",
    shipmentRef: "WB-RAIL-0002",
    amount: 3_200_000,
    dueDate: "2026-03-10",
    status: "Overdue",
  },
  {
    number: "INV-CUST-0103",
    shipmentRef: "WB-RAIL-0003",
    amount: 7_800_000,
    dueDate: "2026-04-05",
    status: "Paid",
  },
];

function InvoiceActionsMenu({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "shrink-0"
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Menu aksi</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            /* TODO: detail invoice */
            void invoiceNumber;
          }}
        >
          <Eye className="h-4 w-4" />
          Lihat detail
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            /* TODO: unduh PDF invoice */
            void invoiceNumber;
          }}
        >
          <Download className="h-4 w-4" />
          Unduh PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CustomerInvoicesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const countUnpaid = dummyCustomerInvoices.filter(
    (i) => i.status === "Unpaid"
  ).length;
  const countOverdue = dummyCustomerInvoices.filter(
    (i) => i.status === "Overdue"
  ).length;
  const countPaid = dummyCustomerInvoices.filter(
    (i) => i.status === "Paid"
  ).length;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Invoices
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Invoice perusahaan Anda per shipment.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Belum dibayar</CardDescription>
              <span className="rounded-md bg-sky-100 p-1.5 text-sky-700">
                <Receipt className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countUnpaid}</span>
              <span className="text-xs font-normal text-muted-foreground">
                Unpaid
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Lewat jatuh tempo</CardDescription>
              <span className="rounded-md bg-red-100 p-1.5 text-red-700">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countOverdue}</span>
              <span className="text-xs font-normal text-muted-foreground">
                Overdue
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Lunas</CardDescription>
              <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countPaid}</span>
              <span className="text-xs font-normal text-emerald-600">Paid</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Total invoice</CardDescription>
              <span className="rounded-md bg-violet-100 p-1.5 text-violet-700">
                <FileText className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{dummyCustomerInvoices.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                perusahaan Anda
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Invoices perusahaan</CardTitle>
          <CardDescription>
            Satu perusahaan; satu invoice per shipment; unduh PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">No. Invoice</TableHead>
                <TableHead className="min-w-[100px]">Shipment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className={actionsHeadClass}>
                  <span className="max-md:sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyCustomerInvoices.map((invoice) => (
                <TableRow key={invoice.number} className="group">
                  <TableCell className="font-mono text-xs">
                    {invoice.number}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {invoice.shipmentRef}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    Rp {invoice.amount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={invoiceStatusBadgeClass(invoice.status)}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(actionsCellClass, "p-2 text-right")}>
                    <div className="flex justify-end">
                      <InvoiceActionsMenu invoiceNumber={invoice.number} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="text-xs">
              Contoh invoice milik perusahaan login (scope ke 1 company).
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
