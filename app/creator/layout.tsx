import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";

export default async function CreatorLayout({ children }: { children: ReactNode }) {
  await requireSession("creator");
  return <AppShell mode="creator">{children}</AppShell>;
}
