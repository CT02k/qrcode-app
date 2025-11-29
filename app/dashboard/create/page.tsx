import Link from "next/link";
import { redirect } from "next/navigation";

import { QR_TYPE, type QRContentType } from "@/lib/qr";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";

import { CreateQrForm } from "./create-form";

type SearchParams = { type?: string; content?: string; payload?: string };

export default async function CreatePage({
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

  const prefillType = params.type as QRContentType | undefined;
  const canPrefill = prefillType && QR_TYPE[prefillType] && params.content;

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

      <CreateQrForm
        prefill={
          canPrefill
            ? {
                type: prefillType!,
                content: params.content!,
                payload: params.payload ?? undefined,
              }
            : undefined
        }
      />
    </div>
  );
}
