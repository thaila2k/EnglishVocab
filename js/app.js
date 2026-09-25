(function () {
  'use strict';

  const BASE_TOPICS = window.VOCAB.topics;
  const BASE_WORDS = window.VOCAB.words;
  const GROUPS = window.VOCAB.groups || [{ id: 'basic', name: 'Cơ bản', desc: '' }];
  // Người học: mỗi người có tiến độ, từ đánh dấu sao, từ tự thêm và cài đặt riêng.
  // Muốn đổi tên hoặc thêm người thì sửa danh sách này (id không dấu, không trùng; color là 1 hoặc 2).
  const USERS = [
    { id: 'ngoc-giau', name: 'Ngọc Giàu', color: 1 },
    { id: 'thai', name: 'Thái', color: 2 }
  ];
  const USER_KEY = 'sotu.user';
  const LEGACY_KEY = 'sotu.v1'; // dữ liệu từ trước khi có chức năng chọn người học
  const storeKey = (uid) => 'sotu.v1.' + uid;
  const MIN = 60 * 1000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  // ---------- Lưu trữ (localStorage, có dự phòng khi bị chặn) ----------
  function defaults() {
    return {
      srs: {},       // id -> { reps, interval (ngày), ease, lapses, due, last }
      stars: {},     // id -> true
      days: {},      // 'YYYY-MM-DD' -> số lượt học
      newDays: {},   // 'YYYY-MM-DD' -> số từ mới đã học
      custom: [],    // từ người dùng tự thêm
      settings: { accent: 'en-US', rate: 0.9, newPerDay: 10, goal: 20, autoSpeak: true, topicGroup: 'toeic' }
    };
  }

  function readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false; // Trình duyệt chặn bộ nhớ: dữ liệu chỉ giữ trong phiên này.
    }
  }

  function normalize(d) {
    const out = Object.assign(defaults(), d || {});
    out.settings = Object.assign(defaults().settings, out.settings || {});
    for (const key of ['srs', 'stars', 'days', 'newDays']) {
      if (!out[key] || typeof out[key] !== 'object') out[key] = {};
    }
    if (!Array.isArray(out.custom)) out.custom = [];
    return out;
  }

  // Bản sao trong bộ nhớ để đổi qua lại giữa các người học không mất tiến độ khi localStorage bị chặn.
  const memory = {};
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // Đọc dữ liệu của một người học mà không thay đổi gì (dùng cho màn hình chọn người học).
  function peekUser(uid) {
    const saved = readJSON(storeKey(uid));
    return normalize(saved || (memory[uid] ? clone(memory[uid]) : null));
  }

  function loadUser(uid) {
    if (readJSON(storeKey(uid)) || memory[uid]) return peekUser(uid);
    // Tiến độ cũ trên máy (trước khi có chức năng chọn người học) thuộc về người được chọn đầu tiên.
    const legacy = readJSON(LEGACY_KEY);
    if (legacy && writeJSON(storeKey(uid), legacy)) {
      try { localStorage.removeItem(LEGACY_KEY); } catch (e) { /* bỏ qua */ }
    }
    return normalize(legacy);
  }

  let user = USERS.find((u) => u.id === readJSON(USER_KEY)) || null;
  const data = user ? loadUser(user.id) : normalize(null);

  function save() {
    if (user) writeJSON(storeKey(user.id), data);
  }

  // ---------- Tiện ích ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const fold = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function dayKey(t) {
    const d = new Date(t == null ? Date.now() : t);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function fmtSpan(ms) {
    if (ms < HOUR) return Math.max(1, Math.round(ms / MIN)) + ' phút';
    if (ms < DAY) return Math.round(ms / HOUR) + ' giờ';
    const d = ms / DAY;
    if (d < 30) return Math.round(d) + ' ngày';
    if (d < 365) return Math.round(d / 30) + ' tháng';
    return Math.round(d / 36.5) / 10 + ' năm';
  }

  // Tô đậm từ (và các dạng biến đổi như -s, -ed, -ing) trong câu ví dụ.
  function highlight(sentence, word) {
    const safe = esc(sentence);
    let stem = String(word).toLowerCase().trim();
    if (!stem) return safe;
    if (stem.length > 4 && /[ey]$/.test(stem)) stem = stem.slice(0, -1);
    const re = new RegExp('\\b(' + esc(stem).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "[\\w'-]*)", 'i');
    return safe.replace(re, '<mark>$1</mark>');
  }

  const ICON = {
    speak: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.8 2.5 5.1 5.6.8-4 4 1 5.5-5.1-2.7-5 2.7 1-5.5-4.1-4 5.6-.8z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  // ---------- Từ vựng ----------
  const MY_TOPIC = { id: 'mine', en: 'My Words', vi: 'Từ của tôi', group: 'basic' };
  let wordIndex = null;

  const allWords = () => BASE_WORDS.concat(data.custom);
  const topicList = () => (data.custom.length ? BASE_TOPICS.concat(MY_TOPIC) : BASE_TOPICS);

  function byId(id) {
    if (!wordIndex) wordIndex = new Map(allWords().map((w) => [w.id, w]));
    return wordIndex.get(id);
  }

  // Chủ đề đặc biệt: 'all', 'starred', 'group:<id>' (cả một bộ, ví dụ group:toeic).
  function wordsIn(topic) {
    if (topic === 'all') return allWords();
    if (topic === 'starred') return allWords().filter((w) => data.stars[w.id]);
    if (topic.indexOf('group:') === 0) {
      const ids = new Set(topicList().filter((t) => t.group === topic.slice(6)).map((t) => t.id));
      return allWords().filter((w) => ids.has(w.topic));
    }
    return allWords().filter((w) => w.topic === topic);
  }

  function groupOf(id) {
    return GROUPS.find((g) => g.id === id) || GROUPS[0];
  }

  function topicName(id) {
    if (id === 'all') return 'Tất cả chủ đề';
    if (id === 'starred') return 'Từ đã đánh dấu sao';
    if (id.indexOf('group:') === 0) return 'Toàn bộ ' + groupOf(id.slice(6)).name;
    const t = topicList().find((x) => x.id === id);
    return t ? t.vi : id;
  }

  function topicOptions(selected) {
    const opt = (v, label) => `<option value="${esc(v)}"${v === selected ? ' selected' : ''}>${esc(label)}</option>`;
    let html = opt('all', 'Tất cả chủ đề');
    for (const g of GROUPS) {
      const ts = topicList().filter((t) => t.group === g.id);
      if (!ts.length) continue;
      html += `<optgroup label="${esc('Bộ ' + g.name)}">` +
        opt('group:' + g.id, 'Toàn bộ ' + g.name) +
        ts.map((t) => opt(t.id, t.vi + ' · ' + t.en)).join('') +
        '</optgroup>';
    }
    return html + opt('starred', 'Từ đã đánh dấu sao');
  }

  const STATUS_LABEL = { new: 'Chưa học', learning: 'Đang học', known: 'Đã nhớ' };
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const levelRank = (w) => (LEVELS.indexOf(w.level) + 1) || 3;

  function statusOf(id) {
    const c = data.srs[id];
    if (!c) return 'new';
    return c.interval >= 7 ? 'known' : 'learning';
  }

  // ---------- Lặp lại ngắt quãng (dựa trên SM-2, rút gọn) ----------
  // rating: 0 = Quên, 1 = Khó, 2 = Nhớ, 3 = Dễ
  function schedule(card, rating, now) {
    const c = card ? Object.assign({}, card) : { reps: 0, interval: 0, ease: 2.5, lapses: 0 };
    if (rating === 0) {
      c.reps = 0;
      c.interval = 0;
      c.lapses += 1;
      c.ease = Math.max(1.3, c.ease - 0.2);
      c.due = now + MIN;
    } else {
      let next;
      if (c.reps === 0) next = [0, 1, 2, 4][rating];
      else if (rating === 1) next = Math.max(1, c.interval * 1.2);
      else if (rating === 2) next = Math.max(c.interval + 1, c.interval * c.ease);
      else next = Math.max(c.interval + 2, c.interval * c.ease * 1.3);
      if (rating === 1) c.ease = Math.max(1.3, c.ease - 0.15);
      if (rating === 3) c.ease = Math.min(3.2, c.ease + 0.15);
      c.interval = Math.round(next * 10) / 10;
      c.reps += 1;
      c.due = now + c.interval * DAY;
    }
    c.last = now;
    return c;
  }

  function dueWords(pool, now) {
    return pool
      .filter((w) => data.srs[w.id] && data.srs[w.id].due <= now)
      .sort((a, b) => data.srs[a.id].due - data.srs[b.id].due);
  }

  function nextDueIn(now) {
    let min = Infinity;
    for (const id in data.srs) if (data.srs[id].due > now) min = Math.min(min, data.srs[id].due);
    return min === Infinity ? null : min - now;
  }

  const todayCount = () => data.days[dayKey()] || 0;
  const newLeftToday = () => Math.max(0, data.settings.newPerDay - (data.newDays[dayKey()] || 0));

  function logActivity() {
    const k = dayKey();
    data.days[k] = (data.days[k] || 0) + 1;
    if (data.days[k] === data.settings.goal) toast('Bạn đã đạt mục tiêu hôm nay. Giỏi lắm!');
  }

  function streak(days) {
    days = days || data.days;
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    if (!days[dayKey(d.getTime())]) d.setDate(d.getDate() - 1);
    let s = 0;
    while (days[dayKey(d.getTime())]) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }

  function wordOfDay() {
    let h = 7;
    for (const ch of dayKey()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return BASE_WORDS[h % BASE_WORDS.length];
  }

  // ---------- Phát âm (Web Speech API) ----------
  const speech = {
    ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    voices: [],
    init() {
      if (!this.ok) return;
      const loadVoices = () => { this.voices = window.speechSynthesis.getVoices() || []; };
      loadVoices();
      if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      else window.speechSynthesis.onvoiceschanged = loadVoices;
    },
    pick(lang) {
      const norm = (v) => (v.lang || '').replace('_', '-');
      const exact = this.voices.filter((v) => norm(v) === lang);
      return exact.find((v) => /Google|Natural|Samantha|Daniel|Aria|Jenny|Sonia|Libby/i.test(v.name)) ||
        exact[0] || this.voices.find((v) => norm(v).startsWith('en'));
    },
    say(text, btn, rate) {
      if (!text) return;
      if (!this.ok) {
        toast('Trình duyệt này chưa hỗ trợ đọc phát âm.');
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = data.settings.accent;
      const voice = this.pick(u.lang);
      if (voice) u.voice = voice;
      u.rate = rate || data.settings.rate;
      if (btn) {
        btn.classList.add('speaking');
        const off = () => btn.classList.remove('speaking');
        u.onend = off;
        u.onerror = off;
      }
      synth.speak(u);
    }
  };

  function speakButton(text, label, extraClass) {
    return `<button type="button" class="icon-btn${extraClass ? ' ' + extraClass : ''}" data-action="speak" data-text="${esc(text)}" aria-label="${esc(label || 'Nghe phát âm')}" title="Nghe phát âm">${ICON.speak}</button>`;
  }

  function starButton(w) {
    const on = !!data.stars[w.id];
    return `<button type="button" class="icon-btn star${on ? ' on' : ''}" data-action="star" data-id="${esc(w.id)}" aria-pressed="${on}" aria-label="Đánh dấu sao ${esc(w.word)}" title="Đánh dấu sao">${ICON.star}</button>`;
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
  }

  // Nút cần bấm hai lần để xác nhận (thay cho confirm()).
  const armed = { key: null, timer: null };
  function armOrFire(key, onArm, onFire) {
    if (armed.key === key) {
      clearTimeout(armed.timer);
      armed.key = null;
      onFire();
      return;
    }
    armed.key = key;
    onArm();
    clearTimeout(armed.timer);
    armed.timer = setTimeout(() => { armed.key = null; rerender(); }, 4000);
  }

  // ---------- Điều hướng ----------
  const VIEWS = ['today', 'learn', 'quiz', 'words', 'who'];
  let current = 'today';
  const RENDER = {};

  function show(view, opts) {
    opts = opts || {};
    if (VIEWS.indexOf(view) === -1) view = 'today';
    if (!user) view = 'who';
    current = view;
    for (const v of VIEWS) $('#view-' + v).hidden = v !== view;
    document.querySelectorAll('.tab').forEach((t) => {
      if (t.dataset.view === view) t.setAttribute('aria-current', 'page');
      else t.removeAttribute('aria-current');
    });
    renderTopbar();
    if (view === 'learn' && (!session || session.i >= session.queue.length) && !opts.keepSession) buildSession(learnTopic);
    RENDER[view](opts);
    if (!opts.keepScroll) window.scrollTo(0, 0);
    try {
      if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
    } catch (e) { /* không đổi được URL: bỏ qua */ }
  }

  function rerender() {
    const focusId = document.activeElement && document.activeElement.id;
    RENDER[current]({ keepScroll: true });
    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) el.focus();
    }
  }

  // =====================================================================
  // HÔM NAY
  // =====================================================================
  let settingsOpen = false;

  RENDER.today = function () {
    const now = Date.now();
    const words = allWords();
    const due = dueWords(words, now).length;
    const freshTotal = words.filter((w) => !data.srs[w.id]).length;
    const newAvail = Math.min(newLeftToday(), freshTotal);
    const known = words.filter((w) => statusOf(w.id) === 'known').length;
    const learning = words.filter((w) => statusOf(w.id) === 'learning').length;
    const done = todayCount();
    const goal = data.settings.goal;
    const st = streak();
    const nextIn = nextDueIn(now);
    const hour = new Date().getHours();
    const greet = (hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối') + ', ' + user.name + '!';
    let dateStr = '';
    try {
      dateStr = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
      dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    } catch (e) { dateStr = dayKey(); }

    const lede = due + newAvail > 0
      ? `Hôm nay có <b>${due} thẻ</b> cần ôn và <b>${newAvail} từ mới</b> đang chờ bạn.`
      : 'Bạn đã học xong phần của hôm nay. Muốn luyện thêm thì làm một bài kiểm tra nhanh nhé.';

    const w = wordOfDay();
    const hasTopics = (g) => topicList().some((t) => t.group === g.id);
    let group = groupOf(data.settings.topicGroup);
    if (!hasTopics(group)) group = GROUPS.find(hasTopics) || GROUPS[0];
    const groupTopics = topicList().filter((t) => t.group === group.id);
    const goalPct = Math.min(100, Math.round((done / goal) * 100));

    $('#view-today').innerHTML = `
      <div class="stack">
        <div class="hello">
          <p class="eyebrow">${esc(dateStr)}</p>
          <h1 id="today-title">${esc(greet)}</h1>
          <p class="lede">${lede}</p>
        </div>

        <div class="tiles">
          <div class="tile">
            <span class="tile-label">Chuỗi ngày học</span>
            <span class="tile-value">${st}<small>ngày</small></span>
            <span class="tile-sub">${done > 0 ? 'Hôm nay đã học' : st > 0 ? 'Học hôm nay để giữ chuỗi' : 'Bắt đầu chuỗi mới hôm nay'}</span>
          </div>
          <div class="tile">
            <span class="tile-label">Cần ôn bây giờ</span>
            <span class="tile-value">${due}<small>thẻ</small></span>
            <span class="tile-sub">${due > 0 ? 'Ôn ngay để không quên' : nextIn != null ? 'Thẻ kế tiếp sau ' + fmtSpan(nextIn) : 'Chưa có thẻ nào đến hạn'}</span>
          </div>
          <div class="tile">
            <span class="tile-label">Đã nhớ</span>
            <span class="tile-value">${known}<small>/ ${words.length}</small></span>
            <span class="tile-sub">${learning} từ đang học</span>
          </div>
          <div class="tile">
            <span class="tile-label">Mục tiêu hôm nay</span>
            <span class="tile-value">${done}<small>/ ${goal} lượt</small></span>
            <div class="meter${done >= goal ? ' done' : ''}" role="progressbar" aria-label="Tiến độ mục tiêu hôm nay" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(done, goal)}"><i style="width:${goalPct}%"></i></div>
            <span class="tile-sub">${done >= goal ? 'Đã hoàn thành' : 'Còn ' + (goal - done) + ' lượt nữa'}</span>
          </div>
        </div>

        <div class="today-grid">
          <article class="feature">
            <div class="hello">
              <p class="eyebrow">Phiên học hôm nay</p>
              <h2>Ôn đúng lúc sắp quên</h2>
              <p>Từ bạn nhớ tốt sẽ quay lại sau nhiều ngày, từ hay quên sẽ gặp lại sớm hơn. Mỗi ngày khoảng 10 phút là đủ.</p>
            </div>
            <div class="feature-counts">
              <div><b>${due}</b><span>thẻ cần ôn</span></div>
              <div><b>${newAvail}</b><span>từ mới hôm nay</span></div>
            </div>
            <div class="feature-actions">
              <button type="button" class="btn btn-marker" data-action="study" data-topic="all">${due + newAvail > 0 ? 'Bắt đầu học' : 'Ôn luyện thêm'} ${ICON.arrow}</button>
              <button type="button" class="btn btn-quiet" data-action="go" data-view="quiz">Kiểm tra nhanh</button>
            </div>
          </article>

          <article class="entry" aria-label="Từ của ngày">
            <div class="entry-top"><p class="eyebrow">Từ của ngày</p><span class="lvl" title="Trình độ CEFR">${esc(w.level)}</span></div>
            <div class="entry-word"><h3><span class="hl">${esc(w.word)}</span></h3><span class="pos">${esc(w.pos)}</span></div>
            <p class="ipa entry-line">${esc(w.ipa)}</p>
            <p class="entry-vi">${esc(w.vi)}</p>
            <p class="entry-ex">${highlight(w.ex, w.word)}</p>
            <p class="entry-exvi">${esc(w.exVi)}</p>
            <div class="entry-actions">
              ${speakButton(w.word, 'Nghe phát âm ' + w.word)}
              <button type="button" class="btn btn-ghost btn-sm" data-action="speak" data-text="${esc(w.ex)}">Nghe câu ví dụ</button>
              ${starButton(w)}
            </div>
          </article>
        </div>

        <div class="section-head">
          <div class="hello">
            <h2>Chủ đề</h2>
            <p class="lede">${esc(group.desc)}</p>
          </div>
          <div class="chips" role="group" aria-label="Chọn bộ từ">
            ${GROUPS.map((g) => {
              const n = wordsIn('group:' + g.id).length;
              return n ? `<button type="button" class="chip" data-action="group" data-group="${g.id}" aria-pressed="${g.id === group.id}">Bộ ${esc(g.name)}<span class="n">${n} từ</span></button>` : '';
            }).join('')}
          </div>
        </div>
        <div class="group-bar">
          <div class="legend" aria-hidden="true">
            <span><i class="sw-known"></i>Đã nhớ</span>
            <span><i class="sw-learning"></i>Đang học</span>
            <span><i class="sw-new"></i>Chưa học</span>
          </div>
          <div class="topic-actions">
            <button type="button" class="btn btn-primary btn-sm" data-action="study" data-topic="group:${group.id}">Học cả bộ ${esc(group.name)}</button>
            <button type="button" class="btn btn-ghost btn-sm" data-action="quiz-topic" data-topic="group:${group.id}">Kiểm tra cả bộ</button>
          </div>
        </div>
        <div class="topics">${groupTopics.map(topicCard).join('')}</div>

        <details class="settings" id="settings"${settingsOpen ? ' open' : ''}>
          <summary>Cài đặt học tập</summary>
          <div class="settings-body">
            <label class="field"><span>Giọng đọc</span>
              <select id="set-accent" class="select">
                <option value="en-US"${data.settings.accent === 'en-US' ? ' selected' : ''}>Anh - Mỹ</option>
                <option value="en-GB"${data.settings.accent === 'en-GB' ? ' selected' : ''}>Anh - Anh</option>
              </select>
            </label>
            <label class="field"><span>Tốc độ đọc: <output id="rate-out">${data.settings.rate.toFixed(1)}×</output></span>
              <input id="set-rate" type="range" min="0.6" max="1.2" step="0.1" value="${data.settings.rate}">
            </label>
            <label class="field"><span>Từ mới mỗi ngày</span>
              <select id="set-new" class="select">${[5, 10, 15, 20, 30].map((n) => `<option value="${n}"${n === data.settings.newPerDay ? ' selected' : ''}>${n} từ</option>`).join('')}</select>
            </label>
            <label class="field"><span>Mục tiêu mỗi ngày</span>
              <select id="set-goal" class="select">${[10, 20, 30, 50].map((n) => `<option value="${n}"${n === data.settings.goal ? ' selected' : ''}>${n} lượt ôn</option>`).join('')}</select>
            </label>
            <label class="check"><input id="set-auto" type="checkbox"${data.settings.autoSpeak ? ' checked' : ''}> Tự đọc từ khi hiện thẻ</label>
            <div class="field"><span>Dữ liệu học</span>
              <button type="button" id="reset-btn" class="btn ${armed.key === 'reset' ? 'btn-danger' : 'btn-ghost'}" data-action="reset">${armed.key === 'reset' ? 'Bấm lần nữa để xoá' : 'Xoá tiến độ của ' + esc(user.name)}</button>
            </div>
          </div>
        </details>
      </div>`;

    $('#settings').addEventListener('toggle', (e) => { settingsOpen = e.target.open; });
  };

  function topicCard(t) {
    const ws = wordsIn(t.id);
    let k = 0;
    let l = 0;
    for (const w of ws) {
      const s = statusOf(w.id);
      if (s === 'known') k++;
      else if (s === 'learning') l++;
    }
    const n = ws.length - k - l;
    const segs = [['known', k, 'đã nhớ'], ['learning', l, 'đang học'], ['new', n, 'chưa học']]
      .filter((s) => s[1] > 0)
      .map((s) => `<i class="sw-${s[0]}" style="flex:${s[1]}" title="${s[1]} ${s[2]}"></i>`)
      .join('');
    return `
      <article class="topic">
        <div>
          <h3>${esc(t.en)}</h3>
          <p class="vi">${esc(t.vi)} · ${ws.length} từ</p>
        </div>
        <p class="sample">${esc(ws.slice(0, 4).map((w) => w.word).join(', '))}${ws.length > 4 ? '…' : ''}</p>
        <div class="seg" role="img" aria-label="${k} đã nhớ, ${l} đang học, ${n} chưa học">${segs}</div>
        <p class="seg-text">${k}/${ws.length} đã nhớ · ${l} đang học</p>
        <div class="topic-actions">
          <button type="button" class="btn btn-primary btn-sm" data-action="study" data-topic="${esc(t.id)}">Học</button>
          <button type="button" class="btn btn-ghost btn-sm" data-action="quiz-topic" data-topic="${esc(t.id)}">Kiểm tra</button>
        </div>
      </article>`;
  }

  // =====================================================================
  // THẺ TỪ (flashcards)
  // =====================================================================
  let learnTopic = 'all';
  let session = null;

  function buildSession(topic, opts) {
    opts = opts || {};
    const now = Date.now();
    const pool = wordsIn(topic);
    let ids;
    if (opts.ids) {
      ids = opts.ids.slice();
    } else if (opts.cram) {
      const studied = pool.filter((w) => data.srs[w.id]);
      ids = shuffle(studied.length >= 5 ? studied : pool).slice(0, 10).map((w) => w.id);
    } else {
      const due = dueWords(pool, now).slice(0, 60).map((w) => w.id);
      // Từ mới đi từ dễ đến khó: A1 trước, C1 sau.
      const fresh = pool.filter((w) => !data.srs[w.id]).sort((a, b) => levelRank(a) - levelRank(b));
      const nNew = opts.extraNew ? Math.min(10, fresh.length) : Math.min(newLeftToday(), fresh.length);
      ids = opts.extraNew ? fresh.slice(0, nNew).map((w) => w.id) : due.concat(fresh.slice(0, nNew).map((w) => w.id));
    }
    session = { topic, queue: ids, i: 0, reviewed: 0, again: 0, flipped: false, empty: pool.length === 0 };
  }

  function startStudy(topic, opts) {
    learnTopic = topic;
    buildSession(topic, opts);
    show('learn', { keepSession: true });
    speakCurrentIfAuto();
  }

  function currentCard() {
    return session && session.i < session.queue.length ? byId(session.queue[session.i]) : null;
  }

  function speakCurrentIfAuto() {
    const w = currentCard();
    if (w && data.settings.autoSpeak && current === 'learn') speech.say(w.word);
  }

  function cardTop(w, st) {
    return `<div class="face-top">
      <div class="left"><span class="pos">${esc(w.pos)}</span>${w.level ? `<span class="lvl" title="Trình độ CEFR">${esc(w.level)}</span>` : ''}</div>
      <span class="status s-${st}">${STATUS_LABEL[st]}</span>
    </div>`;
  }

  function learnControls(w) {
    if (!session.flipped) {
      return `<div class="flip-row"><button type="button" class="btn btn-primary" data-action="flip">Xem nghĩa</button></div>`;
    }
    const now = Date.now();
    const card = data.srs[w.id];
    const labels = [['r-again', 'Quên'], ['r-hard', 'Khó'], ['r-good', 'Nhớ'], ['r-easy', 'Dễ']];
    return `<div class="rate" role="group" aria-label="Bạn nhớ từ này đến đâu?">
      ${labels.map((l, r) => `<button type="button" class="${l[0]}" data-action="rate" data-r="${r}"><kbd>${r + 1}</kbd>${l[1]}<small>${fmtSpan(schedule(card, r, now).due - now)}</small></button>`).join('')}
    </div>`;
  }

  RENDER.learn = function () {
    const el = $('#view-learn');
    if (!session) buildSession(learnTopic);
    const total = session.queue.length;
    const bar = `
      <div class="learn-bar">
        <label class="field"><span>Chủ đề</span><select id="learn-topic" class="select">${topicOptions(learnTopic)}</select></label>
        <p class="learn-count">${total ? `Thẻ <b>${Math.min(session.i + 1, total)}</b> / ${total}` : ''}</p>
      </div>
      <div class="progress" aria-hidden="true"><i style="width:${total ? Math.round((session.i / total) * 100) : 0}%"></i></div>`;

    const w = currentCard();
    if (!w) {
      el.innerHTML = `<div class="learn">${bar}${learnDonePanel()}</div>`;
      return;
    }

    const st = statusOf(w.id);
    const f = session.flipped;
    el.innerHTML = `
      <div class="learn">
        ${bar}
        <div class="card-stage">
          <div class="flashcard${f ? ' flipped' : ''}" id="flashcard" data-action="flip">
            <div class="face front"${f ? ' inert' : ''}>
              ${cardTop(w, st)}
              <h2 class="headword"><span class="hl">${esc(w.word)}</span></h2>
              ${w.ipa ? `<p class="ipa">${esc(w.ipa)}</p>` : ''}
              ${speakButton(w.word, 'Nghe phát âm ' + w.word, 'lg')}
              <p class="face-hint">Nhớ nghĩa trong đầu rồi chạm vào thẻ để lật</p>
            </div>
            <div class="face back"${f ? '' : ' inert'}>
              ${cardTop(w, st)}
              <p class="back-word"><span>${esc(w.word)}</span>${w.ipa ? `<span class="ipa">${esc(w.ipa)}</span>` : ''}</p>
              <p class="meaning">${esc(w.vi)}</p>
              ${w.ex ? `<p class="entry-ex">${highlight(w.ex, w.word)}</p>` : ''}
              ${w.exVi ? `<p class="entry-exvi">${esc(w.exVi)}</p>` : ''}
              ${w.ex ? `<button type="button" class="btn btn-ghost btn-sm" data-action="speak" data-text="${esc(w.ex)}">${ICON.speak} Nghe câu ví dụ</button>` : ''}
            </div>
          </div>
        </div>
        <div id="learn-controls">${learnControls(w)}</div>
        <p class="kbd-hint"><kbd>Space</kbd> lật thẻ · <kbd>1</kbd>–<kbd>4</kbd> chọn mức nhớ · <kbd>S</kbd> nghe lại</p>
      </div>`;
  };

  function learnDonePanel() {
    const now = Date.now();
    const pool = wordsIn(learnTopic);
    const freshLeft = pool.filter((w) => !data.srs[w.id]).length;
    const nextIn = nextDueIn(now);
    const name = topicName(learnTopic);
    let title;
    let body;
    if (session.empty) {
      title = learnTopic === 'starred' ? 'Chưa có từ nào được đánh dấu sao' : 'Chủ đề này chưa có từ nào';
      body = learnTopic === 'starred'
        ? 'Bấm vào ngôi sao cạnh một từ trong Sổ từ để gom những từ khó vào đây.'
        : 'Hãy thêm từ trong mục Sổ từ.';
    } else if (session.reviewed > 0) {
      title = 'Xong phiên học!';
      body = `Bạn vừa ôn ${session.reviewed} lượt thẻ trong “${esc(name)}”` +
        (session.again ? `, trong đó ${session.again} lần cần học lại.` : ' mà không quên thẻ nào.') +
        (nextIn != null ? ` Thẻ kế tiếp đến hạn sau ${fmtSpan(nextIn)}.` : '');
    } else {
      title = 'Chưa có thẻ nào đến hạn';
      body = `“${esc(name)}” không còn thẻ cần ôn` +
        (newLeftToday() === 0 && freshLeft > 0 ? ' và bạn đã học đủ số từ mới hôm nay.' : '.') +
        (nextIn != null ? ` Thẻ kế tiếp đến hạn sau ${fmtSpan(nextIn)}.` : '');
    }
    const actions = [];
    if (!session.empty) {
      if (freshLeft > 0) actions.push(`<button type="button" class="btn btn-primary" data-action="study-more">Học thêm ${Math.min(10, freshLeft)} từ mới</button>`);
      actions.push(`<button type="button" class="btn ${freshLeft > 0 ? 'btn-ghost' : 'btn-primary'}" data-action="cram">Ôn tự do 10 thẻ</button>`);
      actions.push(`<button type="button" class="btn btn-ghost" data-action="quiz-topic" data-topic="${esc(learnTopic)}">Làm bài kiểm tra</button>`);
    } else {
      actions.push(`<button type="button" class="btn btn-primary" data-action="go" data-view="words">Mở Sổ từ</button>`);
    }
    return `<div class="panel">
      <p class="eyebrow">${esc(name)}</p>
      <h2>${title}</h2>
      <p>${body}</p>
      <div class="actions">${actions.join('')}</div>
    </div>`;
  }

  function flip() {
    const w = currentCard();
    if (!w) return;
    session.flipped = !session.flipped;
    const card = $('#flashcard');
    card.classList.toggle('flipped', session.flipped);
    card.querySelector('.front').inert = session.flipped;
    card.querySelector('.back').inert = !session.flipped;
    $('#learn-controls').innerHTML = learnControls(w);
  }

  function rate(r) {
    const w = currentCard();
    if (!w || !session.flipped) return;
    const now = Date.now();
    if (!data.srs[w.id]) {
      const k = dayKey();
      data.newDays[k] = (data.newDays[k] || 0) + 1;
    }
    data.srs[w.id] = schedule(data.srs[w.id], r, now);
    session.reviewed++;
    if (r === 0) {
      session.again++;
      session.queue.splice(Math.min(session.queue.length, session.i + 4), 0, w.id);
    }
    session.i++;
    session.flipped = false;
    logActivity();
    save();
    RENDER.learn();
    speakCurrentIfAuto();
  }

  // =====================================================================
  // LUYỆN TẬP (quiz)
  // =====================================================================
  const QTYPES = [
    { id: 'en-vi', name: 'Chọn nghĩa', desc: 'Xem từ tiếng Anh, chọn nghĩa tiếng Việt đúng.', eg: 'luggage → hành lý' },
    { id: 'vi-en', name: 'Chọn từ', desc: 'Xem nghĩa tiếng Việt, chọn từ tiếng Anh đúng.', eg: 'hộ chiếu → passport' },
    { id: 'listen', name: 'Nghe và chọn', desc: 'Nghe phát âm rồi chọn từ bạn vừa nghe.', eg: '/ˌsuːvəˈnɪr/ → souvenir' },
    { id: 'spell', name: 'Gõ chính tả', desc: 'Xem nghĩa, tự gõ lại từ tiếng Anh.', eg: 'đồng nghiệp → colleague' }
  ];
  const quizCfg = { type: 'en-vi', topic: 'all', count: 10 };
  let quiz = null;

  function makeOptions(w, pool, type) {
    const key = type === 'en-vi' ? 'vi' : 'word';
    const seen = new Set([fold(w[key])]);
    const picks = [];
    for (const c of shuffle(pool).concat(shuffle(allWords()))) {
      if (picks.length === 3) break;
      const v = fold(c[key]);
      if (c.id === w.id || seen.has(v)) continue;
      seen.add(v);
      picks.push(c.id);
    }
    return shuffle([w.id].concat(picks));
  }

  function buildQuiz(cfg, onlyIds) {
    const pool = onlyIds ? onlyIds.map(byId).filter(Boolean) : wordsIn(cfg.topic);
    if (!pool.length) return false;
    const picked = shuffle(pool).slice(0, cfg.count);
    const distractPool = wordsIn(cfg.topic).length >= 4 ? wordsIn(cfg.topic) : allWords();
    quiz = {
      type: cfg.type,
      topic: cfg.topic,
      qs: picked.map((w) => ({ id: w.id, opts: cfg.type === 'spell' ? null : makeOptions(w, distractPool, cfg.type) })),
      i: 0,
      answered: null,
      score: 0,
      misses: []
    };
    return true;
  }

  function startQuiz(cfg, onlyIds) {
    if (!buildQuiz(cfg, onlyIds)) {
      toast(cfg.topic === 'starred' ? 'Bạn chưa đánh dấu sao từ nào.' : 'Chủ đề này chưa có từ nào.');
      return;
    }
    RENDER.quiz();
    window.scrollTo(0, 0);
    onQuestionShown();
  }

  function onQuestionShown() {
    if (!quiz || quiz.i >= quiz.qs.length) return;
    const w = byId(quiz.qs[quiz.i].id);
    if (quiz.type === 'listen') speech.say(w.word);
    else if (quiz.type === 'en-vi' && data.settings.autoSpeak) speech.say(w.word);
    if (quiz.type === 'spell') {
      const input = $('#spell-input');
      if (input) input.focus();
    }
  }

  RENDER.quiz = function () {
    const el = $('#view-quiz');
    if (!quiz) {
      el.innerHTML = quizSetup();
      return;
    }
    if (quiz.i >= quiz.qs.length) {
      el.innerHTML = `<div class="quiz">${quizResults()}</div>`;
      return;
    }
    el.innerHTML = `<div class="quiz">${quizQuestion()}</div>`;
  };

  function quizSetup() {
    return `
      <div class="quiz">
        <div class="words-head">
          <div class="hello">
            <p class="eyebrow">Luyện tập</p>
            <h1>Kiểm tra nhanh</h1>
            <p class="lede">Chọn kiểu bài, chủ đề và số câu. Các từ trả lời sai sẽ được đưa lại vào hàng ôn tập.</p>
          </div>
        </div>
        <div class="quiz-types" role="radiogroup" aria-label="Kiểu bài">
          ${QTYPES.map((t) => {
            const off = t.id === 'listen' && !speech.ok;
            return `<div class="qtype">
              <input type="radio" name="qtype" id="qt-${t.id}" value="${t.id}"${quizCfg.type === t.id ? ' checked' : ''}${off ? ' disabled' : ''}>
              <label for="qt-${t.id}"><b>${t.name}</b><span>${off ? 'Trình duyệt này chưa hỗ trợ đọc phát âm.' : t.desc}</span><em>${esc(t.eg)}</em></label>
            </div>`;
          }).join('')}
        </div>
        <div class="quiz-opts">
          <label class="field"><span>Chủ đề</span><select id="quiz-topic" class="select">${topicOptions(quizCfg.topic)}</select></label>
          <label class="field"><span>Số câu</span>
            <select id="quiz-count" class="select">${[10, 20, 30].map((n) => `<option value="${n}"${n === quizCfg.count ? ' selected' : ''}>${n} câu</option>`).join('')}</select>
          </label>
          <button type="button" class="btn btn-primary" data-action="quiz-start">Bắt đầu ${ICON.arrow}</button>
        </div>
      </div>`;
  }

  function quizQuestion() {
    const q = quiz.qs[quiz.i];
    const w = byId(q.id);
    const a = quiz.answered;
    const typeName = QTYPES.find((t) => t.id === quiz.type).name;
    const total = quiz.qs.length;

    let prompt;
    if (quiz.type === 'en-vi') {
      prompt = `<p class="q-label">Từ này nghĩa là gì?</p>
        <h2 class="headword"><span class="hl">${esc(w.word)}</span></h2>
        <p><span class="ipa">${esc(w.ipa)}</span> <span class="pos">${esc(w.pos)}</span></p>
        ${speakButton(w.word)}`;
    } else if (quiz.type === 'vi-en') {
      prompt = `<p class="q-label">Từ tiếng Anh nào có nghĩa là</p>
        <p class="meaning">${esc(w.vi)}</p>
        <p class="pos">${esc(w.pos)}</p>`;
    } else if (quiz.type === 'listen') {
      prompt = `<p class="q-label">Nghe và chọn từ bạn vừa nghe</p>
        ${speakButton(w.word, 'Nghe lại', 'lg')}
        <button type="button" class="btn btn-ghost btn-sm" data-action="speak-slow" data-text="${esc(w.word)}">Nghe chậm</button>
        ${a ? `<p class="ipa">${esc(w.ipa)}</p>` : ''}`;
    } else {
      const firstLetter = w.word.charAt(0);
      const letters = w.word.replace(/[^a-zA-Z]/g, '').length;
      prompt = `<p class="q-label">Gõ từ tiếng Anh có nghĩa là</p>
        <p class="meaning">${esc(w.vi)}</p>
        <p class="muted"><span class="pos">${esc(w.pos)}</span> · ${letters} chữ cái · bắt đầu bằng “${esc(firstLetter)}”</p>
        <button type="button" class="btn btn-ghost btn-sm" data-action="speak" data-text="${esc(w.word)}">${ICON.speak} Nghe gợi ý</button>`;
    }

    let answerArea;
    if (quiz.type === 'spell') {
      const cls = a ? (a.ok ? ' ok' : ' no') : '';
      answerArea = `<form id="spell-form" class="spell-row" autocomplete="off">
        <input id="spell-input" class="input${cls}" type="text" aria-label="Gõ từ tiếng Anh" autocapitalize="off" autocorrect="off" spellcheck="false" value="${a ? esc(a.pick) : ''}"${a ? ' disabled' : ''}>
        ${a ? '' : '<button type="submit" class="btn btn-primary">Kiểm tra</button>'}
      </form>`;
    } else {
      const en = quiz.type !== 'en-vi';
      answerArea = `<div class="options">${q.opts.map((id, n) => {
        const o = byId(id);
        let cls = '';
        if (a) {
          if (id === q.id) cls = ' correct';
          else if (id === a.pick) cls = ' wrong';
          else cls = ' dim';
        }
        return `<button type="button" class="option${en ? ' en' : ''}${cls}" data-action="answer" data-id="${esc(id)}"${a ? ' disabled' : ''}><span class="k">${n + 1}</span><span>${esc(en ? o.word : o.vi)}</span></button>`;
      }).join('')}</div>`;
    }

    let feedback = '';
    if (a) {
      const detail = `${esc(w.word)} ${w.ipa ? esc(w.ipa) + ' ' : ''}= ${esc(w.vi)}`;
      feedback = `<div class="feedback ${a.ok ? 'ok' : 'no'}" role="status">
        <div class="msg">
          <b>${a.ok ? 'Chính xác!' : 'Chưa đúng. Đáp án: “' + esc(w.word) + '”'}</b>
          <span>${w.ex ? highlight(w.ex, w.word) : detail}</span>
        </div>
        <button type="button" class="btn btn-primary" id="next-btn" data-action="next">${quiz.i + 1 < total ? 'Câu tiếp theo' : 'Xem kết quả'} ${ICON.arrow}</button>
      </div>`;
    }

    return `
      <div class="learn-bar">
        <p class="learn-count">${esc(typeName)} · ${esc(topicName(quiz.topic))}<br>Câu <b>${quiz.i + 1}</b> / ${total} · Đúng <b>${quiz.score}</b></p>
        <button type="button" class="btn btn-ghost btn-sm" data-action="quiz-exit">Thoát bài</button>
      </div>
      <div class="progress" aria-hidden="true"><i style="width:${Math.round(((quiz.i + (a ? 1 : 0)) / total) * 100)}%"></i></div>
      <div class="prompt">${prompt}</div>
      ${answerArea}
      ${feedback}
      <p class="kbd-hint">${quiz.type === 'spell' ? '<kbd>Enter</kbd> kiểm tra / câu tiếp theo' : '<kbd>1</kbd>–<kbd>4</kbd> chọn đáp án · <kbd>Enter</kbd> câu tiếp theo'}</p>`;
  }

  function submitAnswer(ok, pick) {
    const q = quiz.qs[quiz.i];
    quiz.answered = { ok, pick };
    if (ok) {
      quiz.score++;
    } else {
      quiz.misses.push(q.id);
      if (data.srs[q.id]) data.srs[q.id].due = Date.now();
    }
    logActivity();
    save();
    RENDER.quiz();
    const next = $('#next-btn');
    if (next) next.focus({ preventScroll: true });
    if (!ok && quiz.type !== 'listen' && data.settings.autoSpeak) speech.say(byId(q.id).word);
  }

  function answerChoice(id) {
    if (!quiz || quiz.answered || quiz.type === 'spell') return;
    submitAnswer(id === quiz.qs[quiz.i].id, id);
  }

  function answerSpell(text) {
    if (!quiz || quiz.answered) return;
    const norm = (s) => String(s).trim().toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ');
    if (!norm(text)) {
      toast('Hãy gõ một từ trước khi kiểm tra.');
      return;
    }
    submitAnswer(norm(text) === norm(byId(quiz.qs[quiz.i].id).word), text.trim());
  }

  function nextQuestion() {
    if (!quiz || !quiz.answered) return;
    quiz.i++;
    quiz.answered = null;
    RENDER.quiz();
    onQuestionShown();
  }

  function quizResults() {
    const total = quiz.qs.length;
    const pct = Math.round((quiz.score / total) * 100);
    const typeName = QTYPES.find((t) => t.id === quiz.type).name;
    const title = pct === 100 ? 'Tuyệt đối, không sai câu nào!' : pct >= 80 ? 'Rất tốt!' : pct >= 50 ? 'Khá ổn, cố thêm chút nữa nhé' : 'Cần ôn thêm một chút';
    const misses = quiz.misses.map(byId).filter(Boolean);
    return `<div class="panel">
      <p class="eyebrow">Kết quả · ${esc(typeName)} · ${esc(topicName(quiz.topic))}</p>
      <p class="big-num">${quiz.score}<small>/${total}</small></p>
      <h2>${title}</h2>
      <p>${misses.length ? `Bạn đúng ${pct}% số câu. Những từ trả lời sai ở dưới đã được đưa lại vào hàng ôn tập.` : `Bạn đúng ${pct}% số câu.`}</p>
      ${misses.length ? `<ul class="miss-list">${misses.map((w) => `<li><b>${esc(w.word)}</b><span>${esc(w.vi)}</span></li>`).join('')}</ul>` : ''}
      <div class="actions">
        ${misses.length ? `<button type="button" class="btn btn-primary" data-action="quiz-retry">Làm lại ${misses.length} câu sai</button>
        <button type="button" class="btn btn-ghost" data-action="learn-miss">Ôn các từ sai bằng thẻ</button>` : ''}
        <button type="button" class="btn ${misses.length ? 'btn-ghost' : 'btn-primary'}" data-action="quiz-new">Làm bài mới</button>
      </div>
    </div>`;
  }

  // =====================================================================
  // SỔ TỪ
  // =====================================================================
  const PAGE = 100;
  const wf = { q: '', topic: 'all', level: 'all', status: 'all', adding: false, limit: PAGE };

  RENDER.words = function () {
    $('#view-words').innerHTML = `
      <div class="words">
        <div class="words-head">
          <div class="hello">
            <p class="eyebrow">Sổ từ</p>
            <h1>Tra và quản lý từ vựng</h1>
          </div>
          <button type="button" class="btn btn-ghost" data-action="toggle-add" aria-expanded="${wf.adding}">${ICON.plus} Thêm từ của bạn</button>
        </div>

        <form id="add-form" class="add-form"${wf.adding ? '' : ' hidden'} autocomplete="off">
          <label class="field"><span>Từ tiếng Anh *</span><input id="nw-word" class="input" required maxlength="60" placeholder="ví dụ: breathtaking"></label>
          <label class="field"><span>Nghĩa tiếng Việt *</span><input id="nw-vi" class="input" required maxlength="120" placeholder="ví dụ: đẹp ngoạn mục"></label>
          <label class="field"><span>Phiên âm (không bắt buộc)</span><input id="nw-ipa" class="input" maxlength="80" placeholder="/ˈbreθteɪkɪŋ/"></label>
          <label class="field"><span>Từ loại</span>
            <select id="nw-pos" class="select">
              <option value="n.">Danh từ (n.)</option>
              <option value="v.">Động từ (v.)</option>
              <option value="adj.">Tính từ (adj.)</option>
              <option value="adv.">Trạng từ (adv.)</option>
              <option value="phr.">Cụm từ (phr.)</option>
            </select>
          </label>
          <label class="field full"><span>Câu ví dụ</span><input id="nw-ex" class="input" maxlength="200" placeholder="The view from the top was breathtaking."></label>
          <label class="field full"><span>Dịch câu ví dụ</span><input id="nw-exvi" class="input" maxlength="200" placeholder="Khung cảnh từ trên đỉnh đẹp ngoạn mục."></label>
          <div class="actions full">
            <button type="button" class="btn btn-ghost" data-action="toggle-add">Huỷ</button>
            <button type="submit" class="btn btn-primary">Lưu vào Từ của tôi</button>
          </div>
        </form>

        <div class="toolbar">
          <div class="search">${ICON.search}<input id="words-q" class="input" type="search" placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt" value="${esc(wf.q)}" aria-label="Tìm từ"></div>
          <select id="words-topic" class="select" aria-label="Lọc theo chủ đề">${topicOptions(wf.topic)}</select>
          <select id="words-level" class="select level-select" aria-label="Lọc theo trình độ">
            <option value="all">Mọi trình độ</option>
            ${LEVELS.slice(0, 5).map((l) => `<option value="${l}"${wf.level === l ? ' selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="chips" id="words-chips" role="group" aria-label="Lọc theo trạng thái"></div>
        <p class="list-count" id="words-count"></p>
        <ul class="dict" id="words-list"></ul>
      </div>`;
    renderWordList();
  };

  function renderWordList() {
    const q = fold(wf.q.trim());
    const base = wordsIn(wf.topic).filter((w) =>
      (wf.level === 'all' || w.level === wf.level) && (!q || fold(w.word).includes(q) || fold(w.vi).includes(q)));
    const counts = { all: base.length, new: 0, learning: 0, known: 0, starred: 0 };
    for (const w of base) {
      counts[statusOf(w.id)]++;
      if (data.stars[w.id]) counts.starred++;
    }
    const chips = [['all', 'Tất cả'], ['new', 'Chưa học'], ['learning', 'Đang học'], ['known', 'Đã nhớ'], ['starred', 'Có sao']];
    $('#words-chips').innerHTML = chips.map(([k, label]) =>
      `<button type="button" class="chip" data-action="chip" data-status="${k}" aria-pressed="${wf.status === k}">${label}<span class="n">${counts[k]}</span></button>`).join('');

    const list = base.filter((w) => wf.status === 'all' || (wf.status === 'starred' ? data.stars[w.id] : statusOf(w.id) === wf.status));
    const shown = list.slice(0, wf.limit);
    const more = list.length - shown.length;
    $('#words-count').textContent = more > 0 ? `Đang hiện ${shown.length} / ${list.length} từ` : `Đang hiện ${list.length} từ`;
    $('#words-list').innerHTML = list.length
      ? shown.map(wordRow).join('') + (more > 0 ? `<li class="dict-more"><button type="button" class="btn btn-ghost" data-action="more">Xem thêm ${Math.min(PAGE, more)} từ</button></li>` : '')
      : '<li class="dict-empty">Không tìm thấy từ nào. Thử bỏ bớt bộ lọc hoặc thêm từ của riêng bạn.</li>';
  }

  function wordRow(w) {
    const st = statusOf(w.id);
    const custom = w.topic === 'mine';
    const arming = armed.key === 'del:' + w.id;
    return `<li>
      <div>
        <div class="hw-line">
          <span class="hw">${esc(w.word)}</span>
          ${w.ipa ? `<span class="ipa">${esc(w.ipa)}</span>` : ''}
          <span class="pos">${esc(w.pos)}</span>
          ${w.level ? `<span class="lvl" title="Trình độ CEFR">${esc(w.level)}</span>` : ''}
        </div>
        <p class="vi">${esc(w.vi)}</p>
        ${w.ex ? `<p class="ex">${highlight(w.ex, w.word)}</p>` : ''}
      </div>
      <div class="side">
        <span class="status s-${st}">${STATUS_LABEL[st]}</span>
        ${speakButton(w.word, 'Nghe phát âm ' + w.word)}
        ${starButton(w)}
        ${custom ? (arming
          ? `<button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${esc(w.id)}">Xoá?</button>`
          : `<button type="button" class="icon-btn" data-action="delete" data-id="${esc(w.id)}" aria-label="Xoá ${esc(w.word)}" title="Xoá từ">${ICON.trash}</button>`) : ''}
      </div>
    </li>`;
  }

  function addWord() {
    const val = (id) => $('#' + id).value.trim().replace(/\s+/g, ' ');
    const word = val('nw-word');
    const vi = val('nw-vi');
    if (!word || !vi) {
      toast('Cần nhập cả từ tiếng Anh và nghĩa tiếng Việt.');
      return;
    }
    if (allWords().some((w) => w.word.toLowerCase() === word.toLowerCase())) {
      toast(`“${word}” đã có trong sổ từ.`);
      return;
    }
    let ipa = val('nw-ipa');
    if (ipa && !/^\/.*\/$/.test(ipa)) ipa = '/' + ipa.replace(/^\/|\/$/g, '') + '/';
    data.custom.push({
      id: 'u-' + Date.now().toString(36),
      word, vi, ipa,
      pos: $('#nw-pos').value,
      ex: val('nw-ex'),
      exVi: val('nw-exvi'),
      level: '',
      topic: 'mine'
    });
    wordIndex = null;
    save();
    wf.adding = false;
    wf.topic = 'mine';
    wf.level = 'all';
    wf.status = 'all';
    wf.q = '';
    wf.limit = PAGE;
    RENDER.words();
    toast(`Đã thêm “${word}” vào Từ của tôi.`);
  }

  function deleteWord(id) {
    data.custom = data.custom.filter((w) => w.id !== id);
    delete data.srs[id];
    delete data.stars[id];
    wordIndex = null;
    if (!data.custom.length && wf.topic === 'mine') wf.topic = 'all';
    save();
    RENDER.words();
    toast('Đã xoá từ.');
  }

  // =====================================================================
  // NGƯỜI HỌC
  // =====================================================================
  const initials = (name) => name.split(/\s+/).map((p) => p.charAt(0)).join('').slice(0, 2).toUpperCase();
  const avatar = (u, big) => `<span class="avatar avatar-${u.color || 1}${big ? ' lg' : ''}" aria-hidden="true">${esc(initials(u.name))}</span>`;

  function renderTopbar() {
    const b = $('#user-btn');
    $('.tabs').hidden = !user;
    b.hidden = !user;
    if (!user) return;
    b.innerHTML = avatar(user) + `<span class="user-name">${esc(user.name)}</span>`;
    b.setAttribute('aria-label', 'Đang học: ' + user.name + '. Bấm để đổi người học');
    if (current === 'who') b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  }

  function progressOf(d) {
    const now = Date.now();
    let known = 0;
    let learning = 0;
    let due = 0;
    for (const id in d.srs) {
      const c = d.srs[id];
      if (c.interval >= 7) known++;
      else learning++;
      if (c.due <= now) due++;
    }
    return { known, learning, due, streak: streak(d.days) };
  }

  RENDER.who = function () {
    const legacy = !user && readJSON(LEGACY_KEY) && USERS.every((u) => !readJSON(storeKey(u.id)));
    const cards = USERS.map((u) => {
      const mine = user && u.id === user.id;
      const p = progressOf(mine ? data : peekUser(u.id));
      const line2 = (p.streak ? 'Chuỗi ' + p.streak + ' ngày' : 'Chưa có chuỗi ngày học') + (p.due ? ' · ' + p.due + ' thẻ cần ôn' : '');
      return `
        <button type="button" class="who-card" data-action="pick-user" data-user="${esc(u.id)}"${mine ? ' aria-current="true"' : ''}>
          ${mine ? '<span class="who-tag">Đang học</span>' : ''}
          ${avatar(u, true)}
          <span class="who-name">${esc(u.name)}</span>
          <span class="who-stats">${p.known} từ đã nhớ · ${p.learning} đang học</span>
          <span class="who-stats">${line2}</span>
        </button>`;
    }).join('');
    $('#view-who').innerHTML = `
      <div class="who">
        <div class="hello">
          <p class="eyebrow">Người học</p>
          <h1 id="who-title">${user ? 'Đổi người học' : 'Ai đang học?'}</h1>
          <p class="lede">Mỗi người có tiến độ, từ đánh dấu sao, từ tự thêm và cài đặt riêng. Dữ liệu được lưu trên trình duyệt của máy này.</p>
        </div>
        <div class="who-grid">${cards}</div>
        ${legacy ? '<p class="who-note">Tiến độ đang có trên máy này sẽ được chuyển cho người bạn chọn đầu tiên.</p>' : ''}
      </div>`;
  };

  function switchUser(id) {
    const next = USERS.find((u) => u.id === id);
    if (!next) return;
    if (!user || next.id !== user.id) {
      if (user) {
        save();
        memory[user.id] = clone(data);
      }
      const fresh = loadUser(next.id);
      for (const k of Object.keys(data)) delete data[k];
      Object.assign(data, fresh);
      // Bỏ trạng thái đang dở của người học trước.
      wordIndex = null;
      session = null;
      quiz = null;
      learnTopic = 'all';
      quizCfg.topic = 'all';
      Object.assign(wf, { q: '', topic: 'all', level: 'all', status: 'all', adding: false, limit: PAGE });
      settingsOpen = false;
      armed.key = null;
      if (speech.ok) window.speechSynthesis.cancel();
      toast('Xin chào ' + next.name + '!');
    }
    user = next;
    writeJSON(USER_KEY, user.id);
    show('today');
  }

  // =====================================================================
  // Sự kiện
  // =====================================================================
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action], [data-view]');
    if (!t) return;
    if (t.dataset.view && !t.dataset.action) {
      e.preventDefault();
      show(t.dataset.view);
      return;
    }
    const d = t.dataset;
    switch (d.action) {
      case 'speak': speech.say(d.text, t); break;
      case 'speak-slow': speech.say(d.text, t, 0.6); break;
      case 'go': show(d.view); break;
      case 'flip': flip(); break;
      case 'rate': rate(Number(d.r)); break;
      case 'study': startStudy(d.topic); break;
      case 'study-more': startStudy(learnTopic, { extraNew: true }); break;
      case 'cram': startStudy(learnTopic, { cram: true }); break;
      case 'quiz-topic':
        quizCfg.topic = d.topic;
        quiz = null;
        show('quiz');
        break;
      case 'quiz-start': startQuiz(quizCfg); break;
      case 'answer': answerChoice(d.id); break;
      case 'next': nextQuestion(); break;
      case 'quiz-exit':
      case 'quiz-new':
        quiz = null;
        RENDER.quiz();
        break;
      case 'quiz-retry':
        startQuiz({ type: quiz.type, topic: quiz.topic, count: quiz.misses.length }, quiz.misses.slice());
        break;
      case 'learn-miss': {
        startStudy('all', { ids: quiz.misses.slice() });
        break;
      }
      case 'star': {
        const on = !data.stars[d.id];
        if (on) data.stars[d.id] = true;
        else delete data.stars[d.id];
        save();
        document.querySelectorAll(`.star[data-id="${CSS.escape(d.id)}"]`).forEach((b) => {
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', String(on));
        });
        if (current === 'words') renderWordList();
        toast(on ? 'Đã đánh dấu sao. Ôn riêng các từ này trong mục “Từ đã đánh dấu sao”.' : 'Đã bỏ dấu sao.');
        break;
      }
      case 'toggle-add':
        wf.adding = !wf.adding;
        RENDER.words();
        if (wf.adding) $('#nw-word').focus();
        break;
      case 'delete':
        armOrFire('del:' + d.id, () => renderWordList(), () => deleteWord(d.id));
        break;
      case 'pick-user':
        switchUser(d.user);
        break;
      case 'group':
        data.settings.topicGroup = d.group;
        save();
        rerender();
        break;
      case 'more':
        wf.limit += PAGE;
        renderWordList();
        break;
      case 'chip':
        wf.status = d.status;
        wf.limit = PAGE;
        renderWordList();
        break;
      case 'reset':
        armOrFire('reset', () => rerender(), () => {
          data.srs = {};
          data.days = {};
          data.newDays = {};
          data.stars = {};
          session = null;
          quiz = null;
          save();
          rerender();
          toast('Đã xoá tiến độ học của ' + user.name + '.');
        });
        break;
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'spell-form') {
      e.preventDefault();
      answerSpell($('#spell-input').value);
    } else if (e.target.id === 'add-form') {
      e.preventDefault();
      addWord();
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    switch (t.id) {
      case 'learn-topic':
        learnTopic = t.value;
        buildSession(learnTopic);
        RENDER.learn();
        speakCurrentIfAuto();
        return;
      case 'quiz-topic': quizCfg.topic = t.value; return;
      case 'quiz-count': quizCfg.count = Number(t.value); return;
      case 'words-topic': wf.topic = t.value; wf.limit = PAGE; renderWordList(); return;
      case 'words-level': wf.level = t.value; wf.limit = PAGE; renderWordList(); return;
      case 'set-accent': data.settings.accent = t.value; save(); speech.say('Hello! This is how I sound.'); return;
      case 'set-new': data.settings.newPerDay = Number(t.value); save(); rerender(); return;
      case 'set-goal': data.settings.goal = Number(t.value); save(); rerender(); return;
      case 'set-auto': data.settings.autoSpeak = t.checked; save(); return;
    }
    if (t.name === 'qtype') quizCfg.type = t.value;
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'words-q') {
      wf.q = t.value;
      wf.limit = PAGE;
      renderWordList();
    } else if (t.id === 'set-rate') {
      data.settings.rate = Number(t.value);
      $('#rate-out').textContent = data.settings.rate.toFixed(1) + '×';
      save();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    const onButton = tag === 'button' || tag === 'summary' || tag === 'a';

    if (current === 'learn' && currentCard()) {
      if ((e.key === ' ' || e.key === 'Enter') && !onButton) {
        e.preventDefault();
        flip();
      } else if (session.flipped && /^[1-4]$/.test(e.key)) {
        rate(Number(e.key) - 1);
      } else if (e.key === 's' || e.key === 'S') {
        speech.say(currentCard().word);
      }
    } else if (current === 'quiz' && quiz && quiz.i < quiz.qs.length) {
      if (!quiz.answered && quiz.type !== 'spell' && /^[1-4]$/.test(e.key)) {
        const id = quiz.qs[quiz.i].opts[Number(e.key) - 1];
        if (id) answerChoice(id);
      } else if (quiz.answered && e.key === 'Enter' && !onButton) {
        e.preventDefault();
        nextQuestion();
      }
    }
  });

  // ---------- Khởi động ----------
  speech.init();
  const initial = (location.hash || '').replace('#', '');
  show(VIEWS.indexOf(initial) !== -1 ? initial : 'today', { keepScroll: true });
})();
