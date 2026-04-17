"use client";

import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
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
  createAdminBooking,
  estimateAdminBookingPrice,
  fetchAdminAdditionalServices,
  fetchAdminCompanies,
  fetchAdminContainerTypes,
  fetchAdminLocations,
  fetchAdminServiceTypes,
  fetchAdminTransportModes,
  fetchAdminCargoCategories,
  fetchAdminDgClasses,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import type { LaravelPaginated } from "@/lib/types-api";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/lib/store";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";

import { DangerousGoodsSection } from "@/components/dashboard/admin/bookings/create/dangerous-goods-section";
import { ShipperConsigneeSection } from "@/components/dashboard/admin/bookings/create/shipper-consignee-section";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type Company = { id: number; name: string };
type Loc = { id: number; name: string; code?: string };
type TM = { id: number; name: string; code?: string };
type ST = { id: number; name: string; code?: string; transport_mode_id: number };
type CT = { id: number; name: string; size: string };
type AS = { id: number; name: string; category: string; code?: string | null };
type DC = { id: number; name: string; code: string };
type CC = { id: number; name: string; code: string };
type EstimateBreakdown = {
  base_freight: number;
  discount_amount: number;
  additional_services_total: number;
  total: number;
};
type ComboOption = { value: string; label: string };

const FCL_MANDATORY_CODES = ["FREE_STORAGE_FCL", "LOLO", "CONTAINER_RENT"];
const LCL_MANDATORY_CODES = ["FREE_STORAGE_LCL"];
const ALL_MANDATORY_CODES = [...FCL_MANDATORY_CODES, ...LCL_MANDATORY_CODES];

const PER_PAGE = 1000;

