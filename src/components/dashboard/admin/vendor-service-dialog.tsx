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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdminVendorService,
  fetchAdminLocations,
  fetchAdminServiceTypes,
  fetchAdminTransportModes,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { firstLaravelError } from "@/lib/laravel-errors";
import type { LaravelPaginated } from "@/lib/types-api";
import { DIALOG_CREATE_HEADER_CLASS } from "@/lib/dialog-create-header";

type Opt = { id: number; label: string };

export function VendorServiceDialog({
  open,
  onOpenChange,
  vendorId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: number | null;
  onSaved: () => void;
}) {
  const [transportModes, setTransportModes] = useState<Opt[]>([]);
  const [serviceTypes, setServiceTypes] = useState<Opt[]>([]);
  const [locations, setLocations] = useState<Opt[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  const [transportModeId, setTransportModeId] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || vendorId == null) return;
    setError(null);
    setTransportModeId("");
    setServiceTypeId("");
    setOriginId("");
    setDestinationId("");
    setIsActive(true);
    let cancelled = false;
    void (async () => {
      setListsLoading(true);
      try {
        const [tm, st, loc] = await Promise.all([
          fetchAdminTransportModes({ perPage: 500 }),
          fetchAdminServiceTypes({ perPage: 500 }),
          fetchAdminLocations({ perPage: 500 }),
        ]);
        if (cancelled) return;
        const tmData = (tm as LaravelPaginated<Record<string, unknown>>).data ?? [];
        const stData = (st as LaravelPaginated<Record<string, unknown>>).data ?? [];
        const locData = (loc as LaravelPaginated<Record<string, unknown>>).data ?? [];
        setTransportModes(
          tmData.map((r) => ({
            id: Number(r.id),
            label: String(r.name ?? r.code ?? r.id),
          }))
        );
        setServiceTypes(
          stData.map((r) => ({
            id: Number(r.id),
            label: String(r.name ?? r.code ?? r.id),
          }))
        );
        setLocations(
          locData.map((r) => ({
            id: Number(r.id),
            label: [r.code, r.name].filter(Boolean).join(" · ") || String(r.id),
          }))
        );
      } catch {
        if (!cancelled) {
          setTransportModes([]);
          setServiceTypes([]);
          setLocations([]);
        }
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, vendorId]);

  const save = async () => {
    if (vendorId == null) return;
    setSaving(true);
    setError(null);
    try {
      await createAdminVendorService(vendorId, {
        transport_mode_id: Number(transportModeId),
        service_type_id: Number(serviceTypeId),
        origin_location_id: Number(originId),
        destination_location_id: Number(destinationId),
        is_active: isActive,
      });
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
    vendorId == null ||
    !transportModeId ||
    !serviceTypeId ||
    !originId ||
    !destinationId ||
    saving ||
    listsLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader className={DIALOG_CREATE_HEADER_CLASS}>
          <DialogTitle>Tambah layanan vendor</DialogTitle>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
        ) : null}
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label>Moda transport</Label>
            <Select
              value={transportModeId}
              onValueChange={(v) => {
                if (v != null) setTransportModeId(v);
              }}
              disabled={listsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={listsLoading ? "Memuat…" : "Pilih"} />
              </SelectTrigger>
              <SelectContent>
                {transportModes.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Jenis layanan</Label>
            <Select
              value={serviceTypeId}
              onValueChange={(v) => {
                if (v != null) setServiceTypeId(v);
              }}
              disabled={listsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={listsLoading ? "Memuat…" : "Pilih"} />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Origin</Label>
            <Select
              value={originId}
              onValueChange={(v) => {
                if (v != null) setOriginId(v);
              }}
              disabled={listsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={listsLoading ? "Memuat…" : "Pilih"} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Destination</Label>
            <Select
              value={destinationId}
              onValueChange={(v) => {
                if (v != null) setDestinationId(v);
              }}
              disabled={listsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={listsLoading ? "Memuat…" : "Pilih"} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="vs-active" checked={isActive} onCheckedChange={(c) => setIsActive(c === true)} />
            <Label htmlFor="vs-active" className="font-normal cursor-pointer">
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
