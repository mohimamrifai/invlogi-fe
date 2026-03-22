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
import { paymentStatusBadgeClass } from "@/lib/payment-status";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  MoreHorizontal,
  Wallet,
} from "lucide-react";

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

const dummyCustomerPayments = [
  {
    ref: "PAY-CUST-0101",
    invoiceNumber: "INV-CUST-0101",
    method: "Midtrans - VA BNI",
    amount: 5_500_000,
    status: "Paid",
  },
  {
    ref: "PAY-CUST-0102",
    invoiceNumber: "INV-CUST-0102",
    method: "Midtrans - Credit Card",
    amount: 3_200_000,
    status: "Pending",
  },
  {
    ref: "PAY-CUST-0103",
    invoiceNumber: "INV-CUST-0103",
    method: "Midtrans - QRIS",
    amount: 7_800_000,
    status: "Failed",
  },
];

function CustomerPaymentActionsMenu({
  paymentRef,
  status,
}: {
  paymentRef: string;
  status: string;
}) {
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
            /* TODO: detail pembayaran */
            void paymentRef;
          }}
        >
          <Eye className="h-4 w-4" />
          Lihat detail
        </DropdownMenuItem>
        {status === "Paid" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                /* TODO: unduh bukti bayar */
                void paymentRef;
              }}
            >
              <Download className="h-4 w-4" />
              Unduh bukti
            </DropdownMenuItem>
          </>
        ) : null}
        {status === "Pending" || status === "Failed" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                /* TODO: lanjutkan / ulang pembayaran Midtrans */
                void paymentRef;
              }}
            >
              <Wallet className="h-4 w-4" />
              Bayar / coba lagi
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CustomerPaymentsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const countPaid = dummyCustomerPayments.filter(
    (p) => p.status === "Paid"
  ).length;
  const countPending = dummyCustomerPayments.filter(
    (p) => p.status === "Pending"
  ).length;
  const countFailed = dummyCustomerPayments.filter(
    (p) => p.status === "Failed"
  ).length;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Payments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Riwayat pembayaran invoice perusahaan Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Berhasil</CardDescription>
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
              <CardDescription>Menunggu</CardDescription>
              <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                <Clock className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countPending}</span>
              <span className="text-xs font-normal text-muted-foreground">
                Pending
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Gagal</CardDescription>
              <span className="rounded-md bg-red-100 p-1.5 text-red-700">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countFailed}</span>
              <span className="text-xs font-normal text-muted-foreground">
                Failed
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Total transaksi</CardDescription>
              <span className="rounded-md bg-violet-100 p-1.5 text-violet-700">
                <CreditCard className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{dummyCustomerPayments.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                perusahaan Anda
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Riwayat pembayaran</CardTitle>
          <CardDescription>
            Transaksi Midtrans untuk invoice perusahaan Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">Ref payment</TableHead>
                <TableHead className="w-[130px]">No. invoice</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className={actionsHeadClass}>
                  <span className="max-md:sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyCustomerPayments.map((payment) => (
                <TableRow key={payment.ref} className="group">
                  <TableCell className="font-mono text-xs">{payment.ref}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.invoiceNumber}
                  </TableCell>
                  <TableCell className="max-w-[200px] wrap-break-word">
                    {payment.method}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    Rp {payment.amount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={paymentStatusBadgeClass(payment.status)}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(actionsCellClass, "p-2 text-right")}>
                    <div className="flex justify-end">
                      <CustomerPaymentActionsMenu
                        paymentRef={payment.ref}
                        status={payment.status}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="text-xs">
              Data contoh (Midtrans & manual).
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
