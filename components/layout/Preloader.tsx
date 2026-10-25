/* Branded preloader. Server-rendered so it covers the page from the first paint;
   <ImmersiveEffects> lifts it once the page has loaded (on /admin the editor's boot
   narrator decides when — see window.RE_BOOT). */
export default function Preloader() {
  return (
    <div id="preloader" aria-hidden="true">
      <div className="pl-stage">
        <span className="pl-ring" />
        <span className="pl-ring pl-ring2" />
        <div className="pl-logo">
          <img src="/assets/img/logo.png" alt="" />
        </div>
      </div>
      <div className="pl-name">Rallys Equities</div>
      <div className="pl-sub">
        <i />
        <span id="plSub">Pakistan Stock Exchange</span>
        <i />
      </div>
      <div className="pl-bar" id="plBar">
        <i />
      </div>
      <div className="pl-status" id="plStatus" role="status" aria-live="polite" />
    </div>
  );
}
