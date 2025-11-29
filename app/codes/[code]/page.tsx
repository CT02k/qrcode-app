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
    .select("payload")
    .eq("code", (await params).code)
    .maybeSingle();

  if (error || !data?.payload) {
    notFound();
  }

  redirect(data.payload);
}
