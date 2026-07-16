import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return <AppShell mode="creator">{children}</AppShell>;
}
