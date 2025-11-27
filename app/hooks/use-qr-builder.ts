"use client";

import { useMemo, useState } from "react";

import { buildPayload, QRContentType } from "@/lib/qr";

export function useQrBuilder(qrType: QRContentType) {
  const [content, setContent] = useState("");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const payload = useMemo(
    () => buildPayload(qrType, content),
    [qrType, content],
  );

  const generate = async () => {
    if (!payload) {
      setStatus("Fill in the content before generating the QR code.");
      return;
    }

    setIsGenerating(true);
    setStatus("Generating QR code...");

    try {
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: payload,
          color: "#ec4870",
          background: "#0b0b0f",
          size: 440,
          margin: 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate QR code.");

      const { dataUrl } = await response.json();
      setQrImage(dataUrl);
      setStatus("QR code ready.");
    } catch {
      setStatus("Could not generate the QR code.");
    } finally {
      setIsGenerating(false);
    }
  };

  const save = async () => {
    if (!qrImage || !payload) {
      setStatus("Generate the QR code before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const stored = JSON.parse(localStorage.getItem("saved-qrs") ?? "[]");
      stored.unshift({
        payload,
        type: qrType,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("saved-qrs", JSON.stringify(stored.slice(0, 20)));
      setStatus("QR code saved locally.");
    } catch {
      setStatus("Could not save right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const download = () => {
    if (!qrImage) {
      setStatus("Generate the QR code before downloading.");
      return;
    }

    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = qrImage;
      link.download = "qr-code.png";
      link.click();
      setStatus("QR code downloaded.");
    } catch {
      setStatus("Could not download right now.");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    content,
    setContent,
    qrImage,
    status,
    isGenerating,
    isDownloading,
    isSaving,
    generate,
    save,
    download,
  };
}
