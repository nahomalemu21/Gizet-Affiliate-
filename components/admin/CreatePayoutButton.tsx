"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreatePayoutButton({ creatorId }: { creatorId: string }) {
  const router=useRouter();const [state,setState]=useState("");
  async function create(){setState("Creating…");const r=await fetch("/api/admin/payouts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({creatorId})});const b=await r.json().catch(()=>({}));setState(r.ok?"Created":b.error||"Failed");if(r.ok)router.refresh();}
  return <button className="small-action" onClick={create} disabled={state==="Creating…"}>{state||"Create payout"}</button>;
}
