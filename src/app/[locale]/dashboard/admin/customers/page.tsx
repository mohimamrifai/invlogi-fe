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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Building2,
  ClipboardClock,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { customerStatusBadgeClass } from "@/lib/customer-status";
import { useAuthStore } from "@/lib/store";

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

function CustomerActionsMenu({ customerId }: { customerId: string }) {
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
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            /* TODO: buka detail customer */
            void customerId;
          }}
        >
          <Eye className="h-4 w-4" />
          Detail
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            /* TODO: edit customer */
            void customerId;
          }}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          variant="destructive"
          onClick={() => {
            /* TODO: hapus customer */
            void customerId;
          }}
        >
          <Trash2 className="h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
    <div className="flex md:px-2 min-w-0 w-full flex-1 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Customer Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Perusahaan customer & aktivasi.
            </p>
          </div>
        </div>
        {canCreateOrApproveCustomer && (
          <div className="flex w-full shrink-0 sm:w-auto sm:justify-end">
            <Button className="h-9 w-full gap-1.5 px-4 sm:w-auto">
              <Plus className="h-4 w-4 shrink-0" />
              Tambah Customer
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Customer Aktif</CardDescription>
              <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-700">
                <UserCheck className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>
                {dummyCustomers.filter((c) => c.status === "Active").length}
              </span>
              <span className="text-xs font-normal text-emerald-600">
                perusahaan aktif
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Menunggu Approval</CardDescription>
              <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                <ClipboardClock className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>
                {dummyCustomers.filter((c) => c.pendingApproval).length}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                antrean persetujuan
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Total Customer</CardDescription>
              <span className="rounded-md bg-sky-100 p-1.5 text-sky-700">
                <Users className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{dummyCustomers.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                seluruh perusahaan
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Daftar Customer</CardTitle>
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
                <TableHead className={actionsHeadClass}>
                  <span className="max-md:sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyCustomers.map((cust) => (
                <TableRow key={cust.id} className="group">
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
                      variant="outline"
                      className={customerStatusBadgeClass(cust.status)}
                    >
                      {cust.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{cust.pic}</TableCell>
                  <TableCell className={cn(actionsCellClass, "p-2 text-right")}>
                    <div className="flex justify-end">
                      <CustomerActionsMenu customerId={cust.id} />
                    </div>
                  </TableCell>
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

