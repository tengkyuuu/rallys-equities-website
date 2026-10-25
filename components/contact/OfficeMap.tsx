import { OFFICE_DIRECTIONS_URL, OFFICE_MAP_EMBED_URL } from '@/lib/company';

/** Embedded Google map of the head office with a directions pin card. */
export default function OfficeMap() {
  return (
    <div className="ct-map">
      <iframe
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Rallys Equities — Lahore Stock Exchange Building"
        src={OFFICE_MAP_EMBED_URL}
      />{' '}
      <div className="ct-mappin">
        <div className="ct-l" style={{ color: 'var(--au)' }}>
          Head Office
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--tx)', fontWeight: '600', marginTop: '3px' }}>Lahore Stock Exchange Building</div>
        <a href={OFFICE_DIRECTIONS_URL} target="_blank" rel="noopener">
          Get directions ↗
        </a>
      </div>
    </div>
  );
}
