"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calculator, ArrowRight, Search, Loader2, Package } from "lucide-react";
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

const selectClass =
  "flex h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm transition-colors focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20 focus:outline-none";

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
    return () => { c = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return () => { c = true; };
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
      <div className="flex min-h-[60vh] items-center justify-center pt-24">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1b69] via-[#0d2280] to-[#162ea8] pb-16 pt-32 md:pb-20 md:pt-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-[100px]" />
          <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-sky-300/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center md:px-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <Calculator className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-indigo-200 sm:text-base">
            {t("subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tracking"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Search className="h-4 w-4" />
              {t("goTracking")}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-4xl px-6 md:mt-10 md:px-12">
        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl shadow-zinc-200/50 md:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-900">{t("formTitle")}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t("formDescription")}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("origin")}
              </Label>
              <select className={selectClass} value={originId} onChange={(e) => setOriginId(e.target.value)} required>
                <option value="">—</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("destination")}
              </Label>
              <select className={selectClass} value={destId} onChange={(e) => setDestId(e.target.value)} required>
                <option value="">—</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("transportMode")}
              </Label>
              <select className={selectClass} value={modeId} onChange={(e) => setModeId(e.target.value)} required>
                {modes.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("serviceType")}
              </Label>
              <select className={selectClass} value={serviceTypeId} onChange={(e) => setServiceTypeId(e.target.value)} required>
                {serviceTypes.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("containerType")}
              </Label>
              <select className={selectClass} value={containerTypeId} onChange={(e) => setContainerTypeId(e.target.value)}>
                <option value="">—</option>
                {containerTypes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.size})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("containerCount")}
              </Label>
              <Input
                className="h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20"
                type="number" min={1} value={containerCount} onChange={(e) => setContainerCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("weight")}
              </Label>
              <Input
                className="h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20"
                type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("cbm")}
              </Label>
              <Input
                className="h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20"
                type="number" step="0.01" value={cbm} onChange={(e) => setCbm(e.target.value)}
              />
            </div>
            {addServices.length > 0 && (
              <div className="space-y-3 sm:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {t("addOns")}
                </Label>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {addServices.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                        selectedAddOns.includes(a.id)
                          ? "border-[#0b1b69]/30 bg-[#0b1b69]/5 text-[#0b1b69]"
                          : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
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
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-6">
            <Button
              type="button"
              className="gap-2 rounded-full bg-[#0b1b69] px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#0d2280]"
              onClick={() => void onEstimate()}
              disabled={estimating || !originId || !destId || !modeId || !serviceTypeId}
            >
              {estimating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t("estimating")}</>
              ) : (
                <><Calculator className="h-4 w-4" /> {t("estimateCta")}</>
              )}
            </Button>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 rounded-full px-5 py-3 text-sm font-medium text-zinc-600 transition-colors hover:text-[#0b1b69]"
            >
              {t("registerHint")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {estimate ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-lg">
            <div className="border-b border-emerald-100 px-6 py-5 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <Package className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-emerald-900">{t("resultTitle")}</h3>
                  <p className="text-xs text-emerald-700/70">{t("resultNote")}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-6 md:px-8">
              <p className="text-3xl font-bold tracking-tight text-emerald-900">{estimate}</p>
              {breakdown ? (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-emerald-800/70">
                    <span>{t("breakdownBase")}</span>
                    <span>{fmtIdr(breakdown.base_freight)}</span>
                  </div>
                  {breakdown.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>{t("breakdownDiscount")}</span>
                      <span>−{fmtIdr(breakdown.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-800/70">
                    <span>{t("breakdownAddOns")}</span>
                    <span>{fmtIdr(breakdown.additional_services_total)}</span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-200 pt-2 font-semibold text-emerald-900">
                    <span>{t("breakdownTotal")}</span>
                    <span>{fmtIdr(breakdown.total)}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="h-16" />
      </div>
    </div>
  );
}
