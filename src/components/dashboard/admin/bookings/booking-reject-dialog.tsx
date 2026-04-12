"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BookingRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

export function BookingRejectDialog({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  loading,
  onSubmit,
}: BookingRejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tolak booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="reject-reason">
            Alasan penolakan
          </label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Wajib diisi"
            rows={4}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!reason.trim() || loading}
            onClick={onSubmit}
          >
            {loading ? "Menyimpan…" : "Tolak"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
