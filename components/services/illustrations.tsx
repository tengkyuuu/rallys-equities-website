/* Decorative product illustrations for the Services page showcases. */

/** Live order book, price chart and order ticket. */
export function OrderBookIllustration() {
  return (
    <svg viewBox="0 0 380 280" fill="none" width="100%">
      <rect width="380" height="280" fill="rgba(10,107,75,.06)" rx="12" />
      <rect x="20" y="20" width="340" height="28" rx="6" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.07)" strokeWidth=".5" />
      <text x="30" y="39" fill="var(--au)" fontSize="11" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">
        LIVE ORDER BOOK
      </text>
      <rect x="20" y="58" width="340" height="130" rx="6" fill="rgba(10,107,75,.07)" stroke="rgba(18,184,124,.12)" strokeWidth=".5" />
      <polyline
        points="30,168 75,148 120,153 165,128 210,122 250,106 290,112 330,90 365,72"
        stroke="var(--g3)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M30,168 75,148 120,153 165,128 210,122 250,106 290,112 330,90 365,72 365,188 30,188Z" fill="url(#g1)" opacity=".35" />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12B87C" stopOpacity=".4" />
          <stop offset="100%" stopColor="#12B87C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="365" cy="72" r="4" fill="var(--g3)" />
      <rect x="20" y="206" width="100" height="52" rx="6" fill="rgba(10,107,75,.15)" stroke="rgba(18,184,124,.2)" strokeWidth=".5" />
      <text x="30" y="222" fill="var(--au)" fontSize="8" fontFamily="sans-serif">
        COMPANY A
      </text>
      <text x="30" y="238" fill="var(--tx)" fontSize="12" fontFamily="sans-serif" fontWeight="700">
        Live Price
      </text>
      <text x="30" y="252" fill="var(--up)" fontSize="9" fontFamily="sans-serif">
        ▲
      </text>
      <rect x="130" y="206" width="100" height="52" rx="6" fill="rgba(10,107,75,.15)" stroke="rgba(18,184,124,.2)" strokeWidth=".5" />
      <text x="140" y="222" fill="var(--au)" fontSize="8" fontFamily="sans-serif">
        COMPANY B
      </text>
      <text x="140" y="238" fill="var(--tx)" fontSize="12" fontFamily="sans-serif" fontWeight="700">
        Live Price
      </text>
      <text x="140" y="252" fill="var(--up)" fontSize="9" fontFamily="sans-serif">
        ▲
      </text>
      <rect x="240" y="206" width="120" height="52" rx="6" fill="rgba(200,168,75,.08)" stroke="rgba(200,168,75,.2)" strokeWidth=".5" />
      <text x="250" y="222" fill="var(--au)" fontSize="8" fontFamily="sans-serif">
        ORDER TICKET
      </text>
      <text x="250" y="240" fill="var(--g3)" fontSize="11" fontFamily="sans-serif" fontWeight="700">
        Market Order
      </text>
      <text x="250" y="254" fill="var(--tx)" fontSize="9" fontFamily="sans-serif">
        Instant execution
      </text>
    </svg>
  );
}

/** KMI-30 sector-mix donut with the Shariah-certified banner. */
export function ShariahMixIllustration() {
  return (
    <svg viewBox="0 0 380 280" fill="none" width="100%">
      <rect width="380" height="280" fill="rgba(10,107,75,.06)" rx="12" />
      <circle cx="190" cy="128" r="88" fill="none" stroke="rgba(18,184,124,.12)" strokeWidth="1" />
      <path d="M190 40 A88 88 0 0 1 268 172" stroke="var(--g3)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M268 172 A88 88 0 0 1 150 214" stroke="var(--au)" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M150 214 A88 88 0 0 1 120 92" stroke="#4299E1" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M120 92 A88 88 0 0 1 190 40" stroke="#9A64FF" strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="190" cy="128" r="54" fill="rgba(5,16,30,.85)" />
      <text x="190" y="122" textAnchor="middle" fill="var(--up)" fontSize="11" fontFamily="sans-serif" fontWeight="700">
        KMI-30
      </text>
      <text x="190" y="136" textAnchor="middle" fill="var(--au)" fontSize="9" fontFamily="sans-serif">
        Halal Universe
      </text>
      <text x="190" y="152" textAnchor="middle" fill="var(--tx)" fontSize="13" fontFamily="sans-serif" fontWeight="700">
        Sector Mix
      </text>
      <g fontSize="10" fontFamily="sans-serif">
        <rect x="255" y="30" width="10" height="10" rx="2" fill="var(--g3)" />
        <text x="270" y="40" fill="var(--tx)">
          Banks 42%
        </text>
        <rect x="255" y="50" width="10" height="10" rx="2" fill="var(--au)" />
        <text x="270" y="60" fill="var(--tx)">
          Energy 28%
        </text>
        <rect x="255" y="70" width="10" height="10" rx="2" fill="#4299E1" />
        <text x="270" y="80" fill="var(--tx)">
          Cement 18%
        </text>
        <rect x="255" y="90" width="10" height="10" rx="2" fill="#9A64FF" />
        <text x="270" y="100" fill="var(--tx)">
          Other 12%
        </text>
      </g>
      <rect x="20" y="220" width="340" height="38" rx="6" fill="rgba(10,107,75,.12)" stroke="rgba(18,184,124,.2)" strokeWidth=".5" />
      <text x="190" y="235" textAnchor="middle" fill="var(--up)" fontSize="9" fontFamily="sans-serif" fontWeight="700">
        ✓ SHARIAH CERTIFIED — Screened by advisory board
      </text>
      <text x="190" y="250" textAnchor="middle" fill="rgba(246,242,234,.4)" fontSize="8" fontFamily="sans-serif">
        Reviewed periodically for continued compliance
      </text>
    </svg>
  );
}

