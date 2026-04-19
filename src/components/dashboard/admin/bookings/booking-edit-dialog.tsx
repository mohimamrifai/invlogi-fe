"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { LaravelPaginated } from "@/lib/types-api";
import {
  fetchAdminAdditionalServices,
  fetchAdminCargoCategories,
  fetchAdminContainerTypes,
  fetchAdminDgClasses,
  fetchAdminLocations,
  fetchAdminServiceTypes,
  fetchAdminTransportModes,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import type { BookingDetail } from "./types";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DangerousGoodsSection } from "@/components/dashboard/admin/bookings/create/dangerous-goods-section";
import { ShipperConsigneeSection } from "@/components/dashboard/admin/bookings/create/shipper-consignee-section";

type Loc = { id: number; name: string; code?: string };
type TM = { id: number; name: string; code?: string };
type ST = { id: number; name: string; code?: string; transport_mode_id: number };
type CT = { id: number; name: string; size: string };
type AS = { id: number; name: string; category: string; code?: string | null };
type DC = { id: number; name: string; code: string };
type CC = {
  id: number;
  name: string;
  code: string;
  requires_temperature?: boolean;
  is_project_cargo?: boolean;
};
type ComboOption = { value: string; label: string };

const PER_PAGE = 1000;

interface BookingEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: BookingDetail | null;
  loading?: boolean;
  saving: boolean;
  onSave: (payload: FormData) => void | Promise<void>;
}

