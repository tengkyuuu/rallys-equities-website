import OpenAccount from '@/components/actions/OpenAccount';
import MarketsBoard from '@/components/market/MarketsBoard';
import PageHero from '@/components/ui/PageHero';

export default function MarketsPage() {
  return (
    <>
      <PageHero
        variant="bull"
        tag="Live Market Data"
        title={
          <>
            PSX <em>Live</em> <span>Markets</span>
          </>
        }
        lede="Index values and stock prices from the Pakistan Stock Exchange, delayed about 15 minutes."
      />
      <section className="sec" style={{ paddingTop: '52px' }}>
        <span className="urdu">پاکستان اسٹاک ایکسچینج — لائیو ریٹس</span> <MarketsBoard />
        <p style={{ fontSize: '11px', color: 'var(--mt2)', marginTop: '12px', lineHeight: '1.6' }}>
          Live prices for every PSX-listed company, sourced from the Pakistan Stock Exchange (delayed ~15 min) and sorted by most active.
          Use the search above to find any stock. For live, tradable quotes and execution,{' '}
          <OpenAccount as="a" style={{ color: 'var(--g3)', cursor: 'pointer' }}>
            open an account
          </OpenAccount>
          .
        </p>
      </section>
    </>
  );
}
