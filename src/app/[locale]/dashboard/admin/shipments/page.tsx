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
import { shipmentStatusBadgeClass } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";
import {
  Activity,
  CheckCircle2,
  Eye,
  MapPin,
  MoreHorizontal,
  PackageSearch,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

const dummyShipments = [
  {
    waybill: "WB-RAIL-0001",
    customer: "PT Nusantara Cargo",
    serviceType: "Rail FCL 40ft",
    route: "Tanjung Priok → Tanjung Perak",
    status: "In Transit",
  },
  {
    waybill: "WB-RAIL-0002",
    customer: "PT Mandiri Steel",
    serviceType: "Rail LCL Rack",
    route: "Tanjung Priok → Kalimas",
    status: "Created",
  },
  {
    waybill: "WB-RAIL-0003",
    customer: "PT Sawit Jaya",
    serviceType: "Rail FCL 20ft",
    route: "Tanjung Perak → Kijing",
    status: "Completed",
  },
];

function ShipmentActionsMenu({
  waybill,
  canUpdateShipment,
}: {
  waybill: string;
  canUpdateShipment: boolean;
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
            /* TODO: shipment details */
            void waybill;
          }}
        >
          <Eye className="h-4 w-4" />
          Lihat detail shipment
        </DropdownMenuItem>
        {canUpdateShipment ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                /* TODO: update status / timeline */
                void waybill;
              }}
            >
              <RefreshCcw className="h-4 w-4" />
              Update status
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                /* TODO: container & rack management */
                void waybill;
              }}
            >
              <MapPin className="h-4 w-4" />
              Kelola container / rack
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminShipmentsPage() {
  const [mounted, setMounted] = useState(false);
  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();
  const canUpdateShipment =
    authHydrated &&
    (user?.role === "super_admin" || user?.role === "operations");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const countCreated = dummyShipments.filter(
    (s) => s.status === "Created"
  ).length;
  const countInTransit = dummyShipments.filter(
    (s) => s.status === "In Transit"
  ).length;
  const countCompleted = dummyShipments.filter(
    (s) => s.status === "Completed"
  ).length;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <PackageSearch className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Shipment Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Shipment, status perjalanan, kontainer & rack.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Baru dibuat</CardDescription>
              <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countCreated}</span>
              <span className="text-xs font-normal text-muted-foreground">
                status Created
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Dalam perjalanan</CardDescription>
              <span className="rounded-md bg-sky-100 p-1.5 text-sky-700">
                <Activity className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countInTransit}</span>
              <span className="text-xs font-normal text-muted-foreground">
                In Transit
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Selesai</CardDescription>
              <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countCompleted}</span>
              <span className="text-xs font-normal text-emerald-600">
                Completed
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Total shipment</CardDescription>
              <span className="rounded-md bg-violet-100 p-1.5 text-violet-700">
                <PackageSearch className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{dummyShipments.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                semua shipment
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Daftar Shipment</CardTitle>
          <CardDescription>
            Status, kontainer & rack (Operations).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Waybill</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Rute</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className={actionsHeadClass}>
                  <span className="max-md:sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyShipments.map((shipment) => (
                <TableRow key={shipment.waybill} className="group">
                  <TableCell className="font-mono text-xs">
                    {shipment.waybill}
                  </TableCell>
                  <TableCell className="font-medium">
                    {shipment.customer}
                  </TableCell>
                  <TableCell>{shipment.serviceType}</TableCell>
                  <TableCell>{shipment.route}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={shipmentStatusBadgeClass(shipment.status)}
                    >
                      {shipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(actionsCellClass, "p-2 text-right")}>
                    <div className="flex justify-end">
                      <ShipmentActionsMenu
                        waybill={shipment.waybill}
                        canUpdateShipment={canUpdateShipment}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="text-xs">
              Contoh shipment dengan berbagai status perjalanan (Created, In
              Transit, Completed).
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
