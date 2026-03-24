"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
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
                      <TableHead className="text-right">Layanan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((v, index) => (
                      <TableRow key={String(v.id)}>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {rowNumber(vendorMeta?.current_page ?? vendorPage, VENDOR_PER_PAGE, index)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{String(v.code ?? "—")}</TableCell>
                        <TableCell>{String(v.name ?? "")}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {String(v.vendor_services_count ?? 0)}
                        </TableCell>
                      </TableRow>
                    ))}
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
