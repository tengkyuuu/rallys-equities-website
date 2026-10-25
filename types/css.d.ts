import 'react';

declare module 'react' {
  interface CSSProperties {
    /** CSS custom properties, e.g. style={{ '--rvd': '.08s' }} */
    [key: `--${string}`]: string | number | undefined;
  }
}
