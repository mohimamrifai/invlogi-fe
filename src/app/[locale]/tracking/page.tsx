"use client";

import { useState } from "react";
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

export default function PublicTrackingPage() {
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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 py-10 px-4 md:pt-36">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Lacak Pengiriman</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan nomor waybill untuk melihat status tanpa login.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cari waybill</CardTitle>
          <CardDescription>Contoh format sesuai data shipment Anda.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="wb">Waybill</Label>
            <Input
              id="wb"
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

      {error ? (
        <p className="text-sm text-red-600 text-center">{error}</p>
      ) : null}

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
