import { QrCode } from "lucide-react";
import Image from "next/image";

export function QrPreview({ qrImage }: { qrImage?: string }) {
  return (
    <div className="rounded-xl size-fit border border-zinc-900/40 bg-zinc-900/70 p-4">
      <div className="aspect-square rounded-lg border border-zinc-900/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        {qrImage ? (
          <Image src={qrImage} alt="QR preview" width={512} height={512} />
        ) : (
          <EmptyPreview />
        )}
      </div>
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="flex flex-col items-center gap-2 text-rose-100/60">
      <QrCode size={32} className="text-rose-500" />
      <p className="text-sm">Generate a QR code to preview</p>
    </div>
  );
}
