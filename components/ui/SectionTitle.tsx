import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type Props = HTMLAttributes<HTMLHeadingElement> & {
  /** Small uppercase label above the heading. */
  tag: ReactNode;
  /** Extra attributes for the label (id, data-edit…). */
  tagProps?: HTMLAttributes<HTMLDivElement> & { [data: `data-${string}`]: string };
  as?: 'h2' | 'h3';
  /** Heading font size in px, for the smaller in-page headings (h3 at 28–34px). */
  size?: number;
  style?: CSSProperties;
  [data: `data-${string}`]: string | undefined;
};

/**
 * Section label + heading (`.stag` + `.sh`). Renders the two elements only: the wrapper
 * (centred, spaced, …) belongs to the section, so the markup stays exactly as designed.
 */
export default function SectionTitle({ tag, tagProps, as: H = 'h2', size, style, children, ...rest }: Props) {
  const s = size ? { fontSize: `${size}px`, ...style } : style;
  return (
    <>
      <div className="stag" {...tagProps}>
        {tag}
      </div>
      <H className="sh" style={s} {...rest}>
        {children}
      </H>
    </>
  );
}
