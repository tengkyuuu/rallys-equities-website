import type { CSSProperties, ReactNode } from 'react';

export type Feature = {
  /** Icon (a 16px SVG) or a step number. */
  icon: ReactNode;
  title: ReactNode;
  text?: ReactNode;
};

type Props = {
  items: Feature[];
  style?: CSSProperties;
  /** Style for every icon box, e.g. the number styling on numbered steps. */
  iconStyle?: CSSProperties;
};

/** Vertical icon + title + text list (`.sfl`), used on Services, service pages and Education. */
export default function FeatureList({ items, style, iconStyle }: Props) {
  return (
    <div className="sfl" style={style}>
      {items.map((f, i) => (
        <div className="sf" key={i}>
          <div className="sfi" style={iconStyle}>
            {f.icon}
          </div>
          <div className="sft">
            <h4>{f.title}</h4>
            {f.text !== undefined && <p>{f.text}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
