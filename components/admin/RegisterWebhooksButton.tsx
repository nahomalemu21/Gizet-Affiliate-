"use client";
import { useState } from "react";

export function RegisterWebhooksButton() {
  const [state,setState]=useState("");
  async function register(){setState("Registering…");const r=await fetch("/api/admin/shopify/register-webhooks",{method:"POST"});const b=await r.json().catch(()=>({}));setState(r.ok?"Webhooks connected":b.error||"Failed");}
  return <button className="btn-secondary" onClick={register} disabled={state==="Registering…"}>{state||"Connect Shopify webhooks"}</button>;
}
