"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertTriangle, LineChart } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function AdminPaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role;

  const canManageAR =
    role === "super_admin" || role === "finance";
 
   useEffect(() => {
     setMounted(true);
   }, []);
 
   if (!mounted) return null;
 
   return (
     <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Payment / AR Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pantau pembayaran, aging piutang, dan customer yang berpotensi diblokir.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManageAR && (
            <>
              <Button size="sm" className="gap-1.5">
                <LineChart className="h-3.5 w-3.5" />
                Lihat AR Aging
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Customer Overdue
              </Button>
            </>
          )}
          <Badge variant="outline" className="text-xs px-3 py-1">
            Admin • Payments
          </Badge>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
          <CardDescription>
            Data dummy pembayaran dan aging piutang untuk ilustrasi AR
            monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">Ref Payment</TableHead>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyPayments.map((payment) => (
                <TableRow key={payment.ref}>
                  <TableCell className="font-mono text-xs">
                    {payment.ref}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.invoiceNumber}
                  </TableCell>
                  <TableCell>{payment.customer}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    Rp {payment.amount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "Paid"
                          ? "default"
                          : payment.status === "Pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="text-xs">
              Contoh transaksi Midtrans dan manual untuk ilustrasi Payment / AR
              Management.
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
     </div>
   );
 }

const dummyPayments = [
  {
    ref: "PAY-MID-0001",
    invoiceNumber: "INV-2026-0001",
    customer: "PT Nusantara Cargo",
    method: "Midtrans - VA BCA",
    amount: 12500000,
    status: "Paid",
  },
  {
    ref: "PAY-MID-0002",
    invoiceNumber: "INV-2026-0002",
    customer: "PT Mandiri Steel",
    method: "Midtrans - Credit Card",
    amount: 8800000,
    status: "Pending",
  },
  {
    ref: "PAY-MAN-0003",
    invoiceNumber: "INV-2026-0003",
    customer: "PT Sawit Jaya",
    method: "Manual Transfer",
    amount: 15450000,
    status: "Pending",
  },
];

 