/** Portfolio dashboard: value, return, allocation bars, advisor notes. */
export function PortfolioIllustration() {
  return (
    <svg viewBox="0 0 380 280" fill="none" width="100%">
      <rect width="380" height="280" fill="rgba(10,107,75,.06)" rx="12" />
      <text x="20" y="36" fill="rgba(246,242,234,.3)" fontSize="9" fontFamily="sans-serif" letterSpacing="2">
        PORTFOLIO DASHBOARD
      </text>
      <rect x="20" y="46" width="160" height="58" rx="8" fill="rgba(10,107,75,.15)" stroke="rgba(18,184,124,.2)" strokeWidth=".5" />
      <text x="30" y="64" fill="rgba(246,242,234,.4)" fontSize="9" fontFamily="sans-serif">
        Total Value
      </text>
      <text x="30" y="82" fill="var(--tx)" fontSize="15" fontFamily="sans-serif" fontWeight="700">
        Updated Live
      </text>
      <text x="30" y="97" fill="rgba(246,242,234,.45)" fontSize="9" fontFamily="sans-serif">
        Track performance anytime
      </text>
      <rect x="194" y="46" width="166" height="58" rx="8" fill="rgba(200,168,75,.1)" stroke="rgba(200,168,75,.2)" strokeWidth=".5" />
      <text x="204" y="64" fill="rgba(246,242,234,.4)" fontSize="9" fontFamily="sans-serif">
        YTD Return
      </text>
      <text x="204" y="82" fill="var(--au)" fontSize="15" fontFamily="sans-serif" fontWeight="700">
        Your Actual Return
      </text>
      <text x="204" y="97" fill="rgba(246,242,234,.4)" fontSize="9" fontFamily="sans-serif">
        Reviewed each quarter
      </text>
      <rect x="20" y="118" width="340" height="76" rx="8" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.06)" strokeWidth=".5" />
      <text x="30" y="134" fill="rgba(246,242,234,.35)" fontSize="8" fontFamily="sans-serif" letterSpacing="1">
        ALLOCATION
      </text>
      <rect x="30" y="142" width="116" height="7" rx="3" fill="rgba(255,255,255,.07)" />
      <rect x="30" y="142" width="82" height="7" rx="3" fill="var(--g3)" />
      <text x="30" y="163" fill="rgba(246,242,234,.5)" fontSize="9" fontFamily="sans-serif">
        Banks 35%
      </text>
      <rect x="30" y="170" width="116" height="7" rx="3" fill="rgba(255,255,255,.07)" />
      <rect x="30" y="170" width="58" height="7" rx="3" fill="var(--au)" />
      <text x="30" y="191" fill="rgba(246,242,234,.5)" fontSize="9" fontFamily="sans-serif">
        Energy 25%
      </text>
      <rect x="170" y="142" width="116" height="7" rx="3" fill="rgba(255,255,255,.07)" />
      <rect x="170" y="142" width="46" height="7" rx="3" fill="#4299E1" />
      <text x="170" y="163" fill="rgba(246,242,234,.5)" fontSize="9" fontFamily="sans-serif">
        Cement 20%
      </text>
      <rect x="170" y="170" width="116" height="7" rx="3" fill="rgba(255,255,255,.07)" />
      <rect x="170" y="170" width="28" height="7" rx="3" fill="#9A64FF" />
      <text x="170" y="191" fill="rgba(246,242,234,.5)" fontSize="9" fontFamily="sans-serif">
        Other 20%
      </text>
      <rect x="20" y="208" width="340" height="44" rx="8" fill="rgba(10,107,75,.1)" stroke="rgba(18,184,124,.12)" strokeWidth=".5" />
      <text x="30" y="226" fill="rgba(246,242,234,.35)" fontSize="8" fontFamily="sans-serif" letterSpacing="1">
        ADVISOR NOTES
      </text>
      <text x="30" y="244" fill="rgba(246,242,234,.6)" fontSize="10" fontFamily="sans-serif">
        Personalized guidance from your relationship manager
      </text>
    </svg>
  );
}
