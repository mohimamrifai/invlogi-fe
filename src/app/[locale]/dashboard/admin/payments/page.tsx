"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { paymentStatusBadgeClass, paymentStatusLabelFromApi } from "@/lib/payment-status";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Loader2,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchAdminPayment,
  fetchAdminPayments,
  syncAdminPaymentMidtrans,
  verifyAdminPaymentManual,
} from "@/lib/admin-api";
import { PaymentDetailView } from "@/components/dashboard/admin/payment-detail-view";
import type { LaravelPaginated } from "@/lib/types-api";
import { ApiError } from "@/lib/api-client";
import { rowNumber } from "@/lib/list-query";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const PER_PAGE = 10;
const STATS_CAP = 1000;

const PAYMENT_STATUS_FILTERS = [
  { value: "all", label: "Semua status" },
  { value: "success", label: "Berhasil" },
  { value: "settlement", label: "Settlement" },
  { value: "pending", label: "Pending" },
  { value: "capture", label: "Capture" },
  { value: "authorize", label: "Authorize" },
  { value: "deny", label: "Deny" },
  { value: "cancel", label: "Cancel" },
  { value: "expire", label: "Expire" },
  { value: "failure", label: "Failure" },
  { value: "refund", label: "Refund" },
  { value: "partial_refund", label: "Refund sebagian" },
  { value: "chargeback", label: "Chargeback" },
];

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

type PayRow = Record<string, unknown>;

