/* Original SVG floating islands (Okinawa-inspired) for the sky map. */
(function () {
  'use strict';
  const IR = window.IR;
  const flower = (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#F0668C"/><circle cx="${x}" cy="${y}" r="1.6" fill="#FFD76A"/>`;
  const D = {
    palm: (x, y) => `<path d="M${x} ${y} q7 -20 -1 -38" stroke="#8B5A2B" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
      [-165, -125, -90, -55, -15].map((a) => `<ellipse cx="${x - 1}" cy="${y - 40}" rx="13" ry="3.8" fill="#2E9E5B" transform="rotate(${a} ${x - 1} ${y - 40}) translate(12 0)"/>`).join(''),
    hut: (x, y) => `<rect x="${x - 17}" y="${y - 18}" width="34" height="18" fill="#E2BE8B"/><rect x="${x - 4}" y="${y - 11}" width="8" height="11" fill="#7A4B2A"/><polygon points="${x - 25},${y - 17} ${x},${y - 38} ${x + 25},${y - 17}" fill="#D9502B"/><path d="M${x - 25} ${y - 17} L${x + 25} ${y - 17}" stroke="#A53A1C" stroke-width="3"/>`,
    shisa: (x, y) => `<rect x="${x - 11}" y="${y - 9}" width="22" height="9" rx="2" fill="#A9A59B"/><ellipse cx="${x}" cy="${y - 19}" rx="10" ry="11" fill="#C4C0B4"/><circle cx="${x - 4}" cy="${y - 22}" r="2" fill="#6b675e"/><circle cx="${x + 4}" cy="${y - 22}" r="2" fill="#6b675e"/><path d="M${x - 5} ${y - 14} q5 5 10 0" stroke="#6b675e" stroke-width="2" fill="none"/>`,
    gate: (x, y) => `<rect x="${x - 22}" y="${y - 30}" width="6" height="30" fill="#B8664A"/><rect x="${x + 16}" y="${y - 30}" width="6" height="30" fill="#B8664A"/><rect x="${x - 27}" y="${y - 36}" width="54" height="7" rx="2" fill="#D9502B"/>`,
    lantern: (x, y) => `<path d="M${x} ${y - 40} V${y - 26}" stroke="#6b4a2e" stroke-width="2"/><ellipse cx="${x}" cy="${y - 20}" rx="8" ry="10" fill="#F25C54"/><ellipse cx="${x}" cy="${y - 20}" rx="4" ry="6" fill="#FFD76A" opacity=".85"/>`,
    crab: (x, y) => `<ellipse cx="${x}" cy="${y - 5}" rx="11" ry="7" fill="#EE6A4F"/><circle cx="${x - 12}" cy="${y - 12}" r="4" fill="#EE6A4F"/><circle cx="${x + 12}" cy="${y - 12}" r="4" fill="#EE6A4F"/><circle cx="${x - 4}" cy="${y - 12}" r="2" fill="#2b2540"/><circle cx="${x + 4}" cy="${y - 12}" r="2" fill="#2b2540"/>`,
    coral: (x, y) => `<path d="M${x} ${y} v-18 M${x} ${y - 10} l-8 -8 M${x} ${y - 14} l8 -8" stroke="#F58BA8" stroke-width="5" stroke-linecap="round" fill="none"/>`,
    turtle: (x, y) => `<ellipse cx="${x}" cy="${y - 7}" rx="15" ry="9" fill="#4F9D63"/><ellipse cx="${x + 16}" cy="${y - 8}" rx="6" ry="4.5" fill="#79B87F"/><ellipse cx="${x}" cy="${y - 9}" rx="8" ry="4.5" fill="#6DBB7A"/>`,
    boat: (x, y) => `<path d="M${x - 22} ${y - 8} h44 q-6 12 -16 12 h-12 q-10 0 -16 -12z" fill="#B8664A"/><path d="M${x} ${y - 8} V${y - 40} L${x + 18} ${y - 12}Z" fill="#FFF3D6"/>`,
    drum: (x, y) => `<rect x="${x - 10}" y="${y - 16}" width="20" height="16" rx="3" fill="#D9502B"/><ellipse cx="${x}" cy="${y - 16}" rx="10" ry="4" fill="#F4D9A0"/>`,
    kite: (x, y) => `<path d="M${x} ${y} V${y - 12}" stroke="#6b4a2e" stroke-width="2"/><polygon points="${x},${y - 52} ${x + 11},${y - 36} ${x},${y - 20} ${x - 11},${y - 36}" fill="#F0668C"/><path d="M${x} ${y - 20} q-6 8 0 14" stroke="#F0668C" stroke-width="2" fill="none"/>`,
    cave: (x, y) => `<path d="M${x - 24} ${y} Q${x - 24} ${y - 34} ${x} ${y - 34} Q${x + 24} ${y - 34} ${x + 24} ${y}Z" fill="#6D6A78"/><path d="M${x - 13} ${y} Q${x - 13} ${y - 20} ${x} ${y - 20} Q${x + 13} ${y - 20} ${x + 13} ${y}Z" fill="#69E3E6"/>`,
    chest: (x, y) => `<rect x="${x - 15}" y="${y - 15}" width="30" height="15" rx="2" fill="#B8664A"/><path d="M${x - 15} ${y - 15} Q${x} ${y - 28} ${x + 15} ${y - 15}Z" fill="#D9502B"/><rect x="${x - 3}" y="${y - 12}" width="6" height="6" fill="#F4B63F"/>`,
    flag: (x, y) => `<path d="M${x} ${y} V${y - 40}" stroke="#6b4a2e" stroke-width="2.5"/><path d="M${x} ${y - 40} h16 l-5 6 5 6 h-16z" fill="#F4B63F"/>`,
    mangrove: (x, y) => `<path d="M${x - 14} ${y} q4 -16 14 -22 q10 6 14 22" stroke="#7A5B3A" stroke-width="3" fill="none"/><ellipse cx="${x}" cy="${y - 28}" rx="15" ry="11" fill="#3E9A52"/>`,
    pier: (x, y) => `<rect x="${x - 26}" y="${y - 5}" width="52" height="6" fill="#C79A66"/><path d="M${x - 20} ${y + 1} v10 M${x} ${y + 1} v10 M${x + 20} ${y + 1} v10" stroke="#8B6B43" stroke-width="3"/>`,
    flower
  };
  const THEMES = {
    0: [['pier', 70], ['palm', 130], ['flower', 105]],
    1: [['coral', 70], ['crab', 110], ['coral', 145]],
    2: [['turtle', 85], ['palm', 140], ['flower', 115]],
    4: [['lantern', 70], ['lantern', 110], ['palm', 148]],
    5: [['boat', 75], ['drum', 140], ['flower', 110]],
    6: [['mangrove', 75], ['mangrove', 130], ['flower', 102]],
    7: [['shisa', 70], ['gate', 112], ['shisa', 150]],
    8: [['kite', 80], ['kite', 128], ['flower', 105]],
    9: [['cave', 105], ['flower', 60], ['flower', 150]],
    10: [['chest', 80], ['flag', 125], ['flower', 150]]
  };
  function islandSVG(n) {
    const top = n === 4 ? '#7DBB6A' : '#6DBB5F';
    let decor = (THEMES[n] || []).map(([k, x]) => D[k](x, 56)).join('');
    return `<svg viewBox="0 0 200 150" class="isvg" aria-hidden="true">
      <path d="M8 62 Q18 100 62 122 Q84 146 100 148 Q116 146 138 122 Q182 100 192 62Z" fill="url(#rock)"/>
      <path d="M40 90 q8 14 20 22 M150 90 q-8 14 -20 22 M96 100 v30" stroke="#00000018" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="62" rx="93" ry="30" fill="#4C9C47"/>
      <ellipse cx="100" cy="58" rx="93" ry="29" fill="${top}"/>
      <ellipse cx="82" cy="50" rx="40" ry="9" fill="#ffffff22"/>
      ${decor}
    </svg>`;
  }
  const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B49A7E"/><stop offset="1" stop-color="#7C6A5A"/></linearGradient></defs></svg>`;
  document.body.insertAdjacentHTML('afterbegin', defs);
  IR.islandSVG = islandSVG;
})();
