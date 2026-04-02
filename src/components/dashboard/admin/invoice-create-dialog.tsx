"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdminInvoice,
  fetchAdminCompanies,
  fetchAdminShipments,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { firstLaravelError } from "@/lib/laravel-errors";
import type { LaravelPaginated } from "@/lib/types-api";
import { Plus, Trash2 } from "lucide-react";
import { DIALOG_CREATE_HEADER_CLASS } from "@/lib/dialog-create-header";
import { toast } from "sonner";

type ItemLine = { key: string; description: string; quantity: string; unit_price: string };

function newLine(): ItemLine {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    description: "",
    quantity: "1",
    unit_price: "0",
  };
}

export function InvoiceCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [shipments, setShipments] = useState<{ id: number; label: string; company_id?: number }[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  const [shipmentId, setShipmentId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemLine[]>([newLine()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setShipmentId("");
    setCompanyId("");
    setIssuedDate("");
    setDueDate("");
    setNotes("");
    setItems([newLine()]);
    let cancelled = false;
    void (async () => {
      setListsLoading(true);
      try {
        const [shipRes, compRes] = await Promise.all([
          fetchAdminShipments({ perPage: 200 }),
          fetchAdminCompanies({ perPage: 500 }),
        ]);
        if (cancelled) return;
        const shipData = (shipRes as LaravelPaginated<Record<string, unknown>>).data ?? [];
        const compData = (compRes as LaravelPaginated<Record<string, unknown>>).data ?? [];
        setShipments(
          shipData.map((r) => {
            const id = Number(r.id);
            const wb = String(r.waybill_number ?? r.shipment_number ?? r.id ?? "");
            return {
              id,
              label: wb,
              company_id: r.company_id != null ? Number(r.company_id) : undefined,
            };
          })
        );
        setCompanies(
          compData.map((r) => ({
            id: Number(r.id),
            name: String(r.name ?? r.id),
          }))
        );
      } catch {
        if (!cancelled) {
          setShipments([]);
          setCompanies([]);
        }
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const onShipmentPick = (value: string) => {
    setShipmentId(value);
    const row = shipments.find((s) => String(s.id) === value);
    if (row?.company_id != null && Number.isFinite(row.company_id)) {
      setCompanyId(String(row.company_id));
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        shipment_id: Number(shipmentId),
        company_id: Number(companyId),
        issued_date: issuedDate,
        due_date: dueDate,
        notes: notes.trim() || null,
        items: items.map((it) => ({
          description: it.description.trim(),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
      };
      await createAdminInvoice(body);
      toast.success("Invoice berhasil dibuat.");
      onOpenChange(false);
      onCreated();
    } catch (e) {
      const msg =
        e instanceof ApiError ? firstLaravelError(e.body) ?? e.message : "Gagal membuat invoice.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const validItems = items.every(
    (it) =>
      it.description.trim().length > 0 &&
      Number.isFinite(Number(it.quantity)) &&
      Number(it.quantity) >= 1 &&
      Number.isFinite(Number(it.unit_price)) &&
      Number(it.unit_price) >= 0
  );

  const disabled =
    !shipmentId ||
    !companyId ||
    !issuedDate ||
    !dueDate ||
    !validItems ||
    saving ||
    listsLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className={DIALOG_CREATE_HEADER_CLASS}>
          <DialogTitle>Buat invoice</DialogTitle>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
        ) : null}
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label>Shipment</Label>
            <Select
              value={shipmentId}
              onValueChange={(v) => {
                if (v != null) onShipmentPick(v);
              }}
              disabled={listsLoading}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder={listsLoading ? "Memuat…" : "Pilih shipment"} />
              </SelectTrigger>
              <SelectContent>
                {shipments.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Perusahaan (customer)</Label>
            <Select
              value={companyId}
              onValueChange={(v) => {
                if (v != null) setCompanyId(v);
              }}
              disabled={listsLoading}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder={listsLoading ? "Memuat…" : "Pilih"} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="inv-issued">Tanggal terbit</Label>
              <Input
                id="inv-issued"
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-due">Jatuh tempo</Label>
              <Input id="inv-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-notes">Catatan</Label>
            <Textarea
              id="inv-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Opsional"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Item baris</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => setItems((prev) => [...prev, newLine()])}
              >
                <Plus className="h-3.5 w-3.5" />
                Baris
              </Button>
            </div>
            <div className="space-y-3 rounded-md border p-3">
              {items.map((it, idx) => (
                <div key={it.key} className="grid gap-2 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">#{idx + 1}</span>
                    {items.length > 1 ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0"
                        onClick={() => setItems((prev) => prev.filter((x) => x.key !== it.key))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                  <Input
                    placeholder="Deskripsi"
                    value={it.description}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) => (x.key === it.key ? { ...x, description: e.target.value } : x))
                      )
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      inputMode="numeric"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) => (x.key === it.key ? { ...x, quantity: e.target.value } : x))
                        )
                      }
                    />
                    <Input
                      inputMode="decimal"
                      placeholder="Harga satuan"
                      value={it.unit_price}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) => (x.key === it.key ? { ...x, unit_price: e.target.value } : x))
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" disabled={disabled} onClick={() => void save()}>
            {saving ? "Menyimpan…" : "Buat invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
