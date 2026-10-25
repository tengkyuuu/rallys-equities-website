'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { dayLabel, tradeDates } from '@/lib/psx-calendar';
import { formatMoney, parseMoney, pkr } from '@/lib/money';
import Segmented from './Segmented';

type Side = 'buy' | 'sell';
type Kind = 'market' | 'limit' | 'stop';

const KINDS: Record<Kind, { price: string; explain: (side: Side) => string }> = {
  market: {
    price: 'Price per share (estimate)',
    explain: (side) => `Fills straight away at the best price available on PSX when you ${side}.`,
  },
  limit: {
    price: 'Your limit price',
    explain: (side) =>
      side === 'buy'
        ? 'Fills only at your price or lower. If the market never gets there, nothing is bought.'
        : 'Fills only at your price or higher. If the market never gets there, nothing is sold.',
  },
  stop: {
    price: 'Your stop price',
    explain: (side) =>
      side === 'buy'
        ? 'Waits until the price rises to your stop, then buys at the market price.'
        : 'Waits until the price falls to your stop, then sells at the market price. Often used to limit a loss.',
  },
};

// The clock is read on the client only (the server cannot know the visitor's "now").
const noSubscribe = () => () => {};
const minuteKey = () => new Date().toISOString().slice(0, 16);

/** Investment & Trading: an order ticket the visitor fills in, with the real T+1 dates. */
export default function OrderTicket() {
  const id = useId();
  const [side, setSide] = useState<Side>('buy');
  const [kind, setKind] = useState<Kind>('market');
  const [shares, setShares] = useState(NaN);
  const [price, setPrice] = useState(NaN);
  const clock = useSyncExternalStore(noSubscribe, minuteKey, () => '');
  const dates = clock ? tradeDates(new Date(clock + ':00Z')) : null;
  const value = shares > 0 && price > 0 ? shares * price : NaN;

  return (
    <div className="tool">
      <div className="tool-top">
        <h4 className="tool-title">Try an order ticket</h4>
        {dates && (
          <span className={dates.open ? 'tool-status is-open' : 'tool-status'}>{dates.open ? 'PSX open now' : 'PSX closed now'}</span>
        )}
      </div>
      <div className="tool-row">
        <Segmented
          label="Buy or sell"
          value={side}
          onChange={setSide}
          options={[
            { value: 'buy', label: 'Buy' },
            { value: 'sell', label: 'Sell' },
          ]}
        />
        <Segmented
          label="Order type"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'market', label: 'Market' },
            { value: 'limit', label: 'Limit' },
            { value: 'stop', label: 'Stop' },
          ]}
        />
      </div>
      <div className="tool-fields">
        <label htmlFor={`${id}-q`}>
          Shares
          <input
            id={`${id}-q`}
            className="finput"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 100"
            onInput={(e) => {
              formatMoney(e);
              setShares(Math.floor(parseMoney(e.currentTarget.value)));
            }}
          />
        </label>
        <label htmlFor={`${id}-p`}>
          {KINDS[kind].price}
          <input
            id={`${id}-p`}
            className="finput"
            type="text"
            inputMode="decimal"
            placeholder="PKR"
            onInput={(e) => {
              formatMoney(e);
              setPrice(parseMoney(e.currentTarget.value));
            }}
          />
        </label>
      </div>
      <p className="tool-explain" aria-live="polite">
        {KINDS[kind].explain(side)}
      </p>
      <div className="tool-result" aria-live="polite">
        <span className="tool-k">{side === 'buy' ? 'Order value' : 'Sale value'}</span>
        <strong className="tool-big">{Number.isNaN(value) ? '—' : pkr(value)}</strong>
        <span className="tool-note">
          {Number.isNaN(value) ? 'Enter shares and a price to see it.' : 'Before brokerage and government levies. '}
          {!Number.isNaN(value) && <a href="#pricing-sec">See our plans</a>}
        </span>
      </div>
      <ol className="tool-timeline">
        <li>
          <span className="tool-k">Placed</span>
          <strong>{dates ? dayLabel(dates.trade) : '—'}</strong>
          <span className="tool-note">On web, mobile or by phone</span>
        </li>
        <li>
          <span className="tool-k">Matched on PSX</span>
          <strong>{dates ? dayLabel(dates.trade) : '—'}</strong>
          <span className="tool-note">09:30–15:30 PKT</span>
        </li>
        <li className="is-end">
          <span className="tool-k">Settled · T+1</span>
          <strong>{dates ? dayLabel(dates.settle) : '—'}</strong>
          <span className="tool-note">In your CDC account</span>
        </li>
      </ol>
      <p className="tool-foot">Dates skip weekends; public holidays move them a day.</p>
    </div>
  );
}
