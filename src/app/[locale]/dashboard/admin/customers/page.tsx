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
import { Building2, Plus, UserPlus2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

const dummyCustomers = [
  {
    id: "CUST-0001",
    name: "PT Nusantara Cargo",
    npwp: "01.234.567.8-901.000",
    segmen: "Manufacturing",
    billingCycle: "Monthly",
    status: "Active",
    pic: "Budi Santoso",
    pendingApproval: false,
  },
  {
    id: "CUST-0002",
    name: "PT Mandiri Steel",
    npwp: "02.345.678.9-012.000",
    segmen: "Steel",
    billingCycle: "Bi-weekly",
    status: "Pending",
    pic: "Sari Putri",
    pendingApproval: true,
  },
  {
    id: "CUST-0003",
    name: "PT Sawit Jaya",
    npwp: "03.456.789.0-123.000",
    segmen: "Commodity",
    billingCycle: "Monthly",
    status: "Inactive",
    pic: "Andi Pratama",
    pendingApproval: false,
  },
];

export default function AdminCustomersPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role;

  const canCreateOrApproveCustomer =
    role === "super_admin" || role === "sales";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Customer Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola perusahaan customer, status aktivasi, dan struktur pengguna.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canCreateOrApproveCustomer && (
            <>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Tambah Customer
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <UserPlus2 className="h-3.5 w-3.5" />
                Approve Pending
              </Button>
            </>
          )}
          <Badge variant="outline" className="text-xs px-3 py-1">
            Admin • Customers
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customer Aktif</CardDescription>
            <CardTitle className="text-2xl">
              {dummyCustomers.filter((c) => c.status === "Active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Menunggu Approval</CardDescription>
            <CardTitle className="text-2xl">
              {dummyCustomers.filter((c) => c.pendingApproval).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Customer</CardDescription>
            <CardTitle className="text-2xl">{dummyCustomers.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Customer</CardTitle>
          <CardDescription>
            Data dummy perusahaan customer untuk ilustrasi layout list dan
            status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">ID</TableHead>
                <TableHead>Nama Perusahaan</TableHead>
                <TableHead>NPWP</TableHead>
                <TableHead>Segmen</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PIC Utama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyCustomers.map((cust) => (
                <TableRow key={cust.id}>
                  <TableCell className="font-mono text-xs">
                    {cust.id}
                  </TableCell>
                  <TableCell className="font-medium">{cust.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {cust.npwp}
                  </TableCell>
                  <TableCell>{cust.segmen}</TableCell>
                  <TableCell>{cust.billingCycle}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        cust.status === "Active"
                          ? "default"
                          : cust.status === "Pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {cust.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{cust.pic}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="text-xs">
              Data di atas hanya contoh. Nantinya akan terhubung ke tabel
              perusahaan di backend.
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

