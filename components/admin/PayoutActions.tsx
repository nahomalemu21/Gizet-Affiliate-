"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayoutActions({ id, status }: { id: string; status: string }) {
  const router=useRouter();const [loading,setLoading]=useState(false);
  async function update(next:string){setLoading(true);const ref=next==="paid"?window.prompt("Transaction reference (optional)")||undefined:undefined;const r=await fetch(`/api/admin/payouts/${encodeURIComponent(id)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next,transactionReference:ref})});setLoading(false);if(r.ok)router.refresh();else alert((await r.json()).error||"Failed");}
  if(status==="paid") return <span>Complete</span>;
  return <div className="row-actions">{status==="pending"&&<button className="small-action" disabled={loading} onClick={()=>update("approved")}>Approve</button>}<button className="small-action primary" disabled={loading} onClick={()=>update("paid")}>Mark paid</button></div>;
}
