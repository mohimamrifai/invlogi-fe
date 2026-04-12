"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loc, TM, ST } from "../../hooks/use-booking-form";

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
}

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
}: RouteServiceSectionProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Rute & Jenis Layanan</CardTitle>
        <CardDescription>Pilih asal, tujuan, dan moda transportasi pengiriman Anda.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Kota Asal (Origin)</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
        <div className="space-y-2">
          <Label>Kota Tujuan (Destination)</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
        <div className="space-y-2">
          <Label>Moda Transportasi</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
        <div className="space-y-2">
          <Label>Tipe Layanan</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      </CardContent>
    </Card>
  );
}
