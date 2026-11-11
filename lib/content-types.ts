/* Shape of the visual editor's published record (Supabase `site_content`, scope
   'published'). The site's own markup is the default; these are only the changes. */

export type PlanOverride = Partial<{ name: string; price: string; period: string; features: string[]; btn: string; show: boolean }>;
export type FormOptionOverride = Partial<{ name: string; desc: string; price: string }>;

export type PricingOverride = Partial<{
  show: boolean;
  featured: string;
  badge: string;
  plans: Record<string, PlanOverride>;
  form: Record<string, FormOptionOverride>;
}>;

/** Calculator write-up block: a paragraph, heading, formula or bullet list. */
export type CalcBlock = string | { h: string } | { f: string } | { ul: string[] };

export type Post = {
  id: string;
  title?: string;
  slug?: string;
  date?: string;
  cover?: string;
  excerpt?: string;
  /** Not sent in post lists (only when one post is opened) — see `words`/`body_sig`. */
  body?: string;
  published?: boolean;
  /** blog_posts generated columns: tag-stripped word count of the body, and md5 of the body */
  words?: number;
  body_sig?: string;
};

export type SiteContent = Partial<{
  text: Record<string, string>;
  img: Record<string, string>;
  imgMeta: Record<string, { srcset?: string; alt?: string }>;
  theme: { dark?: Record<string, string>; light?: Record<string, string> };
  fonts: { display?: string; body?: string };
  /** key → label (or true). Keys: `sel:<css>`, `page:<id>`, or an element path key */
  hidden: Record<string, string | boolean>;
  /** parent key → child keys in display order */
  order: Record<string, string[]>;
  pricing: PricingOverride;
  calcInfo: Record<string, CalcBlock[]>;
  posts: Post[];
  version: number;
}>;
