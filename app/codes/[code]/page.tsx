import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CodeRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qr_codes")
    .select("payload, qr_type")
    .eq("code", (await params).code)
    .maybeSingle();

  if (error || !data?.payload) notFound();

  if (data.qr_type === "text") {
    return (
      <div className="min-h-screen bg-zinc-950 text-rose-50 flex items-center justify-center px-6">
        <div className="max-w-4xl w-full space-y-4">
          <p className="text-sm uppercase tracking-wide text-rose-200/70">
            QR Content
          </p>
          <pre className="whitespace-pre-wrap break-words rounded-xl border border-rose-900/40 bg-black/40 p-6 text-base leading-relaxed font-mono">
            {data.payload}
          </pre>
        </div>
      </div>
    );
  }

  redirect(data.payload);
}
