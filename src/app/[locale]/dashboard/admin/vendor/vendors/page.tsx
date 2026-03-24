"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";
import { fetchAdminVendors } from "@/lib/admin-api";
import type { LaravelPaginated } from "@/lib/types-api";
import { ApiError } from "@/lib/api-client";
import { rowNumber } from "@/lib/list-query";
import { useDebouncedValue } from "@/lib/use-debounced-value";

type VendorRow = Record<string, unknown>;

const VENDOR_PER_PAGE = 10;

/** Satu baris per vendor service: lane (asal → tujuan) + tipe layanan. */
function formatVendorServiceLine(vs: Record<string, unknown>): string {
  const o = vs.origin_location as { code?: string; name?: string } | undefined;
  const d = vs.destination_location as { code?: string; name?: string } | undefined;
  const st = vs.service_type as { name?: string; code?: string } | undefined;
  const from = o?.code ?? o?.name ?? "—";
  const to = d?.code ?? d?.name ?? "—";
  const svc = st?.name ?? st?.code ?? "—";
  return `${from} → ${to} · ${svc}`;
}

function formatVendorServiceCountLabel(count: unknown): string {
  const n = typeof count === "number" ? count : Number(count);
  const safe = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return `${safe} layanan`;
}

/** Teks singkat untuk sel + tooltip lengkap (satu layanan per baris). */
function vendorServicesSummary(v: VendorRow): { short: string; full: string } {
  const raw = v.vendor_services;
  const list = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  if (list.length === 0) {
    return { short: "—", full: "Belum ada layanan terdaftar." };
  }
  const lines = list.map(formatVendorServiceLine);
  const full = lines.join("\n");
  const maxInline = 2;
  if (lines.length <= maxInline) {
    return { short: lines.join("; "), full };
  }
  const shown = lines.slice(0, maxInline).join("; ");
  const rest = lines.length - maxInline;
  return { short: `${shown} … (+${rest} lainnya)`, full };
}

export default function AdminVendorListPage() {
  const authHydrated = useAuthPersistHydrated();

  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [vendorMeta, setVendorMeta] = useState<LaravelPaginated<VendorRow> | null>(null);
  const [vendorPage, setVendorPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVendorPage(1);
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    if (!authHydrated) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetchAdminVendors({
        page: vendorPage,
        perPage: VENDOR_PER_PAGE,
        search: debouncedSearch.trim() || undefined,
      });
      const paginated = res as LaravelPaginated<VendorRow>;
      setVendors(paginated.data ?? []);
      setVendorMeta(paginated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat vendor.");
      setVendors([]);
      setVendorMeta(null);
    } finally {
      setLoading(false);
    }
  }, [authHydrated, vendorPage, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Daftar Vendor</CardTitle>
          <CardDescription>
            Setiap entri layanan = satu lane (lokasi asal → tujuan) dengan satu tipe layanan. Kolom ringkasan
            menampilkan contoh rute &amp; layanan; arahkan kursor ke teks untuk daftar lengkap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchPlaceholder="Cari kode atau nama vendor…"
            searchValue={searchInput}
            onSearchChange={setSearchInput}
          />
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-1 px-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Vendor</TableHead>
                      <TableHead
                        className="min-w-36 text-right"
                        title="Banyaknya kombinasi lane + tipe layanan (vendor service)"
                      >
                        Jumlah
                      </TableHead>
                      <TableHead className="min-w-48 max-w-md">
                        Ringkasan layanan (rute &amp; tipe)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((v, index) => {
                      const { short, full } = vendorServicesSummary(v);
                      return (
                        <TableRow key={String(v.id)}>
                          <TableCell className="tabular-nums text-muted-foreground">
                            {rowNumber(vendorMeta?.current_page ?? vendorPage, VENDOR_PER_PAGE, index)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{String(v.code ?? "—")}</TableCell>
                          <TableCell>{String(v.name ?? "")}</TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            {formatVendorServiceCountLabel(v.vendor_services_count)}
                          </TableCell>
                          <TableCell className="max-w-md align-top">
                            <p
                              className="line-clamp-3 text-xs leading-relaxed text-muted-foreground"
                              title={full}
                            >
                              {short}
                            </p>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  {vendors.length === 0 ? (
                    <TableCaption className="text-xs">Belum ada vendor.</TableCaption>
                  ) : (
                    <TableCaption className="text-xs">Baris pada halaman ini.</TableCaption>
                  )}
                </Table>
              </div>
              {vendorMeta ? (
                <PaginationBar
                  currentPage={vendorMeta.current_page}
                  lastPage={vendorMeta.last_page}
                  total={vendorMeta.total}
                  from={vendorMeta.from}
                  to={vendorMeta.to}
                  onPageChange={setVendorPage}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
