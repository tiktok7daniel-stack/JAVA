/*
 * CodeForge — Applicazione (UI 100% italiana, spiegazioni in arabo).
 * Viste: Lezioni · Editor Java · Esame · Glossario. Nessuna dipendenza esterna.
 */
(function () {
  'use strict';

  const P = window.CF_PERCORSO;
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
    prog: store.get('prog', {}),
    libero: store.get('libero', false),
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
    updateRank();
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

  const allLessons = P.lezioni;
  const findLesson = (id) => allLessons.find((l) => l.id === id);

  // ───────────────────────── Sintesi vocale ─────────────────────────
  // Nell'APK Android il WebView non ha speechSynthesis: si usa il ponte nativo CodeForgeNative.
  const NATIVE = window.CodeForgeNative || null;
  const tts = {
    ok: !!NATIVE || (typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined'),
    voices: [],
    init() {
      if (!this.ok || NATIVE) return;
      const load = () => { this.voices = window.speechSynthesis.getVoices(); };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    },
    speak(parts, lang, btn) {
      if (!this.ok) { toast('Sintesi vocale non disponibile su questo dispositivo'); return; }
      if (NATIVE) {
        const text = parts.map(plain).filter((t) => t.trim()).join('. ');
        NATIVE.stop();
        NATIVE.speak(text, lang || 'it-IT');
        if (btn) {
          btn.classList.add('speaking');
          clearTimeout(btn._ttsT);
          btn._ttsT = setTimeout(() => btn.classList.remove('speaking'), Math.min(20000, 600 + text.length * 65));
        }
        return;
      }
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
    stop() {
      if (NATIVE) NATIVE.stop();
      else if (this.ok) window.speechSynthesis.cancel();
    },
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
      if (parts[1]) renderLesson(parts[1], +parts[2] || null);
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

  // ───────────────────────── Percorso Accademico ─────────────────────────
  function ringSvg(pct, color, label, sub, extraCls) {
    const off = RING_C * (1 - Math.max(0, Math.min(1, pct)));
    return `<div class="ring-wrap ${extraCls || ''}">
      <svg viewBox="0 0 100 100"><circle class="ring-bg" cx="50" cy="50" r="44" fill="none" stroke-width="8"/>
      <circle class="ring-fg" cx="50" cy="50" r="44" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${RING_C}" stroke-dashoffset="${off}" style="color:${color}"/></svg>
      <div class="ring-label"><div><b>${label}</b><small>${sub}</small></div></div></div>`;
  }

  const FASI = [
    { n: 1, t: 'Teoria', ar: 'النظرية', ic: 'book' },
    { n: 2, t: 'Micro-Quiz', ar: 'اختبار سريع', ic: 'target' },
    { n: 3, t: 'Costruisci', ar: 'ابنِ الكود', ic: 'wand' },
    { n: 4, t: 'Laboratorio', ar: 'المختبر', ic: 'code' },
    { n: 5, t: 'Riepilogo', ar: 'الخلاصة', ic: 'trophy' },
  ];
  const VOTO_MINIMO = 18;
  const GIUDIZIO_AR = { '30 e Lode': 'ممتاز مع مرتبة الشرف', Ottimo: 'ممتاز', Buono: 'جيد', Sufficiente: 'مقبول', Respinto: 'غير ناجح' };
  const giudizio = (v, lode) => (lode ? '30 e Lode' : v >= 28 ? 'Ottimo' : v >= 24 ? 'Buono' : v >= VOTO_MINIMO ? 'Sufficiente' : 'Respinto');

  const prog = (id) => state.prog[id] || (state.prog[id] = { fase: 1, quiz: {}, orale: {} });
  const saveProg = () => store.set('prog', state.prog);
  const isDone = (l) => !!(state.prog[l.id] && state.prog[l.id].superata);
  function isUnlocked(l) {
    if (state.libero) return true;
    const i = allLessons.findIndex((x) => x.id === l.id);
    return i <= 0 || isDone(allLessons[i - 1]) || isDone(l);
  }
  const livelloDone = (liv) => liv.lezioni.every((x) => isDone(x));

  /** Grado accademico attuale: quello del livello in corso (Matricola all'inizio). */
  function rankAttuale() {
    const liv = P.livelli.find((x) => !livelloDone(x));
    return liv ? { grado: liv.grado, gradoAr: liv.gradoAr, colore: liv.colore, numero: liv.numero } : { ...P.livelli[P.livelli.length - 1], finale: true };
  }

  /** Voto della lezione in trentesimi: quiz 10 + costruisci 10 + laboratorio 10. */
  function votoLezione(l) {
    const p = prog(l.id);
    const nq = l.quiz.length;
    const okQ = l.quiz.filter((q, i) => p.quiz[i] === q.corretta).length;
    const quiz = nq ? (10 * okQ) / nq : 0;
    const cost = !p.costOk ? 0 : p.costSol ? 3 : Math.max(4, 10 - 2 * (p.costErr || 0));
    const lab = p.lab ? (p.labSol ? 6 : 10) : 0;
    const voto = Math.round(quiz + cost + lab);
    const lode = voto >= 30 && okQ === nq && !p.costErr && !p.costSol && !p.labSol;
    const res = { voto: Math.min(30, voto), lode, parti: { quiz, cost, lab }, okQ, nq };
    if (l.esame) {
      // Simulazione d'esame: scritto (quiz), pratica (costruisci + laboratorio), orale (autovalutazione)
      const no = (l.orale || []).length;
      const okO = Object.values(p.orale || {}).filter(Boolean).length;
      const scritto = (30 * okQ) / Math.max(1, nq);
      const pratica = (30 * (cost + lab)) / 20;
      const orale = (30 * okO) / Math.max(1, no);
      const w = l.esame.pesi;
      const fin = Math.round(scritto * w.scritto + pratica * w.pratica + orale * w.orale);
      const insuff = Math.min(scritto, pratica, orale) < VOTO_MINIMO;
      res.esame = { scritto, pratica, orale, completo: Object.keys(p.orale || {}).length === no };
      res.voto = insuff ? Math.min(fin, VOTO_MINIMO - 1) : Math.min(30, fin);
      res.lode = res.voto >= 30 && scritto === 30 && pratica === 30 && orale === 30;
    }
    res.giudizio = giudizio(res.voto, res.lode);
    return res;
  }

  function updateRank() {
    const r = rankAttuale();
    const el = $('#rankVal');
    if (el) el.textContent = r.grado;
    const chip = $('.chip-rank');
    if (chip) chip.style.setProperty('--rc', r.colore);
  }

  function renderHome() {
    const tot = allLessons.length;
    const done = allLessons.filter(isDone).length;
    const next = allLessons.find((x) => !isDone(x) && isUnlocked(x)) || allLessons[0];
    const r = rankAttuale();
    $('#view-lezioni').innerHTML = `
      <div class="stack-lg">
        <section class="hero card">
          <div>
            <div class="eyebrow">Percorso Accademico Strutturato · Programmazione I</div>
            <h1 class="h1">Da Matricola a 30 e Lode.</h1>
            <p class="lead">${P.livelli.length} livelli, ${tot} lezioni guidate in 5 fasi: teoria con analogie, micro-quiz, costruzione del codice, laboratorio con verifica automatica e voto in trentesimi.</p>
            ${arP('مسار جامعي متدرّج من 9 مستويات: كل درس يمرّ بخمس مراحل (نظرية مع تشبيه، اختبار سريع، بناء الكود، مختبر بتصحيح آلي، ثم خلاصة ودرجة من 30). أكمل الدرس بنجاح لفتح الدرس التالي.')}
            <div class="rank-card" style="--rc:${r.colore}">${icon('cap')}<div><small>Grado attuale</small><b>${esc(r.grado)}</b><span class="ar" dir="rtl" lang="ar">${esc(r.gradoAr)}</span></div></div>
            <div class="row hero-actions">
              <a class="btn primary" href="#/lezioni/${next.id}">${icon('play')}${done ? 'Continua' : 'Inizia'}: ${esc(next.titolo)}</a>
              <label class="switch" title="Sblocca tutte le lezioni"><input type="checkbox" id="freeMode" ${state.libero ? 'checked' : ''}><span class="track"><i></i></span>Modalità libera</label>
            </div>
          </div>
          ${ringSvg(done / tot, '#58A6FF', `${Math.round((done / tot) * 100)}%`, `${done}/${tot} lezioni`)}
        </section>
        <div class="tree">
          ${P.livelli.map((liv) => {
            const nd = liv.lezioni.filter(isDone).length;
            const open = isUnlocked(liv.lezioni[0]);
            const full = nd === liv.lezioni.length;
            return `<section class="level ${open ? '' : 'locked'} ${full ? 'complete' : ''}" id="liv-${liv.numero}" style="--mc:${liv.colore}">
              <div class="level-head">
                <span class="level-badge">${icon(open ? liv.icona : 'lock', 'lg')}<b>${liv.numero}</b></span>
                <div class="level-info">
                  <div class="module-num">LIVELLO ${liv.numero} · ${esc(liv.grado)}</div>
                  <div class="h3">${esc(liv.titolo)}</div>
                  ${arP(liv.titoloAr + ' · ' + liv.gradoAr)}
                  <div class="progress"><span style="width:${(nd / liv.lezioni.length) * 100}%"></span></div>
                </div>
                <span class="level-count">${full ? icon('trophy') : `${nd}/${liv.lezioni.length}`}</span>
              </div>
              <div class="path">
                ${liv.lezioni.map((x) => findLesson(x.id)).map((l, i) => {
                  const p = state.prog[l.id];
                  const done = isDone(l), un = isUnlocked(l);
                  const cur = un && !done;
                  const v = done ? votoLezione(l) : null;
                  return `<a class="node ${done ? 'done' : cur ? 'current' : 'locked'} ${i % 2 ? 'odd' : ''}" href="#/lezioni/${l.id}" data-lock="${un ? '' : '1'}">
                    <span class="node-dot">${done ? (v.lode ? '30L' : v.voto) : un ? l.indice : icon('lock', 'sm')}</span>
                    <span class="node-text"><b>Lezione ${l.indice}</b>${esc(l.titolo)}
                      <small>${icon('clock', 'sm')} ${esc(l.durata)}${p && !done && p.fase > 1 ? ` · Fase ${p.fase}/5` : ''}${l.esame ? ' · Simulazione d\'esame' : ''}</small></span>
                  </a>`;
                }).join('')}
              </div>
            </section>`;
          }).join('')}
        </div>
      </div>`;
    $('#freeMode').addEventListener('change', (e) => {
      state.libero = e.target.checked;
      store.set('libero', state.libero);
      toast(state.libero ? 'Modalità libera: tutte le lezioni sono sbloccate' : 'Percorso guidato: le lezioni si sbloccano in ordine');
      renderHome();
    });
    $$('.node[data-lock="1"]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      toast('🔒 Supera la lezione precedente (voto ≥ 18) per sbloccarla');
    }));
  }

  const lessonPlayers = [];
  const lessonBlocks = [];

  function codeBlockHtml(codice, file, notes, opts) {
    const o = opts || {};
    const k = lessonBlocks.length;
    lessonBlocks.push({ codice, file, input: o.input, files: o.files });
    const cl = codeLinesHtml(codice, codeItems(codice, notes, file));
    return `<section class="code-block" data-cb="${k}">
      <div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span class="file-name">${icon('code', 'sm')}${esc(file)}</span><span class="spacer"></span>
        <button type="button" class="btn sm purple" data-run="${k}">${icon('bug', 'sm')}Esegui passo-passo</button>
        <button type="button" class="btn sm" data-open="${k}">${icon('open', 'sm')}Apri nell'Editor</button></div>
      ${o.input ? `<div class="io-note">${icon('terminal', 'sm')} Input (stdin): <code dir="ltr">${esc(o.input.replace(/\n/g, '⏎ '))}</code></div>` : ''}
      ${o.files ? `<div class="io-note">${icon('box', 'sm')} File: ${Object.keys(o.files).map((f) => `<code dir="ltr">${esc(f)}</code>`).join(' ')}</div>` : ''}
      <div class="code-lines">${cl.html}</div>
      <div class="debugger" data-dbg="${k}" hidden></div>
    </section>`;
  }

  function wireCodeBlocks(root) {
    $$('[data-run]', root).forEach((b) => b.addEventListener('click', () => {
      const k = +b.dataset.run;
      const block = $(`[data-cb="${k}"]`, root);
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
      const cb = lessonBlocks[k];
      pl.load(JVM.run(cb.codice, { input: cb.input, files: cb.files }), false);
      addXp(2);
    }));
    $$('[data-open]', root).forEach((b) => b.addEventListener('click', () => {
      const cb = lessonBlocks[+b.dataset.open];
      editor.load(cb.codice, cb.file, null, { input: cb.input, files: cb.files });
      location.hash = '#/editor';
    }));
  }

  function renderLesson(lid, faseReq) {
    const l = findLesson(lid);
    if (!l) { location.hash = '#/lezioni'; return; }
    if (!isUnlocked(l)) { toast('🔒 Lezione bloccata: supera prima quella precedente'); location.hash = '#/lezioni'; return; }
    lessonPlayers.forEach((p) => p.stop());
    lessonPlayers.length = 0;
    lessonBlocks.length = 0;
    const p = prog(l.id);
    const fase = Math.max(1, Math.min(faseReq || p.fase || 1, p.fase || 1));
    const liv = l.livello;
    const idx = allLessons.indexOf(l);
    const next = allLessons[idx + 1];
    let body = '';
    if (fase === 1) body = fase1Html(l);
    else if (fase === 2) body = fase2Html(l);
    else if (fase === 3) body = fase3Html(l);
    else if (fase === 4) body = fase4Html(l);
    else body = fase5Html(l, next);
    $('#view-lezioni').innerHTML = `
      <article class="lesson stack-lg" style="--mc:${liv.colore}">
        <div class="stack-sm">
          <nav class="crumbs"><a href="#/lezioni">Percorso</a>${icon('right')}<a href="#/lezioni" data-liv="${liv.numero}">Livello ${liv.numero}</a>${icon('right')}<span>Lezione ${l.indice}</span></nav>
          <div class="eyebrow" style="color:${liv.colore}">Livello ${liv.numero} · ${esc(liv.titolo)}</div>
          <h1 class="h1">${esc(l.titolo)}</h1>
          <div class="row"><span class="pill neutral">${icon('clock', 'sm')} ${esc(l.durata)}</span>${isDone(l) ? `<span class="pill ok">✓ Superata · ${votoLezione(l).lode ? '30 e Lode' : votoLezione(l).voto + '/30'}</span>` : ''}
            <span class="hint-chip">${icon('lang', 'sm')} Tocca ogni frase o riga <span class="ar" dir="rtl" lang="ar">· اضغط للشرح بالعربية</span></span></div>
        </div>
        <div class="phases">
          <div class="phase-top"><b>Fase ${fase}/5</b> · ${FASI[fase - 1].t} <span class="ar" dir="rtl" lang="ar">${FASI[fase - 1].ar}</span></div>
          <div class="phase-bar"><span style="width:${(fase / 5) * 100}%"></span></div>
          <ol class="stepper">${FASI.map((f) => {
            const reach = f.n <= p.fase;
            return `<li><button type="button" class="step ${f.n === fase ? 'on' : ''} ${f.n < p.fase || (f.n === 5 && isDone(l)) ? 'ok' : ''}" data-fase="${f.n}" ${reach ? '' : 'disabled'} aria-label="Fase ${f.n}: ${f.t}">${icon(f.n < p.fase ? 'check' : reach ? f.ic : 'lock', 'sm')}<span>${f.t}</span></button></li>`;
          }).join('')}</ol>
        </div>
        <div class="phase-body" id="phaseBody">${body}</div>
        <div class="lesson-nav">
          ${fase > 1 ? `<a class="btn ghost" href="#/lezioni/${l.id}/${fase - 1}">${icon('left')}Fase ${fase - 1}</a>` : '<a class="btn ghost" href="#/lezioni">' + icon('left') + 'Percorso</a>'}
          ${fase < 5 ? `<button type="button" class="btn primary" id="btnAvanti" ${puoAvanzare(l, fase) ? '' : 'disabled'}>Avanti: ${FASI[fase].t}${icon('right')}</button>` : '<span></span>'}
        </div>
      </article>`;
    const root = $('#view-lezioni');
    $$('.step[data-fase]', root).forEach((b) => b.addEventListener('click', () => { location.hash = `#/lezioni/${l.id}/${b.dataset.fase}`; }));
    const crumbLiv = $('[data-liv]', root);
    crumbLiv.addEventListener('click', (e) => {
      e.preventDefault();
      location.hash = '#/lezioni';
      setTimeout(() => { const s = $('#liv-' + crumbLiv.dataset.liv); if (s) s.scrollIntoView({ block: 'start' }); }, 60);
    });
    const av = $('#btnAvanti');
    if (av) av.addEventListener('click', () => {
      if (!puoAvanzare(l, fase)) return;
      if (p.fase < fase + 1) { p.fase = fase + 1; saveProg(); addXp(5, `Fase ${fase} completata`); }
      location.hash = `#/lezioni/${l.id}/${fase + 1}`;
    });
    wireCodeBlocks(root);
    const say = $('[data-say-ar]', root);
    if (say) say.addEventListener('click', (e) => tts.speak([l.analogia.ar], 'ar-SA', e.currentTarget));
    if (fase === 2) wireQuiz(l);
    else if (fase === 3) wireCostruisci(l);
    else if (fase === 4) wireLab(l);
    else if (fase === 5) wireRiepilogo(l, next);
  }

  function puoAvanzare(l, fase) {
    const p = prog(l.id);
    if (fase === 2) return l.quiz.every((q, i) => p.quiz[i] !== undefined);
    if (fase === 3) return !!p.costOk;
    if (fase === 4) return !!(p.lab || p.labSkip);
    return true;
  }
  function refreshAvanti(l, fase) {
    const b = $('#btnAvanti');
    if (b) b.disabled = !puoAvanzare(l, fase);
  }

  // Fase 1 — Teoria guidata, analogia, esempio con debugger e regola di Buona Norma
  function fase1Html(l) {
    const items = l.teoria.map((f, i) => ({ kind: 'frase', src: f.it, t: f.t, ar: f.ar, ex: f.ex, bn: f.bn || l.norma.it, bnAr: f.bnAr || l.norma.ar, meta: `Frase ${i + 1} · ${l.titolo}` }));
    const gid = registerGroup(items);
    const e = l.esempio;
    return `
      <section class="card prose">
        <div class="section-title">Teoria guidata</div>
        <ul class="obiettivi">${l.obiettivi.map((o) => `<li>${icon('target', 'sm')}${esc(o)}</li>`).join('')}</ul>
        ${items.map((it, i) => `<button type="button" class="tappable${isSaved(it) ? ' saved' : ''}" data-grp="${gid}" data-i="${i}"><span class="it-text">${rich(it.src)}</span><span class="term-hint">${esc(it.t)}</span><span class="tap-badge">${icon('lang')}</span></button>`).join('')}
      </section>
      <section class="analogy">
        <div class="analogy-ic">${icon('sparkle')}</div>
        <div>
          <h4>Perché serve davvero? <span class="ar" dir="rtl" lang="ar">(المفهوم ببساطة)</span></h4>
          <div class="h3">${esc(l.analogia.titolo)}</div>
          <p class="it-text">${rich(l.analogia.it)}</p>
          ${arP(l.analogia.ar)}
          <button type="button" class="btn sm ghost" data-say-ar>${icon('volume', 'sm')}استمع بالعربية</button>
        </div>
      </section>
      ${codeBlockHtml(e.codice, e.file, e.note, { input: e.input, files: e.files })}
      <section class="norma"><span class="norma-ic">${icon('shield')}</span><div><h4>Regola di Buona Norma</h4><p class="it-text">${rich(l.norma.it)}</p>${arP(l.norma.ar)}</div></section>`;
  }

  // Fase 2 — Micro-quiz con spiegazione bilingue
  function fase2Html(l) {
    const p = prog(l.id);
    return `<div class="stack">${l.quiz.map((q, i) => {
      const ans = p.quiz[i];
      const done = ans !== undefined;
      return `<section class="card quiz-q" data-q="${i}">
        <div class="row"><span class="pill neutral">Domanda ${i + 1} / ${l.quiz.length}</span>${done ? `<span class="pill ${ans === q.corretta ? 'ok' : 'errore'}">${ans === q.corretta ? '✓ Corretta' : '✗ Errata'}</span>` : ''}</div>
        <h3 class="h3 q-text">${rich(q.d)}</h3>
        ${arP(q.dAr)}
        <div class="options">${q.opzioni.map((o, k) => `<button type="button" class="option ${done && k === q.corretta ? 'right' : ''} ${done && k === ans && ans !== q.corretta ? 'wrong' : ''}" data-opt="${k}" ${done ? 'disabled' : ''}><span class="opt-k">${'ABCD'[k]}</span><code dir="ltr" class="opt-code">${esc(o)}</code></button>`).join('')}</div>
        <div class="q-exp" ${done ? '' : 'hidden'}><p class="it-text">${rich(q.it)}</p>${arP(q.ar)}</div>
      </section>`;
    }).join('')}</div>`;
  }

  function wireQuiz(l) {
    const p = prog(l.id);
    $$('.quiz-q').forEach((card) => {
      const i = +card.dataset.q;
      const q = l.quiz[i];
      $$('[data-opt]', card).forEach((b) => b.addEventListener('click', () => {
        if (p.quiz[i] !== undefined) return;
        const k = +b.dataset.opt;
        p.quiz[i] = k;
        saveProg();
        const ok = k === q.corretta;
        $$('[data-opt]', card).forEach((x) => { x.disabled = true; });
        b.classList.add(ok ? 'right' : 'wrong');
        $(`[data-opt="${q.corretta}"]`, card).classList.add('right');
        $('.q-exp', card).hidden = false;
        $('.row', card).insertAdjacentHTML('beforeend', `<span class="pill ${ok ? 'ok' : 'errore'}">${ok ? '✓ Corretta' : '✗ Errata'}</span>`);
        if (ok) addXp(5, 'risposta corretta');
        else toast('Risposta errata: leggi la spiegazione');
        refreshAvanti(l, 2);
      }));
    });
  }

  // Fase 3 — Costruisci il codice (spazi da completare)
  const normBlank = (s) => String(s).replace(/\s+/g, '');
  function fase3Html(l) {
    const c = l.costruisci;
    const p = prog(l.id);
    const parti = P.analizzaCostruisci(c.codice);
    let bi = 0;
    const html = parti.map((x) => {
      if (!x.risposte) return esc(x.testo);
      const i = bi++;
      const val = p.costOk ? x.risposte[0] : (p.costDraft && p.costDraft[i]) || '';
      const w = Math.max(3, ...x.risposte.map((r) => r.length)) + 1;
      return `<input class="blank ${p.costOk ? 'ok' : ''}" data-b="${i}" value="${esc(val)}" style="width:${w}ch" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Spazio ${i + 1}" ${p.costOk ? 'readonly' : ''}>`;
    }).join('');
    return `
      <section class="card">
        <div class="section-title">${icon('wand', 'sm')} Costruisci il Codice</div>
        <p class="it-text">${rich(c.consegna)}</p>
        ${arP(c.consegnaAr)}
        <p class="muted small">Completa gli spazi evidenziati, poi premi «Verifica».</p>
        ${arP('املأ الفراغات المظللة ثم اضغط «Verifica».', 'small')}
      </section>
      <section class="code-block builder-block">
        <div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span class="file-name">${icon('code', 'sm')}Costruisci.java</span></div>
        <pre class="builder" dir="ltr">${html}</pre>
      </section>
      <div class="row">
        <button type="button" class="btn success" id="bCheck" ${p.costOk ? 'disabled' : ''}>${icon('check')}Verifica</button>
        <button type="button" class="btn sm ghost" id="bHint" ${p.costOk ? 'disabled' : ''}>${icon('info', 'sm')}Suggerimento</button>
        <button type="button" class="btn sm ghost" id="bSol" ${p.costOk ? 'disabled' : ''}>${icon('eye', 'sm')}Mostra soluzione</button>
        <span class="spacer"></span>
        ${p.costErr ? `<span class="pill neutral">Tentativi errati: ${p.costErr}</span>` : ''}
      </div>
      <div id="bOut">${p.costOk ? costruisciOkHtml(l) : ''}</div>`;
  }

  function costruisciOkHtml(l) {
    const c = l.costruisci;
    const codice = P.completaCostruisci(c.codice);
    const res = JVM.run(codice, { input: c.input, files: c.files });
    return `<div class="result-banner ok">${icon('trophy')}Codice completo! Ecco l'esecuzione nel simulatore JVM.</div>
      ${arP('أحسنت! الكود مكتمل، وهذه نتيجة تنفيذه في محاكي JVM.')}
      <div class="code-block" style="margin-top:10px">${consoleHtml(res, undefined, true)}</div>`;
  }

  function wireCostruisci(l) {
    const p = prog(l.id);
    const parti = P.analizzaCostruisci(l.costruisci.codice).filter((x) => x.risposte);
    const inputs = $$('.blank');
    inputs.forEach((inp) => {
      inp.addEventListener('input', () => {
        inp.classList.remove('ok', 'ko');
        p.costDraft = inputs.map((x) => x.value);
        saveProg();
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); $('#bCheck').click(); }
      });
    });
    const succeed = () => {
      p.costOk = true;
      saveProg();
      addXp(p.costSol ? 2 : 15, 'codice costruito');
      renderLesson(l.id, 3);
    };
    $('#bCheck').addEventListener('click', () => {
      let tutti = true;
      inputs.forEach((inp, i) => {
        const ok = parti[i].risposte.some((r) => normBlank(r) === normBlank(inp.value));
        inp.classList.toggle('ok', ok);
        inp.classList.toggle('ko', !ok);
        if (!ok) tutti = false;
      });
      if (tutti) succeed();
      else {
        p.costErr = (p.costErr || 0) + 1;
        saveProg();
        const n = inputs.filter((x) => x.classList.contains('ko')).length;
        $('#bOut').innerHTML = `<div class="result-banner ko">${icon('alert')}${n} ${n === 1 ? 'spazio non corretto' : 'spazi non corretti'}: correggi quelli in rosso.</div>${arP(`يوجد ${n} من الفراغات غير صحيح: صحّح الخانات الحمراء.`)}`;
        const firstKo = inputs.find((x) => x.classList.contains('ko'));
        if (firstKo) firstKo.focus();
      }
    });
    $('#bHint').addEventListener('click', () => {
      const i = inputs.findIndex((inp, k) => !parti[k].risposte.some((r) => normBlank(r) === normBlank(inp.value)));
      if (i < 0) { toast('Tutti gli spazi sembrano corretti: premi «Verifica»'); return; }
      const r = parti[i].risposte[0];
      inputs[i].value = r.slice(0, Math.max(1, Math.ceil(r.length / 3)));
      inputs[i].focus();
      inputs[i].classList.remove('ok', 'ko');
      toast(`Suggerimento: lo spazio ${i + 1} inizia con «${inputs[i].value}»`);
    });
    $('#bSol').addEventListener('click', () => {
      p.costSol = true;
      inputs.forEach((inp, i) => { inp.value = parti[i].risposte[0]; });
      succeed();
    });
  }

  // Fase 4 — Laboratorio guidato nell'editor con verifica automatica
  function fase4Html(l) {
    const lab = l.laboratorio;
    const p = prog(l.id);
    return `
      <section class="exercise-card">
        <div class="row"><span class="pill ok">${icon('target', 'sm')} Laboratorio</span>${p.lab ? '<span class="pill ok">✓ Superato</span>' : ''}${p.labSol ? '<span class="pill neutral">soluzione consultata</span>' : ''}</div>
        <h2 class="h2" style="margin-top:10px">${esc(lab.titolo)}</h2>
        <p class="it-text" style="margin:0">${rich(lab.consegna)}</p>
        ${arP(lab.consegnaAr)}
        ${lab.input ? `<div class="io-note">${icon('terminal', 'sm')} Input di prova (stdin): <code dir="ltr">${esc(lab.input.replace(/\n/g, '⏎ '))}</code></div>` : ''}
        ${lab.files ? `<div class="io-note">${icon('box', 'sm')} File disponibili: ${Object.keys(lab.files).map((f) => `<code dir="ltr">${esc(f)}</code>`).join(' ')}</div>` : ''}
        <div class="section-title" style="margin-top:14px">Verifiche automatiche</div>
        <div class="checks">${lab.verifiche.map((v) => `<div class="check ${p.lab ? 'ok' : ''}">${icon(p.lab ? 'check' : 'target')}<div><span class="it-text">${rich(v.msg)}</span><span class="ar" dir="rtl" lang="ar">${rich(v.msgAr)}</span></div></div>`).join('')}</div>
        <div class="row" style="margin-top:14px">
          <button type="button" class="btn primary" id="btnLab">${icon('code')}${p.lab ? 'Riapri nel Laboratorio' : 'Apri nel Laboratorio (Editor)'}</button>
          ${!p.lab && !p.labSkip ? `<button type="button" class="btn sm ghost" id="btnSkip">${icon('right', 'sm')}Salta (0 punti)</button>` : ''}
        </div>
        ${p.lab ? `<div class="result-banner ok">${icon('trophy')}Laboratorio superato: tutte le verifiche sono verdi.</div>` : p.labSkip ? `<div class="result-banner ko">${icon('alert')}Laboratorio saltato: niente punti per questa fase.</div>` : ''}
      </section>`;
  }

  function wireLab(l) {
    const p = prog(l.id);
    $('#btnLab').addEventListener('click', () => {
      editor.startExercise(l);
      location.hash = '#/editor';
    });
    const sk = $('#btnSkip');
    if (sk) sk.addEventListener('click', () => {
      p.labSkip = true;
      saveProg();
      renderLesson(l.id, 4);
    });
  }

  // Fase 5 — Riepilogo, voto in trentesimi, sblocco della lezione successiva
  function fase5Html(l, next) {
    const p = prog(l.id);
    const orale = l.orale ? `
      <section class="card">
        <div class="section-title">${icon('mic', 'sm')} Prova orale</div>
        ${arP('اقرأ السؤال وأجب بصوت عالٍ بالإيطالية، ثم اكشف الإجابة النموذجية وقيّم نفسك بصدق.')}
        <div class="stack-sm">${l.orale.map((o, i) => {
          const val = p.orale[i];
          return `<div class="oral-q" data-o="${i}">
            <div class="h3">${i + 1}. ${esc(o.d)}</div>
            <div class="oral-a" ${val === undefined ? 'hidden' : ''}><p class="answer-model">${esc(o.r)}</p>${arP(o.ar)}</div>
            <div class="row">
              ${val === undefined ? `<button type="button" class="btn sm" data-show>${icon('eye', 'sm')}Mostra risposta</button>` : ''}
              <button type="button" class="btn sm success ${val === true ? 'on' : ''}" data-knew="1" ${val === undefined ? 'hidden' : ''}>${icon('check', 'sm')}La sapevo</button>
              <button type="button" class="btn sm ghost ${val === false ? 'on' : ''}" data-knew="0" ${val === undefined ? 'hidden' : ''}>${icon('x', 'sm')}Da ripassare</button>
              <button type="button" class="btn sm ghost" data-say="${i}">${icon('volume', 'sm')}Ascolta</button>
            </div>
          </div>`;
        }).join('')}</div>
      </section>` : '';
    const v = votoLezione(l);
    const pronta = !l.esame || v.esame.completo;
    const color = v.lode ? '#F2CC60' : v.voto >= VOTO_MINIMO ? '#3FB950' : '#F85149';
    const parti = v.esame
      ? [['Prova scritta', v.esame.scritto, 'الكتابي'], ['Prova al calcolatore', v.esame.pratica, 'العملي'], ['Prova orale', v.esame.orale, 'الشفهي']].map(([t, x, ar]) => `<li><span>${t} <small class="ar" dir="rtl" lang="ar">${ar}</small></span><b>${Math.round(x)}/30</b></li>`).join('')
      : [['Micro-quiz', v.parti.quiz, `${v.okQ}/${v.nq} corrette`], ['Costruisci il codice', v.parti.cost, p.costSol ? 'soluzione consultata' : `${p.costErr || 0} errori`], ['Laboratorio', v.parti.lab, p.lab ? (p.labSol ? 'soluzione consultata' : 'superato') : 'non svolto']].map(([t, x, s]) => `<li><span>${t} <small>${s}</small></span><b>${Math.round(x * 10) / 10}/10</b></li>`).join('');
    return `
      <section class="card">
        <div class="section-title">${icon('book', 'sm')} Riepilogo della lezione</div>
        <ul class="riepilogo">${l.riepilogo.map((r) => `<li>${icon('check', 'sm')}<div><span class="it-text">${rich(r.it)}</span>${arP(r.ar)}</div></li>`).join('')}</ul>
      </section>
      ${orale}
      <section class="card grade-card">
        ${pronta ? `<div class="grade">
          ${ringSvg(v.voto / 30, color, v.lode ? '30L' : String(v.voto), '/ 30', v.lode ? 'lode' : '')}
          <div class="grade-text">
            <h4>${l.esame ? 'Voto finale d\'esame' : 'Voto della lezione'}: ${v.lode ? '30 e Lode 🏆' : v.voto + '/30'} — ${esc(v.giudizio)}</h4>
            <p class="ar" dir="rtl" lang="ar">التقدير: ${GIUDIZIO_AR[v.giudizio]} (${v.voto}/30)</p>
            <ul class="breakdown">${parti}</ul>
          </div>
        </div>
        ${v.voto >= VOTO_MINIMO
          ? `<div class="result-banner ok">${icon('trophy')}${l.esame ? 'Esame superato!' : 'Lezione superata!'} ${next ? 'La lezione successiva è sbloccata.' : 'Hai completato tutto il percorso: Ingegnere Java!'}</div>`
          : `<div class="result-banner ko">${icon('alert')}Voto insufficiente (minimo 18): ripeti le fasi con meno punti per sbloccare la lezione successiva.</div>
             ${arP('الدرجة أقل من 18: أعد المراحل ذات النقاط الأقل لفتح الدرس التالي.')}
             <div class="row"><button type="button" class="btn sm" id="btnRetry">${icon('refresh', 'sm')}Ripeti quiz e costruzione</button></div>`}
        <div class="row" style="margin-top:12px">
          ${next && v.voto >= VOTO_MINIMO ? `<a class="btn primary" href="#/lezioni/${next.id}">${icon('play')}Lezione ${next.indice}: ${esc(next.titolo)}</a>` : ''}
          <a class="btn ghost" href="#/lezioni">${icon('tree')}Torna al percorso</a>
        </div>` : `<div class="result-banner ko">${icon('mic')}Rispondi a tutte le domande orali per ottenere il voto finale.</div>`}
      </section>`;
  }

  function wireRiepilogo(l, next) {
    const p = prog(l.id);
    $$('.oral-q').forEach((box) => {
      const i = +box.dataset.o;
      const sh = $('[data-show]', box);
      if (sh) sh.addEventListener('click', () => {
        $('.oral-a', box).hidden = false;
        $$('[data-knew]', box).forEach((b) => { b.hidden = false; });
        sh.remove();
      });
      $$('[data-knew]', box).forEach((b) => b.addEventListener('click', () => {
        p.orale[i] = b.dataset.knew === '1';
        saveProg();
        renderLesson(l.id, 5);
      }));
      $('[data-say]', box).addEventListener('click', (e) => tts.speak([l.orale[i].d], 'it-IT', e.currentTarget));
    });
    const rt = $('#btnRetry');
    if (rt) rt.addEventListener('click', () => {
      p.quiz = {};
      p.costOk = false; p.costErr = 0; p.costSol = false; p.costDraft = null;
      p.fase = 2;
      saveProg();
      location.hash = `#/lezioni/${l.id}/2`;
    });
    const v = votoLezione(l);
    const pronta = !l.esame || v.esame.completo;
    if (pronta && v.voto >= VOTO_MINIMO && !p.superata) {
      const rankPrima = rankAttuale().grado;
      p.superata = true;
      p.voto = v.voto;
      saveProg();
      addXp(v.lode ? 80 : 50, v.lode ? '30 e Lode!' : 'lezione superata');
      updateRank();
      const rankDopo = rankAttuale().grado;
      if (rankDopo !== rankPrima) setTimeout(() => toast(`🎓 Nuovo grado: ${rankDopo}`, 'gold'), 2700);
      $$('.step[data-fase="5"]').forEach((b) => b.classList.add('ok'));
    } else if (pronta && p.superata && v.voto > (p.voto || 0)) {
      p.voto = v.voto;
      saveProg();
    }
    void next;
  }

  // ───────────────────────── Editor Java ─────────────────────────
  const DEFAULT_CODE = P.esempi[0].codice;
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
    input: '',
    files: {},
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
            ${P.esempi.map((e) => `<option value="${e.id}">${esc(e.titolo)}</option>`).join('')}
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
            <details class="io-panel" id="ioPanel">
              <summary>${icon('terminal', 'sm')}Input (stdin) e File <span class="muted" id="ioSummary"></span></summary>
              <label class="io-label">Input da tastiera (una riga per ogni invio) <span class="ar" dir="rtl" lang="ar">· الإدخال الذي يقرؤه Scanner</span>
                <textarea id="ioIn" class="io-text" rows="3" spellcheck="false" dir="ltr" placeholder="es. 20&#10;Mario Rossi&#10;27,5"></textarea></label>
              <div class="io-label">File di testo virtuali <span class="ar" dir="rtl" lang="ar">· ملفات افتراضية يقرؤها ويكتبها البرنامج</span></div>
              <div id="ioFiles" class="io-files"></div>
              <button type="button" class="btn sm ghost" id="ioAdd">${icon('box', 'sm')}Aggiungi file</button>
            </details>
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
        const ex = P.esempi.find((x) => x.id === e.target.value);
        if (ex) {
          this.exercise = null;
          this.load(ex.codice, null, null, { input: ex.input, files: ex.files });
          toast('Esempio caricato: ' + ex.titolo.replace(/^⚠\s*/, ''));
        }
        e.target.value = '';
      });
      $$('.seg [data-mode]', v).forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.mode)));
      $$('.out-tabs [data-tab]', v).forEach((b) => b.addEventListener('click', () => this.tab(b.dataset.tab)));
      $('#btnRun').addEventListener('click', () => this.run(false));
      $('#btnDebug').addEventListener('click', () => this.run(true));
      $('#ioIn').addEventListener('input', (e) => { this.input = e.target.value; this.invalidateRun(true); this.persist(); this.ioSummary(); });
      $('#ioAdd').addEventListener('click', () => {
        let n = 1;
        while (this.files['dati' + (n > 1 ? n : '') + '.txt'] !== undefined) n++;
        this.files['dati' + (n > 1 ? n : '') + '.txt'] = '';
        this.renderIo();
        this.persist();
      });
      $('#ioFiles').addEventListener('input', (e) => {
        const box = e.target.closest('[data-file]');
        if (!box) return;
        const old = box.dataset.file;
        if (e.target.matches('.io-fname')) {
          const nome = e.target.value.trim();
          if (!nome || (nome !== old && this.files[nome] !== undefined)) return;
          const cont = this.files[old];
          delete this.files[old];
          this.files[nome] = cont;
          box.dataset.file = nome;
        } else this.files[old] = e.target.value;
        this.invalidateRun(true);
        this.persist();
        this.ioSummary();
      });
      $('#ioFiles').addEventListener('click', (e) => {
        const del = e.target.closest('[data-delfile]');
        if (!del) return;
        delete this.files[del.dataset.delfile];
        this.renderIo();
        this.persist();
      });
      $('#btnClear').addEventListener('click', () => {
        this.exercise = null;
        this.load('public class Main {\n\n    public static void main(String[] args) {\n        \n    }\n}\n', 'Main.java', null, { input: '', files: {} });
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
          const pr = prog(this.exercise.l.id);
          if (!pr.lab) { pr.labSol = true; saveProg(); }
          this.setCode(this.exercise.l.laboratorio.soluzione);
          toast('Soluzione caricata: studiala riga per riga in «Vista interattiva»');
        } else if (a.dataset.ex === 'reset') this.setCode(this.exercise.l.laboratorio.codice);
        else if (a.dataset.ex === 'exit') { this.exercise = null; this.renderBanner(); this.updateFile(); this.persist(); }
        else if (a.dataset.ex === 'back') location.hash = `#/lezioni/${this.exercise.l.id}/4`;
      });
      window.addEventListener('resize', () => this.syncSize());
      this.built = true;
      const saved = store.get('editor', null);
      if (saved && saved.code) {
        if (saved.ex) {
          const f = findLesson(saved.ex);
          if (f) this.exercise = { l: f };
        }
        this.load(saved.code, saved.file, this.exercise, { input: saved.input || '', files: saved.files || {} });
      } else this.load(DEFAULT_CODE, null, null);
    },

    show() {
      if (!this.built) this.build();
      requestAnimationFrame(() => {
        this.syncSize();
        memHosts.forEach((h) => h.isConnected && drawArrows(h, h.dataset.memId));
      });
    },

    load(code, file, exercise, io) {
      if (!this.built) this.build();
      if (exercise !== undefined) this.exercise = exercise;
      if (io) {
        this.input = io.input || '';
        this.files = { ...(io.files || {}) };
      }
      this.renderIo();
      this.file = file || this.guessFile(code);
      this.renderBanner();
      this.setCode(code);
      this.resetOutput();
      if (this.mode === 'inspect') this.renderInspect();
    },

    startExercise(l) {
      this.exercise = { l };
      const lab = l.laboratorio;
      const draft = store.get('draft.' + l.id, null);
      this.load(draft || lab.codice, null, this.exercise, { input: lab.input, files: lab.files });
      this.setMode('edit');
      if (lab.input || lab.files) $('#ioPanel').open = true;
    },

    renderIo() {
      if (!this.built) return;
      $('#ioIn').value = this.input;
      $('#ioFiles').innerHTML = Object.entries(this.files).map(([n, c]) => `
        <div class="io-file" data-file="${esc(n)}">
          <div class="row"><input class="io-fname" value="${esc(n)}" spellcheck="false" aria-label="Nome del file"><span class="spacer"></span><button type="button" class="btn-icon" data-delfile="${esc(n)}" aria-label="Elimina file">${icon('x', 'sm')}</button></div>
          <textarea class="io-text" rows="3" spellcheck="false" dir="ltr" aria-label="Contenuto di ${esc(n)}">${esc(c)}</textarea>
        </div>`).join('') || '<p class="muted small">Nessun file. I file scritti dal programma (PrintWriter) appaiono nella Console.</p>';
      this.ioSummary();
    },
    ioSummary() {
      const nf = Object.keys(this.files).length;
      const nl = this.input ? this.input.replace(/\n$/, '').split('\n').length : 0;
      $('#ioSummary').textContent = nl || nf ? `· ${nl} righe di input, ${nf} file` : '';
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
      store.set('editor', { code: this.code, file: this.file, ex: this.exercise ? this.exercise.l.id : null, input: this.input, files: this.files });
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

    invalidateRun(force) {
      if (this.lastRunCode !== null && (force || this.lastRunCode !== this.code)) {
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
      const res = JVM.run(this.code, { input: this.input, files: this.files });
      this.lastRes = res;
      this.lastRunCode = this.code;
      this.player.load(res, !debug);
      this.showFiles(res);
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

    showFiles(res) {
      const scritti = Object.entries(res.files || {}).filter(([n, c]) => this.files[n] !== c);
      if (!scritti.length) return;
      $('#edConsole').insertAdjacentHTML('beforeend', `<div class="files-out">${scritti.map(([n, c]) => `<div class="file-out"><div class="file-out-h">${icon('box', 'sm')}${esc(n)} <small>file scritto dal programma</small></div><pre>${esc(c) || '<span class="console-empty">(vuoto)</span>'}</pre></div>`).join('')}</div>`);
    },

    rerunQuiet() {
      const res = JVM.run(this.code, { input: this.input, files: this.files });
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
      const { l } = this.exercise;
      const ex = l.laboratorio;
      const pr = prog(l.id);
      b.hidden = false;
      b.innerHTML = `
        <div class="row"><span class="pill ok">${icon('target', 'sm')} Laboratorio · Lezione ${l.indice}</span>${pr.lab ? '<span class="pill ok">✓ Superato</span>' : ''}<span class="spacer"></span>
          <button type="button" class="btn sm ${pr.lab ? 'primary' : 'ghost'}" data-ex="back">${icon('back', 'sm')}Torna alla lezione</button><button type="button" class="btn sm ghost" data-ex="exit">${icon('x', 'sm')}Esci</button></div>
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
      const r = VER.verificaEsercizio(this.code, l.laboratorio, { run: JVM.run, analizza: LINT.analizza });
      this.lint();
      this.lastRes = r.esito;
      this.lastRunCode = this.code;
      this.player.load(r.esito, true);
      this.renderFeedback();
      $('#exResult').innerHTML = `
        <div class="checks">${r.risultati.map((c) => `<div class="check ${c.ok ? 'ok' : 'ko'}">${icon(c.ok ? 'check' : 'x')}<div><span class="it-text">${rich(c.msg)}</span><span class="ar" dir="rtl" lang="ar">${rich(c.msgAr)}</span></div></div>`).join('')}</div>
        <div class="result-banner ${r.superato ? 'ok' : 'ko'}">${icon(r.superato ? 'trophy' : 'alert')}${r.superato ? 'Superato ✔ — ottimo lavoro!' : 'Da rivedere: controlla i punti segnati in rosso.'}</div>`;
      const pr = prog(l.id);
      if (r.superato && !pr.lab) {
        pr.lab = true;
        pr.labSkip = false;
        if (pr.fase < 5) pr.fase = 5;
        saveProg();
        addXp(30, 'laboratorio superato');
        this.renderBanner();
        this.checkExercise();
        $('#exResult').insertAdjacentHTML('beforeend', `<div class="row" style="margin-top:10px"><a class="btn primary" href="#/lezioni/${l.id}/5">${icon('trophy')}Vai al Riepilogo e al voto</a></div>`);
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
  function initSplash() {
    const sp = $('#splash');
    if (!sp) return;
    let seen = false;
    try { seen = sessionStorage.getItem('cf.splash') === '1'; } catch (e) { seen = false; }
    if (seen && !NATIVE) { sp.remove(); return; }
    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      sp.classList.add('out');
      setTimeout(() => sp.remove(), 700);
      try { sessionStorage.setItem('cf.splash', '1'); } catch (e) { /* storage non disponibile */ }
    };
    sp.addEventListener('click', hide);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(hide, reduce ? 400 : 3100);
  }

  function init() {
    initSplash();
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
