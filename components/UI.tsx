import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icons";

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

export function StatCard({ label, value, hint, icon, tone = "mint" }: { label: string; value: string; hint: string; icon: IconName; tone?: "mint" | "lime" | "amber" | "blue" }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon}/></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-hint">{hint}</div></div>;
}

export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill status-${key}`}>{status}</span>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><div className="empty-icon"><Icon name="spark"/></div><strong>{title}</strong><span>{text}</span></div>;
}
