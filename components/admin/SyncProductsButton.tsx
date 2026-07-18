"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncProductsButton() {
  const router = useRouter(); const [state,setState]=useState("");
  async function sync(){setState("Syncing…");const r=await fetch("/api/admin/products/sync",{method:"POST"});const b=await r.json().catch(()=>({}));setState(r.ok?`${b.synced} synced`:b.error||"Failed");if(r.ok)router.refresh();}
  return <button className="btn-primary" onClick={sync} disabled={state==="Syncing…"}>{state || "Sync Shopify products"}</button>;
}
