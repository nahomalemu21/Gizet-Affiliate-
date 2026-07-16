export function formatEtb(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value) + " ETB";
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
