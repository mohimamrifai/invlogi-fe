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
import { useAuthStore } from "@/lib/store";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

const dummyPayments = [
  {
    ref: "PAY-MID-0001",
    invoiceNumber: "INV-2026-0001",
    customer: "PT Nusantara Cargo",
    method: "Midtrans - VA BCA",
    amount: 12_500_000,
    status: "Paid",
  },
  {
    ref: "PAY-MID-0002",
    invoiceNumber: "INV-2026-0002",
    customer: "PT Mandiri Steel",
    method: "Midtrans - Credit Card",
    amount: 8_800_000,
    status: "Pending",
  },
  {
    ref: "PAY-MAN-0003",
    invoiceNumber: "INV-2026-0003",
    customer: "PT Sawit Jaya",
    method: "Manual Transfer",
    amount: 15_450_000,
    status: "Pending",
  },
  {
    ref: "PAY-MID-0004",
    invoiceNumber: "INV-2026-0004",
    customer: "PT Sinar Logistik",
    method: "Midtrans - VA Mandiri",
    amount: 9_900_000,
    status: "Failed",
  },
];

function AdminPaymentActionsMenu({
  paymentRef,
  canManageAR,
}: {
  paymentRef: string;
  canManageAR: boolean;
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
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            /* TODO: detail pembayaran */
            void paymentRef;
          }}
        >
          <Eye className="h-4 w-4" />
          Lihat detail pembayaran
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            /* TODO: unduh bukti / receipt */
            void paymentRef;
          }}
        >
          <Download className="h-4 w-4" />
          Unduh bukti
        </DropdownMenuItem>
        {canManageAR ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                /* TODO: sync status Midtrans */
                void paymentRef;
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh status Midtrans
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                /* TODO: verifikasi manual settlement */
                void paymentRef;
              }}
            >
              <CreditCard className="h-4 w-4" />
              Verifikasi manual
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminPaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();
  const canManageAR =
    authHydrated &&
    (user?.role === "super_admin" || user?.role === "finance");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const countPaid = dummyPayments.filter((p) => p.status === "Paid").length;
  const countPending = dummyPayments.filter(
    (p) => p.status === "Pending"
  ).length;
  const countFailed = dummyPayments.filter(
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
              Payment / AR Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pembayaran, Midtrans, dan piutang semua customer.
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
              <span>{dummyPayments.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                semua customer
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Daftar pembayaran</CardTitle>
          <CardDescription>
            Semua customer — Midtrans & verifikasi Finance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">Ref payment</TableHead>
                <TableHead className="w-[130px]">No. invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className={actionsHeadClass}>
                  <span className="max-md:sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyPayments.map((payment) => (
                <TableRow key={payment.ref} className="group">
                  <TableCell className="font-mono text-xs">{payment.ref}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.invoiceNumber}
                  </TableCell>
                  <TableCell className="font-medium">{payment.customer}</TableCell>
                  <TableCell className="max-w-[180px] wrap-break-word">
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
                      <AdminPaymentActionsMenu
                        paymentRef={payment.ref}
                        canManageAR={canManageAR}
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
