"use client";

import { useState } from "react";
import { MapPin, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import { shipmentStatusLabel } from "@/lib/shipment-status";

type TrackingPhoto = {
  path?: string;
  url?: string;
};

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
    photos?: TrackingPhoto[];
  }>;
};

export default function CustomerTrackingPage() {
  const [waybill, setWaybill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackingData | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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

  const fmtDateTime = (d?: string | null) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
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
              <ul className="space-y-3 border-l-2 border-muted pl-4">
                {(data.timeline ?? []).map((t, i) => {
                  const photos = Array.isArray(t.photos) ? t.photos : [];
                  return (
                    <li key={i} className="text-sm">
                      <span className="text-muted-foreground">
                        {t.tracked_at ? fmtDateTime(t.tracked_at) : ""}
                      </span>{" "}
                      — {shipmentStatusLabel(t.status)}
                      {t.location ? <span className="block text-muted-foreground">{t.location}</span> : null}
                      {t.notes ? <span className="block text-muted-foreground">{t.notes}</span> : null}

                      {/* ── Photos ── */}
                      {photos.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {photos.map((photo, idx) => {
                            const imgUrl = photo.url || photo.path || "";
                            if (!imgUrl) return null;
                            return (
                              <button
                                key={idx}
                                type="button"
                                className="group relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 shadow-sm transition-all hover:border-zinc-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                onClick={() => setLightboxSrc(imgUrl)}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Foto ${idx + 1}`}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                                  <Camera className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Lightbox overlay */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/40"
            onClick={() => setLightboxSrc(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxSrc}
            alt="Tracking photo"
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
