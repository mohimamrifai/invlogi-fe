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
  fetchPublicMasterCargoCategories,
  fetchPublicMasterDgClasses,
  publicEstimateBookingPrice,
} from "@/lib/public-api";
import { ApiError } from "@/lib/api-client";
import type { LaravelPaginated } from "@/lib/types-api";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type Loc = { id: number; name: string; code?: string };
type TM = { id: number; name: string; code?: string };
type ST = { id: number; name: string; code?: string; transport_mode_id: number };
type CT = {
  id: number;
  name: string;
  size: string;
  length?: number;
  width?: number;
  height?: number;
  capacity_weight?: number;
  capacity_cbm?: number;
};
type AS = { id: number; name: string; category: string; code?: string | null };
type CC = {
  id: number;
  name: string;
  code: string;
  requires_temperature?: boolean;
  is_project_cargo?: boolean;
  is_liquid?: boolean;
  is_food?: boolean;
};
type DC = { id: number; name: string; code: string };

const FCL_MANDATORY_CODES = ["FREE_STORAGE_FCL", "LOLO", "CONTAINER_RENT"];
const LCL_MANDATORY_CODES = ["FREE_STORAGE_LCL"];
const ALL_MANDATORY_CODES = [...FCL_MANDATORY_CODES, ...LCL_MANDATORY_CODES];

type ComboOption = { value: string; label: string };

