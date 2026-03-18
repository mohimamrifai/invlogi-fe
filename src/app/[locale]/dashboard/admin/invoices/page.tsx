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
import { FileText, FileSpreadsheet, Download } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function AdminInvoicesPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role;

  const canManageInvoices =
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
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Invoice Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola invoice, status pembayaran, dan akses ke dokumen PDF.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManageInvoices && (
            <>
              <Button size="sm" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Generate Invoice
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
            </>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Invoice</CardTitle>
          <CardDescription>
            Data dummy invoice dengan status dan jatuh tempo untuk ilustrasi
            monitoring AR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">No. Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyInvoices.map((invoice) => (
                <TableRow key={invoice.number}>
                  <TableCell className="font-mono text-xs">
                    {invoice.number}
                  </TableCell>
                  <TableCell>{invoice.customer}</TableCell>
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
              Contoh invoice dengan status Paid, Unpaid, dan Overdue.
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
     </div>
   );
 }

const dummyInvoices = [
  {
    number: "INV-2026-0001",
    customer: "PT Nusantara Cargo",
    amount: 12500000,
    dueDate: "2026-03-25",
    status: "Unpaid",
  },
  {
    number: "INV-2026-0002",
    customer: "PT Mandiri Steel",
    amount: 8800000,
    dueDate: "2026-03-10",
    status: "Overdue",
  },
  {
    number: "INV-2026-0003",
    customer: "PT Sawit Jaya",
    amount: 15450000,
    dueDate: "2026-04-05",
    status: "Paid",
  },
];

 
