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

interface RackAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rackName: string;
  setRackName: (v: string) => void;
  saving: boolean;
  onSave: () => void;
}

export function RackAddDialog({
  open,
  onOpenChange,
  rackName,
  setRackName,
  saving,
  onSave,
}: RackAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Tambah rack ke kontainer</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="space-y-1">
            <Label>Nama / Kode Rack</Label>
            <Input
              value={rackName}
              onChange={(e) => setRackName(e.target.value)}
              placeholder="Misal: Rack A, Baris 1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button type="button" onClick={onSave} disabled={saving || !rackName.trim()}>
            {saving ? "Menyimpan…" : "Tambahkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
