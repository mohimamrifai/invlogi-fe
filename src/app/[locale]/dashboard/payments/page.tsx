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

export default function CustomerPaymentsPage() {
  const [mounted, setMounted] = useState(false);
 
   useEffect(() => {
     setMounted(true);
   }, []);
 
   if (!mounted) return null;
 
   return (
     <div className="flex flex-1 flex-col gap-6">
       <div className="flex items-center justify-between gap-4">
         <div>
           <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
             Payments
           </h1>
           <p className="mt-1 text-sm text-muted-foreground">
             Lihat riwayat pembayaran dan status transaksi untuk invoice perusahaan Anda.
           </p>
         </div>
         <Badge variant="outline" className="text-xs px-3 py-1">
           Customer • Payments
         </Badge>
       </div>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembayaran</CardTitle>
          <CardDescription>
            Data dummy transaksi pembayaran invoice milik perusahaan user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref Payment</TableHead>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyCustomerPayments.map((payment) => (
                <TableRow key={payment.ref}>
                  <TableCell className="font-mono text-xs">
                    {payment.ref}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.invoiceNumber}
                  </TableCell>
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
              Contoh transaksi Midtrans / manual untuk invoice perusahaan login.
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
     </div>
   );
 }

const dummyCustomerPayments = [
  {
    ref: "PAY-CUST-0101",
    invoiceNumber: "INV-CUST-0101",
    method: "Midtrans - VA BNI",
    amount: 5500000,
    status: "Paid",
  },
  {
    ref: "PAY-CUST-0102",
    invoiceNumber: "INV-CUST-0102",
    method: "Midtrans - Credit Card",
    amount: 3200000,
    status: "Pending",
  },
];

 
