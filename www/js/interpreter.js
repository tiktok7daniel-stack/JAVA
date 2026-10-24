/*
 * CodeForge — Simulatore JVM didattico.
 * Interpreta un sottoinsieme di Java (classi, oggetti, ereditarietà, interfacce,
 * array, String, ArrayList, eccezioni) e registra ogni passo di esecuzione
 * (trace[]) con lo stato di Stack e Heap e una spiegazione in italiano e in arabo.
 * Non è una vera JVM: i costrutti non supportati producono un messaggio chiaro.
 */
(function (root) {
  'use strict';

  // ───────────────────────── Errori e segnali ─────────────────────────
  class CompileError extends Error {
    constructor(msg, line, ar) { super(msg); this.line = line; this.ar = ar || ''; }
  }
  class Unsupported extends Error {
    constructor(what, line) { super(what); this.line = line; }
  }
  class LimitError extends Error {
    constructor(msg, line) { super(msg); this.line = line; }
  }
  class JavaThrow { constructor(obj, line) { this.obj = obj; this.line = line; } }
  class BreakSig { constructor(label) { this.label = label; } }
  class ContinueSig { constructor(label) { this.label = label; } }
  class ReturnSig { constructor(value, line) { this.value = value; this.line = line; } }
  class ExitSig { constructor(code) { this.code = code; } }

  const MAX_OPS = 400000;
  const MAX_STEPS = 2500;
  const MAX_DEPTH = 180;

  // ───────────────────────── Lessico ─────────────────────────
  const PRIMS = new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char', 'void']);
  const MODIFIERS = new Set(['public', 'private', 'protected', 'static', 'final', 'abstract', 'default',
    'synchronized', 'native', 'transient', 'volatile', 'strictfp']);
  const KEYWORDS = new Set([...PRIMS, ...MODIFIERS, 'break', 'case', 'catch', 'class', 'continue', 'do', 'else',
    'enum', 'extends', 'finally', 'for', 'if', 'implements', 'import', 'instanceof', 'interface', 'new', 'null',
    'package', 'return', 'super', 'switch', 'this', 'throw', 'throws', 'true', 'false', 'try', 'while']);
  const OPS = ['>>>=', '<<=', '>>=', '>>>', '...', '->', '::', '++', '--', '&&', '||', '==', '!=', '<=', '>=',
    '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>'];
  const SINGLE = '{}()[];,.=<>!~?:+-*/&|^%@';

  function readEscape(src, j, line) {
    const e = src[j + 1];
    const map = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', 0: '\0', s: ' ', '\\': '\\', "'": "'", '"': '"' };
    if (e === 'u') {
      let k = j + 1;
      while (src[k] === 'u') k++;
      return { ch: String.fromCharCode(parseInt(src.substr(k, 4), 16)), end: k + 4 };
    }
    if (e in map) return { ch: map[e], end: j + 2 };
    throw new CompileError('sequenza di escape non valida \\' + e, line, 'تسلسل هروب غير صالح \\' + e);
  }

  function tokenize(src) {
    const toks = [];
    let i = 0, line = 1;
    const n = src.length;
    while (i < n) {
      const c = src[i];
      if (c === '\n') { line++; i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r' || c === '\f') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') {
        const start = line;
        i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
        if (i >= n) throw new CompileError('commento /* ... */ non chiuso', start, 'التعليق متعدد الأسطر غير مُغلق بـ */');
        i += 2;
        continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i;
        while (j < n && /[\w$]/.test(src[j])) j++;
        const w = src.slice(i, j);
        toks.push({ t: KEYWORDS.has(w) ? 'kw' : 'id', v: w, line });
        i = j;
        continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let j = i, isFloat = false, val;
        if (c === '0' && /[xX]/.test(src[i + 1] || '')) {
          j = i + 2;
          while (/[0-9a-fA-F_]/.test(src[j] || '')) j++;
          val = parseInt(src.slice(i + 2, j).replace(/_/g, ''), 16);
        } else if (c === '0' && /[bB]/.test(src[i + 1] || '')) {
          j = i + 2;
          while (/[01_]/.test(src[j] || '')) j++;
          val = parseInt(src.slice(i + 2, j).replace(/_/g, ''), 2);
        } else {
          while (/[0-9_]/.test(src[j] || '')) j++;
          if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) {
            isFloat = true; j++;
            while (/[0-9_]/.test(src[j] || '')) j++;
          } else if (src[j] === '.' && !/[A-Za-z_]/.test(src[j + 1] || '')) {
            isFloat = true; j++;
          }
          if (/[eE]/.test(src[j] || '')) {
            isFloat = true; j++;
            if (/[+-]/.test(src[j])) j++;
            while (/[0-9]/.test(src[j] || '')) j++;
          }
          val = Number(src.slice(i, j).replace(/_/g, ''));
        }
        let kind = isFloat ? 'double' : 'int';
        if (/[dDfF]/.test(src[j] || '')) { kind = /[fF]/.test(src[j]) ? 'float' : 'double'; j++; } else if (/[lL]/.test(src[j] || '')) { kind = 'long'; j++; }
        if (kind === 'int' && val > 2147483648) {
          throw new CompileError('numero intero troppo grande: ' + src.slice(i, j) + ' (usa il suffisso L per i long)', line, 'العدد الصحيح كبير جداً على النوع int؛ استخدم اللاحقة L للنوع long');
        }
        toks.push({ t: 'num', v: val, kind, line, raw: src.slice(i, j) });
        i = j;
        continue;
      }
      if (c === '"') {
        if (src.startsWith('"""', i)) throw new Unsupported('text block """', line);
        let j = i + 1, s = '';
        while (j < n && src[j] !== '"') {
          if (src[j] === '\n') break;
          if (src[j] === '\\') { const r = readEscape(src, j, line); s += r.ch; j = r.end; } else { s += src[j]; j++; }
        }
        if (j >= n || src[j] !== '"') throw new CompileError('stringa non chiusa: manca la virgoletta "', line, 'السلسلة النصية غير مُغلقة: تنقص علامة " الختامية');
        toks.push({ t: 'str', v: s, line });
        i = j + 1;
        continue;
      }
      if (c === "'") {
        let j = i + 1, ch;
        if (src[j] === '\\') { const r = readEscape(src, j, line); ch = r.ch; j = r.end; } else { ch = src[j] || ''; j++; }
        if (src[j] !== "'" || !ch) throw new CompileError("letterale char non valido: un char contiene un solo carattere tra apici ' '", line, "قيمة char غير صالحة: يجب أن تحتوي على حرف واحد فقط بين علامتي ' '");
        toks.push({ t: 'char', v: ch.charCodeAt(0), line });
        i = j + 1;
        continue;
      }
      let op = null;
      for (const o of OPS) if (src.startsWith(o, i)) { op = o; break; }
      if (!op && SINGLE.includes(c)) op = c;
      if (!op) throw new CompileError(`carattere inatteso '${c}'`, line, `رمز غير متوقع '${c}'`);
      toks.push({ t: 'op', v: op, line });
      i += op.length;
    }
    toks.push({ t: 'eof', v: 'fine del file', line });
    return toks;
  }

  // ───────────────────────── Parser ─────────────────────────
  const PREC = {
    '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7,
    instanceof: 7, '<<': 8, '>>': 8, '>>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10,
  };
  const ASSIGN = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>=']);

  class Parser {
    constructor(toks) { this.toks = toks; this.pos = 0; }
    peek(k = 0) { return this.toks[Math.min(this.pos + k, this.toks.length - 1)]; }
    next() { const t = this.peek(); this.pos++; return t; }
    is(v, k = 0) { const t = this.peek(k); return (t.t === 'op' || t.t === 'kw') && t.v === v; }
    accept(v) { if (this.is(v)) { this.pos++; return true; } return false; }
    expect(v) {
      if (!this.is(v)) {
        const t = this.peek();
        const prev = this.toks[this.pos - 1];
        const line = (v === ';' || v === ')') && prev ? prev.line : t.line;
        throw new CompileError(`atteso '${v}' ma trovato '${t.v}'`, line, `كان متوقعاً الرمز '${v}' لكن وُجد '${t.v}'`);
      }
      return this.next();
    }
    expectId() {
      const t = this.peek();
      if (t.t !== 'id') throw new CompileError(`atteso un identificatore ma trovato '${t.v}'`, t.line, `كان متوقعاً اسم (معرّف) لكن وُجد '${t.v}'`);
      this.pos++;
      return t.v;
    }
    eofCheck(closing) {
      if (this.peek().t === 'eof') {
        throw new CompileError(`fine del file raggiunta durante il parsing: manca '${closing}'`, this.peek().line, `وصلنا إلى نهاية الملف: ينقص الرمز '${closing}' (تحقق من توازن الأقواس)`);
      }
    }

    parseUnit() {
      const types = [];
      while (this.peek().t !== 'eof') {
        if (this.accept('package') || this.accept('import')) {
          while (!this.is(';')) { this.eofCheck(';'); this.pos++; }
          this.next();
          continue;
        }
        if (this.accept(';')) continue;
        const mods = this.parseModifiers();
        types.push(...this.parseTypeDecl(mods));
      }
      return types;
    }

    parseModifiers() {
      const mods = new Set();
      for (;;) {
        const t = this.peek();
        if (t.t === 'kw' && MODIFIERS.has(t.v)) { mods.add(t.v); this.pos++; continue; }
        if (this.is('@')) {
          this.pos++;
          if (this.is('interface')) throw new Unsupported('definizione di annotazioni', t.line);
          const name = this.expectId();
          if (name === 'Override') mods.add('@Override');
          if (this.is('(')) this.skipParens();
          continue;
        }
        return mods;
      }
    }

    skipParens() {
      let depth = 0;
      do {
        const t = this.next();
        if (t.t === 'eof') this.eofCheck(')');
        if (t.v === '(') depth++;
        else if (t.v === ')') depth--;
      } while (depth > 0);
    }

    skipTypeArgs() {
      let depth = 0;
      do {
        const t = this.next();
        if (t.t === 'eof') this.eofCheck('>');
        if (t.v === '<') depth++;
        else if (t.v === '>') depth--;
        else if (t.v === '>>') depth -= 2;
        else if (t.v === '>>>') depth -= 3;
      } while (depth > 0);
    }

    parseTypeDecl(mods) {
      const t = this.peek();
      let kind;
      if (this.accept('class')) kind = 'class';
      else if (this.accept('interface')) kind = 'interface';
      else if (this.is('enum') || (t.t === 'id' && t.v === 'record')) throw new Unsupported(t.v, t.line);
      else throw new CompileError(`atteso 'class' o 'interface' ma trovato '${t.v}'`, t.line, `كان متوقعاً class أو interface لكن وُجد '${t.v}'`);
      const name = this.expectId();
      if (this.is('<')) this.skipTypeArgs();
      let ext = null;
      const impls = [];
      if (this.accept('extends')) {
        if (kind === 'interface') { do impls.push(this.parseType().name); while (this.accept(',')); } else {
          ext = this.parseType().name;
          if (this.is(',')) throw new CompileError('Java non supporta l\'ereditarietà multipla tra classi: una classe può estendere una sola classe', t.line, 'لا تدعم Java الوراثة المتعددة بين الأصناف: يمكن للصنف أن يرث (extends) صنفاً واحداً فقط، واستخدم الواجهات (interfaces) بدلاً من ذلك');
        }
      }
      if (this.accept('implements')) { do impls.push(this.parseType().name); while (this.accept(',')); }
      this.expect('{');
      const cls = { name, kind, ext, impls, mods, line: t.line, fields: [], methods: [], ctors: [], inits: [], staticInits: [] };
      const out = [cls];
      while (!this.accept('}')) {
        this.eofCheck('}');
        if (this.accept(';')) continue;
        const mline = this.peek().line;
        const m = this.parseModifiers();
        if (this.is('class') || this.is('interface') || this.is('enum')) { out.push(...this.parseTypeDecl(m)); continue; }
        if (this.is('{')) { const b = this.parseBlock(); (m.has('static') ? cls.staticInits : cls.inits).push(b); continue; }
        if (this.is('<')) this.skipTypeArgs();
        if (this.peek().t === 'id' && this.peek().v === name && this.is('(', 1)) {
          this.pos++;
          const params = this.parseParams();
          const throwsL = this.parseThrows();
          const body = this.parseBlock();
          cls.ctors.push({ name, params, throws: throwsL, body, mods: m, line: mline, cls: name, isCtor: true });
          continue;
        }
        const type = this.parseType();
        if (this.is('(')) {
          throw new CompileError(`dichiarazione di metodo non valida: manca il tipo di ritorno (es. void) prima di ${type.name}()`, mline,
            `تصريح دالة غير صالح: ينقص نوع القيمة المُعادة (مثل void) قبل ${type.name}(). إذا كان مُنشئاً فيجب أن يطابق اسمه اسم الصنف ${name} تماماً`);
        }
        const mname = this.expectId();
        if (this.is('(')) {
          const params = this.parseParams();
          while (this.is('[')) { this.next(); this.expect(']'); type.dims++; }
          const throwsL = this.parseThrows();
          let body = null;
          if (!this.accept(';')) body = this.parseBlock();
          if (kind === 'interface') {
            if (!body) m.add('abstract');
            if (!m.has('private')) m.add('public');
          }
          cls.methods.push({ name: mname, ret: type, params, throws: throwsL, body, mods: m, line: mline, cls: name });
        } else {
          if (kind === 'interface') { m.add('static'); m.add('final'); m.add('public'); }
          let fname = mname;
          for (;;) {
            const ftype = { ...type };
            while (this.is('[')) { this.next(); this.expect(']'); ftype.dims++; }
            let init = null;
            if (this.accept('=')) init = this.is('{') ? this.parseArrayInit() : this.parseExpr();
            cls.fields.push({ name: fname, type: ftype, init, mods: m, line: mline, cls: name });
            if (!this.accept(',')) break;
            fname = this.expectId();
          }
          this.expect(';');
        }
      }
      return out;
    }

    parseParams() {
      this.expect('(');
      const ps = [];
      if (!this.accept(')')) {
        do {
          const m = this.parseModifiers();
          const type = this.parseType();
          const name = this.expectId();
          while (this.is('[')) { this.next(); this.expect(']'); type.dims++; }
          ps.push({ name, type, final: m.has('final'), varargs: !!type.varargs });
        } while (this.accept(','));
        this.expect(')');
      }
      return ps;
    }

    parseThrows() {
      const l = [];
      if (this.accept('throws')) { do l.push(this.parseType().name); while (this.accept(',')); }
      return l;
    }

    parseType() {
      const t = this.peek();
      let name;
      if (t.t === 'kw' && PRIMS.has(t.v)) { this.pos++; name = t.v; } else if (t.t === 'id') {
        this.pos++;
        name = t.v;
        while (this.is('.') && this.peek(1).t === 'id') { this.pos++; name = this.next().v; }
        if (this.is('<')) this.skipTypeArgs();
      } else throw new CompileError(`atteso un tipo ma trovato '${t.v}'`, t.line, `كان متوقعاً نوع بيانات لكن وُجد '${t.v}'`);
      const type = { name, dims: 0 };
      while (this.is('[') && this.is(']', 1)) { this.pos += 2; type.dims++; }
      if (this.accept('...')) { type.dims++; type.varargs = true; }
      return type;
    }

    parseBlock() {
      const line = this.expect('{').line;
      const stmts = [];
      while (!this.accept('}')) { this.eofCheck('}'); stmts.push(this.parseStatement()); }
      return { k: 'block', stmts, line };
    }

    isLocalDecl() {
      const save = this.pos;
      try {
        while (this.is('final') || this.is('@')) { if (this.accept('@')) this.expectId(); else this.pos++; }
        const t = this.peek();
        if (!(t.t === 'id' || (t.t === 'kw' && PRIMS.has(t.v) && t.v !== 'void'))) return false;
        this.parseType();
        const n = this.peek(), a = this.peek(1);
        return n.t === 'id' && a.t === 'op' && ['=', ';', ',', ':', '['].includes(a.v);
      } catch (e) {
        return false;
      } finally {
        this.pos = save;
      }
    }

    parseStatement() {
      const t = this.peek();
      const line = t.line;
      if (this.is('{')) return this.parseBlock();
      if (this.accept(';')) return { k: 'empty', line };
      if (t.t === 'id' && this.is(':', 1)) {
        this.pos += 2;
        const body = this.parseStatement();
        body.label = t.v;
        return body;
      }
      if (t.t === 'kw') {
        switch (t.v) {
          case 'if': {
            this.pos++; this.expect('(');
            const cond = this.parseExpr(); this.expect(')');
            const then = this.parseStatement();
            const els = this.accept('else') ? this.parseStatement() : null;
            return { k: 'if', cond, then, els, line };
          }
          case 'while': {
            this.pos++; this.expect('(');
            const cond = this.parseExpr(); this.expect(')');
            return { k: 'while', cond, body: this.parseStatement(), line };
          }
          case 'do': {
            this.pos++;
            const body = this.parseStatement();
            const wl = this.expect('while').line;
            this.expect('(');
            const cond = this.parseExpr();
            this.expect(')'); this.expect(';');
            return { k: 'do', body, cond, line, condLine: wl };
          }
          case 'for': return this.parseFor();
          case 'switch': return this.parseSwitch();
          case 'return': {
            this.pos++;
            const e = this.is(';') ? null : this.parseExpr();
            this.expect(';');
            return { k: 'return', e, line };
          }
          case 'break': case 'continue': {
            this.pos++;
            const label = this.peek().t === 'id' ? this.next().v : null;
            this.expect(';');
            return { k: t.v, label, line };
          }
          case 'throw': {
            this.pos++;
            const e = this.parseExpr();
            this.expect(';');
            return { k: 'throw', e, line };
          }
          case 'try': return this.parseTry();
          case 'class': case 'interface': case 'enum': throw new Unsupported('classi locali (dichiarate dentro un metodo)', line);
          case 'else': throw new CompileError("'else' senza 'if'", line, "وُجدت else بدون if مقابلة لها");
          case 'case': case 'default': throw new CompileError(`'${t.v}' fuori da uno switch`, line, `استُخدمت ${t.v} خارج جملة switch`);
          case 'catch': case 'finally': throw new CompileError(`'${t.v}' senza 'try'`, line, `استُخدمت ${t.v} بدون try`);
          default: break;
        }
      }
      if (this.isLocalDecl()) {
        const d = this.parseLocalDecl();
        this.expect(';');
        return d;
      }
      const e = this.parseExpr();
      if (!['assign', 'preinc', 'postinc', 'call', 'new', 'supercall', 'ctorcall'].includes(e.k)) {
        throw new CompileError('non è un\'istruzione valida (not a statement)', line, 'هذه ليست تعليمة صالحة: التعبير وحده لا يمكن أن يكون جملة مستقلة (مثلاً x + 1; بدون إسناد)');
      }
      this.expect(';');
      return { k: 'expr', e, line };
    }

    parseLocalDecl() {
      const line = this.peek().line;
      const mods = this.parseModifiers();
      const type = this.parseType();
      const decls = [];
      do {
        const name = this.expectId();
        const dt = { ...type };
        while (this.is('[')) { this.next(); this.expect(']'); dt.dims++; }
        let init = null;
        if (this.accept('=')) init = this.is('{') ? this.parseArrayInit() : this.parseExpr();
        decls.push({ name, type: dt, init });
      } while (this.accept(','));
      return { k: 'local', type, decls, final: mods.has('final'), line };
    }

    parseFor() {
      const line = this.next().line;
      this.expect('(');
      if (this.isLocalDecl()) {
        const save = this.pos;
        this.parseModifiers();
        const type = this.parseType();
        const name = this.expectId();
        if (this.accept(':')) {
          const iter = this.parseExpr();
          this.expect(')');
          return { k: 'foreach', type, name, iter, body: this.parseStatement(), line };
        }
        this.pos = save;
      }
      const init = [];
      if (this.isLocalDecl()) init.push(this.parseLocalDecl());
      else if (!this.is(';')) { do init.push({ k: 'expr', e: this.parseExpr(), line }); while (this.accept(',')); }
      this.expect(';');
      const cond = this.is(';') ? null : this.parseExpr();
      this.expect(';');
      const update = [];
      if (!this.is(')')) { do update.push(this.parseExpr()); while (this.accept(',')); }
      this.expect(')');
      return { k: 'for', init, cond, update, body: this.parseStatement(), line };
    }

    parseSwitch() {
      const line = this.next().line;
      this.expect('(');
      const disc = this.parseExpr();
      this.expect(')');
      this.expect('{');
      const cases = [];
      while (!this.accept('}')) {
        this.eofCheck('}');
        const cl = this.peek().line;
        let labels;
        if (this.accept('default')) labels = null;
        else {
          this.expect('case');
          labels = [this.parseTernary()];
          while (this.accept(',')) labels.push(this.parseTernary());
        }
        if (this.accept('->')) {
          let body;
          if (this.is('{')) body = [this.parseBlock()];
          else if (this.is('throw')) body = [this.parseStatement()];
          else { const e = this.parseExpr(); this.expect(';'); body = [{ k: 'expr', e, line: cl }]; }
          cases.push({ labels, body, arrow: true, line: cl });
          continue;
        }
        this.expect(':');
        const body = [];
        while (!this.is('case') && !this.is('default') && !this.is('}')) { this.eofCheck('}'); body.push(this.parseStatement()); }
        cases.push({ labels, body, line: cl });
      }
      return { k: 'switch', disc, cases, line };
    }

    parseTry() {
      const line = this.next().line;
      if (this.is('(')) throw new Unsupported('try-with-resources', line);
      const block = this.parseBlock();
      const catches = [];
      while (this.is('catch')) {
        const cl = this.next().line;
        this.expect('(');
        this.parseModifiers();
        const types = [this.parseType().name];
        while (this.accept('|')) types.push(this.parseType().name);
        const name = this.expectId();
        this.expect(')');
        catches.push({ types, name, body: this.parseBlock(), line: cl });
      }
      let fin = null, finLine = null;
      if (this.is('finally')) { finLine = this.next().line; fin = this.parseBlock(); }
      if (!catches.length && !fin) throw new CompileError("'try' senza 'catch' o 'finally'", line, 'كتلة try يجب أن تتبعها catch أو finally على الأقل');
      return { k: 'try', block, catches, fin, finLine, line };
    }

    // ── Espressioni ──
    parseExpr() { return this.parseAssign(); }

    parseAssign() {
      const lhs = this.parseTernary();
      const t = this.peek();
      if (t.t === 'op' && ASSIGN.has(t.v)) {
        this.pos++;
        if (!['name', 'field', 'index'].includes(lhs.k)) {
          throw new CompileError("il lato sinistro di un'assegnazione deve essere una variabile", t.line, 'الطرف الأيسر من عملية الإسناد يجب أن يكون متغيراً');
        }
        const value = this.is('{') ? this.parseArrayInit() : this.parseAssign();
        return { k: 'assign', op: t.v, target: lhs, value, line: t.line };
      }
      return lhs;
    }

    parseTernary() {
      const c = this.parseBinary(1);
      if (this.is('?')) {
        const line = this.next().line;
        const a = this.parseTernary();
        this.expect(':');
        const b = this.parseTernary();
        return { k: 'cond', c, a, b, line };
      }
      return c;
    }

    parseBinary(min) {
      let left = this.parseUnary();
      for (;;) {
        const t = this.peek();
        const prec = (t.t === 'op' || t.v === 'instanceof') ? PREC[t.v] : undefined;
        if (!prec || prec < min) return left;
        this.pos++;
        if (t.v === 'instanceof') {
          this.accept('final');
          const type = this.parseType();
          let bind = null;
          if (this.peek().t === 'id') bind = this.next().v;
          left = { k: 'instanceof', e: left, type, bind, line: t.line };
          continue;
        }
        const right = this.parseBinary(prec + 1);
        left = { k: 'bin', op: t.v, l: left, r: right, line: t.line };
      }
    }

    parseUnary() {
      const t = this.peek();
      if (t.t === 'op') {
        if (t.v === '+' || t.v === '-' || t.v === '!' || t.v === '~') {
          this.pos++;
          const e = this.parseUnary();
          if (t.v === '-' && e.k === 'lit' && typeof e.value === 'number' && e.type !== 'char' && !e.paren) {
            return { ...e, value: -e.value, raw: '-' + e.raw };
          }
          return { k: 'unary', op: t.v, e, line: t.line };
        }
        if (t.v === '++' || t.v === '--') {
          this.pos++;
          const e = this.parseUnary();
          this.checkLvalue(e, t);
          return { k: 'preinc', op: t.v, e, line: t.line };
        }
        if (t.v === '(' && this.isCast()) {
          this.pos++;
          const type = this.parseType();
          this.expect(')');
          const e = this.parseUnary();
          return { k: 'cast', type, e, line: t.line };
        }
      }
      return this.parsePostfix(this.parsePrimary());
    }

    isCast() {
      const a = this.peek(1);
      if (a.t === 'kw' && PRIMS.has(a.v) && a.v !== 'void') {
        let k = 2;
        while (this.is('[', k) && this.is(']', k + 1)) k += 2;
        return this.is(')', k);
      }
      if (a.t === 'id') {
        let k = 2;
        while (this.is('.', k) && this.peek(k + 1).t === 'id') k += 2;
        if (this.is('<', k)) return false;
        while (this.is('[', k) && this.is(']', k + 1)) k += 2;
        if (!this.is(')', k)) return false;
        const n = this.peek(k + 1);
        if (n.t === 'id' || n.t === 'str' || n.t === 'num' || n.t === 'char') return true;
        if (n.t === 'kw' && ['this', 'new', 'super', 'true', 'false', 'null'].includes(n.v)) return true;
        if (n.t === 'op' && (n.v === '(' || n.v === '!' || n.v === '~')) return true;
      }
      return false;
    }

    checkLvalue(e, t) {
      if (!['name', 'field', 'index'].includes(e.k)) {
        throw new CompileError(`l'operatore ${t.v} richiede una variabile`, t.line, `المعامل ${t.v} يحتاج إلى متغير`);
      }
    }

    parsePrimary() {
      const t = this.next();
      const line = t.line;
      switch (t.t) {
        case 'num': return { k: 'lit', type: t.kind, value: t.v, raw: t.raw, line };
        case 'str': return { k: 'lit', type: 'String', value: t.v, line };
        case 'char': return { k: 'lit', type: 'char', value: t.v, line };
        case 'id':
          if (this.is('->')) throw new Unsupported('espressioni lambda', line);
          if (this.is('(')) return { k: 'call', target: null, name: t.v, args: this.parseArgs(), line };
          return { k: 'name', name: t.v, line };
        case 'kw':
          switch (t.v) {
            case 'true': case 'false': return { k: 'lit', type: 'boolean', value: t.v === 'true', line };
            case 'null': return { k: 'lit', type: 'null', value: null, line };
            case 'this':
              if (this.is('(')) return { k: 'ctorcall', which: 'this', args: this.parseArgs(), line };
              return { k: 'this', line };
            case 'super': {
              if (this.is('(')) return { k: 'ctorcall', which: 'super', args: this.parseArgs(), line };
              this.expect('.');
              const name = this.expectId();
              if (this.is('(')) return { k: 'supercall', name, args: this.parseArgs(), line };
              return { k: 'superfield', name, line };
            }
            case 'new': return this.parseNew(line);
            case 'switch': throw new Unsupported('espressioni switch', line);
            default: break;
          }
          break;
        case 'op':
          if (t.v === '(') {
            if (this.is(')', 0) && this.is('->', 1)) throw new Unsupported('espressioni lambda', line);
            const e = this.parseExpr();
            this.expect(')');
            return { ...e, paren: true };
          }
          break;
        default: break;
      }
      throw new CompileError(`espressione non valida: '${t.v}' inatteso`, line, `تعبير غير صالح: الرمز '${t.v}' غير متوقع هنا`);
    }

    parseArgs() {
      this.expect('(');
      const a = [];
      if (!this.accept(')')) {
        do a.push(this.parseExpr()); while (this.accept(','));
        this.expect(')');
      }
      return a;
    }

    parseNew(line) {
      const t = this.peek();
      let name;
      if (t.t === 'kw' && PRIMS.has(t.v)) { this.pos++; name = t.v; } else {
        name = this.expectId();
        while (this.is('.') && this.peek(1).t === 'id') { this.pos++; name = this.next().v; }
        if (this.is('<')) this.skipTypeArgs();
      }
      if (this.is('[')) {
        const sizes = [];
        let dims = 0;
        while (this.is('[')) {
          this.pos++;
          if (this.accept(']')) { dims++; continue; }
          if (dims > sizes.length) throw new CompileError('dimensioni dell\'array non valide', line, 'أبعاد المصفوفة غير صالحة');
          sizes.push(this.parseExpr());
          this.expect(']');
          dims++;
        }
        let init = null;
        if (this.is('{')) {
          if (sizes.length) throw new CompileError('non si può indicare la dimensione insieme all\'inizializzatore { }', line, 'لا يمكن تحديد حجم المصفوفة مع قائمة القيم { } في نفس الوقت');
          init = this.parseArrayInit();
        } else if (!sizes.length) throw new CompileError('manca la dimensione dell\'array', line, 'ينقص حجم المصفوفة بين [ ]');
        return { k: 'newarray', elem: name, sizes, dims, init, line };
      }
      const args = this.parseArgs();
      if (this.is('{')) throw new Unsupported('classi anonime', line);
      return { k: 'new', cls: name, args, line };
    }

    parseArrayInit() {
      const line = this.expect('{').line;
      const items = [];
      while (!this.is('}')) {
        this.eofCheck('}');
        items.push(this.is('{') ? this.parseArrayInit() : this.parseExpr());
        if (!this.accept(',')) break;
      }
      this.expect('}');
      return { k: 'arrinit', items, line };
    }

    parsePostfix(e) {
      for (;;) {
        if (this.is('.')) {
          const line = this.next().line;
          if (this.is('new') || this.is('class') || this.is('this')) throw new Unsupported('sintassi .' + this.peek().v, line);
          if (this.is('<')) this.skipTypeArgs();
          const name = this.expectId();
          if (this.is('(')) e = { k: 'call', target: e, name, args: this.parseArgs(), line };
          else e = { k: 'field', target: e, name, line };
        } else if (this.is('[')) {
          const line = this.next().line;
          const idx = this.parseExpr();
          this.expect(']');
          e = { k: 'index', arr: e, idx, line };
        } else if (this.is('++') || this.is('--')) {
          const t = this.next();
          this.checkLvalue(e, t);
          e = { k: 'postinc', op: t.v, e, line: t.line };
        } else if (this.is('::')) {
          throw new Unsupported('riferimenti a metodo (::)', this.peek().line);
        } else return e;
      }
    }
  }

  // ───────────────────────── Valori ─────────────────────────
  const mk = {
    int: (v) => ({ t: 'int', v: v | 0 }),
    long: (v) => ({ t: 'long', v: Math.trunc(v) }),
    double: (v) => ({ t: 'double', v }),
    bool: (v) => ({ t: 'boolean', v: !!v }),
    char: (v) => ({ t: 'char', v: v & 0xffff }),
  };
  const NULL = { t: 'null', v: null };
  const VOID = { t: 'void', v: undefined };
  const isNum = (v) => v.t === 'int' || v.t === 'long' || v.t === 'double' || v.t === 'char';
  const isPrimVal = (v) => isNum(v) || v.t === 'boolean';

  const BUILTIN_EXC = {
    Throwable: 'Object', Exception: 'Throwable', Error: 'Throwable', RuntimeException: 'Exception',
    ArithmeticException: 'RuntimeException', NullPointerException: 'RuntimeException', ClassCastException: 'RuntimeException',
    IllegalArgumentException: 'RuntimeException', NumberFormatException: 'IllegalArgumentException',
    IllegalStateException: 'RuntimeException', IndexOutOfBoundsException: 'RuntimeException',
    ArrayIndexOutOfBoundsException: 'IndexOutOfBoundsException', StringIndexOutOfBoundsException: 'IndexOutOfBoundsException',
    NegativeArraySizeException: 'RuntimeException', UnsupportedOperationException: 'RuntimeException',
    ArrayStoreException: 'RuntimeException', NoSuchElementException: 'RuntimeException',
    InputMismatchException: 'NoSuchElementException', ConcurrentModificationException: 'RuntimeException',
    IOException: 'Exception', FileNotFoundException: 'IOException', InterruptedException: 'Exception',
    CloneNotSupportedException: 'Exception', StackOverflowError: 'Error', OutOfMemoryError: 'Error',
  };
  const PKG = {
    IOException: 'java.io', FileNotFoundException: 'java.io', InputMismatchException: 'java.util',
    NoSuchElementException: 'java.util', ConcurrentModificationException: 'java.util',
  };
  const WRAP = { Integer: 'int', Long: 'long', Double: 'double', Float: 'double', Short: 'int', Byte: 'int', Boolean: 'boolean', Character: 'char' };
  const STATIC_CLASSES = new Set(['Math', 'System', 'Integer', 'Double', 'Long', 'Boolean', 'Character', 'String', 'Arrays',
    'Objects', 'List', 'Thread', 'Float', 'Short', 'Byte']);
  const UNSUPPORTED_JDK = new Set(['HashMap', 'HashSet', 'TreeMap', 'TreeSet', 'LinkedHashMap', 'Scanner', 'File', 'FileReader',
    'FileWriter', 'BufferedReader', 'BufferedWriter', 'PrintWriter', 'Thread', 'Optional', 'Stack', 'Vector', 'Iterator',
    'LocalDate', 'DecimalFormat', 'InputStreamReader', 'Map', 'Set', 'Queue', 'Deque', 'ArrayDeque', 'PriorityQueue']);

  function kindOf(type) {
    if (!type) return 'ref';
    if (type.dims > 0) return 'ref';
    switch (type.name) {
      case 'int': case 'short': case 'byte': return 'int';
      case 'long': return 'long';
      case 'double': case 'float': return 'double';
      case 'boolean': return 'boolean';
      case 'char': return 'char';
      case 'String': return 'String';
      case 'void': return 'void';
      case 'var': return 'var';
      default: break;
    }
    if (WRAP[type.name]) return 'w:' + WRAP[type.name];
    return 'ref';
  }
  const typeStr = (t) => (t ? t.name + '[]'.repeat(t.dims || 0) : '?');

  function defaultVal(type) {
    switch (kindOf(type)) {
      case 'int': return mk.int(0);
      case 'long': return mk.long(0);
      case 'double': return mk.double(0);
      case 'boolean': return mk.bool(false);
      case 'char': return mk.char(0);
      default: return NULL;
    }
  }

  function javaDouble(x) {
    if (Number.isNaN(x)) return 'NaN';
    if (x === Infinity) return 'Infinity';
    if (x === -Infinity) return '-Infinity';
    if (x === 0) return 1 / x < 0 ? '-0.0' : '0.0';
    const ax = Math.abs(x);
    if (ax >= 1e-3 && ax < 1e7) {
      const s = String(x);
      return s.includes('.') ? s : s + '.0';
    }
    let [m, ex] = x.toExponential().split('e');
    if (!m.includes('.')) m += '.0';
    return m + 'E' + (ex[0] === '+' ? ex.slice(1) : ex);
  }

  function exprStr(e) {
    if (!e) return '';
    switch (e.k) {
      case 'name': return e.name;
      case 'this': return 'this';
      case 'field': return exprStr(e.target) + '.' + e.name;
      case 'superfield': return 'super.' + e.name;
      case 'index': return exprStr(e.arr) + '[' + exprStr(e.idx) + ']';
      case 'call': return (e.target ? exprStr(e.target) + '.' : '') + e.name + '(' + (e.args.length ? '…' : '') + ')';
      case 'lit':
        if (e.type === 'String') return JSON.stringify(e.value);
        if (e.type === 'char') return "'" + String.fromCharCode(e.value) + "'";
        return String(e.raw !== undefined ? e.raw : e.value);
      case 'new': return 'new ' + e.cls + '(…)';
      case 'bin': return exprStr(e.l) + ' ' + e.op + ' ' + exprStr(e.r);
      case 'unary': return e.op + exprStr(e.e);
      default: return '…';
    }
  }

  function javaStringHash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return h;
  }

  function formatJava(fmt, args, toStr) {
    let ai = 0;
    return fmt.replace(/%([-#+ 0,(]*)(\d+)?(?:\.(\d+))?([sSdfnbBcxXeE%])/g, (m, flags, width, prec, conv) => {
      if (conv === 'n') return '\n';
      if (conv === '%') return '%';
      const a = args[ai++];
      if (a === undefined) throw new Error('MissingFormatArgument');
      let s;
      switch (conv) {
        case 'd': {
          if (a.t === 'double') throw new Error('IllegalFormatConversion: d != java.lang.Double');
          s = String(Math.trunc(a.v));
          if (flags.includes(',')) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          if (flags.includes('+') && a.v >= 0) s = '+' + s;
          break;
        }
        case 'f': {
          const p = prec !== undefined ? +prec : 6;
          s = Number(a.v).toFixed(p);
          if (flags.includes(',')) { const [ip, dp] = s.split('.'); s = ip.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (dp ? ',' + dp : ''); }
          if (flags.includes('+') && a.v >= 0) s = '+' + s;
          break;
        }
        case 'e': case 'E': s = Number(a.v).toExponential(prec !== undefined ? +prec : 6).replace(/e([+-])(\d)$/, 'e$10$2'); if (conv === 'E') s = s.toUpperCase(); break;
        case 'x': case 'X': s = (a.v >>> 0).toString(16); if (conv === 'X') s = s.toUpperCase(); break;
        case 'c': s = a.t === 'char' ? String.fromCharCode(a.v) : String.fromCharCode(a.v); break;
        case 'b': case 'B': s = a.t === 'null' ? 'false' : a.t === 'boolean' ? String(a.v) : 'true'; break;
        default: s = toStr(a); if (prec !== undefined) s = s.slice(0, +prec); if (conv === 'S') s = s.toUpperCase();
      }
      if (width && s.length < +width) {
        if (flags.includes('-')) s = s.padEnd(+width);
        else if (flags.includes('0') && /[dfxXeE]/.test(conv)) {
          const neg = s[0] === '-' || s[0] === '+';
          s = neg ? s[0] + s.slice(1).padStart(+width - 1, '0') : s.padStart(+width, '0');
        } else s = s.padStart(+width);
      }
      return s;
    });
  }

  // ───────────────────────── Interprete ─────────────────────────
  class Interp {
    constructor(src, types) {
      this.src = src;
      this.lines = src.split('\n');
      this.classes = new Map();
      for (const c of types) {
        if (this.classes.has(c.name)) throw new CompileError(`la classe ${c.name} è definita due volte`, c.line, `الصنف ${c.name} معرّف مرتين`);
        if (c.name in BUILTIN_EXC || c.name === 'String' || c.name === 'Object' || c.name === 'Math' || c.name === 'System') {
          throw new CompileError(`il nome ${c.name} è già usato da una classe della libreria standard`, c.line, `الاسم ${c.name} مستخدم مسبقاً لصنف في مكتبة Java القياسية`);
        }
        this.classes.set(c.name, c);
      }
      this.out = [];
      this.trace = [];
      this.heap = [];
      this.frames = [];
      this.ops = 0;
      this.nextId = 1;
      this.strId = 0;
      this.traceTruncated = false;
      this.statics = new Map();
      this.chainCache = new Map();
      this.silent = 0;
      this.uncaught = null;
      this.lastPrinted = '';
      this.seed = 42;
      this.fileName = 'Main.java';
    }

    // ── Classi ──
    cls(name) { return this.classes.get(name); }
    superOf(name) {
      const c = this.cls(name);
      if (c) return c.ext || (c.kind === 'interface' ? null : 'Object');
      if (name === 'Object') return null;
      if (name in BUILTIN_EXC) return BUILTIN_EXC[name];
      return null;
    }
    isSubtype(a, b) {
      if (a === b || b === 'Object') return true;
      const seen = new Set();
      const stack = [a];
      while (stack.length) {
        const x = stack.pop();
        if (x === b) return true;
        if (seen.has(x)) continue;
        seen.add(x);
        const c = this.cls(x);
        if (c) {
          if (c.ext) stack.push(c.ext);
          stack.push(...c.impls);
        } else if (x in BUILTIN_EXC) stack.push(BUILTIN_EXC[x]);
        else if (x === 'ArrayList') stack.push('List', 'Collection', 'Iterable');
      }
      return false;
    }
    isThrowable(name) { return this.isSubtype(name, 'Throwable'); }
    isRefTypeKnown(name) { return this.classes.has(name) || name in BUILTIN_EXC; }
    qualName(name) {
      if (this.classes.has(name)) return name;
      if (name in BUILTIN_EXC) return (PKG[name] || 'java.lang') + '.' + name;
      return name;
    }
    chain(name) {
      if (this.chainCache.has(name)) return this.chainCache.get(name);
      const out = [];
      const ifaces = [];
      for (let x = name; x; x = this.superOf(x)) {
        const c = this.cls(x);
        if (c) { out.push(c); ifaces.push(...c.impls); }
      }
      const seen = new Set();
      while (ifaces.length) {
        const i = ifaces.shift();
        if (seen.has(i)) continue;
        seen.add(i);
        const c = this.cls(i);
        if (c) { out.push(c); ifaces.push(...c.impls); }
      }
      this.chainCache.set(name, out);
      return out;
    }

    validate() {
      for (const c of this.classes.values()) {
        if (c.ext) {
          const s = this.cls(c.ext);
          if (!s && !(c.ext in BUILTIN_EXC) && c.ext !== 'Object') {
            throw new CompileError(`impossibile trovare la classe ${c.ext}`, c.line, `لا يمكن العثور على الصنف ${c.ext} الذي يرث منه ${c.name}`);
          }
          if (s && s.kind === 'interface') {
            throw new CompileError(`${c.name} non può estendere l'interfaccia ${c.ext}: usa implements`, c.line, `لا يمكن للصنف ${c.name} أن يرث الواجهة ${c.ext} بـ extends؛ استخدم implements`);
          }
          if (s && s.mods.has('final')) throw new CompileError(`impossibile ereditare dalla classe final ${c.ext}`, c.line, `لا يمكن الوراثة من الصنف ${c.ext} لأنه مُعرَّف كـ final`);
        }
        for (const i of c.impls) {
          const s = this.cls(i);
          if (s && s.kind !== 'interface') {
            throw new CompileError(`${i} è una classe, non un'interfaccia: usa extends`, c.line, `${i} صنف وليس واجهة: استخدم extends بدلاً من implements`);
          }
        }
        const seen = new Set();
        for (let x = c.name; x; x = this.cls(x) ? this.cls(x).ext : null) {
          if (seen.has(x)) throw new CompileError(`ereditarietà ciclica che coinvolge ${c.name}`, c.line, `وراثة دائرية تتضمن الصنف ${c.name}`);
          seen.add(x);
        }
        for (const m of c.methods) {
          if (c.kind === 'class') {
            if (m.mods.has('abstract') && m.body) throw new CompileError(`il metodo abstract ${m.name}() non può avere un corpo`, m.line, `الدالة المجردة ${m.name}() لا يمكن أن تحتوي على جسم { }`);
            if (!m.mods.has('abstract') && !m.body && !m.mods.has('native')) throw new CompileError(`manca il corpo del metodo ${m.name}(): aggiungi { } oppure dichiaralo abstract`, m.line, `ينقص جسم الدالة ${m.name}(): أضف { } أو صرّح عنها كـ abstract`);
            if (m.mods.has('abstract') && !c.mods.has('abstract')) throw new CompileError(`${c.name} deve essere dichiarata abstract perché contiene il metodo astratto ${m.name}()`, c.line, `يجب التصريح عن الصنف ${c.name} كـ abstract لأنه يحتوي على الدالة المجردة ${m.name}()`);
          }
        }
        if (c.kind === 'class' && !c.mods.has('abstract')) {
          for (const sc of this.chain(c.name)) {
            for (const m of sc.methods) {
              if (m.body || m.mods.has('static')) continue;
              const impl = this.chain(c.name).some((k) => k.methods.some((x) => x.name === m.name && x.body && x.params.length === m.params.length));
              if (!impl) {
                throw new CompileError(`${c.name} non è astratta e non implementa il metodo astratto ${m.name}() di ${sc.name}`, c.line,
                  `الصنف ${c.name} ليس مجرداً (abstract) ولم يقدّم تنفيذاً للدالة المجردة ${m.name}() الموروثة من ${sc.name}`);
              }
            }
          }
        }
        for (const m of c.methods) {
          if (!m.mods.has('@Override')) continue;
          const sup = this.chain(c.name).filter((k) => k !== c);
          const ok = sup.some((k) => k.methods.some((x) => x.name === m.name && x.params.length === m.params.length)) ||
            (['toString', 'equals', 'hashCode', 'getMessage'].includes(m.name));
          if (!ok) throw new CompileError(`il metodo ${m.name}() non sovrascrive alcun metodo della superclasse (@Override errato)`, m.line, `الدالة ${m.name}() لا تعيد تعريف أي دالة من الصنف الأب، لذا الوسم @Override خاطئ`);
        }
      }
    }

    // ── Memoria ──
    alloc(o) {
      o.id = this.nextId++;
      o.addr = '@' + ((0x4a9f + o.id * 0x3d1) & 0xffff).toString(16).padStart(4, '0');
      this.heap.push(o);
      if (this.heap.length > 50000) throw new LimitError('troppi oggetti allocati nello Heap (OutOfMemory simulato)');
      return o;
    }
    str(s, interned) { return { t: 'String', v: s, id: interned ? 'L:' + s : 'S' + (++this.strId) }; }

    top() { return this.frames[this.frames.length - 1]; }
    curClassName() { const f = this.top(); return f && f.cls ? f.cls.name : null; }
    pushFrame(name, cls, self, line, isCtor) {
      if (this.frames.length >= MAX_DEPTH) throw this.jthrow('StackOverflowError', null, line);
      const f = { name, cls, self, scopes: [new Map()], line, isCtor: !!isCtor };
      this.frames.push(f);
      return f;
    }
    popFrame() { this.frames.pop(); }
    pushScope() { this.top().scopes.push(new Map()); }
    popScope() { this.top().scopes.pop(); }

    tick(line) {
      if (++this.ops > MAX_OPS) throw new LimitError(`superato il limite di ${MAX_OPS} operazioni: probabile ciclo infinito`, line);
      const f = this.top();
      if (f && line) f.line = line;
    }

    declare(name, type, value, final, line) {
      const f = this.top();
      for (const s of f.scopes) {
        if (s.has(name)) {
          throw new CompileError(`la variabile ${name} è già definita in questo metodo`, line, `المتغير ${name} مُعرَّف مسبقاً في نفس الدالة (لا يمكن إعادة تعريفه في نطاق متداخل)`);
        }
      }
      f.scopes[f.scopes.length - 1].set(name, { type, value, final, assigned: value !== undefined });
    }
    findVar(name) {
      const f = this.top();
      if (!f) return null;
      for (let i = f.scopes.length - 1; i >= 0; i--) {
        const v = f.scopes[i].get(name);
        if (v) return v;
      }
      return null;
    }
    findStatic(clsName, name) {
      if (!clsName) return null;
      for (const c of this.chain(clsName)) {
        const m = this.statics.get(c.name);
        if (m && m.has(name)) return m.get(name);
      }
      return null;
    }
    instanceFieldDeclared(clsName, name) {
      return clsName && this.chain(clsName).some((c) => c.fields.some((f) => f.name === name && !f.mods.has('static')));
    }
    checkAccess(f, name, line) {
      if (f.access === 'private' && f.decl !== this.curClassName()) {
        throw new CompileError(`${name} ha accesso private in ${f.decl}`, line,
          `الحقل ${name} مُعرَّف كـ private داخل الصنف ${f.decl}، لذا لا يمكن الوصول إليه مباشرة من خارج الصنف. استخدم دالة get/set (مبدأ التغليف Encapsulation).`);
      }
    }

    uninit(name, line) {
      return new CompileError(`la variabile ${name} potrebbe non essere stata inizializzata`, line, `المتغير ${name} قد لا يكون مُهيّأً: يجب إسناد قيمة له قبل قراءته`);
    }
    notFound(name, line) {
      return new CompileError(`simbolo non trovato: ${name}`, line,
        `الرمز ${name} غير معروف: لم يتم التصريح عن متغير أو حقل بهذا الاسم، أو أنه خارج نطاق الرؤية (scope)، أو هناك خطأ إملائي (Java حساسة لحالة الأحرف).`);
    }
    staticCtx(name, line) {
      return new CompileError(`la variabile non statica ${name} non può essere referenziata da un contesto statico`, line,
        `لا يمكن الوصول إلى الحقل غير الساكن ${name} من سياق ساكن (static) مثل main: أنشئ كائناً أولاً ثم استخدمه.`);
    }

    readName(name, line) {
      const v = this.findVar(name);
      if (v) {
        if (v.value === undefined) throw this.uninit(name, line);
        return v.value;
      }
      const f = this.top();
      if (f.self) {
        const fld = f.self.fields.get(name);
        if (fld && this.instanceFieldDeclared(f.cls ? f.cls.name : f.self.cls, name)) { this.checkAccess(fld, name, line); return fld.value; }
      }
      const sf = this.findStatic(f.cls ? f.cls.name : null, name);
      if (sf) return sf.value;
      if (!f.self && f.cls && this.instanceFieldDeclared(f.cls.name, name)) throw this.staticCtx(name, line);
      if (this.classes.has(name) || STATIC_CLASSES.has(name) || name in BUILTIN_EXC) return { t: 'class', v: name };
      throw this.notFound(name, line);
    }

    lvalue(e) {
      const line = e.line;
      if (e.k === 'name') {
        const v = this.findVar(e.name);
        if (v) {
          return {
            type: v.type,
            get: () => { if (v.value === undefined) throw this.uninit(e.name, line); return v.value; },
            set: (x) => {
              if (v.final && v.assigned) throw new CompileError(`impossibile assegnare un valore alla variabile final ${e.name}`, line, `لا يمكن تغيير قيمة الثابت ${e.name} لأنه مُعرَّف كـ final`);
              v.value = this.coerce(x, v.type, line);
              v.assigned = true;
              return v.value;
            },
          };
        }
        const f = this.top();
        if (f.self) {
          const fld = f.self.fields.get(e.name);
          if (fld && this.instanceFieldDeclared(f.cls ? f.cls.name : f.self.cls, e.name)) { this.checkAccess(fld, e.name, line); return this.fieldLv(f.self, fld, e.name, line); }
        }
        const sf = this.findStatic(f.cls ? f.cls.name : null, e.name);
        if (sf) return this.staticLv(sf, e.name, line);
        if (!f.self && f.cls && this.instanceFieldDeclared(f.cls.name, e.name)) throw this.staticCtx(e.name, line);
        throw this.notFound(e.name, line);
      }
      if (e.k === 'field' || e.k === 'superfield') {
        const tv = e.k === 'superfield' ? this.eval({ k: 'this', line }) : this.eval(e.target);
        if (tv.t === 'null') throw this.jthrow('NullPointerException', `Cannot assign field "${e.name}" because "${exprStr(e.target)}" is null`, line);
        if (tv.t === 'class') {
          const sf = this.findStatic(tv.v, e.name);
          if (!sf) throw this.notFound(tv.v + '.' + e.name, line);
          if (sf.access === 'private' && sf.decl !== this.curClassName()) this.checkAccess(sf, e.name, line);
          return this.staticLv(sf, e.name, line);
        }
        if (tv.t === 'ref' && tv.v.kind === 'obj') {
          const fld = tv.v.fields.get(e.name);
          if (fld) { this.checkAccess(fld, e.name, line); return this.fieldLv(tv.v, fld, e.name, line); }
          const sf = this.findStatic(tv.v.cls, e.name);
          if (sf) return this.staticLv(sf, e.name, line);
        }
        if (tv.t === 'ref' && tv.v.kind === 'array' && e.name === 'length') {
          throw new CompileError('impossibile assegnare un valore alla variabile final length', line, 'لا يمكن تغيير طول المصفوفة length لأنه ثابت (final)');
        }
        throw this.notFound(e.name, line);
      }
      if (e.k === 'index') {
        const a = this.eval(e.arr);
        const i = this.intOf(this.eval(e.idx), line);
        if (a.t === 'null') throw this.jthrow('NullPointerException', `Cannot store to array because "${exprStr(e.arr)}" is null`, line);
        if (!(a.t === 'ref' && a.v.kind === 'array')) throw new CompileError('è richiesto un array ma è stato trovato ' + this.typeOfVal(a), line, 'كان متوقعاً مصفوفة (array)');
        const arr = a.v;
        const chk = () => {
          if (i < 0 || i >= arr.items.length) throw this.jthrow('ArrayIndexOutOfBoundsException', `Index ${i} out of bounds for length ${arr.items.length}`, line);
        };
        return {
          type: arr.elem,
          get: () => { chk(); return arr.items[i]; },
          set: (x) => { chk(); const v = this.coerce(x, arr.elem, line); arr.items[i] = v; return v; },
        };
      }
      throw new CompileError('assegnazione non valida', line, 'إسناد غير صالح');
    }
    fieldLv(obj, fld, name, line) {
      return {
        type: fld.type,
        get: () => fld.value,
        set: (x) => {
          if (fld.final) {
            const f = this.top();
            if (!(f.isCtor && f.self === obj) || fld.assignedInCtor) {
              throw new CompileError(`impossibile assegnare un valore al campo final ${name}`, line, `لا يمكن تغيير قيمة الحقل الثابت ${name} (final)`);
            }
            fld.assignedInCtor = true;
          }
          fld.value = this.coerce(x, fld.type, line);
          return fld.value;
        },
      };
    }
    staticLv(sf, name, line) {
      return {
        type: sf.type,
        get: () => sf.value,
        set: (x) => {
          if (sf.final && sf.initDone) throw new CompileError(`impossibile assegnare un valore alla costante final ${name}`, line, `لا يمكن تغيير قيمة الثابت ${name} لأنه final`);
          sf.value = this.coerce(x, sf.type, line);
          return sf.value;
        },
      };
    }

    typeOfVal(v) {
      switch (v.t) {
        case 'ref': {
          const o = v.v;
          if (o.kind === 'obj') return o.cls;
          if (o.kind === 'array') return typeStr(o.elem) + '[]';
          if (o.kind === 'list') return 'ArrayList';
          if (o.kind === 'sb') return 'StringBuilder';
          return o.kind;
        }
        case 'class': return 'class ' + v.v;
        default: return v.t;
      }
    }

    coerce(v, type, line) {
      const k = kindOf(type);
      if (v.t === 'void') throw new CompileError("un metodo 'void' non restituisce alcun valore", line, 'الدالة من نوع void لا تُعيد أي قيمة، فلا يمكن استخدام نتيجتها');
      const bad = () => {
        throw new CompileError(`tipi incompatibili: ${this.typeOfVal(v)} non può essere convertito in ${typeStr(type)}`, line,
          `أنواع غير متوافقة: لا يمكن تحويل ${this.typeOfVal(v)} إلى ${typeStr(type)}`);
      };
      const lossy = () => {
        throw new CompileError(`tipi incompatibili: possibile perdita di precisione nella conversione da ${v.t} a ${type.name}`, line,
          `أنواع غير متوافقة: قد تضيع دقة القيمة عند التحويل من ${v.t} إلى ${type.name}؛ استخدم تحويلاً صريحاً (cast) مثل (${type.name})`);
      };
      switch (k) {
        case 'var': return v;
        case 'int':
          if (v.t === 'int') {
            if (type.name === 'byte' && (v.v < -128 || v.v > 127)) lossy();
            if (type.name === 'short' && (v.v < -32768 || v.v > 32767)) lossy();
            return v;
          }
          if (v.t === 'char') return mk.int(v.v);
          if (v.t === 'long' || v.t === 'double') lossy();
          return bad();
        case 'long':
          if (v.t === 'int' || v.t === 'char' || v.t === 'long') return mk.long(v.v);
          if (v.t === 'double') lossy();
          return bad();
        case 'double':
          if (isNum(v)) return mk.double(v.v);
          return bad();
        case 'boolean': return v.t === 'boolean' ? v : bad();
        case 'char':
          if (v.t === 'char') return v;
          if (v.t === 'int' && v.v >= 0 && v.v <= 0xffff) return mk.char(v.v);
          return bad();
        case 'String': return v.t === 'String' || v.t === 'null' ? v : bad();
        case 'void': return v;
        default: break;
      }
      if (k.startsWith('w:')) {
        if (v.t === 'null') return v;
        if (v.t !== k.slice(2)) bad();
        return v;
      }
      if (v.t === 'null') return v;
      if (type.dims > 0) {
        if (v.t === 'ref' && v.v.kind === 'array') return v;
        return bad();
      }
      const tn = type.name;
      if (this.isRefTypeKnown(tn)) {
        if (v.t === 'ref' && v.v.kind === 'obj') {
          if (!this.isSubtype(v.v.cls, tn)) bad();
          return v;
        }
        return bad();
      }
      if (v.t === 'String' && !['Object', 'CharSequence', 'Comparable', 'T', 'E'].includes(tn) && tn.length > 1) {
        if (/^(List|ArrayList|Collection|Iterable)$/.test(tn)) bad();
      }
      return v;
    }

    castPrim(v, kind) {
      switch (kind) {
        case 'int': return mk.int(v.t === 'double' ? this.d2i(v.v) : v.v);
        case 'long': return mk.long(v.v);
        case 'double': return mk.double(v.v);
        case 'char': return mk.char(Math.trunc(v.v));
        default: return v;
      }
    }
    d2i(x) {
      if (Number.isNaN(x)) return 0;
      if (x >= 2147483647) return 2147483647;
      if (x <= -2147483648) return -2147483648;
      return Math.trunc(x);
    }
    intOf(v, line) {
      if (v.t === 'int' || v.t === 'char') return v.v;
      throw new CompileError(`tipi incompatibili: è richiesto un int ma è stato trovato ${this.typeOfVal(v)}`, line, `أنواع غير متوافقة: المطلوب عدد صحيح int لكن وُجد ${this.typeOfVal(v)}`);
    }
    bool(v, line) {
      if (v.t !== 'boolean') {
        throw new CompileError(`tipi incompatibili: ${this.typeOfVal(v)} non può essere convertito in boolean`, line,
          `أنواع غير متوافقة: الشرط يجب أن يكون boolean (true/false) وليس ${this.typeOfVal(v)}. هل كتبت = بدلاً من == ؟`);
      }
      return v.v;
    }

    // ── Eccezioni ──
    stackTraceLines() {
      const out = [];
      for (let i = this.frames.length - 1; i >= 0; i--) {
        const f = this.frames[i];
        if (f.hidden) continue;
        out.push(`\tat ${f.traceName || f.name}(${this.fileName}:${f.line})`);
      }
      if (out.length > 12) return out.slice(0, 10).concat([`\t... ${out.length - 11} more`, out[out.length - 1]]);
      return out;
    }
    makeThrowable(clsName, msg) {
      const obj = this.alloc({ kind: 'obj', cls: clsName, fields: new Map() });
      obj.fields.set('message', { type: { name: 'String', dims: 0 }, value: msg === null || msg === undefined ? NULL : this.str(msg), access: 'private', decl: 'Throwable' });
      obj.trace = this.stackTraceLines();
      return obj;
    }
    jthrow(clsName, msg, line) {
      const obj = this.makeThrowable(clsName, msg);
      this.record(line, 'jvmthrow', { ex: obj });
      return new JavaThrow(obj, line);
    }
    excMessage(o) {
      const gm = this.findMethod(o.cls, 'getMessage', []);
      if (gm) return this.invoke(gm, o, [], 0);
      const f = o.fields.get('message');
      return f ? f.value : NULL;
    }
    throwableToString(o) {
      const m = this.excMessage(o);
      return this.qualName(o.cls) + (m.t === 'null' ? '' : ': ' + this.toStr(m));
    }
    stackTraceText(o) {
      return this.throwableToString(o) + '\n' + (o.trace || []).join('\n') + '\n';
    }

    // ── Stringhe ──
    toStr(v) {
      switch (v.t) {
        case 'String': return v.v;
        case 'int': case 'long': return String(v.v);
        case 'double': return javaDouble(v.v);
        case 'boolean': return String(v.v);
        case 'char': return String.fromCharCode(v.v);
        case 'null': return 'null';
        case 'class': return 'class ' + v.v;
        case 'stream': return 'java.io.PrintStream' + '@1b6d3586';
        case 'void': throw new CompileError("'void' non è consentito qui: il metodo non restituisce un valore", this.top() ? this.top().line : 0, 'لا يمكن استخدام نتيجة دالة من نوع void لأنها لا تُعيد قيمة');
        case 'ref': return this.objToString(v.v);
        default: return String(v.v);
      }
    }
    hashHex(o) { return o.addr.slice(1); }
    objToString(o) {
      switch (o.kind) {
        case 'array': {
          const codes = { int: 'I', double: 'D', char: 'C', boolean: 'Z', long: 'J', byte: 'B', short: 'S', float: 'F' };
          const e = o.elem;
          const code = e.dims > 0 ? '[' : (codes[e.name] || 'L' + (e.name === 'String' ? 'java.lang.String' : e.name) + ';');
          return '[' + code + '@' + this.hashHex(o);
        }
        case 'list': return '[' + o.items.map((x) => this.toStr(x)).join(', ') + ']';
        case 'sb': return o.s;
        case 'classobj': return 'class ' + o.name;
        case 'random': return 'java.util.Random@' + this.hashHex(o);
        case 'obj': {
          const m = this.findMethod(o.cls, 'toString', []);
          if (m) return this.toStr(this.invoke(m, o, [], 0));
          return this.defaultToString(o);
        }
        default: return String(o);
      }
    }
    defaultToString(o) {
      if (this.isThrowable(o.cls)) return this.throwableToString(o);
      return o.cls + '@' + this.hashHex(o);
    }
    javaEquals(a, b) {
      if (a.t === 'String') return b.t === 'String' && a.v === b.v;
      if (isNum(a) && isNum(b)) return a.v === b.v && a.t === b.t;
      if (a.t === 'boolean') return b.t === 'boolean' && a.v === b.v;
      if (a.t === 'null') return b.t === 'null';
      if (a.t === 'ref' && a.v.kind === 'obj') {
        const m = this.findMethod(a.v.cls, 'equals', [b]);
        if (m) return this.invoke(m, a.v, [b], 0).v;
      }
      return a.t === b.t && a.v === b.v;
    }

    // ── Statiche ──
    initStatics() {
      this.silent++;
      try {
        for (const c of this.classes.values()) {
          const m = new Map();
          this.statics.set(c.name, m);
          for (const f of c.fields) {
            if (!f.mods.has('static')) continue;
            m.set(f.name, { type: f.type, value: defaultVal(f.type), final: f.mods.has('final'), access: f.mods.has('private') ? 'private' : 'public', decl: c.name });
          }
        }
        for (const c of this.classes.values()) {
          const fr = this.pushFrame(`${c.name}.<clinit>`, c, null, c.line);
          fr.hidden = true;
          try {
            for (const f of c.fields) {
              if (!f.mods.has('static')) continue;
              const sf = this.statics.get(c.name).get(f.name);
              if (f.init) sf.value = this.coerce(this.evalInit(f.init, f.type, f.line), f.type, f.line);
              sf.initDone = true;
            }
            for (const b of c.staticInits) this.execBlock(b.stmts);
          } finally { this.popFrame(); }
        }
      } finally { this.silent--; }
    }

    evalInit(init, type, line) {
      if (init.k === 'arrinit') return this.arrayFromInit(init, type, line);
      return this.eval(init);
    }

    // ── Avvio ──
    start() {
      this.initStatics();
      const all = [...this.classes.values()];
      const hasMain = (c) => c.methods.some((m) => m.name === 'main' && m.mods.has('static'));
      const mainCls = all.find((c) => hasMain(c) && c.mods.has('public')) || all.find(hasMain);
      if (!mainCls) {
        throw new CompileError("nessun metodo 'public static void main(String[] args)' trovato", 1,
          'لا توجد دالة main: نقطة بداية أي برنامج Java هي public static void main(String[] args)');
      }
      const pub = all.find((c) => c.mods.has('public') && c.kind === 'class');
      this.fileName = (pub ? pub.name : mainCls.name) + '.java';
      const main = mainCls.methods.find((m) => m.name === 'main' && m.mods.has('static'));
      const args = main.params.length ? [{ t: 'ref', v: this.alloc({ kind: 'array', elem: { name: 'String', dims: 0 }, items: [] }) }] : [];
      const last = this.lines.length;
      try {
        this.invoke(main, null, args, main.line);
        this.record(last, 'end');
      } catch (e) {
        if (e instanceof JavaThrow) {
          this.uncaught = { cls: e.obj.cls, qual: this.qualName(e.obj.cls), line: e.line };
          this.silent++;
          let txt;
          try { txt = this.stackTraceText(e.obj); } finally { this.silent--; }
          this.uncaught.text = txt.split('\n')[0];
          this.emit('Exception in thread "main" ' + txt, true);
          this.record(e.line || last, 'uncaught', { ex: e.obj });
        } else if (e instanceof ExitSig) {
          this.frames = [];
          this.record(last, 'exit', { code: e.code });
        } else throw e;
      }
    }

    emit(text, err) {
      this.out.push({ text, err: !!err });
      if (this.out.reduce((n, c) => n + c.text.length, 0) > 200000) throw new LimitError('output troppo lungo');
    }

    // ── Invocazione ──
    matchScore(params, args) {
      const n = params.length;
      const va = n > 0 && params[n - 1].varargs;
      if (!va && args.length !== n) return Infinity;
      if (va && args.length < n - 1) return Infinity;
      let s = 0;
      for (let i = 0; i < args.length; i++) {
        let p;
        if (va && i >= n - 1) {
          const pt = params[n - 1].type;
          if (args.length === n && args[i].t === 'ref' && args[i].v.kind === 'array') p = pt;
          else p = { ...pt, dims: pt.dims - 1 };
          s += 10;
        } else p = params[i].type;
        const c = this.compat(args[i], p);
        if (c === Infinity) return Infinity;
        s += c;
      }
      return s;
    }
    compat(v, type) {
      const k = kindOf(type);
      const rank = { char: 0, int: 1, long: 2, double: 3 };
      if (k === 'var') return 0;
      if (k in rank) {
        if (!(v.t in rank)) return Infinity;
        if (v.t === k) return 0;
        if (rank[v.t] < rank[k]) return rank[k] - rank[v.t];
        return Infinity;
      }
      if (k === 'boolean') return v.t === 'boolean' ? 0 : Infinity;
      if (k.startsWith('w:')) {
        if (v.t === 'null') return 1;
        return v.t === k.slice(2) ? 3 : Infinity;
      }
      if (k === 'String') return v.t === 'String' ? 0 : v.t === 'null' ? 1 : Infinity;
      if (v.t === 'null') return 1;
      if (type.dims > 0) return v.t === 'ref' && v.v.kind === 'array' ? 0 : Infinity;
      const tn = type.name;
      if (tn === 'Object') return 20;
      if (this.isRefTypeKnown(tn)) {
        if (v.t === 'ref' && v.v.kind === 'obj' && this.isSubtype(v.v.cls, tn)) return v.v.cls === tn ? 0 : 1;
        return Infinity;
      }
      if (v.t === 'ref' && v.v.kind === 'list') return /^(List|ArrayList|Collection|Iterable)$/.test(tn) ? 0 : 6;
      if (isPrimVal(v)) return 8;
      return 6;
    }
    pickMethod(cands, args) {
      let best = null, bestScore = Infinity;
      for (const m of cands) {
        const s = this.matchScore(m.params, args);
        if (s < bestScore) { best = m; bestScore = s; }
      }
      return best;
    }
    findMethod(clsName, name, args, includeAbstract) {
      let best = null, bestScore = Infinity;
      for (const c of this.chain(clsName)) {
        for (const m of c.methods) {
          if (m.name !== name) continue;
          if (!m.body && !includeAbstract) continue;
          const s = this.matchScore(m.params, args);
          if (s < bestScore) { best = m; bestScore = s; }
        }
      }
      return best;
    }
    hasMethodNamed(clsName, name) {
      return this.chain(clsName).some((c) => c.methods.some((m) => m.name === name));
    }
    noMatch(clsName, name, args, line) {
      const sig = args.map((a) => this.typeOfVal(a)).join(', ');
      if (clsName && this.hasMethodNamed(clsName, name)) {
        return new CompileError(`il metodo ${name} della classe ${clsName} non è applicabile agli argomenti (${sig})`, line,
          `الدالة ${name} في الصنف ${clsName} لا تقبل هذه المعاملات (${sig}): تحقق من عدد المعاملات وأنواعها`);
      }
      return new CompileError(`metodo non trovato: ${name}(${sig})${clsName ? ' nella classe ' + clsName : ''}`, line,
        `الدالة ${name}() غير موجودة${clsName ? ' في الصنف ' + clsName : ''}: تحقق من الاسم (Java حساسة لحالة الأحرف)`);
    }

    bindParams(frame, params, args, line) {
      const n = params.length;
      for (let i = 0; i < n; i++) {
        const p = params[i];
        let v;
        if (p.varargs) {
          if (args.length === n && args[i] && args[i].t === 'ref' && args[i].v.kind === 'array') v = args[i];
          else {
            const elem = { ...p.type, dims: p.type.dims - 1 };
            v = { t: 'ref', v: this.alloc({ kind: 'array', elem, items: args.slice(i).map((a) => this.coerce(a, elem, line)) }) };
          }
        } else v = this.coerce(args[i], p.type, line);
        frame.scopes[0].set(p.name, { type: p.type, value: v, final: p.final, assigned: true });
      }
    }

    invoke(m, self, args, line) {
      const cls = this.cls(m.cls);
      const f = this.pushFrame(`${m.cls}.${m.name}()`, cls, self, m.line);
      f.traceName = `${m.cls}.${m.name}`;
      try {
        this.bindParams(f, m.params, args, line);
        this.record(m.line, 'call', { name: m.name, cls: m.cls, main: m.name === 'main' && m.mods.has('static') && this.frames.length === 1 });
        try {
          this.execStmts(m.body.stmts);
        } catch (ex) {
          if (ex instanceof ReturnSig) {
            if (kindOf(m.ret) === 'void') return VOID;
            if (ex.value.t === 'void') {
              throw new CompileError(`il metodo ${m.name}() deve restituire un valore di tipo ${typeStr(m.ret)}`, ex.line, `يجب أن تُعيد الدالة ${m.name}() قيمة من النوع ${typeStr(m.ret)}`);
            }
            return this.coerce(ex.value, m.ret, ex.line);
          }
          throw ex;
        }
        if (kindOf(m.ret) !== 'void') {
          throw new CompileError(`manca l'istruzione return nel metodo ${m.name}()`, m.line, `ينقص أمر return في الدالة ${m.name}() التي يجب أن تُعيد قيمة من النوع ${typeStr(m.ret)}`);
        }
        return VOID;
      } finally {
        this.popFrame();
      }
    }

    newObject(clsName, args, line) {
      const c = this.cls(clsName);
      if (c) {
        if (c.kind === 'interface') {
          throw new CompileError(`${clsName} è un'interfaccia: non può essere istanziata con new`, line, `${clsName} واجهة (interface)، ولا يمكن إنشاء كائن منها مباشرة بـ new؛ أنشئ كائناً من صنف يطبّقها`);
        }
        if (c.mods.has('abstract')) {
          throw new CompileError(`${clsName} è astratta; non può essere istanziata`, line, `الصنف ${clsName} مجرد (abstract) ولا يمكن إنشاء كائن منه مباشرة؛ أنشئ كائناً من صنف فرعي ملموس`);
        }
        const obj = this.alloc({ kind: 'obj', cls: clsName, fields: new Map() });
        for (let x = clsName; x; x = this.superOf(x)) {
          const xc = this.cls(x);
          if (xc) {
            for (const f of xc.fields) {
              if (f.mods.has('static') || obj.fields.has(f.name)) continue;
              obj.fields.set(f.name, {
                type: f.type, value: defaultVal(f.type), final: f.mods.has('final'),
                access: f.mods.has('private') ? 'private' : f.mods.has('public') ? 'public' : f.mods.has('protected') ? 'protected' : 'package', decl: x,
              });
            }
          } else if (x === 'Throwable') {
            obj.fields.set('message', { type: { name: 'String', dims: 0 }, value: NULL, access: 'private', decl: 'Throwable' });
          }
        }
        if (this.isThrowable(clsName)) obj.trace = this.stackTraceLines();
        this.construct(c, obj, args, line);
        return { t: 'ref', v: obj };
      }
      if (clsName in BUILTIN_EXC) {
        let msg = null;
        if (args[0]) {
          if (args[0].t === 'String') msg = args[0].v;
          else if (args[0].t === 'ref' && args[0].v.kind === 'obj' && this.isThrowable(args[0].v.cls)) msg = this.throwableToString(args[0].v);
          else if (args[0].t !== 'null') throw this.noMatch(null, clsName, args, line);
        }
        return { t: 'ref', v: this.makeThrowable(clsName, msg) };
      }
      switch (clsName) {
        case 'ArrayList': case 'LinkedList': {
          const items = args[0] && args[0].t === 'ref' && args[0].v.kind === 'list' ? args[0].v.items.slice() : [];
          return { t: 'ref', v: this.alloc({ kind: 'list', cls: clsName, items }) };
        }
        case 'String':
          if (!args.length) return this.str('');
          if (args[0].t === 'String') return this.str(args[0].v);
          if (args[0].t === 'ref' && args[0].v.kind === 'array') return this.str(args[0].v.items.map((c) => String.fromCharCode(c.v)).join(''));
          break;
        case 'StringBuilder': case 'StringBuffer':
          return { t: 'ref', v: this.alloc({ kind: 'sb', s: args[0] && args[0].t === 'String' ? args[0].v : '' }) };
        case 'Object': return { t: 'ref', v: this.alloc({ kind: 'obj', cls: 'Object', fields: new Map() }) };
        case 'Random': return { t: 'ref', v: this.alloc({ kind: 'random', seed: args[0] ? Number(args[0].v) : 12345 }) };
        default:
          if (WRAP[clsName] && args[0]) return this.coerce(args[0], { name: clsName, dims: 0 }, line);
      }
      if (UNSUPPORTED_JDK.has(clsName)) {
        if (clsName === 'Scanner') throw new Unsupported('Scanner (input da tastiera): nel simulatore usa valori fissi nel codice', line);
        throw new Unsupported(`la classe ${clsName} della libreria Java`, line);
      }
      throw new CompileError(`impossibile trovare la classe ${clsName}`, line, `لا يمكن العثور على الصنف ${clsName}: تحقق من الاسم أو عرّف الصنف أولاً`);
    }

    construct(c, obj, args, line) {
      let ctor = null;
      if (c.ctors.length) {
        ctor = this.pickMethod(c.ctors, args);
        if (!ctor) {
          const sig = args.map((a) => this.typeOfVal(a)).join(', ');
          throw new CompileError(`nessun costruttore ${c.name}(${sig}) compatibile`, line,
            `لا يوجد مُنشئ (constructor) في الصنف ${c.name} يقبل المعاملات (${sig}). ملاحظة: عند تعريف أي مُنشئ يختفي المُنشئ الافتراضي بدون معاملات`);
        }
        if (ctor.mods.has('private') && this.curClassName() !== c.name) {
          throw new CompileError(`il costruttore ${c.name}() è private`, line, `المُنشئ ${c.name}() خاص (private) ولا يمكن استدعاؤه من خارج الصنف`);
        }
      } else if (args.length) {
        throw new CompileError(`la classe ${c.name} ha solo il costruttore di default senza parametri`, line,
          `الصنف ${c.name} لا يحتوي إلا على المُنشئ الافتراضي بدون معاملات، لكنك مرّرت ${args.length} معاملات`);
      }
      const f = this.pushFrame(`${c.name}()`, c, obj, ctor ? ctor.line : c.line, true);
      f.traceName = `${c.name}.<init>`;
      try {
        if (ctor) this.bindParams(f, ctor.params, args, line);
        let stmts = ctor ? ctor.body.stmts : [];
        const first = stmts[0];
        const explicit = first && first.k === 'expr' && first.e.k === 'ctorcall' ? first.e : null;
        this.record(ctor ? ctor.line : c.line, 'ctor', { cls: c.name, addr: obj.addr });
        if (explicit && explicit.which === 'this') {
          const a = explicit.args.map((x) => this.eval(x));
          this.construct(c, obj, a, explicit.line);
          stmts = stmts.slice(1);
        } else {
          const sup = c.ext;
          const supArgs = explicit ? explicit.args.map((x) => this.eval(x)) : [];
          if (sup && this.cls(sup)) this.construct(this.cls(sup), obj, supArgs, explicit ? explicit.line : line);
          else if (sup && sup in BUILTIN_EXC) {
            const a0 = supArgs[0];
            if (a0 && a0.t === 'String') obj.fields.get('message').value = a0;
            else if (a0 && a0.t === 'ref' && a0.v.kind === 'obj') obj.fields.get('message').value = this.str(this.throwableToString(a0.v));
          } else if (explicit && supArgs.length) {
            throw new CompileError('la classe Object non ha costruttori con parametri', explicit.line, 'الصنف Object لا يملك مُنشئاً بمعاملات');
          }
          if (explicit) stmts = stmts.slice(1);
          for (const fd of c.fields) {
            if (fd.mods.has('static') || !fd.init) continue;
            const fe = obj.fields.get(fd.name);
            fe.value = this.coerce(this.evalInit(fd.init, fd.type, fd.line), fd.type, fd.line);
          }
          for (const b of c.inits) this.execBlock(b.stmts);
        }
        try {
          this.execStmts(stmts);
        } catch (ex) {
          if (!(ex instanceof ReturnSig)) throw ex;
        }
      } finally {
        this.popFrame();
      }
    }

    // ── Istruzioni ──
    execStmts(stmts) { for (const s of stmts) this.exec(s); }
    execBlock(stmts) {
      this.pushScope();
      try { this.execStmts(stmts); } finally { this.popScope(); }
    }
    execScoped(s) {
      if (s.k === 'block') return this.execBlock(s.stmts);
      this.pushScope();
      try { this.exec(s); } finally { this.popScope(); }
    }

    exec(s) {
      this.tick(s.line);
      switch (s.k) {
        case 'empty': return;
        case 'block': return this.execBlock(s.stmts);
        case 'local': return this.execLocal(s);
        case 'expr': {
          if (s.e.k === 'ctorcall') {
            throw new CompileError(`la chiamata a ${s.e.which}(...) deve essere la prima istruzione del costruttore`, s.line, `استدعاء ${s.e.which}(...) يجب أن يكون أول تعليمة داخل المُنشئ`);
          }
          this.lastPrinted = null;
          const v = this.eval(s.e);
          this.recordExpr(s, v);
          return;
        }
        case 'if': {
          const c = this.bool(this.eval(s.cond), s.line);
          this.record(s.line, 'if', { cond: c, hasElse: !!s.els });
          if (c) this.execScoped(s.then);
          else if (s.els) this.execScoped(s.els);
          return;
        }
        case 'while':
          return this.runLoop(s, () => {
            const c = this.bool(this.eval(s.cond), s.line);
            this.record(s.line, 'loop', { cond: c, kw: 'while' });
            return c;
          }, null, false);
        case 'do':
          return this.runLoop(s, () => {
            this.tick(s.condLine);
            const c = this.bool(this.eval(s.cond), s.condLine);
            this.record(s.condLine, 'loop', { cond: c, kw: 'do-while' });
            return c;
          }, null, true);
        case 'for': {
          this.pushScope();
          try {
            for (const i of s.init) this.exec(i);
            this.runLoop(s, () => {
              this.tick(s.line);
              const c = s.cond ? this.bool(this.eval(s.cond), s.line) : true;
              this.record(s.line, 'loop', { cond: c, kw: 'for' });
              return c;
            }, () => {
              this.tick(s.line);
              const parts = [];
              for (const u of s.update) {
                const v = this.eval(u);
                const tgt = u.e || u.target;
                parts.push(tgt ? `${exprStr(tgt)} = ${this.dispVal(this.peekValue(tgt, v)).val}` : exprStr(u));
              }
              if (s.update.length) this.record(s.line, 'update', { text: parts.join(', ') });
            }, false);
          } finally { this.popScope(); }
          return;
        }
        case 'foreach': return this.execForeach(s);
        case 'switch': return this.execSwitch(s);
        case 'return': {
          const v = s.e ? this.eval(s.e) : VOID;
          this.record(s.line, 'return', { v });
          throw new ReturnSig(v, s.line);
        }
        case 'break': this.record(s.line, 'break'); throw new BreakSig(s.label);
        case 'continue': this.record(s.line, 'continue'); throw new ContinueSig(s.label);
        case 'throw': {
          const v = this.eval(s.e);
          if (v.t === 'null') throw this.jthrow('NullPointerException', 'Cannot throw exception because the value is null', s.line);
          if (!(v.t === 'ref' && v.v.kind === 'obj' && this.isThrowable(v.v.cls))) {
            throw new CompileError('throw richiede un oggetto Throwable, ad esempio: throw new IllegalArgumentException("...")', s.line, 'الأمر throw يحتاج إلى كائن استثناء، مثل: throw new IllegalArgumentException("...")');
          }
          this.record(s.line, 'throw', { ex: v.v });
          throw new JavaThrow(v.v, s.line);
        }
        case 'try': return this.execTry(s);
        default: throw new Unsupported('istruzione ' + s.k, s.line);
      }
    }

    peekValue(tgt, v) {
      try {
        if (tgt.k === 'name') { const x = this.findVar(tgt.name); if (x) return x.value; }
      } catch (e) { /* ignora */ }
      return v;
    }

    runLoop(s, cond, update, bodyFirst) {
      if (!bodyFirst && !cond()) return;
      for (;;) {
        try {
          this.execScoped(s.body);
        } catch (ex) {
          if (ex instanceof BreakSig && (!ex.label || ex.label === s.label)) return;
          if (!(ex instanceof ContinueSig && (!ex.label || ex.label === s.label))) throw ex;
        }
        if (update) update();
        if (!cond()) return;
      }
    }

    execForeach(s) {
      const it = this.eval(s.iter);
      if (it.t === 'null') throw this.jthrow('NullPointerException', `Cannot read the array length because "${exprStr(s.iter)}" is null`, s.line);
      let items;
      if (it.t === 'ref' && it.v.kind === 'array') items = it.v.items;
      else if (it.t === 'ref' && it.v.kind === 'list') items = it.v.items.slice();
      else throw new CompileError('il for-each richiede un array o una collezione', s.line, 'حلقة for-each تحتاج إلى مصفوفة أو مجموعة (Collection)');
      for (let i = 0; i < items.length; i++) {
        this.tick(s.line);
        this.pushScope();
        try {
          const v = this.coerce(items[i], s.type, s.line);
          this.declare(s.name, s.type.name === 'var' ? this.inferType(v) : s.type, v, false, s.line);
          this.record(s.line, 'foreach', { name: s.name, v, i, n: items.length });
          try {
            this.execScoped(s.body);
          } catch (ex) {
            if (ex instanceof BreakSig && (!ex.label || ex.label === s.label)) break;
            if (!(ex instanceof ContinueSig && (!ex.label || ex.label === s.label))) throw ex;
          }
        } finally { this.popScope(); }
      }
      this.record(s.line, 'foreach-end');
    }

    execSwitch(s) {
      const v = this.eval(s.disc);
      if (v.t === 'null') throw this.jthrow('NullPointerException', `Cannot invoke "String.hashCode()" because "${exprStr(s.disc)}" is null`, s.line);
      let start = -1;
      for (let i = 0; i < s.cases.length && start < 0; i++) {
        const c = s.cases[i];
        if (!c.labels) continue;
        for (const l of c.labels) {
          const lv = this.eval(l);
          if ((v.t === 'String' && lv.t === 'String' && v.v === lv.v) || (isNum(v) && isNum(lv) && v.v === lv.v)) { start = i; break; }
        }
      }
      if (start < 0) start = s.cases.findIndex((c) => !c.labels);
      this.record(s.line, 'switch', { v, matched: start >= 0 ? s.cases[start] : null });
      if (start < 0) return;
      this.pushScope();
      try {
        for (let i = start; i < s.cases.length; i++) {
          const c = s.cases[i];
          for (const st of c.body) this.exec(st);
          if (c.arrow) break;
        }
      } catch (ex) {
        if (!(ex instanceof BreakSig && !ex.label)) throw ex;
      } finally { this.popScope(); }
    }

    execTry(s) {
      let pending = null;
      for (const c of s.catches) {
        for (const t of c.types) {
          if (!this.isRefTypeKnown(t)) {
            throw new CompileError(`impossibile trovare la classe di eccezione ${t}`, c.line, `لا يمكن العثور على صنف الاستثناء ${t}`);
          }
          if (!this.isThrowable(t)) throw new CompileError(`${t} non è una sottoclasse di Throwable`, c.line, `${t} ليس صنف استثناء (لا يرث من Throwable)`);
        }
      }
      const depth = this.frames.length;
      const scopes = this.top().scopes.length;
      try {
        this.execBlock(s.block.stmts);
      } catch (ex) {
        this.frames.length = depth;
        this.top().scopes.length = scopes;
        if (ex instanceof JavaThrow) {
          const c = s.catches.find((cc) => cc.types.some((t) => this.isSubtype(ex.obj.cls, t)));
          if (c) {
            this.pushScope();
            try {
              this.declare(c.name, { name: ex.obj.cls, dims: 0 }, { t: 'ref', v: ex.obj }, false, c.line);
              this.tick(c.line);
              this.record(c.line, 'catch', { ex: ex.obj });
              this.execStmts(c.body.stmts);
            } catch (ex2) {
              pending = ex2;
            } finally { this.popScope(); }
          } else pending = ex;
        } else pending = ex;
      }
      if (s.fin) {
        if (pending && !(pending instanceof JavaThrow || pending instanceof ReturnSig || pending instanceof BreakSig || pending instanceof ContinueSig)) throw pending;
        this.tick(s.finLine);
        this.record(s.finLine, 'finally', { pending: pending instanceof JavaThrow ? pending.obj : null });
        this.execBlock(s.fin.stmts);
      }
      if (pending) throw pending;
    }

    inferType(v) {
      switch (v.t) {
        case 'int': case 'long': case 'double': case 'boolean': case 'char': return { name: v.t, dims: 0 };
        case 'String': return { name: 'String', dims: 0 };
        case 'ref':
          if (v.v.kind === 'array') return { name: v.v.elem.name, dims: v.v.elem.dims + 1 };
          if (v.v.kind === 'obj') return { name: v.v.cls, dims: 0 };
          if (v.v.kind === 'list') return { name: 'ArrayList', dims: 0 };
          return { name: 'Object', dims: 0 };
        default: return { name: 'Object', dims: 0 };
      }
    }

    execLocal(s) {
      for (const d of s.decls) {
        let val;
        if (d.init) {
          if (d.type.name === 'var' && d.init.k === 'arrinit') throw new CompileError('var non può essere usato con un inizializzatore di array { }', s.line, 'لا يمكن استخدام var مع قائمة قيم مصفوفة { }');
          val = this.evalInit(d.init, d.type, s.line);
          if (d.type.name === 'var' && val.t === 'null') throw new CompileError('var non può essere inizializzata a null', s.line, 'لا يمكن تهيئة متغير var بالقيمة null');
          val = this.coerce(val, d.type, s.line);
        }
        if (!this.isTypeUsable(d.type)) {
          throw new CompileError(`impossibile trovare il simbolo: classe ${d.type.name}`, s.line, `لا يمكن العثور على الصنف ${d.type.name}: تحقق من الاسم أو عرّفه`);
        }
        const type = d.type.name === 'var' ? this.inferType(val) : d.type;
        this.declare(d.name, type, val, s.final, s.line);
        this.record(s.line, 'decl', { name: d.name, type, val, init: d.init });
      }
    }
    isTypeUsable(t) {
      const n = t.name;
      if (PRIMS.has(n) || n === 'String' || n === 'var' || n === 'Object' || WRAP[n] || this.isRefTypeKnown(n)) return true;
      if (/^(List|ArrayList|LinkedList|Collection|Iterable|StringBuilder|StringBuffer|Random|CharSequence|Comparable|Number)$/.test(n)) return true;
      if (UNSUPPORTED_JDK.has(n)) return true;
      if (n.length === 1) return true;
      return false;
    }

    arrayFromInit(init, type, line) {
      if (!type || type.dims < 1) {
        throw new CompileError('inizializzatore di array { } usato per una variabile che non è un array', line, 'استُخدمت قائمة القيم { } لمتغير ليس مصفوفة');
      }
      const elem = { name: type.name, dims: type.dims - 1 };
      const items = init.items.map((it) => (it.k === 'arrinit' ? this.arrayFromInit(it, elem, line) : this.coerce(this.eval(it), elem, line)));
      return { t: 'ref', v: this.alloc({ kind: 'array', elem, items }) };
    }

    makeArray(elemName, dims, sizes, i, line) {
      const n = sizes[i];
      if (n < 0) throw this.jthrow('NegativeArraySizeException', String(n), line);
      if (n > 100000) throw new LimitError('array troppo grande per il simulatore', line);
      const elem = { name: elemName, dims: dims - 1 };
      const items = [];
      for (let j = 0; j < n; j++) {
        items.push(i + 1 < sizes.length ? this.makeArray(elemName, dims - 1, sizes, i + 1, line) : defaultVal(elem));
      }
      return { t: 'ref', v: this.alloc({ kind: 'array', elem, items }) };
    }

    // ── Espressioni ──
    eval(e) {
      this.tick(e.line);
      switch (e.k) {
        case 'lit':
          switch (e.type) {
            case 'int': return mk.int(e.value);
            case 'long': return mk.long(e.value);
            case 'double': case 'float': return mk.double(e.value);
            case 'boolean': return mk.bool(e.value);
            case 'char': return mk.char(e.value);
            case 'String': return this.str(e.value, true);
            default: return NULL;
          }
        case 'name': return this.readName(e.name, e.line);
        case 'this':
          if (!this.top().self) throw new CompileError('non si può usare this in un contesto statico (es. dentro main)', e.line, 'لا يمكن استخدام this داخل دالة static مثل main لأنه لا يوجد كائن حالي');
          return { t: 'ref', v: this.top().self };
        case 'field': return this.getField(e);
        case 'superfield': {
          const self = this.top().self;
          if (!self) throw new CompileError('non si può usare super in un contesto statico', e.line, 'لا يمكن استخدام super داخل دالة static');
          const f = self.fields.get(e.name);
          if (!f) throw this.notFound(e.name, e.line);
          this.checkAccess(f, e.name, e.line);
          return f.value;
        }
        case 'index': {
          const a = this.eval(e.arr);
          const i = this.eval(e.idx);
          if (a.t === 'null') throw this.jthrow('NullPointerException', `Cannot load from array because "${exprStr(e.arr)}" is null`, e.line);
          if (!(a.t === 'ref' && a.v.kind === 'array')) {
            throw new CompileError(`è richiesto un array ma è stato trovato ${this.typeOfVal(a)}`, e.line, `كان متوقعاً مصفوفة لكن وُجد ${this.typeOfVal(a)}${a.t === 'String' ? '؛ للوصول إلى حرف في String استخدم charAt(i)' : ''}`);
          }
          const idx = this.intOf(i, e.line);
          if (idx < 0 || idx >= a.v.items.length) throw this.jthrow('ArrayIndexOutOfBoundsException', `Index ${idx} out of bounds for length ${a.v.items.length}`, e.line);
          return a.v.items[idx];
        }
        case 'call': return this.evalCall(e);
        case 'supercall': return this.evalSuperCall(e);
        case 'new': {
          const args = e.args.map((a) => this.eval(a));
          return this.newObject(e.cls, args, e.line);
        }
        case 'newarray': {
          if (e.init) return this.arrayFromInit(e.init, { name: e.elem, dims: e.dims }, e.line);
          const sizes = e.sizes.map((x) => this.intOf(this.eval(x), e.line));
          return this.makeArray(e.elem, e.dims, sizes, 0, e.line);
        }
        case 'arrinit': throw new CompileError('inizializzatore di array { } non consentito qui: usa new tipo[]{...}', e.line, 'لا يُسمح بقائمة القيم { } هنا؛ استخدم new type[]{...}');
        case 'assign': return this.evalAssign(e);
        case 'preinc': case 'postinc': {
          const lv = this.lvalue(e.e);
          const cur = lv.get();
          if (!isNum(cur)) throw new CompileError(`l'operatore ${e.op} non è applicabile al tipo ${this.typeOfVal(cur)}`, e.line, `المعامل ${e.op} لا يُطبّق على النوع ${this.typeOfVal(cur)}`);
          const d = e.op === '++' ? 1 : -1;
          const nv = cur.t === 'double' ? mk.double(cur.v + d) : cur.t === 'long' ? mk.long(cur.v + d) : cur.t === 'char' ? mk.char(cur.v + d) : mk.int(cur.v + d);
          lv.set(nv);
          return e.k === 'preinc' ? nv : cur;
        }
        case 'unary': {
          const v = this.eval(e.e);
          switch (e.op) {
            case '!': return mk.bool(!this.bool(v, e.line));
            case '-':
              if (!isNum(v)) break;
              return v.t === 'double' ? mk.double(-v.v) : v.t === 'long' ? mk.long(-v.v) : mk.int(-v.v);
            case '+':
              if (!isNum(v)) break;
              return v.t === 'char' ? mk.int(v.v) : v;
            case '~':
              if (v.t !== 'int' && v.t !== 'long' && v.t !== 'char') break;
              return v.t === 'long' ? mk.long(-v.v - 1) : mk.int(~v.v);
            default: break;
          }
          throw new CompileError(`l'operatore ${e.op} non è applicabile al tipo ${this.typeOfVal(v)}`, e.line, `المعامل ${e.op} لا يُطبّق على النوع ${this.typeOfVal(v)}`);
        }
        case 'bin': return this.evalBin(e);
        case 'cond': return this.bool(this.eval(e.c), e.line) ? this.eval(e.a) : this.eval(e.b);
        case 'cast': return this.evalCast(e);
        case 'instanceof': {
          const v = this.eval(e.e);
          let r = false;
          if (v.t === 'ref' && v.v.kind === 'obj') r = this.isSubtype(v.v.cls, e.type.name);
          else if (v.t === 'String') r = ['String', 'Object', 'CharSequence', 'Comparable'].includes(e.type.name);
          else if (v.t === 'ref' && v.v.kind === 'list') r = this.isSubtype('ArrayList', e.type.name);
          else if (v.t === 'ref' && v.v.kind === 'array') r = e.type.dims > 0 || e.type.name === 'Object';
          else if (isPrimVal(v)) throw new CompileError('instanceof non si applica ai tipi primitivi', e.line, 'لا يمكن استخدام instanceof مع الأنواع البدائية');
          if (r && e.bind) {
            const f = this.top();
            f.scopes[f.scopes.length - 1].set(e.bind, { type: e.type, value: v, final: false, assigned: true });
          }
          return mk.bool(r);
        }
        case 'ctorcall':
          throw new CompileError(`la chiamata a ${e.which}(...) deve essere la prima istruzione del costruttore`, e.line, `استدعاء ${e.which}(...) يجب أن يكون أول تعليمة في المُنشئ`);
        default:
          throw new Unsupported('espressione ' + e.k, e.line);
      }
    }

    evalAssign(e) {
      const lv = this.lvalue(e.target);
      let val;
      if (e.op === '=') {
        val = e.value.k === 'arrinit' ? this.arrayFromInit(e.value, lv.type, e.line) : this.eval(e.value);
      } else {
        const cur = lv.get();
        const rhs = this.eval(e.value);
        const r = this.binop(e.op.slice(0, -1), cur, rhs, e.line);
        val = cur.t === 'String' || !isNum(r) ? r : this.castPrim(r, cur.t);
      }
      return lv.set(val);
    }

    evalBin(e) {
      const op = e.op;
      if (op === '&&') {
        if (!this.bool(this.eval(e.l), e.line)) return mk.bool(false);
        return mk.bool(this.bool(this.eval(e.r), e.line));
      }
      if (op === '||') {
        if (this.bool(this.eval(e.l), e.line)) return mk.bool(true);
        return mk.bool(this.bool(this.eval(e.r), e.line));
      }
      const a = this.eval(e.l);
      const b = this.eval(e.r);
      return this.binop(op, a, b, e.line);
    }

    binop(op, a, b, line) {
      if (a.t === 'void' || b.t === 'void') this.toStr(VOID);
      if (op === '+' && (a.t === 'String' || b.t === 'String')) return this.str(this.toStr(a) + this.toStr(b));
      if (op === '==' || op === '!=') {
        const eq = this.refEq(a, b, line);
        return mk.bool(op === '==' ? eq : !eq);
      }
      if (a.t === 'boolean' && b.t === 'boolean' && (op === '&' || op === '|' || op === '^')) {
        return mk.bool(op === '&' ? a.v && b.v : op === '|' ? a.v || b.v : a.v !== b.v);
      }
      if (!isNum(a) || !isNum(b)) {
        throw new CompileError(`operatore ${op} non applicabile ai tipi ${this.typeOfVal(a)} e ${this.typeOfVal(b)}`, line,
          `لا يمكن تطبيق المعامل ${op} على النوعين ${this.typeOfVal(a)} و ${this.typeOfVal(b)}`);
      }
      const k = a.t === 'double' || b.t === 'double' ? 'double' : a.t === 'long' || b.t === 'long' ? 'long' : 'int';
      const x = a.v, y = b.v;
      const num = (r) => (k === 'double' ? mk.double(r) : k === 'long' ? mk.long(r) : mk.int(r));
      switch (op) {
        case '<': return mk.bool(x < y);
        case '>': return mk.bool(x > y);
        case '<=': return mk.bool(x <= y);
        case '>=': return mk.bool(x >= y);
        case '+': return num(x + y);
        case '-': return num(x - y);
        case '*': return k === 'int' ? mk.int(Math.imul(x, y)) : num(x * y);
        case '/':
          if (k !== 'double' && y === 0) throw this.jthrow('ArithmeticException', '/ by zero', line);
          return k === 'double' ? mk.double(x / y) : num(Math.trunc(x / y));
        case '%':
          if (k !== 'double' && y === 0) throw this.jthrow('ArithmeticException', '/ by zero', line);
          return num(x % y);
        default: break;
      }
      if (k === 'double') {
        throw new CompileError(`operatore ${op} non applicabile ai tipi double`, line, `لا يمكن تطبيق المعامل ${op} على الأعداد العشرية`);
      }
      switch (op) {
        case '&': return num(x & y);
        case '|': return num(x | y);
        case '^': return num(x ^ y);
        case '<<': return mk.int(x << y);
        case '>>': return mk.int(x >> y);
        case '>>>': return mk.int(x >>> y);
        default: throw new Unsupported('operatore ' + op, line);
      }
    }

    refEq(a, b, line) {
      if (isNum(a) && isNum(b)) return a.v === b.v;
      if (a.t === 'boolean' && b.t === 'boolean') return a.v === b.v;
      if (a.t === 'null' || b.t === 'null') {
        if (isPrimVal(a) || isPrimVal(b)) {
          throw new CompileError('tipi non confrontabili: un primitivo non può essere null', line, 'لا يمكن مقارنة نوع بدائي بالقيمة null');
        }
        return a.t === b.t;
      }
      if (a.t === 'String' && b.t === 'String') return a.id === b.id;
      if (a.t === 'ref' && b.t === 'ref') return a.v === b.v;
      throw new CompileError(`tipi non confrontabili: ${this.typeOfVal(a)} e ${this.typeOfVal(b)}`, line, `لا يمكن مقارنة النوعين ${this.typeOfVal(a)} و ${this.typeOfVal(b)}`);
    }

    evalCast(e) {
      const v = this.eval(e.e);
      const k = kindOf(e.type);
      const bad = () => {
        throw new CompileError(`tipi incompatibili: ${this.typeOfVal(v)} non può essere convertito in ${typeStr(e.type)}`, e.line,
          `لا يمكن تحويل ${this.typeOfVal(v)} إلى ${typeStr(e.type)}`);
      };
      switch (k) {
        case 'int': {
          if (!isNum(v)) bad();
          let r = v.t === 'double' ? this.d2i(v.v) : v.v | 0;
          if (e.type.name === 'byte') r = (r << 24) >> 24;
          if (e.type.name === 'short') r = (r << 16) >> 16;
          return mk.int(r);
        }
        case 'long': if (!isNum(v)) bad(); return mk.long(v.v);
        case 'double': if (!isNum(v)) bad(); return mk.double(e.type.name === 'float' ? Math.fround(v.v) : v.v);
        case 'char': if (!isNum(v)) bad(); return mk.char(Math.trunc(v.v));
        case 'boolean': if (v.t !== 'boolean') bad(); return v;
        case 'String':
          if (v.t === 'String' || v.t === 'null') return v;
          if (v.t === 'ref') throw this.jthrow('ClassCastException', `class ${this.typeOfVal(v)} cannot be cast to class java.lang.String`, e.line);
          return bad();
        default: break;
      }
      if (k.startsWith('w:')) return this.coerce(v, e.type, e.line);
      if (v.t === 'null') return v;
      if (v.t === 'ref' && v.v.kind === 'obj' && this.isRefTypeKnown(e.type.name) && e.type.dims === 0) {
        if (!this.isSubtype(v.v.cls, e.type.name)) {
          throw this.jthrow('ClassCastException', `class ${this.qualName(v.v.cls)} cannot be cast to class ${this.qualName(e.type.name)}`, e.line);
        }
      }
      if (isPrimVal(v) && this.isRefTypeKnown(e.type.name)) bad();
      return v;
    }

    getField(e) {
      const tv = this.eval(e.target);
      const name = e.name;
      const line = e.line;
      switch (tv.t) {
        case 'null': throw this.jthrow('NullPointerException', `Cannot read field "${name}" because "${exprStr(e.target)}" is null`, line);
        case 'class': return this.staticField(tv.v, name, line);
        case 'ref': {
          const o = tv.v;
          if (o.kind === 'array') {
            if (name === 'length') return mk.int(o.items.length);
            break;
          }
          if (o.kind === 'obj') {
            const f = o.fields.get(name);
            if (f && f.decl !== 'Throwable') { this.checkAccess(f, name, line); return f.value; }
            const sf = this.findStatic(o.cls, name);
            if (sf) return sf.value;
          }
          break;
        }
        case 'String':
          if (name === 'length') throw new CompileError('per le String length() è un metodo: scrivi s.length() con le parentesi', line, 'في String تكون length() دالة: اكتب s.length() مع الأقواس (أما في المصفوفات فهي length بدون أقواس)');
          break;
        default: break;
      }
      if ((tv.t === 'ref' && tv.v.kind === 'list') && (name === 'length' || name === 'size')) {
        throw new CompileError('per ArrayList usa il metodo size()', line, 'مع ArrayList استخدم الدالة size()');
      }
      throw new CompileError(`campo non trovato: ${name}`, line, `الحقل ${name} غير موجود`);
    }

    staticField(cls, name, line) {
      const c = this.cls(cls);
      if (c) {
        const sf = this.findStatic(cls, name);
        if (sf) {
          if (sf.access === 'private' && sf.decl !== this.curClassName()) {
            throw new CompileError(`${name} ha accesso private in ${sf.decl}`, line, `الحقل ${name} خاص (private) في الصنف ${sf.decl}`);
          }
          return sf.value;
        }
        if (this.instanceFieldDeclared(cls, name)) throw this.staticCtx(name, line);
        throw this.notFound(cls + '.' + name, line);
      }
      const table = {
        Math: { PI: mk.double(Math.PI), E: mk.double(Math.E) },
        Integer: { MAX_VALUE: mk.int(2147483647), MIN_VALUE: mk.int(-2147483648) },
        Long: { MAX_VALUE: mk.long(Number.MAX_SAFE_INTEGER), MIN_VALUE: mk.long(Number.MIN_SAFE_INTEGER) },
        Double: { MAX_VALUE: mk.double(Number.MAX_VALUE), MIN_VALUE: mk.double(Number.MIN_VALUE), POSITIVE_INFINITY: mk.double(Infinity), NEGATIVE_INFINITY: mk.double(-Infinity), NaN: mk.double(NaN) },
        Character: { MAX_VALUE: mk.char(0xffff), MIN_VALUE: mk.char(0) },
        Boolean: { TRUE: mk.bool(true), FALSE: mk.bool(false) },
        System: { out: { t: 'stream', v: 'out' }, err: { t: 'stream', v: 'err' } },
      };
      if (cls === 'System' && name === 'in') throw new Unsupported('System.in (input da tastiera)', line);
      if (table[cls] && name in table[cls]) return table[cls][name];
      throw this.notFound(cls + '.' + name, line);
    }

    staticTypeName(e) {
      if (!e) return null;
      if (e.k === 'name') {
        const v = this.findVar(e.name);
        if (v) return typeStr(v.type);
        const f = this.top();
        if (f.self) { const fld = f.self.fields.get(e.name); if (fld) return typeStr(fld.type); }
      }
      if (e.k === 'field' && e.target.k === 'this') {
        const f = this.top();
        if (f.self) { const fld = f.self.fields.get(e.name); if (fld) return typeStr(fld.type); }
      }
      return null;
    }

    evalCall(e) {
      const line = e.line;
      if (!e.target) return this.callUnqualified(e);
      const tv = this.eval(e.target);
      const args = e.args.map((a) => this.eval(a));
      // Il tipo statico decide quali metodi si possono invocare (polimorfismo).
      if (e.target.k === 'name' && tv.t === 'ref' && tv.v.kind === 'obj') {
        const st = this.staticTypeName(e.target);
        if (st && this.cls(st) && !this.chain(st).some((c) => c.methods.some((m) => m.name === e.name)) &&
          !['toString', 'equals', 'hashCode', 'getClass', 'getMessage', 'printStackTrace'].includes(e.name)) {
          throw new CompileError(`metodo ${e.name}() non trovato nel tipo ${st} (tipo statico del riferimento ${e.target.name})`, line,
            `الدالة ${e.name}() غير موجودة في النوع ${st}: المُترجم ينظر إلى النوع المُصرَّح به للمرجع (النوع الساكن) وليس إلى نوع الكائن الفعلي؛ استخدم تحويلاً (cast) إن لزم`);
        }
      }
      return this.callOn(tv, e.name, args, e, line);
    }

    callUnqualified(e) {
      const f = this.top();
      const args = e.args.map((a) => this.eval(a));
      const line = e.line;
      if (f.self) {
        const m = this.findMethod(f.self.cls, e.name, args);
        if (m) return this.invoke(m, m.mods.has('static') ? null : f.self, args, line);
      }
      const lex = f.cls ? f.cls.name : null;
      const m = lex ? this.findMethod(lex, e.name, args) : null;
      if (!m && f.self && ['getClass', 'toString', 'hashCode', 'equals', 'getMessage', 'printStackTrace'].includes(e.name)) {
        return this.callObj(f.self, e.name, args, line);
      }
      if (m) {
        if (!m.mods.has('static') && !f.self) {
          throw new CompileError(`il metodo non statico ${e.name}() non può essere chiamato da un contesto statico`, line,
            `لا يمكن استدعاء الدالة غير الساكنة ${e.name}() من داخل دالة static مثل main: أنشئ كائناً واستدعها عليه، أو صرّح عنها كـ static`);
        }
        return this.invoke(m, f.self, args, line);
      }
      throw this.noMatch(lex, e.name, args, line);
    }

    evalSuperCall(e) {
      const f = this.top();
      if (!f.self) throw new CompileError('non si può usare super in un contesto statico', e.line, 'لا يمكن استخدام super داخل دالة static');
      const args = e.args.map((a) => this.eval(a));
      const sup = f.cls ? this.superOf(f.cls.name) : null;
      const m = sup && this.cls(sup) ? this.findMethod(sup, e.name, args) : null;
      if (m) return this.invoke(m, f.self, args, e.line);
      switch (e.name) {
        case 'toString': return this.str(this.defaultToString(f.self));
        case 'equals': return mk.bool(args[0] && args[0].t === 'ref' && args[0].v === f.self);
        case 'hashCode': return mk.int(parseInt(this.hashHex(f.self), 16));
        case 'getMessage': if (this.isThrowable(f.self.cls)) return f.self.fields.get('message').value; break;
        default: break;
      }
      throw this.noMatch(sup, e.name, args, e.line);
    }

    callOn(tv, name, args, e, line) {
      switch (tv.t) {
        case 'null': {
          const st = this.staticTypeName(e.target) || 'Object';
          throw this.jthrow('NullPointerException', `Cannot invoke "${st}.${name}()" because "${exprStr(e.target)}" is null`, line);
        }
        case 'class': return this.callStatic(tv.v, name, args, line);
        case 'stream': return this.callStream(tv.v, name, args, line);
        case 'String': return this.callString(tv, name, args, line);
        case 'ref': {
          const o = tv.v;
          switch (o.kind) {
            case 'obj': return this.callObj(o, name, args, line);
            case 'list': return this.callList(o, name, args, line);
            case 'sb': return this.callSb(tv, name, args, line);
            case 'random': return this.callRandom(o, name, args, line);
            case 'classobj':
              if (name === 'getSimpleName' || name === 'getName') return this.str(o.name);
              break;
            case 'array':
              if (name === 'length') throw new CompileError('per gli array length è un campo, non un metodo: scrivi arr.length senza parentesi', line, 'في المصفوفات length حقل وليس دالة: اكتب arr.length بدون أقواس');
              if (name === 'clone') return { t: 'ref', v: this.alloc({ kind: 'array', elem: o.elem, items: o.items.slice() }) };
              if (name === 'equals') return mk.bool(args[0].t === 'ref' && args[0].v === o);
              break;
            default: break;
          }
          break;
        }
        default:
          if (isPrimVal(tv)) {
            throw new CompileError(`${tv.t} è un tipo primitivo: non si possono invocare metodi su di esso`, line, `${tv.t} نوع بدائي: لا يمكن استدعاء دوال عليه مباشرة`);
          }
      }
      throw this.noMatch(this.typeOfVal(tv), name, args, line);
    }

    callObj(o, name, args, line) {
      const m = this.findMethod(o.cls, name, args);
      if (m) {
        if (m.mods.has('private') && m.cls !== this.curClassName()) {
          throw new CompileError(`${name}() ha accesso private in ${m.cls}`, line, `الدالة ${name}() خاصة (private) في الصنف ${m.cls} ولا يمكن استدعاؤها من خارجه`);
        }
        return this.invoke(m, m.mods.has('static') ? null : o, args, line);
      }
      switch (name) {
        case 'toString': if (!args.length) return this.str(this.objToString(o)); break;
        case 'equals': if (args.length === 1) return mk.bool(args[0].t === 'ref' && args[0].v === o); break;
        case 'hashCode': if (!args.length) return mk.int(parseInt(this.hashHex(o), 16)); break;
        case 'getClass': if (!args.length) return { t: 'ref', v: { kind: 'classobj', name: o.cls, addr: '' } }; break;
        default: break;
      }
      if (this.isThrowable(o.cls)) {
        switch (name) {
          case 'getMessage': case 'getLocalizedMessage': return o.fields.get('message').value;
          case 'printStackTrace': this.emit(this.stackTraceText(o), true); this.lastPrinted = this.throwableToString(o); return VOID;
          case 'getCause': return NULL;
          default: break;
        }
      }
      throw this.noMatch(o.cls, name, args, line);
    }

    callStream(which, name, args, line) {
      const err = which === 'err';
      switch (name) {
        case 'println':
        case 'print': {
          if (args.length > 1) throw this.noMatch('PrintStream', name, args, line);
          if (name === 'print' && !args.length) throw this.noMatch('PrintStream', name, args, line);
          let s = '';
          if (args.length) {
            const a = args[0];
            if (a.t === 'ref' && a.v.kind === 'array' && a.v.elem.name === 'char' && a.v.elem.dims === 0) s = a.v.items.map((c) => String.fromCharCode(c.v)).join('');
            else s = this.toStr(a);
          }
          this.lastPrinted = s;
          this.emit(s + (name === 'println' ? '\n' : ''), err);
          return VOID;
        }
        case 'printf': case 'format': {
          if (!args.length || args[0].t !== 'String') throw this.noMatch('PrintStream', name, args, line);
          const s = this.format(args[0].v, args.slice(1), line);
          this.lastPrinted = s;
          this.emit(s, err);
          return VOID;
        }
        case 'flush': return VOID;
        default: throw this.noMatch('PrintStream', name, args, line);
      }
    }

    format(fmt, args, line) {
      try {
        return formatJava(fmt, args, (v) => this.toStr(v));
      } catch (ex) {
        if (ex instanceof JavaThrow || ex instanceof CompileError) throw ex;
        throw this.jthrow(/Missing/.test(ex.message) ? 'IllegalArgumentException' : 'IllegalArgumentException', ex.message, line);
      }
    }

    callString(sv, name, args, line) {
      const s = sv.v;
      const A = (i) => args[i];
      const need = (n) => { if (args.length !== n) throw this.noMatch('String', name, args, line); };
      const sioobe = (msg) => this.jthrow('StringIndexOutOfBoundsException', msg, line);
      const strArg = (a) => (a.t === 'char' ? String.fromCharCode(a.v) : a.t === 'String' ? a.v : this.toStr(a));
      switch (name) {
        case 'length': need(0); return mk.int(s.length);
        case 'charAt': {
          need(1);
          const i = this.intOf(A(0), line);
          if (i < 0 || i >= s.length) throw sioobe(`Index ${i} out of bounds for length ${s.length}`);
          return mk.char(s.charCodeAt(i));
        }
        case 'isEmpty': need(0); return mk.bool(s.length === 0);
        case 'isBlank': need(0); return mk.bool(s.trim().length === 0);
        case 'equals': need(1); return mk.bool(A(0).t === 'String' && A(0).v === s);
        case 'equalsIgnoreCase': need(1); return mk.bool(A(0).t === 'String' && A(0).v.toLowerCase() === s.toLowerCase());
        case 'compareTo': case 'compareToIgnoreCase': {
          need(1);
          if (A(0).t === 'null') throw this.jthrow('NullPointerException', null, line);
          let x = s, y = A(0).v;
          if (name === 'compareToIgnoreCase') { x = x.toLowerCase(); y = y.toLowerCase(); }
          const n = Math.min(x.length, y.length);
          for (let i = 0; i < n; i++) if (x[i] !== y[i]) return mk.int(x.charCodeAt(i) - y.charCodeAt(i));
          return mk.int(x.length - y.length);
        }
        case 'toUpperCase': need(0); return this.str(s.toUpperCase());
        case 'toLowerCase': need(0); return this.str(s.toLowerCase());
        case 'trim': case 'strip': need(0); return this.str(s.trim());
        case 'substring': {
          const b = this.intOf(A(0), line);
          const en = args.length > 1 ? this.intOf(A(1), line) : s.length;
          if (b < 0 || en > s.length || b > en) throw sioobe(`begin ${b}, end ${en}, length ${s.length}`);
          return this.str(s.substring(b, en));
        }
        case 'indexOf': return mk.int(s.indexOf(strArg(A(0)), args[1] ? args[1].v : 0));
        case 'lastIndexOf': return mk.int(s.lastIndexOf(strArg(A(0))));
        case 'contains': need(1); return mk.bool(s.includes(strArg(A(0))));
        case 'startsWith': return mk.bool(s.startsWith(strArg(A(0))));
        case 'endsWith': need(1); return mk.bool(s.endsWith(strArg(A(0))));
        case 'replace': need(2); return this.str(s.split(strArg(A(0))).join(strArg(A(1))));
        case 'replaceAll': need(2); return this.str(s.replace(new RegExp(A(0).v, 'g'), A(1).v.replace(/\$(\d)/g, '$$$1')));
        case 'concat': need(1); return this.str(s + A(0).v);
        case 'repeat': need(1); return this.str(s.repeat(Math.max(0, A(0).v)));
        case 'split': {
          let parts = s.split(new RegExp(A(0).v));
          while (parts.length > 1 && parts[parts.length - 1] === '') parts.pop();
          if (s === '') parts = [''];
          return { t: 'ref', v: this.alloc({ kind: 'array', elem: { name: 'String', dims: 0 }, items: parts.map((p) => this.str(p)) }) };
        }
        case 'toCharArray':
          need(0);
          return { t: 'ref', v: this.alloc({ kind: 'array', elem: { name: 'char', dims: 0 }, items: [...s].map((c) => mk.char(c.charCodeAt(0))) }) };
        case 'hashCode': need(0); return mk.int(javaStringHash(s));
        case 'matches': need(1); return mk.bool(new RegExp('^(?:' + A(0).v + ')$').test(s));
        case 'intern': need(0); return this.str(s, true);
        case 'toString': need(0); return sv;
        case 'chars': throw new Unsupported('stream di caratteri', line);
        default: throw this.noMatch('String', name, args, line);
      }
    }

    callList(o, name, args, line) {
      const n = o.items.length;
      const ioobe = (i) => this.jthrow('IndexOutOfBoundsException', `Index ${i} out of bounds for length ${n}`, line);
      const immut = () => { if (o.immutable) throw this.jthrow('UnsupportedOperationException', null, line); };
      switch (name) {
        case 'add':
          immut();
          if (args.length === 1) { o.items.push(args[0]); return mk.bool(true); }
          if (args.length === 2) {
            const i = this.intOf(args[0], line);
            if (i < 0 || i > n) throw ioobe(i);
            o.items.splice(i, 0, args[1]);
            return VOID;
          }
          break;
        case 'get': {
          const i = this.intOf(args[0], line);
          if (i < 0 || i >= n) throw ioobe(i);
          return o.items[i];
        }
        case 'set': {
          immut();
          const i = this.intOf(args[0], line);
          if (i < 0 || i >= n) throw ioobe(i);
          const old = o.items[i];
          o.items[i] = args[1];
          return old;
        }
        case 'size': return mk.int(n);
        case 'isEmpty': return mk.bool(n === 0);
        case 'clear': immut(); o.items.length = 0; return VOID;
        case 'contains': return mk.bool(o.items.some((x) => this.javaEquals(x, args[0])));
        case 'indexOf': return mk.int(o.items.findIndex((x) => this.javaEquals(x, args[0])));
        case 'remove': {
          immut();
          if (args[0].t === 'int') {
            const i = args[0].v;
            if (i < 0 || i >= n) throw ioobe(i);
            return o.items.splice(i, 1)[0];
          }
          const i = o.items.findIndex((x) => this.javaEquals(x, args[0]));
          if (i >= 0) o.items.splice(i, 1);
          return mk.bool(i >= 0);
        }
        case 'toString': return this.str(this.objToString(o));
        case 'equals': return mk.bool(args[0].t === 'ref' && args[0].v.kind === 'list' && args[0].v.items.length === n && o.items.every((x, i) => this.javaEquals(x, args[0].v.items[i])));
        case 'forEach': case 'stream': case 'iterator': case 'sort': throw new Unsupported(`ArrayList.${name}()`, line);
        default: break;
      }
      throw this.noMatch('ArrayList', name, args, line);
    }

    callSb(tv, name, args, line) {
      const o = tv.v;
      switch (name) {
        case 'append': o.s += this.toStr(args[0]); return tv;
        case 'toString': return this.str(o.s);
        case 'length': return mk.int(o.s.length);
        case 'reverse': o.s = [...o.s].reverse().join(''); return tv;
        case 'insert': o.s = o.s.slice(0, args[0].v) + this.toStr(args[1]) + o.s.slice(args[0].v); return tv;
        case 'charAt': return mk.char(o.s.charCodeAt(args[0].v));
        case 'deleteCharAt': o.s = o.s.slice(0, args[0].v) + o.s.slice(args[0].v + 1); return tv;
        case 'setLength': o.s = o.s.slice(0, args[0].v); return VOID;
        default: throw this.noMatch('StringBuilder', name, args, line);
      }
    }

    callRandom(o, name, args, line) {
      o.seed = (o.seed * 1103515245 + 12345) % 2147483648;
      const r = o.seed / 2147483648;
      switch (name) {
        case 'nextInt':
          if (args.length) {
            const b = this.intOf(args[0], line);
            if (b <= 0) throw this.jthrow('IllegalArgumentException', 'bound must be positive', line);
            return mk.int(Math.floor(r * b));
          }
          return mk.int(Math.floor(r * 4294967296) - 2147483648);
        case 'nextDouble': return mk.double(r);
        case 'nextBoolean': return mk.bool(r < 0.5);
        default: throw this.noMatch('Random', name, args, line);
      }
    }

    callStatic(cls, name, args, line) {
      const c = this.cls(cls);
      if (c) {
        const m = this.findMethod(cls, name, args);
        if (!m) throw this.noMatch(cls, name, args, line);
        if (!m.mods.has('static')) {
          throw new CompileError(`il metodo non statico ${name}() non può essere referenziato da un contesto statico (${cls}.${name})`, line,
            `لا يمكن استدعاء الدالة غير الساكنة ${name}() عبر اسم الصنف ${cls}: يجب استدعاؤها على كائن`);
        }
        if (m.mods.has('private') && m.cls !== this.curClassName()) {
          throw new CompileError(`${name}() ha accesso private in ${m.cls}`, line, `الدالة ${name}() خاصة (private)`);
        }
        return this.invoke(m, null, args, line);
      }
      const num = (i) => {
        const a = args[i];
        if (!a || !isNum(a)) throw this.noMatch(cls, name, args, line);
        return a.v;
      };
      const widest = () => (args.some((a) => a.t === 'double') ? 'double' : args.some((a) => a.t === 'long') ? 'long' : 'int');
      const wrapNum = (k, v) => (k === 'double' ? mk.double(v) : k === 'long' ? mk.long(v) : mk.int(v));
      const parseIntJ = (s, radix) => {
        if (s.t === 'null') throw this.jthrow('NumberFormatException', 'Cannot parse null string: null', line);
        const str = s.v;
        const re = radix === 16 ? /^[+-]?[0-9a-fA-F]+$/ : radix === 2 ? /^[+-]?[01]+$/ : /^[+-]?\d+$/;
        if (!re.test(str)) throw this.jthrow('NumberFormatException', `For input string: "${str}"${radix && radix !== 10 ? ` under radix ${radix}` : ''}`, line);
        const v = parseInt(str, radix || 10);
        if (v > 2147483647 || v < -2147483648) throw this.jthrow('NumberFormatException', `For input string: "${str}"`, line);
        return v;
      };
      switch (cls) {
        case 'Math':
          switch (name) {
            case 'abs': { const k = widest(); return wrapNum(k, Math.abs(num(0))); }
            case 'max': { const k = widest(); return wrapNum(k, Math.max(num(0), num(1))); }
            case 'min': { const k = widest(); return wrapNum(k, Math.min(num(0), num(1))); }
            case 'pow': return mk.double(Math.pow(num(0), num(1)));
            case 'sqrt': return mk.double(Math.sqrt(num(0)));
            case 'cbrt': return mk.double(Math.cbrt(num(0)));
            case 'floor': return mk.double(Math.floor(num(0)));
            case 'ceil': return mk.double(Math.ceil(num(0)));
            case 'round': return args[0].t === 'double' ? mk.long(Math.floor(num(0) + 0.5)) : mk.int(Math.floor(num(0) + 0.5));
            case 'random': return mk.double(Math.random());
            case 'hypot': return mk.double(Math.hypot(num(0), num(1)));
            case 'log': return mk.double(Math.log(num(0)));
            case 'log10': return mk.double(Math.log10(num(0)));
            case 'exp': return mk.double(Math.exp(num(0)));
            case 'sin': return mk.double(Math.sin(num(0)));
            case 'cos': return mk.double(Math.cos(num(0)));
            case 'tan': return mk.double(Math.tan(num(0)));
            case 'toRadians': return mk.double(num(0) * Math.PI / 180);
            case 'toDegrees': return mk.double(num(0) * 180 / Math.PI);
            case 'signum': return mk.double(Math.sign(num(0)));
            case 'floorDiv': if (num(1) === 0) throw this.jthrow('ArithmeticException', '/ by zero', line); return mk.int(Math.floor(num(0) / num(1)));
            case 'floorMod': if (num(1) === 0) throw this.jthrow('ArithmeticException', '/ by zero', line); return mk.int(((num(0) % num(1)) + num(1)) % num(1));
            default: break;
          }
          break;
        case 'Integer': case 'Short': case 'Byte':
          switch (name) {
            case 'parseInt': case 'valueOf':
              if (args[0] && (args[0].t === 'String' || args[0].t === 'null')) return mk.int(parseIntJ(args[0], args[1] ? args[1].v : 10));
              if (args[0] && args[0].t === 'int') return args[0];
              break;
            case 'toString': return this.str(args.length > 1 ? (num(0)).toString(num(1)) : String(num(0)));
            case 'max': return mk.int(Math.max(num(0), num(1)));
            case 'min': return mk.int(Math.min(num(0), num(1)));
            case 'sum': return mk.int(num(0) + num(1));
            case 'compare': return mk.int(Math.sign(num(0) - num(1)));
            case 'toBinaryString': return this.str((num(0) >>> 0).toString(2));
            case 'toHexString': return this.str((num(0) >>> 0).toString(16));
            default: break;
          }
          break;
        case 'Double': case 'Float':
          switch (name) {
            case 'parseDouble': case 'parseFloat': case 'valueOf': {
              if (args[0] && args[0].t === 'String') {
                const t = args[0].v.trim();
                if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?[dDfF]?$/.test(t) && !/^[+-]?(NaN|Infinity)$/.test(t)) {
                  throw this.jthrow('NumberFormatException', t === '' ? 'empty String' : `For input string: "${args[0].v}"`, line);
                }
                return mk.double(parseFloat(t));
              }
              if (args[0] && isNum(args[0])) return mk.double(args[0].v);
              break;
            }
            case 'toString': return this.str(javaDouble(num(0)));
            case 'compare': return mk.int(Math.sign(num(0) - num(1)));
            case 'isNaN': return mk.bool(Number.isNaN(num(0)));
            case 'max': return mk.double(Math.max(num(0), num(1)));
            case 'min': return mk.double(Math.min(num(0), num(1)));
            default: break;
          }
          break;
        case 'Long':
          if (name === 'parseLong' || name === 'valueOf') {
            if (args[0].t === 'String') {
              if (!/^[+-]?\d+$/.test(args[0].v)) throw this.jthrow('NumberFormatException', `For input string: "${args[0].v}"`, line);
              return mk.long(parseInt(args[0].v, 10));
            }
            return mk.long(num(0));
          }
          if (name === 'toString') return this.str(String(num(0)));
          break;
        case 'Boolean':
          if (name === 'parseBoolean' || name === 'valueOf') return mk.bool(args[0].t === 'String' ? args[0].v.toLowerCase() === 'true' : args[0].v);
          if (name === 'toString') return this.str(String(args[0].v));
          break;
        case 'Character': {
          const ch = args[0] ? String.fromCharCode(args[0].v) : '';
          switch (name) {
            case 'isDigit': return mk.bool(/\d/.test(ch));
            case 'isLetter': return mk.bool(/\p{L}/u.test(ch));
            case 'isLetterOrDigit': return mk.bool(/[\p{L}\d]/u.test(ch));
            case 'isUpperCase': return mk.bool(ch !== ch.toLowerCase());
            case 'isLowerCase': return mk.bool(ch !== ch.toUpperCase());
            case 'isWhitespace': return mk.bool(/\s/.test(ch));
            case 'toUpperCase': return mk.char(ch.toUpperCase().charCodeAt(0));
            case 'toLowerCase': return mk.char(ch.toLowerCase().charCodeAt(0));
            case 'getNumericValue': return mk.int(/\d/.test(ch) ? +ch : -1);
            case 'toString': case 'valueOf': return name === 'toString' ? this.str(ch) : args[0];
            default: break;
          }
          break;
        }
        case 'String':
          switch (name) {
            case 'valueOf': case 'copyValueOf':
              if (args[0] && args[0].t === 'ref' && args[0].v.kind === 'array') return this.str(args[0].v.items.map((c) => String.fromCharCode(c.v)).join(''));
              return this.str(this.toStr(args[0]));
            case 'format': return this.str(this.format(args[0].v, args.slice(1), line));
            case 'join': {
              const parts = args.length === 2 && args[1].t === 'ref' && (args[1].v.kind === 'list' || args[1].v.kind === 'array') ? args[1].v.items : args.slice(1);
              return this.str(parts.map((p) => this.toStr(p)).join(args[0].v));
            }
            default: break;
          }
          break;
        case 'Arrays': {
          const a = args[0];
          if (a && a.t === 'null') throw this.jthrow('NullPointerException', null, line);
          const arr = a && a.t === 'ref' && a.v.kind === 'array' ? a.v : null;
          switch (name) {
            case 'toString': if (!arr) return this.str('null'); return this.str('[' + arr.items.map((x) => this.toStr(x)).join(', ') + ']');
            case 'deepToString': {
              const deep = (o) => '[' + o.items.map((x) => (x.t === 'ref' && x.v.kind === 'array' ? deep(x.v) : this.toStr(x))).join(', ') + ']';
              return this.str(deep(arr));
            }
            case 'sort':
              arr.items.sort((x, y) => (x.t === 'String' ? (x.v < y.v ? -1 : x.v > y.v ? 1 : 0) : x.v - y.v));
              return VOID;
            case 'fill': for (let i = 0; i < arr.items.length; i++) arr.items[i] = this.coerce(args[1], arr.elem, line); return VOID;
            case 'copyOf': {
              const n = this.intOf(args[1], line);
              const items = [];
              for (let i = 0; i < n; i++) items.push(i < arr.items.length ? arr.items[i] : defaultVal(arr.elem));
              return { t: 'ref', v: this.alloc({ kind: 'array', elem: arr.elem, items }) };
            }
            case 'equals': {
              const b = args[1].v;
              return mk.bool(arr.items.length === b.items.length && arr.items.every((x, i) => this.javaEquals(x, b.items[i])));
            }
            case 'asList': {
              const items = arr && args.length === 1 ? arr.items.slice() : args.slice();
              return { t: 'ref', v: this.alloc({ kind: 'list', cls: 'ArrayList', items }) };
            }
            default: break;
          }
          break;
        }
        case 'List':
          if (name === 'of') return { t: 'ref', v: this.alloc({ kind: 'list', cls: 'ImmutableList', items: args.slice(), immutable: true }) };
          break;
        case 'Objects':
          switch (name) {
            case 'equals': return mk.bool(args[0].t === 'null' ? args[1].t === 'null' : this.javaEquals(args[0], args[1]));
            case 'isNull': return mk.bool(args[0].t === 'null');
            case 'nonNull': return mk.bool(args[0].t !== 'null');
            case 'requireNonNull':
              if (args[0].t === 'null') throw this.jthrow('NullPointerException', args[1] ? args[1].v : null, line);
              return args[0];
            case 'toString': return this.str(this.toStr(args[0]));
            default: break;
          }
          break;
        case 'System':
          switch (name) {
            case 'currentTimeMillis': return mk.long(Date.now());
            case 'nanoTime': return mk.long(Math.round(performance.now() * 1e6));
            case 'exit': this.record(line, 'exit', { code: args[0] ? args[0].v : 0 }); throw new ExitSig(args[0] ? args[0].v : 0);
            case 'arraycopy': {
              const [src, sp, dst, dp, len] = args;
              if (src.t === 'null' || dst.t === 'null') throw this.jthrow('NullPointerException', null, line);
              if (sp.v < 0 || dp.v < 0 || len.v < 0 || sp.v + len.v > src.v.items.length || dp.v + len.v > dst.v.items.length) {
                throw this.jthrow('ArrayIndexOutOfBoundsException', `arraycopy: last source index ${sp.v + len.v} out of bounds for length ${src.v.items.length}`, line);
              }
              const tmp = src.v.items.slice(sp.v, sp.v + len.v);
              for (let i = 0; i < len.v; i++) dst.v.items[dp.v + i] = tmp[i];
              return VOID;
            }
            default: break;
          }
          break;
        case 'Thread':
          if (name === 'sleep') return VOID;
          break;
        default:
          if (cls in BUILTIN_EXC) break;
          break;
      }
      throw this.noMatch(cls, name, args, line);
    }

    // ── Trace / istantanee ──
    dispVal(v) {
      if (v === undefined) return { val: '—', uninit: true };
      switch (v.t) {
        case 'String': return { val: JSON.stringify(v.v.length > 40 ? v.v.slice(0, 40) + '…' : v.v), str: true };
        case 'char': return { val: v.v === 0 ? "'\\u0000'" : "'" + String.fromCharCode(v.v) + "'" };
        case 'null': return { val: 'null', nul: true };
        case 'ref': return v.v.addr ? { val: v.v.addr, ref: v.v.addr } : { val: '<' + v.v.kind + '>' };
        case 'double': return { val: javaDouble(v.v) };
        case 'class': return { val: v.v };
        case 'void': return { val: 'void' };
        default: return { val: String(v.v) };
      }
    }

    heapLabel(o) {
      switch (o.kind) {
        case 'obj': return o.cls;
        case 'array': return `${typeStr(o.elem)}[${o.items.length}]`;
        case 'list': return `${o.cls}<> (size ${o.items.length})`;
        case 'sb': return 'StringBuilder';
        case 'random': return 'Random';
        default: return o.kind;
      }
    }

    snapFrames() {
      const out = [];
      for (const f of this.frames) {
        if (f.hidden) continue;
        const vars = [];
        if (f.self) vars.push({ name: 'this', type: f.self.cls || '', val: f.self.addr, ref: f.self.addr, isThis: true });
        for (const sc of f.scopes) {
          for (const [n, v] of sc) vars.push({ name: n, type: typeStr(v.type), final: !!v.final, ...this.dispVal(v.value) });
        }
        out.push({ name: f.name, line: f.line, ctor: f.isCtor, vars });
      }
      return out;
    }

    snapStatics() {
      const out = [];
      for (const [cls, m] of this.statics) {
        if (!m.size) continue;
        const vars = [];
        for (const [n, v] of m) vars.push({ name: n, type: typeStr(v.type), final: !!v.final, ...this.dispVal(v.value) });
        out.push({ cls, vars });
      }
      return out;
    }

    snapHeap() {
      const roots = [];
      for (const f of this.frames) {
        if (f.self) roots.push(f.self);
        for (const sc of f.scopes) for (const v of sc.values()) if (v.value && v.value.t === 'ref' && v.value.v.addr) roots.push(v.value.v);
      }
      for (const m of this.statics.values()) for (const v of m.values()) if (v.value && v.value.t === 'ref' && v.value.v.addr) roots.push(v.value.v);
      const seen = new Set();
      const order = [];
      const queue = roots.slice();
      while (queue.length && order.length < 40) {
        const o = queue.shift();
        if (seen.has(o)) continue;
        seen.add(o);
        order.push(o);
        const kids = o.kind === 'obj' ? [...o.fields.values()].map((f) => f.value) : (o.kind === 'array' || o.kind === 'list') ? o.items : [];
        for (const k of kids) if (k && k.t === 'ref' && k.v.addr && !seen.has(k.v)) queue.push(k.v);
      }
      const garbage = [];
      for (let i = this.heap.length - 1; i >= 0 && garbage.length < 6; i--) {
        const o = this.heap[i];
        if (!seen.has(o) && !(o.kind === 'array' && o.elem.name === 'String' && o.items.length === 0 && o.id === 1)) {
          if (o.kind === 'obj' && this.isThrowable(o.cls) && o.hiddenGc) continue;
          garbage.unshift(o);
        }
      }
      const snap = (o, gc) => {
        const fields = [];
        if (o.kind === 'obj') {
          for (const [n, f] of o.fields) {
            if (f.decl === 'Throwable' && f.value.t === 'null') continue;
            fields.push({ name: n, access: f.access, type: typeStr(f.type), decl: f.decl, ...this.dispVal(f.value) });
          }
        } else if (o.kind === 'array' || o.kind === 'list') {
          o.items.slice(0, 16).forEach((v, i) => fields.push({ name: `[${i}]`, ...this.dispVal(v) }));
          if (o.items.length > 16) fields.push({ name: '…', val: `+${o.items.length - 16}` });
        } else if (o.kind === 'sb') fields.push({ name: 'valore', ...this.dispVal(this.str(o.s)) });
        return { addr: o.addr, label: this.heapLabel(o), kind: o.kind, exc: o.kind === 'obj' && this.isThrowable(o.cls), fields, gc };
      };
      return order.map((o) => snap(o, false)).concat(garbage.map((o) => snap(o, true)));
    }

    codeAt(line) {
      const s = (this.lines[line - 1] || '').trim();
      return s.length > 70 ? s.slice(0, 67) + '…' : s;
    }

    record(line, kind, data) {
      if (this.silent) return;
      if (this.trace.length >= MAX_STEPS) { this.traceTruncated = true; return; }
      this.silent++;
      let ex;
      try { ex = this.explain(kind, data || {}, line); } finally { this.silent--; }
      this.trace.push({
        line, kind, outLen: this.out.length,
        frames: this.snapFrames(), statics: this.snapStatics(), heap: this.snapHeap(),
        it: ex.it, ar: ex.ar,
      });
    }

    recordExpr(s, v) {
      const e = s.e;
      if (e.k === 'assign') {
        const tgt = exprStr(e.target);
        const val = e.target.k === 'name' ? this.peekValue(e.target, v) : v;
        this.record(s.line, 'assign', { target: tgt, val, op: e.op, isNew: e.value.k === 'new' || e.value.k === 'newarray', isField: e.target.k !== 'name' || !this.findVar(e.target.name), rhsName: e.value.k === 'name' });
        return;
      }
      if (e.k === 'preinc' || e.k === 'postinc') {
        const tgt = exprStr(e.e);
        let nv = v;
        try { nv = this.lvalue(e.e).get(); } catch (err) { /* ignora */ }
        this.record(s.line, 'inc', { target: tgt, val: nv, op: e.op });
        return;
      }
      if (e.k === 'call' && e.target && e.target.k === 'field' && e.target.target.k === 'name' && e.target.target.name === 'System') {
        this.record(s.line, 'print', { text: this.lastPrinted || '', method: e.name, err: e.target.name === 'err' });
        return;
      }
      if (e.k === 'call' && e.name === 'printStackTrace') {
        this.record(s.line, 'print', { text: this.lastPrinted || '', method: 'printStackTrace', err: true });
        return;
      }
      if (e.k === 'call' || e.k === 'supercall') { this.record(s.line, 'calldone', { name: e.name, v }); return; }
      if (e.k === 'new') { this.record(s.line, 'new', { v }); return; }
      this.record(s.line, 'expr', {});
    }

    explain(kind, d, line) {
      const code = '`' + this.codeAt(line) + '`';
      const top = this.top();
      const fr = top ? top.name : '';
      const disp = (v) => (v === undefined ? '—' : this.dispVal(v).val);
      const exName = (o) => (o ? o.cls : '');
      const exMsg = (o) => {
        const f = o && o.fields.get('message');
        return f && f.value.t === 'String' ? ` ("${f.value.v}")` : '';
      };
      switch (kind) {
        case 'call':
          if (d.main) {
            return {
              it: 'Avvio del programma: la JVM invoca il metodo `main` e crea il primo frame sullo Stack.',
              ar: 'بداية البرنامج: تستدعي JVM الدالة `main` وتُنشئ أول إطار (frame) في الـStack. منها يبدأ تنفيذ كل شيء.',
            };
          }
          return {
            it: `Chiamata a \`${d.cls}.${d.name}()\`: la JVM impila un nuovo frame sullo Stack con i parametri e le variabili locali del metodo.`,
            ar: `استدعاء الدالة \`${d.name}()\` من الصنف \`${d.cls}\`: تُضيف JVM إطاراً جديداً (frame) أعلى الـStack يحتوي على المعاملات والمتغيرات المحلية الخاصة بها.`,
          };
        case 'ctor':
          return {
            it: `Esecuzione del costruttore di \`${d.cls}\`: inizializza i campi dell'oggetto \`${d.addr}\` appena allocato nello Heap (\`this\` = ${d.addr}).`,
            ar: `تنفيذ المُنشئ (constructor) للصنف \`${d.cls}\`: يقوم بتهيئة حقول الكائن \`${d.addr}\` الذي حُجز للتو في الـHeap، والمرجع \`this\` يشير إليه.`,
          };
        case 'decl': {
          const n = d.name, ts = typeStr(d.type), v = d.val;
          if (v === undefined) {
            return {
              it: `Dichiarata la variabile \`${n}\` (${ts}) senza valore: esiste nel frame ma non è ancora inizializzata.`,
              ar: `تم التصريح عن المتغير \`${n}\` من النوع \`${ts}\` دون قيمة: هو موجود في الإطار لكنه غير مُهيّأ، ولا يجوز قراءته قبل إسناد قيمة له.`,
            };
          }
          if (v.t === 'ref') {
            const o = v.v;
            const what = this.heapLabel(o);
            if (d.init && ['new', 'newarray', 'arrinit'].includes(d.init.k)) {
              return {
                it: `\`new\` crea ${o.kind === 'array' ? 'un array' : 'un oggetto'} \`${what}\` nello Heap all'indirizzo \`${o.addr}\`; la variabile \`${n}\` sullo Stack contiene solo il riferimento.`,
                ar: `الكلمة \`new\` تحجز ${o.kind === 'array' ? 'مصفوفة' : 'كائناً'} \`${what}\` في الـHeap على العنوان \`${o.addr}\`، بينما المتغير \`${n}\` في الـStack يحمل فقط المرجع (العنوان) إليه وليس الكائن نفسه.`,
              };
            }
            return {
              it: `\`${n}\` riceve il riferimento \`${o.addr}\`: punta all'oggetto \`${what}\` nello Heap.`,
              ar: `المتغير \`${n}\` يستقبل المرجع \`${o.addr}\`: أي أنه يشير إلى الكائن \`${what}\` الموجود في الـHeap.`,
            };
          }
          if (v.t === 'null') {
            return {
              it: `\`${n}\` vale \`null\`: il riferimento non punta a nessun oggetto. Invocare un metodo su di esso provoca \`NullPointerException\`.`,
              ar: `قيمة \`${n}\` هي \`null\`: المرجع لا يشير إلى أي كائن في الـHeap. استدعاء أي دالة عليه سيُسبب الاستثناء \`NullPointerException\`.`,
            };
          }
          if (v.t === 'String') {
            return {
              it: `Variabile \`${n}\` di tipo \`String\` = ${disp(v)}: le stringhe sono oggetti immutabili; qui il valore è mostrato direttamente nel frame per semplicità.`,
              ar: `المتغير \`${n}\` من النوع \`String\` قيمته ${disp(v)}. السلاسل النصية في Java كائنات غير قابلة للتعديل (immutable)؛ نعرض قيمتها هنا مباشرة للتبسيط.`,
            };
          }
          return {
            it: `Variabile \`${n}\` (${ts}) = ${disp(v)} creata nel frame \`${fr}\` sullo Stack: il valore primitivo è memorizzato direttamente nella variabile.`,
            ar: `أُنشئ المتغير \`${n}\` من النوع البدائي \`${ts}\` بقيمة ${disp(v)} داخل إطار \`${fr}\` في الـStack، والقيمة مخزّنة مباشرة داخل المتغير (وليست مرجعاً).`,
          };
        }
        case 'assign': {
          const t = d.target, v = d.val;
          if (v && v.t === 'ref' && d.isNew) {
            return {
              it: `Nuovo ${v.v.kind === 'array' ? 'array' : 'oggetto'} \`${this.heapLabel(v.v)}\` creato nello Heap (\`${v.v.addr}\`); ora \`${t}\` lo referenzia.`,
              ar: `أُنشئ ${v.v.kind === 'array' ? 'مصفوفة جديدة' : 'كائن جديد'} \`${this.heapLabel(v.v)}\` في الـHeap على العنوان \`${v.v.addr}\`، والآن \`${t}\` يشير إليه.`,
            };
          }
          if (v && v.t === 'ref' && d.rhsName) {
            return {
              it: `\`${t}\` riceve una copia del riferimento \`${v.v.addr}\`: ora più variabili puntano allo stesso oggetto (nessuna copia dell'oggetto).`,
              ar: `\`${t}\` يستقبل نسخة من المرجع \`${v.v.addr}\` فقط: الآن أكثر من متغير يشير إلى نفس الكائن، ولم يتم نسخ الكائن نفسه.`,
            };
          }
          if (v && v.t === 'null') {
            return {
              it: `\`${t}\` = null: il riferimento non punta più a nessun oggetto; se nessun altro lo referenzia, l'oggetto diventa eleggibile per il Garbage Collector.`,
              ar: `\`${t}\` = null: لم يعد المرجع يشير إلى أي كائن؛ وإذا لم يعد هناك مرجع آخر للكائن يصبح مؤهلاً للحذف بواسطة جامع القمامة (Garbage Collector).`,
            };
          }
          if (d.isField) {
            return {
              it: `Il campo \`${t}\` dell'oggetto nello Heap ora vale ${disp(v)}.`,
              ar: `حقل الكائن \`${t}\` الموجود في الـHeap أصبحت قيمته ${disp(v)}.`,
            };
          }
          return {
            it: `${d.op === '=' ? 'Assegnazione' : `Assegnazione composta \`${d.op}\``}: \`${t}\` ora vale ${disp(v)}.`,
            ar: `${d.op === '=' ? 'إسناد' : `إسناد مركّب \`${d.op}\``}: أصبحت قيمة \`${t}\` تساوي ${disp(v)}.`,
          };
        }
        case 'inc':
          return {
            it: `\`${d.target}\` ${d.op === '++' ? 'incrementata' : 'decrementata'} di 1 → ${disp(d.val)}.`,
            ar: `تمت ${d.op === '++' ? 'زيادة' : 'إنقاص'} قيمة \`${d.target}\` بمقدار 1 فأصبحت ${disp(d.val)}.`,
          };
        case 'print': {
          const txt = (d.text || '').replace(/\n$/, '');
          const short = txt.length > 80 ? txt.slice(0, 77) + '…' : txt;
          if (d.method === 'printStackTrace') {
            return {
              it: 'printStackTrace() stampa su System.err il tipo dell\'eccezione, il messaggio e la sequenza di chiamate (stack trace).',
              ar: 'الدالة printStackTrace() تطبع في مخرجات الأخطاء نوع الاستثناء ورسالته وسلسلة الاستدعاءات (stack trace) التي أدت إليه.',
            };
          }
          return {
            it: `\`System.${d.err ? 'err' : 'out'}.${d.method}\` scrive sulla console: «${short}»${d.method === 'print' ? ' (senza andare a capo)' : ''}.`,
            ar: `تطبع \`System.${d.err ? 'err' : 'out'}.${d.method}\` على الشاشة (Console) النص: «${short}»${d.method === 'print' ? ' دون الانتقال إلى سطر جديد' : ''}.`,
          };
        }
        case 'calldone': {
          const has = d.v && d.v.t !== 'void';
          return {
            it: `Il metodo \`${d.name}()\` è terminato: il suo frame è stato rimosso dallo Stack (LIFO)${has ? ` e ha restituito ${disp(d.v)} (valore ignorato)` : ''}.`,
            ar: `انتهى تنفيذ الدالة \`${d.name}()\` وأُزيل إطارها من الـStack (آخر من يدخل أول من يخرج LIFO)${has ? `، وأعادت القيمة ${disp(d.v)} لكنها لم تُستخدم` : ''}.`,
          };
        }
        case 'new':
          return {
            it: `Oggetto \`${this.heapLabel(d.v.v)}\` creato nello Heap ma il riferimento non è salvato in nessuna variabile: è subito eleggibile per il Garbage Collector.`,
            ar: `أُنشئ الكائن \`${this.heapLabel(d.v.v)}\` في الـHeap لكن لم يُحفظ مرجعه في أي متغير، لذا يصبح فوراً مؤهلاً للحذف بواسطة جامع القمامة.`,
          };
        case 'if':
          return {
            it: `Condizione dell'\`if\` valutata: ${d.cond} → ${d.cond ? 'si esegue il blocco if' : d.hasElse ? 'si esegue il ramo else' : 'il blocco viene saltato'}.`,
            ar: `تم تقييم شرط \`if\` فكانت النتيجة ${d.cond} ← ${d.cond ? 'يُنفَّذ جسم if' : d.hasElse ? 'يُنفَّذ فرع else' : 'يتم تخطي الجسم'}.`,
          };
        case 'loop':
          return {
            it: `Condizione del ciclo \`${d.kw}\` = ${d.cond} → ${d.cond ? 'nuova iterazione' : 'uscita dal ciclo'}.`,
            ar: `شرط الحلقة \`${d.kw}\` = ${d.cond} ← ${d.cond ? 'تبدأ دورة (تكرار) جديدة' : 'الخروج من الحلقة'}.`,
          };
        case 'update':
          return {
            it: `Aggiornamento del ciclo for: \`${d.text}\`.`,
            ar: `تحديث عدّاد حلقة for: \`${d.text}\`.`,
          };
        case 'foreach':
          return {
            it: `for-each: \`${d.name}\` = ${disp(d.v)} (elemento ${d.i + 1} di ${d.n}).`,
            ar: `حلقة for-each: المتغير \`${d.name}\` يأخذ القيمة ${disp(d.v)} (العنصر ${d.i + 1} من ${d.n}).`,
          };
        case 'foreach-end':
          return { it: 'for-each terminato: tutti gli elementi sono stati visitati.', ar: 'انتهت حلقة for-each بعد المرور على جميع العناصر.' };
        case 'switch':
          return {
            it: `\`switch\` sul valore ${disp(d.v)} → ${d.matched ? (d.matched.labels ? 'salto al case corrispondente' : 'nessun case corrisponde: si esegue default') : 'nessun case corrispondente'}.`,
            ar: `جملة \`switch\` على القيمة ${disp(d.v)} ← ${d.matched ? (d.matched.labels ? 'القفز إلى الحالة case المطابقة' : 'لا توجد حالة مطابقة فيُنفَّذ default') : 'لا توجد حالة مطابقة'}.`,
          };
        case 'break':
          return { it: '`break`: esce immediatamente dal ciclo o dallo switch più interno.', ar: '`break`: خروج فوري من أقرب حلقة أو جملة switch.' };
        case 'continue':
          return { it: '`continue`: salta il resto dell\'iterazione corrente e passa alla successiva.', ar: '`continue`: تخطي بقية الدورة الحالية والانتقال مباشرة إلى الدورة التالية.' };
        case 'return': {
          const has = d.v && d.v.t !== 'void';
          return {
            it: `\`return\`${has ? ' ' + disp(d.v) : ''}: il metodo termina e restituisce il controllo al chiamante; il suo frame verrà rimosso dallo Stack.`,
            ar: `\`return\`: تنتهي الدالة وتعيد ${has ? `القيمة ${disp(d.v)} و` : ''}التحكم إلى الدالة المستدعية، وسيُزال إطارها من الـStack.`,
          };
        }
        case 'throw':
          return {
            it: `\`throw\`: viene lanciata l'eccezione \`${exName(d.ex)}\`${exMsg(d.ex)}. L'esecuzione normale si interrompe e la JVM cerca un \`catch\` compatibile risalendo lo Stack.`,
            ar: `\`throw\`: تم رمي الاستثناء \`${exName(d.ex)}\`. يتوقف التنفيذ الطبيعي وتبحث JVM عن كتلة \`catch\` مناسبة صعوداً عبر إطارات الـStack.`,
          };
        case 'jvmthrow': {
          const hints = {
            NullPointerException: ['si è usato un riferimento che vale null.', 'تم استخدام مرجع قيمته null (لا يشير إلى أي كائن).'],
            ArrayIndexOutOfBoundsException: ["l'indice è fuori dai limiti dell'array (validi: da 0 a length-1).", 'الفهرس خارج حدود المصفوفة (المسموح من 0 إلى length-1).'],
            StringIndexOutOfBoundsException: ['l\'indice è fuori dai limiti della stringa.', 'الفهرس خارج حدود السلسلة النصية.'],
            IndexOutOfBoundsException: ['l\'indice è fuori dai limiti della lista.', 'الفهرس خارج حدود القائمة.'],
            ArithmeticException: ['divisione intera per zero.', 'قسمة عدد صحيح على صفر.'],
            ClassCastException: ['cast verso un tipo incompatibile con l\'oggetto reale.', 'تحويل (cast) إلى نوع لا يتوافق مع النوع الحقيقي للكائن.'],
            NumberFormatException: ['la stringa non rappresenta un numero valido.', 'السلسلة النصية لا تمثل رقماً صالحاً.'],
            StackOverflowError: ['troppe chiamate annidate (ricorsione senza caso base?).', 'استدعاءات متداخلة كثيرة جداً (تعاود بلا حالة توقف؟).'],
          };
          const h = hints[exName(d.ex)] || ['errore a tempo di esecuzione.', 'خطأ أثناء التنفيذ.'];
          return {
            it: `La JVM genera \`${exName(d.ex)}\`${exMsg(d.ex)}: ${h[0]}`,
            ar: `تُطلق JVM الاستثناء \`${exName(d.ex)}\`: ${h[1]}`,
          };
        }
        case 'catch':
          return {
            it: `Eccezione \`${exName(d.ex)}\` catturata dal blocco \`catch\`: il programma continua in modo controllato.`,
            ar: `تم التقاط الاستثناء \`${exName(d.ex)}\` بواسطة كتلة \`catch\`: يستمر البرنامج بشكل مُتحكَّم به بدلاً من التوقف.`,
          };
        case 'finally':
          return {
            it: `Blocco \`finally\`: viene eseguito SEMPRE, con o senza eccezione${d.pending ? ` (ora c'è un'eccezione \`${d.pending.cls}\` in sospeso)` : ''}: ideale per rilasciare le risorse.`,
            ar: `كتلة \`finally\`: تُنفَّذ دائماً سواء حدث استثناء أم لا${d.pending ? ` (يوجد الآن استثناء \`${d.pending.cls}\` معلّق)` : ''}، وهي مثالية لتحرير الموارد كإغلاق الملفات.`,
          };
        case 'uncaught':
          return {
            it: `Eccezione \`${exName(d.ex)}\` non gestita: la JVM interrompe il programma e stampa lo stack trace su System.err.`,
            ar: `الاستثناء \`${exName(d.ex)}\` لم تتم معالجته بأي catch: توقف JVM البرنامج وتطبع مسار الاستدعاءات (stack trace) في مخرجات الأخطاء.`,
          };
        case 'end':
          return {
            it: 'Fine di `main`: l\'ultimo frame viene rimosso, lo Stack è vuoto e il programma termina. Gli oggetti nello Heap saranno liberati dal Garbage Collector.',
            ar: 'انتهت الدالة `main`: أُزيل آخر إطار وأصبح الـStack فارغاً وانتهى البرنامج. الكائنات المتبقية في الـHeap سيحررها جامع القمامة (Garbage Collector).',
          };
        case 'exit':
          return { it: `\`System.exit(${d.code})\`: la JVM termina immediatamente.`, ar: `\`System.exit(${d.code})\`: تُنهي JVM البرنامج فوراً.` };
        default:
          return { it: `Istruzione eseguita: ${code}.`, ar: `تم تنفيذ التعليمة ${code}.` };
      }
    }
  }

  // ───────────────────────── API pubblica ─────────────────────────
  function run(src) {
    const res = { ok: false, stdout: [], trace: [], error: null, exception: null, truncated: false };
    let interp = null;
    try {
      const types = new Parser(tokenize(src)).parseUnit();
      interp = new Interp(src, types);
      interp.validate();
      interp.start();
      res.ok = true;
    } catch (e) {
      if (e instanceof CompileError) {
        res.error = { type: 'compile', msg: e.message, line: e.line, ar: e.ar };
        if (interp) { interp.out = []; interp.trace = []; }
      } else if (e instanceof Unsupported) {
        res.error = {
          type: 'unsupported', msg: 'Costrutto non supportato dal simulatore: ' + e.message, line: e.line,
          ar: 'هذا البناء غير مدعوم في المحاكي التعليمي: ' + e.message + '. الكود قد يكون صحيحاً في Java الحقيقية.',
        };
      } else if (e instanceof LimitError) {
        res.error = { type: 'limit', msg: e.message, line: e.line, ar: 'تم تجاوز حد التنفيذ المسموح: غالباً هناك حلقة لا نهائية أو تعاود (recursion) بلا حالة توقف.' };
      } else if (e instanceof JavaThrow) {
        res.error = { type: 'internal', msg: 'eccezione inattesa durante l\'inizializzazione statica: ' + e.obj.cls, ar: 'استثناء غير متوقع أثناء التهيئة' };
      } else if (e instanceof RangeError) {
        res.error = { type: 'limit', msg: 'StackOverflowError: troppe chiamate annidate', ar: 'تجاوز سعة الـStack: استدعاءات متداخلة كثيرة جداً (تعاود بلا حالة توقف؟)' };
      } else {
        res.error = { type: 'internal', msg: 'errore interno del simulatore: ' + (e && e.message ? e.message : String(e)), ar: 'خطأ داخلي في المحاكي' };
      }
    }
    if (interp) {
      res.stdout = interp.out;
      res.trace = interp.trace;
      res.truncated = interp.traceTruncated;
      res.exception = interp.uncaught;
    }
    res.text = res.stdout.filter((c) => !c.err).map((c) => c.text).join('');
    res.errText = res.stdout.filter((c) => c.err).map((c) => c.text).join('');
    return res;
  }

  const api = { run, tokenize, Parser, javaDouble, CompileError };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CFInterpreter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
