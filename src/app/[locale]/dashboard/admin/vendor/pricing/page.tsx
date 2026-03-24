"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationBar } from "@/components/data-table/pagination-bar";
import { fetchAdminVendor, fetchAdminVendors } from "@/lib/admin-api";
import type { LaravelPaginated } from "@/lib/types-api";
import { ApiError } from "@/lib/api-client";
import { rowNumber } from "@/lib/list-query";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";
import {
  buildPricingRowsFromVendorDetail,
  priceTypeLabel,
  type PricingRow,
} from "../_components/build-pricing-rows";

type VendorRow = Record<string, unknown>;

const PRICING_PER_PAGE = 10;
const VENDOR_OPTIONS_CAP = 500;

export default function AdminVendorPricingPage() {
  const authHydrated = useAuthPersistHydrated();

  const [vendorOptions, setVendorOptions] = useState<VendorRow[]>([]);
  const [vendorPickSearch, setVendorPickSearch] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [pricingVendorLabel, setPricingVendorLabel] = useState("");

  const [pricingRows, setPricingRows] = useState<PricingRow[]>([]);
  const [pricingPage, setPricingPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPricingForVendor = useCallback(async (vendorId: number, label: string) => {
    setDetailLoading(true);
    setError(null);
    try {
      const detail = await fetchAdminVendor(vendorId);
      const v = detail.data as Record<string, unknown>;
      setPricingRows(buildPricingRowsFromVendorDetail(v));
      setPricingVendorLabel(label);
      setPricingPage(1);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat detail vendor.");
      setPricingRows([]);
      setPricingVendorLabel("");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authHydrated) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAdminVendors({ page: 1, perPage: VENDOR_OPTIONS_CAP });
        const list = (res as LaravelPaginated<VendorRow>).data ?? [];
        if (cancelled) return;
        setVendorOptions(list);
        if (list.length > 0) {
          const first = list[0];
          const id = Number(first.id);
          if (Number.isFinite(id)) {
            setSelectedVendorId(String(id));
            await loadPricingForVendor(id, String(first.name ?? first.code ?? `#${id}`));
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Gagal memuat daftar vendor.");
          setVendorOptions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authHydrated, loadPricingForVendor]);

  const displayVendorOptions = useMemo(() => {
    const q = vendorPickSearch.trim().toLowerCase();
    let list = !q
      ? vendorOptions
      : vendorOptions.filter(
          (v) =>
            String(v.name ?? "")
              .toLowerCase()
              .includes(q) ||
            String(v.code ?? "")
              .toLowerCase()
              .includes(q)
        );
    if (selectedVendorId && !list.some((v) => String(v.id) === selectedVendorId)) {
      const sel = vendorOptions.find((v) => String(v.id) === selectedVendorId);
      if (sel) list = [sel, ...list];
    }
    return list;
  }, [vendorOptions, vendorPickSearch, selectedVendorId]);

  const pricingMeta = useMemo(() => {
    const total = pricingRows.length;
    const lastPage = Math.max(1, Math.ceil(total / PRICING_PER_PAGE));
    const currentPage = Math.min(Math.max(1, pricingPage), lastPage);
    const start = (currentPage - 1) * PRICING_PER_PAGE;
    const slice = pricingRows.slice(start, start + PRICING_PER_PAGE);
    const from = total === 0 ? null : start + 1;
    const to = total === 0 ? null : start + slice.length;
    return { total, lastPage, currentPage, slice, from, to };
  }, [pricingRows, pricingPage]);

  const pricingSlice = pricingMeta.slice;

  const onVendorChange = (value: string | null) => {
    if (value == null) return;
    setSelectedVendorId(value);
    const row = vendorOptions.find((x) => String(x.id) === value);
    const id = Number(value);
    const label = row ? String(row.name ?? row.code ?? `#${id}`) : `#${id}`;
    void loadPricingForVendor(id, label);
  };

  return (
    <>
      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Pricing</CardTitle>
          <CardDescription className="space-y-2 text-pretty">
            <span className="block">
              Harga di sistem ini disimpan per vendor: satu respons API berisi detail vendor, layanan, dan tarif.
              Dropdown memilih vendor mana yang ingin ditinjau; tabel di bawah memuat data harga untuk vendor tersebut.
            </span>
            {pricingVendorLabel ? (
              <span className="block text-foreground">
                Menampilkan ringkasan untuk: {pricingVendorLabel}
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 sm:max-w-lg">
            <p className="text-xs font-medium text-foreground">Pilih vendor</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cari lalu pilih vendor. Tarif diambil dari endpoint detail vendor (vendor services + pricing).
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:max-w-md">
            <Label htmlFor="vendor-pick-search" className="text-xs text-muted-foreground">
              Cari vendor (nama / kode)
            </Label>
            <Input
              id="vendor-pick-search"
              value={vendorPickSearch}
              onChange={(e) => setVendorPickSearch(e.target.value)}
              placeholder="Filter daftar di bawah…"
              className="h-9"
              disabled={loading || vendorOptions.length === 0}
            />
            <Label className="text-xs text-muted-foreground">Vendor</Label>
            <Select
              value={selectedVendorId}
              onValueChange={onVendorChange}
              disabled={loading || vendorOptions.length === 0}
            >
              <SelectTrigger className="h-9 w-full sm:max-w-md">
                <SelectValue placeholder={loading ? "Memuat…" : "Pilih vendor"} />
              </SelectTrigger>
              <SelectContent>
                {displayVendorOptions.map((v) => {
                  const id = String(v.id ?? "");
                  return (
                    <SelectItem key={id} value={id}>
                      {String(v.name ?? v.code ?? id)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {!loading && vendorOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada vendor di sistem.</p>
            ) : null}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : (
            <>
              {detailLoading ? (
                <p className="text-sm text-muted-foreground">Memuat pricing…</p>
              ) : null}
              <div
                className={`-mx-1 overflow-x-auto px-1 transition-opacity ${detailLoading ? "pointer-events-none opacity-50" : ""}`}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Lane</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead
                        className="text-xs"
                        title="Tipe harga beli/jual dari sistem"
                      >
                        Tipe harga
                      </TableHead>
                      <TableHead className="min-w-48">Komponen tarif</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingSlice.map((row, index) => (
                      <TableRow key={`${row.lane}-${row.priceType}-${index}-${pricingMeta.currentPage}`}>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {rowNumber(pricingMeta.currentPage, PRICING_PER_PAGE, index)}
                        </TableCell>
                        <TableCell>{row.lane}</TableCell>
                        <TableCell>{row.service}</TableCell>
                        <TableCell className="text-xs">{priceTypeLabel(row.priceType)}</TableCell>
                        <TableCell className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                          {row.detail}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {pricingRows.length === 0 ? (
                    <TableCaption className="text-xs">Tidak ada pricing untuk vendor ini.</TableCaption>
                  ) : (
                    <TableCaption className="text-xs">Sumber: GET /api/admin/vendors/{`{id}`}.</TableCaption>
                  )}
                </Table>
              </div>
              {pricingRows.length > PRICING_PER_PAGE ? (
                <PaginationBar
                  currentPage={pricingMeta.currentPage}
                  lastPage={pricingMeta.lastPage}
                  total={pricingMeta.total}
                  from={pricingMeta.from}
                  to={pricingMeta.to}
                  onPageChange={setPricingPage}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
