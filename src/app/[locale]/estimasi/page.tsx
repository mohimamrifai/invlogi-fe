"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  fetchPublicMasterLocations,
  fetchPublicMasterTransportModes,
  fetchPublicMasterServiceTypes,
  fetchPublicMasterContainerTypes,
  fetchPublicMasterAdditionalServices,
  publicEstimateBookingPrice,
} from "@/lib/public-api";
import { ApiError } from "@/lib/api-client";
import type { LaravelPaginated } from "@/lib/types-api";
import { Checkbox } from "@/components/ui/checkbox";

type Loc = { id: number; name: string; code?: string };
type TM = { id: number; name: string; code?: string };
type ST = { id: number; name: string; code?: string; transport_mode_id: number };
type CT = { id: number; name: string; size: string };
type AS = { id: number; name: string; category: string };

export default function PublicEstimatePage() {
  const t = useTranslations("Estimate");
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
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [estimate, setEstimate] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<{
    base_freight: number;
    discount_amount: number;
    additional_services_total: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [locRes, mRes, ctRes, asRes] = await Promise.all([
          fetchPublicMasterLocations(),
          fetchPublicMasterTransportModes(),
          fetchPublicMasterContainerTypes(),
          fetchPublicMasterAdditionalServices(),
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
        setError(t("loadError"));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once; copy uses t() only for error string
  }, []);

  useEffect(() => {
    if (!modeId) return;
    let c = false;
    (async () => {
      try {
        const r = await fetchPublicMasterServiceTypes(Number(modeId));
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

  const fmtIdr = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

  const onEstimate = async () => {
    setError(null);
    setEstimate(null);
    setBreakdown(null);
    setEstimating(true);
    try {
      const payload = {
        origin_location_id: Number(originId),
        destination_location_id: Number(destId),
        transport_mode_id: Number(modeId),
        service_type_id: Number(serviceTypeId),
        container_type_id: containerTypeId ? Number(containerTypeId) : null,
        container_count: Number(containerCount) || 1,
        estimated_weight: weight ? Number(weight) : null,
        estimated_cbm: cbm ? Number(cbm) : null,
        additional_services: selectedAddOns,
      };
      const r = await publicEstimateBookingPrice(payload);
      const inner = (r as { data?: { estimated_price?: number; breakdown?: typeof breakdown } }).data;
      if (inner?.estimated_price != null) {
        setEstimate(fmtIdr(Number(inner.estimated_price)));
        if (inner.breakdown) setBreakdown(inner.breakdown as NonNullable<typeof breakdown>);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("estimateError"));
    } finally {
      setEstimating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center justify-center px-4 pt-24">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pb-16 pt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900/5 text-zinc-900">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{t("title")}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <Link
          href="/tracking"
          className={cn(buttonVariants({ variant: "outline" }), "shrink-0 rounded-full")}
        >
          {t("goTracking")}
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      <Card className="border-zinc-200/80 shadow-sm">
        <CardHeader>
          <CardTitle>{t("formTitle")}</CardTitle>
          <CardDescription>{t("formDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("origin")}</Label>
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
            <Label>{t("destination")}</Label>
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
            <Label>{t("transportMode")}</Label>
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
            <Label>{t("serviceType")}</Label>
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
            <Label>{t("containerType")}</Label>
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
            <Label>{t("containerCount")}</Label>
            <Input
              type="number"
              min={1}
              value={containerCount}
              onChange={(e) => setContainerCount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("weight")}</Label>
            <Input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("cbm")}</Label>
            <Input type="number" step="0.01" value={cbm} onChange={(e) => setCbm(e.target.value)} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>{t("addOns")}</Label>
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

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          className="rounded-full px-8"
          onClick={() => void onEstimate()}
          disabled={estimating || !originId || !destId || !modeId || !serviceTypeId}
        >
          {estimating ? t("estimating") : t("estimateCta")}
        </Button>
        <Link
          href="/register"
          className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}
        >
          {t("registerHint")}
        </Link>
      </div>

      {estimate ? (
        <Card className="border-emerald-200/80 bg-emerald-50/40">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-900">{t("resultTitle")}</CardTitle>
            <CardDescription className="text-emerald-800/90">{t("resultNote")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold tracking-tight text-emerald-950">{estimate}</p>
            {breakdown ? (
              <ul className="text-sm text-emerald-900/80">
                <li>
                  {t("breakdownBase")}: {fmtIdr(breakdown.base_freight)}
                </li>
                {breakdown.discount_amount > 0 ? (
                  <li>
                    {t("breakdownDiscount")}: −{fmtIdr(breakdown.discount_amount)}
                  </li>
                ) : null}
                <li>
                  {t("breakdownAddOns")}: {fmtIdr(breakdown.additional_services_total)}
                </li>
                <li className="font-medium">
                  {t("breakdownTotal")}: {fmtIdr(breakdown.total)}
                </li>
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
