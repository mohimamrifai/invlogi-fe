"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CT, CC, DC } from "../../hooks/use-booking-form";
import { Checkbox } from "@/components/ui/checkbox";

interface CargoDetailSectionProps {
  isLCL: boolean;
  isFCL: boolean;
  containerTypes: CT[];
  cargoCategories: CC[];
  dgClasses: DC[];
  containerTypeId: string;
  setContainerTypeId: (v: string) => void;
  containerCount: string;
  setContainerCount: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  cbm: string;
  setCbm: (v: string) => void;
  itemLength: string;
  setItemLength: (v: string) => void;
  itemWidth: string;
  setItemWidth: (v: string) => void;
  itemHeight: string;
  setItemHeight: (v: string) => void;
  departureDate: string;
  setDepartureDate: (v: string) => void;
  cargoCategoryId: string;
  setCargoCategoryId: (v: string) => void;
  cargo: string;
  setCargo: (v: string) => void;
  selectedCT?: CT;
  selectedCC?: CC;
  isDG: boolean;
  setIsDG: (v: boolean) => void;
  dgClassId: string;
  setDgClassId: (v: string) => void;
  unNumber: string;
  setUnNumber: (v: string) => void;
  msdsFile: File | null;
  setMsdsFile: (v: File | null) => void;
  equipmentCondition: string;
  setEquipmentCondition: (v: string) => void;
  temperature: string;
  setTemperature: (v: string) => void;
  showTemp?: boolean;
  showProject?: boolean;
}

