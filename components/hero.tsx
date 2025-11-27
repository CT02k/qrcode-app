"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useQrBuilder } from "@/app/hooks/use-qr-builder";
import { QRContentType, QR_TYPE } from "@/lib/qr";
import { QrCode } from "lucide-react";

import { Field } from "./field";
import { GetStartedButton } from "./get-started-button";
import { QrPreview } from "./qr-preview";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Hero() {
  const [qrType, setQrType] = useState<QRContentType>("url");
  const [isDynamic, setIsDynamic] = useState(false);
  const router = useRouter();

  const {
    content,
    setContent,
    setStatus,
    payload,
    qrImage,
    status,
    isGenerating,
    isDownloading,
    generate,
    download,
  } = useQrBuilder(qrType);

  useEffect(() => {
    if (isDynamic && qrType === "text") {
      setQrType("url");
    }
  }, [isDynamic, qrType]);

  const handleGenerate = async () => {
    if (isDynamic) {
      if (!payload) {
        setStatus("Fill in the content before generating the QR code.");
        return;
      }

      const params = new URLSearchParams({
        type: qrType,
        content,
        payload,
        dynamic: "true",
      });

      setStatus("Redirecting to dashboard to create a dynamic QR...");
      router.push(`/dashboard?${params.toString()}`);
      return;
    }

    await generate();
  };

  return (
    <div className="flex flex-col gap-12 lg:flex-row justify-between items-center px-6 lg:px-24 py-16">
      <div className="flex flex-col max-w-xl">
        <div className="size-12 rounded-lg p-0.5 bg-gradient-to-br from-black via-rose-500 to-black">
          <div className="size-full bg-zinc-950/75 border border-rose-900 rounded-lg flex items-center justify-center">
            <QrCode className="text-rose-500" size={28} />
          </div>
        </div>

        <h1 className="text-5xl bg-clip-text text-transparent bg-gradient-to-br from-rose-100 via-rose-500 to-rose-100 mt-5 font-semibold">
          Create and manage dynamic QR Codes
        </h1>

        <p className="text-xl mt-5">...</p>

        <GetStartedButton />
      </div>

      <div className="w-full lg:w-1/2">
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/50 bg-gradient-to-br from-black/5 via-rose-500/5 to-black/5 shadow-2xl p-6">
          <div className="relative flex flex-col gap-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-rose-200/70">
                QR Builder
              </p>
              <h3 className="text-2xl font-semibold text-rose-50">
                Build, generate and save in seconds
              </h3>
            </div>

            <div className="grid gap-16 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="flex flex-col gap-4">
                <Field label="Type">
                  <select
                    className="w-full rounded-lg border border-zinc-900/50 bg-zinc-900/80 px-3 py-2 text-sm text-rose-50"
                    value={qrType}
                    onChange={(e) => {
                      const nextType = e.target.value as QRContentType;
                      if (isDynamic && nextType === "text") return;
                      setQrType(nextType);
                    }}
                  >
                    {Object.entries(QR_TYPE).map(([key, meta]) => (
                      <option
                        key={key}
                        value={key}
                        disabled={isDynamic && key === "text"}
                      >
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-900/50 bg-zinc-900/80 px-3 py-2">
                    <div className="space-y-1">
                      <p className="text-sm text-rose-50">Dynamic QR</p>
                      <p className="text-xs text-rose-100/60">
                        Redirects to the dashboard with your QR details.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={isDynamic}
                      onClick={() => setIsDynamic((prev) => !prev)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        isDynamic ? "bg-rose-500" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          isDynamic ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </Field>

                <Field label="Content">
                  <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={QR_TYPE[qrType].placeholder}
                    className="bg-zinc-900/80 border-zinc-900/50 text-rose-50"
                  />
                  <p className="text-xs text-rose-100/60">
                    {QR_TYPE[qrType].helper}
                  </p>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-rose-500 hover:bg-rose-500/80"
                  >
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={download}
                    disabled={!qrImage || isDownloading}
                    className="border-zinc-800 bg-zinc-100 text-black hover:bg-zinc-100/80 hover:text-black"
                  >
                    {isDownloading ? "Downloading..." : "Download"}
                  </Button>
                </div>

                {status && (
                  <div className="rounded-lg border border-rose-900/40 bg-rose-500/5 px-4 py-3 text-sm text-rose-50">
                    {status}
                  </div>
                )}
              </div>

              <QrPreview qrImage={qrImage ?? undefined} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
