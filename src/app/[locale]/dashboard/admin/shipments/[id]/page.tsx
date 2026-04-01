"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addAdminContainerRack,
  addAdminShipmentContainer,
  addAdminShipmentItem,
  deleteAdminShipmentItem,
  downloadAdminWaybillPdf,
  fetchAdminContainerTypes,
  fetchAdminShipment,
  updateAdminShipment,
  updateAdminShipmentItem,
  updateAdminShipmentTracking,
} from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { firstLaravelError } from "@/lib/laravel-errors";
import { shipmentStatusBadgeClass, shipmentStatusLabel } from "@/lib/shipment-status";
import { TRACKING_STATUS_OPTIONS } from "@/lib/shipment-tracking-config";
import { ConfirmDeleteDialog } from "@/components/dashboard/admin/confirm-delete-dialog";
import { ArrowLeft, Download, Package, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { DIALOG_CREATE_HEADER_CLASS } from "@/lib/dialog-create-header";

type Row = Record<string, unknown>;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const PLACEMENT_LABELS: Record<string, string> = {
  rack: "Rack",
  floor: "Lantai",
};

function placementTypeLabel(v: unknown): string {
  const s = String(v ?? "").trim();
  if (!s) return "—";
  return PLACEMENT_LABELS[s] ?? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const shipmentId = Number(Array.isArray(rawId) ? rawId[0] : rawId);

  const [data, setData] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [containerTypes, setContainerTypes] = useState<Row[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [estDep, setEstDep] = useState("");
  const [estArr, setEstArr] = useState("");
  const [notes, setNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [trackOpen, setTrackOpen] = useState(false);
  const [trackStatus, setTrackStatus] = useState("booking_created");
  const [trackNotes, setTrackNotes] = useState("");
  const [trackAt, setTrackAt] = useState("");
  const [trackFiles, setTrackFiles] = useState<FileList | null>(null);
  const [savingTrack, setSavingTrack] = useState(false);

  const [contOpen, setContOpen] = useState(false);
  const [contTypeId, setContTypeId] = useState("");
  const [contNum, setContNum] = useState("");
  const [contSeal, setContSeal] = useState("");
  const [savingCont, setSavingCont] = useState(false);

  const [rackOpen, setRackOpen] = useState(false);
  const [rackContainerId, setRackContainerId] = useState<number | null>(null);
  const [rackName, setRackName] = useState("");
  const [savingRack, setSavingRack] = useState(false);

  const [itemOpen, setItemOpen] = useState(false);
  const [itemMode, setItemMode] = useState<"create" | "edit">("create");
  const [itemRow, setItemRow] = useState<Row | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemWeight, setItemWeight] = useState("");
  const [itemPlacement, setItemPlacement] = useState<"rack" | "floor">("floor");
  const [itemContainerId, setItemContainerId] = useState("_none");
  const [itemRackId, setItemRackId] = useState("_none");
  const [itemFragile, setItemFragile] = useState(false);
  const [itemStack, setItemStack] = useState(true);
  const [savingItem, setSavingItem] = useState(false);

  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [deleteItemRow, setDeleteItemRow] = useState<Row | null>(null);
  const [deleteItemLoading, setDeleteItemLoading] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(shipmentId) || shipmentId < 1) {
      setError("ID shipment tidak valid.");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetchAdminShipment(shipmentId);
      const row = (res as { data: Row }).data;
      setData(row);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat shipment.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetchAdminContainerTypes({ page: 1, perPage: 200 });
        const p = r as { data?: Row[] };
        setContainerTypes(p.data ?? []);
        const first = p.data?.[0];
        if (first?.id != null) setContTypeId(String(first.id));
      } catch {
        setContainerTypes([]);
      }
    })();
  }, []);

  const containers = useMemo(() => {
    const c = data?.containers as Row[] | undefined;
    return Array.isArray(c) ? c : [];
  }, [data]);

  const items = useMemo(() => {
    const it = data?.items as Row[] | undefined;
    return Array.isArray(it) ? it : [];
  }, [data]);

  const trackings = useMemo(() => {
    const t = data?.trackings as Row[] | undefined;
    return Array.isArray(t) ? [...t].reverse() : [];
  }, [data]);

  const openEditShipment = () => {
    if (!data) return;
    setEstDep(String(data.estimated_departure ?? "").slice(0, 10));
    setEstArr(String(data.estimated_arrival ?? "").slice(0, 10));
    setNotes(String(data.notes ?? ""));
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      await updateAdminShipment(shipmentId, {
        estimated_departure: estDep || null,
        estimated_arrival: estArr || null,
        notes: notes.trim() || null,
      });
      setEditOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menyimpan.");
    } finally {
      setSavingEdit(false);
    }
  };

  const saveTracking = async () => {
    setSavingTrack(true);
    try {
      const fd = new FormData();
      fd.append("status", trackStatus);
      if (trackNotes.trim()) fd.append("notes", trackNotes.trim());
      if (trackAt) fd.append("tracked_at", new Date(trackAt).toISOString());
      if (trackFiles?.length) {
        for (let i = 0; i < trackFiles.length; i++) {
          fd.append("photos[]", trackFiles[i]);
        }
      }
      await updateAdminShipmentTracking(shipmentId, fd);
      setTrackOpen(false);
      setTrackNotes("");
      setTrackFiles(null);
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal update tracking.");
    } finally {
      setSavingTrack(false);
    }
  };

  const saveContainer = async () => {
    if (!contTypeId) return;
    setSavingCont(true);
    try {
      await addAdminShipmentContainer(shipmentId, {
        container_type_id: Number(contTypeId),
        container_number: contNum.trim() || null,
        seal_number: contSeal.trim() || null,
      });
      setContOpen(false);
      setContNum("");
      setContSeal("");
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menambah kontainer.");
    } finally {
      setSavingCont(false);
    }
  };

  const openRack = (containerId: number) => {
    setRackContainerId(containerId);
    setRackName("");
    setRackOpen(true);
  };

  const saveRack = async () => {
    if (rackContainerId == null || !rackName.trim()) return;
    setSavingRack(true);
    try {
      await addAdminContainerRack(rackContainerId, { name: rackName.trim() });
      setRackOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menambah rack.");
    } finally {
      setSavingRack(false);
    }
  };

  const openNewItem = () => {
    setItemMode("create");
    setItemRow(null);
    setItemName("");
    setItemDesc("");
    setItemQty("1");
    setItemWeight("");
    setItemPlacement("floor");
    setItemContainerId("_none");
    setItemRackId("_none");
    setItemFragile(false);
    setItemStack(true);
    setItemOpen(true);
  };

  const openEditItem = (row: Row) => {
    setItemMode("edit");
    setItemRow(row);
    setItemName(String(row.name ?? ""));
    setItemDesc(String(row.description ?? ""));
    setItemQty(String(row.quantity ?? "1"));
    setItemWeight(String(row.gross_weight ?? ""));
    setItemPlacement((row.placement_type as "rack" | "floor") || "floor");
    setItemContainerId(row.container_id != null ? String(row.container_id) : "_none");
    setItemRackId(row.rack_id != null ? String(row.rack_id) : "_none");
    setItemFragile(Boolean(row.is_fragile));
    setItemStack(row.is_stackable !== false);
    setItemOpen(true);
  };

  const saveItem = async () => {
    setSavingItem(true);
    try {
      const body: Record<string, unknown> = {
        name: itemName.trim(),
        description: itemDesc.trim() || null,
        quantity: Number(itemQty) || 1,
        gross_weight: Number(itemWeight) || 0,
        placement_type: itemPlacement,
        container_id:
          itemContainerId && itemContainerId !== "_none" ? Number(itemContainerId) : null,
        rack_id: itemRackId && itemRackId !== "_none" ? Number(itemRackId) : null,
        is_fragile: itemFragile,
        is_stackable: itemStack,
      };
      if (itemMode === "create") {
        await addAdminShipmentItem(shipmentId, body);
      } else if (itemRow?.id != null) {
        await updateAdminShipmentItem(Number(itemRow.id), body);
      }
      setItemOpen(false);
      await load();
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 422
          ? firstLaravelError(e.body) ?? e.message
          : e instanceof ApiError
            ? e.message
            : "Gagal menyimpan item.";
      toast.error(msg);
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async () => {
    if (deleteItemRow?.id == null) return;
    setDeleteItemLoading(true);
    try {
      await deleteAdminShipmentItem(Number(deleteItemRow.id));
      setDeleteItemOpen(false);
      setDeleteItemRow(null);
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal menghapus.");
    } finally {
      setDeleteItemLoading(false);
    }
  };

  const pdf = async () => {
    try {
      const blob = await downloadAdminWaybillPdf(shipmentId);
      const wb = String(data?.waybill_number ?? shipmentId);
      downloadBlob(blob, `waybill-${wb}.pdf`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal unduh PDF.");
    }
  };

  const st = String(data?.status ?? "");
  const company = data?.company as { name?: string } | undefined;
  const origin = data?.origin_location as { name?: string } | undefined;
  const dest = data?.destination_location as { name?: string } | undefined;

  const rackOptions = useMemo(() => {
    const opts: { id: number; label: string }[] = [];
    for (const c of containers) {
      const racks = c.racks as Row[] | undefined;
      if (!Array.isArray(racks)) continue;
      const cn = String((c.container_type as { name?: string } | undefined)?.name ?? c.id ?? "Kontainer");
      for (const r of racks) {
        if (r.id != null) opts.push({ id: Number(r.id), label: `${cn} / ${String(r.name ?? r.id)}` });
      }
    }
    return opts;
  }, [containers]);

  if (!Number.isFinite(shipmentId) || shipmentId < 1) {
    return <p className="text-sm text-red-600">ID tidak valid.</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Memuat shipment…</p>;
  }

  if (error || !data) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{error ?? "Tidak ditemukan."}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/admin/shipments"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}
        >
          <ArrowLeft className="h-4 w-4" />
          Daftar shipment
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">
          {String(data.waybill_number ?? data.shipment_number ?? "Shipment")}
        </h1>
        <Badge variant="outline" className={cn(shipmentStatusBadgeClass(st))}>
          {shipmentStatusLabel(st)}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => void pdf()}>
          <Download className="h-4 w-4" />
          Waybill PDF
        </Button>
        <Button type="button" size="sm" onClick={openEditShipment}>
          Edit jadwal / catatan
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setTrackOpen(true)}>
          Tambah tracking
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setContOpen(true)}>
          <Plus className="h-4 w-4" />
          Kontainer
        </Button>
        <Button type="button" size="sm" onClick={openNewItem}>
          <Package className="h-4 w-4" />
          Item cargo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
          <CardDescription>{company?.name ?? "—"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Asal: </span>
            {origin?.name ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Tujuan: </span>
            {dest?.name ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Est. berangkat: </span>
            {data.estimated_departure ? String(data.estimated_departure).slice(0, 10) : "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Est. tiba: </span>
            {data.estimated_arrival ? String(data.estimated_arrival).slice(0, 10) : "—"}
          </div>
          {data.notes ? (
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Catatan: </span>
              {String(data.notes)}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trackings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada entri tracking.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {trackings.map((t) => (
                <li key={String(t.id)} className="border-b border-border/80 pb-2 last:border-0">
                  <div className="font-medium">{String(t.status ?? "")}</div>
                  <div className="text-muted-foreground text-xs">
                    {t.tracked_at ? String(t.tracked_at) : ""}
                    {t.notes ? ` — ${String(t.notes)}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontainer & rack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {containers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada kontainer.</p>
          ) : (
            containers.map((c) => {
              const cid = Number(c.id);
              const ct = c.container_type as { name?: string; size?: string } | undefined;
              const racks = c.racks as Row[] | undefined;
              return (
                <div key={cid} className="rounded-lg border p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                      {ct?.name ?? "Kontainer"} {ct?.size ? `(${ct.size})` : ""}
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => openRack(cid)}>
                      + Rack
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {String(c.container_number ?? "—")} / seal: {String(c.seal_number ?? "—")}
                  </div>
                  {Array.isArray(racks) && racks.length > 0 ? (
                    <ul className="text-sm list-disc pl-5">
                      {racks.map((r) => (
                        <li key={String(r.id)}>{String(r.name ?? r.id)}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item cargo</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Letak</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={String(it.id)}>
                  <TableCell>{String(it.name ?? "")}</TableCell>
                  <TableCell>{String(it.quantity ?? "")}</TableCell>
                  <TableCell>{String(it.gross_weight ?? "")}</TableCell>
                  <TableCell>{placementTypeLabel(it.placement_type)}</TableCell>
                  <TableCell className="text-right">
                    <Button type="button" size="sm" variant="ghost" onClick={() => openEditItem(it)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        setDeleteItemRow(it);
                        setDeleteItemOpen(true);
                      }}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 ? <p className="text-sm text-muted-foreground pt-2">Belum ada item.</p> : null}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Edit jadwal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Est. berangkat</Label>
              <Input type="date" value={estDep} onChange={(e) => setEstDep(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Est. tiba</Label>
              <Input type="date" value={estArr} onChange={(e) => setEstArr(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Catatan</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Catatan pengiriman (opsional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={savingEdit}>
              Batal
            </Button>
            <Button type="button" onClick={() => void saveEdit()} disabled={savingEdit}>
              {savingEdit ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={trackOpen} onOpenChange={setTrackOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader className={DIALOG_CREATE_HEADER_CLASS}>
            <DialogTitle>Update tracking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={trackStatus}
                onValueChange={(v) => {
                  if (v != null) setTrackStatus(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRACKING_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Waktu</Label>
              <Input type="datetime-local" value={trackAt} onChange={(e) => setTrackAt(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Catatan</Label>
              <Textarea
                value={trackNotes}
                onChange={(e) => setTrackNotes(e.target.value)}
                rows={2}
                placeholder="Keterangan singkat (opsional)"
              />
            </div>
            <div className="space-y-1">
              <Label>Foto (opsional)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setTrackFiles(e.target.files)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTrackOpen(false)} disabled={savingTrack}>
              Batal
            </Button>
            <Button type="button" onClick={() => void saveTracking()} disabled={savingTrack}>
              {savingTrack ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={contOpen} onOpenChange={setContOpen}>
        <DialogContent showCloseButton>
          <DialogHeader className={DIALOG_CREATE_HEADER_CLASS}>
            <DialogTitle>Tambah kontainer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Jenis kontainer</Label>
              <Select
                value={contTypeId}
                onValueChange={(v) => {
                  if (v != null) setContTypeId(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {containerTypes.map((ct) => (
                    <SelectItem key={String(ct.id)} value={String(ct.id)}>
                      {String(ct.name ?? ct.id)} ({String(ct.size ?? "")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Nomor kontainer</Label>
              <Input
                value={contNum}
                onChange={(e) => setContNum(e.target.value)}
                placeholder="Mis. ABCD1234567"
              />
            </div>
            <div className="space-y-1">
              <Label>Segel</Label>
              <Input value={contSeal} onChange={(e) => setContSeal(e.target.value)} placeholder="Nomor segel (opsional)" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setContOpen(false)} disabled={savingCont}>
              Batal
            </Button>
            <Button type="button" onClick={() => void saveContainer()} disabled={savingCont || !contTypeId}>
              {savingCont ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rackOpen} onOpenChange={setRackOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Tambah rack</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Nama rack</Label>
              <Input value={rackName} onChange={(e) => setRackName(e.target.value)} placeholder="Rack A" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRackOpen(false)} disabled={savingRack}>
              Batal
            </Button>
            <Button type="button" onClick={() => void saveRack()} disabled={savingRack || !rackName.trim()}>
              {savingRack ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogContent showCloseButton className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className={cn(itemMode === "create" && DIALOG_CREATE_HEADER_CLASS)}>
            <DialogTitle>{itemMode === "create" ? "Tambah item" : "Edit item"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder={itemMode === "create" ? "Nama barang / komoditas" : undefined}
              />
            </div>
            <div className="space-y-1">
              <Label>Deskripsi</Label>
              <Textarea
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                rows={2}
                placeholder={itemMode === "create" ? "Detail kemasan, HS code, dsb. (opsional)" : undefined}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  placeholder={itemMode === "create" ? "1" : undefined}
                />
              </div>
              <div className="space-y-1">
                <Label>Berat (kg)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={itemWeight}
                  onChange={(e) => setItemWeight(e.target.value)}
                  placeholder={itemMode === "create" ? "0" : undefined}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Penempatan</Label>
              <Select value={itemPlacement} onValueChange={(v) => setItemPlacement(v as "rack" | "floor")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="floor">Lantai kontainer</SelectItem>
                  <SelectItem value="rack">Rack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {containers.length > 0 ? (
              <div className="space-y-1">
                <Label>Kontainer (opsional)</Label>
                <Select
                  value={itemContainerId}
                  onValueChange={(v) => {
                    if (v != null) setItemContainerId(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {containers.map((c) => (
                      <SelectItem key={String(c.id)} value={String(c.id)}>
                        #{String(c.id)} {String((c.container_type as { name?: string } | undefined)?.name ?? "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            {itemPlacement === "rack" && rackOptions.length > 0 ? (
              <div className="space-y-1">
                <Label>Rack</Label>
                <Select
                  value={itemRackId}
                  onValueChange={(v) => {
                    if (v != null) setItemRackId(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {rackOptions.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="frag" checked={itemFragile} onCheckedChange={(v) => setItemFragile(v === true)} />
                <Label htmlFor="frag" className="font-normal">
                  Rapuh
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="stk" checked={itemStack} onCheckedChange={(v) => setItemStack(v === true)} />
                <Label htmlFor="stk" className="font-normal">
                  Dapat ditumpuk
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setItemOpen(false)} disabled={savingItem}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => void saveItem()}
              disabled={savingItem || !itemName.trim() || !itemWeight.trim()}
            >
              {savingItem ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteItemOpen}
        onOpenChange={setDeleteItemOpen}
        title="Hapus item?"
        description={`Yakin hapus "${String(deleteItemRow?.name ?? "")}"?`}
        loading={deleteItemLoading}
        onConfirm={handleDeleteItem}
      />
    </div>
  );
}
