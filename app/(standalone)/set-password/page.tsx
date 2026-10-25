import type { Metadata } from 'next';
import SetPassword from '@/components/auth/SetPassword';
import '@/styles/set-password.css';

export const metadata: Metadata = { title: 'Set your password — Rallys Equities' };

/** Where editor invite (and password-reset) emails land. */
export default function Page() {
  return (
    <div className="shell">
      <div className="card">
        <div className="rule" />
        <div className="rule thin" />
        <div className="cbody">
          <div className="brand">
            <span className="plate">
              <img src="/assets/img/logo.png" alt="Rallys Equities" />
            </span>
            <h1>Rallys Equities</h1>
            <div className="sub">Website Editor</div>
          </div>
          <SetPassword />
        </div>
      </div>
      <div className="foot">SECP-licensed brokerage · PSX TREC holder</div>
    </div>
  );
}
