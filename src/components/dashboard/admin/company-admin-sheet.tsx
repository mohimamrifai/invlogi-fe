"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { customerStatusBadgeClass, customerStatusLabelFromApi } from "@/lib/customer-status";
import { BILLING_CYCLE_OPTIONS } from "@/lib/billing-cycle-labels";
import { DIALOG_CREATE_HEADER_CLASS } from "@/lib/dialog-create-header";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown>;

type SheetMode = "create" | "detail";

export function CompanyAdminSheet({
  open,
  onOpenChange,
  mode,
  companyId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: SheetMode;
  companyId: number | null;
  onSaved: () => void;
}) {
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
  const [billingCycle, setBillingCycle] = useState("end_of_month");
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
  const [dVsId, setDVsId] = useState("_none");
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
      setBillingCycle(String(d.billing_cycle ?? "end_of_month"));
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
      setBillingCycle("end_of_month");
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
            opts.push({
              id: Number(s.id),
              label: `${vn} — #${s.id}`,
            });
          }
        }
        setVendorServiceOptions(opts);
      } catch {
        setVendorServiceOptions([]);
      }
    })();
  }, [open, discOpen]);

  const saveCompany = async () => {
    setSaving(true);
    setError(null);
    try {
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
        phone: phone.trim() || null,
        billing_cycle: billingCycle,
      };
      if (mode === "create") {
        body.status = "pending";
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
    if (companyId == null) return;
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
      setDVsId(vs?.id != null ? String(vs.id) : "_none");
      setDType((row.discount_type as "percentage" | "fixed") ?? "percentage");
      setDVal(String(row.discount_value ?? ""));
      setDFrom(row.effective_from ? String(row.effective_from).slice(0, 10) : "");
      setDTo(row.effective_to ? String(row.effective_to).slice(0, 10) : "");
      setDActive(row.is_active !== false);
    } else {
      setDiscEdit(null);
      setDVsId("_none");
      setDType("percentage");
      setDVal("");
      setDFrom("");
      setDTo("");
      setDActive(true);
    }
    setDiscOpen(true);
  };

  const saveDisc = async () => {
    if (companyId == null) return;
    setSavingDisc(true);
    try {
      const body: Record<string, unknown> = {
        vendor_service_id: dVsId !== "_none" ? Number(dVsId) : null,
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

  const st = String(detail?.status ?? "");
  const branches =
    (detail?.branches as Row[] | undefined) ?? (detail?.Branches as Row[] | undefined) ?? [];
  const discounts =
    (detail?.customer_discounts as Row[] | undefined) ??
    (detail?.customerDiscounts as Row[] | undefined) ??
    [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader className={cn(mode === "create" && DIALOG_CREATE_HEADER_CLASS)}>
            <DialogTitle>{mode === "create" ? "Tambah customer" : "Detail customer"}</DialogTitle>
            <DialogDescription>Data perusahaan B2B.</DialogDescription>
          </DialogHeader>

          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          ) : null}

          {mode === "detail" && loading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : (
            <div className="flex flex-col gap-4 pb-2">
              {mode === "detail" && detail ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={customerStatusBadgeClass(st)}>
                    {customerStatusLabelFromApi(st)}
                  </Badge>
                  {st === "pending" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        onClick={async () => {
                          if (companyId == null) return;
                          try {
                            await approveAdminCompany(companyId);
                            await loadDetail();
                            onSaved();
                            toast.success("Customer disetujui.");
                          } catch (e) {
                            toast.error(e instanceof ApiError ? e.message : "Gagal.");
                          }
                        }}
                      >
                        Setujui
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectReason("");
                          setRejectOpen(true);
                        }}
                      >
                        Tolak
                      </Button>
                    </>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="co-name">Nama perusahaan</Label>
                <Input
                  id="co-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={mode === "create" ? "Nama resmi perusahaan" : undefined}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="co-npwp">NPWP</Label>
                  <Input
                    id="co-npwp"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    placeholder={mode === "create" ? "00.000.000.0-000.000" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-nib">NIB</Label>
                  <Input
                    id="co-nib"
                    value={nib}
                    onChange={(e) => setNib(e.target.value)}
                    placeholder={mode === "create" ? "Nomor Induk Berusaha" : undefined}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-addr">Alamat</Label>
                <Input
                  id="co-addr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={mode === "create" ? "Alamat lengkap jalan & gedung" : undefined}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="co-city">Kota</Label>
                  <Input
                    id="co-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={mode === "create" ? "Kota / kabupaten" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-prov">Provinsi</Label>
                  <Input
                    id="co-prov"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder={mode === "create" ? "Provinsi" : undefined}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-post">Kode pos</Label>
                <Input
                  id="co-post"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder={mode === "create" ? "00000" : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-pic">PIC</Label>
                <Input
                  id="co-pic"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder={mode === "create" ? "Nama penanggung jawab" : undefined}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="co-email">Email</Label>
                  <Input
                    id="co-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode === "create" ? "perusahaan@domain.com" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-phone">Telepon</Label>
                  <Input
                    id="co-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={mode === "create" ? "+62 812 3456 7890" : undefined}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Siklus penagihan</Label>
                <Select
                  value={billingCycle}
                  onValueChange={(v) => {
                    if (v != null) setBillingCycle(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CYCLE_OPTIONS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {mode === "detail" && detail ? (
                <>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium">Cabang</h3>
                      <Button type="button" size="sm" variant="outline" onClick={() => openBranch()}>
                        + Cabang
                      </Button>
                    </div>
                    {branches.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Belum ada cabang.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {branches.map((b) => (
                            <TableRow key={String(b.id)}>
                              <TableCell>{String(b.name ?? "")}</TableCell>
                              <TableCell className="text-right">
                                <Button type="button" size="sm" variant="ghost" onClick={() => openBranch(b)}>
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => setDeleteBranch(b)}
                                >
                                  Hapus
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium">Diskon</h3>
                      <Button type="button" size="sm" variant="outline" onClick={() => openDisc()}>
                        + Diskon
                      </Button>
                    </div>
                    {discounts.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Belum ada diskon.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipe</TableHead>
                            <TableHead>Nilai</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {discounts.map((d) => (
                            <TableRow key={String(d.id)}>
                              <TableCell>{String(d.discount_type ?? "")}</TableCell>
                              <TableCell>{String(d.discount_value ?? "")}</TableCell>
                              <TableCell className="text-right">
                                <Button type="button" size="sm" variant="ghost" onClick={() => openDisc(d)}>
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => setDeleteDisc(d)}
                                >
                                  Hapus
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}

          <DialogFooter className="sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Tutup
            </Button>
            <Button type="button" onClick={() => void saveCompany()} disabled={saving || !name.trim()}>
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={branchOpen} onOpenChange={setBranchOpen}>
        <DialogContent showCloseButton>
          <DialogHeader className={cn(!branchEdit && DIALOG_CREATE_HEADER_CLASS)}>
            <DialogTitle>{branchEdit ? "Edit cabang" : "Tambah cabang"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                placeholder={!branchEdit ? "Nama cabang / gudang" : undefined}
              />
            </div>
            <div className="space-y-1">
              <Label>Alamat</Label>
              <Input
                value={bAddr}
                onChange={(e) => setBAddr(e.target.value)}
                placeholder={!branchEdit ? "Alamat cabang" : undefined}
              />
            </div>
            <div className="space-y-1">
              <Label>Kota</Label>
              <Input
                value={bCity}
                onChange={(e) => setBCity(e.target.value)}
                placeholder={!branchEdit ? "Kota" : undefined}
              />
            </div>
            <div className="space-y-1">
              <Label>Telepon</Label>
              <Input
                value={bPhone}
                onChange={(e) => setBPhone(e.target.value)}
                placeholder={!branchEdit ? "Nomor telepon cabang" : undefined}
              />
            </div>
            <div className="space-y-1">
              <Label>PIC</Label>
              <Input
                value={bPic}
                onChange={(e) => setBPic(e.target.value)}
                placeholder={!branchEdit ? "Kontak person" : undefined}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="b-a" checked={bActive} onCheckedChange={(v) => setBActive(v === true)} />
              <Label htmlFor="b-a" className="font-normal">
                Aktif
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBranchOpen(false)} disabled={savingBranch}>
              Batal
            </Button>
            <Button type="button" onClick={() => void saveBranch()} disabled={savingBranch || !bName.trim()}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={discOpen} onOpenChange={setDiscOpen}>
        <DialogContent showCloseButton>
          <DialogHeader className={cn(!discEdit && DIALOG_CREATE_HEADER_CLASS)}>
            <DialogTitle>{discEdit ? "Edit diskon" : "Tambah diskon"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Vendor service (opsional)</Label>
              <Select
                value={dVsId}
                onValueChange={(v) => {
                  if (v != null) setDVsId(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">—</SelectItem>
                  {vendorServiceOptions.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tipe</Label>
              <Select value={dType} onValueChange={(v) => setDType(v as "percentage" | "fixed")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Persen</SelectItem>
                  <SelectItem value="fixed">Nominal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Nilai</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={dVal}
                onChange={(e) => setDVal(e.target.value)}
                placeholder={!discEdit ? "Contoh: 10 untuk 10% atau nominal" : undefined}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Dari</Label>
                <Input type="date" value={dFrom} onChange={(e) => setDFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Sampai</Label>
                <Input type="date" value={dTo} onChange={(e) => setDTo(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="d-a" checked={dActive} onCheckedChange={(v) => setDActive(v === true)} />
              <Label htmlFor="d-a" className="font-normal">
                Aktif
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDiscOpen(false)} disabled={savingDisc}>
              Batal
            </Button>
            <Button type="button" onClick={() => void saveDisc()} disabled={savingDisc}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak registrasi customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="co-reject-reason">Alasan penolakan</Label>
            <Textarea
              id="co-reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Wajib diisi"
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!rejectReason.trim() || rejectSaving}
              onClick={() => void submitReject()}
            >
              {rejectSaving ? "Menyimpan…" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteBranch != null}
        onOpenChange={(o) => !o && setDeleteBranch(null)}
        title="Hapus cabang?"
        description="Yakin hapus cabang ini?"
        loading={delLoading}
        onConfirm={handleDeleteBranch}
      />

      <ConfirmDeleteDialog
        open={deleteDisc != null}
        onOpenChange={(o) => !o && setDeleteDisc(null)}
        title="Hapus diskon?"
        description="Yakin hapus diskon ini?"
        loading={delLoading}
        onConfirm={handleDeleteDisc}
      />
    </>
  );
}
