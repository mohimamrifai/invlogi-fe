"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipboardList } from "lucide-react";
import {
  fetchCustomerMasterLocations,
  fetchCustomerMasterTransportModes,
  fetchCustomerMasterServiceTypes,
  fetchCustomerMasterContainerTypes,
  fetchCustomerMasterAdditionalServices,
  estimateBookingPrice,
  createCustomerBooking,
} from "@/lib/customer-api";
import { ApiError } from "@/lib/api-client";
import type { LaravelPaginated } from "@/lib/types-api";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "@/i18n/routing";

type Loc = { id: number; name: string; code?: string };
type TM = { id: number; name: string; code?: string };
type ST = { id: number; name: string; code?: string; transport_mode_id: number };
type CT = { id: number; name: string; size: string };
type AS = { id: number; name: string; category: string };

export default function CreateBookingPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Loc[]>([]);
  const [modes, setModes] = useState<TM[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ST[]>([]);
  const [containerTypes, setContainerTypes] = useState<CT[]>([]);
  const [addServices, setAddServices] = useState<AS[]>([]);

  const [originId, setOriginId] = useState("");
  const [destId, setDestId] = useState("");
  const [modeId, setModeId] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [containerTypeId, setContainerTypeId] = useState("");
  const [containerCount, setContainerCount] = useState("1");
  const [weight, setWeight] = useState("");
  const [cbm, setCbm] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [cargo, setCargo] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [estimate, setEstimate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [locRes, mRes, ctRes, asRes] = await Promise.all([
          fetchCustomerMasterLocations(),
          fetchCustomerMasterTransportModes(),
          fetchCustomerMasterContainerTypes(),
          fetchCustomerMasterAdditionalServices(),
        ]);
        if (c) return;
        setLocations(((locRes as LaravelPaginated<Loc>).data ?? []) as Loc[]);
        const rawModes = (mRes as { data: TM[] }).data ?? [];
        const railFirst = rawModes.filter((x) => x.code === "RAIL");
        setModes(railFirst.length ? railFirst : rawModes);
        setContainerTypes(((ctRes as { data: CT[] }).data ?? []) as CT[]);
        setAddServices(((asRes as { data: AS[] }).data ?? []) as AS[]);
        const defaultMode = (railFirst[0] ?? rawModes[0])?.id;
        if (defaultMode) setModeId(String(defaultMode));
      } catch {
        setError("Gagal memuat master data.");
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  useEffect(() => {
    if (!modeId) return;
    let c = false;
    (async () => {
      try {
        const r = await fetchCustomerMasterServiceTypes(Number(modeId));
        if (c) return;
        const rows = (r as { data: ST[] }).data ?? [];
        setServiceTypes(rows);
        const first = rows[0]?.id;
        if (first) setServiceTypeId(String(first));
      } catch {
        setServiceTypes([]);
      }
    })();
    return () => {
      c = true;
    };
  }, [modeId]);

  const buildPayload = () => ({
    origin_location_id: Number(originId),
    destination_location_id: Number(destId),
    transport_mode_id: Number(modeId),
    service_type_id: Number(serviceTypeId),
    container_type_id: containerTypeId ? Number(containerTypeId) : null,
    container_count: Number(containerCount) || 1,
    estimated_weight: weight ? Number(weight) : null,
    estimated_cbm: cbm ? Number(cbm) : null,
    pickup_date: pickupDate || null,
    cargo_description: cargo || null,
    additional_services: selectedAddOns.map((id) => ({ id })),
  });

  const onEstimate = async () => {
    setError(null);
    setEstimate(null);
    try {
      const p = buildPayload();
      const r = await estimateBookingPrice({
        ...p,
        additional_services: selectedAddOns,
      });
      const inner = (r as { data?: { estimated_price?: number } }).data;
      setEstimate(
        inner?.estimated_price != null
          ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
              Number(inner.estimated_price)
            )
          : JSON.stringify(r)
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal estimasi");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createCustomerBooking(buildPayload() as Record<string, unknown>);
      toast.success("Booking berhasil diajukan.");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Memuat form…</p>;
  }

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Buat Booking</h1>
            <p className="mt-1 text-sm text-muted-foreground">Moda default: Rail (sesuai MVP brief).</p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      <form onSubmit={onSubmit}>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Detail pengiriman</CardTitle>
            <CardDescription>Pilih lokasi, layanan, dan kargo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Origin</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                required
              >
                <option value="">—</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                required
              >
                <option value="">—</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Transport mode</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={modeId}
                onChange={(e) => setModeId(e.target.value)}
                required
              >
                {modes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Service type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={serviceTypeId}
                onChange={(e) => setServiceTypeId(e.target.value)}
                required
              >
                {serviceTypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Container type (opsional)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={containerTypeId}
                onChange={(e) => setContainerTypeId(e.target.value)}
              >
                <option value="">—</option>
                {containerTypes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.size})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Jumlah kontainer</Label>
              <Input
                type="number"
                min={1}
                value={containerCount}
                onChange={(e) => setContainerCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Berat estimasi (kg)</Label>
              <Input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CBM estimasi</Label>
              <Input type="number" step="0.01" value={cbm} onChange={(e) => setCbm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Pickup date</Label>
              <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Deskripsi kargo</Label>
              <Textarea value={cargo} onChange={(e) => setCargo(e.target.value)} rows={3} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Layanan tambahan</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {addServices.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedAddOns.includes(a.id)}
                      onCheckedChange={(v) => {
                        const on = v === true;
                        setSelectedAddOns((prev) =>
                          on ? (prev.includes(a.id) ? prev : [...prev, a.id]) : prev.filter((x) => x !== a.id)
                        );
                      }}
                    />
                    {a.name}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {estimate ? (
          <p className="mt-4 text-sm font-medium text-emerald-700">Estimasi: {estimate}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => void onEstimate()}>
            Estimasi harga
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Mengirim…" : "Kirim booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
