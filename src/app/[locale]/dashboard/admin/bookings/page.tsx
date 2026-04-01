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
import { bookingStatusBadgeClass, bookingStatusLabelFromApi } from "@/lib/booking-status";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";
import {
  approveBooking,
  convertBookingToShipment,
  fetchAdminBooking,
  fetchAdminBookings,
  rejectBooking,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { rowNumber } from "@/lib/list-query";
import type { LaravelPaginated } from "@/lib/types-api";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import {
  ArrowRightLeft,
  CheckCircle2,
  ClipboardClock,
  ClipboardList,
  Eye,
  FilePenLine,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PER_PAGE = 10;
const STATS_CAP = 1000;

const BOOKING_STATUS_FILTERS = [
  { value: "all", label: "Semua status" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Diajukan" },
  { value: "confirmed", label: "Terkonfirmasi" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "cancelled", label: "Dibatalkan" },
];

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

type BookingRow = {
  id: number;
  booking_number: string;
  status: string;
  company?: { name?: string };
  origin_location?: { name?: string };
  destination_location?: { name?: string };
  service_type?: { name?: string; code?: string };
};

function BookingActionsMenu({
  booking,
  canProcessOperations,
  onOpenDetail,
  onOpenReject,
  onDone,
}: {
  booking: BookingRow;
  canProcessOperations: boolean;
  onOpenDetail: (id: number) => void;
  onOpenReject: (id: number) => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const st = booking.status.toLowerCase();
  const showApproveReject =
    canProcessOperations && (st === "submitted" || st === "confirmed");
  const showConvert = canProcessOperations && st === "approved";
  const showOpsDivider = showApproveReject || showConvert;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0")}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Menu aksi</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem className="cursor-pointer" onClick={() => onOpenDetail(booking.id)}>
          <Eye className="h-4 w-4" />
          Lihat detail
        </DropdownMenuItem>
        {showOpsDivider ? <DropdownMenuSeparator /> : null}
        {showApproveReject ? (
          <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={async () => {
                    try {
                      await approveBooking(booking.id);
                      onDone();
                      toast.success("Booking disetujui.");
                    } catch (e) {
                      toast.error(e instanceof ApiError ? e.message : "Gagal");
                    }
                  }}
                >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Setujui booking
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
              onClick={() => onOpenReject(booking.id)}
            >
              <XCircle className="h-4 w-4" />
              Tolak booking
            </DropdownMenuItem>
          </>
        ) : null}
        {showConvert ? (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={async () => {
              try {
                const res = await convertBookingToShipment(booking.id);
                const payload = res as { data?: { id?: number } };
                const sid = payload?.data?.id;
                if (typeof sid === "number") {
                  router.push(`/dashboard/admin/shipments/${sid}`);
                }
                onDone();
              } catch (e) {
                toast.error(e instanceof ApiError ? e.message : "Gagal");
              }
            }}
          >
            <ArrowRightLeft className="h-4 w-4" />
            Konversi ke shipment
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();
  const roles = user?.roles ?? [];
  const canProcessOperations =
    authHydrated && (roles.includes("super_admin") || roles.includes("operations"));

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [statsRows, setStatsRows] = useState<BookingRow[]>([]);
  const [statsMeta, setStatsMeta] = useState<LaravelPaginated<BookingRow> | null>(null);
  const [meta, setMeta] = useState<LaravelPaginated<BookingRow> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingTable, setLoadingTable] = useState(true);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState("all");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailText, setDetailText] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSaving, setRejectSaving] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const statusParam = statusFilter === "all" ? undefined : statusFilter;

  const loadStats = useCallback(async () => {
    if (!mounted || !authHydrated) return;
    try {
      const res = await fetchAdminBookings({
        page: 1,
        perPage: STATS_CAP,
      });
      const paginated = res as LaravelPaginated<BookingRow>;
      setStatsRows((paginated.data as BookingRow[]) ?? []);
      setStatsMeta(paginated);
    } catch {
      setStatsRows([]);
      setStatsMeta(null);
    }
  }, [mounted, authHydrated]);

  const loadTable = useCallback(async () => {
    if (!mounted || !authHydrated) return;
    setLoadError(null);
    setLoadingTable(true);
    try {
      const res = await fetchAdminBookings({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch.trim() || undefined,
        status: statusParam,
      });
      const paginated = res as LaravelPaginated<BookingRow>;
      setBookings((paginated.data as BookingRow[]) ?? []);
      setMeta(paginated);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Gagal memuat booking");
      setBookings([]);
      setMeta(null);
    } finally {
      setLoadingTable(false);
    }
  }, [mounted, authHydrated, page, debouncedSearch, statusParam]);

  const openBookingDetail = useCallback(async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailText("");
    try {
      const res = await fetchAdminBooking(id);
      setDetailText(JSON.stringify((res as { data: unknown }).data, null, 2));
    } catch (e) {
      setDetailText(e instanceof ApiError ? e.message : "Gagal memuat.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const reloadAll = useCallback(async () => {
    await loadStats();
    await loadTable();
  }, [loadStats, loadTable]);

  const submitReject = useCallback(async () => {
    if (rejectId == null || !rejectReason.trim()) return;
    setRejectSaving(true);
    try {
      await rejectBooking(rejectId, rejectReason.trim());
      setRejectOpen(false);
      setRejectId(null);
      setRejectReason("");
      await reloadAll();
      toast.success("Booking ditolak.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menolak.");
    } finally {
      setRejectSaving(false);
    }
  }, [rejectId, rejectReason, reloadAll]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && authHydrated) void loadStats();
  }, [mounted, authHydrated, loadStats]);

  useEffect(() => {
    if (mounted && authHydrated) void loadTable();
  }, [mounted, authHydrated, loadTable]);

  if (!mounted) return null;

  const countDraft = statsRows.filter((b) => b.status.toLowerCase() === "draft").length;
  const countSubmitted = statsRows.filter((b) => b.status.toLowerCase() === "submitted").length;
  const countApproved = statsRows.filter((b) => b.status.toLowerCase() === "approved").length;
  const totalStats = statsMeta?.total ?? 0;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Booking Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Approval booking & konversi ke shipment.
            </p>
          </div>
        </div>
      </div>

      {loadError ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{loadError}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Draft</CardDescription>
              <span className="rounded-md bg-slate-100 p-1.5 text-slate-700">
                <FilePenLine className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countDraft}</span>
              <span className="text-xs font-normal text-muted-foreground">belum dikirim / revisi</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Menunggu persetujuan</CardDescription>
              <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                <ClipboardClock className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countSubmitted}</span>
              <span className="text-xs font-normal text-muted-foreground">perlu approve / tolak</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Disetujui</CardDescription>
              <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countApproved}</span>
              <span className="text-xs font-normal text-emerald-600">siap konversi ke shipment</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Total booking</CardDescription>
              <span className="rounded-md bg-sky-100 p-1.5 text-sky-700">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{totalStats}</span>
              <span className="text-xs font-normal text-muted-foreground">semua booking</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Daftar Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchPlaceholder="Cari nomor booking atau kargo…"
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            filterLabel="Status"
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={BOOKING_STATUS_FILTERS}
          />
          {loadingTable ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">No</TableHead>
                    <TableHead className="w-[120px]">Kode Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className={actionsHeadClass}>
                      <span className="max-md:sr-only">Aksi</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking, index) => (
                    <TableRow key={booking.id} className="group">
                      <TableCell className="tabular-nums text-muted-foreground">
                        {rowNumber(meta?.current_page ?? page, PER_PAGE, index)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{booking.booking_number}</TableCell>
                      <TableCell className="font-medium">{booking.company?.name ?? "—"}</TableCell>
                      <TableCell>{booking.origin_location?.name ?? "—"}</TableCell>
                      <TableCell>{booking.destination_location?.name ?? "—"}</TableCell>
                      <TableCell>{booking.service_type?.name ?? booking.service_type?.code ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={bookingStatusBadgeClass(booking.status)}>
                          {bookingStatusLabelFromApi(booking.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(actionsCellClass, "p-2 text-right")}>
                        <div className="flex justify-end">
                          <BookingActionsMenu
                            booking={booking}
                            canProcessOperations={canProcessOperations}
                            onOpenDetail={openBookingDetail}
                            onOpenReject={(id) => {
                              setRejectId(id);
                              setRejectReason("");
                              setRejectOpen(true);
                            }}
                            onDone={reloadAll}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption className="text-xs">
                  {bookings.length === 0 ? "Tidak ada data." : `${bookings.length} baris di halaman ini.`}
                </TableCaption>
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail booking</DialogTitle>
            <DialogDescription>Ringkasan data booking dari server.</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            {detailLoading ? (
              <p className="text-sm text-muted-foreground">Memuat…</p>
            ) : (
              <pre className="max-h-[70vh] overflow-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed">
                {detailText || "—"}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="reject-reason">
              Alasan penolakan
            </label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Wajib diisi"
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!rejectReason.trim() || rejectSaving}
              onClick={() => void submitReject()}
            >
              {rejectSaving ? "Menyimpan…" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
