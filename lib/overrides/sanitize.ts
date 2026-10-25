/* Allowlist sanitizers for editor content (browser side). The server renders blog posts
   with the equivalent sanitize-html policy in lib/sanitize-server.ts. */

/* URL guards: normalise the way browsers do (strip control chars + whitespace that could
   smuggle a scheme, e.g. "java\nscript:"), then allowlist protocols. */
export function urlScheme(v: unknown) {
  const norm = String(v ?? '')
    .replace(/[\u0000- \u007f-\u009f]/g, '')
    .toLowerCase();
  return /^([a-z][a-z0-9+.\-]*):/.exec(norm)?.[1] ?? '';
}

export function safeHref(v: unknown): string | null {
  const raw = String(v ?? '').trim();
  if (!raw) return null;
  const s = urlScheme(raw);
  if (!s) return raw; // relative / #anchor / ?query
  return /^(https?|mailto|tel)$/.test(s) ? raw : null;
}

export function safeImgSrc(v: unknown): string | null {
  const raw = String(v ?? '').trim();
  if (!raw) return null;
  const s = urlScheme(raw);
  if (!s || /^https?$/.test(s)) return raw;
  if (s === 'data' && /^data:image\/(png|jpe?g|webp|gif|avif);/i.test(raw.replace(/\s/g, ''))) return raw;
  return null;
}

function hardenLink(n: Element) {
  const href = n.getAttribute('href');
  if (href && /^https?:/i.test(href.trim())) {
    n.setAttribute('rel', 'noopener noreferrer');
    n.setAttribute('target', '_blank');
  }
}

const INLINE_TAGS = new Set(['B', 'I', 'EM', 'STRONG', 'BR', 'SPAN', 'A', 'SUP', 'SUB', 'U']);
const POST_TAGS = new Set([...INLINE_TAGS, 'P', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'IMG', 'DIV', 'FIGURE', 'FIGCAPTION']);

function clean(html: unknown, allow: Set<string>, post: boolean) {
  const tmp = document.createElement('div');
  tmp.innerHTML = String(html ?? '');
  const onlyColor = (v: string | null) => {
    const m = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(v || '');
    return m ? 'color:' + m[1].trim() : '';
  };
  (function walk(node: Node) {
    for (const n of [...node.childNodes]) {
      if (n.nodeType === Node.COMMENT_NODE) {
        n.parentNode?.removeChild(n);
        continue;
      }
      if (!(n instanceof Element)) continue;
      const tag = n.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || (post && tag === 'IFRAME')) {
        n.remove();
        continue;
      }
      if (!allow.has(tag)) {
        const p = n.parentNode!;
        while (n.firstChild) p.insertBefore(n.firstChild, n);
        p.removeChild(n);
        continue;
      }
      for (const a of [...n.attributes]) {
        const an = a.name.toLowerCase();
        if (an === 'href' && tag === 'A') {
          const s = safeHref(a.value);
          if (s === null) n.removeAttribute(a.name);
          else n.setAttribute('href', s);
        } else if (post && an === 'src' && tag === 'IMG') {
          const s = safeImgSrc(a.value);
          if (s === null) n.removeAttribute(a.name);
          else n.setAttribute('src', s);
        } else if (post && (an === 'alt' || an === 'loading')) {
          /* keep */
        } else if (!post && an === 'style') {
          const s = onlyColor(a.value);
          if (s) n.setAttribute('style', s);
          else n.removeAttribute('style');
        } else n.removeAttribute(a.name);
      }
      if (tag === 'A') hardenLink(n);
      if (post && tag === 'IMG' && !n.getAttribute('src')) {
        n.remove();
        continue;
      } // its src was rejected
      walk(n);
    }
  })(tmp);
  return tmp.innerHTML;
}

/** Edited text: inline formatting and links only; style is reduced to `color`. */
export const sanitizeFragment = (html: unknown) => clean(html, INLINE_TAGS, false);

/** Blog post body: also article block tags and images. */
export const sanitizePost = (html: unknown) => clean(html, POST_TAGS, true);