function AdminPaymentActionsMenu({
  payment,
  paymentRef,
  canManageAR,
  onPaymentsChanged,
}: {
  payment: PayRow;
  paymentRef: string;
  canManageAR: boolean;
  onPaymentsChanged: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<PayRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const paymentRowRef = useRef(payment);
  paymentRowRef.current = payment;
  const detailOpenRef = useRef(detailOpen);
  detailOpenRef.current = detailOpen;

  const [syncLoading, setSyncLoading] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  const paymentId = Number(payment.id);
  const orderIdRaw = String(payment.midtrans_order_id ?? "").trim();
  const canSyncMidtrans = orderIdRaw.length > 0;
  const payStatus = String(payment.status ?? "").toLowerCase();
  const canManualVerify = payStatus !== "success";

  useEffect(() => {
    if (!detailOpen) {
      setDetailData(null);
      setDetailError(null);
      return;
    }
    if (!Number.isFinite(paymentId)) {
      setDetailError("ID pembayaran tidak valid.");
      setDetailData(null);
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    void (async () => {
      try {
        const res = await fetchAdminPayment(paymentId);
        setDetailData((res as { data: PayRow }).data ?? null);
      } catch (e) {
        setDetailError(e instanceof ApiError ? e.message : "Gagal memuat detail.");
        setDetailData(paymentRowRef.current);
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [detailOpen, paymentId]);

  async function refetchDetailIfOpen(opts?: { showLoading?: boolean }) {
    if (!detailOpenRef.current || !Number.isFinite(paymentId)) return;
    const showLoading = opts?.showLoading === true;
    if (showLoading) setDetailLoading(true);
    try {
      const res = await fetchAdminPayment(paymentId);
      setDetailData((res as { data: PayRow }).data ?? null);
    } catch {
      /* biarkan tampilan lama */
    } finally {
      if (showLoading) setDetailLoading(false);
    }
  }

  async function handleSyncMidtrans() {
    if (!Number.isFinite(paymentId)) return;
    const toastId = toast.loading("Menyinkronkan status dari Midtrans…");
    setSyncLoading(true);
    try {
      const res = await syncAdminPaymentMidtrans(paymentId);
      toast.success(res.message, { id: toastId, duration: 4000 });
      onPaymentsChanged();
      await refetchDetailIfOpen({ showLoading: true });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyinkronkan dari Midtrans.", {
        id: toastId,
        duration: 6000,
      });
    } finally {
      setSyncLoading(false);
    }
  }

  async function handleVerifyManual() {
    if (!Number.isFinite(paymentId)) return;
    const toastId = toast.loading("Memverifikasi pembayaran…");
    setVerifyLoading(true);
    try {
      const res = await verifyAdminPaymentManual(paymentId, {
        note: verifyNote.trim() || undefined,
      });
      toast.success(res.message, { id: toastId, duration: 4000 });
      setVerifyOpen(false);
      setVerifyNote("");
      onPaymentsChanged();
      await refetchDetailIfOpen({ showLoading: true });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal verifikasi manual.", {
        id: toastId,
        duration: 6000,
      });
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0")}
        disabled={syncLoading || verifyLoading}
        aria-busy={syncLoading || verifyLoading}
        aria-label={
          syncLoading
            ? "Menyinkronkan dari Midtrans, tunggu sebentar"
            : verifyLoading
              ? "Memverifikasi pembayaran, tunggu sebentar"
              : "Menu aksi pembayaran"
        }
      >
        {syncLoading || verifyLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <MoreHorizontal className="h-4 w-4" aria-hidden />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem className="cursor-pointer" onClick={() => setDetailOpen(true)}>
          <Eye className="h-4 w-4" />
          Lihat detail pembayaran
        </DropdownMenuItem>
        {canManageAR ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              disabled={!canSyncMidtrans || syncLoading || verifyLoading || !Number.isFinite(paymentId)}
              title={!canSyncMidtrans ? "Pembayaran tanpa Order ID Midtrans tidak bisa disinkronkan." : undefined}
              onClick={() => void handleSyncMidtrans()}
            >
              {syncLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden />
              )}
              {syncLoading ? "Menyinkronkan…" : "Refresh status Midtrans"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              disabled={!canManualVerify || verifyLoading}
              title={!canManualVerify ? "Pembayaran ini sudah sukses." : undefined}
              onClick={() => {
                setVerifyNote("");
                setVerifyOpen(true);
              }}
            >
              <CreditCard className="h-4 w-4" aria-hidden />
              Verifikasi manual
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
    <AlertDialog
      open={verifyOpen}
      onOpenChange={(open) => {
        if (!open && verifyLoading) return;
        setVerifyOpen(open);
        if (!open) setVerifyNote("");
      }}
    >
      <AlertDialogContent className="max-w-md sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Verifikasi manual pembayaran?</AlertDialogTitle>
          <AlertDialogDescription>
            Invoice terkait akan ditandai lunas. Hanya gunakan jika transfer/kas sudah diverifikasi.
            Tidak tersedia jika invoice sudah lunas dari pembayaran lain.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2">
          <label htmlFor={`pay-verify-note-${paymentId}`} className="text-sm font-medium">
            Catatan (opsional)
          </label>
          <Textarea
            id={`pay-verify-note-${paymentId}`}
            rows={3}
            placeholder="Contoh: Transfer masuk ke rek BCA 02/04/2026"
            value={verifyNote}
            onChange={(e) => setVerifyNote(e.target.value)}
            disabled={verifyLoading}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={verifyLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={verifyLoading}
            className="gap-2"
            onClick={(e) => {
              e.preventDefault();
              void handleVerifyManual();
            }}
          >
            {verifyLoading ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                Memproses…
              </>
            ) : (
              "Ya, verifikasi"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail pembayaran {paymentRef || "—"}</DialogTitle>
          <DialogDescription>
            Ringkasan pembayaran Midtrans dan invoice terkait.
          </DialogDescription>
        </DialogHeader>
        {detailLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Memuat detail…
          </div>
        ) : (
          <>
            {detailError ? (
              <p className="rounded-md border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                {detailError} Menampilkan data dari daftar.
              </p>
            ) : null}
            <PaymentDetailView data={detailData} />
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

export default function AdminPaymentsPage() {
  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();
  const roles = user?.roles ?? [];
  const canManageAR = authHydrated && (roles.includes("super_admin") || roles.includes("finance"));

  const [rows, setRows] = useState<PayRow[]>([]);
  const [statsRows, setStatsRows] = useState<PayRow[]>([]);
  const [statsMeta, setStatsMeta] = useState<LaravelPaginated<PayRow> | null>(null);
  const [meta, setMeta] = useState<LaravelPaginated<PayRow> | null>(null);
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
      const res = await fetchAdminPayments({
        page: 1,
        perPage: STATS_CAP,
      });
      const paginated = res as LaravelPaginated<PayRow>;
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
      const res = await fetchAdminPayments({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch.trim() || undefined,
        status: statusParam,
      });
      const paginated = res as LaravelPaginated<PayRow>;
      setRows(paginated.data ?? []);
      setMeta(paginated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat pembayaran.");
      setRows([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [authHydrated, page, debouncedSearch, statusParam]);

  const refreshPayments = useCallback(() => {
    void load();
    void loadStats();
  }, [load, loadStats]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const countSuccess = statsRows.filter((p) => {
    const s = String(p.status).toLowerCase();
    return s === "success" || s === "settlement";
  }).length;
  const countPending = statsRows.filter((p) => {
    const s = String(p.status).toLowerCase();
    return s === "pending" || s === "capture" || s === "authorize";
  }).length;
  const countFailed = statsRows.filter((p) => {
    const s = String(p.status).toLowerCase();
    return s === "failure" || s === "deny" || s === "expire" || s === "cancel";
  }).length;
  const totalStats = statsMeta?.total ?? 0;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Payment / AR Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pembayaran, Midtrans, dan piutang semua customer.</p>
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
              <CardDescription>Berhasil</CardDescription>
              <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countSuccess}</span>
              <span className="text-xs font-normal text-emerald-600">Sukses</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Menunggu</CardDescription>
              <span className="rounded-md bg-amber-100 p-1.5 text-amber-700">
                <Clock className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countPending}</span>
              <span className="text-xs font-normal text-muted-foreground">Pending</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Gagal / expired</CardDescription>
              <span className="rounded-md bg-red-100 p-1.5 text-red-700">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{countFailed}</span>
              <span className="text-xs font-normal text-muted-foreground">Bermasalah</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Total transaksi</CardDescription>
              <span className="rounded-md bg-violet-100 p-1.5 text-violet-700">
                <CreditCard className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
            <CardTitle className="flex flex-col gap-0.5 text-2xl font-semibold">
              <span>{totalStats}</span>
              <span className="text-xs font-normal text-muted-foreground">semua pembayaran</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Daftar pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchPlaceholder="Cari order Midtrans atau nomor invoice…"
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            filterLabel="Status"
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={PAYMENT_STATUS_FILTERS}
          />
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">No</TableHead>
                    <TableHead className="w-[130px]">Ref payment</TableHead>
                    <TableHead className="w-[130px]">No. invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className={actionsHeadClass}>
                      <span className="max-md:sr-only">Aksi</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((payment, index) => {
                    const inv = payment.invoice as
                      | { invoice_number?: string; company?: { name?: string } }
                      | undefined;
                    const invNo = inv?.invoice_number ?? "—";
                    const cust = inv?.company?.name ?? "—";
                    const amt = Number(payment.amount ?? 0);
                    const st = String(payment.status ?? "");
                    const method = String(payment.payment_type ?? "Midtrans");
                    const key = String(payment.midtrans_order_id ?? payment.id ?? "");
                    return (
                      <TableRow key={key} className="group">
                        <TableCell className="tabular-nums text-muted-foreground">
                          {rowNumber(meta?.current_page ?? page, PER_PAGE, index)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{key}</TableCell>
                        <TableCell className="font-mono text-xs">{invNo}</TableCell>
                        <TableCell className="font-medium">{cust}</TableCell>
                        <TableCell className="max-w-[180px] wrap-break-word">{method}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          Rp {amt.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={paymentStatusBadgeClass(st)}>
                            {paymentStatusLabelFromApi(st)}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(actionsCellClass, "p-2 text-right")}>
                          <div className="flex justify-end">
                            <AdminPaymentActionsMenu
                              payment={payment}
                              paymentRef={key}
                              canManageAR={canManageAR}
                              onPaymentsChanged={refreshPayments}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {rows.length === 0 ? (
                  <TableCaption className="text-xs">Belum ada pembayaran.</TableCaption>
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
