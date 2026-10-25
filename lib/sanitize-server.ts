import 'server-only';
import sanitizeHtml from 'sanitize-html';

/* Server-side twins of lib/overrides/sanitize.ts (same allowlists), for editor content
   rendered on the server: blog posts and calculator write-ups. */

const INLINE = ['b', 'i', 'em', 'strong', 'br', 'span', 'a', 'sup', 'sub', 'u'];
const IMG_DATA = /^data:image\/(png|jpe?g|webp|gif|avif);/i;

// http(s) links open in a new tab without leaking the opener or referrer
const hardenLink: sanitizeHtml.Transformer = (tagName, attribs) => {
  if (attribs.href && /^https?:/i.test(attribs.href.trim()))
    return { tagName, attribs: { ...attribs, rel: 'noopener noreferrer', target: '_blank' } };
  const rest = { ...attribs };
  delete rest.rel;
  delete rest.target;
  return { tagName, attribs: rest };
};

const base: sanitizeHtml.IOptions = {
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'iframe'],
  transformTags: { a: hardenLink },
};

/** Edited text: inline formatting and links; style limited to `color`. */
export const sanitizeInline = (html: unknown) =>
  sanitizeHtml(String(html ?? ''), {
    ...base,
    allowedTags: INLINE,
    allowedAttributes: { a: ['href', 'rel', 'target'], '*': ['style'] },
    allowedStyles: { '*': { color: [/^[#a-z0-9(),.%\s-]+$/i] } },
  });

/** Blog post body: also article blocks and images (http(s) or inline raster data). */
export const sanitizePostHtml = (html: unknown) =>
  sanitizeHtml(String(html ?? ''), {
    ...base,
    allowedTags: [...INLINE, 'p', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'img', 'div', 'figure', 'figcaption'],
    allowedAttributes: { a: ['href', 'rel', 'target'], img: ['src', 'alt', 'loading'] },
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    // drop images whose src was rejected, and data: URIs that aren't raster images
    exclusiveFilter: (frame) =>
      frame.tag === 'img' &&
      (!frame.attribs.src || (/^data:/i.test(frame.attribs.src) && !IMG_DATA.test(frame.attribs.src.replace(/\s/g, '')))),
  });
