/* Island Readers sample service worker: precache everything, serve offline, support media range requests. */
const CACHE = 'ir-ng-sample-fac42aebaf';
const ASSETS = [
 "./",
 "./index.html",
 "./audio/ang.mp3",
 "./audio/b_1.mp3",
 "./audio/b_2.mp3",
 "./audio/b_3.mp3",
 "./audio/hx_I.mp3",
 "./audio/hx_a.mp3",
 "./audio/hx_is.mp3",
 "./audio/hx_the.mp3",
 "./audio/hx_to.mp3",
 "./audio/hx_what.mp3",
 "./audio/ing.mp3",
 "./audio/ng.mp3",
 "./audio/ong.mp3",
 "./audio/p_humprompt.mp3",
 "./audio/p_i1.mp3",
 "./audio/p_i2.mp3",
 "./audio/p_i3.mp3",
 "./audio/p_i4.mp3",
 "./audio/p_i5.mp3",
 "./audio/p_i5b.mp3",
 "./audio/p_i6.mp3",
 "./audio/p_i7.mp3",
 "./audio/p_p_build.mp3",
 "./audio/p_p_check.mp3",
 "./audio/p_p_chunk.mp3",
 "./audio/p_p_fish.mp3",
 "./audio/p_p_hear.mp3",
 "./audio/p_p_listen1.mp3",
 "./audio/p_p_listen2.mp3",
 "./audio/p_p_sent.mp3",
 "./audio/p_p_silly.mp3",
 "./audio/p_p_story.mp3",
 "./audio/p_p_trace.mp3",
 "./audio/p_p_watch.mp3",
 "./audio/p_p_which.mp3",
 "./audio/p_s1.mp3",
 "./audio/p_v1.mp3",
 "./audio/s_1.mp3",
 "./audio/s_2.mp3",
 "./audio/s_3.mp3",
 "./audio/s_4.mp3",
 "./audio/s_5.mp3",
 "./audio/s_6.mp3",
 "./audio/s_7.mp3",
 "./audio/s_8.mp3",
 "./audio/s_9.mp3",
 "./audio/sfx_ding.mp3",
 "./audio/sfx_done.mp3",
 "./audio/sfx_gong.mp3",
 "./audio/sfx_tap.mp3",
 "./audio/sfx_try.mp3",
 "./audio/ung.mp3",
 "./audio/w_I.mp3",
 "./audio/w_a.mp3",
 "./audio/w_bag.mp3",
 "./audio/w_ban.mp3",
 "./audio/w_bang.mp3",
 "./audio/w_bug.mp3",
 "./audio/w_fig.mp3",
 "./audio/w_fin.mp3",
 "./audio/w_fing.mp3",
 "./audio/w_fong.mp3",
 "./audio/w_ham.mp3",
 "./audio/w_hang.mp3",
 "./audio/w_hug.mp3",
 "./audio/w_hung.mp3",
 "./audio/w_is.mp3",
 "./audio/w_kick.mp3",
 "./audio/w_kid.mp3",
 "./audio/w_king.mp3",
 "./audio/w_kit.mp3",
 "./audio/w_lock.mp3",
 "./audio/w_log.mp3",
 "./audio/w_long.mp3",
 "./audio/w_lung.mp3",
 "./audio/w_map.mp3",
 "./audio/w_mat.mp3",
 "./audio/w_mug.mp3",
 "./audio/w_pig.mp3",
 "./audio/w_rang.mp3",
 "./audio/w_rim.mp3",
 "./audio/w_ring.mp3",
 "./audio/w_rip.mp3",
 "./audio/w_rug.mp3",
 "./audio/w_sand.mp3",
 "./audio/w_sang.mp3",
 "./audio/w_ship.mp3",
 "./audio/w_shop.mp3",
 "./audio/w_sing.mp3",
 "./audio/w_sob.mp3",
 "./audio/w_sock.mp3",
 "./audio/w_song.mp3",
 "./audio/w_sun.mp3",
 "./audio/w_sung.mp3",
 "./audio/w_the.mp3",
 "./audio/w_thing.mp3",
 "./audio/w_to.mp3",
 "./audio/w_wag.mp3",
 "./audio/w_what.mp3",
 "./audio/w_wig.mp3",
 "./audio/w_win.mp3",
 "./audio/w_wing.mp3",
 "./audio/w_zag.mp3",
 "./audio/w_zam.mp3",
 "./audio/w_zang.mp3",
 "./audio/w_zing.mp3",
 "./data.js",
 "./fonts/Andika-Bold.woff2",
 "./fonts/Andika-OFL-NOTE.txt",
 "./fonts/Andika-Regular.woff2",
 "./img/apple-touch-icon.png",
 "./img/frill.webp",
 "./img/icon-192.png",
 "./img/icon-512.png",
 "./img/icon-maskable-512.png",
 "./img/island3.webp",
 "./img/island3_banner.jpg",
 "./img/panel1.jpg",
 "./img/panel2.jpg",
 "./img/panel3.jpg",
 "./img/panel4.jpg",
 "./img/panel5.jpg",
 "./img/panel6.jpg",
 "./img/panel7.jpg",
 "./img/panel8.jpg",
 "./img/panel9.jpg",
 "./img/sky_bg.jpg",
 "./img/zip.webp",
 "./js/board.js",
 "./js/check.js",
 "./js/core.js",
 "./js/islands.js",
 "./js/lessons.js",
 "./js/lessons2.js",
 "./js/screens.js",
 "./manifest.webmanifest",
 "./styles.css",
 "./video/ng_cartoon_captions.json",
 "./video/ng_cartoon_small.mp4"
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('ir-ng-sample-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* GitHub Pages serves .mp3 as "audio/mp3", which Safari does not accept for media: always answer with audio/mpeg */
function fixMime(res, url) {
  if (!/\.mp3$/.test(url.pathname)) return res;
  const hd = new Headers(res.headers); hd.set('Content-Type', 'audio/mpeg');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: hd });
}
async function ranged(req, res) {
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  const buf = await res.arrayBuffer(); const size = buf.byteLength;
  let s = m && m[1] ? parseInt(m[1], 10) : 0; let e2 = m && m[2] ? parseInt(m[2], 10) : size - 1;
  if (e2 >= size) e2 = size - 1;
  return new Response(buf.slice(s, e2 + 1), { status: 206, headers: {
    'Content-Type': /\.mp3$/.test(new URL(req.url).pathname) ? 'audio/mpeg' : (res.headers.get('Content-Type') || 'application/octet-stream'),
    'Content-Range': 'bytes ' + s + '-' + e2 + '/' + size, 'Content-Length': String(e2 - s + 1), 'Accept-Ranges': 'bytes' } });
}
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return req.headers.has('range') ? ranged(req, hit) : fixMime(hit, url);
    try {
      const net = await fetch(req);
      if (net && net.ok && !req.headers.has('range')) { const c = await caches.open(CACHE); c.put(req, net.clone()); }
      return fixMime(net, url);
    } catch (err) {
      if (req.mode === 'navigate') { const idx = await caches.match('./index.html'); if (idx) return idx; }
      throw err;
    }
  })());
});
