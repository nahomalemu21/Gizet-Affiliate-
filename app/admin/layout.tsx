import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireSession("admin");
  return <AppShell mode="admin">{children}</AppShell>;
}
