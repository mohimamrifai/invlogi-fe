"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdminBranch,
  createAdminCustomerDiscount,
  deleteAdminBranch,
  deleteAdminCustomerDiscount,
  fetchAdminCompany,
  fetchAdminVendors,
  updateAdminBranch,
  updateAdminCompany,
  updateAdminCustomerDiscount,
} from "@/lib/admin-api";
import { BILLING_CYCLE_OPTIONS, billingCycleLabel } from "@/lib/billing-cycle-labels";
import { ApiError } from "@/lib/api-client";
import { firstLaravelError } from "@/lib/laravel-errors";
import { getAdminCustomerCapabilities } from "@/lib/admin-customer-capabilities";
import { useAuthStore } from "@/lib/store";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";
import type { LaravelPaginated } from "@/lib/types-api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDeleteDialog } from "@/components/dashboard/admin/confirm-delete-dialog";
import { toast } from "sonner";

export default function AdminCustomerEditPage() {
  const params = useParams();
  const router = useRouter();
  const locale = String(params?.locale ?? "id");
  const id = Number(params?.id);
  const backPath = `/${locale}/dashboard/admin/customers`;

  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();
  const caps = useMemo(() => getAdminCustomerCapabilities(user?.roles ?? []), [user?.roles]);
  const canEdit = authHydrated && caps.canEditCompanyData;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [npwp, setNpwp] = useState("");
  const [nib, setNib] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const [branchOpen, setBranchOpen] = useState(false);
  const [branchEdit, setBranchEdit] = useState<Record<string, unknown> | null>(null);
  const [bName, setBName] = useState("");
  const [bAddr, setBAddr] = useState("");
  const [bCity, setBCity] = useState("");
  const [bPhone, setBPhone] = useState("");
  const [bPic, setBPic] = useState("");
  const [bActive, setBActive] = useState(true);
  const [savingBranch, setSavingBranch] = useState(false);
  const [deleteBranch, setDeleteBranch] = useState<Record<string, unknown> | null>(null);

  const [discOpen, setDiscOpen] = useState(false);
  const [discEdit, setDiscEdit] = useState<Record<string, unknown> | null>(null);
  const [dVsId, setDVsId] = useState("");
  const [dType, setDType] = useState<"percentage" | "fixed">("percentage");
  const [dVal, setDVal] = useState("");
  const [dFrom, setDFrom] = useState("");
  const [dTo, setDTo] = useState("");
  const [dActive, setDActive] = useState(true);
  const [vendorServiceOptions, setVendorServiceOptions] = useState<{ id: number; label: string }[]>([]);
  const [savingDisc, setSavingDisc] = useState(false);
  const [deleteDisc, setDeleteDisc] = useState<Record<string, unknown> | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id) || id < 1) {
      setLoading(false);
      setError("ID customer tidak valid.");
      return;
    }
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAdminCompany(id);
        const d = (res as { data: Record<string, unknown> }).data;
        setDetail(d);
        setName(String(d.name ?? ""));
        setNpwp(String(d.npwp ?? ""));
        setNib(String(d.nib ?? ""));
        setBillingCycle(String(d.billing_cycle ?? ""));
        setAddress(String(d.address ?? ""));
        setCity(String(d.city ?? ""));
        setProvince(String(d.province ?? ""));
        setPostalCode(String(d.postal_code ?? ""));
        setContactPerson(String(d.contact_person ?? ""));
        setEmail(String(d.email ?? ""));
        setPhone(String(d.phone ?? ""));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Gagal memuat data customer.");
        setDetail(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!discOpen || !Number.isFinite(id) || id < 1) return;
    void (async () => {
      try {
        const res = await fetchAdminVendors({ page: 1, perPage: 100 });
        const paginated = res as LaravelPaginated<Record<string, unknown>>;
        const vendors = paginated.data ?? [];
        const opts: { id: number; label: string }[] = [];
        for (const v of vendors) {
          const svs = (v.vendor_services ?? v.vendorServices) as Record<string, unknown>[] | undefined;
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
  }, [discOpen, id]);

  const save = async () => {
    if (!canEdit || !Number.isFinite(id) || id < 1) return;
    setSaving(true);
    setError(null);
    try {
      const cleanedPhone = phone.trim();
      if (cleanedPhone && !/^(0|62)\d+$/.test(cleanedPhone)) {
        setError("Format telepon harus diawali 0 atau 62 tanpa tanda +.");
        setSaving(false);
        return;
      }
      await updateAdminCompany(id, {
        name: name.trim(),
        npwp: npwp.trim() || null,
        nib: nib.trim() || null,
        billing_cycle: billingCycle.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        postal_code: postalCode.trim() || null,
        contact_person: contactPerson.trim() || null,
        email: email.trim() || null,
        phone: cleanedPhone || null,
      });
      toast.success("Data customer diperbarui.");
      const res = await fetchAdminCompany(id);
      setDetail((res as { data: Record<string, unknown> }).data);
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

  const openBranch = (row?: Record<string, unknown>) => {
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
    if (!caps.canManageBranches || !Number.isFinite(id) || id < 1) return;
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
        await updateAdminBranch(id, Number(branchEdit.id), body);
      } else {
        await createAdminBranch(id, body);
      }
      setBranchOpen(false);
      const res = await fetchAdminCompany(id);
      setDetail((res as { data: Record<string, unknown> }).data);
      toast.success("Cabang tersimpan.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan cabang.");
    } finally {
      setSavingBranch(false);
    }
  };

  const openDisc = (row?: Record<string, unknown>) => {
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
    if (!caps.canManageDiscounts || !Number.isFinite(id) || id < 1) return;
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
        await updateAdminCustomerDiscount(id, Number(discEdit.id), body);
      } else {
        await createAdminCustomerDiscount(id, body);
      }
      setDiscOpen(false);
      const res = await fetchAdminCompany(id);
      setDetail((res as { data: Record<string, unknown> }).data);
      toast.success("Diskon tersimpan.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan diskon.");
    } finally {
      setSavingDisc(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!Number.isFinite(id) || id < 1 || deleteBranch?.id == null) return;
    setDelLoading(true);
    try {
      await deleteAdminBranch(id, Number(deleteBranch.id));
      setDeleteBranch(null);
      const res = await fetchAdminCompany(id);
      setDetail((res as { data: Record<string, unknown> }).data);
      toast.success("Cabang dihapus.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus.");
    } finally {
      setDelLoading(false);
    }
  };

  const handleDeleteDisc = async () => {
    if (!Number.isFinite(id) || id < 1 || deleteDisc?.id == null) return;
    setDelLoading(true);
    try {
      await deleteAdminCustomerDiscount(id, Number(deleteDisc.id));
      setDeleteDisc(null);
      const res = await fetchAdminCompany(id);
      setDetail((res as { data: Record<string, unknown> }).data);
      toast.success("Diskon dihapus.");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus.");
    } finally {
      setDelLoading(false);
    }
  };

  if (!canEdit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses ditolak</CardTitle>
          <CardDescription>Role Anda tidak memiliki izin edit customer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push(backPath)}>
            Kembali
          </Button>
        </CardContent>
      </Card>
    );
  }

  const branches =
    (detail?.branches as Record<string, unknown>[] | undefined) ??
    (detail?.Branches as Record<string, unknown>[] | undefined) ??
    [];
  const discounts =
    (detail?.customer_discounts as Record<string, unknown>[] | undefined) ??
    (detail?.customerDiscounts as Record<string, unknown>[] | undefined) ??
    [];
  const selectedVendorServiceLabel =
    dVsId && dVsId !== "__none__"
      ? vendorServiceOptions.find((o) => String(o.id) === dVsId)?.label ?? dVsId
      : "Tidak terkait vendor service";

  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle>Edit customer</CardTitle>
        <CardDescription>Perbarui data perusahaan customer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}
        {loading ? <p className="text-sm text-muted-foreground">Memuat…</p> : null}
        {!loading ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nama perusahaan</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>NPWP</Label>
                <Input value={npwp} onChange={(e) => setNpwp(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>NIB</Label>
                <Input value={nib} onChange={(e) => setNib(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Siklus penagihan</Label>
                <Select
                  value={billingCycle || "__none__"}
                  onValueChange={(v) => {
                    if (v != null) setBillingCycle(v === "__none__" ? "" : v);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih siklus penagihan">
                      {billingCycle ? billingCycleLabel(billingCycle) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" disabled>
                      Pilih siklus penagihan
                    </SelectItem>
                    {BILLING_CYCLE_OPTIONS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Kota</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Provinsi</Label>
                <Input value={province} onChange={(e) => setProvince(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kode pos</Label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="space-y-2">
                <Label>PIC</Label>
                <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telepon</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="081234567890 atau 6281234567890"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>
            <div className="space-y-6 pt-2">
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Cabang</h3>
                  {caps.canManageBranches ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => openBranch()}>
                      + Cabang
                    </Button>
                  ) : null}
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
                            {caps.canManageBranches ? (
                              <>
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
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Diskon</h3>
                  {caps.canManageDiscounts ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => openDisc()}>
                      + Diskon
                    </Button>
                  ) : null}
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
                            {caps.canManageDiscounts ? (
                              <>
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
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.push(backPath)} disabled={saving}>
                Batal
              </Button>
              <Button onClick={() => void save()} disabled={saving || !name.trim()}>
                {saving ? "Menyimpan…" : "Simpan"}
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>

      <Dialog open={branchOpen} onOpenChange={setBranchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{branchEdit ? "Edit cabang" : "Tambah cabang"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Nama</Label>
            <Input value={bName} onChange={(e) => setBName(e.target.value)} placeholder="Nama cabang / gudang" />
            </div>
            <div className="space-y-1">
              <Label>Alamat</Label>
            <Input value={bAddr} onChange={(e) => setBAddr(e.target.value)} placeholder="Alamat cabang" />
            </div>
            <div className="space-y-1">
              <Label>Kota</Label>
            <Input value={bCity} onChange={(e) => setBCity(e.target.value)} placeholder="Kota" />
            </div>
            <div className="space-y-1">
              <Label>Telepon</Label>
            <Input
              value={bPhone}
              onChange={(e) => setBPhone(e.target.value)}
              placeholder="081234567890 atau 6281234567890"
            />
            </div>
            <div className="space-y-1">
              <Label>PIC</Label>
            <Input value={bPic} onChange={(e) => setBPic(e.target.value)} placeholder="Nama PIC cabang" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{discEdit ? "Edit diskon" : "Tambah diskon"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Vendor service (opsional)</Label>
              <Select
                value={dVsId || "__none__"}
                onValueChange={(v) => v != null && setDVsId(v === "__none__" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih vendor service (opsional)">
                    {selectedVendorServiceLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[24rem] max-w-[90vw]">
                  <SelectItem value="__none__">Tidak terkait vendor service</SelectItem>
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
                placeholder="Contoh: 10 (persen) atau 50000 (nominal)"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Dari</Label>
                <Input type="date" value={dFrom} onChange={(e) => setDFrom(e.target.value)} />
                <p className="text-[11px] text-muted-foreground">Tanggal mulai berlaku</p>
              </div>
              <div className="space-y-1">
                <Label>Sampai</Label>
                <Input type="date" value={dTo} onChange={(e) => setDTo(e.target.value)} />
                <p className="text-[11px] text-muted-foreground">Tanggal akhir (opsional)</p>
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
