'use client';

/* Editor previews inside /admin: the blog list / single post (from the draft posts) and
   the calculator write-ups. The public site renders the same markup on the server
   (components/blog, components/calculators/CalcInfo); these fill the empty containers
   React leaves for them in /admin, so React never owns these nodes. */

import { CALC_INFO, type CalculatorId } from '@/lib/calculators/data';
import type { CalcBlock, Post, SiteContent } from '@/lib/content-types';
import { sanitizeFragment, sanitizePost } from '@/lib/overrides/sanitize';
import { toast } from '@/lib/toast';
import { showAdminPage } from './pages';

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const fmtDate = (d?: string) => {
  const t = Date.parse(d || '');
  return t ? new Date(t).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : d || '';
};
const readTime = (body?: string) =>
  Math.max(
    1,
    Math.round(
      String(body || '')
        .replace(/<[^>]*>/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length / 200,
    ),
  ) + ' min read';
const ARROW =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>';
const meta = (p: Post) =>
  `<div class="blog-meta"><span>${esc(fmtDate(p.date))}</span><i></i><span class="rt">${esc(readTime(p.body))}</span></div>`;

export function slugify(s?: string) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
const postSlug = (p: Post, i: number) => p.slug || slugify(p.title) || 'post-' + i;

let POSTS: Post[] = [];

function card(className: string, html: string, open: () => void) {
  const el = document.createElement('article');
  el.className = className;
  el.setAttribute('role', 'link');
  el.tabIndex = 0;
  el.innerHTML = html;
  el.addEventListener('click', open);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
  return el;
}

const cover = (p: Post, cls: string) =>
  p.cover
    ? `<div class="${cls}"><img loading="lazy" src="${esc(p.cover)}" alt=""></div>`
    : `<div class="${cls === 'blog-feat-cov' ? 'blog-feat-cov ' : ''}blog-nocov"><span>Rallys</span></div>`;
const gridCard = (p: Post, i: number, excerpt: boolean) =>
  card(
    'blog-card',
    cover(p, 'blog-cover') +
      `<div class="blog-body">${meta(p)}<h3>${esc(p.title || 'Untitled')}</h3>${excerpt && p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}<span class="blog-more">Read more ${ARROW}</span></div>`,
    () => openPost(i),
  );

export function renderBlog(posts?: Post[]) {
  const list = document.getElementById('blogList');
  if (!list) return;
  POSTS = (posts || []).filter((p) => p && p.published !== false).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const feat = document.getElementById('blogFeat');
  if (feat) feat.innerHTML = '';
  list.innerHTML = '';
  const empty = document.getElementById('blogEmpty');
  if (empty) empty.style.display = POSTS.length ? 'none' : 'block';
  if (!POSTS.length) return;
  if (feat) {
    const p = POSTS[0];
    feat.appendChild(
      card(
        'blog-feat',
        cover(p, 'blog-feat-cov') +
          `<div class="blog-feat-body"><span class="blog-feat-tag">Latest blog</span>${meta(p)}<h3>${esc(p.title || 'Untitled')}</h3>${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}<span class="blog-more">Read the full note ${ARROW}</span></div>`,
        () => openPost(0),
      ),
    );
  }
  POSTS.slice(feat ? 1 : 0).forEach((p, n) => list.appendChild(gridCard(p, n + (feat ? 1 : 0), true)));
}

function openPost(i: number) {
  const p = POSTS[i],
    v = document.getElementById('postView');
  if (!p || !v) return;
  v.innerHTML =
    `<a class="blog-back" data-page="insights" href="/blog">← All blogs</a>` +
    `<div class="post-head">${meta(p)}<h1 class="blog-title">${esc(p.title || 'Untitled')}</h1>${p.excerpt ? `<p class="sub" style="max-width:62ch;margin:0">${esc(p.excerpt)}</p>` : ''}<div class="post-rule"></div></div>` +
    (p.cover ? `<img class="blog-hero" src="${esc(p.cover)}" alt="">` : '') +
    `<div class="blog-post">${sanitizePost(p.body || '')}</div>` +
    `<div class="post-share"><span class="post-share-l">Share</span><button class="post-sh" type="button" data-share="copy">Copy link</button><button class="post-sh" type="button" data-share="wa">WhatsApp</button><button class="post-sh" type="button" data-share="li">LinkedIn</button></div>`;
  v.querySelector('.blog-back')!.addEventListener('click', (e) => {
    e.preventDefault();
    showAdminPage('insights');
  });
  const url = location.origin + '/blog/' + postSlug(p, i);
  v.querySelectorAll<HTMLButtonElement>('[data-share]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.share === 'copy')
        navigator.clipboard?.writeText(url).then(
          () => toast('Link copied to your clipboard.'),
          () => toast('Could not copy the link.', 'err'),
        );
      else
        window.open(
          b.dataset.share === 'wa'
            ? 'https://wa.me/?text=' + encodeURIComponent((p.title || 'Rallys Equities blog') + ' — Rallys Equities ' + url)
            : 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url),
          '_blank',
          'noopener',
        );
    }),
  );
  const more = POSTS.filter((_, n) => n !== i).slice(0, 3);
  if (more.length) {
    const wrap = document.createElement('div');
    wrap.className = 'post-more';
    wrap.innerHTML = '<div class="post-more-h">More blogs</div><div class="blog-grid"></div>';
    more.forEach((m) => wrap.lastElementChild!.appendChild(gridCard(m, POSTS.indexOf(m), false)));
    v.appendChild(wrap);
  }
  showAdminPage('post');
}

/** Calculator write-ups, from the editor's working copy (or the defaults). */
export function renderCalcInfo(content: SiteContent) {
  document.querySelectorAll('.calc-info').forEach((n) => n.remove());
  for (const id of Object.keys(CALC_INFO) as CalculatorId[]) {
    const page = document.getElementById('page-' + id);
    if (!page) continue;
    const blocks: CalcBlock[] = content.calcInfo?.[id] || CALC_INFO[id] || [];
    const html = blocks
      .map((b) =>
        typeof b === 'string'
          ? `<p>${sanitizeFragment(b)}</p>`
          : 'h' in b
            ? `<h3>${sanitizeFragment(b.h)}</h3>`
            : 'f' in b
              ? `<div class="ci-formula">${sanitizeFragment(b.f)}</div>`
              : `<ul>${b.ul.map((li) => `<li>${sanitizeFragment(li)}</li>`).join('')}</ul>`,
      )
      .join('');
    page.insertAdjacentHTML('beforeend', `<section class="sec calc-info"><div class="ci-wrap">${html}</div></section>`);
  }
}
