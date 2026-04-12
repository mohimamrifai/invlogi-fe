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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/data-table/pagination-bar";
import { TableToolbar } from "@/components/data-table/table-toolbar";
import { ClipboardList, Trash2 } from "lucide-react";
import {
  BOOKING_STATUS_KEYS,
  bookingStatusBadgeClass,
  bookingStatusLabelFromApi,
} from "@/lib/booking-status";
import { fetchCustomerBookings, cancelCustomerBooking } from "@/lib/customer-api";
import type { LaravelPaginated } from "@/lib/types-api";
import { ApiError } from "@/lib/api-client";
import { rowNumber } from "@/lib/list-query";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { toast } from "sonner";

type Row = Record<string, unknown>;

const PER_PAGE = 10;

const STATUS_FILTERS = [
  { value: "all", label: "Semua status" },
  ...BOOKING_STATUS_KEYS.map((k) => ({
    value: k,
    label: bookingStatusLabelFromApi(k),
  })),
];

export default function MyBookingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<LaravelPaginated<Row> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState("all");

  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [submittingCancel, setSubmittingCancel] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchCustomerBookings({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      const paginated = res as LaravelPaginated<Row>;
      setRows(paginated.data ?? []);
      setMeta(paginated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat data booking.");
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCancelRequest = async () => {
    if (!cancellingId) return;
    setSubmittingCancel(true);
    try {
      await cancelCustomerBooking(cancellingId);
      toast.success("Booking berhasil dibatalkan.");
      void load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal membatalkan booking.");
    } finally {
      setSubmittingCancel(false);
      setCancellingId(null);
    }
  };

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">My Bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Histori pemesanan kargo Anda.</p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Histori Booking</CardTitle>
          <CardDescription>Daftar semua permintaan booking yang telah Anda ajukan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <TableToolbar
            searchPlaceholder="Cari nomor booking…"
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            filterLabel="Status"
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={STATUS_FILTERS}
          />
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">No</TableHead>
                    <TableHead>Booking #</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Rute</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((booking, index) => {
                    const st = String(booking.status ?? "");
                    const origin = (booking.origin_location ?? booking.originLocation) as { name?: string; code?: string } | undefined;
                    const dest = (booking.destination_location ?? booking.destinationLocation) as { name?: string; code?: string } | undefined;
                    const svc = (booking.service_type ?? booking.serviceType) as { name?: string } | undefined;
                    const bNum = String(booking.booking_number ?? "");
                    const canCancel = st === "submitted";

                    return (
                      <TableRow key={booking.id as number}>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {rowNumber(meta?.current_page ?? page, PER_PAGE, index)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-medium">{bNum}</TableCell>
                        <TableCell className="text-xs">
                          {booking.created_at ? new Date(booking.created_at as string).toLocaleDateString("id-ID") : "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-col">
                            <span className="font-medium">{origin?.code ?? "—"}</span>
                            <span className="text-[10px] text-muted-foreground">→ {dest?.code ?? "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{svc?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={bookingStatusBadgeClass(st)}>
                            {bookingStatusLabelFromApi(st)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {canCancel && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setCancellingId(booking.id as number)}
                              title="Batalkan Booking"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {rows.length === 0 && (
                  <TableCaption className="text-xs py-4">Belum ada data booking.</TableCaption>
                )}
              </Table>
              {meta && (
                <PaginationBar
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  total={meta.total}
                  from={meta.from}
                  to={meta.to}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!cancellingId} onOpenChange={(o) => !o && setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan permintaan booking ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submittingCancel}>Kembali</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault();
                void handleCancelRequest();
              }}
              disabled={submittingCancel}
            >
              {submittingCancel ? "Membatalkan…" : "Ya, Batalkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
