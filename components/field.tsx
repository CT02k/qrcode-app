import type { ReactNode } from "react";

import { Label } from "@radix-ui/react-label";

export function Field({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {children}
    </div>
  );
}
