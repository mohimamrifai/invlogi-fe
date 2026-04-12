"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface DangerousGoodsSectionProps {
  isDg: boolean;
  onIsDgChange: (v: boolean) => void;
  dgClassId: string;
  onDgClassIdChange: (v: string) => void;
  unNumber: string;
  onUnNumberChange: (v: string) => void;
  onMsdsFileChange: (file: File | null) => void;
  dgClasses: { id: number; name: string; code: string }[];
  validationErrors?: Record<string, string[]>;
  renderError: (field: string) => React.ReactNode;
}

export function DangerousGoodsSection({
  isDg,
  onIsDgChange,
  dgClassId,
  onDgClassIdChange,
  unNumber,
  onUnNumberChange,
  onMsdsFileChange,
  dgClasses,
  validationErrors,
  renderError,
}: DangerousGoodsSectionProps) {
  return (
    <div className="sm:col-span-2 space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <Checkbox id="is-dg" checked={isDg} onCheckedChange={(v) => onIsDgChange(v === true)} />
        <Label htmlFor="is-dg" className="font-semibold text-red-600">
          Barang Berbahaya (DG / Dangerous Goods)
        </Label>
      </div>
      {renderError("is_dangerous_goods")}

      {isDg && (
        <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-red-100 bg-red-50/20 p-4">
          <div className="space-y-2">
            <Label>DG Class</Label>
            <select
              className={`flex h-10 w-full rounded-md border bg-background px-3 text-sm ${
                validationErrors?.dg_class_id ? "border-red-500 ring-red-500" : "border-input"
              }`}
              value={dgClassId}
              onChange={(e) => onDgClassIdChange(e.target.value)}
              required={isDg}
            >
              <option value="">Pilih class…</option>
              {dgClasses.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {renderError("dg_class_id")}
          </div>
          <div className="space-y-2">
            <Label>UN Number</Label>
            <Input
              placeholder="Contoh: UN1234"
              value={unNumber}
              onChange={(e) => onUnNumberChange(e.target.value)}
              required={isDg}
              className={validationErrors?.un_number ? "border-red-500" : ""}
            />
            {renderError("un_number")}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>MSDS File (PDF)</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => onMsdsFileChange(e.target.files?.[0] ?? null)}
              required={isDg}
              className={validationErrors?.msds_file ? "border-red-500" : ""}
            />
            <p className="text-[11px] text-muted-foreground">
              Wajib untuk barang berbahaya (maks 5MB).
            </p>
            {renderError("msds_file")}
          </div>
        </div>
      )}
    </div>
  );
}
