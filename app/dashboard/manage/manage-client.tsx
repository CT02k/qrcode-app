"use client";

import { useEffect, useMemo, useState } from "react";

import { Field } from "@/components/field";
import { QrPreview } from "@/components/qr-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildPayload, QR_TYPE, type QRContentType } from "@/lib/qr";
import { deleteQrCode, updateQrCode } from "../actions";
import type { StoredQr } from "./page";
import { CalendarClock, Loader2, RefreshCcw, Save, Trash2 } from "lucide-react";

type ManageQr = StoredQr & { qr_type: QRContentType };

const normalizeRows = (list: StoredQr[]): ManageQr[] =>
  list.map((item) => {
    const candidate = item.qr_type as QRContentType;
    const safeType = QR_TYPE[candidate] ? candidate : "url";
    return { ...item, qr_type: safeType };
  });

export function ManageClient({ items }: { items: StoredQr[] }) {
  const [rows, setRows] = useState<ManageQr[]>(normalizeRows(items));
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [appOrigin, setAppOrigin] = useState(
    (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, ""),
  );

  useEffect(() => {
    if (!appOrigin && typeof window !== "undefined") {
      setAppOrigin(window.location.origin);
    }
  }, [appOrigin]);

  useEffect(() => {
    setRows(normalizeRows(items));
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        row.label?.toLowerCase().includes(term) ||
        row.content.toLowerCase().includes(term) ||
        row.payload.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const handleDelete = async (id: string) => {
    setStatus(null);
    const { error } = await deleteQrCode(id);
    if (error) {
      setStatus(error);
      return;
    }

    setRows((prev) => prev.filter((row) => row.id !== id));
    setStatus("QR removed.");
  };

  const handleUpdate = async (nextRow: ManageQr) => {
    setStatus(null);
    const updated = { ...nextRow };
    const payload = buildPayload(updated.qr_type, updated.content);
    if (!payload) {
      setStatus("Add content before updating this QR.");
      return;
    }

    const redirectTarget =
      updated.code && appOrigin
        ? `${appOrigin}/codes/${updated.code}`
        : updated.redirect_url || payload;

    setStatus("Saving...");
    try {
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: redirectTarget,
          color: updated.color || "#ec4870",
          background: updated.background || "#0b0b0f",
        }),
      });

      if (!response.ok) throw new Error("Could not save QR.");
      const { dataUrl } = await response.json();

      const { error } = await updateQrCode(updated.id, {
        label: updated.label ?? "",
        content: updated.content,
        type: updated.qr_type,
        payload,
        qrImage: dataUrl as string,
        color: updated.color,
        background: updated.background,
        redirectUrl: redirectTarget,
      });

      if (error) throw new Error(error);

      setRows((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? {
                ...updated,
                payload,
                qr_image: dataUrl as string,
                redirect_url: redirectTarget,
              }
            : item,
        ),
      );
      setStatus("QR updated.");
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Unable to save this QR right now.",
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-rose-50">Your QR codes</h2>
          <p className="text-sm text-rose-100/70">
            Filter, edit, or delete entries saved in Supabase.
          </p>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by label or content"
          className="md:w-80 bg-zinc-900/80 border-zinc-800 text-rose-50"
        />
      </div>

      {status && (
        <div className="rounded-lg border border-rose-900/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">
          {status}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-10 text-center text-rose-100/70">
          No QR codes yet. Create one first.
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((row) => (
            <QrRow
              key={row.id}
              row={row}
              appOrigin={appOrigin}
              onChange={(next) =>
                setRows((prev) =>
                  prev.map((item) =>
                    item.id === row.id ? { ...item, ...next } : item,
                  ),
                )
              }
              onDelete={() => handleDelete(row.id)}
              onSave={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QrRow({
  row,
  appOrigin,
  onChange,
  onDelete,
  onSave,
}: {
  row: ManageQr;
  appOrigin: string;
  onChange: (next: Partial<ManageQr>) => void;
  onDelete: () => Promise<void>;
  onSave: (next: ManageQr) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const redirectTarget =
    (row.code && appOrigin && `${appOrigin}/codes/${row.code}`) ||
    row.redirect_url ||
    row.payload;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(row);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-900/60 bg-zinc-950/70 p-6 shadow-lg shadow-rose-900/10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        <Field label="Label">
          <Input
            value={row.label ?? ""}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Campaign QR, Product page, etc."
            className="bg-zinc-900/80 border-zinc-800 text-rose-50"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Type">
            <select
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-rose-50"
              value={row.qr_type}
              onChange={(e) =>
                onChange({ qr_type: e.target.value as QRContentType })
              }
            >
              {Object.entries(QR_TYPE).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Content">
            <Input
              value={row.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder={QR_TYPE[row.qr_type].placeholder}
              className="bg-zinc-900/80 border-zinc-800 text-rose-50"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Foreground color">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
              <input
                type="color"
                value={row.color ?? "#ec4870"}
                onChange={(e) => onChange({ color: e.target.value })}
                className="h-10 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
              />
              <span className="text-sm text-rose-50">
                {row.color ?? "#ec4870"}
              </span>
            </div>
          </Field>
          <Field label="Background color">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
              <input
                type="color"
                value={row.background ?? "#0b0b0f"}
                onChange={(e) => onChange({ background: e.target.value })}
                className="h-10 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
              />
              <span className="text-sm text-rose-50">
                {row.background ?? "#0b0b0f"}
              </span>
            </div>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-rose-100/60">
          {row.updated_at && (
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={14} />
              Updated {new Date(row.updated_at).toLocaleString()}
            </span>
          )}
          {!row.updated_at && row.created_at && (
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={14} />
              Created {new Date(row.created_at).toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-rose-500 hover:bg-rose-500/80"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Save size={16} />
                Save
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="border-red-500/50 text-red-100 hover:bg-red-500/10"
          >
            {isDeleting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Removing...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Trash2 size={16} />
                Delete
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-rose-100/80">
          <RefreshCcw size={16} />
          <span>Preview</span>
        </div>
        <QrPreview qrImage={row.qr_image ?? undefined} />
      </div>
    </div>
  );
}
