/** Decorative city skyline band. */
export default function Skyline() {
  return (
    <div
      className="skyline"
      style={{
        background: 'var(--nv2)',
        borderTop: '1px solid color-mix(in srgb, var(--au) 8%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--au) 8%, transparent)',
        overflow: 'hidden',
        lineHeight: '0',
      }}
    >
      <svg viewBox="0 0 1400 140" width="100%" style={{ display: 'block' }} preserveAspectRatio="xMidYMax meet">
        <rect width="1400" height="140" fill="#081828" />
        <g fill="rgba(18,184,124,.09)" stroke="rgba(18,184,124,.18)" strokeWidth="0.5">
          <rect x="30" y="90" width="26" height="50" />
          <rect x="37" y="76" width="12" height="16" />
          <rect x="66" y="68" width="42" height="72" />
          <rect x="80" y="52" width="14" height="18" />
          <rect x="118" y="84" width="34" height="56" />
          <rect x="162" y="42" width="52" height="98" />
          <rect x="182" y="26" width="12" height="18" />
          <rect x="224" y="62" width="30" height="78" />
          <rect x="264" y="34" width="62" height="106" />
          <rect x="290" y="18" width="10" height="18" />
          <rect x="336" y="20" width="68" height="120" />
          <rect x="362" y="8" width="16" height="14" />
          <rect x="336" y="60" width="10" height="10" fill="rgba(200,168,75,.1)" />
          <rect x="358" y="60" width="10" height="10" fill="rgba(200,168,75,.1)" />
          <rect x="380" y="60" width="10" height="10" fill="rgba(200,168,75,.1)" />
          <rect x="414" y="48" width="44" height="92" />
          <rect x="468" y="64" width="34" height="76" />
          <rect x="512" y="34" width="56" height="106" />
          <rect x="534" y="18" width="12" height="18" />
          <rect x="578" y="54" width="40" height="86" />
          <rect x="628" y="40" width="66" height="100" />
          <rect x="654" y="22" width="14" height="20" />
          <rect x="704" y="68" width="28" height="72" />
          <rect x="742" y="38" width="66" height="102" />
          <rect x="766" y="22" width="18" height="18" />
          <rect x="818" y="60" width="46" height="80" />
          <rect x="874" y="44" width="56" height="96" />
          <rect x="898" y="26" width="8" height="20" />
          <rect x="940" y="72" width="38" height="68" />
          <rect x="988" y="34" width="64" height="106" />
          <rect x="1012" y="16" width="16" height="20" />
          <rect x="1062" y="62" width="42" height="78" />
          <rect x="1114" y="46" width="50" height="94" />
          <rect x="1136" y="30" width="6" height="18" />
          <rect x="1174" y="74" width="34" height="66" />
          <rect x="1218" y="52" width="56" height="88" />
          <rect x="1240" y="34" width="12" height="20" />
          <rect x="1284" y="70" width="40" height="70" />
          <rect x="1334" y="88" width="32" height="52" />
          <rect x="1376" y="100" width="24" height="40" />
        </g>
        <circle cx="700" cy="28" r="18" fill="rgba(200,168,75,.1)" stroke="rgba(200,168,75,.28)" strokeWidth="1" />
        <circle cx="710" cy="26" r="14" fill="#081828" />
        <text x="370" y="20" textAnchor="middle" fill="rgba(200,168,75,.45)" fontSize="8" fontFamily="sans-serif" fontWeight="700">
          PSX
        </text>
        <line x1="0" y1="138" x2="1400" y2="138" stroke="rgba(18,184,124,.15)" strokeWidth="1" />
      </svg>
    </div>
  );
}