export default function AdminCreateBookingPage() {
  const router = useRouter();
  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();

  const canCreate = useMemo(() => {
    if (!authHydrated) return false;
    const roles = user?.roles ?? [];
    return roles.includes("super_admin") || roles.includes("operations");
  }, [authHydrated, user?.roles]);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [locations, setLocations] = useState<Loc[]>([]);
  const [modes, setModes] = useState<TM[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ST[]>([]);
  const [containerTypes, setContainerTypes] = useState<CT[]>([]);
  const [addServices, setAddServices] = useState<AS[]>([]);
  const [cargoCats, setCargoCats] = useState<CC[]>([]);
  const [dgClasses, setDgClasses] = useState<DC[]>([]);

  const [companyId, setCompanyId] = useState("");
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
  const [cargoCategoryId, setCargoCategoryId] = useState("");
  
  const [shipper, setShipper] = useState({ name: "", address: "", phone: "" });
  const [consignee, setConsignee] = useState({ name: "", address: "", phone: "" });

  const [isDg, setIsDg] = useState(false);
  const [dgClassId, setDgClassId] = useState("");
  const [unNumber, setUnNumber] = useState("");
  const [msdsFile, setMsdsFile] = useState<File | null>(null);

  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [estimate, setEstimate] = useState<string | null>(null);
  const [estimateBreakdown, setEstimateBreakdown] = useState<EstimateBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    let c = false;
    (async () => {
      try {
        const [coRes, locRes, mRes, ctRes, asRes, ccRes, dgRes] = await Promise.all([
          fetchAdminCompanies({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminLocations({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminTransportModes({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminContainerTypes({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminAdditionalServices({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminCargoCategories({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminDgClasses({ page: 1, perPage: PER_PAGE, status: "active" }),
        ]);
        if (c) return;
        setCompanies(((coRes as LaravelPaginated<Company>).data ?? []) as Company[]);
        setLocations(((locRes as LaravelPaginated<Loc>).data ?? []) as Loc[]);
        const rawModes = ((mRes as LaravelPaginated<TM>).data ?? []) as TM[];
        const railFirst = rawModes.filter((x) => x.code === "RAIL");
        setModes(railFirst.length ? railFirst : rawModes);
        setContainerTypes(((ctRes as LaravelPaginated<CT>).data ?? []) as CT[]);
        setAddServices(((asRes as LaravelPaginated<AS>).data ?? []) as AS[]);
        setCargoCats(((ccRes as LaravelPaginated<CC>).data ?? []) as CC[]);
        setDgClasses(((dgRes as LaravelPaginated<DC>).data ?? []) as DC[]);

        const defaultCompany = ((coRes as LaravelPaginated<Company>).data ?? [])[0]?.id;
        if (defaultCompany) setCompanyId(String(defaultCompany));

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
  }, [authHydrated]);

  useEffect(() => {
    if (!authHydrated) return;
    if (!modeId) return;
    let c = false;
    (async () => {
      try {
        const r = await fetchAdminServiceTypes({
          page: 1,
          perPage: PER_PAGE,
          status: "active",
          transportModeId: Number(modeId),
        });
        if (c) return;
        const rows = ((r as LaravelPaginated<ST>).data ?? []) as ST[];
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
  }, [authHydrated, modeId]);

  const selectedST = serviceTypes.find((s) => String(s.id) === serviceTypeId);
  const isFCL = selectedST?.code === "FCL";
  const isLCL = selectedST?.code === "LCL";
  const selectedCompany = companies.find((c) => String(c.id) === companyId);
  const selectedOrigin = locations.find((l) => String(l.id) === originId);
  const selectedDestination = locations.find((l) => String(l.id) === destId);
  const selectedMode = modes.find((m) => String(m.id) === modeId);
  const selectedContainerType = containerTypes.find((c) => String(c.id) === containerTypeId);
  const selectedCargoCategory = cargoCats.find((c) => String(c.id) === cargoCategoryId);
  const companyOptions: ComboOption[] = companies.map((c) => ({ value: String(c.id), label: c.name }));
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
  const containerOptions: ComboOption[] = [
    { value: "__none__", label: "—" },
    ...containerTypes.map((c) => ({ value: String(c.id), label: `${c.name} (${c.size})` })),
  ];
  const cargoCategoryOptions: ComboOption[] = cargoCats.map((c) => ({ value: String(c.id), label: c.name }));

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

  const buildPayload = () => {
    const fd = new FormData();
    fd.append("company_id", companyId);
    fd.append("origin_location_id", originId);
    fd.append("destination_location_id", destId);
    fd.append("transport_mode_id", modeId);
    fd.append("service_type_id", serviceTypeId);
    if (containerTypeId) fd.append("container_type_id", containerTypeId);
    fd.append("container_count", containerCount);
    if (weight) fd.append("estimated_weight", weight);
    if (cbm) fd.append("estimated_cbm", cbm);
    fd.append("cargo_category_id", cargoCategoryId);
    if (pickupDate) fd.append("departure_date", pickupDate);
    if (cargo) fd.append("cargo_description", cargo);
    
    if (shipper.name) fd.append("shipper_name", shipper.name);
    if (shipper.address) fd.append("shipper_address", shipper.address);
    if (shipper.phone) fd.append("shipper_phone", shipper.phone);
    if (consignee.name) fd.append("consignee_name", consignee.name);
    if (consignee.address) fd.append("consignee_address", consignee.address);
    if (consignee.phone) fd.append("consignee_phone", consignee.phone);
    
    fd.append("is_dangerous_goods", isDg ? "1" : "0");
    if (isDg && dgClassId) fd.append("dg_class_id", dgClassId);
    if (isDg && unNumber) fd.append("un_number", unNumber);
    if (isDg && msdsFile) fd.append("msds_file", msdsFile);
    
    fd.append("additional_services", JSON.stringify(selectedAddOns.map((id) => ({ id }))));
    
    return fd;
  };

  const onEstimate = async () => {
    setError(null);
    setEstimate(null);
    setEstimateBreakdown(null);
    try {
      const r = await estimateAdminBookingPrice({
        company_id: Number(companyId),
        origin_location_id: Number(originId),
        destination_location_id: Number(destId),
        transport_mode_id: Number(modeId),
        service_type_id: Number(serviceTypeId),
        container_type_id: containerTypeId ? Number(containerTypeId) : null,
        container_count: Number(containerCount) || 1,
        estimated_weight: weight ? Number(weight) : null,
        estimated_cbm: cbm ? Number(cbm) : null,
        additional_services: selectedAddOns,
      });
      const inner = (r as { data?: { estimated_price?: number; breakdown?: EstimateBreakdown } }).data;
      setEstimate(
        inner?.estimated_price != null
          ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
              Number(inner.estimated_price)
            )
          : "Estimasi tidak tersedia"
      );
      if (inner?.breakdown) {
        setEstimateBreakdown(inner.breakdown);
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Gagal estimasi";
      setError(msg);
      toast.error(msg);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors(null);
    setSubmitting(true);
    try {
      await createAdminBooking(buildPayload());
      toast.success("Booking berhasil dibuat.");
      router.push("/dashboard/admin/bookings");
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as { errors?: Record<string, string[]> };
        if (body.errors) {
          setValidationErrors(body.errors);
          setError("Terdapat kesalahan validasi. Silakan periksa kolom yang bertanda merah.");
        } else {
          setError(err.message);
        }
      } else {
        const msg = err instanceof ApiError ? err.message : "Gagal menyimpan";
        setError(msg);
      }
      toast.error("Gagal membuat booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderError = (field: string) => {
    const msgs = validationErrors?.[field];
    if (!msgs || msgs.length === 0) return null;
    return <p className="mt-1 text-[11px] font-medium text-red-500">{msgs[0]}</p>;
  };

  if (!canCreate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses ditolak</CardTitle>
          <CardDescription>Role Anda tidak memiliki izin tambah booking.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push("/dashboard/admin/bookings")}>
            Kembali
          </Button>
        </CardContent>
      </Card>
    );
  }

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
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Tambah Booking</h1>
            <p className="mt-1 text-sm text-muted-foreground">Buat booking customer oleh tim internal.</p>
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
            <CardDescription>Pilih customer, lokasi, layanan, dan kargo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Customer</Label>
              <Combobox
                items={companyOptions}
                value={companyOptions.find((x) => x.value === companyId) ?? null}
                onValueChange={(next) => setCompanyId(next?.value ?? "")}
              >
                <ComboboxInput
                  className={cn("w-full", validationErrors?.company_id && "[&_input]:border-red-500")}
                  placeholder="Pilih customer..."
                />
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
              {selectedCompany ? <p className="text-[11px] text-zinc-500">Dipilih: {selectedCompany.name}</p> : null}
              {renderError("company_id")}
            </div>
            <div className="space-y-2">
              <Label>Origin</Label>
              <Combobox
                items={locationOptions}
                value={locationOptions.find((x) => x.value === originId) ?? null}
                onValueChange={(next) => setOriginId(next?.value ?? "")}
              >
                <ComboboxInput
                  className={cn("w-full", validationErrors?.origin_location_id && "[&_input]:border-red-500")}
                  placeholder="Pilih origin..."
                />
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
              {selectedOrigin ? <p className="text-[11px] text-zinc-500">Dipilih: {selectedOrigin.name}</p> : null}
              {renderError("origin_location_id")}
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Combobox
                items={locationOptions}
                value={locationOptions.find((x) => x.value === destId) ?? null}
                onValueChange={(next) => setDestId(next?.value ?? "")}
              >
                <ComboboxInput
                  className={cn("w-full", validationErrors?.destination_location_id && "[&_input]:border-red-500")}
                  placeholder="Pilih destination..."
                />
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
              {selectedDestination ? <p className="text-[11px] text-zinc-500">Dipilih: {selectedDestination.name}</p> : null}
              {renderError("destination_location_id")}
            </div>
            <div className="space-y-2">
              <Label>Transport mode</Label>
              <Combobox
                items={modeOptions}
                value={modeOptions.find((x) => x.value === modeId) ?? null}
                onValueChange={(next) => setModeId(next?.value ?? "")}
              >
                <ComboboxInput
                  className={cn("w-full", validationErrors?.transport_mode_id && "[&_input]:border-red-500")}
                  placeholder="Pilih moda..."
                />
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
              {selectedMode ? <p className="text-[11px] text-zinc-500">Dipilih: {selectedMode.name}</p> : null}
              {renderError("transport_mode_id")}
            </div>
            <div className="space-y-2">
              <Label>Service type</Label>
              <Combobox
                items={serviceOptions}
                value={serviceOptions.find((x) => x.value === serviceTypeId) ?? null}
                onValueChange={(next) => setServiceTypeId(next?.value ?? "")}
              >
                <ComboboxInput
                  className={cn("w-full", validationErrors?.service_type_id && "[&_input]:border-red-500")}
                  placeholder="Pilih layanan..."
                />
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
              {selectedST ? <p className="text-[11px] text-zinc-500">Dipilih: {selectedST.name}</p> : null}
              {renderError("service_type_id")}
            </div>
            <div className="space-y-2">
              <Label>Container type (opsional)</Label>
              <Combobox
                items={containerOptions}
                value={containerOptions.find((x) =>
                  x.value === (containerTypeId || "__none__")
                ) ?? null}
                onValueChange={(next) =>
                  setContainerTypeId(next?.value && next.value !== "__none__" ? next.value : "")
                }
              >
                <ComboboxInput className="w-full" placeholder="Pilih tipe kontainer..." />
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
              {selectedContainerType ? <p className="text-[11px] text-zinc-500">Dipilih: {selectedContainerType.name}</p> : null}
              {renderError("container_type_id")}
            </div>
            <div className="space-y-2">
              <Label>Jumlah kontainer</Label>
              <Input
                type="number"
                min={1}
                value={containerCount}
                onChange={(e) => setContainerCount(e.target.value)}
                className={cn(
                  "h-9",
                  validationErrors?.container_count ? "border-red-500" : ""
                )}
              />
              {renderError("container_count")}
            </div>
            <div className="space-y-2">
              <Label>Berat estimasi (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={cn(
                  "h-9",
                  validationErrors?.estimated_weight ? "border-red-500" : ""
                )}
              />
              {renderError("estimated_weight")}
            </div>
            <div className="space-y-2">
              <Label>CBM estimasi</Label>
              <Input
                type="number"
                step="0.01"
                value={cbm}
                onChange={(e) => setCbm(e.target.value)}
                className={cn(
                  "h-9",
                  validationErrors?.estimated_cbm ? "border-red-500" : ""
                )}
              />
              {renderError("estimated_cbm")}
            </div>
            <div className="space-y-2">
              <Label>Kategori kargo</Label>
              <Combobox
                items={cargoCategoryOptions}
                value={cargoCategoryOptions.find((x) => x.value === cargoCategoryId) ?? null}
                onValueChange={(next) => setCargoCategoryId(next?.value ?? "")}
              >
                <ComboboxInput
                  className={cn("w-full", validationErrors?.cargo_category_id && "[&_input]:border-red-500")}
                  placeholder="Pilih kategori..."
                />
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
              {selectedCargoCategory ? <p className="text-[11px] text-zinc-500">Dipilih: {selectedCargoCategory.name}</p> : null}
              {renderError("cargo_category_id")}
            </div>
            <div className="space-y-2">
              <Label>Tanggal keberangkatan (est.)</Label>
              <Input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className={cn(
                  "h-9",
                  validationErrors?.departure_date ? "border-red-500" : ""
                )}
              />
              {renderError("departure_date")}
            </div>
            
            <DangerousGoodsSection
              isDg={isDg}
              onIsDgChange={setIsDg}
              dgClassId={dgClassId}
              onDgClassIdChange={setDgClassId}
              unNumber={unNumber}
              onUnNumberChange={setUnNumber}
              onMsdsFileChange={setMsdsFile}
              dgClasses={dgClasses}
              validationErrors={validationErrors ?? undefined}
              renderError={renderError}
            />

            <div className="sm:col-span-2 space-y-2">
              <Label>Deskripsi kargo</Label>
              <Textarea
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                rows={3}
                placeholder="Sebutkan isi paket secara detail..."
                className={cn(
                  "min-h-[80px]",
                  validationErrors?.cargo_description ? "border-red-500" : ""
                )}
              />
              {renderError("cargo_description")}
            </div>
  
              <ShipperConsigneeSection
                shipper={shipper}
                onShipperChange={(f) => setShipper(s => ({ ...s, ...f }))}
                consignee={consignee}
                onConsigneeChange={(f) => setConsignee(c => ({ ...c, ...f }))}
                renderError={renderError}
                validationErrors={validationErrors ?? undefined}
              />

            <div className="sm:col-span-2 space-y-2">
              <Label>Layanan tambahan</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {addServices.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedAddOns.includes(a.id)}
                      disabled={
                        (isFCL && FCL_MANDATORY_CODES.includes(a.code ?? "")) ||
                        (isLCL && LCL_MANDATORY_CODES.includes(a.code ?? ""))
                      }
                      onCheckedChange={(v) => {
                        const isMandatory =
                          (isFCL && FCL_MANDATORY_CODES.includes(a.code ?? "")) ||
                          (isLCL && LCL_MANDATORY_CODES.includes(a.code ?? ""));
                        if (isMandatory) return;
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
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Informasi Biaya</p>
            <p className="mt-1 text-lg font-black text-emerald-700">{estimate}</p>
            <p className="text-[10px] text-zinc-500">
              * Harga di atas bersifat estimasi dan akan dikonfirmasi kembali oleh operasional.
            </p>
            {estimateBreakdown ? (
              <div className="mt-4 space-y-2 border-t border-zinc-200 pt-3 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Base Freight</span>
                  <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(estimateBreakdown.base_freight)}</span>
                </div>
                {estimateBreakdown.discount_amount > 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon</span>
                    <span>-{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(estimateBreakdown.discount_amount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-zinc-600">
                  <span>Layanan Tambahan</span>
                  <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(estimateBreakdown.additional_services_total)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(estimateBreakdown.total)}</span>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => void onEstimate()}>
            Estimasi harga
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
