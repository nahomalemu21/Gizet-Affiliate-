export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo-wrap">
      <div className="logo-mark" aria-hidden="true"><span>G</span></div>
      {!compact && <div><div className="logo-name">Gizet</div><div className="logo-sub">Creator Commerce</div></div>}
    </div>
  );
}
