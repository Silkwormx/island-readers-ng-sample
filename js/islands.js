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
  /* ONE treasure-chest design for all four chests: a wooden box with a curved lid, iron bands, studs, a glowing keyhole and small sparkles.
     Only the big number badge (1-4) tells them apart. */
  function chestSVG(n) {
    n = [1, 2, 3, 4].includes(+n) ? +n : 1; const k = 'ch_' + n;
    const body = '#8A5430', lid = '#B8773F', hi = '#D9A06A', iron = '#5F6572', ironHi = '#9AA1AE', line = '#3F2412';
    const stud = (x, y) => `<circle cx="${x}" cy="${y}" r="1.9" fill="${ironHi}" stroke="${line}" stroke-width=".8"/>`;
    return `<svg viewBox="0 0 100 84" class="chestsvg chest-n${n}" data-chest="${n}" aria-hidden="true"><defs>
      <radialGradient id="${k}_g"><stop offset="0" stop-color="#FFF6B8"/><stop offset=".55" stop-color="#FFD84A" stop-opacity=".85"/><stop offset="1" stop-color="#FFD84A" stop-opacity="0"/></radialGradient>
      <clipPath id="${k}_c"><path d="M12 42 Q12 8 50 8 Q88 8 88 42Z"/></clipPath></defs>
      <ellipse cx="50" cy="77" rx="42" ry="4.5" fill="#2b254022"/>
      <path d="M14 42 H86 V70 Q86 75 81 75 H19 Q14 75 14 70Z" fill="${body}" stroke="${line}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M16 54 H84 M16 64 H84 M40 44 V74 M60 44 V74" stroke="${line}" stroke-opacity=".25" stroke-width="1.4"/>
      <rect x="22" y="43" width="9" height="31" fill="${iron}" stroke="${line}" stroke-width="1.6"/><rect x="69" y="43" width="9" height="31" fill="${iron}" stroke="${line}" stroke-width="1.6"/>
      ${stud(26.5, 50)}${stud(26.5, 58)}${stud(26.5, 66)}${stud(73.5, 50)}${stud(73.5, 58)}${stud(73.5, 66)}
      <path d="M14 70 v-6 h6 M86 70 v-6 h-6" fill="none" stroke="${iron}" stroke-width="3"/>
      <path d="M12 42 Q12 8 50 8 Q88 8 88 42Z" fill="${lid}" stroke="${line}" stroke-width="2.6" stroke-linejoin="round"/>
      <g clip-path="url(#${k}_c)"><path d="M32 8 Q30 26 32 44 M50 6 V44 M68 8 Q70 26 68 44" stroke="${line}" stroke-opacity=".22" stroke-width="1.4" fill="none"/>
      <rect x="21" y="4" width="10" height="40" fill="${iron}" stroke="${line}" stroke-width="1.6"/><rect x="69" y="4" width="10" height="40" fill="${iron}" stroke="${line}" stroke-width="1.6"/>
      <path d="M16 36 Q17 17 43 12" stroke="${hi}" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".85"/></g>
      ${stud(26, 20)}${stud(26, 30)}${stud(74, 20)}${stud(74, 30)}
      <rect x="10" y="38" width="80" height="9" rx="3" fill="${iron}" stroke="${line}" stroke-width="2.2"/>
      <path d="M13 41.5 H87" stroke="${ironHi}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="50" cy="52" r="17" fill="url(#${k}_g)"/>
      <rect x="41.5" y="43" width="17" height="19" rx="4.5" fill="${ironHi}" stroke="${line}" stroke-width="2"/>
      <circle cx="50" cy="51" r="3.1" fill="#3a2410"/><path d="M48.6 52 L51.4 52 L52.4 58 L47.6 58Z" fill="#3a2410"/>
      <path class="sparkle" d="M86 4 L87.9 10.1 L94 12 L87.9 13.9 L86 20 L84.1 13.9 L78 12 L84.1 10.1Z" fill="#fff" stroke="#FFD84A" stroke-width="1.2" stroke-linejoin="round"/>
      <path class="sparkle s2" d="M92 56 L93.1 59.4 L96.5 60.5 L93.1 61.6 L92 65 L90.9 61.6 L87.5 60.5 L90.9 59.4Z" fill="#fff" stroke="#FFD84A" stroke-width="1" stroke-linejoin="round"/>
      <g class="numbadge"><circle cx="17" cy="17" r="14" fill="#E8553A" stroke="#fff" stroke-width="3"/><text x="17" y="24.5" text-anchor="middle" font-size="21" font-weight="800" fill="#fff" font-family="Andika, sans-serif">${n}</text></g>
    </svg>`;
  }
  IR.chestSVG = chestSVG;
  /* Little coral-reef island for the two Review Reefs: sandy top, teal water ring, branching corals, starfish and a shell. */
  const branch = (x, y, col, h) => `<path d="M${x} ${y} v-${h} M${x} ${y - h * .55} l-9 -9 M${x} ${y - h * .75} l9 -8 M${x - 9} ${y - h * .55 - 9} l-4 -6 M${x + 9} ${y - h * .75 - 8} l4 -6" stroke="${col}" stroke-width="5.2" stroke-linecap="round" fill="none"/>`;
  IR.reefSVG = () => `<svg viewBox="0 0 200 150" class="isvg reefsvg" aria-hidden="true">
      <path d="M12 66 Q22 100 64 120 Q86 142 100 144 Q114 142 136 120 Q178 100 188 66Z" fill="url(#rock)"/>
      <path d="M44 92 q8 12 20 20 M156 92 q-8 12 -20 20" stroke="#00000018" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="66" rx="88" ry="28" fill="#2FA3A8"/>
      <ellipse cx="100" cy="62" rx="88" ry="27" fill="#5FD0CC"/>
      <ellipse cx="100" cy="64" rx="64" ry="19" fill="#F1E1B2"/>
      <ellipse cx="82" cy="56" rx="36" ry="7" fill="#ffffff44"/>
      ${branch(62, 68, '#F58BA8', 30)}${branch(104, 72, '#E0457B', 40)}${branch(142, 66, '#FFA15A', 26)}
      <path d="M124 66 l3 -8 l3 8 l8 1 l-6 5 l2 8 l-7 -4 l-7 4 l2 -8 l-6 -5z" fill="#FF8A5C" transform="translate(-24 4) scale(.9)"/>
      <path d="M84 74 q8 -12 16 0z" fill="#FFF3E0" stroke="#d8c9a8" stroke-width="1.5" transform="translate(-14 -2)"/>
      <circle cx="40" cy="58" r="3.4" fill="#fff" opacity=".8"/><circle cx="160" cy="54" r="2.6" fill="#fff" opacity=".8"/>
    </svg>`;

})();
