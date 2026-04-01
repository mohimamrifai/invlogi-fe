"use client";

import { useMemo, useState } from "react";
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
import { createAdminCompany } from "@/lib/admin-api";
import { BILLING_CYCLE_OPTIONS, billingCycleLabel } from "@/lib/billing-cycle-labels";
import { ApiError } from "@/lib/api-client";
import { firstLaravelError } from "@/lib/laravel-errors";
import { getAdminCustomerCapabilities } from "@/lib/admin-customer-capabilities";
import { useAuthStore } from "@/lib/store";
import { useAuthPersistHydrated } from "@/lib/use-auth-hydrated";

export default function AdminCustomerCreatePage() {
  const params = useParams();
  const router = useRouter();
  const locale = String(params?.locale ?? "id");
  const backPath = `/${locale}/dashboard/admin/customers`;

  const authHydrated = useAuthPersistHydrated();
  const { user } = useAuthStore();
  const caps = useMemo(() => getAdminCustomerCapabilities(user?.roles ?? []), [user?.roles]);
  const canCreate = authHydrated && caps.canCreateCustomer;

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!canCreate) return;
    setSaving(true);
    setError(null);
    try {
      const cleanedPhone = phone.trim();
      if (cleanedPhone && !/^(0|62)\d+$/.test(cleanedPhone)) {
        setError("Format telepon harus diawali 0 atau 62 tanpa tanda +.");
        setSaving(false);
        return;
      }
      if (!billingCycle.trim()) {
        setError("Pilih siklus penagihan.");
        setSaving(false);
        return;
      }
      await createAdminCompany({
        name: name.trim(),
        npwp: npwp.trim() || null,
        nib: nib.trim() || null,
        billing_cycle: billingCycle,
        address: address.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        postal_code: postalCode.trim() || null,
        contact_person: contactPerson.trim() || null,
        email: email.trim() || null,
        phone: cleanedPhone || null,
        status: "active",
      });
      router.push(backPath);
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

  if (!canCreate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses ditolak</CardTitle>
          <CardDescription>Role Anda tidak memiliki izin tambah customer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push(backPath)}>
            Kembali
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah customer</CardTitle>
        <CardDescription>Form input customer oleh tim internal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nama perusahaan</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama resmi perusahaan" />
          </div>
          <div className="space-y-2">
            <Label>NPWP</Label>
            <Input value={npwp} onChange={(e) => setNpwp(e.target.value)} placeholder="00.000.000.0-000.000" />
          </div>
          <div className="space-y-2">
            <Label>NIB</Label>
            <Input value={nib} onChange={(e) => setNib(e.target.value)} placeholder="Nomor Induk Berusaha" />
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
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat lengkap jalan & gedung"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Kota</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kota / kabupaten" />
          </div>
          <div className="space-y-2">
            <Label>Provinsi</Label>
            <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Provinsi" />
          </div>
          <div className="space-y-2">
            <Label>Kode pos</Label>
            <Input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
              placeholder="00000"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="space-y-2">
            <Label>PIC</Label>
            <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Nama PIC" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="perusahaan@domain.com"
            />
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
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push(backPath)} disabled={saving}>
            Batal
          </Button>
          <Button onClick={() => void save()} disabled={saving || !name.trim()}>
            {saving ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
