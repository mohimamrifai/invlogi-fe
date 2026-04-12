"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchCustomerMasterLocations,
  fetchCustomerMasterTransportModes,
  fetchCustomerMasterServiceTypes,
  fetchCustomerMasterContainerTypes,
  fetchCustomerMasterAdditionalServices,
  fetchCustomerMasterCargoCategories,
  fetchCustomerMasterDgClasses,
  estimateBookingPrice,
  createCustomerBooking,
} from "@/lib/customer-api";
import { ApiError } from "@/lib/api-client";
import type { LaravelPaginated } from "@/lib/types-api";
import { useAuthStore } from "@/lib/store";

export type Loc = { id: number; name: string; code?: string };
export type TM = { id: number; name: string; code?: string };
export type ST = { id: number; name: string; code?: string; transport_mode_id: number };
export type CT = {
  id: number;
  name: string;
  size: string;
  length?: number;
  width?: number;
  height?: number;
  capacity_weight?: number;
  capacity_cbm?: number;
};
export type AS = { id: number; name: string; code?: string | null; category: string };
export type CC = {
  id: number;
  name: string;
  code: string;
  requires_temperature?: boolean;
  is_project_cargo?: boolean;
  is_liquid?: boolean;
  is_food?: boolean;
};

export type DC = { id: number; name: string; code: string };

/** Stable codes for FCL mandatory add-ons (match by code, not name). */
const FCL_MANDATORY_CODES = ['FREE_STORAGE_FCL', 'LOLO', 'CONTAINER_RENT'];
/** Stable codes for LCL mandatory add-ons. */
const LCL_MANDATORY_CODES = ['FREE_STORAGE_LCL'];
/** All mandatory codes combined — used to strip them before re-applying. */
const ALL_MANDATORY_CODES = [...FCL_MANDATORY_CODES, ...LCL_MANDATORY_CODES];

