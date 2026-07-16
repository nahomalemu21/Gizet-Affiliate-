"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["pending","confirmed","out_for_delivery","delivered","rejected","cancelled","returned"];
export function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const router=useRouter();const [value,setValue]=useState(status);const [saving,setSaving]=useState(false);
  async function change(next:string){setValue(next);setSaving(true);const r=await fetch(`/api/admin/orders/${encodeURIComponent(id)}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})});setSaving(false);if(!r.ok)setValue(status);else router.refresh();}
  return <select className="status-select" value={value} disabled={saving} onChange={e=>change(e.target.value)}>{statuses.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select>;
}
