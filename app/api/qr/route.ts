import QRCode from "qrcode";
import { NextResponse } from "next/server";

type QRRequest = {
  data?: string;
  color?: string;
  background?: string;
  size?: number;
  margin?: number;
};

export async function POST(request: Request) {
  let body: QRRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, statusText: "Bad Request" },
    );
  }

  const {
    data,
    color = "#000000",
    background = "#ffffff",
    size = 440,
    margin = 0,
  } = body || {};

  if (!data || typeof data !== "string" || !data.trim()) {
    return NextResponse.json(
      { error: "Field 'data' is required." },
      { status: 400, statusText: "Bad Request" },
    );
  }

  const width = Math.min(Math.max(size ?? 440, 80), 1024);
  const marginSafe = Math.min(Math.max(margin ?? 0, 0), 8);

  try {
    const dataUrl = await QRCode.toDataURL(data.trim(), {
      width,
      margin: marginSafe,
      color: {
        dark: color || "#000000",
        light: background || "#ffffff",
      },
    });

    return NextResponse.json({ dataUrl });
  } catch (error) {
    console.error("[qr-api] Generation failed", error);
    return NextResponse.json(
      { error: "Unable to generate QR code." },
      { status: 500, statusText: "Internal Server Error" },
    );
  }
}
