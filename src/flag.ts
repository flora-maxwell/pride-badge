/**
 * The intersex-inclusive Progress Pride flag (design Valentino Vecchietti, graphic by Nikki on
 * Wikimedia Commons, CC0 1.0), built node by node instead of from an HTML string so pages that
 * require Trusted Types still get it. Sliced to fill its box like `object-fit: cover`.
 */
const SVG = 'http://www.w3.org/2000/svg';
const PATHS: [fill: string, d: string][] = [
  ['#6d2380', 'M0 0h1200v762H0V0Z'],
  ['#2c58a4', 'M0 0h1200v635H0V0Z'],
  ['#78b82a', 'M0 0h1200v508H0V0Z'],
  ['#efe524', 'M0 0h1200v381H0V0Z'],
  ['#f28917', 'M0 0h1200v254H0V0Z'],
  ['#e22016', 'M0 0h1200v127H0V0Z'],
  ['#000', 'M315 0H0v762h315l353-381L315 0z'],
  ['#945516', 'M241 0H0v762h241l353-381L241 0z'],
  ['#7bcce5', 'M168 0H0v762h168l353-381L168 0z'],
  ['#f4aec8', 'M95 0H0v762h95l353-381L95 0z'],
  ['#fff', 'M0 0v762h22l352-381L22 0H0z'],
  ['#fdd817', 'm0 706 301-325L0 55v651z'],
];

const node = (tag: string, attrs: Record<string, string>): SVGElement => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};

export function flag(): SVGElement {
  const svg = node('svg', { viewBox: '0 0 1200 762', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true', focusable: 'false' });
  for (const [fill, d] of PATHS) svg.append(node('path', { fill, d }));
  svg.append(node('circle', { cx: '111', cy: '381', r: '80', fill: 'none', stroke: '#66338b', 'stroke-width': '19' }));
  return svg;
}
