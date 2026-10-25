/** Client-confirmed figures (PRODUCT.md → Evidence on Hand). `target` is what the counter animates to. */
const STATS = [
  { target: 35, suffix: '+ Yrs', label: 'Combined Market Experience', urdu: 'برس کا مشترکہ تجربہ' },
  { target: 500, suffix: '+', label: 'PSX Listed Securities', urdu: 'درج شدہ سیکیورٹیز' },
  { target: 1000, suffix: '+', label: 'Investors Served', urdu: 'سرمایہ کاروں کا اعتماد' },
  { target: 8, label: 'Free Investor Calculators', urdu: 'مفت کیلکولیٹرز' },
];

/** Four headline figures that count up when scrolled into view (see page-effects). */
export default function StatsBand() {
  return (
    <div className="stats-band">
      {STATS.map((s) => (
        <div className="sc2" key={s.label}>
          <div className="snum">
            <span className="cnt" data-t={s.target}>
              0
            </span>
            {s.suffix}
          </div>
          <div className="slbl">{s.label}</div>
          <div className="surdu2">{s.urdu}</div>
        </div>
      ))}
    </div>
  );
}
