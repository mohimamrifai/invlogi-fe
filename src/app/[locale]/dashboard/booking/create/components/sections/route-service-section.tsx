"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loc, TM, ST } from "../../hooks/use-booking-form";
import { cn } from "@/lib/utils";

interface RouteServiceSectionProps {
  locations: Loc[];
  modes: TM[];
  serviceTypes: ST[];
  originId: string;
  setOriginId: (v: string) => void;
  destId: string;
  setDestId: (v: string) => void;
  modeId: string;
  setModeId: (v: string) => void;
  serviceTypeId: string;
  setServiceTypeId: (v: string) => void;
  renderFieldError: (field: string) => string | null;
}

const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function RouteServiceSection({
  locations,
  modes,
  serviceTypes,
  originId,
  setOriginId,
  destId,
  setDestId,
  modeId,
  setModeId,
  serviceTypeId,
  setServiceTypeId,
  renderFieldError,
}: RouteServiceSectionProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Rute &amp; Jenis Layanan</CardTitle>
        <CardDescription>Pilih asal, tujuan, dan moda transportasi pengiriman Anda.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Kota Asal (Origin) <span className="text-red-500">*</span></Label>
          <select
            className={cn(selectCls, renderFieldError("origin_location_id") && "border-red-500 ring-2 ring-red-500/20")}
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
            required
          >
            <option value="">Pilih lokasi asal</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} {l.code ? `(${l.code})` : ""}
              </option>
            ))}
          </select>
          {renderFieldError("origin_location_id") && (
            <p className="text-[11px] font-medium text-red-500">{renderFieldError("origin_location_id")}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Kota Tujuan (Destination) <span className="text-red-500">*</span></Label>
          <select
            className={cn(selectCls, renderFieldError("destination_location_id") && "border-red-500 ring-2 ring-red-500/20")}
            value={destId}
            onChange={(e) => setDestId(e.target.value)}
            required
          >
            <option value="">Pilih lokasi tujuan</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} {l.code ? `(${l.code})` : ""}
              </option>
            ))}
          </select>
          {renderFieldError("destination_location_id") && (
            <p className="text-[11px] font-medium text-red-500">{renderFieldError("destination_location_id")}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Moda Transportasi <span className="text-red-500">*</span></Label>
          <select
            className={cn(selectCls, renderFieldError("transport_mode_id") && "border-red-500 ring-2 ring-red-500/20")}
            value={modeId}
            onChange={(e) => setModeId(e.target.value)}
            required
          >
            {modes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.code ? `(${m.code})` : ""}
              </option>
            ))}
          </select>
          {renderFieldError("transport_mode_id") && (
            <p className="text-[11px] font-medium text-red-500">{renderFieldError("transport_mode_id")}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Tipe Layanan <span className="text-red-500">*</span></Label>
          <select
            className={cn(selectCls, renderFieldError("service_type_id") && "border-red-500 ring-2 ring-red-500/20")}
            value={serviceTypeId}
            onChange={(e) => setServiceTypeId(e.target.value)}
            required
          >
            {serviceTypes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.code ? `(${s.code})` : ""}
              </option>
            ))}
          </select>
          {renderFieldError("service_type_id") && (
            <p className="text-[11px] font-medium text-red-500">{renderFieldError("service_type_id")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
