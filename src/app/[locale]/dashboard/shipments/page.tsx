"use client";

import { useCallback, useEffect, useState } from "react";
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
import { PaginationBar } from "@/components/data-table/pagination-bar";
import { TableToolbar } from "@/components/data-table/table-toolbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, MoreHorizontal, Truck } from "lucide-react";
import { SHIPMENT_STATUS_KEYS, shipmentStatusBadgeClass, shipmentStatusLabel } from "@/lib/shipment-status";
import { downloadCustomerConsignmentNotePdf, fetchCustomerShipments } from "@/lib/customer-api";
import type { LaravelPaginated } from "@/lib/types-api";
import { ApiError } from "@/lib/api-client";
import { rowNumber } from "@/lib/list-query";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { toast } from "sonner";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type Row = Record<string, unknown>;

const PER_PAGE = 10;

const SHIPMENT_STATUS_FILTERS = [
  { value: "all", label: "Semua status" },
  ...SHIPMENT_STATUS_KEYS.map((k) => ({
    value: k,
    label: shipmentStatusLabel(k),
  })),
];

export default function CustomerShipmentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<LaravelPaginated<Row> | null>(null);
  const [totalAllShipments, setTotalAllShipments] = useState<number | null>(null);
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

  const loadStatsTotal = useCallback(async () => {
    try {
      const res = await fetchCustomerShipments({ page: 1, perPage: 1 });
      setTotalAllShipments((res as LaravelPaginated<Row>).total);
    } catch {
      setTotalAllShipments(null);
    }
  }, []);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchCustomerShipments({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch.trim() || undefined,
        status: statusParam,
      });
      const paginated = res as LaravelPaginated<Row>;
      setRows(paginated.data ?? []);
      setMeta(paginated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat shipment.");
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusParam]);

  useEffect(() => {
    void loadStatsTotal();
  }, [loadStatsTotal]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDownloadCN = async (id: number, wb: string) => {
    try {
      const blob = await downloadCustomerConsignmentNotePdf(id);
      downloadBlob(blob, `consignment-note-${wb}.pdf`);
      toast.success("Consignment Note berhasil diunduh.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal mengunduh CN.");
    }
  };

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <Truck className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">My Shipments</h1>
            <p className="mt-1 text-sm text-muted-foreground">Shipment perusahaan Anda.</p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>My Shipments</CardTitle>
          <CardDescription>
            {totalAllShipments != null && totalAllShipments > 0
              ? `Total ${totalAllShipments} shipment perusahaan Anda.`
              : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <TableToolbar
            searchPlaceholder="Cari CN atau nomor shipment…"
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
                    <TableHead>Consignment Note (CN)</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((shipment, index) => {
                    const id = Number(shipment.id);
                    const st = String(shipment.status ?? "");
                    const origin = (shipment.origin_location ?? shipment.originLocation) as
                      | { name?: string }
                      | undefined;
                    const dest = (shipment.destination_location ?? shipment.destinationLocation) as
                      | { name?: string }
                      | undefined;
                    const svc = (shipment.service_type ?? shipment.serviceType) as { name?: string } | undefined;
                    const waybill = String(shipment.waybill_number ?? shipment.shipment_number ?? "");
                    return (
                      <TableRow key={waybill || String(shipment.id)}>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {rowNumber(meta?.current_page ?? page, PER_PAGE, index)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{waybill}</TableCell>
                        <TableCell>{svc?.name ?? "—"}</TableCell>
                        <TableCell>{origin?.name ?? "—"}</TableCell>
                        <TableCell>{dest?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={shipmentStatusBadgeClass(st)}>
                            {shipmentStatusLabel(st)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => void handleDownloadCN(id, waybill)}>
                                <Download className="mr-2 h-4 w-4" />
                                Cetak Consignment Note (CN)
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