export function useBookingForm() {
  const { user } = useAuthStore();
  const userCompany = user?.company as { name?: string; address?: string; phone?: string } | undefined;

  // Master Data
  const [locations, setLocations] = useState<Loc[]>([]);
  const [modes, setModes] = useState<TM[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ST[]>([]);
  const [containerTypes, setContainerTypes] = useState<CT[]>([]);
  const [addServices, setAddServices] = useState<AS[]>([]);
  const [cargoCategories, setCargoCategories] = useState<CC[]>([]);
  const [dgClasses, setDgClasses] = useState<DC[]>([]);

  // Form State
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
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);

  // NEW: DG & Cargo specific fields
  const [isDG, setIsDG] = useState(false);
  const [dgClassId, setDgClassId] = useState("");
  const [unNumber, setUnNumber] = useState("");
  const [msdsFile, setMsdsFile] = useState<File | null>(null);
  const [equipmentCondition, setEquipmentCondition] = useState("");
  const [temperature, setTemperature] = useState("");

  // LCL Dimensions
  const [itemLength, setItemLength] = useState("");
  const [itemWidth, setItemWidth] = useState("");
  const [itemHeight, setItemHeight] = useState("");

  // Shipper/Consignee
  const [shipperName, setShipperName] = useState("");
  const [shipperAddress, setShipperAddress] = useState("");
  const [shipperPhone, setShipperPhone] = useState("");
  const [isShipperSameAsAccount, setIsShipperSameAsAccount] = useState(false);

  const [consigneeName, setConsigneeName] = useState("");
  const [consigneeAddress, setConsigneeAddress] = useState("");
  const [consigneePhone, setConsigneePhone] = useState("");

  // UI State
  const [estimate, setEstimate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedST = serviceTypes.find((s) => String(s.id) === serviceTypeId);
  const isFCL = selectedST?.code === "FCL";
  const isLCL = selectedST?.code === "LCL";
  const selectedCT = containerTypes.find((c) => String(c.id) === containerTypeId);
  const selectedCC = cargoCategories.find((c) => String(c.id) === cargoCategoryId);

  const showTemp = selectedCC?.requires_temperature;
  const showProject = selectedCC?.is_project_cargo;

  // Initial Load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [locRes, mRes, ctRes, asRes, ccRes, dgRes] = await Promise.all([
          fetchCustomerMasterLocations(),
          fetchCustomerMasterTransportModes(),
          fetchCustomerMasterContainerTypes(),
          fetchCustomerMasterAdditionalServices(),
          fetchCustomerMasterCargoCategories(),
          fetchCustomerMasterDgClasses(),
        ]);
        if (!active) return;
        setLocations(((locRes as LaravelPaginated<Loc>).data ?? []) as Loc[]);
        const rawModes = (mRes as { data: TM[] }).data ?? [];
        setModes(rawModes);
        setContainerTypes(((ctRes as { data: CT[] }).data ?? []) as CT[]);
        setAddServices(((asRes as { data: AS[] }).data ?? []) as AS[]);
        setCargoCategories(((ccRes as { data: CC[] }).data ?? []) as CC[]);
        setDgClasses(((dgRes as { data: DC[] }).data ?? []) as DC[]);
        if (rawModes[0]?.id) setModeId(String(rawModes[0].id));
      } catch {
        setError("Gagal memuat master data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Mode change -> update service types
  useEffect(() => {
    if (!modeId) return;
    let active = true;
    (async () => {
      try {
        const r = await fetchCustomerMasterServiceTypes(Number(modeId));
        if (!active) return;
        const rows = (r as { data: ST[] }).data ?? [];
        setServiceTypes(rows);
        if (rows[0]?.id) setServiceTypeId(String(rows[0].id));
      } catch {
        setServiceTypes([]);
      }
    })();
    return () => { active = false; };
  }, [modeId]);

  // Mandatory Add-ons Logic — matched by code (stable) instead of name
  useEffect(() => {
    if (addServices.length > 0 && serviceTypeId) {
      const codes = isFCL ? FCL_MANDATORY_CODES : isLCL ? LCL_MANDATORY_CODES : [];
      const mandatoryIds = addServices
        .filter((s) => s.code != null && codes.includes(s.code))
        .map((s) => s.id);

      setSelectedAddOns((prev) => {
        // Remove any previously auto-selected mandatory IDs, then re-add current ones.
        const others = prev.filter(
          (id) => !ALL_MANDATORY_CODES.includes(
            addServices.find((s) => s.id === id)?.code ?? ''
          )
        );
        return Array.from(new Set([...others, ...mandatoryIds]));
      });
    }
  }, [serviceTypeId, addServices, isFCL, isLCL]);

  // Shipper same as account
  useEffect(() => {
    if (isShipperSameAsAccount && userCompany) {
      setShipperName(userCompany.name ?? "");
      setShipperAddress(userCompany.address ?? "");
      setShipperPhone(userCompany.phone ?? "");
    }
  }, [isShipperSameAsAccount, userCompany]);

  // CBM/Weight auto-calc
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

  // NEW: Auto-DG logic
  useEffect(() => {
    if (equipmentCondition === "RESIDUAL") {
      setIsDG(true);
    }
  }, [equipmentCondition]);

  const buildPayload = () => ({
    origin_location_id: Number(originId),
    destination_location_id: Number(destId),
    transport_mode_id: Number(modeId),
    service_type_id: Number(serviceTypeId),
    cargo_category_id: Number(cargoCategoryId),
    container_type_id: !isLCL && containerTypeId ? Number(containerTypeId) : null,
    container_count: !isLCL ? (Number(containerCount) || 1) : null,
    estimated_weight: weight ? Number(weight) : null,
    estimated_cbm: cbm ? Number(cbm) : null,
    departure_date: departureDate || null,
    cargo_description: cargo || null,
    is_dangerous_goods: isDG,
    dg_class_id: isDG && dgClassId ? Number(dgClassId) : null,
    un_number: isDG ? unNumber : null,
    msds_file: null, // Handled separately in multipart
    equipment_condition: showProject ? equipmentCondition : null,
    temperature: showTemp ? Number(temperature) : null,
    shipper_name: shipperName,
    shipper_address: shipperAddress,
    shipper_phone: shipperPhone,
    consignee_name: consigneeName,
    consignee_address: consigneeAddress,
    consignee_phone: consigneePhone,
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
          : "Estimasi tidak tersedia"
      );
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Gagal estimasi";
      setError(msg);
      toast.error(msg);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side Validation Pass
    if (isDG) {
      if (!dgClassId) {
        toast.error("DG Class wajib diisi jika kargo berbahaya.");
        return;
      }
      if (!unNumber) {
        toast.error("UN Number wajib diisi jika kargo berbahaya.");
        return;
      }
      if (!msdsFile) {
        toast.error("Dokumen MSDS wajib diunggah jika kargo berbahaya.");
        return;
      }
    }

    if (showTemp && !temperature) {
      toast.error("Suhu (temperature) wajib diisi untuk kategori kargo ini.");
      return;
    }

    if (selectedCC?.code === "MIX" && !cargo) {
      toast.error("Deskripsi barang wajib diisi untuk kategori Mixed Cargo.");
      return;
    }

    setSubmitting(true);
    try {
      const p = buildPayload();
      const fd = new FormData();
      Object.entries(p).forEach(([k, v]) => {
        if (v != null) {
          if (k === "additional_services") {
            fd.append(k, JSON.stringify(v));
          } else {
            fd.append(k, String(v));
          }
        }
      });
      if (msdsFile) fd.append("msds_file", msdsFile);

      await createCustomerBooking(fd as unknown as Record<string, unknown>);
      setShowSuccess(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Gagal menyimpan";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    locations, modes, serviceTypes, containerTypes, addServices, cargoCategories, dgClasses,
    originId, setOriginId,
    destId, setDestId,
    modeId, setModeId,
    serviceTypeId, setServiceTypeId,
    containerTypeId, setContainerTypeId,
    containerCount, setContainerCount,
    weight, setWeight,
    cbm, setCbm,
    departureDate, setDepartureDate,
    cargo, setCargo,
    cargoCategoryId, setCargoCategoryId,
    selectedAddOns, setSelectedAddOns,
    itemLength, setItemLength,
    itemWidth, setItemWidth,
    itemHeight, setItemHeight,
    shipperName, setShipperName,
    shipperAddress, setShipperAddress,
    shipperPhone, setShipperPhone,
    isShipperSameAsAccount, setIsShipperSameAsAccount,
    consigneeName, setConsigneeName,
    consigneeAddress, setConsigneeAddress,
    consigneePhone, setConsigneePhone,
    isDG, setIsDG,
    dgClassId, setDgClassId,
    unNumber, setUnNumber,
    msdsFile, setMsdsFile,
    equipmentCondition, setEquipmentCondition,
    temperature, setTemperature,
    estimate, error, loading, submitting, showSuccess, setShowSuccess,
    isFCL, isLCL, selectedCT, selectedCC, showTemp, showProject,
    onEstimate, onSubmit
  };
}
