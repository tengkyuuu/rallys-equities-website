/** WhatsApp chat bubble + back-to-top button (shown by <ImmersiveEffects> once scrolled). */
export function WhatsAppBubble() {
  return (
    <a className="wa-fab" href="https://wa.me/923169991907" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
      <span className="wa-label">
        Need Help? <b>Chat with us</b>
      </span>{' '}
      <span className="wa-btn">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 4C9.4 4 4 9.3 4 15.9c0 2.1.6 4.1 1.6 5.9L4 28l6.4-1.6c1.7.9 3.6 1.4 5.6 1.4 6.6 0 12-5.3 12-11.9S22.6 4 16 4z"
            fill="#fff"
          />
          <path
            d="M12.7 10.6c-.3-.6-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.8 5.9 5.2 2.9 1.1 3.5.9 4.1.9.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.6-.4l-2.3-1.1c-.3-.1-.5-.2-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.6.1-.2.1-.4 0-.6l-1-2.3z"
            fill="#1FAF59"
          />
        </svg>
      </span>
    </a>
  );
}

export function BackToTop() {
  return (
    <button id="toTop" aria-label="Back to top" data-action="to-top">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 14V4M4 9l5-5 5 5" stroke="var(--au)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
