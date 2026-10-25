import { cssRGB, cssVar } from '@/lib/overrides/engine';

/** KSE-100 sparkline: area gradient + line + end dot, coloured by direction. */
export function drawSparkline(canvas: HTMLCanvasElement, series: number[]) {
  if (canvas.offsetWidth && canvas.width !== canvas.offsetWidth) {
    canvas.width = canvas.offsetWidth;
    canvas.height = 90;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width,
    h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (series.length < 2) return; // no real series → no line
  const data = series.slice(-120),
    mn = Math.min(...data),
    mx = Math.max(...data),
    range = mx - mn || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - mn) / range) * (h - 6) - 3] as const);
  const up = data[data.length - 1] >= data[0],
    col = cssVar(up ? '--up' : '--dn', canvas);
  const path = () => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  };
  path();
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgba(${cssRGB(up ? '--up' : '--dn', canvas)},.3)`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  path();
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.8;
  ctx.lineJoin = 'round';
  ctx.stroke();
  const [lx, ly] = pts[pts.length - 1];
  ctx.beginPath();
  ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = col;
  ctx.fill();
}
