"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <button className="copy-button" onClick={copy}><Icon name={copied ? "check" : "copy"} size={15}/>{copied ? "Copied" : label}</button>;
}
