/** Logo mark + wordmark, shared by the header and footer. */
export default function Logo() {
  return (
    <>
      <div className="lm-img">
        <img src="/assets/img/logo.png" alt="Rallys Equities logo" data-edit-img="brand.logo" />
      </div>
      <div>
        <span className="lt-main">Rallys Equities</span>
        <span className="lt-sub">Pakistan Stock Exchange</span>
      </div>
    </>
  );
}
