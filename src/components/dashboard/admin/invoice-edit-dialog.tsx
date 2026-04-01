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
import { updateAdminInvoice } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { firstLaravelError } from "@/lib/laravel-errors";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "unpaid", label: "Belum bayar" },
  { value: "paid", label: "Lunas" },
  { value: "overdue", label: "Jatuh tempo" },
  { value: "cancelled", label: "Dibatalkan" },
];

export function InvoiceEditDialog({
  open,
  onOpenChange,
  invoice,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Record<string, unknown> | null;
  onSaved: () => void;
}) {
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !invoice) return;
    setError(null);
    const d = String(invoice.due_date ?? "").slice(0, 10);
    setDueDate(d);
    setNotes(String(invoice.notes ?? ""));
    setStatus(String(invoice.status ?? "unpaid"));
  }, [open, invoice]);

  const save = async () => {
    const id = invoice ? Number(invoice.id) : NaN;
    if (!Number.isFinite(id)) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        due_date: dueDate,
        notes: notes.trim() || null,
        status,
      };
      await updateAdminInvoice(id, body);
      toast.success("Invoice berhasil diperbarui.");
      onOpenChange(false);
      onSaved();
    } catch (e) {
      const msg = e instanceof ApiError ? firstLaravelError(e.body) ?? e.message : "Gagal menyimpan.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const disabled = !dueDate || saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit invoice</DialogTitle>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
        ) : null}
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label htmlFor="inv-edit-due">Jatuh tempo</Label>
            <Input
              id="inv-edit-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => {
                if (v != null) setStatus(v);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-edit-notes">Catatan</Label>
            <Textarea
              id="inv-edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Catatan tambahan (opsional)"
            />
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