export function CargoDetailSection({
  isLCL,
  isFCL,
  containerTypes,
  cargoCategories,
  dgClasses,
  containerTypeId,
  setContainerTypeId,
  containerCount,
  setContainerCount,
  weight,
  setWeight,
  cbm,
  setCbm,
  itemLength,
  setItemLength,
  itemWidth,
  setItemWidth,
  itemHeight,
  setItemHeight,
  departureDate,
  setDepartureDate,
  cargoCategoryId,
  setCargoCategoryId,
  cargo,
  setCargo,
  selectedCT,
  selectedCC,
  isDG,
  setIsDG,
  dgClassId,
  setDgClassId,
  unNumber,
  setUnNumber,
  msdsFile,
  setMsdsFile,
  equipmentCondition,
  setEquipmentCondition,
  temperature,
  setTemperature,
  showTemp,
  showProject,
}: CargoDetailSectionProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Detil Kargo & Spesifikasi</CardTitle>
        <CardDescription>Masukkan rincian dimensi, berat, dan kategori kargo Anda.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        {!isLCL ? (
          <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipe Kontainer {isFCL && <span className="text-red-500">*</span>}</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={containerTypeId}
                onChange={(e) => setContainerTypeId(e.target.value)}
                required={isFCL}
              >
                <option value="">Pilih tipe kontainer</option>
                {containerTypes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.size})
                  </option>
                ))}
              </select>
              {selectedCT && (
                <div className="text-[10px] text-zinc-500 flex gap-4 px-1 font-mono uppercase bg-zinc-50 py-1 rounded">
                  <span>P: {selectedCT.length || 0} cm</span>
                  <span>L: {selectedCT.width || 0} cm</span>
                  <span>T: {selectedCT.height || 0} cm</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Jumlah Kontainer</Label>
              <Input
                type="number"
                min={1}
                value={containerCount}
                onChange={(e) => setContainerCount(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3 bg-zinc-50/50 p-4 rounded-lg border border-dashed">
            <div className="space-y-2">
              <Label>Panjang (cm)</Label>
              <Input
                type="number"
                value={itemLength}
                onChange={(e) => setItemLength(e.target.value)}
                placeholder="cm"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Lebar (cm)</Label>
              <Input
                type="number"
                value={itemWidth}
                onChange={(e) => setItemWidth(e.target.value)}
                placeholder="cm"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Tinggi (cm)</Label>
              <Input
                type="number"
                value={itemHeight}
                onChange={(e) => setItemHeight(e.target.value)}
                placeholder="cm"
                className="bg-white"
              />
            </div>
            <p className="sm:col-span-3 text-[10px] text-muted-foreground">* Dimensi digunakan untuk menghitung CBM secara otomatis.</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Total Berat (kg)</Label>
          <Input
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={!isLCL && !!selectedCT}
            className={!isLCL && selectedCT ? "bg-zinc-100 italic" : "bg-white"}
          />
        </div>
        <div className="space-y-2">
          <Label>Total CBM</Label>
          <Input
            type="number"
            step="0.01"
            value={cbm}
            onChange={(e) => setCbm(e.target.value)}
            disabled={!!selectedCT || isLCL}
            className={selectedCT || isLCL ? "bg-zinc-100 italic" : "bg-white"}
          />
        </div>

        <div className="space-y-2">
          <Label>Estimasi Tgl Berangkat</Label>
          <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Kategori Kargo</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={cargoCategoryId}
            onChange={(e) => setCargoCategoryId(e.target.value)}
            required
          >
            <option value="">— pilih kategori kargo —</option>
            {cargoCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional: Temperature */}
        {showTemp && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label>Suhu (Celsius) <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="0.0"
              required
            />
          </div>
        )}

        {/* Conditional: Project Cargo Equipment Condition */}
        {showProject && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label>Kondisi Mesin / Unit <span className="text-red-500">*</span></Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={equipmentCondition}
              onChange={(e) => setEquipmentCondition(e.target.value)}
              required
            >
              <option value="">— pilih kondisi —</option>
              <option value="CLEAN">CLEAN (Bersih/Baru)</option>
              <option value="RESIDUAL">RESIDUAL (Bekas/Terdapat sisa BBM)</option>
            </select>
            {equipmentCondition === "RESIDUAL" && (
              <p className="text-[10px] text-amber-600 font-medium">
                * Unit Residual akan otomatis ditandai sebagai Dangerous Goods (DG).
              </p>
            )}
          </div>
        )}

        {/* DG Section */}
        <div className="sm:col-span-2 border-t pt-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_dg"
              checked={isDG}
              onCheckedChange={(checked) => setIsDG(!!checked)}
            />
            <Label htmlFor="is_dg" className="text-sm font-bold cursor-pointer">
              Kargo Berbahaya (Dangerous Goods)
            </Label>
          </div>
          
          {isDG && (
            <div className="grid gap-4 sm:grid-cols-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-amber-50/30 p-4 rounded-xl border border-amber-100">
              <div className="space-y-2">
                <Label>DG Class <span className="text-red-500">*</span></Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={dgClassId}
                  onChange={(e) => setDgClassId(e.target.value)}
                  required
                >
                  <option value="">— pilih class —</option>
                  {dgClasses.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>UN Number <span className="text-red-500">*</span></Label>
                <Input
                  value={unNumber}
                  onChange={(e) => setUnNumber(e.target.value)}
                  placeholder="e.g. UN1263"
                  className="bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Dokumen MSDS <span className="text-red-500">*</span></Label>
                <Input
                  type="file"
                  onChange={(e) => setMsdsFile(e.target.files?.[0] || null)}
                  className="text-xs bg-white h-auto py-1.5"
                  accept=".pdf"
                  required={!msdsFile}
                />
                {msdsFile && <p className="text-[10px] text-zinc-500 truncate">{msdsFile.name}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label className="flex justify-between items-center">
            <span>Deskripsi Barang</span>
            <span className={selectedCC?.code === "MIX" ? "text-[10px] text-red-500 font-bold" : "text-[10px] text-zinc-400"}>
              {selectedCC?.code === "MIX" ? "(Wajib untuk Mixed Cargo)" : "(Opsional)"}
            </span>
          </Label>
          <Textarea
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            rows={3}
            placeholder={selectedCC?.code === "MIX" ? "Detail isi kargo campuran wajib diisi..." : "Sebutkan jenis barang, kemasan, atau catatan spesifik lainnya..."}
            required={selectedCC?.code === "MIX"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
