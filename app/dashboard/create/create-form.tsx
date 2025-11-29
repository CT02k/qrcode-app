"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Field } from "@/components/field";
import { QrPreview } from "@/components/qr-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildPayload, QR_TYPE, type QRContentType } from "@/lib/qr";
import { createQrCode } from "../actions";
import { Loader2, Save } from "lucide-react";

type Prefill = {
  type: QRContentType;
  content: string;
  payload?: string;
};

export function CreateQrForm({ prefill }: { prefill?: Prefill }) {
  const [qrType, setQrType] = useState<QRContentType>(prefill?.type ?? "url");
  const [label, setLabel] = useState("");
  const [content, setContent] = useState(prefill?.content ?? "");
  const [color, setColor] = useState("#ec4870");
  const [background, setBackground] = useState("#0b0b0f");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [code, setCode] = useState(
    crypto.randomUUID().replace(/-/g, "").slice(0, 10),
  );
  const [appOrigin, setAppOrigin] = useState(
    (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, ""),
  );

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const payload = useMemo(
    () => buildPayload(qrType, content),
    [qrType, content],
  );

  useEffect(() => {
    if (!appOrigin && typeof window !== "undefined") {
      setAppOrigin(window.location.origin);
    }
  }, [appOrigin]);

  const buildPreview = async () => {
    if (!payload) {
      setStatus("Add some content to generate the QR.");
      return null;
    }

    const redirectUrl = code && appOrigin ? `${appOrigin}/codes/${code}` : null;
    if (!redirectUrl) {
      setStatus("Could not resolve the app URL to build the QR.");
      return null;
    }

    setIsPreviewing(true);
    setStatus("Generating preview...");
    try {
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: redirectUrl,
          color,
          background,
          size: 440,
          margin: 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate QR.");
      const { dataUrl } = await response.json();
      setQrImage(dataUrl);
      setStatus("Preview ready.");
      return dataUrl as string;
    } catch {
      setStatus("Could not build the QR right now.");
      return null;
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSave = () => {
    startSaving(async () => {
      const redirectUrl =
        code && appOrigin ? `${appOrigin}/codes/${code}` : null;
      if (!redirectUrl) {
        setStatus("Could not resolve the app URL to save the QR.");
        return;
      }

      const image = qrImage || (await buildPreview());
      if (!payload || !image) return;

      const { error } = await createQrCode({
        label,
        content,
        type: qrType,
        payload,
        qrImage: image,
        color,
        background,
        code,
        redirectUrl,
      });

      if (error) {
        setStatus(error);
        return;
      }

      setStatus("Saved! You can manage it in the manager page.");
      setQrImage(image);
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-900/60 bg-zinc-950/70 p-6 shadow-lg shadow-rose-900/10 space-y-4">
          <Field label="Label">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Campaign QR, Product page, etc."
              className="bg-zinc-900/80 border-zinc-800 text-rose-50"
            />
          </Field>

          <Field label="Type">
            <select
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-rose-50"
              value={qrType}
              onChange={(e) => setQrType(e.target.value as QRContentType)}
            >
              {Object.entries(QR_TYPE).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-rose-100/70">{QR_TYPE[qrType].helper}</p>
          </Field>

          <Field label="Content">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={QR_TYPE[qrType].placeholder}
              className="bg-zinc-900/80 border-zinc-800 text-rose-50"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Foreground color">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
                />
                <span className="text-sm text-rose-50">{color}</span>
              </div>
            </Field>
            <Field label="Background color">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
                />
                <span className="text-sm text-rose-50">{background}</span>
              </div>
            </Field>
          </div>

          <code className="rounded bg-zinc-800 px-2 py-0.5 mt-2 text-rose-100">
            {code}
          </code>

          <div className="flex gap-3">
            <Button
              onClick={buildPreview}
              disabled={isPreviewing}
              className="bg-rose-500 hover:bg-rose-500/80"
            >
              {isPreviewing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </span>
              ) : (
                "Preview"
              )}
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving || isPreviewing}
              className="border border-rose-500/40 bg-rose-500/10 text-rose-50 hover:bg-rose-500/20"
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
          </div>

          {status && (
            <div className="rounded-lg border border-rose-900/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">
              {status}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-zinc-900/60 bg-zinc-950/70 p-6 shadow-lg shadow-rose-900/10 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-200/70">
              Preview
            </p>
            <h3 className="text-lg font-semibold text-rose-50">
              Adjust and confirm your QR
            </h3>
          </div>
          <QrPreview qrImage={qrImage ?? undefined} />
        </div>
      </div>
    </div>
  );
}
