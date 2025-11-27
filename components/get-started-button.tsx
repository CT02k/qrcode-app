import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function GetStartedButton() {
  return (
    <Link
      href="/"
      className="rounded-full w-fit mt-10 border contain-content border-zinc-800 px-4 py-2 bg-zinc-900 flex items-center gap-2 text-lg hover:text-black group relative transition-all"
    >
      <span className="z-10">Get Started</span>

      <span className="absolute bg-rose-400 rounded-full blur-2xl  size-8 -translate-x-1/2 left-1/2 right-1/2 bottom-0"></span>

      <span className="size-8"></span>
      <span className="px-1 py-1 size-8 bg-rose-500/90 backdrop-blur-lg rounded-full group-hover:w-[calc(100%-16px)] transition-all absolute right-2 flex justify-end text-white group-hover:text-black">
        <ArrowUpRight />
      </span>
    </Link>
  );
}
