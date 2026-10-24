/*
 * CodeForge — Applicazione (UI 100% italiana, spiegazioni in arabo).
 * Viste: Lezioni · Editor Java · Esame · Glossario. Nessuna dipendenza esterna.
 */
(function () {
  'use strict';

  const C = window.CF_CURRICULUM;
  const GLOSS = window.CF_GLOSSARIO;
  const EXAM = window.CF_ESAME;
  const JVM = window.CFInterpreter;
  const LINT = window.CFLinter;
  const EXP = window.CFExplainer;
  const VER = window.CFVerifica;

  // ───────────────────────── Utilità ─────────────────────────
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = EXP.escapeHtml;
  const icon = (id, cls) => `<svg class="ic ${cls || ''}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  // Nei testi arabi i frammenti latini (identificatori Java, numeri, citazioni italiane)
  // vengono isolati in <bdi dir="ltr"> così la punteggiatura bidirezionale non si inverte.
  const AR_RE = /[؀-ۿ]/;
  const LATIN_RUN = /[«"]?-?[A-Za-z0-9_][^؀-ۿ\s]*(?:[ \t]+[«"(]?-?[A-Za-z0-9_][^؀-ۿ\s]*)*/g;
  function isolateLatin(text) {
    let out = '';
    let last = 0;
    LATIN_RUN.lastIndex = 0;
    let m;
    while ((m = LATIN_RUN.exec(text))) {
      const trail = /[.,;:!?)]+$/.exec(m[0]);
      const core = trail && !/\([^)]*$/.test(m[0].slice(0, -trail[0].length)) ? m[0].slice(0, -trail[0].length) : m[0];
      out += esc(text.slice(last, m.index)) + `<bdi dir="ltr">${esc(core)}</bdi>` + esc(m[0].slice(core.length));
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }
  const rich = (s) => {
    const str = String(s || '');
    const arabic = AR_RE.test(str);
    return str.split(/`([^`]+)`/).map((p, i) => (i % 2 ? `<code dir="ltr">${esc(p)}</code>` : arabic ? isolateLatin(p) : esc(p))).join('');
  };
  const plain = (s) => String(s || '').replace(/`/g, '');
  const arP = (s, cls) => `<p class="ar ${cls || ''}" dir="rtl" lang="ar">${rich(s)}</p>`;
  const RING_C = 2 * Math.PI * 44;

  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('cf.' + k);
        return v === null ? d : JSON.parse(v);
      } catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem('cf.' + k, JSON.stringify(v)); } catch (e) { /* storage non disponibile */ }
    },
  };

  const state = {
    xp: store.get('xp', 0),
    done: store.get('done', {}),
    passed: store.get('passed', {}),
    saved: store.get('saved', []),
    streak: 1,
  };

  function initStreak() {
    const day = (d) => d.toISOString().slice(0, 10);
    const today = day(new Date());
    const yesterday = day(new Date(Date.now() - 864e5));
    const s = store.get('streak', { last: null, n: 0 });
    if (s.last !== today) {
      s.n = s.last === yesterday ? s.n + 1 : 1;
      s.last = today;
      store.set('streak', s);
    }
    state.streak = s.n;
  }

  function updateStats(bump) {
    $('#xpVal').textContent = state.xp;
    $('#streakVal').textContent = state.streak;
    $('#savedVal').textContent = state.saved.length;
    if (bump) {
      const el = $('.chip-' + bump);
      if (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    }
  }

  function addXp(n, msg) {
    state.xp += n;
    store.set('xp', state.xp);
    updateStats('xp');
    if (msg) toast(`+${n} XP · ${msg}`, 'gold');
  }

  let toastTimer = null;
  function toast(msg, kind) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show ' + (kind || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast ' + (kind || ''); }, 2600);
  }

  const allLessons = [];
  for (const m of C.moduli) for (const l of m.lezioni) allLessons.push({ m, l });
  const findLesson = (id) => allLessons.find((x) => x.l.id === id);

  // ───────────────────────── Sintesi vocale ─────────────────────────
  const tts = {
    ok: typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined',
    voices: [],
    init() {
      if (!this.ok) return;
      const load = () => { this.voices = window.speechSynthesis.getVoices(); };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    },
    speak(parts, lang, btn) {
      if (!this.ok) { toast('Sintesi vocale non disponibile su questo dispositivo'); return; }
      const ss = window.speechSynthesis;
      ss.cancel();
      const code = (lang || 'it-IT').slice(0, 2);
      const voice = this.voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(code));
      if (!voice && this.voices.length) toast(code === 'it' ? 'Nessuna voce italiana installata: uso la voce predefinita' : 'لا يوجد صوت عربي مثبت: سيُستخدم الصوت الافتراضي');
      const texts = parts.map(plain).filter((t) => t.trim());
      texts.forEach((t, i) => {
        const u = new SpeechSynthesisUtterance(t);
        u.lang = lang || 'it-IT';
        if (voice) u.voice = voice;
        u.rate = 0.92;
        if (btn) {
          if (i === 0) u.onstart = () => btn.classList.add('speaking');
          if (i === texts.length - 1) u.onend = u.onerror = () => btn.classList.remove('speaking');
        }
        ss.speak(u);
      });
    },
    stop() { if (this.ok) window.speechSynthesis.cancel(); },
  };

  // ───────────────────────── Salvati per l'esame ─────────────────────────
  const itemKey = (it) => it.kind + '|' + String(it.src || '').trim();
  const isSaved = (it) => state.saved.some((s) => s.key === itemKey(it));
  function toggleSaved(it) {
    const key = itemKey(it);
    const i = state.saved.findIndex((s) => s.key === key);
    if (i >= 0) state.saved.splice(i, 1);
    else {
      state.saved.unshift({ key, kind: it.kind, src: it.src, t: it.t, ar: it.ar, ex: it.ex, bn: it.bn, bnAr: it.bnAr, meta: it.meta, code: it.code, cat: it.cat });
      toast('★ Salvato per l\'esame', 'gold');
    }
    store.set('saved', state.saved);
    updateStats('saved');
    $$('[data-grp]').forEach((el) => {
      const items = groups.get(el.dataset.grp);
      const item = items && items[+el.dataset.i];
      if (item) el.classList.toggle('saved', isSaved(item));
    });
    return i < 0;
  }

  // ───────────────────────── Gruppi "Tap-to-Understand" ─────────────────────────
  const groups = new Map();
  let gidSeq = 0;
  function registerGroup(items) {
    const id = 'g' + (++gidSeq);
    groups.set(id, items);
    return id;
  }

  function codeItems(code, notes, file) {
    const lines = code.split('\n');
    return lines.map((line, i) => {
      if (!line.trim()) return null;
      const sp = EXP.spiega(line);
      const note = (notes || []).find(([frag]) => line.includes(frag));
      const n = note ? note[1] : {};
      return {
        kind: 'codice', src: line, lineNo: i + 1, meta: `Riga ${i + 1} · ${file || 'Main.java'}`,
        t: n.t || sp.t, ar: n.ar || sp.ar, ex: n.ex || sp.ex, bn: n.bn || sp.bn, bnAr: n.bnAr || sp.bnAr,
      };
    });
  }

  /** Righe di codice cliccabili. items[i] può essere null (riga vuota). */
  function codeLinesHtml(code, items, opts) {
    const o = opts || {};
    const hl = EXP.highlight(code);
    const nav = items.filter(Boolean);
    const gid = o.gid || registerGroup(nav);
    return {
      gid,
      html: hl.map((h, i) => {
        const it = items[i];
        const lint = o.lintByLine && o.lintByLine[i + 1];
        const sev = lint ? ' has-' + lint[0].severity : '';
        if (!it || o.noTap) {
          return `<div class="code-line${sev}" data-ln="${i + 1}"${o.pick ? ` data-pick="${i + 1}" role="button" tabindex="0"` : ''}><span class="ln">${i + 1}</span><span class="src">${h}</span><span></span></div>`;
        }
        const idx = nav.indexOf(it);
        return `<button type="button" class="code-line${sev}${isSaved(it) ? ' saved' : ''}" data-grp="${gid}" data-i="${idx}" data-ln="${i + 1}" aria-label="Riga ${i + 1}: spiegazione"><span class="ln">${i + 1}</span><span class="src">${h}</span><span class="tap-badge">${icon('lang')}</span></button>`;
      }).join(''),
    };
  }

  // ───────────────────────── Bottom sheet ─────────────────────────
  const sheet = {
    items: [], idx: 0, gid: null, opener: null, closeTimer: null,
    open(gid, idx) {
      this.items = groups.get(gid) || [];
      if (!this.items.length) return;
      this.gid = gid;
      this.idx = Math.max(0, Math.min(idx, this.items.length - 1));
      this.opener = document.activeElement;
      clearTimeout(this.closeTimer);
      const s = $('#sheet'), b = $('#sheetBackdrop');
      s.hidden = false; b.hidden = false;
      void s.offsetWidth;
      s.classList.add('open'); b.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.render();
      s.focus({ preventScroll: true });
    },
    close() {
      const s = $('#sheet'), b = $('#sheetBackdrop');
      if (s.hidden) return;
      s.classList.remove('open'); b.classList.remove('open');
      document.body.style.overflow = '';
      tts.stop();
      $$('.tappable.current, .code-line.current').forEach((e) => e.classList.remove('current'));
      this.closeTimer = setTimeout(() => { s.hidden = true; b.hidden = true; }, 420);
      if (this.opener && this.opener.focus) this.opener.focus({ preventScroll: true });
    },
    get isOpen() { return !$('#sheet').hidden && $('#sheet').classList.contains('open'); },
    go(d) {
      const n = this.idx + d;
      if (n < 0 || n >= this.items.length) return;
      this.idx = n;
      tts.stop();
      this.render();
    },
    render() {
      const it = this.items[this.idx];
      $('#sheetPos').textContent = `${this.idx + 1} / ${this.items.length}`;
      $('#sheetPrev').disabled = this.idx === 0;
      $('#sheetNext').disabled = this.idx === this.items.length - 1;
      const isCode = it.kind === 'codice';
      let src;
      if (isCode) src = `<div class="sheet-source code"><span class="src-meta">${esc(it.meta || '')}</span>${EXP.highlight(it.src.trim())[0]}</div>`;
      else if (it.kind === 'termine') src = `<div class="sheet-source"><span class="src-meta">${esc(it.meta || 'Glossario')}</span><b>${esc(it.src)}</b>${it.code ? `<pre class="sheet-source code" style="margin:10px 0 0">${EXP.highlight(it.code).join('\n')}</pre>` : ''}</div>`;
      else src = `<div class="sheet-source"><span class="src-meta">${esc(it.meta || '')}</span><span class="it-text">${rich(it.src)}</span></div>`;
      const lint = (it.lint || []).map((f) => `<section class="sec lint"><h5>${icon('alert', 'sm')} ${esc(f.titolo)}</h5><p class="it-text">${rich(f.it)}</p>${arP(f.ar)}</section>`).join('');
      const saved = isSaved(it);
      $('#sheetBody').innerHTML = `
        ${src}
        <div class="sheet-actions">
          <button type="button" class="btn sm" data-act="speak">${icon('volume')}Ascolta Pronuncia</button>
          <button type="button" class="btn sm ${saved ? 'on' : ''}" data-act="save" aria-pressed="${saved}">${icon('star')}${saved ? 'Salvato' : 'Salva per l\'Esame'}</button>
        </div>
        <section class="sec term"><h5>${icon('book', 'sm')} Termine Tecnico (IT)</h5><p id="sheetTerm">${esc(it.t || '—')}</p></section>
        <section class="sec meaning ar" dir="rtl" lang="ar"><h5>المعنى بالعربية</h5><p>${rich(it.ar || '—')}</p></section>
        <section class="sec detail ar" dir="rtl" lang="ar"><h5>الشرح التفصيلي</h5><p>${rich(it.ex || '—')}</p></section>
        <section class="sec rule"><h5>${icon('shield', 'sm')} Regola di Buona Norma</h5><p class="it-text">${rich(it.bn || 'Scrivi codice leggibile, ben indentato e con nomi significativi.')}</p>${arP(it.bnAr || 'اكتب كوداً مقروءاً بإزاحة منتظمة وأسماء ذات معنى.')}</section>
        ${lint}
        <div class="kbd-hint"><span class="kbd">←</span> <span class="kbd">→</span> per navigare · <span class="kbd">Esc</span> per chiudere</div>`;
      $('#sheetBody').scrollTop = 0;
      this.markCurrent();
    },
    markCurrent() {
      $$('.tappable.current, .code-line.current').forEach((e) => e.classList.remove('current'));
      const el = $(`[data-grp="${this.gid}"][data-i="${this.idx}"]`);
      if (el) {
        el.classList.add('current');
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    },
  };

  function initSheet() {
    $('#sheetPrev').addEventListener('click', () => sheet.go(-1));
    $('#sheetNext').addEventListener('click', () => sheet.go(1));
    $('#sheetClose').addEventListener('click', () => sheet.close());
    $('#sheetBackdrop').addEventListener('click', () => sheet.close());
    $('#sheetBody').addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const it = sheet.items[sheet.idx];
      if (b.dataset.act === 'speak') {
        const parts = it.kind === 'codice' ? [it.t, it.bn] : it.kind === 'termine' ? [it.src] : [it.t, it.src];
        tts.speak(parts, 'it-IT', b);
      } else if (b.dataset.act === 'save') {
        toggleSaved(it);
        sheet.render();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (!sheet.isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); sheet.close(); } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); sheet.go(1); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); sheet.go(-1); } else if (e.key === 'Tab') {
        const f = $$('#sheet button:not(:disabled)');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === $('#sheet'))) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Trascina verso il basso per chiudere (mobile)
    let y0 = null;
    const head = $('.sheet-grip');
    const s = $('#sheet');
    s.addEventListener('touchstart', (e) => {
      if (e.target.closest('.sheet-grip, .sheet-head') || $('#sheetBody').scrollTop === 0) y0 = e.touches[0].clientY;
    }, { passive: true });
    s.addEventListener('touchmove', (e) => {
      if (y0 === null) return;
      const dy = e.touches[0].clientY - y0;
      if (dy > 0) s.style.transform = window.innerWidth >= 760 ? `translate(-50%, ${dy}px)` : `translateY(${dy}px)`;
    }, { passive: true });
    s.addEventListener('touchend', (e) => {
      if (y0 === null) return;
      const dy = e.changedTouches[0].clientY - y0;
      y0 = null;
      s.style.transform = '';
      if (dy > 110) sheet.close();
    });
    void head;
    // Apertura da qualunque elemento cliccabile
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-grp]');
      if (!el || el.closest('#sheet')) return;
      sheet.open(el.dataset.grp, +el.dataset.i);
    });
  }

  // ───────────────────────── Memoria JVM ─────────────────────────
  const PALETTE = ['#58A6FF', '#3FB950', '#A371F7', '#F2CC60', '#FF7B72', '#56D4DD', '#FFA657', '#D2A8FF'];
  const refColor = (addr) => PALETTE[(parseInt(String(addr).slice(1), 16) || 0) % PALETTE.length];
  const memHosts = new Set();
  let memSeq = 0;

  function valHtml(v) {
    if (v.ref) return `<span class="ref-badge" data-ref="${esc(v.ref)}" style="--rc:${refColor(v.ref)}" title="Riferimento all'oggetto ${esc(v.ref)}">${esc(v.val)}</span>`;
    const cls = v.str ? 'str' : v.nul ? 'nul' : v.uninit ? 'uninit' : '';
    return `<span class="vv ${cls}" title="${esc(v.val)}">${esc(v.val)}</span>`;
  }

  function renderMemory(host, step, prev) {
    if (!step) { host.innerHTML = '<div class="mem-empty">Nessuno stato di memoria da mostrare.</div>'; return; }
    const id = host.dataset.memId || (host.dataset.memId = 'm' + (++memSeq));
    const prevVals = new Map();
    if (prev) for (const f of prev.frames) for (const v of f.vars) prevVals.set(f.name + '|' + v.name, v.val);
    const frames = step.frames.slice().reverse();
    const stackHtml = frames.length ? frames.map((f, i) => `
      <div class="frame ${i === 0 ? 'top' : ''}">
        <div class="frame-h">${esc(f.name)}${f.ctor ? ' <span>costruttore</span>' : ''}<span>riga ${f.line}</span></div>
        ${f.vars.length ? f.vars.map((v) => {
          const pv = prevVals.get(f.name + '|' + v.name);
          const changed = prev && pv !== v.val;
          return `<div class="var${changed ? ' changed' : ''}"><span class="vt">${esc(v.type || '')}</span><span class="vn">${v.final ? '🔒 ' : ''}${esc(v.name)}</span>${valHtml(v)}</div>`;
        }).join('') : '<div class="var"><span class="vn muted">(nessuna variabile)</span></div>'}
      </div>`).join('') : '<div class="mem-empty">Stack vuoto: nessun metodo in esecuzione.</div>';
    const statics = (step.statics || []).map((s) => `
      <div class="frame statics"><div class="frame-h">static ${esc(s.cls)}<span>area classi</span></div>
      ${s.vars.map((v) => `<div class="var"><span class="vt">${esc(v.type)}</span><span class="vn">${esc(v.name)}</span>${valHtml(v)}</div>`).join('')}</div>`).join('');
    const heapHtml = step.heap.length ? step.heap.map((o) => `
      <div class="obj ${o.gc ? 'gc' : ''} ${o.exc ? 'exc' : ''}" data-addr="${esc(o.addr)}" style="--rc:${o.exc ? '#F85149' : refColor(o.addr)}">
        <div class="obj-h"><span class="addr">${esc(o.addr)}</span>${esc(o.label)}</div>
        ${o.fields.length ? o.fields.map((f) => `<div class="field"><span class="vt">${f.access === 'private' ? `<span class="lock" title="private">${icon('shield')}</span>` : esc(f.access || '')}</span><span class="vn">${esc(f.name)}</span>${valHtml(f)}</div>`).join('') : '<div class="field"><span class="vn muted">(vuoto)</span></div>'}
      </div>`).join('') : '<div class="mem-empty">Heap vuoto: nessun oggetto creato con new.</div>';
    host.innerHTML = `
      <div class="mem">
        <div class="mem-col stack"><h4>${icon('layers', 'sm')} Stack <small>LIFO · frame</small></h4>${stackHtml}${statics}</div>
        <div class="mem-col heap"><h4>${icon('box', 'sm')} Heap <small>oggetti</small></h4>${heapHtml}</div>
        <svg class="mem-arrows" aria-hidden="true"></svg>
      </div>
      <div class="mem-legend"><span><span class="ref-badge" style="--rc:#58A6FF">@ref</span> riferimento</span><span><span class="lock">${icon('shield', 'sm')}</span> private</span><span>GC = eleggibile per il Garbage Collector</span></div>
      <p class="mem-note ar" dir="rtl" lang="ar">${rich(step.memAr || memSummaryAr(step))}</p>`;
    memHosts.add(host);
    requestAnimationFrame(() => drawArrows(host, id));
  }

  /** Riassunto in arabo dello stato della memoria. */
  function memSummaryAr(step) {
    const parts = [];
    const top = step.frames[step.frames.length - 1];
    if (!top) parts.push('الـStack فارغ: لا توجد أي دالة قيد التنفيذ.');
    else {
      parts.push(`الـStack يحتوي على ${step.frames.length} ${step.frames.length === 1 ? 'إطار' : 'إطارات'}، والإطار النشط في الأعلى هو \`${top.name}\`.`);
      const prims = top.vars.filter((v) => !v.ref && !v.nul && !v.str && !v.isThis && !v.uninit);
      const refs = top.vars.filter((v) => v.ref && !v.isThis);
      const nulls = top.vars.filter((v) => v.nul);
      if (prims.length) parts.push(`القيم البدائية ${prims.slice(0, 4).map((v) => `\`${v.name} = ${v.val}\``).join('، ')} مخزّنة مباشرة داخل الإطار.`);
      if (refs.length) {
        parts.push(refs.slice(0, 4).map((v) => {
          const o = step.heap.find((h) => h.addr === v.ref);
          return `\`${v.name}\` يشير إلى \`${v.ref}\`${o ? ` (${o.label})` : ''}`;
        }).join('، ') + ' في الـHeap.');
        const seen = {};
        refs.forEach((v) => { (seen[v.ref] = seen[v.ref] || []).push(v.name); });
        const shared = Object.entries(seen).find(([, n]) => n.length > 1);
        if (shared) parts.push(`انتبه: ${shared[1].map((n) => `\`${n}\``).join(' و ')} يشيران إلى نفس الكائن (aliasing).`);
      }
      if (nulls.length) parts.push(`${nulls.map((v) => `\`${v.name}\``).join('، ')} = null: استدعاء دالة عليه يسبب NullPointerException.`);
    }
    const live = step.heap.filter((o) => !o.gc).length;
    const gc = step.heap.filter((o) => o.gc).length;
    parts.push(`في الـHeap ${live} ${live === 1 ? 'كائن حي' : 'كائنات حية'}${gc ? ` و ${gc} لم يعد يشير إليها أي مرجع (مؤهلة لجامع القمامة GC)` : ''}.`);
    return parts.join(' ');
  }

  function drawArrows(host, id) {
    const mem = $('.mem', host);
    const svg = $('.mem-arrows', host);
    if (!mem || !svg || !mem.offsetParent) return;
    const box = mem.getBoundingClientRect();
    const markers = new Map();
    const paths = [];
    $$('.ref-badge[data-ref]', mem).forEach((b) => {
      const tgt = $(`.obj[data-addr="${CSS.escape(b.dataset.ref)}"]`, mem);
      if (!tgt) return;
      const color = refColor(b.dataset.ref);
      const mk = 'ah-' + id + '-' + PALETTE.indexOf(color);
      markers.set(mk, color);
      const r1 = b.getBoundingClientRect(), r2 = tgt.getBoundingClientRect();
      const x1 = r1.right - box.left, y1 = r1.top + r1.height / 2 - box.top;
      let d;
      if (b.closest('.heap')) {
        const x2 = r2.right - box.left, y2 = r2.top + 14 - box.top;
        const bulge = Math.max(x1, x2) + 22;
        d = `M${x1},${y1} C${bulge},${y1} ${bulge},${y2} ${x2 + 2},${y2}`;
      } else {
        const x2 = r2.left - box.left - 2, y2 = r2.top + 14 - box.top;
        const dx = Math.max(18, (x2 - x1) / 2);
        d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
      }
      paths.push(`<path d="${d}" stroke="${color}" marker-end="url(#${mk})"/>`);
    });
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = `<defs>${[...markers].map(([mk, c]) => `<marker id="${mk}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker>`).join('')}</defs>${paths.join('')}`;
  }

  window.addEventListener('resize', (() => {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(() => memHosts.forEach((h) => { if (h.isConnected) drawArrows(h, h.dataset.memId); else memHosts.delete(h); }), 120);
    };
  })());

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.ref-badge[data-ref]');
    if (!b) return;
    const mem = b.closest('.mem');
    const tgt = mem && $(`.obj[data-addr="${CSS.escape(b.dataset.ref)}"]`, mem);
    if (tgt) {
      tgt.classList.add('hl');
      setTimeout(() => tgt.classList.remove('hl'), 1200);
    }
  });

  // ───────────────────────── Console ─────────────────────────
  function consoleHtml(res, outLen, final) {
    if (res.error && (res.error.type === 'compile' || res.error.type === 'unsupported' || res.error.type === 'internal')) {
      const amber = res.error.type !== 'compile';
      return `<div class="err-box ${amber ? 'amber' : ''}"><h5>${icon('alert', 'sm')} ${res.error.type === 'compile' ? 'Errore di compilazione' : res.error.type === 'unsupported' ? 'Costrutto non supportato dal simulatore' : 'Errore del simulatore'}${res.error.line ? ` · riga ${res.error.line}` : ''}</h5><p class="it-text">${esc(res.error.msg)}</p>${res.error.ar ? arP(res.error.ar) : ''}</div>`;
    }
    const chunks = res.stdout.slice(0, outLen === undefined ? res.stdout.length : outLen);
    let html = chunks.map((c) => `<span class="${c.err ? 'err' : ''}">${esc(c.text)}</span>`).join('');
    if (!html) html = '<span class="console-empty">(nessun output finora)</span>';
    if (final) {
      if (res.error && res.error.type === 'limit') html += `\n<span class="err">⛔ ${esc(res.error.msg)}</span>`;
      else if (res.exception) html += '\n<span class="sys">Processo terminato con codice di uscita 1</span>';
      else html += '\n<span class="sys">Processo terminato con codice di uscita 0</span>';
      if (res.truncated) html += '\n<span class="sys">(traccia passo-passo troncata ai primi passi)</span>';
    }
    return `<pre class="console">${html}</pre>`;
  }

  // ───────────────────────── Player passo-passo ─────────────────────────
  class Player {
    constructor(t) {
      this.t = t; // { bar, explain, console, mem, onLine, onTab }
      this.res = null;
      this.i = 0;
      this.timer = null;
    }
    load(res, atEnd) {
      this.stop();
      this.res = res;
      const n = res.trace.length;
      this.t.bar.hidden = false;
      if (!n) {
        this.t.bar.innerHTML = '';
        this.t.bar.hidden = true;
        if (this.t.explain) this.t.explain.innerHTML = '';
        this.t.console.innerHTML = consoleHtml(res, undefined, true);
        if (this.t.mem) this.t.mem.innerHTML = '<div class="mem-empty">Il programma non è stato eseguito: correggi prima gli errori di compilazione.</div>';
        if (this.t.onLine) this.t.onLine(res.error && res.error.line ? -res.error.line : null);
        return;
      }
      this.t.bar.innerHTML = `
        <div class="dbg-bar">
          <span class="dbg-title">${icon('bug', 'sm')} Passo-passo</span>
          <button type="button" class="btn-icon" data-d="first" title="Inizio" aria-label="Inizio">${icon('first')}</button>
          <button type="button" class="btn-icon" data-d="prev" title="Indietro" aria-label="Indietro">${icon('left')}</button>
          <button type="button" class="btn-icon" data-d="play" title="Riproduci" aria-label="Riproduci">${icon('play')}</button>
          <button type="button" class="btn-icon" data-d="next" title="Avanti" aria-label="Avanti">${icon('right')}</button>
          <button type="button" class="btn-icon" data-d="last" title="Fine" aria-label="Fine">${icon('last')}</button>
          <span class="dbg-step"></span>
          <input class="dbg-range" type="range" min="0" max="${n - 1}" value="0" aria-label="Passo di esecuzione">
        </div>`;
      this.t.bar.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => this.cmd(b.dataset.d)));
      const range = $('.dbg-range', this.t.bar);
      range.addEventListener('input', () => { this.stop(); this.show(+range.value); });
      this.show(atEnd ? n - 1 : 0);
    }
    cmd(d) {
      const n = this.res.trace.length;
      if (d === 'play') { if (this.timer) this.stop(); else this.play(); return; }
      this.stop();
      if (d === 'first') this.show(0);
      else if (d === 'prev') this.show(Math.max(0, this.i - 1));
      else if (d === 'next') this.show(Math.min(n - 1, this.i + 1));
      else if (d === 'last') this.show(n - 1);
    }
    play() {
      const n = this.res.trace.length;
      if (this.i >= n - 1) this.show(0);
      const b = $('[data-d="play"]', this.t.bar);
      if (b) b.innerHTML = icon('pause');
      this.timer = setInterval(() => {
        if (this.i >= n - 1) { this.stop(); return; }
        this.show(this.i + 1);
      }, 950);
    }
    stop() {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      const b = this.t.bar && $('[data-d="play"]', this.t.bar);
      if (b) b.innerHTML = icon('play');
    }
    show(i) {
      const tr = this.res.trace;
      this.i = i;
      const step = tr[i];
      const last = i === tr.length - 1;
      $('.dbg-step', this.t.bar).textContent = `Passo ${i + 1} / ${tr.length}`;
      $('.dbg-range', this.t.bar).value = i;
      $('[data-d="prev"]', this.t.bar).disabled = i === 0;
      $('[data-d="first"]', this.t.bar).disabled = i === 0;
      $('[data-d="next"]', this.t.bar).disabled = last;
      $('[data-d="last"]', this.t.bar).disabled = last;
      if (this.t.explain) {
        this.t.explain.innerHTML = `
          <div class="dbg-explain">
            <div class="row"><span class="dbg-line">riga ${step.line}</span><span class="spacer"></span>
              <button type="button" class="btn sm ghost" data-say="it">${icon('volume', 'sm')}IT</button>
              <button type="button" class="btn sm ghost" data-say="ar">${icon('volume', 'sm')}عربي</button></div>
            <p class="it-text">${rich(step.it)}</p>
            ${arP(step.ar)}
          </div>`;
        $$('[data-say]', this.t.explain).forEach((b) => b.addEventListener('click', () => {
          if (b.dataset.say === 'it') tts.speak([step.it], 'it-IT', b);
          else tts.speak([step.ar], 'ar-SA', b);
        }));
      }
      this.t.console.innerHTML = consoleHtml(this.res, step.outLen, last);
      const pre = $('pre', this.t.console);
      if (pre) pre.scrollTop = pre.scrollHeight;
      if (this.t.mem) renderMemory(this.t.mem, step, tr[i - 1]);
      if (this.t.onLine) this.t.onLine(step.line);
    }
  }

  // ───────────────────────── Router ─────────────────────────
  const VIEWS = ['lezioni', 'editor', 'esame', 'glossario'];
  function route() {
    const parts = (location.hash || '#/lezioni').replace(/^#\/?/, '').split('/');
    const view = VIEWS.includes(parts[0]) ? parts[0] : 'lezioni';
    if (sheet.isOpen) sheet.close();
    VIEWS.forEach((v) => { $('#view-' + v).hidden = v !== view; });
    $$('#nav a').forEach((a) => {
      const on = a.dataset.view === view;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (view === 'lezioni') {
      if (parts[2]) renderLesson(parts[1], parts[2]);
      else if (parts[1]) renderModule(parts[1]);
      else renderHome();
      window.scrollTo(0, 0);
    } else if (view === 'editor') {
      editor.show();
    } else if (view === 'esame') {
      if (!$('#view-esame').dataset.ready) renderExam();
      window.scrollTo(0, 0);
    } else if (view === 'glossario') {
      renderGlossary(parts[1] === 'salvati' ? 'salvati' : null);
      window.scrollTo(0, 0);
    }
    const v = $('#view-' + view);
    v.style.animation = 'none';
    void v.offsetWidth;
    v.style.animation = '';
  }

  // ───────────────────────── Lezioni ─────────────────────────
  function ringSvg(pct, color, label, sub, extraCls) {
    const off = RING_C * (1 - Math.max(0, Math.min(1, pct)));
    return `<div class="ring-wrap ${extraCls || ''}">
      <svg viewBox="0 0 100 100"><circle class="ring-bg" cx="50" cy="50" r="44" fill="none" stroke-width="8"/>
      <circle class="ring-fg" cx="50" cy="50" r="44" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${RING_C}" stroke-dashoffset="${off}" style="color:${color}"/></svg>
      <div class="ring-label"><div><b>${label}</b><small>${sub}</small></div></div></div>`;
  }

  function moduleProgress(m) {
    const done = m.lezioni.filter((l) => state.done[l.id]).length;
    return { done, tot: m.lezioni.length };
  }

  function renderHome() {
    const tot = allLessons.length;
    const done = allLessons.filter((x) => state.done[x.l.id]).length;
    const next = allLessons.find((x) => !state.done[x.l.id]) || allLessons[0];
    $('#view-lezioni').innerHTML = `
      <div class="stack-lg">
        <section class="hero card">
          <div>
            <div class="eyebrow">Corso di Laurea in Informatica · Programmazione I</div>
            <h1 class="h1">Impara Java, capisci ogni riga.</h1>
            <p class="lead">Lezioni universitarie in italiano: tocca qualsiasi frase o riga di codice per la spiegazione istantanea in arabo, esegui il codice nel simulatore JVM e ricevi il feedback «Buona Norma» del professore.</p>
            ${arP('تعلّم البرمجة بلغة Java باللغة الإيطالية كما في الجامعات الإيطالية: اضغط على أي جملة أو سطر كود لتحصل فوراً على الترجمة والشرح بالعربية.')}
            <div class="row hero-actions">
              <a class="btn primary" href="#/lezioni/${next.m.id}/${next.l.id}">${icon('play')}${done ? 'Continua' : 'Inizia'}: ${esc(next.l.titolo)}</a>
              <a class="btn" href="#/editor">${icon('code')}Apri l'Editor Java</a>
            </div>
          </div>
          ${ringSvg(done / tot, '#58A6FF', `${Math.round((done / tot) * 100)}%`, `${done}/${tot} lezioni`)}
        </section>
        <section>
          <div class="section-title">Il programma didattico</div>
          <div class="modules">
            ${C.moduli.map((m) => {
              const p = moduleProgress(m);
              return `<a class="module-card" href="#/lezioni/${m.id}" style="--mc:${m.colore}">
                <div class="module-top"><span class="module-icon">${icon(m.icona, 'lg')}</span><div><div class="module-num">MODULO ${m.numero}</div><div class="h3">${esc(m.titolo)}</div></div></div>
                ${arP(m.titoloAr)}
                <p>${esc(m.descr)}</p>
                <div class="progress"><span style="width:${(p.done / p.tot) * 100}%"></span></div>
                <div class="module-foot"><span>${p.tot} lezioni</span><span>${p.done === p.tot ? '✓ Completato' : `${p.done}/${p.tot} completate`}</span></div>
              </a>`;
            }).join('')}
          </div>
        </section>
      </div>`;
  }

  function renderModule(mid) {
    const m = C.moduli.find((x) => x.id === mid);
    if (!m) { location.hash = '#/lezioni'; return; }
    const p = moduleProgress(m);
    $('#view-lezioni').innerHTML = `
      <div class="stack">
        <nav class="crumbs"><a href="#/lezioni">Lezioni</a>${icon('right')}<span>Modulo ${m.numero}</span></nav>
        <section class="card hero" style="--mc:${m.colore}">
          <div>
            <div class="row"><span class="module-icon" style="--mc:${m.colore};color:${m.colore};background:color-mix(in srgb, ${m.colore} 14%, transparent);border:1px solid color-mix(in srgb, ${m.colore} 32%, transparent)">${icon(m.icona, 'lg')}</span><div class="eyebrow">Modulo ${m.numero}</div></div>
            <h1 class="h1">${esc(m.titolo)}</h1>
            ${arP(m.titoloAr)}
            <p class="lead">${esc(m.descr)}</p>
          </div>
          ${ringSvg(p.done / p.tot, m.colore, `${p.done}/${p.tot}`, 'lezioni')}
        </section>
        <div class="lesson-list">
          ${m.lezioni.map((l, i) => `
            <a class="lesson-item ${state.done[l.id] ? 'done' : ''}" href="#/lezioni/${m.id}/${l.id}">
              <span class="lesson-idx">${state.done[l.id] ? icon('check', 'sm') : `${m.numero}.${i + 1}`}</span>
              <div style="flex:1;min-width:0"><div class="h3">${esc(l.titolo)}</div>
              <div class="meta"><span>${icon('clock', 'sm')} ${esc(l.durata)}</span>${state.passed[l.id] ? '<span class="pill ok">Esercizio superato</span>' : ''}</div></div>
              ${icon('right')}
            </a>`).join('')}
        </div>
      </div>`;
  }

  const lessonPlayers = [];

  function renderLesson(mid, lid) {
    const found = findLesson(lid);
    if (!found) { location.hash = '#/lezioni'; return; }
    const { m, l } = found;
    lessonPlayers.forEach((p) => p.stop());
    lessonPlayers.length = 0;
    const idx = allLessons.indexOf(found);
    const prev = allLessons[idx - 1], next = allLessons[idx + 1];
    const normaSec = l.sezioni.find((s) => s.tipo === 'norma');
    const codeBlocks = [];
    let li = 0;
    const secHtml = l.sezioni.map((s) => {
      if (s.tipo === 'testo') {
        const items = s.frasi.map((f, i) => ({
          kind: 'frase', src: f.it, t: f.t, ar: f.ar, ex: f.ex,
          bn: f.bn || (normaSec && normaSec.it), bnAr: f.bnAr || (normaSec && normaSec.ar),
          meta: `Frase ${i + 1} · ${l.titolo}`,
        }));
        const gid = registerGroup(items);
        return `<section class="card prose">
          ${s.titolo ? `<div class="section-title">${esc(s.titolo)}</div>` : ''}
          ${items.map((it, i) => `<button type="button" class="tappable${isSaved(it) ? ' saved' : ''}" data-grp="${gid}" data-i="${i}"><span class="it-text">${rich(it.src)}</span><span class="term-hint">${esc(it.t)}</span><span class="tap-badge">${icon('lang')}</span></button>`).join('')}
        </section>`;
      }
      if (s.tipo === 'codice') {
        const items = codeItems(s.codice, s.note, s.titolo);
        const cl = codeLinesHtml(s.codice, items);
        const k = li++;
        codeBlocks.push({ k, s });
        return `<section class="code-block" data-cb="${k}">
          <div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span class="file-name">${icon('code', 'sm')}${esc(s.titolo)}</span><span class="spacer"></span>
            ${s.esegui ? `<button type="button" class="btn sm purple" data-run="${k}">${icon('bug', 'sm')}Esegui passo-passo</button>` : ''}
            <button type="button" class="btn sm" data-open="${k}">${icon('open', 'sm')}Apri nell'Editor</button></div>
          <div class="code-lines">${cl.html}</div>
          <div class="debugger" data-dbg="${k}" hidden></div>
        </section>`;
      }
      if (s.tipo === 'norma') {
        return `<section class="norma"><span class="norma-ic">${icon('shield')}</span><div><h4>Regola di Buona Norma</h4><p class="it-text">${rich(s.it)}</p>${arP(s.ar)}</div></section>`;
      }
      if (s.tipo === 'schema') {
        return `<section class="card schema"><div class="schema-cap"><div class="section-title">Schema: Stack e Heap</div>
          <p class="it-text">Dopo <code dir="ltr">Punto p2 = p1;</code> due riferimenti sullo Stack puntano allo stesso oggetto nello Heap.</p>
          ${arP('بعد `Punto p2 = p1;` يوجد مرجعان في الـStack يشيران إلى نفس الكائن في الـHeap: أي تعديل عبر أحدهما يظهر عبر الآخر.')}</div>
          <div class="schema-mem"></div></section>`;
      }
      return '';
    }).join('');
    const ex = l.esercizio;
    const passed = !!state.passed[l.id];
    $('#view-lezioni').innerHTML = `
      <article class="lesson stack-lg">
        <div class="stack-sm">
          <nav class="crumbs"><a href="#/lezioni">Lezioni</a>${icon('right')}<a href="#/lezioni/${m.id}">Modulo ${m.numero}</a>${icon('right')}<span>Lezione ${m.lezioni.indexOf(l) + 1}</span></nav>
          <div class="eyebrow" style="color:${m.colore}">Modulo ${m.numero} · ${esc(m.titolo)}</div>
          <h1 class="h1">${esc(l.titolo)}</h1>
          <div class="row"><span class="pill neutral">${icon('clock', 'sm')} ${esc(l.durata)}</span>${state.done[l.id] ? '<span class="pill ok">✓ Completata</span>' : ''}
            <span class="hint-chip">${icon('lang', 'sm')} Tocca ogni frase o riga di codice <span class="ar" dir="rtl" lang="ar">· اضغط للشرح بالعربية</span></span></div>
        </div>
        ${secHtml}
        ${ex ? `<section class="exercise-card">
          <div class="row"><span class="pill ok">${icon('target', 'sm')} Esercizio</span>${passed ? '<span class="pill ok">✓ Superato</span>' : ''}</div>
          <h2 class="h2" style="margin-top:10px">${esc(ex.titolo)}</h2>
          <p class="it-text" style="margin:0">${rich(ex.consegna)}</p>
          ${arP(ex.consegnaAr)}
          <div class="row" style="margin-top:12px"><button type="button" class="btn primary" id="btnDoEx">${icon('code')}Svolgi nell'Editor</button></div>
        </section>` : ''}
        <div class="lesson-nav">
          ${prev ? `<a class="btn ghost" href="#/lezioni/${prev.m.id}/${prev.l.id}">${icon('left')}${esc(prev.l.titolo)}</a>` : '<span></span>'}
          <button type="button" class="btn ${state.done[l.id] ? 'success' : 'gold'}" id="btnDone">${icon('check')}${state.done[l.id] ? 'Lezione completata' : 'Segna come completata'}</button>
          ${next ? `<a class="btn ghost" href="#/lezioni/${next.m.id}/${next.l.id}">${esc(next.l.titolo)}${icon('right')}</a>` : '<span></span>'}
        </div>
      </article>`;

    const schema = $('.schema-mem');
    if (schema) {
      renderMemory(schema, {
        frames: [{ name: 'Memoria.main()', line: 25, vars: [
          { name: 'args', type: 'String[]', val: '@4e70', ref: '@4e70' },
          { name: 'a', type: 'int', val: '5' }, { name: 'b', type: 'int', val: '6' },
          { name: 'p1', type: 'Punto', val: '@5241', ref: '@5241' }, { name: 'p2', type: 'Punto', val: '@5241', ref: '@5241' }] }],
        statics: [],
        heap: [
          { addr: '@4e70', label: 'String[0]', kind: 'array', fields: [] },
          { addr: '@5241', label: 'Punto', kind: 'obj', fields: [{ name: 'x', access: 'private', val: '11' }, { name: 'y', access: 'private', val: '2' }] }],
        memAr: 'المتغيرات البدائية `a` و `b` تحتوي على قيمها مباشرة في الـStack، بينما `p1` و `p2` يحتويان على نفس العنوان `@5241`، أي يشيران إلى كائن `Punto` واحد في الـHeap.',
      });
    }

    $$('[data-run]').forEach((b) => b.addEventListener('click', () => {
      const k = +b.dataset.run;
      const block = $(`[data-cb="${k}"]`);
      const host = $(`[data-dbg="${k}"]`, block);
      if (!host.hidden) {
        host.hidden = true;
        $$('.code-line.active', block).forEach((e) => e.classList.remove('active'));
        b.innerHTML = `${icon('bug', 'sm')}Esegui passo-passo`;
        return;
      }
      host.hidden = false;
      b.innerHTML = `${icon('x', 'sm')}Chiudi debugger`;
      host.innerHTML = '<div class="dbg-host"></div><div class="dbg-exp"></div><div class="dbg-tabs seg" role="tablist"><button type="button" class="active" data-t="mem">' + icon('cpu') + 'Memoria JVM</button><button type="button" data-t="con">' + icon('terminal') + 'Console</button></div><div class="dbg-mem"></div><div class="dbg-console" hidden></div>';
      $$('.dbg-tabs button', host).forEach((tb) => tb.addEventListener('click', () => {
        $$('.dbg-tabs button', host).forEach((x) => x.classList.toggle('active', x === tb));
        $('.dbg-mem', host).hidden = tb.dataset.t !== 'mem';
        $('.dbg-console', host).hidden = tb.dataset.t !== 'con';
        if (tb.dataset.t === 'mem') memHosts.forEach((h) => h.isConnected && drawArrows(h, h.dataset.memId));
      }));
      const pl = new Player({
        bar: $('.dbg-host', host), explain: $('.dbg-exp', host), console: $('.dbg-console', host), mem: $('.dbg-mem', host),
        onLine: (ln) => {
          $$('.code-line.active', block).forEach((e) => e.classList.remove('active'));
          const el = ln && $(`.code-line[data-ln="${ln}"]`, block);
          if (el) { el.classList.add('active'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        },
      });
      lessonPlayers.push(pl);
      pl.load(JVM.run(codeBlocks[k].s.codice), false);
      addXp(2);
    }));
    $$('[data-open]').forEach((b) => b.addEventListener('click', () => {
      const cb = codeBlocks[+b.dataset.open];
      editor.load(cb.s.codice, cb.s.titolo, null);
      location.hash = '#/editor';
    }));
    const bd = $('#btnDone');
    bd.addEventListener('click', () => {
      if (!state.done[l.id]) {
        state.done[l.id] = true;
        store.set('done', state.done);
        addXp(20, 'lezione completata');
        renderLesson(mid, lid);
      }
    });
    const be = $('#btnDoEx');
    if (be) be.addEventListener('click', () => {
      editor.startExercise(l);
      location.hash = '#/editor';
    });
  }

  // ───────────────────────── Editor Java ─────────────────────────
  const DEFAULT_CODE = C.esempi[0].codice;
  const editor = {
    built: false,
    code: '',
    file: 'Main.java',
    mode: 'edit',
    findings: [],
    lastRes: null,
    lastRunCode: null,
    activeLine: null,
    exercise: null,
    player: null,
    lintTimer: null,

    build() {
      const v = $('#view-editor');
      v.innerHTML = `
        <div class="editor-top">
          <div><div class="eyebrow">Ambiente di sviluppo</div><h1 class="h1">Editor Java</h1>
            <p class="lead">Scrivi il codice, poi «Analizza & Esegui» oppure seguilo riga per riga con il debugger.</p>
            ${arP('اكتب الكود ثم اضغط «Analizza & Esegui»، أو نفّذه خطوة بخطوة لمشاهدة الـStack والـHeap. في «Vista interattiva» اضغط على أي سطر لشرحه بالعربية.')}</div>
          <select class="select" id="exSel" aria-label="Carica un esempio">
            <option value="">Carica un esempio…</option>
            ${C.esempi.map((e) => `<option value="${e.id}">${esc(e.titolo)}</option>`).join('')}
          </select>
        </div>
        <div class="editor-layout">
          <div class="pane card pane-code">
            <div class="pane-head">
              <span class="file-tab"><span class="dot"></span><span id="fileName">Main.java</span></span>
              <span class="spacer"></span>
              <div class="seg" role="tablist" aria-label="Modalità editor">
                <button type="button" data-mode="edit" class="active">${icon('edit')}Modifica</button>
                <button type="button" data-mode="inspect">${icon('eye')}Vista interattiva</button>
              </div>
            </div>
            <div id="exBanner" class="exercise-banner" hidden></div>
            <div class="code-editor" id="ce">
              <div class="ce-scroll" id="ceScroll">
                <div class="ce-gutter" id="ceGutter" aria-hidden="true"></div>
                <div class="ce-area">
                  <pre class="ce-hl" id="ceHl" aria-hidden="true"></pre>
                  <textarea class="ce-input" id="ceInput" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" dir="ltr" aria-label="Codice Java"></textarea>
                </div>
              </div>
            </div>
            <div class="inspect" id="inspect" hidden></div>
            <div class="editor-actions">
              <button type="button" class="btn primary" id="btnRun" title="Ctrl+Invio">${icon('play')}Analizza &amp; Esegui</button>
              <button type="button" class="btn purple" id="btnDebug">${icon('bug')}Passo-Passo (Debug)</button>
              <button type="button" class="btn-icon" id="btnClear" title="Nuovo file" aria-label="Nuovo file">${icon('refresh')}</button>
            </div>
          </div>
          <div class="pane card pane-out">
            <div class="debugger" id="edDbg" hidden></div>
            <div id="edExplain"></div>
            <div class="out-tabs" role="tablist">
              <button type="button" class="active" data-tab="console">${icon('terminal')}Console</button>
              <button type="button" data-tab="feedback">${icon('cap')}Feedback del Professore <span class="count zero" id="fbCount">0</span></button>
              <button type="button" data-tab="memoria">${icon('cpu')}Memoria JVM</button>
            </div>
            <div data-panel="console"><div id="edConsole"><pre class="console"><span class="console-empty">Premi «Analizza &amp; Esegui» (Ctrl+Invio) per compilare ed eseguire il codice.</span></pre></div>
              <div class="sim-note">${icon('info', 'sm')} Simulatore JVM didattico: esegue un sottoinsieme di Java direttamente nel browser.</div></div>
            <div data-panel="feedback" hidden id="edFeedback"></div>
            <div data-panel="memoria" hidden id="edMem"><div class="mem-empty" style="margin:12px">Esegui il codice per vedere Stack e Heap.</div></div>
          </div>
        </div>`;
      this.ta = $('#ceInput');
      this.hl = $('#ceHl');
      this.gutter = $('#ceGutter');
      this.scroll = $('#ceScroll');
      this.player = new Player({
        bar: $('#edDbg'), explain: $('#edExplain'), console: $('#edConsole'), mem: $('#edMem'),
        onLine: (ln) => this.setActiveLine(ln),
      });
      this.ta.addEventListener('input', () => this.onInput());
      this.ta.addEventListener('keydown', (e) => this.onKey(e));
      this.ta.addEventListener('click', () => this.ensureCaret());
      $('#exSel').addEventListener('change', (e) => {
        const ex = C.esempi.find((x) => x.id === e.target.value);
        if (ex) {
          this.exercise = null;
          this.load(ex.codice, null, null);
          toast('Esempio caricato: ' + ex.titolo.replace(/^⚠\s*/, ''));
        }
        e.target.value = '';
      });
      $$('.seg [data-mode]', v).forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.mode)));
      $$('.out-tabs [data-tab]', v).forEach((b) => b.addEventListener('click', () => this.tab(b.dataset.tab)));
      $('#btnRun').addEventListener('click', () => this.run(false));
      $('#btnDebug').addEventListener('click', () => this.run(true));
      $('#btnClear').addEventListener('click', () => {
        this.exercise = null;
        this.load('public class Main {\n\n    public static void main(String[] args) {\n        \n    }\n}\n', 'Main.java', null);
        this.ta.focus();
        this.ta.setSelectionRange(68, 68);
      });
      $('#edFeedback').addEventListener('click', (e) => {
        const fx = e.target.closest('[data-fix]');
        if (fx) { this.applyFix(fx.dataset.fix); return; }
        if (e.target.closest('#fixAll')) { this.fixAll(); return; }
        const ll = e.target.closest('[data-line]');
        if (ll) this.gotoLine(+ll.dataset.line);
      });
      $('#exBanner').addEventListener('click', (e) => {
        const a = e.target.closest('[data-ex]');
        if (!a) return;
        if (a.dataset.ex === 'check') this.checkExercise();
        else if (a.dataset.ex === 'sol') {
          this.setCode(this.exercise.l.esercizio.soluzione);
          toast('Soluzione caricata: studiala riga per riga in «Vista interattiva»');
        } else if (a.dataset.ex === 'reset') this.setCode(this.exercise.l.esercizio.codice);
        else if (a.dataset.ex === 'exit') { this.exercise = null; this.renderBanner(); this.updateFile(); }
        else if (a.dataset.ex === 'back') location.hash = `#/lezioni/${this.exercise.m.id}/${this.exercise.l.id}`;
      });
      window.addEventListener('resize', () => this.syncSize());
      this.built = true;
      const saved = store.get('editor', null);
      if (saved && saved.code) {
        if (saved.ex) {
          const f = findLesson(saved.ex);
          if (f) this.exercise = { m: f.m, l: f.l };
        }
        this.load(saved.code, saved.file, this.exercise);
      } else this.load(DEFAULT_CODE, null, null);
    },

    show() {
      if (!this.built) this.build();
      requestAnimationFrame(() => {
        this.syncSize();
        memHosts.forEach((h) => h.isConnected && drawArrows(h, h.dataset.memId));
      });
    },

    load(code, file, exercise) {
      if (!this.built) this.build();
      if (exercise !== undefined) this.exercise = exercise;
      this.file = file || this.guessFile(code);
      this.renderBanner();
      this.setCode(code);
      this.resetOutput();
      if (this.mode === 'inspect') this.renderInspect();
    },

    startExercise(l) {
      const f = findLesson(l.id);
      this.exercise = { m: f.m, l: f.l };
      const draft = store.get('draft.' + l.id, null);
      this.load(draft || l.esercizio.codice, null, this.exercise);
      this.setMode('edit');
    },

    guessFile(code) {
      const m = /public\s+(?:final\s+|abstract\s+)*class\s+(\w+)/.exec(code) || /class\s+(\w+)/.exec(code);
      return (m ? m[1] : 'Main') + '.java';
    },
    updateFile() {
      this.file = this.guessFile(this.code);
      $('#fileName').textContent = this.file;
    },

    setCode(code) {
      this.code = code.replace(/\r\n?/g, '\n').replace(/\t/g, '    ');
      this.ta.value = this.code;
      this.invalidateRun();
      this.refresh();
      this.lint();
      this.persist();
    },

    persist() {
      store.set('editor', { code: this.code, file: this.file, ex: this.exercise ? this.exercise.l.id : null });
      if (this.exercise) store.set('draft.' + this.exercise.l.id, this.code);
    },

    onInput() {
      this.code = this.ta.value;
      this.invalidateRun();
      this.refresh();
      this.ensureCaret();
      clearTimeout(this.lintTimer);
      this.lintTimer = setTimeout(() => { this.lint(); this.persist(); this.updateFile(); }, 350);
    },

    onKey(e) {
      const ta = this.ta;
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); this.run(false); return; }
      const insert = (text) => {
        ta.focus();
        let ok = false;
        try { ok = document.execCommand('insertText', false, text); } catch (err) { ok = false; }
        if (!ok) {
          ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
          this.onInput();
        }
      };
      if (e.key === 'Tab') {
        e.preventDefault();
        insert('    ');
      } else if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
        const before = ta.value.slice(0, ta.selectionStart);
        const line = before.slice(before.lastIndexOf('\n') + 1);
        let ind = (line.match(/^\s*/) || [''])[0];
        if (/\{\s*$/.test(line)) ind += '    ';
        e.preventDefault();
        insert('\n' + ind);
      } else if (e.key === '}') {
        const before = ta.value.slice(0, ta.selectionStart);
        const line = before.slice(before.lastIndexOf('\n') + 1);
        if (/^\s{4,}$/.test(line) && ta.selectionStart === ta.selectionEnd) {
          e.preventDefault();
          ta.setSelectionRange(ta.selectionStart - 4, ta.selectionStart);
          insert('}');
        }
      }
    },

    lineHeight() { return parseFloat(getComputedStyle(this.hl).lineHeight) || 22; },
    charWidth() {
      if (!this._cw) {
        const s = document.createElement('span');
        s.style.cssText = 'position:absolute;visibility:hidden;font-family:var(--font-code);font-size:var(--code-fs);white-space:pre';
        s.textContent = 'MMMMMMMMMM';
        document.body.appendChild(s);
        this._cw = s.getBoundingClientRect().width / 10 || 8;
        s.remove();
      }
      return this._cw;
    },
    ensureCaret() {
      const ta = this.ta, sc = this.scroll;
      const pos = ta.selectionStart;
      const before = ta.value.slice(0, pos);
      const line = before.split('\n').length - 1;
      const col = pos - before.lastIndexOf('\n') - 1;
      const lh = this.lineHeight();
      const top = 12 + line * lh;
      if (top < sc.scrollTop) sc.scrollTop = Math.max(0, top - 8);
      else if (top + lh > sc.scrollTop + sc.clientHeight) sc.scrollTop = top + lh - sc.clientHeight + 8;
      const left = 14 + col * this.charWidth();
      const gw = this.gutter.offsetWidth;
      const visW = sc.clientWidth - gw;
      if (left < sc.scrollLeft + 10) sc.scrollLeft = Math.max(0, left - 30);
      else if (left > sc.scrollLeft + visW - 20) sc.scrollLeft = left - visW + 40;
    },

    refresh() {
      const lines = EXP.highlight(this.code);
      const byLine = this.lintByLine();
      this.hl.innerHTML = lines.map((h, i) => {
        const f = byLine[i + 1];
        const cls = (f ? ' lint-' + f[0].severity : '') + (this.activeLine === i + 1 ? ' active' : '');
        return `<span class="l${cls}">${h}</span>`;
      }).join('');
      this.gutter.innerHTML = lines.map((_, i) => {
        const f = byLine[i + 1];
        return `<div class="${f ? 'sev-' + f[0].severity : ''}" title="${f ? esc(f.map((x) => x.titolo).join(' · ')) : ''}">${i + 1}</div>`;
      }).join('');
      this.syncSize();
    },
    syncSize() {
      if (!this.hl) return;
      this.ta.style.height = this.hl.offsetHeight + 'px';
    },

    lintByLine() {
      const map = {};
      const order = { errore: 0, avviso: 1, suggerimento: 2 };
      for (const f of this.findings) (map[f.line] = map[f.line] || []).push(f);
      for (const k in map) map[k].sort((a, b) => order[a.severity] - order[b.severity]);
      return map;
    },

    lint() {
      try { this.findings = LINT.analizza(this.code); } catch (e) { this.findings = []; }
      this.refresh();
      const n = this.findings.length;
      const c = $('#fbCount');
      c.textContent = n;
      c.classList.toggle('zero', n === 0);
      this.renderFeedback();
      if (this.mode === 'inspect') this.renderInspect();
    },

    invalidateRun() {
      if (this.lastRunCode !== null && this.lastRunCode !== this.code) {
        this.lastRunCode = null;
        this.lastRes = null;
        this.player.stop();
        $('#edDbg').hidden = true;
        $('#edExplain').innerHTML = '';
        this.activeLine = null;
      }
    },

    resetOutput() {
      this.lastRes = null;
      this.lastRunCode = null;
      this.activeLine = null;
      if (this.player) this.player.stop();
      $('#edDbg').hidden = true;
      $('#edExplain').innerHTML = '';
      $('#edConsole').innerHTML = '<pre class="console"><span class="console-empty">Premi «Analizza &amp; Esegui» (Ctrl+Invio) per compilare ed eseguire il codice.</span></pre>';
      $('#edMem').innerHTML = '<div class="mem-empty" style="margin:12px">Esegui il codice per vedere Stack e Heap.</div>';
      $('#fileName').textContent = this.file;
      this.refresh();
      this.renderFeedback();
    },

    setActiveLine(ln) {
      this.activeLine = ln && ln > 0 ? ln : null;
      $$('.ce-hl .l.active').forEach((e) => e.classList.remove('active'));
      if (this.activeLine) {
        const el = this.hl.children[this.activeLine - 1];
        if (el) {
          el.classList.add('active');
          if (this.mode === 'edit') {
            const lh = this.lineHeight(), top = 12 + (this.activeLine - 1) * lh, sc = this.scroll;
            if (top < sc.scrollTop || top + lh > sc.scrollTop + sc.clientHeight) sc.scrollTop = Math.max(0, top - sc.clientHeight / 3);
          }
        }
      }
      if (this.mode === 'inspect') {
        $$('#inspect .code-line.active').forEach((e) => e.classList.remove('active'));
        const el = this.activeLine && $(`#inspect .code-line[data-ln="${this.activeLine}"]`);
        if (el) { el.classList.add('active'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      }
    },

    setMode(mode) {
      this.mode = mode;
      $$('#view-editor .seg [data-mode]').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
      $('#ce').hidden = mode !== 'edit';
      $('#inspect').hidden = mode !== 'inspect';
      if (mode === 'inspect') this.renderInspect();
      else requestAnimationFrame(() => this.syncSize());
    },

    renderInspect() {
      const byLine = this.lintByLine();
      const items = codeItems(this.code, null, this.file).map((it) => (it ? { ...it, lint: byLine[it.lineNo] || [] } : null));
      const cl = codeLinesHtml(this.code, items, { lintByLine: byLine });
      $('#inspect').innerHTML = `<div class="inspect-hint">${icon('lang', 'sm')} Tocca una riga per la spiegazione <span class="ar" dir="rtl" lang="ar">· اضغط على أي سطر لشرحه بالعربية</span></div><div class="code-lines">${cl.html}</div>`;
      if (this.activeLine) this.setActiveLine(this.activeLine);
    },

    tab(name) {
      $$('#view-editor .out-tabs [data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
      $$('#view-editor [data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== name; });
      if (name === 'memoria') requestAnimationFrame(() => { const h = $('#edMem'); if (h.dataset.memId) drawArrows(h, h.dataset.memId); });
    },

    run(debug) {
      this.code = this.ta.value;
      this.lint();
      const res = JVM.run(this.code);
      this.lastRes = res;
      this.lastRunCode = this.code;
      this.player.load(res, !debug);
      this.renderFeedback();
      if (debug) {
        if (res.trace.length) { this.tab('memoria'); this.setMode('inspect'); toast('Debugger avviato: usa Avanti ▶ per eseguire passo per passo'); }
        else this.tab('console');
      } else {
        this.tab('console');
        const v = LINT.calcolaVoto(this.findings, res);
        toast(res.error && res.error.type === 'compile' ? '✗ Errore di compilazione' : `Voto: ${v.lode ? '30 e Lode 🏆' : v.voto + '/30'} · ${this.findings.length} segnalazioni`, v.superato ? 'ok' : '');
      }
      if (res.error && res.error.line && res.error.type === 'compile') this.gotoLine(res.error.line, true);
      addXp(2);
    },

    renderFeedback() {
      const host = $('#edFeedback');
      if (!host) return;
      const res = this.lastRunCode === this.code ? this.lastRes : null;
      const v = LINT.calcolaVoto(this.findings, res || undefined);
      const color = v.lode ? '#F2CC60' : v.superato ? '#3FB950' : '#F85149';
      const fixable = this.findings.filter((f) => f.fix).length;
      const counts = { errore: 0, avviso: 0, suggerimento: 0 };
      this.findings.forEach((f) => { counts[f.severity]++; });
      const label = v.lode ? '30L' : String(v.voto);
      const giudizioAr = { '30 e Lode': 'ممتاز مع مرتبة الشرف', Ottimo: 'ممتاز', Buono: 'جيد', Sufficiente: 'مقبول', Respinto: 'راسب' }[v.giudizio];
      host.innerHTML = `
        <div class="grade">
          ${ringSvg(v.voto / 30, color, label, '/ 30', v.lode ? 'lode' : '')}
          <div class="grade-text">
            <h4>${v.lode ? '30 e Lode 🏆' : `Voto: ${v.voto}/30`} — ${esc(v.giudizio)}</h4>
            <p>${counts.errore} errori · ${counts.avviso} avvisi · ${counts.suggerimento} suggerimenti${res ? '' : ' · <i>esegui il codice per il voto definitivo</i>'}</p>
            <p class="ar" dir="rtl" lang="ar">التقدير: ${giudizioAr} (${v.voto}/30)${fixable ? ` · يمكن تصحيح ${fixable} ملاحظات تلقائياً` : ''}</p>
          </div>
          <span class="spacer"></span>
          ${fixable ? `<button type="button" class="btn sm gold" id="fixAll">${icon('wand', 'sm')}Correggi tutto (${fixable})</button>` : ''}
        </div>
        ${this.findings.length ? `<div class="findings">${this.findings.map((f) => `
          <div class="finding ${f.severity}">
            <div class="finding-h"><span class="pill ${f.severity}">${f.severity}</span><span class="h3">${esc(f.titolo)}</span><span class="spacer"></span><button type="button" class="line-link" data-line="${f.line}">riga ${f.line}</button></div>
            <p class="it-text">${rich(f.it)}</p>
            ${arP(f.ar)}
            ${f.suggestedFix ? `<div class="diff"><div class="minus">${esc(f.badSnippet)}</div><div class="plus">${esc(f.suggestedFix)}</div></div>` : ''}
            ${f.fix ? `<button type="button" class="btn sm success" data-fix="${esc(f.id)}">${icon('wand', 'sm')}Applica Correzione</button>` : ''}
          </div>`).join('')}</div>`
        : `<div class="all-good">${icon('check')}<h4 class="h3" style="margin-top:8px">Nessuna violazione di Buona Norma</h4><p class="muted">Codice pulito: il professore approva!</p>${arP('الكود نظيف ويتبع قواعد البرمجة الجيدة!')}</div>`}`;
    },

    applyFix(id) {
      const f = this.findings.find((x) => x.id === id);
      if (!f) return;
      const hadRun = this.lastRunCode !== null;
      this.setCode(LINT.applicaCorrezione(this.code, f));
      this.updateFile();
      addXp(5, 'correzione applicata');
      if (hadRun) this.rerunQuiet();
    },

    fixAll() {
      const hadRun = this.lastRunCode !== null;
      let code = this.code;
      let n = 0;
      for (let guard = 0; guard < 60; guard++) {
        const fs = LINT.analizza(code).filter((x) => x.fix);
        if (!fs.length) break;
        code = LINT.applicaCorrezione(code, fs[0]);
        n++;
      }
      this.setCode(code);
      this.updateFile();
      addXp(Math.min(30, n * 3), `${n} correzioni applicate`);
      if (hadRun) this.rerunQuiet();
    },

    rerunQuiet() {
      const res = JVM.run(this.code);
      this.lastRes = res;
      this.lastRunCode = this.code;
      this.player.load(res, true);
      this.renderFeedback();
    },

    gotoLine(n, silent) {
      if (this.mode !== 'edit') this.setMode('edit');
      const lines = this.code.split('\n');
      let pos = 0;
      for (let i = 0; i < n - 1 && i < lines.length; i++) pos += lines[i].length + 1;
      const end = pos + (lines[n - 1] || '').length;
      if (!silent) this.ta.focus({ preventScroll: true });
      this.ta.setSelectionRange(pos, end);
      this.ensureCaret();
      const el = this.hl.children[n - 1];
      if (el) {
        el.classList.add('active');
        setTimeout(() => { if (this.activeLine !== n) el.classList.remove('active'); }, 1400);
      }
    },

    renderBanner() {
      const b = $('#exBanner');
      if (!this.exercise) { b.hidden = true; b.innerHTML = ''; return; }
      const { m, l } = this.exercise;
      const ex = l.esercizio;
      b.hidden = false;
      b.innerHTML = `
        <div class="row"><span class="pill ok">${icon('target', 'sm')} Esercizio · Modulo ${m.numero}</span>${state.passed[l.id] ? '<span class="pill ok">✓ Superato</span>' : ''}<span class="spacer"></span>
          <button type="button" class="btn sm ghost" data-ex="back">${icon('back', 'sm')}Lezione</button><button type="button" class="btn sm ghost" data-ex="exit">${icon('x', 'sm')}Esci</button></div>
        <h3 class="h3" style="margin-top:8px">${esc(ex.titolo)}</h3>
        <p class="it-text">${rich(ex.consegna)}</p>
        ${arP(ex.consegnaAr)}
        <div class="row" style="margin-top:10px">
          <button type="button" class="btn sm success" data-ex="check">${icon('check', 'sm')}Verifica Esercizio</button>
          <button type="button" class="btn sm ghost" data-ex="reset">${icon('refresh', 'sm')}Ricomincia</button>
          <button type="button" class="btn sm ghost" data-ex="sol">${icon('eye', 'sm')}Mostra soluzione</button>
        </div>
        <div id="exResult"></div>`;
    },

    checkExercise() {
      const { l } = this.exercise;
      this.code = this.ta.value;
      const r = VER.verificaEsercizio(this.code, l.esercizio, { run: JVM.run, analizza: LINT.analizza });
      this.lint();
      this.lastRes = r.esito;
      this.lastRunCode = this.code;
      this.player.load(r.esito, true);
      this.renderFeedback();
      $('#exResult').innerHTML = `
        <div class="checks">${r.risultati.map((c) => `<div class="check ${c.ok ? 'ok' : 'ko'}">${icon(c.ok ? 'check' : 'x')}<div><span class="it-text">${rich(c.msg)}</span><span class="ar" dir="rtl" lang="ar">${rich(c.msgAr)}</span></div></div>`).join('')}</div>
        <div class="result-banner ${r.superato ? 'ok' : 'ko'}">${icon(r.superato ? 'trophy' : 'alert')}${r.superato ? 'Superato ✔ — ottimo lavoro!' : 'Da rivedere: controlla i punti segnati in rosso.'}</div>`;
      if (r.superato && !state.passed[l.id]) {
        state.passed[l.id] = true;
        store.set('passed', state.passed);
        addXp(30, 'esercizio superato');
        this.renderBanner();
        this.checkExercise();
      }
    },
  };

  // ───────────────────────── Esame ─────────────────────────
  const exam = { mode: 'caccia', idx: 0, score: 0, answered: false, sessionCorrect: {} };

  function renderExam() {
    const v = $('#view-esame');
    v.dataset.ready = '1';
    const modes = [
      { id: 'caccia', ic: 'target', col: '#F85149', t: 'Caccia all\'errore', d: 'Trova la riga che viola la Buona Norma.', ar: 'اكتشف السطر الذي يخالف قواعد البرمجة الجيدة' },
      { id: 'output', ic: 'terminal', col: '#58A6FF', t: 'Cosa stampa questo codice?', d: 'Prevedi l\'output: OOP, polimorfismo, eccezioni.', ar: 'توقّع ما سيطبعه الكود' },
      { id: 'orale', ic: 'mic', col: '#A371F7', t: 'Domande Esame Orale', d: 'Le domande più frequenti con risposta modello.', ar: 'أسئلة الامتحان الشفهي مع الإجابة النموذجية' },
    ];
    v.innerHTML = `
      <div class="stack-sm"><div class="eyebrow">Simulazione d'esame</div><h1 class="h1">Prova scritta e orale · verso il 30 e Lode</h1>
      <p class="lead">Allenati con le tipologie di domande dei corsi universitari italiani di Programmazione.</p>
      ${arP('تدرّب على نوعية الأسئلة الحقيقية في امتحانات البرمجة بالجامعات الإيطالية: الكتابي والشفهي.')}</div>
      <div class="exam-modes">${modes.map((m) => `<button type="button" class="mode-card ${exam.mode === m.id ? 'active' : ''}" data-mode="${m.id}" style="--mc:${m.col}"><span class="module-icon">${icon(m.ic, 'lg')}</span><div class="h3">${m.t}</div><p>${m.d}</p>${arP(m.ar)}</button>`).join('')}</div>
      <div id="examArea"></div>`;
    $$('.mode-card', v).forEach((b) => b.addEventListener('click', () => {
      exam.mode = b.dataset.mode;
      exam.idx = 0; exam.score = 0; exam.answered = false;
      $$('.mode-card', v).forEach((x) => x.classList.toggle('active', x === b));
      renderExamQ();
    }));
    renderExamQ();
  }

  function examHead(n, label) {
    return `<div class="q-head"><span class="pill neutral">${label} ${Math.min(exam.idx + 1, n)} / ${n}</span>
      <div class="q-progress progress"><span style="width:${(exam.idx / n) * 100}%;--mc:#A371F7"></span></div>
      <span class="score-pill">Punteggio: ${exam.score}</span></div>`;
  }

  function examSummary(n) {
    const voto = Math.round((exam.score / n) * 30);
    const lode = exam.score === n;
    return `<div class="card q-card" style="text-align:center">
      <div style="display:grid;place-items:center">${ringSvg(voto / 30, lode ? '#F2CC60' : voto >= 18 ? '#3FB950' : '#F85149', lode ? '30L' : String(voto), '/ 30', lode ? 'lode' : '')}</div>
      <h2 class="h2" style="margin-top:12px">${lode ? '30 e Lode! 🏆' : voto >= 18 ? `Promosso con ${voto}/30` : `Respinto (${voto}/30): ripassa e riprova`}</h2>
      <p class="muted">${exam.score} risposte corrette su ${n}</p>
      ${arP(lode ? 'ممتاز مع مرتبة الشرف! إجابات صحيحة بالكامل.' : voto >= 18 ? 'ناجح! راجع الأخطاء لتحسين درجتك.' : 'لم تنجح هذه المرة: راجع الدروس ثم أعد المحاولة.')}
      <button type="button" class="btn primary" id="examRestart" style="margin-top:12px">${icon('refresh')}Ricomincia</button></div>`;
  }

  function renderExamQ() {
    const area = $('#examArea');
    const list = EXAM[exam.mode];
    const n = list.length;
    if (exam.mode !== 'orale' && exam.idx >= n) {
      area.innerHTML = examSummary(n);
      $('#examRestart').addEventListener('click', () => { exam.idx = 0; exam.score = 0; exam.answered = false; renderExamQ(); });
      return;
    }
    exam.answered = false;
    const q = list[exam.idx];
    if (exam.mode === 'caccia') {
      const items = codeItems(q.codice, null, q.titolo);
      const cl = codeLinesHtml(q.codice, items, { noTap: true, pick: true });
      area.innerHTML = `<div class="card q-card">
        ${examHead(n, 'Domanda')}
        <h2 class="h2">${esc(q.titolo)}: tocca la riga che viola la Buona Norma</h2>
        ${arP('اضغط على السطر الذي يحتوي على المخالفة')}
        <section class="code-block" style="margin-top:12px"><div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span class="file-name">${icon('code', 'sm')}Esercizio.java</span></div><div class="code-lines">${cl.html}</div></section>
        <div id="qReveal"></div></div>`;
      $$('[data-pick]', area).forEach((el) => {
        const pick = () => {
          if (exam.answered) return;
          exam.answered = true;
          const ln = +el.dataset.pick;
          const ok = ln === q.riga;
          el.classList.add(ok ? 'pick-right' : 'pick-wrong');
          if (!ok) { const r = $(`[data-pick="${q.riga}"]`, area); if (r) r.classList.add('pick-right'); }
          if (ok) { exam.score++; addXp(10, 'risposta corretta'); }
          revealExam(ok, q);
        };
        el.addEventListener('click', pick);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
    } else if (exam.mode === 'output') {
      const items = codeItems(q.codice, null, 'Main.java');
      const cl = codeLinesHtml(q.codice, items);
      area.innerHTML = `<div class="card q-card">
        ${examHead(n, 'Domanda')}
        <h2 class="h2">${esc(q.titolo)}: cosa stampa questo codice?</h2>
        ${arP('ماذا يطبع هذا الكود؟ (يمكنك الضغط على أي سطر لشرحه)')}
        <section class="code-block" style="margin-top:12px"><div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span class="file-name">${icon('code', 'sm')}Main.java</span></div><div class="code-lines">${cl.html}</div></section>
        <div class="options">${q.opzioni.map((o, i) => `<button type="button" class="option" data-opt="${i}"><span class="opt-k">${'ABCD'[i]}</span>${esc(o)}</button>`).join('')}</div>
        <div id="qReveal"></div></div>`;
      $$('[data-opt]', area).forEach((b) => b.addEventListener('click', () => {
        if (exam.answered) return;
        exam.answered = true;
        const i = +b.dataset.opt;
        const ok = i === q.corretta;
        $$('[data-opt]', area).forEach((x) => { x.disabled = true; });
        b.classList.add(ok ? 'right' : 'wrong');
        $(`[data-opt="${q.corretta}"]`, area).classList.add('right');
        if (ok) { exam.score++; addXp(10, 'risposta corretta'); }
        revealExam(ok, q, true);
      }));
    } else {
      const it = { kind: 'domanda', src: q.d, t: 'Domanda d\'esame orale', ar: q.ar, ex: q.r, meta: 'Esame orale' };
      area.innerHTML = `<div class="card q-card">
        <div class="q-head"><span class="pill neutral">Domanda ${exam.idx + 1} / ${n}</span><div class="q-progress progress"><span style="width:${((exam.idx + 1) / n) * 100}%"></span></div></div>
        <h2 class="h2" style="font-size:22px">${esc(q.d)}</h2>
        <div class="row" style="margin-top:10px">
          <button type="button" class="btn sm" id="qSpeak">${icon('volume', 'sm')}Ascolta la domanda</button>
          <button type="button" class="btn primary" id="qShow">${icon('eye')}Mostra risposta modello</button>
        </div>
        <div id="qReveal"></div>
        <div class="lesson-nav" style="margin-top:16px">
          <button type="button" class="btn ghost" id="qPrev" ${exam.idx === 0 ? 'disabled' : ''}>${icon('left')}Precedente</button>
          <button type="button" class="btn ghost" id="qNext" ${exam.idx === n - 1 ? 'disabled' : ''}>Successiva${icon('right')}</button>
        </div></div>`;
      $('#qSpeak').addEventListener('click', (e) => tts.speak([q.d], 'it-IT', e.currentTarget));
      $('#qPrev').addEventListener('click', () => { exam.idx--; renderExamQ(); });
      $('#qNext').addEventListener('click', () => { exam.idx++; renderExamQ(); });
      $('#qShow').addEventListener('click', () => {
        let ans = esc(q.r);
        for (const k of q.chiave) ans = ans.replace(new RegExp(esc(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), (m) => `<mark>${m}</mark>`);
        $('#qReveal').innerHTML = `<div class="reveal">
          <div class="eyebrow">Risposta modello (italiano accademico)</div>
          <p class="answer-model">${ans}</p>
          <div class="eyebrow" style="margin-top:12px">Parole chiave da citare</div>
          <div class="row" style="margin-top:6px">${q.chiave.map((k) => `<span class="pill neutral" style="text-transform:none">${esc(k)}</span>`).join('')}</div>
          <div class="eyebrow" style="margin-top:12px">الشرح المبسّط بالعربية</div>
          ${arP(q.ar)}
          <div class="row" style="margin-top:12px">
            <button type="button" class="btn sm" id="qSpeakAns">${icon('volume', 'sm')}Ascolta la risposta</button>
            <button type="button" class="btn sm success" id="qKnew">${icon('check', 'sm')}La sapevo</button>
            <button type="button" class="btn sm gold ${isSaved(it) ? 'on' : ''}" id="qSave">${icon('star', 'sm')}${isSaved(it) ? 'Salvata' : 'Da ripassare'}</button>
          </div></div>`;
        $('#qShow').disabled = true;
        $('#qSpeakAns').addEventListener('click', (e) => tts.speak([q.r], 'it-IT', e.currentTarget));
        $('#qKnew').addEventListener('click', (e) => {
          if (!exam.sessionCorrect[exam.idx]) { exam.sessionCorrect[exam.idx] = true; addXp(10, 'domanda orale'); }
          e.currentTarget.disabled = true;
        });
        $('#qSave').addEventListener('click', (e) => {
          const on = toggleSaved(it);
          e.currentTarget.innerHTML = `${icon('star', 'sm')}${on ? 'Salvata' : 'Da ripassare'}`;
        });
      });
    }
  }

  function revealExam(ok, q, withRun) {
    $('#qReveal').innerHTML = `<div class="reveal">
      <div class="result-banner ${ok ? 'ok' : 'ko'}" style="margin-top:0">${icon(ok ? 'check' : 'x')}${ok ? 'Corretto!' : 'Non corretto'}</div>
      <p class="it-text" style="margin-top:10px">${rich(q.it)}</p>
      ${arP(q.ar)}
      <div class="row" style="margin-top:12px">
        ${withRun ? `<button type="button" class="btn sm purple" id="qRun">${icon('play', 'sm')}Verifica nel simulatore</button>` : ''}
        <span class="spacer"></span>
        <button type="button" class="btn primary" id="qNextQ">${exam.idx + 1 >= EXAM[exam.mode].length ? 'Vedi il voto' : 'Avanti'}${icon('right')}</button>
      </div>
      <div id="qRunOut"></div></div>`;
    $('#qNextQ').addEventListener('click', () => { exam.idx++; renderExamQ(); });
    const r = $('#qRun');
    if (r) r.addEventListener('click', () => {
      const res = JVM.run(q.codice);
      $('#qRunOut').innerHTML = `<div class="code-block" style="margin-top:10px">${consoleHtml(res, undefined, true)}</div>`;
    });
  }

  // ───────────────────────── Glossario ─────────────────────────
  const gl = { filter: 'Tutti', q: '', flash: false };
  const CATS = ['Tutti', 'salvati', 'OOP', 'Memoria', 'Eccezioni', 'Buona Norma'];

  function glossItem(g) {
    return {
      kind: 'termine', src: g.it, t: g.it, ar: g.ar, ex: g.ex, code: g.code, cat: g.cat,
      bn: g.bn || 'Usa il termine tecnico corretto quando spieghi il codice all\'orale.',
      bnAr: 'استخدم المصطلح التقني الإيطالي الصحيح عند شرح الكود في الامتحان الشفهي.',
      meta: 'Glossario · ' + g.cat,
    };
  }

  function renderGlossary(sub) {
    if (sub === 'salvati') gl.filter = 'salvati';
    const v = $('#view-glossario');
    v.innerHTML = `
      <div class="stack-sm"><div class="eyebrow">Dizionario tecnico italiano → arabo</div><h1 class="h1">Glossario</h1>
        <p class="lead">I termini accademici da usare all'esame, con traduzione, spiegazione ed esempio di codice.</p>
        ${arP('المصطلحات الأكاديمية الإيطالية مع ترجمتها وشرحها ومثال برمجي. استخدم وضع البطاقات للمراجعة قبل الامتحان.')}</div>
      <div class="gl-tools">
        <label class="search">${icon('search')}<input type="search" id="glSearch" placeholder="Cerca un termine… / ابحث عن مصطلح" value="${esc(gl.q)}" aria-label="Cerca nel glossario"></label>
        <div class="seg"><button type="button" data-flash="0" class="${gl.flash ? '' : 'active'}">${icon('book')}Elenco</button><button type="button" data-flash="1" class="${gl.flash ? 'active' : ''}">${icon('cards')}Modalità Flashcard</button></div>
      </div>
      <div class="filters" id="glFilters"></div>
      <div id="glOut"></div>`;
    $('#glSearch').addEventListener('input', (e) => { gl.q = e.target.value; renderGlossaryList(); });
    $$('[data-flash]', v).forEach((b) => b.addEventListener('click', () => {
      gl.flash = b.dataset.flash === '1';
      $$('[data-flash]', v).forEach((x) => x.classList.toggle('active', x === b));
      renderGlossaryList();
    }));
    renderGlossaryList();
  }

  function renderGlossaryList() {
    const q = gl.q.trim().toLowerCase();
    const match = (it) => !q || [it.src, it.t, it.ar, it.ex].some((s) => String(s || '').toLowerCase().includes(q));
    const base = GLOSS.map(glossItem);
    const counts = {};
    for (const c of CATS) counts[c] = c === 'Tutti' ? base.length : c === 'salvati' ? state.saved.length : base.filter((x) => x.cat === c).length;
    $('#glFilters').innerHTML = CATS.map((c) => `<button type="button" class="filter ${gl.filter === c ? 'active' : ''}" data-cat="${c}">${c === 'salvati' ? icon('star') + '★ Da Ripassare' : esc(c)} <span class="n">${counts[c]}</span></button>`).join('');
    $$('#glFilters [data-cat]').forEach((b) => b.addEventListener('click', () => { gl.filter = b.dataset.cat; renderGlossaryList(); }));
    let items;
    if (gl.filter === 'salvati') items = state.saved.map((s) => ({ ...s, src: s.src, t: s.t || s.src }));
    else items = base.filter((x) => gl.filter === 'Tutti' || x.cat === gl.filter);
    items = items.filter(match);
    const out = $('#glOut');
    if (!items.length) {
      out.innerHTML = `<div class="empty-state">${icon(gl.filter === 'salvati' ? 'star' : 'search')}<p>${gl.filter === 'salvati' ? 'Nessun elemento salvato. Usa «★ Salva per l\'Esame» nelle spiegazioni.' : 'Nessun termine trovato.'}</p>${arP(gl.filter === 'salvati' ? 'لا توجد عناصر محفوظة بعد: استخدم زر الحفظ في نافذة الشرح.' : 'لم يتم العثور على أي مصطلح.')}</div>`;
      return;
    }
    const gid = registerGroup(items);
    if (!gl.flash) {
      out.innerHTML = `<div class="gl-list">${items.map((it, i) => `
        <button type="button" class="gl-item${isSaved(it) ? ' saved' : ''}" data-grp="${gid}" data-i="${i}">
          <div class="gl-top"><span class="h3">${esc(it.kind === 'codice' ? it.t : it.src)}</span><span class="pill neutral" style="text-transform:none">${esc(it.cat || (it.kind === 'codice' ? 'Codice' : it.kind === 'frase' ? 'Lezione' : it.kind === 'domanda' ? 'Orale' : ''))}</span></div>
          ${it.kind === 'codice' ? `<code dir="ltr" style="font-size:12px;color:var(--text-2);white-space:pre-wrap">${esc(it.src.trim())}</code>` : it.kind !== 'termine' ? `<span class="muted" style="font-size:13px">${esc(it.src)}</span>` : ''}
          <span class="ar" dir="rtl" lang="ar">${rich(it.ar)}</span>
          <span class="gl-ex ar" dir="rtl" lang="ar">${rich(it.ex)}</span>
        </button>`).join('')}</div>`;
    } else {
      out.innerHTML = `<div class="flash-grid">${items.map((it, i) => `
        <div class="flash" data-card="${i}" role="button" tabindex="0" aria-label="Flashcard: ${esc(it.t || it.src)}">
          <div class="flash-inner">
            <div class="flash-face flash-front">
              <span class="pill neutral" style="text-transform:none">${esc(it.cat || 'Ripasso')}</span>
              <div class="term">${esc(it.kind === 'codice' ? it.t : it.src)}</div>
              <div class="flash-actions">
                <button type="button" class="btn sm" data-say="${i}">${icon('volume', 'sm')}Ascolta</button>
                <button type="button" class="btn sm gold" data-star="${i}">${icon('star', 'sm')}${isSaved(it) ? 'Salvato' : 'Salva'}</button>
              </div>
              <span class="flip-hint">${icon('refresh', 'sm')} Tocca per girare</span>
            </div>
            <div class="flash-face flash-back">
              <div class="ar-title ar" dir="rtl" lang="ar">${rich(it.ar)}</div>
              <div class="ar" dir="rtl" lang="ar">${rich(it.ex)}</div>
              ${it.code || it.kind === 'codice' ? `<pre>${EXP.highlight(it.code || it.src.trim()).join('\n')}</pre>` : ''}
            </div>
          </div>
        </div>`).join('')}</div>`;
      $$('.flash', out).forEach((card) => {
        const flip = (e) => {
          if (e.target.closest('[data-say],[data-star]')) return;
          card.classList.toggle('flipped');
        };
        card.addEventListener('click', flip);
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(e); } });
      });
      $$('[data-say]', out).forEach((b) => b.addEventListener('click', () => {
        const it = items[+b.dataset.say];
        tts.speak([it.kind === 'codice' ? it.t : it.src], 'it-IT', b);
      }));
      $$('[data-star]', out).forEach((b) => b.addEventListener('click', () => {
        const it = items[+b.dataset.star];
        const on = toggleSaved(it);
        b.innerHTML = `${icon('star', 'sm')}${on ? 'Salvato' : 'Salva'}`;
        if (gl.filter === 'salvati') renderGlossaryList();
        else $$('#glFilters .filter[data-cat="salvati"] .n').forEach((n) => { n.textContent = state.saved.length; });
      }));
    }
  }

  // ───────────────────────── Avvio ─────────────────────────
  function init() {
    initStreak();
    tts.init();
    updateStats();
    initSheet();
    window.addEventListener('hashchange', route);
    route();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline non disponibile */ });
    }
  }

  window.CodeForge = { editor, sheet, state };
  init();
})();
