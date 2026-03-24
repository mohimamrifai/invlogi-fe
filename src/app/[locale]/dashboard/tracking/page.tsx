"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import { shipmentStatusLabel } from "@/lib/shipment-status";

type TrackingData = {
  waybill_number: string;
  status: string;
  origin?: { name?: string; code?: string };
  destination?: { name?: string; code?: string };
  estimated_departure?: string | null;
  estimated_arrival?: string | null;
  timeline?: Array<{
    status: string;
    notes?: string | null;
    location?: string | null;
    tracked_at?: string;
  }>;
};

export default function CustomerTrackingPage() {
  const [waybill, setWaybill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackingData | null>(null);

  const search = async () => {
    if (!waybill.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await apiFetch<{ data: TrackingData }>(
        `/tracking?waybill=${encodeURIComponent(waybill.trim())}`,
        { method: "GET", token: null }
      );
      setData(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Pengiriman tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Shipment Tracking</h1>
            <p className="mt-1 text-sm text-muted-foreground">Lacak dengan waybill (API publik yang sama).</p>
          </div>
        </div>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Cari waybill</CardTitle>
          <CardDescription>GET /api/tracking?waybill=… tanpa token.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="wb-dash">Waybill</Label>
            <Input
              id="wb-dash"
              value={waybill}
              onChange={(e) => setWaybill(e.target.value)}
              placeholder="WB-..."
              onKeyDown={(e) => e.key === "Enter" && void search()}
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={() => void search()} disabled={loading}>
              {loading ? "Mencari…" : "Cari"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {data ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">{data.waybill_number}</CardTitle>
            <CardDescription>
              Status: <strong>{shipmentStatusLabel(data.status)}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Asal</p>
                <p className="font-medium">{data.origin?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tujuan</p>
                <p className="font-medium">{data.destination?.name ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. berangkat</p>
                <p>{data.estimated_departure ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. tiba</p>
                <p>{data.estimated_arrival ?? "—"}</p>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2">Timeline</p>
              <ul className="space-y-2 border-l-2 border-muted pl-4">
                {(data.timeline ?? []).map((t, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-muted-foreground">
                      {t.tracked_at ? new Date(t.tracked_at).toLocaleString("id-ID") : ""}
                    </span>{" "}
                    — {shipmentStatusLabel(t.status)}
                    {t.notes ? <span className="block text-muted-foreground">{t.notes}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
