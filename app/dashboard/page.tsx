import type { ReactNode } from "react";

import Link from "next/link";
import { redirect } from "next/navigation";

import { QR_TYPE, type QRContentType } from "@/lib/qr";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, InfoIcon, Sparkles, Wrench } from "lucide-react";

type SearchParams = {
  type?: string;
  content?: string;
  payload?: string;
  dynamic?: string;
};

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const desiredType = params.type as QRContentType | undefined;
  const hasPrefill =
    params.dynamic === "true" &&
    params.content &&
    desiredType &&
    QR_TYPE[desiredType];

  if (hasPrefill) {
    const redirectParams = new URLSearchParams({
      type: desiredType,
      content: params.content!,
      payload: params.payload ?? "",
    });

    redirect(`/dashboard/create?${redirectParams.toString()}`);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-10">
      <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-xl p-6 flex items-start gap-3">
        <div className="mt-0.5">
          <InfoIcon size={18} className="text-rose-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-rose-50 font-semibold">
            Welcome back, {user.email ?? "creator"}.
          </p>
          <p className="text-sm text-rose-100/70">
            Build dynamic QR codes and keep them organized. Choose what you want
            to do below.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <DashboardCard
          title="Create QR code"
          description="Compose a new QR with custom colors, preview it and save."
          href="/dashboard/create"
          icon={<Sparkles size={18} />}
          cta="Start building"
        />
        <DashboardCard
          title="Manage QR codes"
          description="Edit labels and targets or delete it."
          href="/dashboard/manage"
          icon={<Wrench size={18} />}
          cta="Open manager"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  icon,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-900/60 bg-zinc-950/60 p-6 shadow-lg shadow-rose-900/10 space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-100">
        {icon}
        <span>{cta}</span>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-rose-50">{title}</h3>
        <p className="text-sm text-rose-100/70">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-semibold text-rose-300 hover:text-rose-200"
      >
        Continue
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
