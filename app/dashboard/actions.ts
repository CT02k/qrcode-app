"use server";

import { revalidatePath } from "next/cache";

import { buildPayload, type QRContentType } from "@/lib/qr";
import { createClient } from "@/lib/supabase/server";

type QrInput = {
  label: string;
  content: string;
  type: QRContentType;
  payload?: string | null;
  qrImage?: string | null;
  color?: string | null;
  background?: string | null;
  code?: string | null;
  redirectUrl?: string | null;
};

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, userId: null as string | null, error: error?.message };
  }

  return { supabase, userId: user.id, error: null as string | null };
}

function getRedirectUrl(code: string) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;
  const base = envUrl || vercelUrl || "http://localhost:3000";
  return `${base}/codes/${code}`;
}

export async function createQrCode({
  label,
  content,
  type,
  payload,
  qrImage,
  color,
  background,
  code,
  redirectUrl,
}: QrInput) {
  const { supabase, userId, error } = await getUserId();
  if (!userId || error) return { error: "You need to be signed in." };

  const resolvedPayload = payload ?? buildPayload(type, content);
  if (!resolvedPayload) return { error: "Fill the content to build the QR." };
  if (!qrImage) return { error: "Generate the QR preview before saving." };

  const uniqueCode =
    code?.trim() || crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const resolvedRedirect =
    redirectUrl && redirectUrl.endsWith(`/codes/${uniqueCode}`)
      ? redirectUrl
      : getRedirectUrl(uniqueCode);
  if (!resolvedRedirect) return { error: "App URL is not configured." };

  const now = new Date().toISOString();
  const { error: insertError } = await supabase.from("qr_codes").insert({
    user_id: userId,
    label: label?.trim() || "Untitled QR",
    content,
    payload: resolvedPayload,
    qr_type: type,
    qr_image: qrImage,
    code: uniqueCode,
    redirect_url: resolvedRedirect,
    color: color || "#ec4870",
    background: background || "#0b0b0f",
    created_at: now,
    updated_at: now,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/dashboard/manage");
  return { success: true as const };
}

export async function updateQrCode(
  id: string,
  {
    label,
    content,
    type,
    payload,
    qrImage,
    color,
    background,
    redirectUrl,
  }: QrInput,
) {
  const { supabase, userId, error } = await getUserId();
  if (!userId || error) return { error: "You need to be signed in." };

  const resolvedPayload = payload ?? buildPayload(type, content);
  if (!resolvedPayload) return { error: "Fill the content to build the QR." };
  if (!qrImage) return { error: "Generate the QR preview before saving." };

  const { error: updateError } = await supabase
    .from("qr_codes")
    .update({
      label: label?.trim() || "Untitled QR",
      content,
      payload: resolvedPayload,
      qr_type: type,
      qr_image: qrImage,
      redirect_url: redirectUrl ?? undefined,
      color: color || "#ec4870",
      background: background || "#0b0b0f",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard/manage");
  return { success: true as const };
}

export async function deleteQrCode(id: string) {
  const { supabase, userId, error } = await getUserId();
  if (!userId || error) return { error: "You need to be signed in." };

  const { error: deleteError } = await supabase
    .from("qr_codes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (deleteError) return { error: deleteError.message };

  revalidatePath("/dashboard/manage");
  return { success: true as const };
}
