export function lightenHex(hex, ratio) {
  const h = (hex || '#2F7DFF').replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const mix = v => Math.round(v + (255 - v) * ratio);
  return '#' + [mix(r), mix(g), mix(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