export default function PublicEstimatePage() {
  const t = useTranslations("Estimate");
  const [locations, setLocations] = useState<Loc[]>([]);
  const [modes, setModes] = useState<TM[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ST[]>([]);
  const [containerTypes, setContainerTypes] = useState<CT[]>([]);
  const [addServices, setAddServices] = useState<AS[]>([]);
  const [cargoCategories, setCargoCategories] = useState<CC[]>([]);
  const [dgClasses, setDgClasses] = useState<DC[]>([]);

  const [originId, setOriginId] = useState("");
  const [destId, setDestId] = useState("");
  const [modeId, setModeId] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [containerTypeId, setContainerTypeId] = useState("");
  const [containerCount, setContainerCount] = useState("1");
  const [weight, setWeight] = useState("");
  const [cbm, setCbm] = useState("");
  const [cargoCategoryId, setCargoCategoryId] = useState("");
  
  const [isDG, setIsDG] = useState(false);
  const [dgClassId, setDgClassId] = useState("");
  const [unNumber, setUnNumber] = useState("");
  const [equipmentCondition, setEquipmentCondition] = useState("");
  const [temperature, setTemperature] = useState("");
  
  const [itemLength, setItemLength] = useState("");
  const [itemWidth, setItemWidth] = useState("");
  const [itemHeight, setItemHeight] = useState("");
  
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
        const [locRes, mRes, ctRes, asRes, ccRes, dgRes] = await Promise.all([
          fetchPublicMasterLocations(),
          fetchPublicMasterTransportModes(),
          fetchPublicMasterContainerTypes(),
          fetchPublicMasterAdditionalServices(),
          fetchPublicMasterCargoCategories(),
          fetchPublicMasterDgClasses(),
        ]);
        if (c) return;
        setLocations(((locRes as LaravelPaginated<Loc>).data ?? []) as Loc[]);
        const rawModes = (mRes as { data: TM[] }).data ?? [];
        const railFirst = rawModes.filter((x) => x.code === "RAIL");
        setModes(railFirst.length ? railFirst : rawModes);
        setContainerTypes(((ctRes as { data: CT[] }).data ?? []) as CT[]);
        setAddServices(((asRes as { data: AS[] }).data ?? []) as AS[]);
        setCargoCategories(((ccRes as { data: CC[] }).data ?? []) as CC[]);
        setDgClasses(((dgRes as { data: DC[] }).data ?? []) as DC[]);
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

  const selectedST = serviceTypes.find((s) => String(s.id) === serviceTypeId);
  const isFCL = selectedST?.code === "FCL";
  const isLCL = selectedST?.code === "LCL";
  const selectedCT = containerTypes.find((c) => String(c.id) === containerTypeId);
  const selectedOrigin = locations.find((l) => String(l.id) === originId);
  const selectedDest = locations.find((l) => String(l.id) === destId);
  const selectedMode = modes.find((m) => String(m.id) === modeId);
  const selectedCC = cargoCategories.find((c) => String(c.id) === cargoCategoryId);
  const selectedDgClass = dgClasses.find((d) => String(d.id) === dgClassId);

  const showTemp = selectedCC?.requires_temperature;
  const showProject = selectedCC?.is_project_cargo;

  const locationOptions: ComboOption[] = locations.map((l) => ({
    value: String(l.id),
    label: `${l.name}${l.code ? ` (${l.code})` : ""}`,
  }));
  const modeOptions: ComboOption[] = modes.map((m) => ({
    value: String(m.id),
    label: `${m.name}${m.code ? ` (${m.code})` : ""}`,
  }));
  const serviceOptions: ComboOption[] = serviceTypes.map((s) => ({
    value: String(s.id),
    label: `${s.name}${s.code ? ` (${s.code})` : ""}`,
  }));
  const containerOptions: ComboOption[] = containerTypes.map((c) => ({
    value: String(c.id),
    label: `${c.name} (${c.size})`,
  }));
  const cargoCategoryOptions: ComboOption[] = cargoCategories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));
  const dgClassOptions: ComboOption[] = dgClasses.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  useEffect(() => {
    if (addServices.length > 0 && serviceTypeId) {
      const codes = isFCL ? FCL_MANDATORY_CODES : isLCL ? LCL_MANDATORY_CODES : [];
      const mandatoryIds = addServices
        .filter((s) => s.code != null && codes.includes(s.code))
        .map((s) => s.id);
      setSelectedAddOns((prev) => {
        const others = prev.filter(
          (id) =>
            !ALL_MANDATORY_CODES.includes(
              addServices.find((s) => s.id === id)?.code ?? ""
            )
        );
        return Array.from(new Set([...others, ...mandatoryIds]));
      });
    }
  }, [serviceTypeId, addServices, isFCL, isLCL]);

  useEffect(() => {
    if (!isLCL && selectedCT) {
      const qty = Number(containerCount) || 1;
      setWeight(String((selectedCT.capacity_weight || 0) * qty));
      setCbm(String((selectedCT.capacity_cbm || 0) * qty));
    }
  }, [containerTypeId, containerCount, selectedCT, isLCL]);

  useEffect(() => {
    if (isLCL) {
      const l = Number(itemLength) || 0;
      const w = Number(itemWidth) || 0;
      const h = Number(itemHeight) || 0;
      if (l && w && h) {
        setCbm(String((l * w * h) / 1000000));
      }
    }
  }, [isLCL, itemLength, itemWidth, itemHeight]);

  useEffect(() => {
    if (equipmentCondition === "RESIDUAL" || selectedCC?.code === "DG") {
      setIsDG(true);
    } else {
      setIsDG(false);
    }
  }, [equipmentCondition, selectedCC]);

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
        cargo_category_id: cargoCategoryId ? Number(cargoCategoryId) : null,
        container_type_id: !isLCL && containerTypeId ? Number(containerTypeId) : null,
        container_count: !isLCL ? (Number(containerCount) || 1) : null,
        estimated_weight: weight ? Number(weight) : null,
        estimated_cbm: cbm ? Number(cbm) : null,
        is_dangerous_goods: isDG ? 1 : 0,
        dg_class_id: isDG && dgClassId ? Number(dgClassId) : null,
        un_number: isDG && unNumber ? unNumber : null,
        equipment_condition: showProject && equipmentCondition ? equipmentCondition : null,
        temperature: showTemp && temperature ? Number(temperature) : null,
        additional_services: selectedAddOns.map((id) => ({ id })),
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
              <Combobox
                items={locationOptions}
                value={locationOptions.find((x) => x.value === originId) ?? null}
                onValueChange={(next) => setOriginId(next?.value ?? "")}
              >
                <ComboboxInput className="w-full" placeholder="Pilih origin" />
                <ComboboxContent>
                  <ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: ComboOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {selectedOrigin ? (
                <p className="text-[11px] text-zinc-500">Dipilih: {selectedOrigin.name}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("destination")}
              </Label>
              <Combobox
                items={locationOptions}
                value={locationOptions.find((x) => x.value === destId) ?? null}
                onValueChange={(next) => setDestId(next?.value ?? "")}
              >
                <ComboboxInput className="w-full" placeholder="Pilih destination" />
                <ComboboxContent>
                  <ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: ComboOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {selectedDest ? (
                <p className="text-[11px] text-zinc-500">Dipilih: {selectedDest.name}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("transportMode")}
              </Label>
              <Combobox
                items={modeOptions}
                value={modeOptions.find((x) => x.value === modeId) ?? null}
                onValueChange={(next) => setModeId(next?.value ?? "")}
              >
                <ComboboxInput className="w-full" placeholder="Pilih transport mode" />
                <ComboboxContent>
                  <ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: ComboOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {selectedMode ? (
                <p className="text-[11px] text-zinc-500">Dipilih: {selectedMode.name}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("serviceType")}
              </Label>
              <Combobox
                items={serviceOptions}
                value={serviceOptions.find((x) => x.value === serviceTypeId) ?? null}
                onValueChange={(next) => setServiceTypeId(next?.value ?? "")}
              >
                <ComboboxInput className="w-full" placeholder="Pilih service type" />
                <ComboboxContent>
                  <ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: ComboOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {selectedST ? (
                <p className="text-[11px] text-zinc-500">Dipilih: {selectedST.name}</p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2 border-t border-zinc-100 pt-5 mt-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Kategori Kargo <span className="text-red-500">*</span>
              </Label>
              <Combobox
                items={cargoCategoryOptions}
                value={cargoCategoryOptions.find((x) => x.value === cargoCategoryId) ?? null}
                onValueChange={(next) => setCargoCategoryId(next?.value ?? "")}
              >
                <ComboboxInput className="w-full" placeholder="Pilih kategori kargo" />
                <ComboboxContent>
                  <ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: ComboOption) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {selectedCC ? (
                <p className="text-[11px] text-zinc-500">Dipilih: {selectedCC.name}</p>
              ) : null}
            </div>

            {showTemp && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Suhu (Celsius) <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20"
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="0.0"
                />
              </div>
            )}

            {showProject && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Kondisi Mesin / Unit <span className="text-red-500">*</span>
                </Label>
                <select
                  className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20 focus-visible:outline-none"
                  value={equipmentCondition}
                  onChange={(e) => setEquipmentCondition(e.target.value)}
                >
                  <option value="">— pilih kondisi —</option>
                  <option value="CLEAN">CLEAN (Bersih/Baru)</option>
                  <option value="RESIDUAL">RESIDUAL (Bekas/Terdapat sisa BBM)</option>
                </select>
                {equipmentCondition === "RESIDUAL" && (
                  <p className="text-[10px] text-amber-600 font-medium">
                    * Unit Residual otomatis ditandai sebagai Dangerous Goods (DG).
                  </p>
                )}
              </div>
            )}

            {!isLCL ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {t("containerType")} {isFCL && <span className="text-red-500">*</span>}
                  </Label>
                  <Combobox
                    items={containerOptions}
                    value={containerOptions.find((x) => x.value === containerTypeId) ?? null}
                    onValueChange={(next) => setContainerTypeId(next?.value ?? "")}
                  >
                    <ComboboxInput className="w-full" placeholder="Pilih container type" />
                    <ComboboxContent>
                      <ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty>
                      <ComboboxList>
                        {(item: ComboOption) => (
                          <ComboboxItem key={item.value} value={item}>
                            {item.label}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {selectedCT ? (
                    <p className="text-[11px] text-zinc-500">Dipilih: {selectedCT.name}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {t("containerCount")}
                  </Label>
                  <Input
                    className="h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20"
                    type="number"
                    min={1}
                    value={containerCount}
                    onChange={(e) => setContainerCount(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3 bg-zinc-50/50 p-4 rounded-xl border border-dashed border-zinc-300">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Panjang (cm)
                  </Label>
                  <Input
                    className="h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20 bg-white"
                    type="number"
                    value={itemLength}
                    onChange={(e) => setItemLength(e.target.value)}
                    placeholder="cm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Lebar (cm)
                  </Label>
                  <Input
                    className="h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20 bg-white"
                    type="number"
                    value={itemWidth}
                    onChange={(e) => setItemWidth(e.target.value)}
                    placeholder="cm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Tinggi (cm)
                  </Label>
                  <Input
                    className="h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20 bg-white"
                    type="number"
                    value={itemHeight}
                    onChange={(e) => setItemHeight(e.target.value)}
                    placeholder="cm"
                  />
                </div>
                <p className="sm:col-span-3 text-[10px] text-zinc-500">* Dimensi digunakan untuk menghitung CBM secara otomatis.</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("weight")}
              </Label>
              <Input
                className={cn(
                  "h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20",
                  !isLCL && selectedCT ? "bg-zinc-100 italic" : "bg-white"
                )}
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={!isLCL && !!selectedCT}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t("cbm")}
              </Label>
              <Input
                className={cn(
                  "h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20",
                  selectedCT || isLCL ? "bg-zinc-100 italic" : "bg-white"
                )}
                type="number"
                step="0.01"
                value={cbm}
                onChange={(e) => setCbm(e.target.value)}
                disabled={!!selectedCT || isLCL}
              />
            </div>

            {isDG && (
              <div className="sm:col-span-2 border-t border-zinc-100 pt-5 mt-2">
                <Label className="text-xs font-bold text-red-600 mb-3 block uppercase tracking-wider">
                  Detail Kargo Berbahaya (DG)
                </Label>
                <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-amber-50/30 p-5 rounded-2xl border border-amber-100">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      DG Class <span className="text-red-500">*</span>
                    </Label>
                    <Combobox
                      items={dgClassOptions}
                      value={dgClassOptions.find((x) => x.value === dgClassId) ?? null}
                      onValueChange={(next) => setDgClassId(next?.value ?? "")}
                    >
                      <ComboboxInput className="w-full bg-white" placeholder="Pilih DG class" />
                      <ComboboxContent>
                        <ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: ComboOption) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {selectedDgClass ? (
                      <p className="text-[11px] text-zinc-500">Dipilih: {selectedDgClass.name}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      UN Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={unNumber}
                      onChange={(e) => setUnNumber(e.target.value)}
                      placeholder="e.g. UN1263"
                      className="h-11 rounded-xl border-zinc-200 shadow-sm focus:border-[#0b1b69] focus:ring-2 focus:ring-[#0b1b69]/20 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
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
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-inner md:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <Package className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Informasi Biaya</p>
                <p className="text-2xl font-black text-emerald-700">{estimate}</p>
                <p className="text-[10px] text-zinc-500">
                  * Harga di atas bersifat estimasi dan akan dikonfirmasi kembali oleh operasional.
                </p>
              </div>
            </div>
            {breakdown ? (
              <div className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>{t("breakdownBase")}</span>
                  <span>{fmtIdr(breakdown.base_freight)}</span>
                </div>
                {breakdown.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>{t("breakdownDiscount")}</span>
                    <span>-{fmtIdr(breakdown.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>{t("breakdownAddOns")}</span>
                  <span>{fmtIdr(breakdown.additional_services_total)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
                  <span>{t("breakdownTotal")}</span>
                  <span>{fmtIdr(breakdown.total)}</span>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="h-16" />
      </div>
    </div>
  );
}
