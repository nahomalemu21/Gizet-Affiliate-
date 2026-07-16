"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icons";
import { Logo } from "@/components/Logo";

const creatorNav: { href: string; label: string; icon: IconName }[] = [
  { href: "/creator", label: "Overview", icon: "home" },
  { href: "/creator/products", label: "Products", icon: "products" },
  { href: "/creator/orders", label: "Orders", icon: "orders" },
  { href: "/creator/links", label: "My links", icon: "links" },
  { href: "/creator/payouts", label: "Payouts", icon: "wallet" },
];

const adminNav: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/creators", label: "Creators", icon: "users" },
  { href: "/admin/products", label: "Products", icon: "products" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/payouts", label: "Payouts", icon: "wallet" },
];

export function AppShell({ mode, children }: { mode: "creator" | "admin"; children: ReactNode }) {
  const pathname = usePathname();
  const nav = mode === "creator" ? creatorNav : adminNav;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top"><Logo /></div>
        <nav className="sidebar-nav">
          <div className="nav-label">{mode === "creator" ? "Creator portal" : "Gizet operations"}</div>
          {nav.map((item) => {
            const active = item.href === `/${mode}` ? pathname === item.href : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}><Icon name={item.icon} size={17} /><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href={mode === "creator" ? "/admin" : "/creator"} className="switch-role"><Icon name={mode === "creator" ? "shield" : "users"} size={16}/><span>Open {mode === "creator" ? "admin" : "creator"} view</span></Link>
          <form action="/api/auth/logout" method="post"><button className="nav-item logout-button" type="submit"><Icon name="logout" size={17}/><span>Sign out</span></button></form>
        </div>
      </aside>
      <div className="mobile-bar"><Logo compact/><div className="mobile-title">{mode === "creator" ? "Creator Portal" : "Admin Portal"}</div><Icon name="menu"/></div>
      <main className="main-content">{children}</main>
    </div>
  );
}
