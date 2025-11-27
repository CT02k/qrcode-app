import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center contain-content">
      <div className="absolute w-full h-48  bg-gradient-to-br from-rose-950 via-rose-900 to-rose-950 -z-40 blur-3xl opacity-10"></div>
      <div className="absolute w-full h-full bg-gradient-to-br from-zinc-950/50 via-zinc-900/25 to-zinc-950/50 -z-40"></div>
      <div
        className="absolute size-[48rem] rounded-full blur-3xl -bottom-1/2 p-2"
        style={{
          background:
            "linear-gradient(-45deg,rgba(76, 5, 25, 1) 0%, rgba(244, 63, 94, 1) 50%, rgba(76, 5, 25, 1) 100%)",
        }}
      >
        <div className="bg-zinc-950 size-full rounded-full"></div>
      </div>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Next.js Supabase Starter</Link>
              <div className="flex items-center gap-2">
                <DeployButton />
              </div>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-20 w-full p-5">
          <Hero />
        </div>
      </div>
    </main>
  );
}
