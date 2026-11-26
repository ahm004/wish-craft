(() => {
  'use strict';

  /* ================= HELPERS ================= */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const fill = (t, d) => String(t || '').replace(/\{to\}/g, d.to).replace(/\{from\}/g, d.from);
  const center = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const isLove = (o) => ['valentine', 'proposal', 'anniversary', 'sorry'].includes(o);

  /* ================= OCCASIONS ================= */
  const OCCASIONS = {
    birthday: {
      label: 'Birthday', emoji: '🎂', wrap: 'gift', finale: 'cake', music: 'happy',
      ambient: ['balloon', 'star', 'confetti', 'sparkle', 'balloon'],
      palette: ['#ffcc4d', '#ff6fa8', '#8be9fd', '#b69cff', '#ffffff'],
      intro: 'Hey {to}! 👋', introSub: '{from} wrapped up a little something for your special day.',
      title: 'Happy Birthday, {to}!', closing: 'Hope every wish you just made comes true ✨',
      photosTitle: 'A few favourite moments 📸',
      signoff: 'Lots of love,', reply: 'Thank you so much!! 🥹🎂 This made my day.',
      msgs: [
        "Another trip around the sun, and you still make everything brighter.\nI hope today brings loud laughter, too much cake, and every person you love.\nHere's to you. The best chapters are still ahead. 🥳",
        "On your birthday, I just want you to know how lucky I am to have you.\nYou make ordinary days feel like celebrations.\nMay this year give back all the joy you give everyone else. 🎈",
        "Okay birthday star, it's officially your day.\nEat the cake. Make the wish. Ignore the age.\nLove you lots! 🎂",
      ],
    },
    valentine: {
      label: 'Valentine', emoji: '💘', wrap: 'envelope', finale: 'question', music: 'romantic',
      ambient: ['heart', 'petal', 'sparkle', 'heart'],
      palette: ['#ff4d7d', '#ff8fab', '#ffc2d1', '#ffffff', '#ffd6a5'],
      intro: 'Hey {to}…', introSub: '{from} has been wanting to ask you something.',
      question: 'Will you be my Valentine?', yesTitle: 'Yaaay! 💖',
      yesSub: 'Best answer ever. {from} is smiling so hard right now.',
      photosTitle: 'Us, so far 💞',
      signoff: 'Yours,', reply: 'YES!! 💖 Of course I will be your Valentine!', letterTag: 'For {to} 💌',
      msgs: [
        "I've been thinking about how to say this for a while…\nEvery day with you feels a little softer and a little brighter.\nSo I made you this, because a plain text felt too small. 💗",
        "Roses are red, my cheeks are too,\nevery single time I get a message from you.\nSo here goes nothing… 🙈",
      ],
    },
    proposal: {
      label: 'Proposal', emoji: '💍', wrap: 'envelope', finale: 'question', music: 'romantic',
      ambient: ['heart', 'sparkle', 'petal', 'sparkle'],
      palette: ['#f7d08a', '#ff4d7d', '#ffffff', '#ffb4c6', '#ffe9b8'],
      intro: '{to}…', introSub: 'There is something {from} has wanted to ask you for a long time.',
      question: 'Will you marry me?', yesTitle: 'Forever starts now 💍',
      yesSub: '{to} said YES! {from} is the luckiest person alive.',
      photosTitle: 'Every moment with you 💍',
      signoff: 'Forever yours,', reply: 'YES!!! 💍💖 A thousand times yes!', letterTag: 'For {to} 💍',
      msgs: [
        "From the very first day, something about you felt like home.\nYou've seen my best and my worst, and you stayed.\nI can't imagine a single future without you in it.\nSo I have one question for you… 💍",
        "Every plan I make, you're already in it.\nEvery good thing that happens, you're the first person I want to tell.\nI want to spend all my days making you as happy as you make me.\nSo, here it is…",
      ],
    },
    anniversary: {
      label: 'Anniversary', emoji: '🥂', wrap: 'envelope', finale: 'celebrate', music: 'romantic',
      ambient: ['heart', 'sparkle', 'petal', 'heart'],
      palette: ['#f7c873', '#e98aa8', '#ffffff', '#ffb4c6'],
      intro: 'Hey {to} 💞', introSub: '{from} wrote you a little something.',
      title: 'Happy Anniversary, {to}!', closing: "Here's to every year still to come.",
      photosTitle: 'Us, through the years 💞',
      signoff: 'Always yours,', reply: 'Happy anniversary my love 💞🥂', letterTag: 'For {to} 💞',
      msgs: [
        "Another year of us, and I'd choose you all over again.\nThank you for the laughs, the patience, and all the little moments.\nHere's to many, many more. 🥂",
        "They say time flies when you're having fun.\nWith you it's been one long adventure.\nHappy anniversary to my favourite person. 💞",
      ],
    },
    congrats: {
      label: 'Congrats', emoji: '🏆', wrap: 'gift', finale: 'celebrate', music: 'happy',
      ambient: ['star', 'confetti', 'sparkle', 'star'],
      palette: ['#7cf5c9', '#ffd166', '#8ab6ff', '#ffffff', '#ff7eb6'],
      intro: 'Psst, {to}!', introSub: '{from} has something to say about your big news.',
      title: 'Congratulations, {to}!', closing: 'You earned every bit of this. Go celebrate!',
      photosTitle: "Look how far you've come ✨",
      signoff: 'So proud of you,', reply: 'Thank you!! 🥹🏆 That means a lot.',
      msgs: [
        "You did it! All those late nights and hard work finally paid off.\nI'm so proud of you, and honestly not surprised at all.\nGo celebrate, you've earned it. 🏆",
        "Big news deserves a big celebration!\nYou've worked so hard for this, and it shows.\nCan't wait to see what you do next. 🌟",
      ],
    },
    thanks: {
      label: 'Thank you', emoji: '💐', wrap: 'gift', finale: 'celebrate', music: 'dreamy',
      ambient: ['flower', 'petal', 'sparkle', 'flower'],
      palette: ['#ffe8a3', '#95d5b2', '#ffffff', '#ffb5a7'],
      intro: 'Hey {to} 🌼', introSub: '{from} wanted to tell you something properly.',
      title: 'Thank you, {to}!', closing: 'The world is better with you in it.',
      photosTitle: "Moments I'm grateful for 💛",
      signoff: 'With gratitude,', reply: 'Aww 🥹💛 You are so welcome!',
      msgs: [
        "I don't say it enough, so I'm saying it properly this time.\nThank you for always showing up, for listening, and for caring.\nYou mean more to me than you know. 💛",
        "Some people make life easier just by being around.\nYou're one of them.\nThank you for everything. 🌼",
      ],
    },
    sorry: {
      label: 'Sorry', emoji: '🥺', wrap: 'envelope', finale: 'question', music: 'dreamy',
      ambient: ['heart', 'petal', 'sparkle'],
      palette: ['#ffd1dc', '#a3c4ff', '#ffffff', '#cdb4ff'],
      intro: 'Hi {to}…', introSub: '{from} has something to say. Will you hear them out?',
      question: 'Forgive me?', yesTitle: 'Phew! 🤍',
      yesSub: 'Thank you, {to}. {from} owes you a big hug (and probably snacks).',
      photosTitle: 'Remember these? 🤍',
      signoff: 'Truly sorry,', reply: 'Okay okay, you are forgiven 🤍', letterTag: 'For {to} 🤍',
      msgs: [
        "I messed up, and I know it.\nYou didn't deserve that, and I'm truly sorry.\nI'd really love the chance to make it right… 🥺",
        "I've been thinking about what happened, and I owe you an apology.\nYou matter way more to me than being right.\nSo I made you this, with all my heart. 🤍",
      ],
    },
  };

  // The "No" button cycles through these forever (index 0 is the starting label).
  const NO_LINES = [
    'No', 'Are you sure?', 'Really sure?? 🤨', 'Think again…', 'Pretty please? 🥺',
    "You're breaking my heart 💔", 'Wrong button! 😜', 'Catch me if you can 🏃',
    'Nope, not this one 😌', 'I can do this all day 😎', 'Just press Yes 🥹', 'Still no? 🙈',
  ];
  const NO_HINTS = { 3: 'Hmm… that button seems a little shy 👀', 6: "It's never going to let you 😏", 10: 'Only one answer works here 💖' };

  const MUSIC_OPTIONS = {
    romantic: { label: 'Music box', icon: '🎼', hint: 'Soft, romantic music box' },
    happy: { label: 'Happy', icon: '🎉', hint: 'Bouncy and cheerful' },
    dreamy: { label: 'Dreamy', icon: '🌙', hint: 'Calm, floaty and warm' },
    song: { label: 'Your song', icon: '🎵', hint: 'Upload an MP3 or M4A (max 10 MB)' },
    none: { label: 'No music', icon: '🔇', hint: 'Only the little sound effects' },
  };

  const PRICE_INR = 35;
  const MAX_PHOTOS = 5;
  const MAX_SONG_BYTES = 10 * 1024 * 1024;

  /* ================= CARD DATA ================= */
  // Old free links (#w=...) kept the card inside the link. They still open.
  const unb64url = (s) => { let b = s.replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '='; return b; };
  function decodeLegacy(str) {
    const bin = atob(unb64url(str));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
  }
  function unpackLegacyPhoto(s) {
    if (!/^[wj][A-Za-z0-9_-]{20,}$/.test(s)) return null;
    return `data:image/${s[0] === 'w' ? 'webp' : 'jpeg'};base64,${unb64url(s.slice(1))}`;
  }
  const SAFE_MEDIA = /^(https?:\/\/|blob:|data:image\/|\/api\/media\?)/i;

  // raw = card fields {o,t,f,m,q,mu,c}; media = { photos: [url], song: url }
  function normalize(raw, media = {}) {
    const o = OCCASIONS[raw.o] ? raw.o : 'birthday';
    const occ = OCCASIONS[o];
    const clip = (v, n) => String(v || '').trim().slice(0, n);
    let mu = raw.mu === 'url' ? 'song' : raw.mu;
    if (!MUSIC_OPTIONS[mu]) mu = occ.music;
    const mv = String(media.song || (raw.mu === 'url' ? clip(raw.mv, 500) : ''));
    if (mu === 'song' && !SAFE_MEDIA.test(mv)) mu = occ.music;
    return {
      o,
      to: clip(raw.t, 40) || 'you',
      from: clip(raw.f, 40) || 'Someone special',
      msg: clip(raw.m, 800) || occ.msgs[0],
      q: clip(raw.q, 100) || occ.question || '',
      mu, mv,
      photos: (media.photos || []).filter((p) => typeof p === 'string' && SAFE_MEDIA.test(p)).slice(0, MAX_PHOTOS),
      caps: Array.isArray(raw.c) ? raw.c.map((c) => clip(c, 30)) : [],
      sg: raw.sg === 'f' ? 'f' : 'm', // the sender's teddy
      rg: raw.rg === 'm' ? 'm' : 'f', // the receiver's teddy
    };
  }

  /* ================= PARTICLE FX ================= */
  const FX = (() => {
    const c = $('#fx');
    const ctx = c.getContext('2d');
    let W = 0, H = 0, parts = [], running = false, palette = ['#ffffff'];
    const k = reduceMotion ? 0.3 : 1;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      c.width = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    addEventListener('resize', resize);
    resize();

    function add(p) {
      if (parts.length > 1400) return;
      parts.push(p);
      if (!running) { running = true; requestAnimationFrame(tick); }
    }
    function heartPath(s) {
      const t = s / 2;
      ctx.beginPath();
      ctx.moveTo(0, t);
      ctx.bezierCurveTo(-t * 1.5, 0, -t * 0.8, -t * 1.4, 0, -t * 0.45);
      ctx.bezierCurveTo(t * 0.8, -t * 1.4, t * 1.5, 0, 0, t);
      ctx.fill();
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vx *= p.dr; p.vy = p.vy * p.dr + p.g;
        p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= p.decay;
        if (p.life <= 0 || p.y > H + 50) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, p.life * 1.6);
        ctx.fillStyle = p.col;
        if (p.kind === 'confetti') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.scale(1, Math.cos(p.r * 3));
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        } else if (p.kind === 'heart') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); heartPath(p.s); ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s * p.life + 0.6, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(tick);
      else { running = false; ctx.clearRect(0, 0, W, H); }
    }
    const piece = (o) => Object.assign({ g: 0.25, dr: 0.985, r: rand(0, 6), vr: rand(-0.2, 0.2), col: pick(palette), life: 1, decay: 0.005 }, o);

    return {
      setPalette(p) { palette = p; },
      confetti(x = W / 2, y = H / 2, n = 140) {
        for (let i = 0; i < n * k; i++) {
          const a = rand(0, Math.PI * 2), s = rand(3, 12);
          add(piece({ kind: 'confetti', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 7, w: rand(6, 12), h: rand(4, 8), decay: rand(0.004, 0.008) }));
        }
      },
      rain(ms = 3000) {
        const end = performance.now() + ms;
        (function spawn() {
          for (let i = 0; i < 5 * k; i++) {
            add(piece({ kind: 'confetti', x: rand(0, W), y: -12, vx: rand(-1, 1), vy: rand(2, 4), g: 0.04, dr: 0.995, w: rand(6, 12), h: rand(4, 8), decay: 0.0025 }));
          }
          if (performance.now() < end) setTimeout(spawn, 70);
        })();
      },
      hearts(x = W / 2, y = H / 2, n = 50) {
        for (let i = 0; i < n * k; i++) {
          const a = rand(0, Math.PI * 2), s = rand(2, 9);
          add(piece({ kind: 'heart', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, g: 0.13, dr: 0.98, s: rand(10, 26), r: rand(-0.5, 0.5), vr: 0, decay: rand(0.006, 0.01) }));
        }
      },
      heartRain(ms = 3500) {
        const end = performance.now() + ms;
        (function spawn() {
          add(piece({ kind: 'heart', x: rand(0, W), y: -20, vx: rand(-0.6, 0.6), vy: rand(1.5, 3), g: 0.02, dr: 0.998, s: rand(12, 28), r: rand(-0.4, 0.4), vr: rand(-0.01, 0.01), decay: 0.003 }));
          if (performance.now() < end) setTimeout(spawn, reduceMotion ? 250 : 90);
        })();
      },
      sparkle(x, y, n = 24) {
        for (let i = 0; i < n * k; i++) {
          const a = rand(0, Math.PI * 2), s = rand(1, 4);
          add(piece({ kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.02, dr: 0.95, s: rand(1.5, 3), decay: rand(0.015, 0.03) }));
        }
      },
      trail(x, y) {
        add(piece({ kind: 'spark', x, y, vx: rand(-0.6, 0.6), vy: rand(-0.9, 0.1), g: 0.03, dr: 0.96, s: rand(1.2, 2.6), decay: rand(0.03, 0.05) }));
      },
      firework(x, y) {
        const col = pick(palette), n = 80 * k;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2, s = rand(1.5, 5.5);
          add(piece({ kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.05, dr: 0.965, s: rand(1.8, 3.2), col: Math.random() < 0.8 ? col : '#ffffff', decay: rand(0.011, 0.02) }));
        }
      },
      fireworks(ms = 5000) {
        const end = performance.now() + ms;
        const go = () => {
          this.firework(rand(W * 0.15, W * 0.85), rand(H * 0.12, H * 0.45));
          if (performance.now() < end) setTimeout(go, rand(320, 700));
        };
        go();
      },
    };
  })();

  // Sparkle trail that follows the mouse (desktop only)
  if (canHover && !reduceMotion) {
    let lastTrail = 0;
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - lastTrail < 28) return;
      lastTrail = now;
      FX.trail(e.clientX, e.clientY);
    });
  }

  /* ================= AUDIO CORE (one shared context) ================= */
  const AudioCore = (() => {
    let ac = null, master, sfx, bus, muted = false;
    function get() {
      if (!ac) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        ac = new A();
        master = ac.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ac.destination);
        sfx = ac.createGain(); sfx.connect(master);
        bus = ac.createGain(); bus.gain.value = 0; bus.connect(master);
        // soft echo so the music sounds roomy
        const delay = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter(), wet = ac.createGain();
        delay.delayTime.value = 0.34; fb.gain.value = 0.33; lp.type = 'lowpass'; lp.frequency.value = 2200; wet.gain.value = 0.3;
        bus.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(wet); wet.connect(master);
      }
      if (ac.state === 'suspended' && !document.hidden) ac.resume();
      return ac;
    }
    function voice(freq, t, dur, { type = 'sine', vol = 0.1, dest = null, attack = 0.008 } = {}) {
      const a = get(); if (!a) return;
      const o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, attack + 0.05));
      o.connect(g); g.connect(dest || sfx);
      o.start(t); o.stop(t + dur + 0.1);
    }
    document.addEventListener('visibilitychange', () => {
      if (!ac) return;
      if (document.hidden) ac.suspend(); else ac.resume();
    });
    return {
      get, voice,
      now() { const a = get(); return a ? a.currentTime : 0; },
      get bus() { get(); return bus; },
      get sfx() { get(); return sfx; },
      get muted() { return muted; },
      setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.05); },
    };
  })();

  /* ================= SOUND EFFECTS ================= */
  const Sound = {
    pop() { const t = AudioCore.now(); AudioCore.voice(620, t, 0.12, { vol: 0.2 }); AudioCore.voice(930, t + 0.05, 0.18, { vol: 0.12 }); },
    chime() { const t = AudioCore.now(); [72, 76, 79, 84].forEach((n, i) => AudioCore.voice(hz(n), t + i * 0.11, 0.7, { type: 'triangle', vol: 0.13 })); },
    love() { const t = AudioCore.now(); [76, 80, 83, 88, 83, 88].forEach((n, i) => AudioCore.voice(hz(n), t + i * 0.13, 0.9, { vol: 0.14 })); },
    fanfare() {
      const t = AudioCore.now();
      [[67, 0], [72, 0.15], [76, 0.3], [79, 0.45], [76, 0.65], [79, 0.8]].forEach(([n, d]) => AudioCore.voice(hz(n), t + d, 0.6, { type: 'square', vol: 0.05 }));
      this.chime();
    },
    // A soft typewriter: a tiny click plus a low "thock" for each letter, a bell at the end of a line.
    key(ch) {
      const a = AudioCore.get(); if (!a || AudioCore.muted) return;
      const t = a.currentTime, space = ch === ' ';
      if (!this._nb) {
        const len = Math.floor(a.sampleRate * 0.03), b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
        this._nb = b;
      }
      const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      src.buffer = this._nb; src.playbackRate.value = 0.85 + Math.random() * 0.35;
      f.type = 'bandpass'; f.frequency.value = space ? 800 : 1900 + Math.random() * 1500; f.Q.value = 0.9;
      g.gain.value = space ? 0.2 : 0.3;
      src.connect(f); f.connect(g); g.connect(AudioCore.sfx); src.start(t);
      AudioCore.voice(space ? 105 : 150 + Math.random() * 60, t, 0.06, { vol: space ? 0.11 : 0.07 });
    },
    step() { const t = AudioCore.now(); AudioCore.voice(120 + Math.random() * 40, t, 0.05, { vol: 0.07 }); AudioCore.voice(260 + Math.random() * 80, t, 0.03, { vol: 0.025, type: 'triangle' }); },
    sad() { const t = AudioCore.now(); [69, 65, 62].forEach((n, i) => AudioCore.voice(hz(n), t + i * 0.28, 0.6, { type: 'triangle', vol: 0.1 })); },
    crack() { const t = AudioCore.now(); AudioCore.voice(900, t, 0.06, { type: 'square', vol: 0.05 }); AudioCore.voice(300, t + 0.05, 0.25, { type: 'sawtooth', vol: 0.05 }); },
    bell() { const t = AudioCore.now(); AudioCore.voice(1760, t, 1.2, { vol: 0.055, attack: 0.003 }); AudioCore.voice(2637, t, 0.8, { vol: 0.03, attack: 0.003 }); },
    thud() { const t = AudioCore.now(); AudioCore.voice(68, t, 0.3, { vol: 0.3, attack: 0.004 }); AudioCore.voice(190, t, 0.08, { vol: 0.12, type: 'triangle' }); },
    squeak() { const t = AudioCore.now(); AudioCore.voice(980, t, 0.09, { vol: 0.13 }); AudioCore.voice(1480, t + 0.07, 0.12, { vol: 0.11 }); },
    boing() {
      const t = AudioCore.now();
      AudioCore.voice(pick([330, 370, 392, 440]), t, 0.15, { vol: 0.12 });
      AudioCore.voice(220, t + 0.07, 0.15, { vol: 0.09 });
    },
    blow() {
      const a = AudioCore.get(); if (!a) return;
      const len = a.sampleRate * 0.5, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      src.buffer = buf; f.type = 'bandpass'; f.frequency.value = 900; g.gain.value = 0.35;
      src.connect(f).connect(g).connect(AudioCore.sfx); src.start();
    },
    birthday() { // Traditional "Happy Birthday" melody (public domain). Returns its length in ms.
      const song = [[67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2], [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
        [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2], [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 3]];
      let t = AudioCore.now() + 0.05; const beat = 0.34, start = t;
      song.forEach(([n, dur]) => { AudioCore.voice(hz(n), t, dur * beat + 0.15, { type: 'triangle', vol: 0.13 }); t += dur * beat; });
      return (t - start) * 1000;
    },
  };

  /* ================= BACKGROUND MUSIC (generated live) ================= */
  const Music = (() => {
    const TRACKS = {
      romantic: { bpm: 76, prog: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], style: 'box' },
      happy: { bpm: 118, prog: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], style: 'bounce' },
      dreamy: { bpm: 62, prog: [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]], style: 'dream' },
    };
    let timer = null, step = 0, next = 0, cur = null, el = null, elUrl = '', key = 'none', url = '', resumeT = null;
    const v = (m, t, dur, o) => AudioCore.voice(hz(m), t, dur, Object.assign({ dest: AudioCore.bus }, o));

    function playStep(s, t) {
      const len = cur.prog.length, bar = Math.floor(s / 8), i = s % 8, ch = cur.prog[bar % len];
      const alt = Math.floor(bar / len) % 2 === 1, e = 60 / cur.bpm / 2;
      if (cur.style === 'box') {
        const seq = alt ? [3, 2, 1, 0, 1, 2, 3, 2] : [0, 1, 2, 3, 2, 1, 2, 1];
        const tones = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 24];
        const m = tones[seq[i]];
        v(m, t, 1.4, { vol: 0.085 });
        v(m + 12, t, 0.5, { vol: 0.018 });
        if (i === 0) v(ch[0] - 12, t, e * 8, { vol: 0.09, attack: 0.05 });
        if (i === 4) v(ch[2] - 12, t, e * 4, { vol: 0.05, attack: 0.05 });
      } else if (cur.style === 'bounce') {
        if (i === 0 || i === 4) v(ch[0] - 12, t, e * 1.6, { type: 'triangle', vol: 0.16 });
        if (i === 3 || i === 7) v(ch[0] - 5, t, e, { type: 'triangle', vol: 0.08 });
        if (i === 2 || i === 6) ch.forEach((n) => v(n + 12, t, e * 0.9, { type: 'square', vol: 0.02 }));
        const mel = alt ? [2, 1, 0, 1, 2, 2, 1, 0] : [0, 1, 2, 1, 0, 2, 1, 2];
        v(ch[mel[i]] + 24, t, e * 1.2, { vol: 0.045 });
      } else {
        if (i === 0) {
          ch.concat([ch[0] + 12]).forEach((n) => v(n, t, e * 9, { type: 'triangle', vol: 0.035, attack: 0.8 }));
          v(ch[0] - 12, t, e * 9, { vol: 0.07, attack: 0.6 });
        }
        if (i % 2 === 0 && Math.random() < 0.45) v(pick(ch) + 24, t, 1.8, { vol: 0.035 });
      }
    }
    function schedule() {
      const a = AudioCore.get(); if (!a || !cur) return;
      if (next < a.currentTime) next = a.currentTime + 0.05; // skip, never burst, after a pause
      while (next < a.currentTime + 0.3) { playStep(step, next); next += 60 / cur.bpm / 2; step++; }
    }
    function fade(to, s) {
      const a = AudioCore.get(); if (!a) return;
      const g = AudioCore.bus.gain;
      g.cancelScheduledValues(a.currentTime);
      g.setValueAtTime(g.value, a.currentTime);
      g.linearRampToValueAtTime(to, a.currentTime + s);
    }
    function start() {
      if (key === 'song' && url) {
        if (!el || elUrl !== url) {
          if (el) el.pause();
          el = new window.Audio(url); elUrl = url; el.loop = true; el.volume = 0.55;
          el.addEventListener('error', () => { if (key === 'song') { key = 'romantic'; start(); } });
        }
        el.muted = AudioCore.muted;
        el.play().catch(() => { key = 'romantic'; start(); });
        return;
      }
      cur = TRACKS[key];
      if (!cur) return;
      const a = AudioCore.get(); if (!a) return;
      clearInterval(timer);
      step = 0; next = a.currentTime + 0.1;
      fade(0.9, 2);
      schedule();
      timer = setInterval(schedule, 80);
    }
    function halt() {
      clearTimeout(resumeT);
      clearInterval(timer); timer = null;
      if (AudioCore.get()) fade(0, 0.6);
      if (el) el.pause();
    }
    document.addEventListener('visibilitychange', () => {
      if (!el || key !== 'song') return;
      if (document.hidden) el.pause(); else if (timer === null && resumeT === null) el.play().catch(() => {});
    });
    return {
      play(k, u) { halt(); resumeT = null; key = k; url = u || ''; start(); },
      stop() { halt(); resumeT = null; key = 'none'; },
      duck(ms) { halt(); resumeT = setTimeout(() => { resumeT = null; start(); }, ms); },
      setMuted(m) { if (el) el.muted = m; },
    };
  })();

  /* ================= DRAWN SHAPES (floaters, no emoji) ================= */
  const SHAPES = {
    heart: (c) => '<svg viewBox="0 0 24 22"><path fill="' + c + '" d="M12 21C-4 10 3 0 8.5 0 10.5 0 12 1.5 12 3c0-1.5 1.5-3 3.5-3C21 0 28 10 12 21z"/></svg>',
    star: (c) => '<svg viewBox="0 0 24 24"><path fill="' + c + '" d="M12 1.5l3 6.9 7.5.7-5.7 5 1.8 7.4L12 17.5l-6.6 4 1.8-7.4-5.7-5 7.5-.7z"/></svg>',
    sparkle: (c) => '<svg viewBox="0 0 24 24"><path fill="' + c + '" d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z"/></svg>',
    balloon: (c) => '<svg viewBox="0 0 24 36"><ellipse cx="12" cy="12" rx="10" ry="12" fill="' + c + '"/><ellipse cx="8" cy="7" rx="2.4" ry="3.6" fill="#fff" opacity=".4" transform="rotate(25 8 7)"/><path d="M10 24l2 3 2-3z" fill="' + c + '"/><path d="M12 27q-3 4 0 9" stroke="#fff" stroke-opacity=".6" fill="none"/></svg>',
    confetti: (c) => '<svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="6" rx="2" fill="' + c + '" transform="rotate(35 12 12)"/></svg>',
    petal: (c) => '<svg viewBox="0 0 24 24"><path fill="' + c + '" d="M12 1C20 7 21 16 12 23 3 16 4 7 12 1z"/></svg>',
    flower: (c) => '<svg viewBox="0 0 24 24">' + [0, 72, 144, 216, 288].map((a) => '<circle cx="' + (12 + 6.5 * Math.cos(a * Math.PI / 180)).toFixed(1) + '" cy="' + (12 + 6.5 * Math.sin(a * Math.PI / 180)).toFixed(1) + '" r="5" fill="' + c + '"/>').join('') + '<circle cx="12" cy="12" r="4" fill="#fff3a8"/></svg>',
  };
  const shapeSvg = (kind, color) => (SHAPES[kind] || SHAPES.sparkle)(color);

  /* ================= AMBIENT FLOATIES ================= */
  const Ambient = (() => {
    const el = $('#ambient'); let timer = null, set = [], colors = ['#ffffff'];
    function spawn() {
      if (document.hidden || el.childElementCount > 16) return;
      const s = document.createElement('span');
      s.innerHTML = shapeSvg(pick(set), pick(colors)); // static, trusted markup
      s.style.left = rand(0, 100) + '%';
      s.style.width = rand(14, 34) + 'px';
      s.style.animationDuration = rand(10, 18) + 's';
      s.style.setProperty('--dx', rand(-70, 70) + 'px');
      s.style.setProperty('--rot', rand(-60, 60) + 'deg');
      s.addEventListener('animationend', () => s.remove());
      el.appendChild(s);
    }
    return {
      start(list, palette) { set = list; if (palette) colors = palette; clearInterval(timer); if (reduceMotion) return; spawn(); timer = setInterval(spawn, 900); },
    };
  })();

  /* ================= PHOTO SHRINKING ================= */
  // Photos are resized in the browser (max 1280px JPEG) so uploads are quick on mobile data.
  function loadImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not read image')); };
      img.src = url;
    });
  }
  async function shrinkPhoto(file) {
    const img = await loadImage(file);
    const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, c.width, c.height);
    return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Could not compress image'))), 'image/jpeg', 0.85));
  }
  function songType(file) {
    if (/^audio\/(mpeg|mp3|mp4|x-m4a|aac)$/.test(file.type)) return file.type === 'audio/mp3' ? 'audio/mpeg' : file.type;
    if (/\.mp3$/i.test(file.name)) return 'audio/mpeg';
    if (/\.m4a$/i.test(file.name)) return 'audio/mp4';
    return '';
  }

  /* ================= SERVER CALLS ================= */
  async function api(name, body) {
    let r;
    try {
      r = await fetch(`/api/${name}`, body === undefined ? {} : {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
    } catch {
      throw new Error('Could not reach the server. Check your internet connection and try again.');
    }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error || `Something went wrong (${r.status}).`); e.status = r.status; throw e; }
    return j;
  }
  async function uploadFile(target, blob, type) {
    let r;
    try {
      r = await fetch(target.url, { method: 'PUT', headers: { 'content-type': type, 'x-upsert': 'false' }, body: blob });
    } catch { r = null; }
    if (!r || !r.ok) throw new Error('A file failed to upload. Check your connection and try again.');
  }
  function loadRazorpay() {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((ok, bad) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = ok;
      s.onerror = () => bad(new Error('Could not load the payment window. Check your internet connection.'));
      document.head.appendChild(s);
    });
  }
  const linkFor = (id) => `${location.origin}/w/${id}`;

  /* ================= "YOUR CARDS" (saved in this browser) ================= */
  const Mine = {
    key: 'wishcraft.cards',
    all() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
    save(list) { try { localStorage.setItem(this.key, JSON.stringify(list.slice(0, 20))); } catch { /* private mode */ } },
    upsert(card) { const l = this.all().filter((x) => x.id !== card.id); l.unshift(card); this.save(l); },
    update(id, patch) { const l = this.all(); const c = l.find((x) => x.id === id); if (c) { Object.assign(c, patch); this.save(l); } },
  };

  /* ================= PROGRESS DIALOG ================= */
  const Progress = {
    show(text) {
      $('#progress').hidden = false;
      $('#pSpin').hidden = false; $('#pEmoji').hidden = true;
      $('#pText').textContent = text;
      $('#pActions').textContent = '';
    },
    message(emoji, text, buttons = [{ label: 'OK' }]) {
      $('#progress').hidden = false;
      $('#pSpin').hidden = true;
      $('#pEmoji').hidden = false; $('#pEmoji').textContent = emoji;
      $('#pText').textContent = text;
      const wrap = $('#pActions');
      wrap.textContent = '';
      buttons.forEach((b) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'btn ' + (b.primary ? 'glow' : 'ghost') + ' small';
        el.textContent = b.label;
        el.addEventListener('click', () => { this.hide(); if (b.onClick) b.onClick(); });
        wrap.appendChild(el);
      });
      wrap.querySelector('button')?.focus();
    },
    hide() { $('#progress').hidden = true; },
  };

  /* ================= CREATOR ================= */
  /* ================= LANDING PAGE (hero, steps, moments, scroll effects) ================= */
  const MOMENT_TAGLINE = {
    birthday: 'A gift, a cake with candles and a party-hat bear.',
    valentine: 'A sealed letter and a "No" button that runs away.',
    proposal: 'A ring, a nervous bear and the big question.',
    anniversary: 'Two bears hugging with hearts everywhere.',
    congrats: 'Fireworks, confetti and a golden trophy.',
    thanks: 'A bouquet and a heartfelt thank-you.',
    sorry: 'A sad bear, flowers and one big "forgive me".',
  };
  const BEAR_LOOK = {
    birthday: { prop: 'balloon', hat: true, mood: 'party' }, valentine: { prop: 'rose', mood: 'shy', gender: 'f' },
    proposal: { prop: 'rose', mood: 'shy', gender: 'm' }, anniversary: { prop: 'heart', mood: 'love' },
    congrats: { prop: 'trophy', mood: 'joy' }, thanks: { prop: 'flower', mood: 'happy' }, sorry: { prop: 'flower', mood: 'sad' },
  };
  function petBear(t) {
    t.onPet = () => { const [x, y] = center(t.svg); FX.hearts(x, y - 30, 8); Sound.squeak(); };
    return t;
  }

  function initLanding({ onPick }) {
    const root = $('#creator');

    // hero bear that talks
    const hb = petBear(Teddy.make({ mood: 'happy', prop: 'sign', text: 'For you!', act: 'dance' }));
    $('#heroBear').appendChild(hb.el);
    const hi = ['Psst… wanna make someone smile? 🎁', 'Tap me! I dare you 😏', 'I can hold a ring, a gift… or my feelings 🥺', 'Say it with a little magic ✨'];
    let hn = 0;
    setTimeout(() => hb.say(hi[0], 3800), 1300);
    setInterval(() => { if (!document.hidden) hb.say(hi[++hn % hi.length], 3800); }, 8000);

    // drifting shapes behind the bear (parallax)
    const fl = $('#floaters');
    const spots = [['heart', 6, 14, 26, 0.3], ['star', 88, 10, 22, 0.18], ['sparkle', 14, 70, 20, 0.22], ['balloon', 86, 62, 24, 0.34], ['petal', 50, 4, 16, -0.1], ['heart', 76, 86, 18, 0.12], ['sparkle', 30, 24, 14, -0.14], ['confetti', 66, 28, 18, 0.2]];
    const pal = ['#ffcc4d', '#ff6fa8', '#8be9fd', '#b69cff', '#ffffff'];
    spots.forEach(([kind, x, y, w, depth], i) => {
      const it = document.createElement('i');
      it.style.cssText = `left:${x}%;top:${y}%;width:${w}px`;
      it.dataset.depth = depth;
      it.innerHTML = shapeSvg(kind, pal[i % pal.length]); // static, trusted markup
      it.firstChild.style.cssText = `display:block;width:100%;height:auto;animation:floatY ${4 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`;
      fl.appendChild(it);
    });
    $$('#creator [data-depth]').forEach((el) => el.style.setProperty('--depth', el.dataset.depth));

    // step bears
    $$('.step-bear').forEach((el) => el.appendChild(petBear(Teddy.make({ mood: 'happy', prop: el.dataset.bear })).el));

    // "pick your moment" cards, each with its own bear and a 3D tilt
    const row = $('#momentRow');
    Object.entries(OCCASIONS).forEach(([key, occ]) => {
      const b = document.createElement('div');
      b.className = 'moment'; b.dataset.theme = key; b.setAttribute('data-reveal', '');
      b.setAttribute('role', 'button'); b.tabIndex = 0;
      const holder = document.createElement('div'); holder.className = 'moment-bear';
      const L = BEAR_LOOK[key];
      holder.appendChild(petBear(Teddy.make({ mood: L.mood, prop: L.prop, hat: !!L.hat, gender: L.gender || '' })).el);
      const h = document.createElement('h3'); h.textContent = occ.label;
      const p = document.createElement('p'); p.textContent = MOMENT_TAGLINE[key];
      const go = document.createElement('span'); go.className = 'go'; go.textContent = 'Make this →';
      b.append(holder, h, p, go);
      b.addEventListener('click', (e) => { if (e.target.closest('.mascot')) return; onPick(key); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(key); } });
      if (canHover && !reduceMotion) {
        b.addEventListener('pointermove', (e) => {
          const r = b.getBoundingClientRect();
          b.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 14).toFixed(1) + 'deg');
          b.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -12).toFixed(1) + 'deg');
        });
        b.addEventListener('pointerleave', () => { b.style.setProperty('--rx', '0deg'); b.style.setProperty('--ry', '0deg'); });
      }
      row.appendChild(b);
    });

    // scroll reveal, with a stagger inside lists
    $$('[data-stagger]').forEach((c) => [...c.children].forEach((ch, i) => ch.style.setProperty('--d', i * 110 + 'ms')));
    if ('IntersectionObserver' in window && !reduceMotion) {
      root.classList.add('reveal-on');
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      $$('#creator [data-reveal]').forEach((el) => io.observe(el));
    }

    // scroll progress bar + hero parallax
    let ticking = false;
    const onScroll = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : '0');
      if (!reduceMotion && scrollY < 1400) $('#heroArt').style.setProperty('--sy', String(scrollY));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }

  function startCreator() {
    $('#creator').hidden = false;
    const form = $('#wishForm'), msg = $('#msg'), question = $('#question');
    let current = 'birthday', msgEdited = false, sIdx = 0;
    let music = 'happy', musicPicked = false, previewing = false, busy = false;
    const gender = { sg: 'm', rg: 'f' }; // which teddy is the sender, which is the receiver
    [['#segFrom', 'sg'], ['#segTo', 'rg']].forEach(([sel, key]) => {
      const seg = $(sel);
      seg.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-g]');
        if (!b) return;
        gender[key] = b.dataset.g;
        [...seg.children].forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
    });
    const photos = []; // { blob, url, cap }
    let song = null;   // { file, url, type }

    // ---- occasion chips ----
    function makeChip(icon, label, onClick, dataset) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip';
      Object.assign(b.dataset, dataset);
      const e = document.createElement('span'); e.textContent = icon;
      b.append(e, document.createTextNode(label));
      b.addEventListener('click', onClick);
      return b;
    }
    Object.entries(OCCASIONS).forEach(([key, occ]) => {
      $('#chips').appendChild(makeChip(occ.emoji, occ.label, () => select(key), { o: key }));
    });

    function select(key) {
      current = key;
      const occ = OCCASIONS[key];
      document.body.dataset.theme = key;
      $$('#chips .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.o === key)));
      if (!msgEdited) { sIdx = 0; msg.value = occ.msgs[0]; }
      $('#questionWrap').hidden = occ.finale !== 'question';
      question.value = occ.question || '';
      FX.setPalette(occ.palette);
      Ambient.start(occ.ambient, occ.palette);
      if (!musicPicked) setMusic(occ.music, false);
    }

    msg.addEventListener('input', () => { msgEdited = true; });
    $('#suggest').addEventListener('click', () => {
      const list = OCCASIONS[current].msgs;
      sIdx = (sIdx + 1) % list.length;
      msg.value = list[sIdx]; msgEdited = false;
    });

    // ---- music ----
    Object.entries(MUSIC_OPTIONS).forEach(([key, m]) => {
      $('#musicChips').appendChild(makeChip(m.icon, m.label, () => setMusic(key, true), { m: key }));
    });
    function setMusic(key, byUser) {
      music = key;
      if (byUser) musicPicked = true;
      $$('#musicChips .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.m === key)));
      $('#songPick').hidden = key !== 'song';
      $('#musicHint').textContent = MUSIC_OPTIONS[key].hint;
      $('#musicPreview').hidden = key === 'none' || (key === 'song' && !song);
      if (previewing) {
        if (key === 'none' || (key === 'song' && !song)) stopListen(); else Music.play(key, song?.url);
      }
      if (key === 'song' && !song && byUser) $('#songInput').click();
    }
    function stopListen() { previewing = false; Music.stop(); $('#musicPreview').textContent = '▶ Listen'; }
    $('#musicPreview').addEventListener('click', () => {
      if (previewing) return stopListen();
      previewing = true;
      Music.play(music, song?.url);
      $('#musicPreview').textContent = '■ Stop';
    });
    $('#songBtn').addEventListener('click', () => $('#songInput').click());
    $('#songInput').addEventListener('change', () => {
      const f = $('#songInput').files[0];
      $('#songInput').value = '';
      if (!f) return;
      const type = songType(f);
      if (!type) { $('#songName').textContent = '⚠️ Please choose an MP3 or M4A file.'; return; }
      if (f.size > MAX_SONG_BYTES) { $('#songName').textContent = '⚠️ That file is over 10 MB. Try a shorter song.'; return; }
      if (song) URL.revokeObjectURL(song.url);
      song = { file: f, url: URL.createObjectURL(f), type };
      $('#songName').textContent = `✓ ${f.name}`;
      $('#songBtn').textContent = '🎵 Change song';
      setMusic('song', true);
    });

    // ---- photos ----
    const input = $('#photoInput'), drop = $('#drop'), hint = $('#photoHint');
    input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('drag'); }));
    drop.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

    async function addFiles(files) {
      hint.hidden = true;
      for (const f of [...files]) {
        if (photos.length >= MAX_PHOTOS) { showHint(`You can add up to ${MAX_PHOTOS} photos.`); break; }
        if (!f.type.startsWith('image/')) continue;
        try {
          const blob = await shrinkPhoto(f);
          photos.push({ blob, url: URL.createObjectURL(blob), cap: '' });
          renderThumbs();
        } catch {
          showHint(`Couldn't read “${f.name}”. Try a JPG or PNG.`);
        }
      }
    }
    function showHint(t) { hint.textContent = t; hint.hidden = false; }
    function renderThumbs() {
      const wrap = $('#thumbs');
      wrap.textContent = '';
      photos.forEach((p, i) => {
        const t = document.createElement('div');
        t.className = 'thumb';
        t.style.setProperty('--r', [-3, 2, -1, 3, -2][i] + 'deg');
        const img = document.createElement('img'); img.src = p.url; img.alt = `Photo ${i + 1}`;
        const cap = document.createElement('input');
        cap.maxLength = 30; cap.placeholder = 'add a caption'; cap.value = p.cap;
        cap.setAttribute('aria-label', `Caption for photo ${i + 1}`);
        cap.addEventListener('input', () => { p.cap = cap.value; });
        const rm = document.createElement('button');
        rm.type = 'button'; rm.className = 'rm'; rm.textContent = '×';
        rm.setAttribute('aria-label', `Remove photo ${i + 1}`);
        rm.addEventListener('click', () => { URL.revokeObjectURL(p.url); photos.splice(i, 1); renderThumbs(); hint.hidden = true; });
        t.append(img, cap, rm);
        wrap.appendChild(t);
      });
      drop.hidden = photos.length >= MAX_PHOTOS;
    }

    // ---- collect + check the form ----
    function collect() {
      const err = $('#formError');
      err.hidden = true;
      const occ = OCCASIONS[current];
      const to = $('#to').value.trim(), from = $('#from').value.trim(), m = msg.value.trim();
      const fail = (text, el) => { err.textContent = text; err.hidden = false; el?.focus(); return null; };
      if (!to) return fail('Please enter their name.', $('#to'));
      if (!from) return fail('Please enter your name.', $('#from'));
      if (!m) return fail('Please write a message.', msg);
      if (music === 'song' && !song) return fail('Choose a song file, or pick another music option.', $('#songBtn'));
      const data = { o: current, t: to, f: from, m, mu: music, sg: gender.sg, rg: gender.rg };
      if (occ.finale === 'question' && question.value.trim()) data.q = question.value.trim();
      if (photos.some((p) => p.cap.trim())) data.c = photos.map((p) => p.cap.trim());
      return data;
    }

    // ---- free preview (runs in a full-screen frame) ----
    const modal = $('#previewModal'), frame = $('#previewFrame');
    let previewData = null;
    $('#previewBtn').addEventListener('click', () => {
      const data = collect();
      if (!data) return;
      if (location.protocol === 'file:') {
        Progress.message('⚙️', 'Open the site through the server to preview: run “npm run dev” and go to http://localhost:3000');
        return;
      }
      if (previewing) stopListen();
      openPreview({ data, photos: photos.map((p) => p.url), song: song?.url || null });
    });
    function openPreview(payload) {
      previewData = payload;
      frame.src = '/?preview=1';
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    $('#demoBtn').addEventListener('click', () => {
      if (location.protocol === 'file:') { Progress.message('⚙️', 'Run “npm run dev” and open http://localhost:3000 to watch the demo.'); return; }
      if (previewing) stopListen();
      openPreview({ demo: true, photos: [], song: null, data: { o: 'proposal', t: 'Sara', f: 'Sam', m: OCCASIONS.proposal.msgs[0], mu: 'romantic', sg: 'm', rg: 'f' } });
    });
    function closePreview() {
      frame.src = 'about:blank';
      modal.hidden = true;
      document.body.style.overflow = '';
    }
    addEventListener('message', (e) => {
      if (e.origin !== location.origin || e.source !== frame.contentWindow) return;
      const type = e.data?.type;
      if (type === 'wc-ready' && previewData) frame.contentWindow.postMessage({ type: 'wc-preview', ...previewData }, location.origin);
      if (type === 'wc-close') closePreview();
      if (type === 'wc-pay') {
        const wasDemo = previewData?.demo;
        closePreview();
        if (wasDemo) $('#make').scrollIntoView({ behavior: 'smooth' }); else form.requestSubmit();
      }
    });

    // ---- create + pay ----
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy) return;
      const data = collect();
      if (!data) return;
      if (location.protocol === 'file:') {
        Progress.message('⚙️', 'Payments need the server running. Run “npm run dev” and open http://localhost:3000 (or use your Vercel site).');
        return;
      }
      if (previewing) stopListen();
      busy = true;
      try {
        Progress.show('Saving your card…');
        const created = await api('cards', {
          ...data,
          photoCount: photos.length,
          song: data.mu === 'song' ? { type: song.type, size: song.file.size } : null,
        });
        Mine.upsert({ id: created.id, token: created.token, to: data.t, o: data.o, status: 'pending', at: Date.now() });
        const files = [
          ...photos.map((p) => ({ blob: p.blob, type: 'image/jpeg' })),
          ...(data.mu === 'song' ? [{ blob: song.file, type: song.type }] : []),
        ];
        for (let i = 0; i < files.length; i++) {
          Progress.show(files.length === 1 ? 'Uploading…' : `Uploading ${i + 1} of ${files.length}…`);
          await uploadFile(created.uploads[i], files[i].blob, files[i].type);
        }
        await pay(created.id, created.token, data.t, data.o);
      } catch (err) {
        Progress.message('😕', err.message, [{ label: 'OK' }]);
      } finally {
        busy = false;
        renderMine();
      }
    });

    $('#copyBtn').addEventListener('click', async () => {
      const btn = $('#copyBtn'), link = $('#link');
      try { await navigator.clipboard.writeText(link.value); }
      catch { link.select(); document.execCommand('copy'); }
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
    });
    $('#againBtn').addEventListener('click', () => { location.href = '/'; });

    initLanding({ onPick: (key) => { select(key); $('#make').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#to').focus({ preventScroll: true }), 700); } });
    select('birthday');
    renderMine();
    refreshMine();
  }

  // Opens Razorpay (or the local test-payment dialog) for a saved card.
  async function pay(id, token, to, o) {
    Progress.show('Opening secure payment…');
    const c = await api('checkout', { id, token });
    if (c.paid) return paid(id, to, o);

    if (c.testMode) {
      return new Promise((resolve) => {
        Progress.message('🧪', `TEST MODE: Razorpay isn't connected yet, so no real money moves. Pretend to pay ₹${c.price}?`, [
          { label: `Pretend to pay ₹${c.price}`, primary: true, onClick: async () => {
            try { Progress.show('Confirming…'); await api('verify', { id, token, test: true }); paid(id, to, o); }
            catch (err) { Progress.message('😕', err.message); }
            resolve();
          } },
          { label: 'Cancel', onClick: () => { cancelled(); resolve(); } },
        ]);
      });
    }

    await loadRazorpay();
    Progress.hide();
    return new Promise((resolve) => {
      const rz = new window.Razorpay({
        key: c.keyId,
        amount: c.amount,
        currency: c.currency,
        order_id: c.orderId,
        name: 'WishCraft',
        description: `Animated card for ${to}`,
        theme: { color: '#ff5c8a' },
        handler: async (resp) => {
          try {
            Progress.show('Confirming your payment…');
            await api('verify', { id, token, ...resp });
            paid(id, to, o);
          } catch (err) {
            Progress.message('⏳', err.message, [{ label: 'Check again', primary: true, onClick: () => checkPaid(id, token, to, o) }, { label: 'Close' }]);
          }
          resolve();
        },
        modal: { ondismiss: () => { cancelled(); resolve(); } },
      });
      rz.open();
    });
  }
  function cancelled() {
    Progress.message('💾', 'Payment not completed. Your card is saved, so you can pay any time from “Your cards” at the top of this page.');
    renderMine();
  }
  async function checkPaid(id, token, to, o) {
    try {
      Progress.show('Checking…');
      const s = await api('status', { id, token });
      if (s.status === 'paid') paid(id, to, o);
      else Progress.message('⏳', 'Not confirmed yet. If money was deducted, it usually confirms within a few minutes.', [{ label: 'Check again', primary: true, onClick: () => checkPaid(id, token, to, o) }, { label: 'Close' }]);
    } catch (err) { Progress.message('😕', err.message); }
  }
  function paid(id, to, o) {
    Progress.hide();
    Mine.update(id, { status: 'paid' });
    renderMine();
    const url = linkFor(id);
    const occ = OCCASIONS[o] || OCCASIONS.birthday;
    $('#resultTo').textContent = to;
    $('#link').value = url;
    $('#openBtn').href = url;
    $('#waBtn').href = 'https://wa.me/?text=' + encodeURIComponent(`${occ.emoji} ${to}, I made something special for you. Open it 👉 ${url}`);
    const shareBtn = $('#shareBtn');
    shareBtn.hidden = !navigator.share;
    shareBtn.onclick = () => navigator.share({ title: 'A little surprise for you', text: `${occ.emoji} ${to}, I made something special for you.`, url }).catch(() => {});
    const result = $('#result');
    const pair = Teddy.pair(); pair.el.classList.add('small');
    $('#resultBears').replaceChildren(pair.el);
    setTimeout(() => pair.a.say('Link ready! 🥳', 3200), 700);
    result.hidden = false;
    $('#wishForm').hidden = true;
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { FX.confetti(innerWidth / 2, innerHeight / 2, 140); Sound.chime(); }, 300);
  }

  function renderMine() {
    const list = Mine.all();
    const wrap = $('#mineList');
    $('#mine').hidden = !list.length;
    wrap.textContent = '';
    list.slice(0, 8).forEach((c) => {
      const occ = OCCASIONS[c.o] || OCCASIONS.birthday;
      const li = document.createElement('li');
      const who = document.createElement('span');
      who.className = 'mine-who';
      who.textContent = `${occ.emoji} For ${c.to}`;
      const meta = document.createElement('small');
      meta.textContent = c.status === 'paid' ? (c.opens ? ` · opened ${c.opens}×` : ' · paid') : ' · not paid yet';
      who.appendChild(meta);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn small ' + (c.status === 'paid' ? 'ghost' : 'glow');
      if (c.status === 'paid') {
        btn.textContent = 'Copy link';
        btn.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(linkFor(c.id)); btn.textContent = 'Copied ✓'; }
          catch { paid(c.id, c.to, c.o); }
        });
      } else {
        btn.textContent = `Pay ₹${PRICE_INR}`;
        btn.addEventListener('click', async () => {
          try { await pay(c.id, c.token, c.to, c.o); }
          catch (err) { Progress.message('😕', err.message); }
        });
      }
      li.append(who, btn);
      wrap.appendChild(li);
    });
  }
  async function refreshMine() {
    if (location.protocol === 'file:') return;
    for (const c of Mine.all().slice(0, 8)) {
      try {
        const s = await api('status', { id: c.id, token: c.token });
        Mine.update(c.id, { status: s.status, opens: s.opens });
      } catch (err) {
        if (err.status === 404) Mine.save(Mine.all().filter((x) => x.id !== c.id));
      }
    }
    renderMine();
  }

  /* ================= EXPERIENCE ================= */
  let activeScene = null;
  function show(id) {
    if (activeScene) activeScene.classList.remove('active');
    activeScene = document.getElementById(id);
    activeScene.classList.add('active');
    activeScene.scrollTop = 0;
    const idx = { 's-intro': 0, 's-wrap': 1, 's-message': 2, 's-photos': 3, 's-finale': 4 }[id];
    const ch = $('#chapters');
    ch.classList.toggle('off', idx === undefined);
    [...ch.children].forEach((dot, i) => { dot.classList.toggle('on', i === idx); dot.classList.toggle('done', idx !== undefined && i < idx); });
  }

  let isPreview = false;

  /* ---- the teddy in each scene ---- */
  // Want your own GIFs instead of the bear? Put the files in public/gifs/ and list them here,
  // e.g. intro: '/gifs/hello.gif'. Any scene left empty keeps the bear.
  const GIFS = {
    intro: '', wrap: '', message: '', photos: '', cake: '', question: '', yes: '', status: '',
  };

  // What the bear holds and how it feels, per occasion
  const LOOK = {
    birthday: { prop: 'balloon', hat: true, mood: 'party', sign: 'Party time!', hi: 'Surprise! 🎉', ask: '', end: 'Cake next! 🎂' },
    valentine: { prop: 'rose', mood: 'shy', sign: 'Be mine?', hi: 'Hi… 🙈', ask: 'Be brave, bear… 🙈', end: 'Aww 🥹' },
    proposal: { prop: 'rose', mood: 'shy', sign: 'A question…', hi: "I'm a little nervous 😳", ask: 'Deep breath… 😳', end: 'The big question is next 💍' },
    anniversary: { prop: 'heart', mood: 'love', sign: 'Us 💞', hi: 'Happy us! 💞', ask: '', end: 'Still gets me 💞' },
    congrats: { prop: 'trophy', mood: 'joy', sign: 'Big news!', hi: 'You did it! 🎉', ask: '', end: 'So proud of you! 🥹' },
    thanks: { prop: 'flower', mood: 'happy', sign: 'Thank you', hi: 'These are for you 🌼', ask: '', end: 'Aww 🥹' },
    sorry: { prop: 'flower', mood: 'sad', sign: "I'm sorry", hi: "I'm so sorry… 🥺", ask: 'Please forgive me… 🥺', end: 'I meant every word 🤍' },
  };

  const PLEAD = [
    ['Hey! Where did it go? 😳', 'Eh? It moved! 😮'],
    ['Please say yes… 🥺', 'I practised this for days 🥺', 'Pretty please? 🥹'],
    ["You're breaking my heart 😭", "I'm not crying, you're crying 😭", 'Just one little yes? 💔'],
    ['I can wait… forever 🥹', "I'll just stand here, holding this 🥺", 'Yes is right there! 👉'],
  ];

  // little footstep sounds while a bear runs
  function stepper(ms) { const id = setInterval(() => Sound.step(), 170); setTimeout(() => clearInterval(id), ms); }
  // a bear runs back and forth across some ground, cheering, then comes home
  async function wander(t, { min = -120, max = 120, rounds = 5, ms = 1100, pause = 400 } = {}) {
    for (let i = 0; i < rounds; i++) {
      stepper(ms);
      await t.slide(rand(min, max), ms);
      t.set({ act: 'cheer' });
      await sleep(pause);
    }
    stepper(900);
    await t.slide(0, 900, { then: 'dance' });
  }

  function bear(d, patch = {}) {
    const L = LOOK[d.o];
    const t = Teddy.make({ gender: d.sg, mood: L.mood, prop: L.prop, hat: !!L.hat, ...patch });
    t.onPet = () => { const [x, y] = center(t.svg); FX.hearts(x, y - 40, 8); Sound.squeak(); };
    return t;
  }
  // put a bear (or your GIF) into a scene's slot
  function mount(slot, name, thing, size) {
    const el = typeof slot === 'string' ? $(slot) : slot;
    el.textContent = '';
    if (size) {
      const k = innerWidth >= 1000 && innerHeight >= 760 ? 1.25 : 1; // a bit bigger on desktops
      el.style.setProperty('--ts', 'min(' + Math.round(size * k) + 'px, ' + (size * 0.135 * k).toFixed(1) + 'vh, 60vw)');
    }
    if (GIFS[name]) {
      const img = document.createElement('img');
      img.className = 'gif-slot'; img.src = GIFS[name]; img.alt = ''; img.loading = 'lazy';
      el.appendChild(img);
    } else {
      el.appendChild(thing.el);
    }
    return thing;
  }
  const HEART_SEAL = '<svg viewBox="0 0 24 22" width="26" height="24" aria-hidden="true"><path fill="#ff3d6e" d="M12 21C-4 10 3 0 8.5 0 10.5 0 12 1.5 12 3c0-1.5 1.5-3 3.5-3C21 0 28 10 12 21z"/></svg>';

  function startExperience(d, opts = {}) {
    const occ = OCCASIONS[d.o], L = LOOK[d.o];
    isPreview = !!opts.preview;
    document.body.dataset.theme = d.o;
    document.title = `${occ.emoji} A surprise for ${d.to}`;
    $('#experience').hidden = false;
    $('#muteBtn').hidden = false;
    FX.setPalette(occ.palette);
    Ambient.start(occ.ambient, occ.palette);

    if (isPreview) {
      document.body.classList.add('is-preview');
      $('#previewBar').hidden = false;
      if (opts.demo) {
        $('#pvLabel').textContent = '▶ Demo card';
        $('#pvClose').textContent = '✕ Close';
        $('#pvPay').textContent = 'Make my own →';
      }
      $('#pvClose').addEventListener('click', () => parent.postMessage({ type: 'wc-close' }, location.origin));
      $('#pvPay').addEventListener('click', () => parent.postMessage({ type: 'wc-pay' }, location.origin));
    }

    const muteBtn = $('#muteBtn');
    muteBtn.addEventListener('click', () => {
      const m = !AudioCore.muted;
      AudioCore.setMuted(m); Music.setMuted(m);
      muteBtn.textContent = m ? '🔇' : '🔊';
      muteBtn.classList.toggle('playing', !m && d.mu !== 'none');
      muteBtn.setAttribute('aria-label', m ? 'Unmute sound' : 'Mute sound');
    });

    const hello = mount('#m-intro', 'intro', bear(d, { prop: 'sign', text: L.sign, act: L.mood === 'sad' ? 'idle' : 'dance', pose: L.mood === 'sad' ? 'sit' : 'stand' }), 200);
    setTimeout(() => hello.say(L.hi, 3200), 1100);
    $('#introTitle').textContent = fill(occ.intro, d);
    $('#introSub').textContent = fill(occ.introSub, d);
    show('s-intro');

    $('#introBtn').addEventListener('click', () => {
      Sound.pop();
      if (d.mu !== 'none') { Music.play(d.mu, d.mv); muteBtn.classList.add('playing'); }
      showWrap(d);
    }, { once: true });
  }

  function showWrap(d) {
    const occ = OCCASIONS[d.o];
    const el = occ.wrap === 'gift' ? $('#gift') : $('#envelope');
    el.hidden = false;
    $('#wrapHint').textContent = occ.wrap === 'gift' ? 'Tap the gift to open it 🎁' : 'Tap the envelope to open it 💌';
    if (occ.wrap === 'envelope') {
      $('#envLetter').textContent = fill(occ.letterTag || 'For {to}', d);
      $('#seal').innerHTML = HEART_SEAL;
    }
    show('s-wrap');

    const t = mount('#m-wrap', 'wrap', bear(d, { mood: 'happy', prop: 'none', hat: d.o === 'birthday', act: 'idle' }), 150);
    t.place(-(Math.min(innerWidth, 560) + 60));
    const nudges = ['Open it! Open it! ✨', 'Psst… tap it!', occ.wrap === 'gift' ? 'Ooh, what is it? 🎁' : 'A letter for you! 💌'];
    let n = 0, loop = null, opened = false;
    const nudge = () => t.say(nudges[n++ % nudges.length], 2800);
    setTimeout(async () => {
      stepper(1800);
      await t.slide(0, 1800);
      if (opened) return;
      t.set({ mood: 'wow', act: 'jump' });
      nudge();
      loop = setInterval(nudge, 4600);
    }, 500);

    el.addEventListener('click', async () => {
      opened = true;
      clearInterval(loop);
      t.set({ mood: 'joy', act: 'cheer' }).say('Yay! 🎉', 1800);
      el.classList.add('open');
      $('#wrapHint').style.visibility = 'hidden';
      Sound.chime();
      const [x, y] = center(el);
      await sleep(350);
      if (isLove(d.o)) FX.hearts(x, y - 40, 24);
      else FX.confetti(x, y - 40, 70);
      await sleep(1700); // let the burst settle before the letter appears
      showMessage(d);
    }, { once: true });
  }

  const STAMP = { birthday: 'balloon', valentine: 'heart', proposal: 'heart', anniversary: 'heart', congrats: 'star', thanks: 'flower', sorry: 'heart' };

  // where the pen is right now (screen coordinates)
  function caretXY(p) {
    const n = p.lastChild;
    if (n && n.nodeType === 3) {
      const r = document.createRange();
      r.setStart(n, n.length); r.setEnd(n, n.length);
      const rects = r.getClientRects();
      if (rects.length) { const q = rects[rects.length - 1]; return [q.right, q.top + q.height / 2]; }
    }
    const q = p.getBoundingClientRect();
    return [q.left + 10, q.top + q.height / 2];
  }

  async function showMessage(d) {
    const occ = OCCASIONS[d.o], L = LOOK[d.o];
    const card = $('#letterCard'), linesEl = $('#lines'), cont = $('#continueBtn'), wax = $('#wax'), wrap = $('#letterWrap');
    $('#dear').textContent = `Dear ${d.to},`;
    $('#sign').textContent = `${occ.signoff}\n${d.from}`;
    $('#waxLetter').textContent = (Array.from(d.from.trim())[0] || '♥').toUpperCase();
    $('#stampArt').innerHTML = shapeSvg(STAMP[d.o] || 'heart', occ.palette[1] || '#ff5c8a'); // static, trusted markup
    linesEl.textContent = '';
    wax.classList.remove('show');
    const peeker = mount('#m-msg', 'message', bear(d, { mood: d.o === 'sorry' ? 'sad' : 'happy', prop: 'none', hat: false, act: 'wave' }), 112);
    $('#m-msg').onclick = (e) => e.stopPropagation(); // petting the bear shouldn't skip the typing

    // the paper tilts toward the mouse and catches the light
    if (canHover && !reduceMotion) {
      wrap.onpointermove = (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((px - 0.5) * 12).toFixed(1) + 'deg');
        card.style.setProperty('--rx', ((py - 0.5) * -10).toFixed(1) + 'deg');
        card.style.setProperty('--gx', (px * 100).toFixed(0) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(0) + '%');
      };
      wrap.onpointerleave = () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); };
    }

    show('s-message');
    Sound.chime();
    await sleep(1300);

    let skip = false;
    const onSkip = () => { skip = true; };
    card.addEventListener('click', onSkip);

    const lines = d.msg.split(/\n+/).map((t) => t.trim()).filter(Boolean);
    for (const line of lines) {
      const p = document.createElement('p');
      p.className = 'typing';
      linesEl.appendChild(p);
      if (skip) { p.textContent = line; p.className = ''; continue; }
      let n = 0;
      for (const ch of line) {
        if (skip) { p.textContent = line; break; }
        p.textContent += ch;
        if (ch !== ' ' || n % 2 === 0) Sound.key(ch);
        if (++n % 2 === 0) { const [x, y] = caretXY(p); FX.trail(x, y + 6); }
        await sleep(/[.,!?…]/.test(ch) ? 170 : rand(24, 52));
      }
      p.className = '';
      if (!skip) {
        const [x, y] = caretXY(p);
        FX.sparkle(x, y, 10);
        Sound.bell();
        await sleep(430);
      }
    }
    card.removeEventListener('click', onSkip);
    $('#skipHint').style.opacity = '0';
    $('#sign').classList.add('show');
    await sleep(650);
    // the wax seal stamps the letter shut
    wax.classList.add('show');
    Sound.thud();
    const [wx, wy] = center(wax);
    if (isLove(d.o)) FX.hearts(wx, wy, 16); else FX.confetti(wx, wy, 26);
    peeker.set({ mood: d.o === 'sorry' ? 'shy' : 'love', act: 'idle' }).say(L.end, 3000);
    await sleep(700);
    cont.classList.add('show');
    cont.addEventListener('click', () => {
      Sound.pop();
      if (d.photos.length) showPhotos(d); else showFinale(d);
    }, { once: true });
  }

  // Photos: a scroll-driven gallery. Each polaroid develops as it scrolls into view.
  function showPhotos(d) {
    const occ = OCCASIONS[d.o];
    const scene = $('#s-photos'), wrap = $('#polaroids'), btn = $('#photosBtn');
    $('#photosTitle').textContent = occ.photosTitle;
    wrap.textContent = '';
    scene.querySelector('.scroll-cue')?.remove();
    const t = mount('#m-photos', 'photos', bear(d, { mood: 'happy', prop: 'frame', hat: false, act: 'idle' }), 130);
    setTimeout(() => t.say(d.photos.length > 1 ? 'Look at these! Scroll down ↓' : 'Look at this one! 🥹', 3200), 900);

    const figs = d.photos.map((src, i) => {
      const fig = document.createElement('figure');
      fig.className = 'polaroid';
      fig.style.setProperty('--r', [-5, 4, -3, 5, -4][i % 5] + 'deg');
      const img = document.createElement('img');
      img.src = src; img.alt = d.caps[i] || `Photo ${i + 1}`;
      const cap = document.createElement('figcaption');
      cap.textContent = d.caps[i] || '';
      fig.append(img, cap);
      fig.addEventListener('click', () => {
        const [x, y] = center(fig);
        if (isLove(d.o)) FX.hearts(x, y, 22); else FX.confetti(x, y, 50);
        Sound.pop();
        $$('.polaroid.lifted').forEach((p) => { if (p !== fig) p.classList.remove('lifted'); });
        fig.classList.toggle('lifted');
      });
      wrap.appendChild(fig);
      return fig;
    });
    if (figs.length > 1) {
      const cue = document.createElement('p');
      cue.className = 'scroll-cue'; cue.textContent = 'scroll ↓';
      wrap.before(cue);
    }
    show('s-photos');

    let revealed = 0, done = false;
    const finish = () => {
      if (done) return; done = true;
      scene.querySelector('.scroll-cue')?.remove();
      btn.classList.add('show');
      t.set({ mood: isLove(d.o) ? 'love' : 'joy' }).say('Ready for the next bit? →', 2800);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('in'); io.unobserve(en.target);
          if (++revealed === figs.length) setTimeout(finish, 900);
        });
      }, { root: scene, threshold: 0.2 });
      figs.forEach((f) => io.observe(f));
      setTimeout(finish, 20000); // never leave anyone stuck
    } else {
      figs.forEach((f) => f.classList.add('in'));
      setTimeout(finish, 1200);
    }
    btn.addEventListener('click', () => { Sound.pop(); showFinale(d); }, { once: true });
  }

  function showFinale(d) {
    const occ = OCCASIONS[d.o];
    show('s-finale');
    if (occ.finale === 'cake') finaleCake(d);
    else if (occ.finale === 'question') finaleQuestion(d);
    else finaleCelebrate(d);
  }

  function finaleCake(d) {
    const occ = OCCASIONS[d.o];
    $('#f-cake').hidden = false;
    const cake = $('#cake');
    const t = mount('#m-cake', 'cake', bear(d, { mood: 'party', prop: 'none', hat: true, act: 'jump' }), 140);
    setTimeout(() => t.say('Make a wish! 🎂', 3200), 700);
    cake.addEventListener('click', async () => {
      Sound.blow();
      t.set({ mood: 'wow', act: 'idle' });
      for (const c of $$('.candle')) { c.classList.add('out'); await sleep(170); }
      $('#cakeHint').textContent = 'Wish made ✨';
      $('#f-cake').classList.add('done'); // shrink the cake so the bear and the ending both fit
      t.set({ mood: 'joy', act: 'cheer' }).say('Happy Birthday! 🥳', 4000);
      const room = Math.min(130, Math.max(40, (innerWidth - 160) / 2));
      setTimeout(() => wander(t, { min: -room, max: room, rounds: 5 }), 700);
      await sleep(500);
      Music.duck(Sound.birthday() + 600); // pause the background music while the song plays
      const [x, y] = center(cake);
      FX.confetti(x, y - 80, 170);
      FX.rain(4000);
      setTimeout(() => FX.fireworks(3500), 900);
      revealEnd(d, fill(occ.title, d), fill(occ.closing, d), fill(occ.reply, d));
    }, { once: true });
  }

  function finaleQuestion(d) {
    const occ = OCCASIONS[d.o], L = LOOK[d.o];
    const sorry = d.o === 'sorry';
    $('#f-question').hidden = false;
    $('#qText').textContent = d.q;

    // the stage: HER teddy waits, HIS teddy runs in from the side with a rose (flowers when sorry)
    const stage = $('#stage');
    stage.textContent = '';
    const ground = document.createElement('div'); ground.className = 'stage-ground';
    const him = Teddy.make({ gender: d.sg, mood: sorry ? 'sad' : 'happy', prop: sorry ? 'flower' : 'rose' });
    const her = Teddy.make({ gender: d.rg, mood: 'shy', prop: 'none' });
    him.el.classList.add('him'); her.el.classList.add('her');
    [him, her].forEach((t) => { t.onPet = () => { const [x, y] = center(t.svg); FX.hearts(x, y - 30, 8); Sound.squeak(); }; });
    stage.append(ground);
    if (GIFS.question) {
      const img = document.createElement('img');
      img.className = 'gif-slot'; img.src = GIFS.question; img.alt = ''; img.style.margin = '0 auto';
      stage.appendChild(img);
    } else {
      stage.append(her.el, him.el);
    }
    him.place(-(Math.min(innerWidth, 600) + 80));
    const runMs = sorry ? 3200 : 2300;
    setTimeout(async () => {
      stepper(runMs);
      await him.slide(0, runMs, { gait: sorry ? 'walk' : 'run' });
      if (sorry) Sound.sad(); else Sound.chime();
      him.say(L.ask || 'Hi…', 3200);
      setTimeout(() => her.say(sorry ? 'Oh… 🥺' : 'Oh! 😳', 2200), 900);
    }, 500);

    const yes = $('#yesBtn'), no = $('#noBtn');
    const HER = [["Wait… 😳", "Hey, where'd it go?"], ["Oh no, they look so sad… 🥺", 'Hmm… 😟'], ["I can't watch this 😢", 'Look at them… 💔'], ['Just say yes already! 😭', 'Poor thing… 💔']];
    let count = 0, lastDodge = 0, stageIdx = 0, herBase = 'shy';

    // The "No" button never gives up, and the heartbreak gets worse every time it runs.
    function dodge() {
      const now = performance.now();
      if (now - lastDodge < 180) return;
      lastDodge = now;
      count++;
      Sound.boing();
      yes.style.transform = `scale(${Math.min(1 + count * 0.1, 1.7)})`;
      no.textContent = NO_LINES[((count - 1) % (NO_LINES.length - 1)) + 1];
      no.style.transform = `scale(${Math.max(1 - count * 0.03, 0.8)}) rotate(${rand(-8, 8)}deg)`;
      if (NO_HINTS[count]) $('#qHint').textContent = NO_HINTS[count];

      const st = count <= 2 ? 0 : count <= 5 ? 1 : count <= 9 ? 2 : 3;
      if (st !== stageIdx) { stageIdx = st; if (st === 1) Sound.sad(); if (st === 2) Sound.crack(); }
      if (st === 0) { him.set({ mood: 'wow' }); herBase = 'wow'; }
      else if (st === 1) { him.set({ mood: 'sad' }); herBase = 'shy'; }
      else { him.set({ mood: 'cry', pose: 'sit', broken: true, prop: sorry ? 'flower' : 'rosehold' }); herBase = 'sad'; }
      her.set({ mood: herBase });
      him.say(pick(PLEAD[st]), 2300);
      setTimeout(() => her.say(pick(HER[st]), 2000), 700);

      if (!no.classList.contains('floating')) {
        const r = no.getBoundingClientRect();
        document.body.appendChild(no);
        no.classList.add('floating');
        no.style.left = r.left + 'px'; no.style.top = r.top + 'px';
        no.getBoundingClientRect(); // flush so the jump animates
      }
      const nr = no.getBoundingClientRect(), yr = yes.getBoundingClientRect(), pad = 16;
      const maxX = Math.max(pad, innerWidth - nr.width - pad), maxY = Math.max(pad + 60, innerHeight - nr.height - pad);
      let x, y, tries = 0;
      do {
        x = rand(pad, maxX); y = rand(pad + 60, maxY); tries++;
      } while (tries < 30 && (
        (x < yr.right + 24 && x + nr.width > yr.left - 24 && y < yr.bottom + 24 && y + nr.height > yr.top - 24) ||
        Math.hypot(x - nr.left, y - nr.top) < 140 // make it jump a decent distance
      ));
      no.style.left = x + 'px'; no.style.top = y + 'px';
    }

    // Mouse: flee as soon as the cursor gets close.
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = no.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) < 45) dodge();
    };
    document.addEventListener('pointermove', onMove);
    // Touch: escape the moment a finger lands on it.
    no.addEventListener('pointerdown', (e) => { e.preventDefault(); dodge(); });
    // Keyboard (Enter/Space) also just makes it run.
    no.addEventListener('click', (e) => { e.preventDefault(); if (e.detail === 0) dodge(); });
    addEventListener('resize', () => { if (no.isConnected && no.classList.contains('floating')) dodge(); });

    // Her teddy lights up when you go for Yes
    yes.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { her.set({ mood: 'love' }); him.say('Yes? YES?! 🥺', 1500); } });
    yes.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') her.set({ mood: herBase }); });

    yes.addEventListener('click', () => {
      document.removeEventListener('pointermove', onMove);
      no.remove();
      $('#qText').hidden = true; $('#qHint').hidden = true; $('#f-question .q-btns').hidden = true;
      // the rose changes hands, everyone is happy
      him.set({ mood: 'joy', pose: 'stand', broken: false, prop: 'none', hug: false, act: 'cheer' });
      her.set({ mood: 'love', prop: sorry ? 'flower' : 'rosehold', act: 'cheer' });
      Sound.love();
      him.say(sorry ? 'Thank you!! 🥹' : 'YES!! 🎉', 3200);
      setTimeout(() => her.say(sorry ? 'I forgive you 🤍' : 'Of course! 🌹', 3200), 900);
      const y0 = innerHeight / 2.5;
      FX.hearts(innerWidth / 2, y0, 90);
      setTimeout(() => FX.hearts(innerWidth * 0.25, y0 + 60, 40), 300);
      setTimeout(() => FX.hearts(innerWidth * 0.75, y0 + 60, 40), 550);
      setTimeout(() => FX.fireworks(3000), 700);
      FX.heartRain(6000);

      // they run around the stage, then come together for a hug
      const bounds = (t) => ({ min: 4 - t.el.offsetLeft, max: stage.clientWidth - t.el.offsetLeft - t.el.offsetWidth - 4 });
      (async () => {
        await sleep(1400);
        for (let i = 0; i < 4; i++) {
          stepper(1000);
          await Promise.all([him, her].map((t) => { const b = bounds(t); return t.slide(rand(b.min, b.max), 1000, { then: 'cheer' }); }));
          await sleep(450);
        }
        stepper(1000);
        await Promise.all([him.slide(0, 1000), her.slide(0, 1000)]);
        him.set({ hug: true, mood: 'love', act: 'dance' }); her.set({ hug: true, mood: 'love', act: 'dance' });
        Sound.love();
        const [hx, hy] = center(stage);
        FX.hearts(hx, hy - 40, 40);
      })();
      revealEnd(d, fill(occ.yesTitle, d), fill(occ.yesSub, d), fill(occ.reply, d), { noScroll: true });
    }, { once: true });
  }

  function finaleCelebrate(d) {
    const occ = OCCASIONS[d.o];
    $('#f-celebrate').hidden = false;
    if (d.o === 'anniversary') {
      const pair = Teddy.pair({ a: { gender: d.sg }, b: { gender: d.rg } });
      pair.el.classList.toggle('small', !!d.photos.length);
      mount('#m-cel', 'yes', pair);
      setTimeout(() => pair.a.say('Happy anniversary! 💞', 3600), 600);
    } else {
      const t = mount('#m-cel', 'yes', bear(d, { mood: 'joy', hat: d.o === 'congrats', act: 'cheer' }), d.photos.length ? 150 : 200);
      setTimeout(() => t.say(LOOK[d.o].hi, 3600), 600);
      const room = Math.min(120, Math.max(30, (innerWidth - 220) / 2));
      if (d.o === 'congrats') setTimeout(() => wander(t, { min: -room, max: room, rounds: 5 }), 900);
      if (d.o === 'thanks') { t.set({ mood: 'happy', act: 'bow' }); setTimeout(() => t.set({ mood: 'joy', act: 'cheer' }), 2800); }
    }
    Sound.fanfare();
    FX.confetti(innerWidth / 2, innerHeight / 3, 160);
    FX.fireworks(5000);
    if (isLove(d.o)) FX.heartRain(4500); else FX.rain(3500);
    revealEnd(d, fill(occ.title, d), fill(occ.closing, d), fill(occ.reply, d));
  }

  function revealEnd(d, title, sub, reply, { noScroll = false } = {}) {
    const occ = OCCASIONS[d.o];
    if (d.photos.length) {
      const ph = $('#endPhoto');
      $('#endPhotoImg').src = d.photos[0];
      $('#endPhotoImg').alt = d.caps[0] || `${d.to} and ${d.from}`;
      ph.classList.toggle('heart', isLove(d.o));
      ph.hidden = false;
    }
    const t = $('#endTitle');
    t.textContent = '';
    let i = 0;
    title.split(' ').forEach((word, wi, arr) => {
      const w = document.createElement('span'); w.className = 'w';
      if (word.length > 11) w.style.whiteSpace = 'normal';
      for (const ch of word) {
        const s = document.createElement('span');
        s.className = 'ch'; s.textContent = ch; s.style.setProperty('--i', i++);
        w.appendChild(s);
      }
      t.appendChild(w);
      if (wi < arr.length - 1) t.appendChild(document.createTextNode(' '));
    });
    $('#endSub').textContent = sub;
    $('#endSign').textContent = `${occ.signoff}\n${d.from}`;
    const replyBtn = $('#replyBtn');
    replyBtn.textContent = `Reply to ${d.from} 💬`;
    replyBtn.href = 'https://wa.me/?text=' + encodeURIComponent(reply);
    replyBtn.hidden = isPreview;
    $('#makeBtn').hidden = isPreview;
    $('#replayBtn').onclick = () => location.reload();
    $('#finaleEnd').hidden = false;
    if (!noScroll) setTimeout(() => $('#finaleEnd').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 600);

    // Tap anywhere for more sparkle
    $('#s-finale').addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button, .mascot')) return;
      if (isLove(d.o)) FX.hearts(e.clientX, e.clientY, 30);
      else FX.firework(e.clientX, e.clientY);
      Sound.pop();
    });
  }

  /* ================= LOADING A PAID CARD ================= */
  function statusScreen(mood, title, sub, { retry = null, loading = false } = {}) {
    $('#experience').hidden = false;
    $('#muteBtn').hidden = true;
    $('#stSpin').hidden = !loading;
    $('#m-status').textContent = '';
    if (!loading) mount('#m-status', 'status', Teddy.make({ mood, prop: 'none', act: mood === 'cry' ? 'idle' : 'idle' }), 170);
    $('#stTitle').textContent = title;
    $('#stSub').textContent = sub;
    $('#stActions').hidden = loading;
    $('#stRetry').hidden = !retry;
    $('#stRetry').onclick = retry;
    show('s-status');
  }

  async function loadCard(id) {
    statusScreen('happy', 'Getting your surprise ready…', '', { loading: true });
    let r, j;
    try {
      r = await fetch(`/api/card?id=${encodeURIComponent(id)}`);
      j = await r.json().catch(() => ({}));
    } catch {
      return statusScreen('sad', "Couldn't connect", 'Check your internet connection and try again.', { retry: () => loadCard(id) });
    }
    if (r.status === 402) return statusScreen('shy', "This surprise isn't ready yet", "The sender hasn't finished setting it up. Ask them to check their link!", { retry: () => loadCard(id) });
    if (r.status === 404) return statusScreen('wow', "We couldn't find this card", 'Check that the link is complete and try again.');
    if (!r.ok || !j.data) return statusScreen('cry', 'Something went wrong', 'Please try again in a moment.', { retry: () => loadCard(id) });
    startExperience(normalize(j.data, { photos: j.photos, song: j.song }));
  }

  function waitForPreview() {
    let started = false;
    addEventListener('message', (e) => {
      if (started || e.source !== parent || e.origin !== location.origin || e.data?.type !== 'wc-preview') return;
      started = true;
      startExperience(normalize(e.data.data, { photos: e.data.photos, song: e.data.song }), { preview: true, demo: !!e.data.demo });
    });
    parent.postMessage({ type: 'wc-ready' }, location.origin);
  }

  /* ================= BOOT ================= */
  const cardPath = location.pathname.match(/^\/w\/([A-Za-z0-9]{6,16})\/?$/);
  const params = new URLSearchParams(location.search);
  if (cardPath) {
    loadCard(cardPath[1]);
  } else if (params.get('preview') === '1' && window.parent !== window) {
    waitForPreview();
  } else if (location.hash.startsWith('#w=')) {
    // Old free links that carried the whole card inside the URL
    try {
      const parts = location.hash.slice(3).split('.');
      const photos = parts.slice(1).map(unpackLegacyPhoto).filter(Boolean);
      startExperience(normalize(decodeLegacy(parts[0]), { photos }));
    } catch (err) {
      console.warn('Could not read this wish link', err);
      statusScreen('wow', "We couldn't open this card", 'The link looks incomplete.');
    }
  } else {
    startCreator();
  }
})();
