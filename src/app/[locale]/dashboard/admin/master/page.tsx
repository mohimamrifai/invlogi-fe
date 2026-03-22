"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";
import {
  Box,
  Eye,
  Layers,
  MapPin,
  MoreHorizontal,
  PackagePlus,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Truck,
} from "lucide-react";

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

const dummyLocations = [
  { code: "TPP", name: "Tanjung Priok", type: "Port / Rail Terminal" },
  { code: "TPR", name: "Tanjung Perak", type: "Port / Rail Terminal" },
  { code: "KLM", name: "Kalimas", type: "Port" },
];

const dummyTransportModes = [
  {
    code: "RAIL",
    name: "Rail Cargo",
    note: "Cakupan MVP — mudah ditambah moda lain",
  },
];

const dummyServiceTypes = [
  { code: "RAIL-FCL-20", name: "Rail FCL 20ft", category: "FCL" },
  { code: "RAIL-FCL-40", name: "Rail FCL 40ft", category: "FCL" },
  { code: "RAIL-LCL-RACK", name: "Rail LCL Rack", category: "LCL" },
];

const dummyContainerTypes = [
  { code: "20FT", name: "20ft Standard", category: "FCL" },
  { code: "40FT", name: "40ft Standard", category: "FCL" },
];

const dummyAdditionalServices = [
  { code: "PICKUP", name: "Pickup Service", group: "Pickup" },
  { code: "PACK-PALLET", name: "Palletizing", group: "Packing" },
  { code: "HANDLE-FORK", name: "Forklift Handling", group: "Handling" },
];

function MasterRowActions({
  entityLabel,
  rowCode,
  canManage,
}: {
  entityLabel: string;
  rowCode: string;
  canManage: boolean;
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
        <span className="sr-only">Menu aksi {entityLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            /* TODO: detail master */
            void rowCode;
          }}
        >
          <Eye className="h-4 w-4" />
          Lihat detail
        </DropdownMenuItem>
        {canManage ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                /* TODO: edit master */
                void rowCode;
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
              onClick={() => {
                /* TODO: hapus master */
                void rowCode;
              }}
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminMasterPage() {
  const [mounted, setMounted] = useState(false);
  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();
  const canManageMaster =
    authHydrated &&
    (user?.role === "super_admin" || user?.role === "operations");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <Settings2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Master Operational
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Master operasional rail (MVP).
            </p>
          </div>
        </div>
        {canManageMaster ? (
          <div className="flex w-full shrink-0 sm:w-auto sm:justify-end">
            <Button className="h-9 w-full gap-1.5 px-4 sm:w-auto">
              <Plus className="h-4 w-4 shrink-0" />
              Tambah Master Data
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Lokasi</CardDescription>
              <span className="rounded-md bg-sky-100 p-1.5 text-sky-700">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{dummyLocations.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                origin / destination
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Moda transport</CardDescription>
              <span className="rounded-md bg-violet-100 p-1.5 text-violet-700">
                <Truck className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{dummyTransportModes.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                rail (MVP)
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Service types</CardDescription>
              <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                <Layers className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{dummyServiceTypes.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                FCL / LCL
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Jenis kontainer</CardDescription>
              <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-700">
                <Box className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{dummyContainerTypes.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                20ft / 40ft
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Layanan tambahan</CardDescription>
              <span className="rounded-md bg-rose-100 p-1.5 text-rose-700">
                <PackagePlus className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{dummyAdditionalServices.length}</span>
              <span className="text-xs font-normal text-muted-foreground">
                pickup / packing / handling
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle>Locations</CardTitle>
            <CardDescription>
              Origin, destination & terminal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead>Nama Lokasi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className={actionsHeadClass}>
                    <span className="max-md:sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyLocations.map((loc) => (
                  <TableRow key={loc.code} className="group">
                    <TableCell className="font-mono text-xs">{loc.code}</TableCell>
                    <TableCell className="font-medium">{loc.name}</TableCell>
                    <TableCell>{loc.type}</TableCell>
                    <TableCell
                      className={cn(actionsCellClass, "p-2 text-right")}
                    >
                      <div className="flex justify-end">
                        <MasterRowActions
                          entityLabel="lokasi"
                          rowCode={loc.code}
                          canManage={canManageMaster}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs">
                Contoh master lokasi untuk rail terminal / pelabuhan.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle>Transport Modes</CardTitle>
            <CardDescription>
              MVP rail; siap moda lain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead className={actionsHeadClass}>
                    <span className="max-md:sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyTransportModes.map((m) => (
                  <TableRow key={m.code} className="group">
                    <TableCell className="font-mono text-xs">{m.code}</TableCell>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {m.note}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(actionsCellClass, "p-2 text-right")}
                    >
                      <div className="flex justify-end">
                        <MasterRowActions
                          entityLabel="moda transport"
                          rowCode={m.code}
                          canManage={canManageMaster}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs">
                Moda aktif sesuai cakupan MVP proyek.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle>Service Types</CardTitle>
            <CardDescription>
              FCL / LCL untuk booking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Kode</TableHead>
                  <TableHead>Nama Layanan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className={actionsHeadClass}>
                    <span className="max-md:sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyServiceTypes.map((svc) => (
                  <TableRow key={svc.code} className="group">
                    <TableCell className="font-mono text-xs">{svc.code}</TableCell>
                    <TableCell className="font-medium">{svc.name}</TableCell>
                    <TableCell>{svc.category}</TableCell>
                    <TableCell
                      className={cn(actionsCellClass, "p-2 text-right")}
                    >
                      <div className="flex justify-end">
                        <MasterRowActions
                          entityLabel="service type"
                          rowCode={svc.code}
                          canManage={canManageMaster}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs">
                Contoh master service (FCL, LCL, Rack) untuk pemilihan booking.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle>Container Types</CardTitle>
            <CardDescription>
              Tipe kontainer FCL (MVP).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className={actionsHeadClass}>
                    <span className="max-md:sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyContainerTypes.map((c) => (
                  <TableRow key={c.code} className="group">
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell
                      className={cn(actionsCellClass, "p-2 text-right")}
                    >
                      <div className="flex justify-end">
                        <MasterRowActions
                          entityLabel="jenis kontainer"
                          rowCode={c.code}
                          canManage={canManageMaster}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs">
                Master jenis kontainer untuk konfigurasi shipment FCL.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle>Additional Services</CardTitle>
            <CardDescription>
              Pickup, packing & handling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Grup</TableHead>
                  <TableHead className={actionsHeadClass}>
                    <span className="max-md:sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyAdditionalServices.map((s) => (
                  <TableRow key={s.code} className="group">
                    <TableCell className="font-mono text-xs">{s.code}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.group}</TableCell>
                    <TableCell
                      className={cn(actionsCellClass, "p-2 text-right")}
                    >
                      <div className="flex justify-end">
                        <MasterRowActions
                          entityLabel="layanan tambahan"
                          rowCode={s.code}
                          canManage={canManageMaster}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs">
                Contoh grup pickup, packing, dan handling.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
