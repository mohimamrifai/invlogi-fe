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

export default function CustomerInvoicesPage() {
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
             Invoices
           </h1>
           <p className="mt-1 text-sm text-muted-foreground">
             Lihat dan unduh invoice untuk shipment perusahaan Anda.
           </p>
         </div>
         <Badge variant="outline" className="text-xs px-3 py-1">
           Customer • Invoices
         </Badge>
       </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoices Perusahaan</CardTitle>
          <CardDescription>
            Data dummy invoice yang hanya menampilkan invoice milik perusahaan
            user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyCustomerInvoices.map((invoice) => (
                <TableRow key={invoice.number}>
                  <TableCell className="font-mono text-xs">
                    {invoice.number}
                  </TableCell>
                  <TableCell>
                    Rp {invoice.amount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "Paid"
                          ? "default"
                          : invoice.status === "Overdue"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {invoice.status}
                    </Badge>
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

const dummyCustomerInvoices = [
  {
    number: "INV-CUST-0101",
    amount: 5500000,
    dueDate: "2026-03-25",
    status: "Unpaid",
  },
  {
    number: "INV-CUST-0102",
    amount: 3200000,
    dueDate: "2026-03-10",
    status: "Overdue",
  },
  {
    number: "INV-CUST-0103",
    amount: 7800000,
    dueDate: "2026-04-05",
    status: "Paid",
  },
];

 
