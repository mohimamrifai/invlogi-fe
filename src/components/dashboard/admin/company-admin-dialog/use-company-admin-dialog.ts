import { useCallback, useEffect, useState } from "react";
import {
  approveAdminCompany,
  createAdminBranch,
  createAdminCompany,
  createAdminCustomerDiscount,
  deleteAdminBranch,
  deleteAdminCustomerDiscount,
  fetchAdminCompany,
  fetchAdminVendors,
  rejectAdminCompany,
  updateAdminBranch,
  updateAdminCompany,
  updateAdminCustomerDiscount,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { firstLaravelError } from "@/lib/laravel-errors";
import type { LaravelPaginated } from "@/lib/types-api";
import { toast } from "sonner";
import type { AdminCustomerCapabilities } from "@/lib/admin-customer-capabilities";
import type { CompanyDialogMode, Row } from "./types";

type Params = {
  open: boolean;
  mode: CompanyDialogMode;
  companyId: number | null;
  onSaved: () => void;
  onOpenChange: (open: boolean) => void;
  capabilities: AdminCustomerCapabilities;
};

export function useCompanyAdminDialog(params: Params) {
  const { open, mode, companyId, onSaved, onOpenChange, capabilities } = params;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [npwp, setNpwp] = useState("");
  const [nib, setNib] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [saving, setSaving] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSaving, setRejectSaving] = useState(false);

  const [branchOpen, setBranchOpen] = useState(false);
  const [branchEdit, setBranchEdit] = useState<Row | null>(null);
  const [bName, setBName] = useState("");
  const [bAddr, setBAddr] = useState("");
  const [bCity, setBCity] = useState("");
  const [bPhone, setBPhone] = useState("");
  const [bPic, setBPic] = useState("");
  const [bActive, setBActive] = useState(true);
  const [savingBranch, setSavingBranch] = useState(false);

  const [discOpen, setDiscOpen] = useState(false);
  const [discEdit, setDiscEdit] = useState<Row | null>(null);
  const [dVsId, setDVsId] = useState("");
  const [dType, setDType] = useState<"percentage" | "fixed">("percentage");
  const [dVal, setDVal] = useState("");
  const [dFrom, setDFrom] = useState("");
  const [dTo, setDTo] = useState("");
  const [dActive, setDActive] = useState(true);
  const [savingDisc, setSavingDisc] = useState(false);
  const [vendorServiceOptions, setVendorServiceOptions] = useState<{ id: number; label: string }[]>([]);

  const [deleteBranch, setDeleteBranch] = useState<Row | null>(null);
  const [deleteDisc, setDeleteDisc] = useState<Row | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  const loadDetail = useCallback(async () => {
    if (mode !== "detail" || companyId == null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminCompany(companyId);
      const d = (res as { data: Row }).data;
      setDetail(d);
      setName(String(d.name ?? ""));
      setNpwp(String(d.npwp ?? ""));
      setNib(String(d.nib ?? ""));
      setAddress(String(d.address ?? ""));
      setCity(String(d.city ?? ""));
      setProvince(String(d.province ?? ""));
      setPostalCode(String(d.postal_code ?? ""));
      setContactPerson(String(d.contact_person ?? ""));
      setEmail(String(d.email ?? ""));
      setPhone(String(d.phone ?? ""));
      setBillingCycle(String(d.billing_cycle ?? ""));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat data.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [mode, companyId]);

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      setDetail(null);
      setName("");
      setNpwp("");
      setNib("");
      setAddress("");
      setCity("");
      setProvince("");
      setPostalCode("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setBillingCycle("");
      setError(null);
    } else if (mode === "detail" && companyId != null) {
      void loadDetail();
    }
  }, [open, mode, companyId, loadDetail]);

  useEffect(() => {
    if (!open || !discOpen) return;
    void (async () => {
      try {
        const res = await fetchAdminVendors({ page: 1, perPage: 100 });
        const paginated = res as LaravelPaginated<Row>;
        const vendors = paginated.data ?? [];
        const opts: { id: number; label: string }[] = [];
        for (const v of vendors) {
          const svs = (v.vendor_services ?? v.vendorServices) as Row[] | undefined;
          if (!Array.isArray(svs)) continue;
          const vn = String(v.name ?? v.code ?? "");
          for (const s of svs) {
            if (s.id == null) continue;
            opts.push({ id: Number(s.id), label: `${vn} — #${s.id}` });
          }
        }
        setVendorServiceOptions(opts);
      } catch {
        setVendorServiceOptions([]);
      }
    })();
  }, [open, discOpen]);

  const saveCompany = async () => {
    if (mode === "create" && !capabilities.canCreateCustomer) return;
    if (mode === "detail" && !capabilities.canEditCompanyData) return;
    setSaving(true);
    setError(null);
    try {
      const cleanedPhone = phone.trim();
      if (cleanedPhone && !/^(0|62)\d+$/.test(cleanedPhone)) {
        setError("Format telepon harus diawali 0 atau 62 tanpa tanda +.");
        setSaving(false);
        return;
      }
      if (mode === "create" && !billingCycle.trim()) {
        setError("Pilih siklus penagihan.");
        setSaving(false);
        return;
      }
      const body: Record<string, unknown> = {
        name: name.trim(),
        npwp: npwp.trim() || null,
        nib: nib.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        postal_code: postalCode.trim() || null,
        contact_person: contactPerson.trim() || null,
        email: email.trim() || null,
        phone: cleanedPhone || null,
        billing_cycle: billingCycle.trim() || null,
      };
      if (mode === "create") {
        body.status = "active";
        await createAdminCompany(body);
        onSaved();
        onOpenChange(false);
      } else if (mode === "detail" && companyId != null) {
        await updateAdminCompany(companyId, body);
        await loadDetail();
        onSaved();
      }
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 422
          ? firstLaravelError(e.body) ?? e.message
          : e instanceof ApiError
            ? e.message
            : "Gagal menyimpan.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const openBranch = (row?: Row) => {
    if (row) {
      setBranchEdit(row);
      setBName(String(row.name ?? ""));
      setBAddr(String(row.address ?? ""));
      setBCity(String(row.city ?? ""));
      setBPhone(String(row.phone ?? ""));
      setBPic(String(row.contact_person ?? ""));
      setBActive(row.is_active !== false);
    } else {
      setBranchEdit(null);
      setBName("");
      setBAddr("");
      setBCity("");
      setBPhone("");
      setBPic("");
      setBActive(true);
    }
    setBranchOpen(true);
  };

  const saveBranch = async () => {
    if (!capabilities.canManageBranches || companyId == null) return;
    setSavingBranch(true);
    try {
      const body = {
        name: bName.trim(),
        address: bAddr.trim() || null,
        city: bCity.trim() || null,
        phone: bPhone.trim() || null,
        contact_person: bPic.trim() || null,
        is_active: bActive,
      };
      if (branchEdit?.id != null) {
        await updateAdminBranch(companyId, Number(branchEdit.id), body);
      } else {
        await createAdminBranch(companyId, body);
      }
      setBranchOpen(false);
      await loadDetail();
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan cabang.");
    } finally {
      setSavingBranch(false);
    }
  };

  const openDisc = (row?: Row) => {
    if (row) {
      setDiscEdit(row);
      const vs = row.vendor_service as { id?: number } | undefined;
      setDVsId(vs?.id != null ? String(vs.id) : "");
      setDType((row.discount_type as "percentage" | "fixed") ?? "percentage");
      setDVal(String(row.discount_value ?? ""));
      setDFrom(row.effective_from ? String(row.effective_from).slice(0, 10) : "");
      setDTo(row.effective_to ? String(row.effective_to).slice(0, 10) : "");
      setDActive(row.is_active !== false);
    } else {
      setDiscEdit(null);
      setDVsId("");
      setDType("percentage");
      setDVal("");
      setDFrom("");
      setDTo("");
      setDActive(true);
    }
    setDiscOpen(true);
  };

  const saveDisc = async () => {
    if (!capabilities.canManageDiscounts || companyId == null) return;
    setSavingDisc(true);
    try {
      const body: Record<string, unknown> = {
        vendor_service_id: dVsId && dVsId !== "__none__" ? Number(dVsId) : null,
        discount_type: dType,
        discount_value: Number(dVal) || 0,
        effective_from: dFrom || null,
        effective_to: dTo || null,
        is_active: dActive,
      };
      if (discEdit?.id != null) {
        await updateAdminCustomerDiscount(companyId, Number(discEdit.id), body);
      } else {
        await createAdminCustomerDiscount(companyId, body);
      }
      setDiscOpen(false);
      await loadDetail();
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan diskon.");
    } finally {
      setSavingDisc(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (companyId == null || deleteBranch?.id == null) return;
    setDelLoading(true);
    try {
      await deleteAdminBranch(companyId, Number(deleteBranch.id));
      setDeleteBranch(null);
      await loadDetail();
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus.");
    } finally {
      setDelLoading(false);
    }
  };

  const handleDeleteDisc = async () => {
    if (companyId == null || deleteDisc?.id == null) return;
    setDelLoading(true);
    try {
      await deleteAdminCustomerDiscount(companyId, Number(deleteDisc.id));
      setDeleteDisc(null);
      await loadDetail();
      onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus.");
    } finally {
      setDelLoading(false);
    }
  };

  const submitReject = async () => {
    if (companyId == null || !rejectReason.trim()) return;
    setRejectSaving(true);
    try {
      await rejectAdminCompany(companyId, rejectReason.trim());
      setRejectOpen(false);
      setRejectReason("");
      await loadDetail();
      onSaved();
      toast.success("Registrasi customer ditolak.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal.");
    } finally {
      setRejectSaving(false);
    }
  };

  const approveCompany = async () => {
    if (companyId == null) return;
    try {
      await approveAdminCompany(companyId);
      await loadDetail();
      onSaved();
      toast.success("Customer disetujui.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal.");
    }
  };

  const companyFieldsReadOnly =
    (mode === "detail" && !capabilities.canEditCompanyData) ||
    (mode === "create" && !capabilities.canCreateCustomer);

  const branches =
    (detail?.branches as Row[] | undefined) ?? (detail?.Branches as Row[] | undefined) ?? [];
  const discounts =
    (detail?.customer_discounts as Row[] | undefined) ??
    (detail?.customerDiscounts as Row[] | undefined) ??
    [];

  return {
    loading,
    detail,
    error,
    setError,
    name,
    setName,
    npwp,
    setNpwp,
    nib,
    setNib,
    address,
    setAddress,
    city,
    setCity,
    province,
    setProvince,
    postalCode,
    setPostalCode,
    contactPerson,
    setContactPerson,
    email,
    setEmail,
    phone,
    setPhone,
    billingCycle,
    setBillingCycle,
    saving,
    saveCompany,
    rejectOpen,
    setRejectOpen,
    rejectReason,
    setRejectReason,
    rejectSaving,
    submitReject,
    approveCompany,
    branchOpen,
    setBranchOpen,
    branchEdit,
    bName,
    setBName,
    bAddr,
    setBAddr,
    bCity,
    setBCity,
    bPhone,
    setBPhone,
    bPic,
    setBPic,
    bActive,
    setBActive,
    savingBranch,
    openBranch,
    saveBranch,
    discOpen,
    setDiscOpen,
    discEdit,
    dVsId,
    setDVsId,
    dType,
    setDType,
    dVal,
    setDVal,
    dFrom,
    setDFrom,
    dTo,
    setDTo,
    dActive,
    setDActive,
    savingDisc,
    vendorServiceOptions,
    openDisc,
    saveDisc,
    deleteBranch,
    setDeleteBranch,
    deleteDisc,
    setDeleteDisc,
    delLoading,
    handleDeleteBranch,
    handleDeleteDisc,
    branches,
    discounts,
    companyFieldsReadOnly,
    st: String(detail?.status ?? ""),
  };
}
