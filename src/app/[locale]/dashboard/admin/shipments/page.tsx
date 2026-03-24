"use client";

import { useCallback, useEffect, useState } from "react";
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
import { PaginationBar } from "@/components/data-table/pagination-bar";
import { TableToolbar } from "@/components/data-table/table-toolbar";
import { SHIPMENT_STATUS_KEYS, shipmentStatusBadgeClass, shipmentStatusLabel } from "@/lib/shipment-status";
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
import { fetchAdminShipments } from "@/lib/admin-api";
import type { LaravelPaginated } from "@/lib/types-api";
import { ApiError } from "@/lib/api-client";
import { rowNumber } from "@/lib/list-query";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const PER_PAGE = 10;
const STATS_CAP = 1000;

const SHIPMENT_STATUS_FILTERS = [
  { value: "all", label: "Semua status" },
  ...SHIPMENT_STATUS_KEYS.map((k) => ({
    value: k,
    label: shipmentStatusLabel(k),
  })),
];

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

type ShipRow = Record<string, unknown>;

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
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0")}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Menu aksi</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem className="cursor-pointer" onClick={() => window.alert(`Shipment ${waybill}`)}>
          <Eye className="h-4 w-4" />
          Lihat detail shipment
        </DropdownMenuItem>
        {canUpdateShipment ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" disabled>
              <RefreshCcw className="h-4 w-4" />
              Update status
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" disabled>
              <MapPin className="h-4 w-4" />
              Kelola container / rack
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function isInTransitStatus(st: string): boolean {
  const k = st.toLowerCase();
  return ["departed", "arrived", "unloading"].includes(k);
}

export default function AdminShipmentsPage() {
  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();
  const roles = user?.roles ?? [];
  const canUpdateShipment =
    authHydrated && (roles.includes("super_admin") || roles.includes("operations"));

  const [rows, setRows] = useState<ShipRow[]>([]);
  const [statsRows, setStatsRows] = useState<ShipRow[]>([]);
  const [statsMeta, setStatsMeta] = useState<LaravelPaginated<ShipRow> | null>(null);
  const [meta, setMeta] = useState<LaravelPaginated<ShipRow> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const statusParam = statusFilter === "all" ? undefined : statusFilter;

  const loadStats = useCallback(async () => {
    if (!authHydrated) return;
    try {
      const res = await fetchAdminShipments({
        page: 1,
        perPage: STATS_CAP,
      });
      const paginated = res as LaravelPaginated<ShipRow>;
      setStatsRows(paginated.data ?? []);
      setStatsMeta(paginated);
    } catch {
      setStatsRows([]);
      setStatsMeta(null);
    }
  }, [authHydrated]);

  const load = useCallback(async () => {
    if (!authHydrated) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetchAdminShipments({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch.trim() || undefined,
        status: statusParam,
      });
      const paginated = res as LaravelPaginated<ShipRow>;
      setRows(paginated.data ?? []);
      setMeta(paginated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat shipment.");
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [authHydrated, page, debouncedSearch, statusParam]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const countCreated = statsRows.filter((s) => String(s.status).toLowerCase() === "created").length;
  const countInTransit = statsRows.filter((s) => isInTransitStatus(String(s.status))).length;
  const countCompleted = statsRows.filter((s) => String(s.status).toLowerCase() === "completed").length;
  const totalStats = statsMeta?.total ?? 0;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <PackageSearch className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Shipment Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Shipment, status perjalanan, kontainer & rack.</p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      ) : null}

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
              <span className="text-xs font-normal text-muted-foreground">status created</span>
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
              <span className="text-xs font-normal text-muted-foreground">departed / arrived / unloading</span>
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
              <span className="text-xs font-normal text-emerald-600">completed</span>
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
              <span>{totalStats}</span>
              <span className="text-xs font-normal text-muted-foreground">semua shipment</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Daftar Shipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchPlaceholder="Cari waybill atau nomor shipment…"
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            filterLabel="Status"
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={SHIPMENT_STATUS_FILTERS}
          />
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">No</TableHead>
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
                  {rows.map((shipment, index) => {
                    const st = String(shipment.status ?? "");
                    const company = (shipment.company ?? shipment.Company) as { name?: string } | undefined;
                    const origin = (shipment.origin_location ?? shipment.originLocation) as { name?: string } | undefined;
                    const dest = (shipment.destination_location ?? shipment.destinationLocation) as
                      | { name?: string }
                      | undefined;
                    const svc = (shipment.service_type ?? shipment.serviceType) as { name?: string } | undefined;
                    const wb = String(shipment.waybill_number ?? shipment.shipment_number ?? "");
                    const route = [origin?.name, dest?.name].filter(Boolean).join(" → ") || "—";
                    return (
                      <TableRow key={wb || String(shipment.id)} className="group">
                        <TableCell className="tabular-nums text-muted-foreground">
                          {rowNumber(meta?.current_page ?? page, PER_PAGE, index)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{wb}</TableCell>
                        <TableCell className="font-medium">{company?.name ?? "—"}</TableCell>
                        <TableCell>{svc?.name ?? "—"}</TableCell>
                        <TableCell>{route}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={shipmentStatusBadgeClass(st)}>
                            {shipmentStatusLabel(st)}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(actionsCellClass, "p-2 text-right")}>
                          <div className="flex justify-end">
                            <ShipmentActionsMenu waybill={wb} canUpdateShipment={canUpdateShipment} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {rows.length === 0 ? (
                  <TableCaption className="text-xs">Belum ada shipment.</TableCaption>
                ) : (
                  <TableCaption className="text-xs">Baris pada halaman ini.</TableCaption>
                )}
              </Table>
              {meta ? (
                <PaginationBar
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  total={meta.total}
                  from={meta.from}
                  to={meta.to}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
