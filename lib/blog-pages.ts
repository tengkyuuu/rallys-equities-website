/* Blog list pagination: page 1 shows the newest post featured plus the next PER_PAGE; later
   pages show PER_PAGE each. Pages are /blog, /blog?page=2, … (each its own canonical URL). */

export const PER_PAGE = 24;

export const pageCount = (total: number) => Math.max(1, Math.ceil(Math.max(0, total - 1) / PER_PAGE));

/** The posts on one page, or null when the page number is out of range. */
export function blogPage<T>(posts: T[], page: number) {
  if (!Number.isInteger(page) || page < 1 || page > pageCount(posts.length)) return null;
  const start = 1 + (page - 1) * PER_PAGE;
  return { featured: page === 1 ? posts[0] : undefined, list: posts.slice(start, start + PER_PAGE), pages: pageCount(posts.length) };
}

export const blogPageHref = (page: number) => (page <= 1 ? '/blog' : `/blog?page=${page}`);

/** Page numbers to show around the current one: 1 … 4 5 [6] 7 8 … 36 */
export function pageWindow(page: number, pages: number): (number | '…')[] {
  const nums = [...new Set([1, page - 2, page - 1, page, page + 1, page + 2, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  return nums.flatMap((n, i) => (i > 0 && n - nums[i - 1] > 1 ? ['…' as const, n] : [n]));
}
