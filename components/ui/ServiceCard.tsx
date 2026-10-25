import type { CSSProperties, ReactNode } from 'react';

type Props = {
  id?: string;
  style?: CSSProperties;
  /** A 26px SVG; omit for text-only cards. */
  icon?: ReactNode;
  iconStyle?: CSSProperties;
  title: ReactNode;
  titleStyle?: CSSProperties;
  /** The description. */
  children: ReactNode;
  descStyle?: CSSProperties;
  /** Whatever follows the description: usually the "Learn more →" link (GoTo, PageLink, OpenAccount or <a>). */
  footer?: ReactNode;
};

/** Card in a `.svc-grid`: optional icon, title, description, link. Used across the site. */
export default function ServiceCard({ id, style, icon, iconStyle, title, titleStyle, children, descStyle, footer }: Props) {
  return (
    <div className="svc-card" id={id} style={style}>
      {icon && (
        <div className="svc-icon" style={iconStyle}>
          {icon}
        </div>
      )}
      <div className="svc-title" style={titleStyle}>
        {title}
      </div>
      <div className="svc-desc" style={descStyle}>
        {children}
      </div>
      {footer}
    </div>
  );
}
