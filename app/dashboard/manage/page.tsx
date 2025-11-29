import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";

import { ManageClient } from "./manage-client";

export type StoredQr = {
  id: string;
  code: string;
  label: string | null;
  content: string;
  payload: string;
  qr_type: string;
  qr_image: string;
  color: string | null;
  background: string | null;
  created_at: string | null;
  updated_at: string | null;
  redirect_url?: string | null;
};

export default async function ManagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("qr_codes")
    .select(
      "id,code,label,content,payload,qr_type,qr_image,color,background,created_at,updated_at,redirect_url",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 text-sm text-rose-100/80">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-rose-200 hover:text-rose-50"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </div>

      <ManageClient items={(data as StoredQr[] | null) ?? []} />
    </div>
  );
}