export function BookingEditDialog({
  open,
  onOpenChange,
  data,
  loading = false,
  saving,
  onSave,
}: BookingEditDialogProps) {
  const [locations, setLocations] = useState<Loc[]>([]);
  const [modes, setModes] = useState<TM[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ST[]>([]);
  const [containerTypes, setContainerTypes] = useState<CT[]>([]);
  const [addServices, setAddServices] = useState<AS[]>([]);
  const [cargoCats, setCargoCats] = useState<CC[]>([]);
  const [dgClasses, setDgClasses] = useState<DC[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [originId, setOriginId] = useState("");
  const [destId, setDestId] = useState("");
  const [modeId, setModeId] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [containerTypeId, setContainerTypeId] = useState("");
  const [containerCount, setContainerCount] = useState("1");
  const [weight, setWeight] = useState("");
  const [cbm, setCbm] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [cargo, setCargo] = useState("");
  const [cargoCategoryId, setCargoCategoryId] = useState("");
  const [shipper, setShipper] = useState({ name: "", address: "", phone: "" });
  const [consignee, setConsignee] = useState({ name: "", address: "", phone: "" });
  const [isDg, setIsDg] = useState(false);
  const [dgClassId, setDgClassId] = useState("");
  const [unNumber, setUnNumber] = useState("");
  const [msdsFile, setMsdsFile] = useState<File | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [equipmentCondition, setEquipmentCondition] = useState("");
  const [temperature, setTemperature] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoadingMasters(true);
      setLoadError(null);
      try {
        const [locRes, mRes, ctRes, asRes, ccRes, dgRes] = await Promise.all([
          fetchAdminLocations({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminTransportModes({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminContainerTypes({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminAdditionalServices({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminCargoCategories({ page: 1, perPage: PER_PAGE, status: "active" }),
          fetchAdminDgClasses({ page: 1, perPage: PER_PAGE, status: "active" }),
        ]);
        if (cancelled) return;
        setLocations(((locRes as LaravelPaginated<Loc>).data ?? []) as Loc[]);
        setModes(((mRes as LaravelPaginated<TM>).data ?? []) as TM[]);
        setContainerTypes(((ctRes as LaravelPaginated<CT>).data ?? []) as CT[]);
        setAddServices(((asRes as LaravelPaginated<AS>).data ?? []) as AS[]);
        setCargoCats(((ccRes as LaravelPaginated<CC>).data ?? []) as CC[]);
        setDgClasses(((dgRes as LaravelPaginated<DC>).data ?? []) as DC[]);
      } catch (e) {
        setLoadError(e instanceof ApiError ? e.message : "Gagal memuat master data.");
      } finally {
        if (!cancelled) setLoadingMasters(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !data) return;
    setOriginId(data.origin_location_id ? String(data.origin_location_id) : "");
    setDestId(data.destination_location_id ? String(data.destination_location_id) : "");
    setModeId(data.transport_mode_id ? String(data.transport_mode_id) : "");
    setServiceTypeId(data.service_type_id ? String(data.service_type_id) : "");
    setContainerTypeId(data.container_type_id ? String(data.container_type_id) : "");
    setContainerCount(String(data.container_count ?? 1));
    setWeight(data.estimated_weight ? String(data.estimated_weight) : "");
    setCbm(data.estimated_cbm ? String(data.estimated_cbm) : "");
    setDepartureDate(data.departure_date ? String(data.departure_date).slice(0, 10) : "");
    setCargo(data.cargo_description ?? "");
    setCargoCategoryId(data.cargo_category_id ? String(data.cargo_category_id) : "");
    setShipper({
      name: data.shipper_name ?? "",
      address: data.shipper_address ?? "",
      phone: data.shipper_phone ?? "",
    });
    setConsignee({
      name: data.consignee_name ?? "",
      address: data.consignee_address ?? "",
      phone: data.consignee_phone ?? "",
    });
    setIsDg(Boolean(data.is_dangerous_goods));
    setDgClassId(data.dg_class_id ? String(data.dg_class_id) : "");
    setUnNumber(data.un_number ?? "");
    setEquipmentCondition(data.equipment_condition ?? "");
    setTemperature(data.temperature != null ? String(data.temperature) : "");
    setSelectedAddOns((data.additional_services ?? []).map((s) => Number(s.id)).filter(Boolean));
    setMsdsFile(null);
    setValidationErrors(null);
  }, [open, data]);

  useEffect(() => {
    if (!open || !modeId) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetchAdminServiceTypes({
          page: 1,
          perPage: PER_PAGE,
          status: "active",
          transportModeId: Number(modeId),
        });
        if (cancelled) return;
        const rows = ((r as LaravelPaginated<ST>).data ?? []) as ST[];
        setServiceTypes(rows);
      } catch {
        if (!cancelled) setServiceTypes([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, modeId]);

  const selectedCargoCategory = cargoCats.find((c) => String(c.id) === cargoCategoryId);
  const showTemp = selectedCargoCategory?.requires_temperature;
  const showProject = selectedCargoCategory?.is_project_cargo;

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

  // Sync isDg
  useEffect(() => {
    if (cargoCategoryOptions.length > 0) {
      const selectedCat = cargoCats.find((c) => String(c.id) === cargoCategoryId);
      if (selectedCat?.code === "DG" || equipmentCondition === "RESIDUAL") {
        setIsDg(true);
      } else {
        setIsDg(false);
      }
    }
  }, [cargoCategoryId, equipmentCondition, cargoCats, cargoCategoryOptions.length]);

  const renderError = (field: string) => {
    const msgs = validationErrors?.[field];
    if (!msgs?.length) return null;
    return <p className="mt-1 text-[11px] font-medium text-red-500">{msgs[0]}</p>;
  };

  const submit = async () => {
    setValidationErrors(null);
    const fd = new FormData();
    fd.append("origin_location_id", originId);
    fd.append("destination_location_id", destId);
    fd.append("transport_mode_id", modeId);
    fd.append("service_type_id", serviceTypeId);
    if (containerTypeId) fd.append("container_type_id", containerTypeId);
    fd.append("container_count", containerCount || "1");
    if (weight) fd.append("estimated_weight", weight);
    if (cbm) fd.append("estimated_cbm", cbm);
    fd.append("cargo_category_id", cargoCategoryId);
    if (departureDate) fd.append("departure_date", departureDate);
    if (cargo) fd.append("cargo_description", cargo);
    fd.append("shipper_name", shipper.name);
    fd.append("shipper_address", shipper.address);
    fd.append("shipper_phone", shipper.phone);
    fd.append("consignee_name", consignee.name);
    fd.append("consignee_address", consignee.address);
    fd.append("consignee_phone", consignee.phone);
    fd.append("is_dangerous_goods", isDg ? "1" : "0");
    if (isDg && dgClassId) fd.append("dg_class_id", dgClassId);
    if (isDg && unNumber) fd.append("un_number", unNumber);
    if (isDg && msdsFile) fd.append("msds_file", msdsFile);
    if (showProject && equipmentCondition) fd.append("equipment_condition", equipmentCondition);
    if (showTemp && temperature) fd.append("temperature", temperature);
    fd.append("additional_services", JSON.stringify(selectedAddOns.map((id) => ({ id }))));

    try {
      await onSave(fd);
      onOpenChange(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) {
        const body = e.body as { errors?: Record<string, string[]> };
        setValidationErrors(body.errors ?? null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Ubah detail booking untuk {data?.booking_number ?? "booking"}.
          </DialogDescription>
        </DialogHeader>

        {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat detail booking…</p>
        ) : loadingMasters ? (
          <p className="text-sm text-muted-foreground">Memuat form edit…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Origin</Label>
              <Combobox items={locationOptions} value={locationOptions.find((x) => x.value === originId) ?? null} onValueChange={(next) => setOriginId(next?.value ?? "")}>
                <ComboboxInput className={cn("w-full", validationErrors?.origin_location_id && "[&_input]:border-red-500")} placeholder="Pilih origin..." />
                <ComboboxContent><ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty><ComboboxList>{(item: ComboOption) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent>
              </Combobox>
              {renderError("origin_location_id")}
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Combobox items={locationOptions} value={locationOptions.find((x) => x.value === destId) ?? null} onValueChange={(next) => setDestId(next?.value ?? "")}>
                <ComboboxInput className={cn("w-full", validationErrors?.destination_location_id && "[&_input]:border-red-500")} placeholder="Pilih destination..." />
                <ComboboxContent><ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty><ComboboxList>{(item: ComboOption) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent>
              </Combobox>
              {renderError("destination_location_id")}
            </div>
            <div className="space-y-2">
              <Label>Transport mode</Label>
              <Combobox items={modeOptions} value={modeOptions.find((x) => x.value === modeId) ?? null} onValueChange={(next) => setModeId(next?.value ?? "")}>
                <ComboboxInput className={cn("w-full", validationErrors?.transport_mode_id && "[&_input]:border-red-500")} placeholder="Pilih moda..." />
                <ComboboxContent><ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty><ComboboxList>{(item: ComboOption) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent>
              </Combobox>
              {renderError("transport_mode_id")}
            </div>
            <div className="space-y-2">
              <Label>Service type</Label>
              <Combobox items={serviceOptions} value={serviceOptions.find((x) => x.value === serviceTypeId) ?? null} onValueChange={(next) => setServiceTypeId(next?.value ?? "")}>
                <ComboboxInput className={cn("w-full", validationErrors?.service_type_id && "[&_input]:border-red-500")} placeholder="Pilih layanan..." />
                <ComboboxContent><ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty><ComboboxList>{(item: ComboOption) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent>
              </Combobox>
              {renderError("service_type_id")}
            </div>
            <div className="space-y-2">
              <Label>Container type</Label>
              <Combobox items={containerOptions} value={containerOptions.find((x) => x.value === (containerTypeId || "__none__")) ?? null} onValueChange={(next) => setContainerTypeId(next?.value && next.value !== "__none__" ? next.value : "")}>
                <ComboboxInput className="w-full" placeholder="Pilih tipe kontainer..." />
                <ComboboxContent><ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty><ComboboxList>{(item: ComboOption) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent>
              </Combobox>
              {renderError("container_type_id")}
            </div>
            <div className="space-y-2">
              <Label>Jumlah kontainer</Label>
              <Input value={containerCount} onChange={(e) => setContainerCount(e.target.value.replace(/\D/g, ""))} className={cn("h-9", validationErrors?.container_count && "border-red-500")} />
              {renderError("container_count")}
            </div>
            <div className="space-y-2">
              <Label>Berat Estimasi (kg)</Label>
              <Input value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9" />
              {renderError("estimated_weight")}
            </div>
            <div className="space-y-2">
              <Label>CBM Estimasi</Label>
              <Input value={cbm} onChange={(e) => setCbm(e.target.value)} className="h-9" />
              {renderError("estimated_cbm")}
            </div>
            <div className="space-y-2">
              <Label>Kategori Kargo</Label>
              <Combobox items={cargoCategoryOptions} value={cargoCategoryOptions.find((x) => x.value === cargoCategoryId) ?? null} onValueChange={(next) => setCargoCategoryId(next?.value ?? "")}>
                <ComboboxInput className={cn("w-full", validationErrors?.cargo_category_id && "[&_input]:border-red-500")} placeholder="Pilih kategori..." />
                <ComboboxContent><ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty><ComboboxList>{(item: ComboOption) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent>
              </Combobox>
              {renderError("cargo_category_id")}
            </div>
            <div className="space-y-2">
              <Label>Tanggal keberangkatan</Label>
              <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="h-9" />
              {renderError("departure_date")}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Deskripsi barang</Label>
              <Textarea value={cargo} onChange={(e) => setCargo(e.target.value)} className="min-h-[84px]" />
              {renderError("cargo_description")}
            </div>

            {showProject ? (
              <div className="space-y-2">
                <Label>Kondisi equipment</Label>
                <Input value={equipmentCondition} onChange={(e) => setEquipmentCondition(e.target.value)} className="h-9" placeholder="CLEAN / RESIDUAL" />
                {renderError("equipment_condition")}
              </div>
            ) : null}
            {showTemp ? (
              <div className="space-y-2">
                <Label>Suhu</Label>
                <Input value={temperature} onChange={(e) => setTemperature(e.target.value)} className="h-9" />
                {renderError("temperature")}
              </div>
            ) : null}

            <div className="sm:col-span-2 space-y-3 rounded-lg border p-4">
              <Label>Layanan tambahan</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {addServices.map((svc) => (
                  <label key={svc.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedAddOns.includes(svc.id)}
                      onCheckedChange={(checked) =>
                        setSelectedAddOns((prev) =>
                          checked === true ? Array.from(new Set([...prev, svc.id])) : prev.filter((id) => id !== svc.id)
                        )
                      }
                    />
                    <span>{svc.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <DangerousGoodsSection
              isDg={isDg}
              dgClassId={dgClassId}
              onDgClassIdChange={setDgClassId}
              unNumber={unNumber}
              onUnNumberChange={setUnNumber}
              msdsFile={msdsFile}
              onMsdsFileChange={setMsdsFile}
              dgClasses={dgClasses}
              validationErrors={validationErrors ?? undefined}
              renderError={renderError}
            />

            <ShipperConsigneeSection
              shipper={shipper}
              onShipperChange={(fields) => setShipper((prev) => ({ ...prev, ...fields }))}
              consignee={consignee}
              onConsigneeChange={(fields) => setConsignee((prev) => ({ ...prev, ...fields }))}
              renderError={renderError}
              validationErrors={validationErrors ?? undefined}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button onClick={() => void submit()} disabled={saving || loadingMasters}>
            {saving ? "Menyimpan..." : "Simpan perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
