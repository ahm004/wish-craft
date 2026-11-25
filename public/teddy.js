/* WishCraft teddy: an original, interactive SVG bear (no images, no GIFs).
 *
 *   const t = Teddy.make({ gender: 'm', mood: 'happy', prop: 'rose' });
 *   parent.appendChild(t.el);            // t.el is a <div class="mascot">
 *   t.set({ mood: 'cry', pose: 'sit', broken: true });
 *   t.say('Please?', 2500);              // speech bubble
 *   await t.slide(120, 1800);            // runs 120px to the right
 *
 * gender: m (bow tie) | f (ear bow, lashes)
 * moods : happy shy wow sad cry love joy party wink
 * props : none heart gift ring flower balloon trophy sign cake envelope frame rose rosehold
 * acts  : idle wave jump dance cheer run walk bow
 * pose  : stand | sit
 */
(() => {
  'use strict';

  const COLORS = {
    brown: { fur: '#c98a54', dk: '#a86a3a', mz: '#f3d4a8', inr: '#e9a98b' },
    pink: { fur: '#f6b0c6', dk: '#e083a3', mz: '#ffe6ee', inr: '#ff8fb0' },
    cream: { fur: '#efd5ae', dk: '#d3b17f', mz: '#fff4de', inr: '#f2b9a5' },
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const BLOOM = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="14" fill="#e0245e"/><path d="M${cx - 10} ${cy} C${cx - 10} ${cy - 8} ${cx} ${cy - 10} ${cx + 2} ${cy - 4} C${cx + 4} ${cy - 10} ${cx + 11} ${cy - 6} ${cx + 10} ${cy + 2} C${cx + 8} ${cy + 10} ${cx - 6} ${cy + 10} ${cx - 10} ${cy}Z" fill="#ff5c86" stroke="#9b0f3c" stroke-width="1.2"/><path d="M${cx - 6} ${cy - 1} c3 -4 8 -3 9 1" stroke="#9b0f3c" stroke-width="1.2" fill="none"/>`;

  /* ---- things the bear can hold (drawn around x=100, y=172) ---- */
  const PROPS = {
    none: () => '',
    heart: () => `<g class="p-pulse"><path d="M100 198 C66 174 68 144 88 144 C96 144 100 150 100 155 C100 150 104 144 112 144 C132 144 134 174 100 198Z" fill="#ff3d6e"/><path d="M82 154 Q86 149 92 151" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" fill="none"/></g>`,
    gift: () => `<g><rect x="76" y="162" width="48" height="36" rx="5" class="pa"/><rect x="95" y="162" width="10" height="36" class="pb"/><rect x="74" y="156" width="52" height="12" rx="4" class="pa"/><rect x="95" y="156" width="10" height="12" class="pb"/><path d="M100 156 C86 138 76 150 92 156Z M100 156 C114 138 124 150 108 156Z" class="pb"/></g>`,
    ring: () => `<g><rect x="76" y="176" width="48" height="24" rx="6" fill="#c0164a"/><rect x="76" y="176" width="48" height="6" rx="3" fill="#e0245e"/><g class="p-glow"><circle cx="100" cy="166" r="11" fill="none" stroke="#f7d08a" stroke-width="5"/><path d="M93 154 L100 144 L107 154 L100 161Z" fill="#8fe0ff"/><path d="M100 144 L100 161 M93 154 L107 154" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/></g><path class="p-tw" d="M124 146 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2Z" fill="#fff"/><path class="p-tw d2" d="M74 158 l1.6 4.4 l4.4 1.6 l-4.4 1.6 l-1.6 4.4 l-1.6 -4.4 l-4.4 -1.6 l4.4 -1.6Z" fill="#fff"/></g>`,
    flower: () => `<g><path d="M100 200 L100 166 M100 200 L86 168 M100 200 L114 168" stroke="#4f9d63" stroke-width="4" stroke-linecap="round"/><path d="M96 186 C84 186 80 176 88 174 C92 178 96 180 96 186Z M104 190 C116 190 120 180 112 178 C108 182 104 184 104 190Z" fill="#6cbf7f"/>${[[86, 164, '#ff8fb0'], [100, 156, '#ffd45e'], [114, 164, '#ff8fb0']].map(([x, y, c]) => `<g>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + 8 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(y + 8 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="6.5" fill="${c}"/>`).join('')}<circle cx="${x}" cy="${y}" r="5" fill="#fff3a8"/></g>`).join('')}</g>`,
    balloon: () => `<g class="p-float"><path d="M178 92 Q170 150 150 196" stroke="#fff" stroke-opacity=".8" stroke-width="2" fill="none"/><ellipse cx="178" cy="56" rx="24" ry="30" class="pa"/><ellipse cx="169" cy="44" rx="6" ry="9" fill="#fff" opacity=".4" transform="rotate(25 169 44)"/><path d="M173 85 L178 93 L183 85Z" class="pa"/></g>`,
    trophy: () => `<g><path d="M82 146 H118 V164 C118 178 109 184 100 184 C91 184 82 178 82 164Z" fill="#ffc83d"/><path d="M82 150 H72 C72 164 78 168 86 168 M118 150 H128 C128 164 122 168 114 168" stroke="#ffc83d" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="95" y="184" width="10" height="9" fill="#e0a21c"/><rect x="85" y="193" width="30" height="8" rx="3" fill="#e0a21c"/><path d="M90 152 V166" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/></g>`,
    sign: (o) => {
      const txt = esc(o.text || 'Hi!');
      const len = txt.length;
      const fs = len <= 6 ? 24 : len <= 10 ? 19 : 15;
      return `<g><rect x="40" y="136" width="120" height="58" rx="9" fill="#fffaf0" stroke="#e5cfa8" stroke-width="3"/><text x="100" y="${(165 + fs * 0.35).toFixed(1)}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="${fs}" fill="#3a2433"${len > 12 ? ' textLength="100" lengthAdjust="spacingAndGlyphs"' : ''}>${txt}</text></g>`;
    },
    cake: () => `<g><rect x="74" y="180" width="52" height="20" rx="4" fill="#f6dcb3"/><rect x="74" y="170" width="52" height="14" rx="5" class="pa"/><rect x="84" y="158" width="32" height="14" rx="4" fill="#f6dcb3"/><rect x="84" y="152" width="32" height="9" rx="4" class="pa"/><rect x="98" y="138" width="4" height="15" fill="#fff"/><path class="p-flame" d="M100 124 C95 131 96 136 100 137 C104 136 105 131 100 124Z" fill="#ffb347"/></g>`,
    envelope: () => `<g><rect x="72" y="156" width="56" height="40" rx="5" fill="#fffaf0" stroke="#e5cfa8" stroke-width="2"/><path d="M72 158 L100 180 L128 158" stroke="#e5cfa8" stroke-width="2" fill="none"/><path d="M100 188 C92 182 93 176 97 176 C99 176 100 178 100 179 C100 178 101 176 103 176 C107 176 108 182 100 188Z" fill="#ff3d6e"/></g>`,
    frame: () => `<g transform="rotate(-6 100 172)"><rect x="72" y="146" width="56" height="62" rx="3" fill="#fffdf8" stroke="#e5cfa8" stroke-width="2"/><rect x="78" y="152" width="44" height="40" rx="2" class="pa" opacity=".85"/><path d="M100 184 C90 176 91 168 96 168 C98 168 100 170 100 172 C100 170 102 168 104 168 C109 168 110 176 100 184Z" fill="#fff"/></g>`,
    // a long-stemmed rose held out in the raised right hand (the arm is posed by CSS)
    rose: () => `<g transform="translate(203 176) scale(1.4) translate(-203 -176)"><g class="p-rose"><path d="M203 176 L203 118" stroke="#3f9a55" stroke-width="4.5" stroke-linecap="round"/><path d="M203 150 C190 150 186 138 193 134 C197 140 203 142 203 150Z" fill="#58bd70"/><path d="M203 162 C215 162 219 152 212 148 C208 153 203 155 203 162Z" fill="#58bd70"/><g class="p-bloom">${BLOOM(203, 106)}</g></g></g>`,
    // a rose hugged to the chest with both arms
    rosehold: () => `<g class="p-rose2"><path d="M86 200 L112 152" stroke="#3f9a55" stroke-width="4.5" stroke-linecap="round"/><path d="M96 180 C84 180 82 168 88 166 C91 172 96 174 96 180Z" fill="#58bd70"/><g class="p-bloom2">${BLOOM(117, 141)}</g></g>`,
  };

  const MOUTH_FOR = { happy: 'smile', shy: 'smile', wink: 'smile', love: 'open', joy: 'open', party: 'open', sad: 'sad', cry: 'cry', wow: 'o' };

  function markup(c) {
    return `<svg class="ted" viewBox="0 -26 200 276" aria-hidden="true" focusable="false" style="--fur:${c.fur};--dk:${c.dk};--mz:${c.mz};--inr:${c.inr}">
<ellipse class="t-shadow" cx="100" cy="240" rx="58" ry="7"/>
<g class="t-body">
 <g class="t-feet">
  <g class="t-foot l"><ellipse cx="68" cy="228" rx="27" ry="15" class="fur"/><ellipse cx="68" cy="231" rx="13" ry="7" class="mz"/></g>
  <g class="t-foot r"><ellipse cx="132" cy="228" rx="27" ry="15" class="fur"/><ellipse cx="132" cy="231" rx="13" ry="7" class="mz"/></g>
 </g>
 <ellipse cx="100" cy="172" rx="54" ry="58" class="fur"/>
 <ellipse cx="100" cy="182" rx="33" ry="38" class="mz"/>
 <g class="t-bowtie"><path d="M100 163 L80 151 L80 175Z M100 163 L120 151 L120 175Z" fill="#3d7bd9"/><circle cx="100" cy="163" r="6.5" fill="#2a5fb0"/></g>
 <g class="t-prop"></g>
 <g class="t-head">
  <circle cx="52" cy="52" r="23" class="fur"/><circle cx="52" cy="54" r="12" class="inr"/>
  <circle cx="148" cy="52" r="23" class="fur"/><circle cx="148" cy="54" r="12" class="inr"/>
  <circle cx="100" cy="92" r="60" class="fur"/>
  <ellipse cx="100" cy="112" rx="28" ry="22" class="mz"/>
  <ellipse class="t-cheek" cx="64" cy="112" rx="11" ry="7"/><ellipse class="t-cheek" cx="136" cy="112" rx="11" ry="7"/>
  <path class="t-brow" d="M62 78 Q74 70 88 68 M138 78 Q126 70 112 68"/>
  <g class="t-eyes">
   <g class="t-eyeL"><g class="t-pup"><circle cx="76" cy="88" r="7.5" class="ink"/><circle cx="78.6" cy="85.4" r="2.6" fill="#fff"/></g></g>
   <g class="t-eyeR"><g class="t-pup"><circle cx="124" cy="88" r="7.5" class="ink"/><circle cx="126.6" cy="85.4" r="2.6" fill="#fff"/></g></g>
  </g>
  <path class="t-lashes" d="M68 83 L61 78 M67 89 L59 90 M132 83 L139 78 M133 89 L141 90"/>
  <path class="t-arc" d="M66 92 Q76 80 86 92 M114 92 Q124 80 134 92"/>
  <path class="t-wink" d="M114 90 Q124 82 134 90"/>
  <g class="t-hearteyes"><path d="M76 96 C66 89 67 80 72 80 C74 80 76 82 76 83 C76 82 78 80 80 80 C85 80 86 89 76 96Z"/><path d="M124 96 C114 89 115 80 120 80 C122 80 124 82 124 83 C124 82 126 80 128 80 C133 80 134 89 124 96Z"/></g>
  <path d="M90 99 Q100 94 110 99 Q107 109 100 109 Q93 109 90 99Z" class="ink"/><ellipse cx="97" cy="99" rx="3" ry="1.6" fill="#fff" opacity=".35"/>
  <path class="m m-smile" d="M100 109 V115 M100 115 Q94 124 85 117 M100 115 Q106 124 115 117"/>
  <g class="m m-open"><path d="M100 109 V114" class="ln"/><path d="M85 114 Q100 142 115 114 Q100 120 85 114Z" fill="#7a2230"/><ellipse cx="100" cy="128" rx="7" ry="4.5" fill="#ff8aa0"/></g>
  <path class="m m-sad" d="M100 109 V114 M100 114 Q94 107 85 117 M100 114 Q106 107 115 117"/>
  <g class="m m-cry"><path d="M100 109 V113" class="ln"/><path d="M87 124 Q100 106 113 124 Q100 119 87 124Z" fill="#7a2230"/></g>
  <ellipse class="m m-o" cx="100" cy="120" rx="5.5" ry="7" fill="#7a2230"/>
  <path class="t-tear a" d="M71 98 Q64 110 71 115 Q78 110 71 98Z"/><path class="t-tear b" d="M129 98 Q122 110 129 115 Q136 110 129 98Z"/>
  <g class="t-hat"><path d="M100 -22 L70 36 Q100 44 130 36Z" class="pa"/><path d="M82 14 L94 20 M96 -2 L112 6 M108 22 L121 28" stroke="#fff" stroke-opacity=".7" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="-22" r="8" class="pb"/></g>
  <g class="t-bow"><path d="M140 42 L116 28 L116 56Z M140 42 L164 28 L164 56Z" class="pa"/><circle cx="140" cy="42" r="8" class="pb"/></g>
 </g>
 <g class="t-arm l"><ellipse cx="46" cy="170" rx="15" ry="32" transform="rotate(18 46 170)" class="fur"/><g class="t-paw"><circle cx="38" cy="193" r="11" class="fur"/><ellipse cx="38" cy="196" rx="6" ry="4.8" class="inr"/><circle cx="32.5" cy="190.5" r="2.2" class="inr"/><circle cx="38" cy="188.5" r="2.2" class="inr"/><circle cx="43.5" cy="190.5" r="2.2" class="inr"/></g></g>
 <g class="t-arm r"><ellipse cx="154" cy="170" rx="15" ry="32" transform="rotate(-18 154 170)" class="fur"/><g class="t-paw"><circle cx="162" cy="193" r="11" class="fur"/><ellipse cx="162" cy="196" rx="6" ry="4.8" class="inr"/><circle cx="156.5" cy="190.5" r="2.2" class="inr"/><circle cx="162" cy="188.5" r="2.2" class="inr"/><circle cx="167.5" cy="190.5" r="2.2" class="inr"/></g></g>
</g>
<g class="t-broken"><g class="bk" transform="translate(142 -22) scale(1.9)"><path class="bl" d="M12 3 C12 1.500 10.500 0 8.500 0 C3 0 -4 10 12 21 L14 16 L10 12 L14 8 Z" fill="#e0245e"/><path class="br" d="M12 3 C12 1.500 13.500 0 15.500 0 C21 0 28 10 12 21 L14 16 L10 12 L14 8 Z" fill="#b8123a" transform="translate(3 1) rotate(9 14 10)"/></g></g>
<g class="t-sparks"><path d="M30 60 l2 7 l7 2 l-7 2 l-2 7 l-2 -7 l-7 -2 l7 -2Z"/><path d="M172 30 l2 7 l7 2 l-7 2 l-2 7 l-2 -7 l-7 -2 l7 -2Z"/></g>
</svg>`;
  }

  /* ---- eye tracking: every bear's pupils follow the pointer ---- */
  const live = new Set();
  let ticking = false, px = 0, py = 0;
  function look() {
    ticking = false;
    live.forEach((el) => {
      if (!el.isConnected) { live.delete(el); return; }
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height * 0.36);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 160) * 4.6;
      el.style.setProperty('--ex', ((dx / d) * k).toFixed(2) + 'px');
      el.style.setProperty('--ey', ((dy / d) * k * 0.8).toFixed(2) + 'px');
    });
  }
  const onPoint = (e) => { px = e.clientX; py = e.clientY; if (!ticking) { ticking = true; requestAnimationFrame(look); } };
  addEventListener('pointermove', onPoint, { passive: true });
  addEventListener('pointerdown', onPoint, { passive: true });

  const PET_LINES = ['Hehe, that tickles! 🥰', 'Hug accepted 🤗', 'Aww, thank you!', 'Again, again! ✨', "You're so sweet 💖", 'Boop! 🐻'];

  function make(opts = {}) {
    const state = { mood: 'happy', prop: 'none', act: 'idle', hat: false, bow: false, color: '', text: '', gender: '', pose: 'stand', broken: false, hug: false, ...opts };
    if (!state.color) state.color = state.gender === 'f' ? 'pink' : 'brown';
    const wrap = document.createElement('div');
    wrap.className = 'mascot';
    wrap.innerHTML = `<div class="bubble" role="status"></div>` + markup(COLORS[state.color] || COLORS.brown);
    const svg = wrap.querySelector('svg');
    const bubble = wrap.querySelector('.bubble');
    const propG = svg.querySelector('.t-prop');
    live.add(svg);
    let bubbleT = null, petT = null, petN = 0, curX = 0;

    function apply() {
      svg.dataset.mood = state.mood;
      svg.dataset.mouth = MOUTH_FOR[state.mood] || 'smile';
      svg.dataset.act = state.act;
      svg.dataset.hat = state.hat ? '1' : '0';
      svg.dataset.bow = (state.bow || state.gender === 'f') ? '1' : '0';
      svg.dataset.gender = state.gender || '';
      svg.dataset.pose = state.pose;
      svg.dataset.broken = state.broken ? '1' : '0';
      const holds = state.hug || !['none', 'balloon', 'sign', 'rose'].includes(state.prop);
      svg.dataset.hold = holds ? '1' : '0';
      svg.dataset.prop = state.prop;
      propG.innerHTML = (PROPS[state.prop] || PROPS.none)(state); // static markup; names are escaped
    }
    apply();

    const api = {
      el: wrap,
      svg,
      set(patch) { Object.assign(state, patch); apply(); return api; },
      get mood() { return state.mood; },
      say(text, ms = 2600) {
        clearTimeout(bubbleT);
        bubble.textContent = text;
        bubble.classList.remove('show'); void bubble.offsetWidth;
        bubble.classList.add('show');
        if (ms > 0) bubbleT = setTimeout(() => bubble.classList.remove('show'), ms);
        return api;
      },
      hush() { clearTimeout(bubbleT); bubble.classList.remove('show'); return api; },
      // jump to a horizontal offset (px) with no animation
      place(x) { curX = x; wrap.style.transition = 'none'; wrap.style.transform = `translateX(${x}px)`; void wrap.offsetWidth; return api; },
      // run or walk to a horizontal offset (px). Resolves when it arrives.
      slide(x, ms = 1600, { gait = 'run', then = 'idle' } = {}) {
        return new Promise((resolve) => {
          svg.style.setProperty('--lean', (x > curX ? 5 : -5) + 'deg');
          curX = x;
          api.set({ act: gait });
          wrap.style.transition = `transform ${ms}ms cubic-bezier(.4,.1,.3,1)`;
          wrap.style.transform = `translateX(${x}px)`;
          setTimeout(() => { api.set({ act: then }); resolve(); }, ms);
        });
      },
      get x() { return curX; },
      onPet: null,
    };

    // Click / tap: squish, giggle, temporary love face
    wrap.addEventListener('click', (e) => {
      svg.classList.remove('squish'); void svg.getBoundingClientRect(); svg.classList.add('squish');
      const was = state.mood;
      clearTimeout(petT);
      api.set({ mood: 'love' });
      petT = setTimeout(() => api.set({ mood: was }), 1400);
      petN++;
      api.say(PET_LINES[petN % PET_LINES.length], 1800);
      if (api.onPet) api.onPet(e, petN);
    });
    wrap.tabIndex = -1;
    return api;
  }

  /* A couple hugging. a = the sender's bear, b = the receiver's bear. */
  function pair(opts = {}) {
    const box = document.createElement('div');
    box.className = 'ted-pair';
    const ga = (opts.a && opts.a.gender) || 'm', gb = (opts.b && opts.b.gender) || 'f';
    const a = make({ mood: 'love', prop: 'none', act: 'dance', hug: true, ...opts.a, gender: ga });
    const b = make({ mood: 'love', prop: 'none', act: 'dance', hug: true, color: ga === gb ? 'cream' : '', ...opts.b, gender: gb });
    const hearts = document.createElement('div');
    hearts.className = 'pair-hearts';
    hearts.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
    box.append(a.el, b.el, hearts);
    return { el: box, a, b };
  }

  window.Teddy = { make, pair, COLORS };
})();
