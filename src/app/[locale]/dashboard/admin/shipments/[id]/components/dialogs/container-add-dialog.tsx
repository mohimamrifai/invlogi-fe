"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIALOG_CREATE_HEADER_CLASS } from "@/lib/dialog-create-header";

interface ContainerAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  containerTypes: any[];
  contTypeId: string;
  setContTypeId: (v: string) => void;
  contNum: string;
  setContNum: (v: string) => void;
  contSeal: string;
  setContSeal: (v: string) => void;
  saving: boolean;
  onSave: () => void;
}

export function ContainerAddDialog({
  open,
  onOpenChange,
  containerTypes,
  contTypeId,
  setContTypeId,
  contNum,
  setContNum,
  contSeal,
  setContSeal,
  saving,
  onSave,
}: ContainerAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader className={DIALOG_CREATE_HEADER_CLASS}>
          <DialogTitle>Tambah kontainer baru</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="space-y-1">
            <Label>Tipe Kontainer</Label>
            <Select value={contTypeId} onValueChange={(v) => v && setContTypeId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                {containerTypes.map((ct) => (
                  <SelectItem key={String(ct.id)} value={String(ct.id)}>
                    {String(ct.name ?? ct.id)} {ct.size ? `(${ct.size})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Nomor Kontainer</Label>
            <Input
              value={contNum}
              onChange={(e) => setContNum(e.target.value)}
              placeholder="Mis. ABCD1234567"
            />
          </div>
          <div className="space-y-1">
            <Label>Nomor Segel (Seal)</Label>
            <Input
              value={contSeal}
              onChange={(e) => setContSeal(e.target.value)}
              placeholder="Opsional"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button type="button" onClick={onSave} disabled={saving || !contTypeId}>
            {saving ? "Menyimpan…" : "Tambahkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
