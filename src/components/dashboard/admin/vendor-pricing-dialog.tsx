"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminVendorPricing, fetchAdminContainerTypes } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { firstLaravelError } from "@/lib/laravel-errors";
import type { LaravelPaginated } from "@/lib/types-api";
import { DIALOG_CREATE_HEADER_CLASS } from "@/lib/dialog-create-header";

export type VendorServiceOption = { id: number; label: string };

export function VendorPricingDialog({
  open,
  onOpenChange,
  vendorServiceOptions,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorServiceOptions: VendorServiceOption[];
  onSaved: () => void;
}) {
  const [containerTypes, setContainerTypes] = useState<{ id: number; label: string }[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  const [vendorServiceId, setVendorServiceId] = useState("");
  const [containerTypeId, setContainerTypeId] = useState<string>("");
  const [priceType, setPriceType] = useState<"buy" | "sell">("buy");
  const [pricePerKg, setPricePerKg] = useState("");
  const [pricePerCbm, setPricePerCbm] = useState("");
  const [pricePerContainer, setPricePerContainer] = useState("");
  const [minimumCharge, setMinimumCharge] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setVendorServiceId(vendorServiceOptions[0] ? String(vendorServiceOptions[0].id) : "");
    setContainerTypeId("");
    setPriceType("buy");
    setPricePerKg("");
    setPricePerCbm("");
    setPricePerContainer("");
    setMinimumCharge("");
    setEffectiveFrom("");
    setEffectiveTo("");
    setIsActive(true);
    let cancelled = false;
    void (async () => {
      setListsLoading(true);
      try {
        const res = await fetchAdminContainerTypes({ perPage: 500 });
        if (cancelled) return;
        const data = (res as LaravelPaginated<Record<string, unknown>>).data ?? [];
        setContainerTypes(
          data.map((r) => ({
            id: Number(r.id),
            label: String(r.name ?? r.code ?? r.id),
          }))
        );
      } catch {
        if (!cancelled) setContainerTypes([]);
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, vendorServiceOptions]);

  const numOrNull = (s: string) => {
    const t = s.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  };

  const save = async () => {
    const vsId = Number(vendorServiceId);
    if (!Number.isFinite(vsId)) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        price_type: priceType,
        is_active: isActive,
      };
      const ct = containerTypeId ? Number(containerTypeId) : null;
      if (ct != null && Number.isFinite(ct)) body.container_type_id = ct;
      const pkg = numOrNull(pricePerKg);
      const pcbm = numOrNull(pricePerCbm);
      const pcont = numOrNull(pricePerContainer);
      const minc = numOrNull(minimumCharge);
      if (pkg != null) body.price_per_kg = pkg;
      if (pcbm != null) body.price_per_cbm = pcbm;
      if (pcont != null) body.price_per_container = pcont;
      if (minc != null) body.minimum_charge = minc;
      if (effectiveFrom.trim()) body.effective_from = effectiveFrom.trim();
      if (effectiveTo.trim()) body.effective_to = effectiveTo.trim();

      await createAdminVendorPricing(vsId, body);
      onOpenChange(false);
      onSaved();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(firstLaravelError(e) ?? e.message);
      } else {
        setError("Gagal menyimpan.");
      }
    } finally {
      setSaving(false);
    }
  };

  const disabled =
    !vendorServiceId || vendorServiceOptions.length === 0 || saving || listsLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader className={DIALOG_CREATE_HEADER_CLASS}>
          <DialogTitle>Tambah tarif</DialogTitle>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
        ) : null}
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label>Layanan vendor</Label>
            <Select
              value={vendorServiceId}
              onValueChange={(v) => {
                if (v != null) setVendorServiceId(v);
              }}
              disabled={listsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih lane / layanan" />
              </SelectTrigger>
              <SelectContent>
                {vendorServiceOptions.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipe harga</Label>
            <Select
              value={priceType}
              onValueChange={(v) => {
                if (v === "buy" || v === "sell") setPriceType(v);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Beli</SelectItem>
                <SelectItem value="sell">Jual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Jenis kontainer (opsional)</Label>
            <Select
              value={containerTypeId || "__none__"}
              onValueChange={(v) => {
                if (v == null) return;
                setContainerTypeId(v === "__none__" ? "" : v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua / umum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {containerTypes.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="ppkg">Per kg</Label>
              <Input
                id="ppkg"
                inputMode="decimal"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pcbm">Per CBM</Label>
              <Input
                id="pcbm"
                inputMode="decimal"
                value={pricePerCbm}
                onChange={(e) => setPricePerCbm(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="pcont">Per kontainer</Label>
              <Input
                id="pcont"
                inputMode="decimal"
                value={pricePerContainer}
                onChange={(e) => setPricePerContainer(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minc">Minimum charge</Label>
              <Input
                id="minc"
                inputMode="decimal"
                value={minimumCharge}
                onChange={(e) => setMinimumCharge(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="eff-from">Berlaku dari</Label>
              <Input
                id="eff-from"
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eff-to">Berlaku s/d</Label>
              <Input
                id="eff-to"
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="p-active" checked={isActive} onCheckedChange={(c) => setIsActive(c === true)} />
            <Label htmlFor="p-active" className="font-normal cursor-pointer">
              Aktif
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" disabled={disabled} onClick={() => void save()}>
            {saving ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
