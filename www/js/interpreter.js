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
  class YieldSig { constructor(value) { this.value = value; } }

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
  // '>>' e '>>>' non sono token: vengono ricomposti nel parser (così List<List<T>> funziona).
  const OPS = ['>>>=', '<<=', '>>=', '...', '->', '::', '++', '--', '&&', '||', '==', '!=', '<=', '>=',
    '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<'];
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
      toks.push({ t: 'op', v: op, line, i });
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
    constructor(toks) { this.toks = toks; this.pos = 0; this.anon = []; this.typeParams = new Set(); }
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
      return types.concat(this.anon);
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

    /** <T, K extends Comparable<K>> : registra i nomi dei parametri di tipo. */
    parseTypeParams() {
      this.expect('<');
      do {
        this.parseModifiers();
        this.typeParams.add(this.expectId());
        if (this.accept('extends')) { this.parseType(); while (this.accept('&')) this.parseType(); }
      } while (this.accept(','));
      this.expect('>');
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
      else if (this.accept('enum')) kind = 'enum';
      else if (t.t === 'id' && t.v === 'record') throw new Unsupported('record', t.line);
      else throw new CompileError(`atteso 'class', 'interface' o 'enum' ma trovato '${t.v}'`, t.line, `كان متوقعاً class أو interface أو enum لكن وُجد '${t.v}'`);
      const name = this.expectId();
      if (this.is('<')) this.parseTypeParams();
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
      const cls = { name, kind, ext, impls, mods, line: t.line, fields: [], methods: [], ctors: [], inits: [], staticInits: [], enumConsts: [] };
      const out = [cls];
      if (kind === 'enum') {
        while (!this.is(';') && !this.is('}')) {
          const cl = this.peek().line;
          this.parseModifiers();
          const cname = this.expectId();
          const args = this.is('(') ? this.parseArgs() : [];
          if (this.is('{')) throw new Unsupported('corpi specifici per le costanti enum', cl);
          cls.enumConsts.push({ name: cname, args, line: cl });
          if (!this.accept(',')) break;
        }
        this.accept(';');
      }
      this.parseClassBody(cls, out);
      return out;
    }

    parseClassBody(cls, out) {
      const name = cls.name, kind = cls.kind;
      while (!this.accept('}')) {
        this.eofCheck('}');
        if (this.accept(';')) continue;
        const mline = this.peek().line;
        const m = this.parseModifiers();
        if (this.is('class') || this.is('interface') || this.is('enum')) { out.push(...this.parseTypeDecl(m)); continue; }
        if (this.is('{')) { const b = this.parseBlock(); (m.has('static') ? cls.staticInits : cls.inits).push(b); continue; }
        if (this.is('<')) this.parseTypeParams();
        if (this.peek().t === 'id' && this.peek().v === name && this.is('(', 1)) {
          this.pos++;
          const params = this.parseParams();
          const throwsL = this.parseThrows();
          const body = this.parseBlock();
          if (kind === 'enum') m.add('private');
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
      if (t.t === 'id' && t.v === 'yield' && !['=', '(', '.', '[', '++', '--', '+=', '-='].includes(this.peek(1).v)) {
        this.pos++;
        const e = this.parseExpr();
        this.expect(';');
        return { k: 'yield', e, line };
      }
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

    parseSwitch(asExpr) {
      const line = asExpr ? this.toks[this.pos - 1].line : this.next().line;
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
          this.inCaseLabel = true;
          labels = [this.parseTernary()];
          while (this.accept(',')) labels.push(this.parseTernary());
          this.inCaseLabel = false;
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
      return { k: asExpr ? 'switchexpr' : 'switch', disc, cases, line };
    }

    parseTry() {
      const line = this.next().line;
      let resources = null;
      if (this.accept('(')) {
        resources = [];
        while (!this.accept(')')) {
          this.eofCheck(')');
          const rl = this.peek().line;
          if (this.isLocalDecl()) {
            this.parseModifiers();
            const type = this.parseType();
            const name = this.expectId();
            this.expect('=');
            resources.push({ type, name, init: this.parseExpr(), line: rl });
          } else resources.push({ expr: this.parseExpr(), line: rl });
          if (!this.accept(';')) { this.expect(')'); break; }
        }
      }
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
      if (!catches.length && !fin && !resources) throw new CompileError("'try' senza 'catch' o 'finally'", line, 'كتلة try يجب أن تتبعها catch أو finally على الأقل');
      return { k: 'try', block, catches, fin, finLine, line, resources };
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
        let t = this.peek();
        let width = 1;
        if (t.t === 'op' && t.v === '>' && this.is('>', 1) && this.peek(1).i === t.i + 1) {
          const three = this.is('>', 2) && this.peek(2).i === t.i + 2;
          width = three ? 3 : 2;
          t = { ...t, v: three ? '>>>' : '>>' };
        }
        const prec = (t.t === 'op' || t.v === 'instanceof') ? PREC[t.v] : undefined;
        if (!prec || prec < min) return left;
        this.pos += width;
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
          if (this.is('->') && !this.inCaseLabel) { this.pos++; return this.parseLambdaBody([t.v], line); }
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
            case 'switch': return this.parseSwitch(true);
            default: break;
          }
          break;
        case 'op':
          if (t.v === '(') {
            if (this.isLambdaAhead()) return this.parseLambdaParams(line);
            const e = this.parseExpr();
            this.expect(')');
            return { ...e, paren: true };
          }
          break;
        default: break;
      }
      throw new CompileError(`espressione non valida: '${t.v}' inatteso`, line, `تعبير غير صالح: الرمز '${t.v}' غير متوقع هنا`);
    }

    /** Dopo '(' già consumata: la parentesi chiusa corrispondente è seguita da '->'? */
    isLambdaAhead() {
      let depth = 1, k = 0;
      for (;;) {
        const t = this.peek(k);
        if (t.t === 'eof') return false;
        if (t.v === '(' && t.t === 'op') depth++;
        else if (t.v === ')' && t.t === 'op') { depth--; if (!depth) return this.is('->', k + 1); }
        k++;
      }
    }

    parseLambdaParams(line) {
      const params = [];
      while (!this.accept(')')) {
        this.parseModifiers();
        if (this.peek().t === 'id' && (this.is(',', 1) || this.is(')', 1))) params.push(this.next().v);
        else { this.parseType(); params.push(this.expectId()); }
        if (!this.accept(',')) { this.expect(')'); break; }
      }
      this.expect('->');
      return this.parseLambdaBody(params, line);
    }

    parseLambdaBody(params, line) {
      if (this.is('{')) return { k: 'lambda', params, block: this.parseBlock(), line };
      return { k: 'lambda', params, expr: this.parseExpr(), line };
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
      if (this.is('{')) {
        this.pos++;
        const anonName = `Anonima$${this.anon.length + 1}`;
        const cls = { name: anonName, kind: 'class', ext: null, impls: [], base: name, anon: true, mods: new Set(), line,
          fields: [], methods: [], ctors: [], inits: [], staticInits: [], enumConsts: [] };
        const nested = [];
        this.parseClassBody(cls, nested);
        this.anon.push(cls, ...nested);
        return { k: 'new', cls: anonName, args, line, anon: true };
      }
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
          const line = this.next().line;
          const name = this.accept('new') ? 'new' : this.expectId();
          e = { k: 'mref', target: e, name, line };
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
    UncheckedIOException: 'RuntimeException', EmptyStackException: 'RuntimeException', NoSuchFileException: 'IOException',
  };
  const PKG = {
    IOException: 'java.io', FileNotFoundException: 'java.io', InputMismatchException: 'java.util',
    EmptyStackException: 'java.util', NoSuchFileException: 'java.nio.file', UncheckedIOException: 'java.io',
    NoSuchElementException: 'java.util', ConcurrentModificationException: 'java.util',
  };
  const WRAP = { Integer: 'int', Long: 'long', Double: 'double', Float: 'double', Short: 'int', Byte: 'int', Boolean: 'boolean', Character: 'char' };
  const STATIC_CLASSES = new Set(['Math', 'System', 'Integer', 'Double', 'Long', 'Boolean', 'Character', 'String', 'Arrays',
    'Objects', 'List', 'Thread', 'Float', 'Short', 'Byte', 'Collections', 'Comparator', 'Collectors', 'Stream', 'IntStream',
    'DoubleStream', 'Files', 'Paths', 'Path', 'Set', 'Map', 'Optional', 'Function', 'Entry']);
  const MAP_CLASSES = { HashMap: 'hash', LinkedHashMap: 'linked', TreeMap: 'tree', Hashtable: 'hash' };
  const SET_CLASSES = { HashSet: 'hash', LinkedHashSet: 'linked', TreeSet: 'tree' };
  const COLLECTION_TYPES = {
    list: ['List', 'ArrayList', 'LinkedList', 'Collection', 'Iterable', 'Vector', 'Stack', 'AbstractList'],
    map: ['Map', 'HashMap', 'LinkedHashMap', 'TreeMap', 'SortedMap', 'Hashtable'],
    set: ['Set', 'HashSet', 'LinkedHashSet', 'TreeSet', 'SortedSet', 'Collection', 'Iterable'],
  };
  const UNSUPPORTED_JDK = new Set(['Thread', 'LocalDate', 'LocalDateTime', 'DecimalFormat', 'InputStreamReader', 'Queue', 'Deque',
    'ArrayDeque', 'PriorityQueue', 'Socket', 'URL', 'JFrame', 'JButton', 'ExecutorService']);
  const KNOWN_LIB_TYPES = new Set(['List', 'ArrayList', 'LinkedList', 'Collection', 'Iterable', 'StringBuilder', 'StringBuffer',
    'Random', 'CharSequence', 'Comparable', 'Number', 'Map', 'HashMap', 'LinkedHashMap', 'TreeMap', 'Set', 'HashSet',
    'LinkedHashSet', 'TreeSet', 'Entry', 'Iterator', 'Scanner', 'File', 'FileReader', 'FileWriter', 'BufferedReader',
    'BufferedWriter', 'PrintWriter', 'PrintStream', 'Comparator', 'Predicate', 'Function', 'Consumer', 'Supplier', 'BiFunction',
    'BiConsumer', 'BinaryOperator', 'UnaryOperator', 'Runnable', 'Stream', 'IntStream', 'DoubleStream', 'Optional',
    'OptionalInt', 'OptionalDouble', 'Collectors', 'Path', 'Paths', 'Files', 'AutoCloseable', 'Closeable', 'Vector', 'Stack',
    'Hashtable', 'SortedMap', 'SortedSet', 'Object', 'Enum', 'IntBinaryOperator', 'ToIntFunction', 'Reader', 'Writer']);

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
          // Formattazione con Locale italiano (come la JVM degli studenti in Italia): 3,14 e 1.234,50
          const p = prec !== undefined ? +prec : 6;
          const [ip, dp] = Number(a.v).toFixed(p).split('.');
          s = (flags.includes(',') ? ip.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ip) + (dp ? ',' + dp : '');
          if (flags.includes('+') && a.v >= 0) s = '+' + s;
          break;
        }
        case 'e': case 'E': s = Number(a.v).toExponential(prec !== undefined ? +prec : 6).replace(/e([+-])(\d)$/, 'e$10$2').replace('.', ','); if (conv === 'E') s = s.toUpperCase(); break;
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
    constructor(src, types, opts) {
      this.src = src;
      const o = opts || {};
      const input = String(o.input || '').replace(/\r\n?/g, '\n');
      this.stdin = { text: input, pos: 0, isStdin: true, echoed: 0 };
      this.fs = new Map(Object.entries(o.files || {}));
      this.lastInput = null;
      this.lines = src.split('\n');
      this.classes = new Map();
      for (const c of types) {
        if (c.anon) {
          const base = types.find((x) => x.name === c.base);
          if (base && base.kind === 'class') c.ext = c.base;
          else c.impls = [c.base];
        }
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
          if (c.kind === 'enum') stack.push('Enum', 'Comparable');
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
          if (c.kind === 'class' || c.kind === 'enum') {
            if (m.mods.has('abstract') && m.body) throw new CompileError(`il metodo abstract ${m.name}() non può avere un corpo`, m.line, `الدالة المجردة ${m.name}() لا يمكن أن تحتوي على جسم { }`);
            if (!m.mods.has('abstract') && !m.body && !m.mods.has('native')) throw new CompileError(`manca il corpo del metodo ${m.name}(): aggiungi { } oppure dichiaralo abstract`, m.line, `ينقص جسم الدالة ${m.name}(): أضف { } أو صرّح عنها كـ abstract`);
            if (m.mods.has('abstract') && !c.mods.has('abstract')) throw new CompileError(`${c.name} deve essere dichiarata abstract perché contiene il metodo astratto ${m.name}()`, c.line, `يجب التصريح عن الصنف ${c.name} كـ abstract لأنه يحتوي على الدالة المجردة ${m.name}()`);
          }
        }
        if ((c.kind === 'class' || c.kind === 'enum') && !c.mods.has('abstract')) {
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
          const libParent = this.chain(c.name).some((k) => k.impls.some((i) => !this.cls(i)) || (k.ext && !this.cls(k.ext)));
          const ok = libParent || sup.some((k) => k.methods.some((x) => x.name === m.name && x.params.length === m.params.length)) ||
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

    /** Variabili locali catturate da una classe anonima (e campi/statici della classe esterna). */
    findCaptured(name) {
      const f = this.top();
      let env = f.self && f.self.env;
      while (env) {
        for (let i = env.scopes.length - 1; i >= 0; i--) {
          const v = env.scopes[i].get(name);
          if (v) return { ...v, kind: 'local' };
        }
        if (env.self) {
          const fld = env.self.fields.get(name);
          if (fld) return { ...fld, kind: 'field', ref: fld, owner: env.self };
        }
        const st = env.cls ? this.findStatic(env.cls.name, name) : null;
        if (st) return { ...st, kind: 'static', ref: st };
        env = env.self && env.self.env;
      }
      return null;
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
      const cap = this.findCaptured(name);
      if (cap) {
        if (cap.value === undefined) throw this.uninit(name, line);
        return cap.value;
      }
      if (!f.self && f.cls && this.instanceFieldDeclared(f.cls.name, name)) throw this.staticCtx(name, line);
      if (this.classes.has(name) || STATIC_CLASSES.has(name) || name in BUILTIN_EXC) return { t: 'class', v: name };
      throw this.notFound(name, line);
    }

    lvalue(e) {
      const line = e.line;
      if (e.k === 'name') {
        const v = this.findVar(e.name);
        if (v) {
          const fr = this.top();
          if (fr.capturedDepth && fr.scopes.slice(0, fr.capturedDepth).some((sc) => sc.get(e.name) === v)) {
            throw new CompileError(`la variabile locale ${e.name} usata in una lambda deve essere final o effettivamente final`, line,
              `المتغير المحلي ${e.name} المستخدم داخل lambda يجب أن يكون final (أو لا تتغير قيمته بعد الإسناد الأول)، لذلك لا يمكن تعديله داخلها`);
          }
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
        const cap = this.findCaptured(e.name);
        if (cap) {
          if (cap.kind === 'field') return this.fieldLv(cap.owner, cap.ref, e.name, line);
          if (cap.kind === 'static') return this.staticLv(cap.ref, e.name, line);
          throw new CompileError(`la variabile locale ${e.name} usata in una classe interna deve essere final o effettivamente final`, line,
            `المتغير المحلي ${e.name} المستخدم داخل صنف داخلي (anonymous) يجب أن يكون final ولا يمكن تعديله`);
        }
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
          if (o.kind === 'list' || o.kind === 'map' || o.kind === 'set') return o.cls;
          if (o.kind === 'sb') return 'StringBuilder';
          const names = { lambda: 'lambda', scanner: 'Scanner', file: 'File', path: 'Path', reader: o.cls, writer: o.cls, stream: 'Stream',
            optional: 'Optional', iter: 'Iterator', entry: 'Map.Entry', collector: 'Collector' };
          return names[o.kind] || o.kind;
        }
        case 'class': return 'class ' + v.v;
        default: return v.t;
      }
    }

    coerce(v, type, line) {
      const k = kindOf(type);
      if (v.t === 'void') throw new CompileError("un metodo 'void' non restituisce alcun valore", line, 'الدالة من نوع void لا تُعيد أي قيمة، فلا يمكن استخدام نتيجتها');
      if (v.t === 'null' && ['int', 'long', 'double', 'boolean', 'char'].includes(k)) {
        throw this.jthrow('NullPointerException', 'Cannot unbox a null value (unboxing di null in un tipo primitivo)', line);
      }
      if (v.boxed && k === 'int') return mk.int(v.v);
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
        return k === 'w:int' ? { ...v, boxed: true } : v;
      }
      if (v.t === 'null') return v;
      if (type.dims > 0) {
        if (v.t === 'ref' && v.v.kind === 'array') return v;
        return bad();
      }
      const tn = type.name;
      if (v.t === 'ref' && v.v.kind === 'lambda') {
        const c = this.cls(tn);
        if (c && c.kind !== 'interface') bad();
        return v;
      }
      if (this.isRefTypeKnown(tn)) {
        if (v.t === 'ref' && v.v.kind === 'obj') {
          if (!this.isSubtype(v.v.cls, tn)) bad();
          return v;
        }
        return bad();
      }
      if (v.t === 'ref' && COLLECTION_TYPES[v.v.kind] && KNOWN_LIB_TYPES.has(tn) && !COLLECTION_TYPES[v.v.kind].includes(tn) &&
        ['List', 'ArrayList', 'LinkedList', 'Map', 'HashMap', 'TreeMap', 'LinkedHashMap', 'Set', 'HashSet', 'TreeSet', 'LinkedHashSet'].includes(tn)) bad();
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
    hashHex(o) { return (o.addr || '@1b6d').slice(1); }
    objToString(o) {
      switch (o.kind) {
        case 'array': {
          const codes = { int: 'I', double: 'D', char: 'C', boolean: 'Z', long: 'J', byte: 'B', short: 'S', float: 'F' };
          const e = o.elem;
          const code = e.dims > 0 ? '[' : (codes[e.name] || 'L' + (e.name === 'String' ? 'java.lang.String' : e.name) + ';');
          return '[' + code + '@' + this.hashHex(o);
        }
        case 'list': return '[' + o.items.map((x) => this.toStr(x)).join(', ') + ']';
        case 'set': return '[' + this.mapOrdered(o, 0).map((e) => this.toStr(e.k)).join(', ') + ']';
        case 'map': return '{' + this.mapOrdered(o, 0).map((e) => this.toStr(e.k) + '=' + this.toStr(e.v)).join(', ') + '}';
        case 'entry': return this.toStr(o.ent.k) + '=' + this.toStr(o.ent.v);
        case 'lambda': return 'Main$$Lambda@' + (this.hashHex(o) || '1b6d');
        case 'optional': return o.val ? `${o.prim === 'double' ? 'OptionalDouble' : o.prim === 'int' ? 'OptionalInt' : 'Optional'}[${this.toStr(o.val)}]` : `${o.prim === 'double' ? 'OptionalDouble' : o.prim === 'int' ? 'OptionalInt' : 'Optional'}.empty`;
        case 'file': case 'path': return o.name;
        case 'scanner': return 'java.util.Scanner[delimiters=\\p{javaWhitespace}+]';
        case 'reader': case 'writer': return `java.io.${o.cls}@${this.hashHex(o)}`;
        case 'iter': return 'java.util.Iterator@' + this.hashHex(o);
        case 'stream': return 'java.util.stream.ReferencePipeline@1b6d3586';
        case 'sb': return o.s;
        case 'classobj': return 'class ' + o.name;
        case 'random': return 'java.util.Random@' + this.hashHex(o);
        case 'obj': {
          const m = this.findMethod(o.cls, 'toString', []);
          if (m) return this.toStr(this.invoke(m, o, [], 0));
          if (o.enumName !== undefined) return o.enumName;
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
      if (a.t === 'ref' && b.t === 'ref' && a.v.kind === b.v.kind && ['list', 'set', 'map', 'entry'].includes(a.v.kind)) {
        const k = a.v.kind;
        if (k === 'list') return a.v.items.length === b.v.items.length && a.v.items.every((x, i) => this.javaEquals(x, b.v.items[i]));
        if (k === 'entry') return this.javaEquals(a.v.ent.k, b.v.ent.k) && this.javaEquals(a.v.ent.v, b.v.ent.v);
        return this.callOn(a, 'equals', [b], { target: { k: 'name', name: 'x' } }, 0).v;
      }
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
            if (c.kind === 'enum') {
              c.enumValues = [];
              c.enumConsts.forEach((ec, ordinal) => {
                const obj = this.alloc({ kind: 'obj', cls: c.name, fields: new Map(), enumName: ec.name, ordinal });
                this.initFields(obj, c.name);
                this.construct(c, obj, ec.args.map((a) => this.eval(a)), ec.line);
                c.enumValues.push({ t: 'ref', v: obj });
                this.statics.get(c.name).set(ec.name, { type: { name: c.name, dims: 0 }, value: { t: 'ref', v: obj }, final: true, access: 'public', decl: c.name, initDone: true });
              });
            }
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
      if (v.t === 'ref' && v.v.kind === 'lambda') {
        const c = this.cls(tn);
        return c ? (c.kind === 'interface' ? 2 : Infinity) : 4;
      }
      if (v.t === 'ref' && COLLECTION_TYPES[v.v.kind] && KNOWN_LIB_TYPES.has(tn)) return COLLECTION_TYPES[v.v.kind].includes(tn) ? 1 : Infinity;
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
        if (c.kind === 'enum') {
          const first = (c.enumConsts[0] || { name: 'VALORE' }).name;
          throw new CompileError(`gli enum (${clsName}) non possono essere istanziati con new: usa le costanti, es. ${clsName}.${first}`, line,
            `لا يمكن إنشاء كائن من enum باستخدام new؛ استخدم الثوابت المعرّفة فيه مثل ${clsName}.${first}`);
        }
        const obj = this.alloc({ kind: 'obj', cls: clsName, fields: new Map() });
        if (c.anon) obj.env = this.captureEnv();
        this.initFields(obj, clsName);
        if (this.isThrowable(clsName)) obj.trace = this.stackTraceLines();
        this.construct(c, obj, args, line);
        return { t: 'ref', v: obj };
      }
      return this.newLibObject(clsName, args, line);
    }

    captureEnv() {
      const f = this.top();
      return { scopes: f.scopes.slice(), self: f.self, cls: f.cls };
    }

    initFields(obj, clsName) {
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
    }

    newLibObject(clsName, args, line) {
      if (clsName in BUILTIN_EXC) {
        let msg = null;
        if (args[0]) {
          if (args[0].t === 'String') msg = args[0].v;
          else if (args[0].t === 'ref' && args[0].v.kind === 'obj' && this.isThrowable(args[0].v.cls)) msg = this.throwableToString(args[0].v);
          else if (args[0].t !== 'null') throw this.noMatch(null, clsName, args, line);
        }
        return { t: 'ref', v: this.makeThrowable(clsName, msg) };
      }
      const lib = this.newCollectionOrIo(clsName, args, line);
      if (lib) return lib;
      switch (clsName) {
        case 'ArrayList': case 'LinkedList': case 'Vector': case 'Stack': {
          const items = args[0] && args[0].t === 'ref' ? this.iterValues(args[0], line) : [];
          return { t: 'ref', v: this.alloc({ kind: 'list', cls: clsName, items, mod: 0 }) };
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
      if (UNSUPPORTED_JDK.has(clsName)) throw new Unsupported(`la classe ${clsName} della libreria Java`, line);
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
      } else if (args.length && !c.anon) {
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
          const supArgs = explicit ? explicit.args.map((x) => this.eval(x)) : (c.anon && !ctor ? args : []);
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
      this.lastInput = null;
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
        case 'yield': throw new YieldSig(this.eval(s.e));
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
      if (it.t === 'null') throw this.jthrow('NullPointerException', `Cannot iterate because "${exprStr(s.iter)}" is null`, s.line);
      const o = it.t === 'ref' ? it.v : null;
      const step = (v, i, n) => {
        this.tick(s.line);
        this.pushScope();
        try {
          const val = this.coerce(v, s.type, s.line);
          this.declare(s.name, s.type.name === 'var' ? this.inferType(val) : s.type, val, false, s.line);
          this.record(s.line, 'foreach', { name: s.name, v: val, i, n });
          try {
            this.execScoped(s.body);
          } catch (ex) {
            if (ex instanceof BreakSig && (!ex.label || ex.label === s.label)) return 'break';
            if (!(ex instanceof ContinueSig && (!ex.label || ex.label === s.label))) throw ex;
          }
        } finally { this.popScope(); }
        return null;
      };
      if (o && o.kind === 'list') {
        // Come l'Iterator di ArrayList: hasNext() = cursor != size, next() controlla le modifiche.
        const expected = o.mod || 0;
        let cursor = 0;
        while (cursor !== o.items.length) {
          if ((o.mod || 0) !== expected) throw this.jthrow('ConcurrentModificationException', null, s.line);
          if (cursor > o.items.length) break;
          const v = o.items[cursor++];
          if (step(v, cursor - 1, o.items.length) === 'break') break;
        }
      } else {
        const items = this.iterValues(it, s.line);
        const coll = o && o.kind === 'set' ? (o.view || o) : null;
        const expected = coll ? coll.mod : 0;
        for (let i = 0; i < items.length; i++) {
          if (coll && coll.mod !== expected) throw this.jthrow('ConcurrentModificationException', null, s.line);
          if (step(items[i], i, items.length) === 'break') break;
        }
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
          if (this.switchMatch(v, l)) { start = i; break; }
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
        if (s.resources) this.execResources(s);
        else this.execBlock(s.block.stmts);
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
        if (pending && !(pending instanceof JavaThrow || pending instanceof ReturnSig || pending instanceof BreakSig || pending instanceof ContinueSig || pending instanceof YieldSig)) throw pending;
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
        this.record(s.line, 'decl', { name: d.name, type, val, init: d.init, input: this.lastInput });
      }
    }
    isTypeUsable(t) {
      const n = t.name;
      if (PRIMS.has(n) || n === 'String' || n === 'var' || n === 'Object' || WRAP[n] || this.isRefTypeKnown(n)) return true;
      if (KNOWN_LIB_TYPES.has(n) || (this.typeParams && this.typeParams.has(n))) return true;
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
          else if (v.t === 'ref' && COLLECTION_TYPES[v.v.kind]) r = COLLECTION_TYPES[v.v.kind].includes(e.type.name) || e.type.name === 'Object';
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
        case 'lambda': return this.evalLambda(e);
        case 'mref': return this.evalMref(e);
        case 'switchexpr': return this.evalSwitchExpr(e);
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
      if ((a.t === 'null' && isNum(b)) || (b.t === 'null' && isNum(a))) {
        throw this.jthrow('NullPointerException', 'Cannot unbox a null value (unboxing di null)', line);
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
      if (cls === 'System' && name === 'in') return { t: 'stream', v: 'in' };
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
          !['toString', 'equals', 'hashCode', 'getClass', 'getMessage', 'printStackTrace'].includes(e.name) &&
          !(this.cls(st).kind === 'enum' && ['name', 'ordinal', 'compareTo', 'getDeclaringClass'].includes(e.name)) &&
          !this.chain(st).some((c) => c.impls.some((i) => !this.cls(i)))) {
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
      if (!m && f.self && f.self.env) {
        for (let env = f.self.env; env; env = env.self && env.self.env) {
          if (env.self) {
            const om = this.findMethod(env.self.cls, e.name, args);
            if (om) return this.invoke(om, om.mods.has('static') ? null : env.self, args, line);
          }
          if (env.cls) {
            const sm = this.findMethod(env.cls.name, e.name, args);
            if (sm && sm.mods.has('static')) return this.invoke(sm, null, args, line);
          }
        }
      }
      if (!m && f.self && ['getClass', 'toString', 'hashCode', 'equals', 'getMessage', 'printStackTrace', 'name', 'ordinal', 'compareTo'].includes(e.name)) {
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
        case 'stream':
          if (tv.v === 'in') throw new Unsupported('System.in usato direttamente: leggi l\'input con new Scanner(System.in)', line);
          return this.callStream(tv.v, name, args, line);
        case 'String': return this.callString(tv, name, args, line);
        case 'ref': {
          const o = tv.v;
          switch (o.kind) {
            case 'obj': return this.callObj(o, name, args, line);
            case 'list': {
              const r = this.callListExt(tv, name, args, line);
              return r !== undefined ? r : this.callList(o, name, args, line);
            }
            case 'map': return this.callMap(tv, name, args, line);
            case 'set': return this.callSet(tv, name, args, line);
            case 'lambda': return this.callLambdaObj(tv, name, args, line);
            case 'iter': return this.callIter(o, name, args, line);
            case 'entry': return this.callEntry(o, name, args, line);
            case 'scanner': return this.callScanner(o, name, args, line);
            case 'file': case 'path': return this.callFile(o, name, args, line);
            case 'reader': return this.callReader(o, name, args, line);
            case 'writer': return this.callWriter(o, name, args, line);
            case 'stream': return this.callStreamObj(o, name, args, line);
            case 'optional': return this.callOptional(o, name, args, line);
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
            const r = this.callPrim(tv, name, args, line);
            if (r) return r;
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
      if (o.enumName !== undefined) {
        switch (name) {
          case 'name': return this.str(o.enumName);
          case 'ordinal': return mk.int(o.ordinal);
          case 'compareTo': return mk.int(o.ordinal - args[0].v.ordinal);
          default: break;
        }
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
        case 'chars': return this.makeStream([...s].map((ch) => mk.int(ch.charCodeAt(0))), 'int');
        case 'lines': return this.makeStream(s.split('\n').map((x) => this.str(x)), null);
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
          if (args.length === 1) { o.items.push(args[0]); o.mod = (o.mod || 0) + 1; return mk.bool(true); }
          if (args.length === 2) {
            const i = this.intOf(args[0], line);
            if (i < 0 || i > n) throw ioobe(i);
            o.items.splice(i, 0, args[1]);
            o.mod = (o.mod || 0) + 1;
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
        case 'clear': immut(); o.items.length = 0; o.mod = (o.mod || 0) + 1; return VOID;
        case 'contains': return mk.bool(o.items.some((x) => this.javaEquals(x, args[0])));
        case 'indexOf': return mk.int(o.items.findIndex((x) => this.javaEquals(x, args[0])));
        case 'remove': {
          immut();
          if (args[0].t === 'int' && !args[0].boxed) {
            const i = args[0].v;
            if (i < 0 || i >= n) throw ioobe(i);
            o.mod = (o.mod || 0) + 1;
            return o.items.splice(i, 1)[0];
          }
          const i = o.items.findIndex((x) => this.javaEquals(x, args[0]));
          if (i >= 0) { o.items.splice(i, 1); o.mod = (o.mod || 0) + 1; }
          return mk.bool(i >= 0);
        }
        case 'toString': return this.str(this.objToString(o));
        case 'equals': return mk.bool(args[0].t === 'ref' && args[0].v.kind === 'list' && args[0].v.items.length === n && o.items.every((x, i) => this.javaEquals(x, args[0].v.items[i])));
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
      if (c && c.kind === 'enum' && (name === 'values' || name === 'valueOf') && !this.findMethod(cls, name, args)) {
        if (name === 'values') return { t: 'ref', v: this.alloc({ kind: 'array', elem: { name: cls, dims: 0 }, items: c.enumValues.slice() }) };
        const nm = args[0] && args[0].t === 'String' ? args[0].v : '';
        const f = c.enumValues.find((x) => x.v.enumName === nm);
        if (!f) throw this.jthrow('IllegalArgumentException', `No enum constant ${cls}.${nm}`, line);
        return f;
      }
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
      const lib = this.callLibStatic(cls, name, args, line);
      if (lib !== undefined) return lib;
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

    // ───────────────────────── Libreria standard simulata ─────────────────────────
    // Collezioni (con l'ordine di iterazione reale di HashMap/HashSet), lambda, stream,
    // Scanner con input simulato e file system virtuale.

    native(fn, arity, label) {
      return { t: 'ref', v: { kind: 'lambda', native: fn, arity, label: label || 'λ', addr: '' } };
    }

    hashOf(v) {
      switch (v.t) {
        case 'null': return 0;
        case 'String': return javaStringHash(v.v);
        case 'int': case 'char': return v.v | 0;
        case 'long': return (Math.floor(v.v / 4294967296) ^ (v.v >>> 0)) | 0;
        case 'boolean': return v.v ? 1231 : 1237;
        case 'double': {
          const dv = new DataView(new ArrayBuffer(8));
          dv.setFloat64(0, v.v);
          return (dv.getInt32(0) ^ dv.getInt32(4)) | 0;
        }
        case 'ref': {
          const o = v.v;
          if (o.kind === 'obj' && o.enumName === undefined) {
            const m = this.findMethod(o.cls, 'hashCode', []);
            if (m) return this.invoke(m, o, [], 0).v | 0;
          }
          if (o.kind === 'list') return o.items.reduce((h, x) => (Math.imul(31, h) + this.hashOf(x)) | 0, 1);
          if (o.kind === 'set') return o.entries.reduce((h, e) => (h + e.h) | 0, 0);
          if (o.kind === 'entry') return this.hashOf(o.ent.k) ^ this.hashOf(o.ent.v);
          return parseInt(this.hashHex(o) || '1b6d', 16) | 0;
        }
        default: return 0;
      }
    }

    newMap(cls, order, cmp) {
      return this.alloc({ kind: 'map', cls, order, entries: [], seq: 0, cap: 16, mod: 0, cmp: cmp || null });
    }

    newSet(cls, order, cmp) {
      return this.alloc({ kind: 'set', cls, order, entries: [], seq: 0, cap: 16, mod: 0, cmp: cmp || null });
    }

    mapIndex(m, k, line) {
      if (m.order === 'tree') {
        if (k.t === 'null') throw this.jthrow('NullPointerException', null, line);
        return m.entries.findIndex((e) => this.compareValues(e.k, k, m.cmp, line) === 0);
      }
      const h = this.hashOf(k);
      return m.entries.findIndex((e) => e.h === h && (e.k.t === 'null' ? k.t === 'null' : this.javaEquals(e.k, k)));
    }

    /** head = true per computeIfAbsent/compute/merge: in Java il nuovo nodo va in testa al bucket. */
    mapPut(m, k, v, line, head) {
      const i = this.mapIndex(m, k, line);
      if (i >= 0) {
        const old = m.entries[i].v;
        m.entries[i].v = v;
        return old;
      }
      if (m.order === 'tree') this.compareValues(k, k, m.cmp, line);
      m.entries.push({ k, v, h: this.hashOf(k), seq: head ? (m.headSeq = (m.headSeq || 0) - 1) : m.seq++ });
      m.mod++;
      while (m.entries.length > m.cap * 0.75) m.cap *= 2;
      if (m.entries.length > 100000) throw new LimitError('collezione troppo grande per il simulatore', line);
      return NULL;
    }

    mapRemove(m, k, line) {
      const i = this.mapIndex(m, k, line);
      if (i < 0) return null;
      m.mod++;
      return m.entries.splice(i, 1)[0];
    }

    /** Ordine di iterazione come in Java: HashMap per bucket, LinkedHashMap per inserimento, TreeMap ordinato. */
    mapOrdered(m, line) {
      if (m.order === 'linked') return m.entries.slice();
      if (m.order === 'tree') return m.entries.slice().sort((a, b) => this.compareValues(a.k, b.k, m.cmp, line));
      const mask = m.cap - 1;
      const bucket = (h) => (h ^ (h >>> 16)) & mask;
      return m.entries.slice().sort((a, b) => bucket(a.h) - bucket(b.h) || a.seq - b.seq);
    }

    iterValues(v, line) {
      if (v.t === 'null') throw this.jthrow('NullPointerException', null, line);
      if (v.t === 'ref') {
        const o = v.v;
        if (o.kind === 'array' || o.kind === 'list') return o.items.slice();
        if (o.kind === 'set') return this.mapOrdered(o, line).map((e) => e.k);
        if (o.kind === 'map') {
          throw new CompileError('il for-each non si applica direttamente a una Map: usa keySet(), values() oppure entrySet()', line,
            'لا يمكن المرور على Map مباشرة بحلقة for-each؛ استخدم keySet() أو values() أو entrySet()');
        }
      }
      throw new CompileError('il for-each richiede un array o una collezione', line, 'حلقة for-each تحتاج إلى مصفوفة أو مجموعة (Collection)');
    }

    compareValues(a, b, cmp, line) {
      if (cmp && cmp.t !== 'null') return this.intOf(this.callFn(cmp, [a, b], line, 'compare'), line);
      if (a.t === 'null' || b.t === 'null') throw this.jthrow('NullPointerException', null, line);
      if (a.t === 'String' && b.t === 'String') return this.callString(a, 'compareTo', [b], line).v;
      if (isNum(a) && isNum(b)) return a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
      if (a.t === 'boolean' && b.t === 'boolean') return (a.v ? 1 : 0) - (b.v ? 1 : 0);
      if (a.t === 'ref' && a.v.kind === 'obj') {
        if (a.v.enumName !== undefined && b.t === 'ref' && b.v.enumName !== undefined) return a.v.ordinal - b.v.ordinal;
        const m = this.findMethod(a.v.cls, 'compareTo', [b]);
        if (m) return this.intOf(this.invoke(m, a.v, [b], line), line);
      }
      throw this.jthrow('ClassCastException', `class ${this.qualName(this.typeOfVal(a))} cannot be cast to class java.lang.Comparable`, line);
    }

    sortValues(items, cmp, line) {
      return items.sort((x, y) => this.compareValues(x, y, cmp, line));
    }

    // ── Lambda e riferimenti a metodo ──
    evalLambda(e) {
      return { t: 'ref', v: this.alloc({ kind: 'lambda', params: e.params, expr: e.expr, block: e.block, env: this.captureEnv(), line: e.line, label: `(${e.params.join(', ')}) -> …` }) };
    }

    evalMref(e) {
      const line = e.line, name = e.name, t = e.target;
      const f = this.top();
      const isClass = t.k === 'name' && !this.findVar(t.name) && !(f.self && f.self.fields.has(t.name)) &&
        (this.classes.has(t.name) || STATIC_CLASSES.has(t.name) || KNOWN_LIB_TYPES.has(t.name) || t.name in BUILTIN_EXC);
      const label = exprStr(t) + '::' + name;
      // Tipo annidato di libreria (Map.Entry::getKey): riferimento a metodo d'istanza non legato
      if (t.k === 'field' && t.target.k === 'name' && t.target.name === 'Map' && t.name === 'Entry' && !this.findVar('Map')) {
        return this.native((args) => {
          if (!args.length) throw this.noMatch('Map.Entry', name, args, line);
          return this.callOn(args[0], name, args.slice(1), { target: { k: 'name', name: 'x' } }, line);
        }, -1, label);
      }
      if (isClass) {
        const cls = t.name;
        if (name === 'new') return this.native((args) => this.newObject(cls, args, line), -1, label);
        const STATIC_REFS = { Integer: ['parseInt', 'valueOf', 'compare', 'sum', 'max', 'min', 'toString', 'toBinaryString'], Double: ['parseDouble', 'valueOf', 'compare', 'sum', 'max', 'min'],
          String: ['valueOf', 'join', 'format'], Character: '*', Math: '*', Objects: '*', Arrays: '*', Collections: '*', Boolean: ['parseBoolean'], Long: ['parseLong', 'compare', 'sum'] };
        return this.native((args) => {
          const user = this.cls(cls);
          if (user) {
            const sm = this.findMethod(cls, name, args);
            if (sm && sm.mods.has('static')) return this.invoke(sm, null, args, line);
          } else if (STATIC_REFS[cls] && (STATIC_REFS[cls] === '*' || STATIC_REFS[cls].includes(name))) {
            return this.callStatic(cls, name, args, line);
          }
          if (!args.length) throw this.noMatch(cls, name, args, line);
          return this.callOn(args[0], name, args.slice(1), { target: { k: 'name', name: 'x' } }, line);
        }, -1, label);
      }
      const tv = this.eval(t);
      if (tv.t === 'null') throw this.jthrow('NullPointerException', null, line);
      return this.native((args) => this.callOn(tv, name, args, { target: t }, line), -1, label);
    }

    callFn(f, args, line, hint) {
      if (!f || f.t === 'null') throw this.jthrow('NullPointerException', null, line);
      if (f.t !== 'ref') throw new CompileError('è richiesta una funzione (lambda) ma è stato trovato ' + this.typeOfVal(f), line, 'كان متوقعاً تعبير lambda أو دالة');
      const o = f.v;
      if (o.kind === 'lambda') {
        if (o.native) return o.native(args, line);
        if (args.length !== o.params.length) {
          throw new CompileError(`la lambda si aspetta ${o.params.length} parametri ma ne riceve ${args.length}`, line, `تعبير lambda يتوقع ${o.params.length} معاملات لكنه تلقى ${args.length}`);
        }
        const fr = this.pushFrame(`lambda ${o.label}`, o.env.cls, o.env.self, o.line);
        fr.traceName = 'lambda$' + (o.env.cls ? o.env.cls.name : 'main');
        fr.scopes = o.env.scopes.concat([new Map()]);
        fr.capturedDepth = o.env.scopes.length;
        const own = fr.scopes[fr.scopes.length - 1];
        o.params.forEach((p, i) => own.set(p, { type: this.inferType(args[i]), value: args[i], final: false, assigned: true }));
        try {
          this.record(o.line, 'lambdacall', { params: o.params, args });
          if (o.expr) return this.eval(o.expr);
          try {
            this.execStmts(o.block.stmts);
          } catch (ex) {
            if (ex instanceof ReturnSig) return ex.value;
            throw ex;
          }
          return VOID;
        } finally {
          this.popFrame();
        }
      }
      if (o.kind === 'obj') {
        let m = hint ? this.findMethod(o.cls, hint, args) : null;
        if (!m) {
          for (const c of this.chain(o.cls)) {
            for (const mm of c.methods) {
              if (!m && mm.body && !mm.mods.has('static') && mm.params.length === args.length && !['toString', 'equals', 'hashCode'].includes(mm.name)) m = mm;
            }
          }
        }
        if (m) return this.invoke(m, o, args, line);
      }
      throw new CompileError(`${this.typeOfVal(f)} non è un'interfaccia funzionale utilizzabile qui`, line, 'هذا الكائن ليس واجهة وظيفية (functional interface)');
    }

    fnArity(f) {
      if (!f || f.t !== 'ref') return -1;
      const o = f.v;
      if (o.kind === 'lambda') return o.native ? o.arity : o.params.length;
      return -1;
    }

    keyComparator(keyFn, keyCmp, line) {
      return this.native((a) => mk.int(this.compareValues(this.callFn(keyFn, [a[0]], line, 'apply'), this.callFn(keyFn, [a[1]], line, 'apply'), keyCmp, line)), 2, 'Comparator.comparing');
    }

    callLambdaObj(fv, name, args, line) {
      const self = fv;
      switch (name) {
        case 'reversed': return this.native((a) => mk.int(-this.compareValues(a[0], a[1], self, line)), 2, 'reversed');
        case 'thenComparing': case 'thenComparingInt': case 'thenComparingDouble': case 'thenComparingLong': {
          const next = this.fnArity(args[0]) === 2 && name === 'thenComparing' && args.length === 1 ? args[0] : this.keyComparator(args[0], args[1] || null, line);
          return this.native((a) => {
            const r = this.compareValues(a[0], a[1], self, line);
            return mk.int(r !== 0 ? r : this.compareValues(a[0], a[1], next, line));
          }, 2, 'thenComparing');
        }
        case 'negate': return this.native((a) => mk.bool(!this.bool(this.callFn(self, a, line, 'test'), line)), 1, 'negate');
        case 'and': return this.native((a) => mk.bool(this.bool(this.callFn(self, a, line, 'test'), line) && this.bool(this.callFn(args[0], a, line, 'test'), line)), 1, 'and');
        case 'or': return this.native((a) => mk.bool(this.bool(this.callFn(self, a, line, 'test'), line) || this.bool(this.callFn(args[0], a, line, 'test'), line)), 1, 'or');
        case 'andThen': return this.native((a) => {
          const r = this.callFn(self, a, line);
          return r.t === 'void' ? this.callFn(args[0], a, line) : this.callFn(args[0], [r], line);
        }, 1, 'andThen');
        case 'compose': return this.native((a) => this.callFn(self, [this.callFn(args[0], a, line)], line), 1, 'compose');
        case 'equals': return mk.bool(args[0].t === 'ref' && args[0].v === fv.v);
        case 'hashCode': return mk.int(parseInt(this.hashHex(fv.v) || '1', 16));
        case 'toString': return this.str(this.toStr(fv));
        default: return this.callFn(fv, args, line, name);
      }
    }

    // ── Creazione di oggetti della libreria ──
    tableSizeFor(n) {
      let c = 1;
      while (c < n) c *= 2;
      return Math.max(1, c);
    }

    fsName(v, line) {
      if (v.t === 'String') return v.v;
      if (v.t === 'ref' && (v.v.kind === 'file' || v.v.kind === 'path')) return v.v.name;
      if (v.t === 'null') throw this.jthrow('NullPointerException', null, line);
      throw new CompileError('è richiesto un nome di file (String) o un oggetto File', line, 'المطلوب اسم ملف (String) أو كائن File');
    }

    newCollectionOrIo(clsName, args, line) {
      const a0 = args[0];
      if (MAP_CLASSES[clsName]) {
        const cmp = clsName === 'TreeMap' && a0 && a0.t === 'ref' && a0.v.kind !== 'map' ? a0 : null;
        const m = this.newMap(clsName, MAP_CLASSES[clsName], cmp);
        if (a0 && (a0.t === 'int') && MAP_CLASSES[clsName] === 'hash') m.cap = this.tableSizeFor(a0.v);
        if (a0 && a0.t === 'ref' && a0.v.kind === 'map') for (const e of this.mapOrdered(a0.v, line)) this.mapPut(m, e.k, e.v, line);
        return { t: 'ref', v: m };
      }
      if (SET_CLASSES[clsName]) {
        const cmp = clsName === 'TreeSet' && a0 && a0.t === 'ref' && a0.v.kind === 'lambda' ? a0 : null;
        const st = this.newSet(clsName, SET_CLASSES[clsName], cmp);
        if (a0 && a0.t === 'int' && SET_CLASSES[clsName] === 'hash') st.cap = this.tableSizeFor(a0.v);
        if (a0 && a0.t === 'ref' && !cmp && a0.v.kind !== 'lambda') {
          if (SET_CLASSES[clsName] === 'hash') st.cap = Math.max(this.tableSizeFor(Math.floor(this.iterValues(a0, line).length / 0.75) + 1), 16);
          for (const x of this.iterValues(a0, line)) this.mapPut(st, x, mk.bool(true), line);
        }
        return { t: 'ref', v: st };
      }
      switch (clsName) {
        case 'Scanner': {
          if (!a0) throw this.noMatch('Scanner', '<init>', args, line);
          let src;
          if (a0.t === 'stream' && a0.v === 'in') src = this.stdin;
          else if (a0.t === 'String') src = { text: a0.v, pos: 0 };
          else if (a0.t === 'ref' && a0.v.kind === 'file') {
            if (!this.fs.has(a0.v.name)) throw this.jthrow('FileNotFoundException', `${a0.v.name} (No such file or directory)`, line);
            src = { text: this.fs.get(a0.v.name), pos: 0 };
          } else if (a0.t === 'ref' && a0.v.kind === 'reader') {
            const r = a0.v.inner || a0.v;
            src = { text: r.text.slice(r.pos), pos: 0 };
          } else throw this.noMatch('Scanner', '<init>', args, line);
          return { t: 'ref', v: this.alloc({ kind: 'scanner', src, closed: false }) };
        }
        case 'File': return { t: 'ref', v: this.alloc({ kind: 'file', name: this.fsName(a0, line) }) };
        case 'FileReader': {
          const name = this.fsName(a0, line);
          if (!this.fs.has(name)) throw this.jthrow('FileNotFoundException', `${name} (No such file or directory)`, line);
          return { t: 'ref', v: this.alloc({ kind: 'reader', cls: 'FileReader', name, text: this.fs.get(name), pos: 0, closed: false }) };
        }
        case 'BufferedReader': {
          if (!(a0 && a0.t === 'ref' && a0.v.kind === 'reader')) throw this.noMatch('BufferedReader', '<init>', args, line);
          return { t: 'ref', v: this.alloc({ kind: 'reader', cls: 'BufferedReader', name: a0.v.name, inner: a0.v.inner || a0.v }) };
        }
        case 'FileWriter': {
          const name = this.fsName(a0, line);
          const append = args[1] && args[1].t === 'boolean' && args[1].v;
          this.fs.set(name, append ? (this.fs.get(name) || '') : '');
          return { t: 'ref', v: this.alloc({ kind: 'writer', cls: 'FileWriter', name, pending: '', closed: false }) };
        }
        case 'PrintWriter': case 'BufferedWriter': {
          if (a0 && a0.t === 'ref' && a0.v.kind === 'writer') {
            return { t: 'ref', v: this.alloc({ kind: 'writer', cls: clsName, name: a0.v.name, inner: a0.v.inner || a0.v }) };
          }
          if (a0 && a0.t === 'stream') return a0;
          const name = this.fsName(a0, line);
          this.fs.set(name, '');
          return { t: 'ref', v: this.alloc({ kind: 'writer', cls: clsName, name, pending: '', closed: false }) };
        }
        default: return null;
      }
    }

    // ── Liste ──
    callListExt(lv, name, args, line) {
      const o = lv.v;
      const bump = () => { o.mod = (o.mod || 0) + 1; };
      const immut = () => { if (o.immutable) throw this.jthrow('UnsupportedOperationException', null, line); };
      switch (name) {
        case 'forEach': {
          const mc = o.mod;
          for (const x of o.items.slice()) {
            this.callFn(args[0], [x], line, 'accept');
            if (o.mod !== mc) throw this.jthrow('ConcurrentModificationException', null, line);
          }
          return VOID;
        }
        case 'removeIf': {
          immut();
          const keep = o.items.filter((x) => !this.bool(this.callFn(args[0], [x], line, 'test'), line));
          const removed = keep.length !== o.items.length;
          if (removed) { o.items = keep; bump(); }
          return mk.bool(removed);
        }
        case 'replaceAll': immut(); o.items = o.items.map((x) => this.callFn(args[0], [x], line, 'apply')); return VOID;
        case 'sort': immut(); this.sortValues(o.items, args[0] || null, line); bump(); return VOID;
        case 'stream': return this.makeStream(o.items.slice(), null);
        case 'iterator': case 'listIterator': return { t: 'ref', v: this.alloc({ kind: 'iter', list: o, cursor: 0, last: -1, mc: o.mod || 0 }) };
        case 'addAll': {
          immut();
          const idx = args.length === 2 ? this.intOf(args[0], line) : o.items.length;
          const add = this.iterValues(args[args.length - 1], line);
          o.items.splice(idx, 0, ...add);
          bump();
          return mk.bool(add.length > 0);
        }
        case 'containsAll': return mk.bool(this.iterValues(args[0], line).every((x) => o.items.some((y) => this.javaEquals(y, x))));
        case 'removeAll': case 'retainAll': {
          immut();
          const other = this.iterValues(args[0], line);
          const keep = o.items.filter((x) => other.some((y) => this.javaEquals(x, y)) === (name === 'retainAll'));
          const changed = keep.length !== o.items.length;
          if (changed) { o.items = keep; bump(); }
          return mk.bool(changed);
        }
        case 'subList': {
          const a = this.intOf(args[0], line), b = this.intOf(args[1], line);
          if (a < 0 || b > o.items.length || a > b) throw this.jthrow('IndexOutOfBoundsException', `fromIndex: ${a}, toIndex: ${b}, size: ${o.items.length}`, line);
          return { t: 'ref', v: this.alloc({ kind: 'list', cls: 'ArrayList', items: o.items.slice(a, b), mod: 0 }) };
        }
        case 'toArray': return { t: 'ref', v: this.alloc({ kind: 'array', elem: { name: 'Object', dims: 0 }, items: o.items.slice() }) };
        case 'lastIndexOf': {
          for (let i = o.items.length - 1; i >= 0; i--) if (this.javaEquals(o.items[i], args[0])) return mk.int(i);
          return mk.int(-1);
        }
        case 'hashCode': return mk.int(this.hashOf(lv));
        case 'push': case 'addLast': case 'offer': case 'offerLast': immut(); o.items.push(args[0]); bump(); return name === 'push' ? args[0] : name === 'addLast' ? VOID : mk.bool(true);
        case 'addFirst': case 'offerFirst': immut(); o.items.unshift(args[0]); bump(); return name === 'addFirst' ? VOID : mk.bool(true);
        case 'pop': case 'removeLast': case 'pollLast': {
          if (!o.items.length) {
            if (name === 'pollLast') return NULL;
            throw this.jthrow(name === 'pop' ? 'EmptyStackException' : 'NoSuchElementException', null, line);
          }
          bump();
          return o.items.pop();
        }
        case 'removeFirst': case 'poll': case 'pollFirst': {
          if (!o.items.length) { if (name !== 'removeFirst') return NULL; throw this.jthrow('NoSuchElementException', null, line); }
          bump();
          return o.items.shift();
        }
        case 'peek': case 'peekLast': if (!o.items.length) return NULL; return name === 'peek' && o.cls !== 'Stack' ? o.items[0] : o.items[o.items.length - 1];
        case 'peekFirst': return o.items.length ? o.items[0] : NULL;
        case 'getFirst': case 'element': if (!o.items.length) throw this.jthrow('NoSuchElementException', null, line); return o.items[0];
        case 'getLast': if (!o.items.length) throw this.jthrow('NoSuchElementException', null, line); return o.items[o.items.length - 1];
        case 'empty': return mk.bool(o.items.length === 0);
        default: return undefined;
      }
    }

    callIter(o, name, args, line) {
      if (o.list) {
        const l = o.list;
        switch (name) {
          case 'hasNext': return mk.bool(o.cursor !== l.items.length);
          case 'next':
            if ((l.mod || 0) !== o.mc) throw this.jthrow('ConcurrentModificationException', null, line);
            if (o.cursor >= l.items.length) throw this.jthrow('NoSuchElementException', null, line);
            o.last = o.cursor;
            return l.items[o.cursor++];
          case 'remove':
            if (o.last < 0) throw this.jthrow('IllegalStateException', null, line);
            if ((l.mod || 0) !== o.mc) throw this.jthrow('ConcurrentModificationException', null, line);
            l.items.splice(o.last, 1);
            o.cursor = o.last;
            o.last = -1;
            l.mod = (l.mod || 0) + 1;
            o.mc = l.mod;
            return VOID;
          default: break;
        }
      } else {
        switch (name) {
          case 'hasNext': return mk.bool(o.i < o.keys.length);
          case 'next':
            if (o.coll.mod !== o.mc) throw this.jthrow('ConcurrentModificationException', null, line);
            if (o.i >= o.keys.length) throw this.jthrow('NoSuchElementException', null, line);
            o.lastKey = o.keys[o.i];
            return o.vals[o.i++];
          case 'remove':
            if (o.lastKey === undefined) throw this.jthrow('IllegalStateException', null, line);
            this.mapRemove(o.coll, o.lastKey, line);
            o.lastKey = undefined;
            o.mc = o.coll.mod;
            return VOID;
          default: break;
        }
      }
      throw this.noMatch('Iterator', name, args, line);
    }

    // ── Mappe e insiemi ──
    entryRef(m, e) {
      return { t: 'ref', v: { kind: 'entry', ent: e, map: m, addr: '' } };
    }

    viewSet(m, kind, line) {
      const ord = this.mapOrdered(m, line);
      const view = { kind: 'set', cls: kind, order: 'linked', entries: [], seq: 0, cap: 16, mod: m.mod, view: m, addr: '' };
      ord.forEach((e, i) => {
        const k = kind === 'EntrySet' ? this.entryRef(m, e) : e.k;
        view.entries.push({ k, v: NULL, h: kind === 'EntrySet' ? 0 : e.h, seq: i });
      });
      view.seq = ord.length;
      return { t: 'ref', v: view };
    }

    callMap(mv, name, args, line) {
      const m = mv.v;
      const immut = () => { if (m.immutable) throw this.jthrow('UnsupportedOperationException', null, line); };
      const val = (k) => { const i = this.mapIndex(m, k, line); return i >= 0 ? m.entries[i].v : null; };
      switch (name) {
        case 'put': immut(); return this.mapPut(m, args[0], args[1], line);
        case 'get': { const v = val(args[0]); return v || NULL; }
        case 'getOrDefault': { const v = val(args[0]); return v || args[1]; }
        case 'containsKey': return mk.bool(this.mapIndex(m, args[0], line) >= 0);
        case 'containsValue': return mk.bool(m.entries.some((e) => this.javaEquals(e.v, args[0]) || (e.v.t === 'null' && args[0].t === 'null')));
        case 'remove': { immut(); const e = this.mapRemove(m, args[0], line); return e ? e.v : NULL; }
        case 'size': return mk.int(m.entries.length);
        case 'isEmpty': return mk.bool(m.entries.length === 0);
        case 'clear': immut(); if (m.entries.length) m.mod++; m.entries = []; return VOID;
        case 'keySet': case 'navigableKeySet': return this.viewSet(m, 'KeySet', line);
        case 'entrySet': return this.viewSet(m, 'EntrySet', line);
        case 'values': return { t: 'ref', v: { kind: 'list', cls: 'Values', items: this.mapOrdered(m, line).map((e) => e.v), mod: 0, addr: '' } };
        case 'putIfAbsent': { immut(); const v = val(args[0]); if (v && v.t !== 'null') return v; this.mapPut(m, args[0], args[1], line); return NULL; }
        case 'computeIfAbsent': {
          immut();
          const v = val(args[0]);
          if (v && v.t !== 'null') return v;
          const nv = this.callFn(args[1], [args[0]], line, 'apply');
          if (nv.t !== 'null') this.mapPut(m, args[0], nv, line, true);
          return nv;
        }
        case 'computeIfPresent': case 'compute': {
          immut();
          const v = val(args[0]);
          if (name === 'computeIfPresent' && (!v || v.t === 'null')) return NULL;
          const nv = this.callFn(args[1], [args[0], v || NULL], line, 'apply');
          if (nv.t === 'null') this.mapRemove(m, args[0], line); else this.mapPut(m, args[0], nv, line, true);
          return nv;
        }
        case 'merge': {
          immut();
          const v = val(args[0]);
          const nv = !v || v.t === 'null' ? args[1] : this.callFn(args[2], [v, args[1]], line, 'apply');
          if (nv.t === 'null') this.mapRemove(m, args[0], line); else this.mapPut(m, args[0], nv, line, true);
          return nv;
        }
        case 'putAll': immut(); for (const e of this.mapOrdered(args[0].v, line)) this.mapPut(m, e.k, e.v, line); return VOID;
        case 'forEach': {
          const mc = m.mod;
          for (const e of this.mapOrdered(m, line)) {
            this.callFn(args[0], [e.k, e.v], line, 'accept');
            if (m.mod !== mc) throw this.jthrow('ConcurrentModificationException', null, line);
          }
          return VOID;
        }
        case 'replaceAll': for (const e of m.entries) e.v = this.callFn(args[0], [e.k, e.v], line, 'apply'); return VOID;
        case 'firstKey': case 'lastKey': {
          const ord = this.mapOrdered(m, line);
          if (!ord.length) throw this.jthrow('NoSuchElementException', null, line);
          return name === 'firstKey' ? ord[0].k : ord[ord.length - 1].k;
        }
        case 'equals': {
          const o = args[0].t === 'ref' ? args[0].v : null;
          return mk.bool(!!o && o.kind === 'map' && o.entries.length === m.entries.length &&
            m.entries.every((e) => { const i = this.mapIndex(o, e.k, line); return i >= 0 && this.javaEquals(e.v, o.entries[i].v); }));
        }
        case 'hashCode': return mk.int(m.entries.reduce((h, e) => (h + (e.h ^ this.hashOf(e.v))) | 0, 0));
        case 'toString': return this.str(this.toStr(mv));
        default: throw this.noMatch(m.cls, name, args, line);
      }
    }

    callSet(sv, name, args, line) {
      const st = sv.v;
      const src = st.view || st;
      const immut = () => { if (st.immutable || st.view) throw this.jthrow('UnsupportedOperationException', null, line); };
      const has = (x) => this.mapIndex(st, x, line) >= 0;
      switch (name) {
        case 'add': { immut(); if (has(args[0])) return mk.bool(false); this.mapPut(st, args[0], mk.bool(true), line); return mk.bool(true); }
        case 'contains': return mk.bool(st.kind === 'set' && st.cls === 'EntrySet' ? st.entries.some((e) => this.javaEquals(e.k, args[0])) : has(args[0]));
        case 'remove': {
          if (st.view && st.cls === 'KeySet') { const e = this.mapRemove(st.view, args[0], line); this.mapRemove(st, args[0], line); return mk.bool(!!e); }
          immut();
          return mk.bool(!!this.mapRemove(st, args[0], line));
        }
        case 'size': return mk.int(st.entries.length);
        case 'isEmpty': return mk.bool(st.entries.length === 0);
        case 'clear': immut(); if (st.entries.length) st.mod++; st.entries = []; return VOID;
        case 'addAll': { immut(); let ch = false; for (const x of this.iterValues(args[0], line)) if (!has(x)) { this.mapPut(st, x, mk.bool(true), line); ch = true; } return mk.bool(ch); }
        case 'containsAll': return mk.bool(this.iterValues(args[0], line).every((x) => has(x)));
        case 'removeAll': case 'retainAll': {
          immut();
          const other = this.iterValues(args[0], line);
          let ch = false;
          for (const e of st.entries.slice()) {
            const inOther = other.some((y) => this.javaEquals(e.k, y));
            if (inOther === (name === 'removeAll')) { this.mapRemove(st, e.k, line); ch = true; }
          }
          return mk.bool(ch);
        }
        case 'removeIf': {
          immut();
          let ch = false;
          for (const e of this.mapOrdered(st, line)) if (this.bool(this.callFn(args[0], [e.k], line, 'test'), line)) { this.mapRemove(st, e.k, line); ch = true; }
          return mk.bool(ch);
        }
        case 'iterator': {
          const ord = this.mapOrdered(st, line);
          const coll = st.view || st;
          return { t: 'ref', v: this.alloc({ kind: 'iter', coll, keys: ord.map((e) => (st.cls === 'EntrySet' ? e.k.v.ent.k : e.k)), vals: ord.map((e) => e.k), i: 0, mc: coll.mod }) };
        }
        case 'forEach': for (const x of this.iterValues(sv, line)) this.callFn(args[0], [x], line, 'accept'); return VOID;
        case 'stream': return this.makeStream(this.iterValues(sv, line), null);
        case 'first': case 'last': {
          const ord = this.mapOrdered(st, line);
          if (!ord.length) throw this.jthrow('NoSuchElementException', null, line);
          return name === 'first' ? ord[0].k : ord[ord.length - 1].k;
        }
        case 'pollFirst': { const ord = this.mapOrdered(st, line); if (!ord.length) return NULL; this.mapRemove(st, ord[0].k, line); return ord[0].k; }
        case 'equals': {
          const o = args[0].t === 'ref' ? args[0].v : null;
          return mk.bool(!!o && o.kind === 'set' && o.entries.length === st.entries.length && st.entries.every((e) => this.mapIndex(o, e.k, line) >= 0));
        }
        case 'hashCode': return mk.int(this.hashOf(sv));
        case 'toArray': return { t: 'ref', v: this.alloc({ kind: 'array', elem: { name: 'Object', dims: 0 }, items: this.iterValues(sv, line) }) };
        case 'toString': return this.str(this.toStr(sv));
        default: void src; throw this.noMatch(st.cls, name, args, line);
      }
    }

    callEntry(o, name, args, line) {
      switch (name) {
        case 'getKey': return o.ent.k;
        case 'getValue': return o.ent.v;
        case 'setValue': { const old = o.ent.v; o.ent.v = args[0]; return old; }
        case 'toString': return this.str(this.toStr({ t: 'ref', v: o }));
        case 'equals': return mk.bool(args[0].t === 'ref' && args[0].v.kind === 'entry' && this.javaEquals(o.ent.k, args[0].v.ent.k) && this.javaEquals(o.ent.v, args[0].v.ent.v));
        case 'hashCode': return mk.int(this.hashOf(o.ent.k) ^ this.hashOf(o.ent.v));
        default: throw this.noMatch('Map.Entry', name, args, line);
      }
    }

    // ── Stream ──
    makeStream(items, prim) {
      return { t: 'ref', v: { kind: 'stream', src: items, ops: [], prim: prim || null, used: false, addr: '' } };
    }

    pipeStream(vals, ops, sink, line) {
      const st = ops.map(() => ({ n: 0, seen: [] }));
      outer:
      for (const v of vals) {
        let x = v;
        let stopAfter = false;
        for (let j = 0; j < ops.length; j++) {
          const op = ops[j], s = st[j];
          this.tick(line);
          switch (op.k) {
            case 'filter': if (!this.bool(this.callFn(op.f, [x], line, 'test'), line)) continue outer; break;
            case 'map':
              x = this.callFn(op.f, [x], line, 'apply');
              if (op.to) x = op.to === 'int' ? mk.int(this.intOf(x, line)) : op.to === 'double' ? mk.double(x.v) : op.to === 'long' ? mk.long(x.v) : x;
              break;
            case 'peek': this.callFn(op.f, [x], line, 'accept'); break;
            case 'distinct':
              if (s.seen.some((y) => this.javaEquals(y, x))) continue outer;
              s.seen.push(x);
              break;
            case 'skip': if (s.n < op.n) { s.n++; continue outer; } break;
            case 'limit':
              if (s.n >= op.n) break outer;
              s.n++;
              if (s.n >= op.n) stopAfter = true;
              break;
            default: break;
          }
        }
        if (sink(x)) break;
        if (stopAfter) break;
      }
    }

    runStream(o, sink, line) {
      if (o.used) throw this.jthrow('IllegalStateException', 'stream has already been operated upon or closed', line);
      o.used = true;
      const go = (vals, ops) => {
        const i = ops.findIndex((op) => op.k === 'sorted');
        if (i < 0) { this.pipeStream(vals, ops, sink, line); return; }
        const buf = [];
        this.pipeStream(vals, ops.slice(0, i), (x) => { buf.push(x); return false; }, line);
        this.sortValues(buf, ops[i].cmp, line);
        go(buf, ops.slice(i + 1));
      };
      go(o.src, o.ops);
    }

    collectStream(o, line) {
      const out = [];
      this.runStream(o, (x) => { out.push(x); return false; }, line);
      return out;
    }

    optional(val, prim) {
      return { t: 'ref', v: { kind: 'optional', val: val || null, prim: prim || null, addr: '' } };
    }

    callStreamObj(o, name, args, line) {
      const next = (op, prim) => {
        if (o.used) throw this.jthrow('IllegalStateException', 'stream has already been operated upon or closed', line);
        o.used = true;
        return { t: 'ref', v: { kind: 'stream', src: o.src, ops: o.ops.concat([op]), prim: prim === undefined ? o.prim : prim, used: false, addr: '' } };
      };
      const num = (x) => (o.prim === 'double' ? mk.double(x) : o.prim === 'long' ? mk.long(x) : mk.int(x));
      switch (name) {
        case 'filter': return next({ k: 'filter', f: args[0] });
        case 'map': return next({ k: 'map', f: args[0], to: o.prim });
        case 'mapToInt': return next({ k: 'map', f: args[0], to: 'int' }, 'int');
        case 'mapToDouble': return next({ k: 'map', f: args[0], to: 'double' }, 'double');
        case 'mapToLong': return next({ k: 'map', f: args[0], to: 'long' }, 'long');
        case 'mapToObj': return next({ k: 'map', f: args[0] }, null);
        case 'asDoubleStream': return next({ k: 'map', f: this.native((a) => mk.double(a[0].v), 1), to: 'double' }, 'double');
        case 'boxed': return next({ k: 'peek', f: this.native(() => VOID, 1) }, null);
        case 'peek': return next({ k: 'peek', f: args[0] });
        case 'sorted': return next({ k: 'sorted', cmp: args[0] || null });
        case 'distinct': return next({ k: 'distinct' });
        case 'limit': return next({ k: 'limit', n: Number(args[0].v) });
        case 'skip': return next({ k: 'skip', n: Number(args[0].v) });
        case 'forEach': case 'forEachOrdered': this.runStream(o, (x) => { this.callFn(args[0], [x], line, 'accept'); return false; }, line); return VOID;
        case 'collect': return this.applyCollector(args[0], this.collectStream(o, line), line);
        case 'toList': return { t: 'ref', v: this.alloc({ kind: 'list', cls: 'ImmutableList', items: this.collectStream(o, line), mod: 0, immutable: true }) };
        case 'toArray': {
          const items = this.collectStream(o, line);
          return { t: 'ref', v: this.alloc({ kind: 'array', elem: { name: o.prim || 'Object', dims: 0 }, items }) };
        }
        case 'count': return mk.long(this.collectStream(o, line).length);
        case 'sum': return num(this.collectStream(o, line).reduce((s, x) => s + x.v, 0));
        case 'average': {
          const items = this.collectStream(o, line);
          return this.optional(items.length ? mk.double(items.reduce((s, x) => s + x.v, 0) / items.length) : null, 'double');
        }
        case 'max': case 'min': {
          const items = this.collectStream(o, line);
          if (!items.length) return this.optional(null, o.prim);
          const cmp = args[0] || null;
          let best = items[0];
          for (const x of items.slice(1)) {
            const c = this.compareValues(x, best, cmp, line);
            if (name === 'max' ? c > 0 : c < 0) best = x;
          }
          return this.optional(best, o.prim);
        }
        case 'reduce': {
          const items = this.collectStream(o, line);
          if (args.length >= 2) return items.reduce((acc, x) => this.callFn(args[1], [acc, x], line, 'apply'), args[0]);
          if (!items.length) return this.optional(null, o.prim);
          return this.optional(items.slice(1).reduce((acc, x) => this.callFn(args[0], [acc, x], line, 'apply'), items[0]), o.prim);
        }
        case 'anyMatch': case 'allMatch': case 'noneMatch': {
          let found = false;
          const want = name !== 'allMatch';
          this.runStream(o, (x) => {
            if (this.bool(this.callFn(args[0], [x], line, 'test'), line) === want) { found = true; return true; }
            return false;
          }, line);
          return mk.bool(name === 'anyMatch' ? found : !found);
        }
        case 'findFirst': case 'findAny': {
          let first = null;
          this.runStream(o, (x) => { first = x; return true; }, line);
          return this.optional(first, o.prim);
        }
        case 'iterator': return { t: 'ref', v: this.alloc({ kind: 'iter', list: { items: this.collectStream(o, line), mod: 0 }, cursor: 0, last: -1, mc: 0 }) };
        default: throw this.noMatch('Stream', name, args, line);
      }
    }

    applyCollector(cv, items, line) {
      const c = cv.v;
      if (!c || c.kind !== 'collector') throw new CompileError('collect richiede un Collector (es. Collectors.toList())', line, 'الدالة collect تحتاج إلى Collector مثل Collectors.toList()');
      const a = c.args;
      switch (c.type) {
        case 'toList': return { t: 'ref', v: this.alloc({ kind: 'list', cls: 'ArrayList', items, mod: 0 }) };
        case 'toSet': {
          const st = this.newSet('HashSet', 'hash');
          for (const x of items) if (this.mapIndex(st, x, line) < 0) this.mapPut(st, x, mk.bool(true), line);
          return { t: 'ref', v: st };
        }
        case 'joining': {
          const sep = a[0] ? a[0].v : '';
          return this.str((a[1] ? a[1].v : '') + items.map((x) => this.toStr(x)).join(sep) + (a[2] ? a[2].v : ''));
        }
        case 'counting': return mk.long(items.length);
        case 'summingInt': case 'summingDouble': case 'summingLong': {
          const s = items.reduce((t, x) => t + this.callFn(a[0], [x], line, 'apply').v, 0);
          return c.type === 'summingInt' ? mk.int(s) : c.type === 'summingLong' ? mk.long(s) : mk.double(s);
        }
        case 'averagingInt': case 'averagingDouble': return mk.double(items.length ? items.reduce((t, x) => t + this.callFn(a[0], [x], line, 'apply').v, 0) / items.length : 0);
        case 'mapping': return this.applyCollector(a[1], items.map((x) => this.callFn(a[0], [x], line, 'apply')), line);
        case 'groupingBy': case 'partitioningBy': {
          const isPart = c.type === 'partitioningBy';
          const groups = isPart ? this.newMap('LinkedHashMap', 'linked') : this.newMap('HashMap', 'hash');
          const buckets = [];
          if (isPart) for (const b of [false, true]) { const k = mk.bool(b); this.mapPut(groups, k, NULL, line); buckets.push({ k, items: [] }); }
          for (const x of items) {
            const k = isPart ? mk.bool(this.bool(this.callFn(a[0], [x], line, 'test'), line)) : this.callFn(a[0], [x], line, 'apply');
            let b = buckets.find((bb) => this.javaEquals(bb.k, k));
            if (!b) { b = { k, items: [] }; buckets.push(b); }
            b.items.push(x);
          }
          const down = a[1] || { t: 'ref', v: { kind: 'collector', type: 'toList', args: [] } };
          for (const b of buckets) this.mapPut(groups, b.k, this.applyCollector(down, b.items, line), line, !isPart);
          return { t: 'ref', v: groups };
        }
        case 'toMap': {
          const m = this.newMap('HashMap', 'hash');
          for (const x of items) {
            const k = this.callFn(a[0], [x], line, 'apply'), v = this.callFn(a[1], [x], line, 'apply');
            const i = this.mapIndex(m, k, line);
            if (i >= 0) {
              if (!a[2]) throw this.jthrow('IllegalStateException', `Duplicate key ${this.toStr(k)} (attempted merging values ${this.toStr(m.entries[i].v)} and ${this.toStr(v)})`, line);
              m.entries[i].v = this.callFn(a[2], [m.entries[i].v, v], line, 'apply');
            } else this.mapPut(m, k, v, line, !!a[2]);
          }
          return { t: 'ref', v: m };
        }
        default: throw new Unsupported('Collectors.' + c.type, line);
      }
    }

    callOptional(o, name, args, line) {
      const empty = !o.val;
      const none = () => this.jthrow('NoSuchElementException', 'No value present', line);
      switch (name) {
        case 'isPresent': return mk.bool(!empty);
        case 'isEmpty': return mk.bool(empty);
        case 'get': case 'getAsInt': case 'getAsDouble': case 'getAsLong': case 'orElseThrow': if (empty) throw none(); return o.val;
        case 'orElse': return empty ? args[0] : o.val;
        case 'orElseGet': return empty ? this.callFn(args[0], [], line, 'get') : o.val;
        case 'ifPresent': if (!empty) this.callFn(args[0], [o.val], line, 'accept'); return VOID;
        case 'ifPresentOrElse': if (!empty) this.callFn(args[0], [o.val], line, 'accept'); else this.callFn(args[1], [], line, 'run'); return VOID;
        case 'map': return empty ? this.optional(null) : this.optional(this.callFn(args[0], [o.val], line, 'apply'));
        case 'filter': return empty || !this.bool(this.callFn(args[0], [o.val], line, 'test'), line) ? this.optional(null) : this.optional(o.val);
        case 'toString': return this.str(this.toStr({ t: 'ref', v: o }));
        default: throw this.noMatch('Optional', name, args, line);
      }
    }

    // ── Scanner (input da tastiera simulato) ──
    echoInput(src, end) {
      if (!src.isStdin || end <= src.echoed) return;
      let lineEnd = src.text.indexOf('\n', Math.max(0, end - 1));
      if (lineEnd < 0) lineEnd = src.text.length;
      this.out.push({ text: src.text.slice(src.echoed, lineEnd) + '\n', err: false, input: true });
      src.echoed = lineEnd + 1;
    }

    callScanner(o, name, args, line) {
      if (o.closed && name !== 'close') throw this.jthrow('IllegalStateException', 'Scanner closed', line);
      const src = o.src;
      const T = src.text;
      const tok = () => {
        let a = src.pos;
        while (a < T.length && /\s/.test(T[a])) a++;
        let b = a;
        while (b < T.length && !/\s/.test(T[b])) b++;
        return a < T.length ? [a, b, T.slice(a, b)] : null;
      };
      const consume = (end) => { src.pos = end; this.echoInput(src, end); };
      const need = () => {
        const t = tok();
        if (!t) {
          if (src.isStdin) {
            throw new Unsupported('lettura di input: l\'input simulato è terminato. Aggiungi altre righe nel riquadro «Input (stdin)» prima di eseguire', line);
          }
          throw this.jthrow('NoSuchElementException', null, line);
        }
        return t;
      };
      const reInt = /^[+-]?\d+$/;
      const reDbl = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)([eE][+-]?\d+)?$/;
      switch (name) {
        case 'nextInt': case 'nextLong': case 'nextShort': case 'nextByte': {
          const t = need();
          if (!reInt.test(t[2])) throw this.jthrow('InputMismatchException', `For input string: "${t[2]}"`, line);
          consume(t[1]);
          this.lastInput = { method: name, val: t[2] };
          return name === 'nextLong' ? mk.long(parseInt(t[2], 10)) : mk.int(parseInt(t[2], 10));
        }
        case 'nextDouble': case 'nextFloat': {
          const t = need();
          if (!reDbl.test(t[2])) throw this.jthrow('InputMismatchException', `For input string: "${t[2]}"`, line);
          consume(t[1]);
          this.lastInput = { method: name, val: t[2] };
          return mk.double(parseFloat(t[2].replace(',', '.')));
        }
        case 'nextBoolean': {
          const t = need();
          if (!/^(true|false)$/i.test(t[2])) throw this.jthrow('InputMismatchException', `For input string: "${t[2]}"`, line);
          consume(t[1]);
          this.lastInput = { method: name, val: t[2] };
          return mk.bool(t[2].toLowerCase() === 'true');
        }
        case 'next': {
          const t = need();
          consume(t[1]);
          this.lastInput = { method: name, val: t[2] };
          return this.str(t[2]);
        }
        case 'nextLine': {
          if (src.pos >= T.length) {
            if (src.isStdin) throw new Unsupported('lettura di input: l\'input simulato è terminato. Aggiungi altre righe nel riquadro «Input (stdin)» prima di eseguire', line);
            throw this.jthrow('NoSuchElementException', 'No line found', line);
          }
          const e = T.indexOf('\n', src.pos);
          const text = e < 0 ? T.slice(src.pos) : T.slice(src.pos, e);
          consume(e < 0 ? T.length : e + 1);
          this.lastInput = { method: name, val: JSON.stringify(text), empty: text === '' };
          return this.str(text);
        }
        case 'hasNext': return mk.bool(!!tok());
        case 'hasNextInt': case 'hasNextLong': { const t = tok(); return mk.bool(!!t && reInt.test(t[2])); }
        case 'hasNextDouble': { const t = tok(); return mk.bool(!!t && reDbl.test(t[2])); }
        case 'hasNextBoolean': { const t = tok(); return mk.bool(!!t && /^(true|false)$/i.test(t[2])); }
        case 'hasNextLine': return mk.bool(src.pos < T.length);
        case 'close': o.closed = true; return VOID;
        case 'useDelimiter': case 'useLocale': return { t: 'ref', v: o };
        default: throw this.noMatch('Scanner', name, args, line);
      }
    }

    // ── File system virtuale ──
    callFile(o, name, args, line) {
      switch (name) {
        case 'exists': case 'isFile': case 'canRead': return mk.bool(this.fs.has(o.name));
        case 'getName': case 'getPath': case 'toString': case 'getFileName': case 'getAbsolutePath': return this.str(o.name);
        case 'length': return mk.long(this.fs.has(o.name) ? this.fs.get(o.name).length : 0);
        case 'delete': { const had = this.fs.has(o.name); this.fs.delete(o.name); return mk.bool(had); }
        case 'createNewFile': { if (this.fs.has(o.name)) return mk.bool(false); this.fs.set(o.name, ''); return mk.bool(true); }
        case 'isDirectory': return mk.bool(false);
        case 'equals': return mk.bool(args[0].t === 'ref' && args[0].v.name === o.name);
        default: throw this.noMatch(o.kind === 'path' ? 'Path' : 'File', name, args, line);
      }
    }

    callReader(o, name, args, line) {
      const r = o.inner || o;
      if (r.closed && name !== 'close') throw this.jthrow('IOException', 'Stream closed', line);
      switch (name) {
        case 'readLine': {
          if (r.pos >= r.text.length) return NULL;
          const e = r.text.indexOf('\n', r.pos);
          const text = e < 0 ? r.text.slice(r.pos) : r.text.slice(r.pos, e);
          r.pos = e < 0 ? r.text.length : e + 1;
          return this.str(text.replace(/\r$/, ''));
        }
        case 'read': return mk.int(r.pos < r.text.length ? r.text.charCodeAt(r.pos++) : -1);
        case 'ready': return mk.bool(r.pos < r.text.length);
        case 'lines': {
          const rest = r.text.slice(r.pos);
          r.pos = r.text.length;
          const ls = rest.split('\n');
          if (ls[ls.length - 1] === '') ls.pop();
          return this.makeStream(ls.map((x) => this.str(x)), null);
        }
        case 'close': r.closed = true; o.closed = true; return VOID;
        default: throw this.noMatch(o.cls, name, args, line);
      }
    }

    callWriter(o, name, args, line) {
      const w = o.inner || o;
      if (w.closed && name !== 'close') {
        if (o.cls === 'PrintWriter') return VOID;
        throw this.jthrow('IOException', 'Stream closed', line);
      }
      const put = (txt) => { w.pending += txt; };
      const commit = () => { this.fs.set(w.name, (this.fs.get(w.name) || '') + w.pending); w.pending = ''; };
      switch (name) {
        case 'write': case 'append':
          if (args[0].t === 'int') put(String.fromCharCode(args[0].v));
          else put(this.toStr(args[0]));
          return name === 'append' ? { t: 'ref', v: o } : VOID;
        case 'print': put(this.toStr(args[0])); return VOID;
        case 'println': put((args.length ? this.toStr(args[0]) : '') + '\n'); return VOID;
        case 'printf': case 'format': put(this.format(args[0].v, args.slice(1), line)); return { t: 'ref', v: o };
        case 'newLine': put('\n'); return VOID;
        case 'flush': commit(); return VOID;
        case 'close': if (!w.closed) { commit(); w.closed = true; } o.closed = true; return VOID;
        case 'checkError': return mk.bool(false);
        default: throw this.noMatch(o.cls, name, args, line);
      }
    }

    // ── Metodi dei tipi "wrapper" (Integer, Double, ...) chiamati su valori primitivi ──
    callPrim(v, name, args, line) {
      switch (name) {
        case 'compareTo': return mk.int(this.compareValues(v, args[0], null, line));
        case 'equals': return mk.bool(args[0].t === v.t && args[0].v === v.v);
        case 'intValue': return mk.int(v.t === 'double' ? this.d2i(v.v) : v.v);
        case 'doubleValue': case 'floatValue': return mk.double(v.v);
        case 'longValue': return mk.long(v.v);
        case 'booleanValue': case 'charValue': return v;
        case 'toString': return this.str(this.toStr(v));
        case 'hashCode': return mk.int(this.hashOf(v));
        case 'isNaN': return mk.bool(Number.isNaN(v.v));
        default: return null;
      }
    }

    // ── try-with-resources ──
    execResources(s) {
      this.pushScope();
      const opened = [];
      let primary = null;
      try {
        for (const r of s.resources) {
          this.tick(r.line);
          const v = r.init ? this.eval(r.init) : this.eval(r.expr);
          if (r.init) {
            const val = this.coerce(v, r.type, r.line);
            this.declare(r.name, r.type.name === 'var' ? this.inferType(val) : r.type, val, true, r.line);
            this.record(r.line, 'decl', { name: r.name, type: r.type, val, init: r.init });
          }
          opened.push({ v, line: r.line, name: r.name || exprStr(r.expr) });
        }
        this.execBlock(s.block.stmts);
      } catch (ex) {
        primary = ex;
      }
      for (let i = opened.length - 1; i >= 0; i--) {
        const r = opened[i];
        if (r.v.t === 'null') continue;
        try {
          this.callOn(r.v, 'close', [], { target: { k: 'name', name: r.name } }, r.line);
          this.record(r.line, 'close', { name: r.name });
        } catch (ex2) {
          if (!primary) primary = ex2;
        }
      }
      this.popScope();
      if (primary) throw primary;
    }

    // ── switch su enum ed espressioni switch ──
    switchMatch(v, l) {
      if (v.t === 'ref' && v.v.enumName !== undefined && l.k === 'name') return v.v.enumName === l.name;
      const lv = this.eval(l);
      if (v.t === 'String' && lv.t === 'String') return v.v === lv.v;
      if (isNum(v) && isNum(lv)) return v.v === lv.v;
      if (v.t === 'ref' && lv.t === 'ref') return v.v === lv.v;
      return false;
    }

    evalSwitchExpr(e) {
      const v = this.eval(e.disc);
      if (v.t === 'null') throw this.jthrow('NullPointerException', null, e.line);
      let start = e.cases.findIndex((c) => c.labels && c.labels.some((l) => this.switchMatch(v, l)));
      if (start < 0) start = e.cases.findIndex((c) => !c.labels);
      if (start < 0) {
        throw new CompileError('l\'espressione switch non copre tutti i casi: aggiungi default', e.line, 'تعبير switch لا يغطي جميع الحالات: أضف الحالة default');
      }
      this.pushScope();
      try {
        for (let i = start; i < e.cases.length; i++) {
          const c = e.cases[i];
          if (c.arrow) {
            const b = c.body[0];
            if (b.k === 'expr') return this.eval(b.e);
            try { this.exec(b); } catch (ex) { if (ex instanceof YieldSig) return ex.value; throw ex; }
            break;
          }
          try {
            for (const st of c.body) this.exec(st);
          } catch (ex) {
            if (ex instanceof YieldSig) return ex.value;
            throw ex;
          }
        }
      } finally {
        this.popScope();
      }
      throw new CompileError('il ramo dello switch deve produrre un valore con yield', e.line, 'يجب أن يُنتج فرع switch قيمة باستخدام yield');
    }

    // ── Metodi statici della libreria ──
    collector(type, args) {
      return { t: 'ref', v: { kind: 'collector', type, args, addr: '' } };
    }

    callLibStatic(cls, name, args, line) {
      const a0 = args[0];
      const list = (items, immutable) => ({ t: 'ref', v: this.alloc({ kind: 'list', cls: immutable ? 'ImmutableList' : 'ArrayList', items, mod: 0, immutable: !!immutable }) });
      switch (cls) {
        case 'Collections': {
          const o = a0 && a0.t === 'ref' ? a0.v : null;
          switch (name) {
            case 'sort': if (o.immutable) throw this.jthrow('UnsupportedOperationException', null, line); this.sortValues(o.items, args[1] || null, line); o.mod = (o.mod || 0) + 1; return VOID;
            case 'reverse': o.items.reverse(); return VOID;
            case 'shuffle': {
              let seed = 7;
              for (let i = o.items.length - 1; i > 0; i--) {
                seed = (seed * 1103515245 + 12345) % 2147483648;
                const j = seed % (i + 1);
                [o.items[i], o.items[j]] = [o.items[j], o.items[i]];
              }
              return VOID;
            }
            case 'max': case 'min': {
              const items = this.iterValues(a0, line);
              if (!items.length) throw this.jthrow('NoSuchElementException', null, line);
              let best = items[0];
              for (const x of items.slice(1)) {
                const c = this.compareValues(x, best, args[1] || null, line);
                if (name === 'max' ? c > 0 : c < 0) best = x;
              }
              return best;
            }
            case 'frequency': return mk.int(this.iterValues(a0, line).filter((x) => this.javaEquals(x, args[1]) || (x.t === 'null' && args[1].t === 'null')).length);
            case 'swap': { const i = this.intOf(args[1], line), j = this.intOf(args[2], line); [o.items[i], o.items[j]] = [o.items[j], o.items[i]]; return VOID; }
            case 'emptyList': return list([], true);
            case 'unmodifiableList': return list(o.items.slice(), true);
            case 'nCopies': return list(Array.from({ length: this.intOf(a0, line) }, () => args[1]), true);
            case 'addAll': { o.items.push(...args.slice(1)); o.mod = (o.mod || 0) + 1; return mk.bool(args.length > 1); }
            case 'reverseOrder': return a0 ? this.native((a) => mk.int(this.compareValues(a[1], a[0], a0, line)), 2, 'reverseOrder') : this.native((a) => mk.int(this.compareValues(a[1], a[0], null, line)), 2, 'reverseOrder');
            default: return undefined;
          }
        }
        case 'Comparator':
          switch (name) {
            case 'comparing': case 'comparingInt': case 'comparingDouble': case 'comparingLong': return this.keyComparator(a0, args[1] || null, line);
            case 'naturalOrder': return this.native((a) => mk.int(this.compareValues(a[0], a[1], null, line)), 2, 'naturalOrder');
            case 'reverseOrder': return this.native((a) => mk.int(this.compareValues(a[1], a[0], null, line)), 2, 'reverseOrder');
            default: return undefined;
          }
        case 'Collectors': {
          const known = ['toList', 'toSet', 'joining', 'counting', 'groupingBy', 'partitioningBy', 'summingInt', 'summingDouble', 'summingLong',
            'averagingInt', 'averagingDouble', 'toMap', 'mapping'];
          if (!known.includes(name)) return undefined;
          const ga = name === 'groupingBy' && args.length === 3 ? [args[0], args[2]] : args;
          return this.collector(name, ga);
        }
        case 'Stream':
          if (name === 'of') return this.makeStream(args.length === 1 && a0.t === 'ref' && a0.v.kind === 'array' ? a0.v.items.slice() : args.slice(), null);
          if (name === 'empty') return this.makeStream([], null);
          if (name === 'iterate' && args.length === 3) {
            const items = [];
            for (let x = a0; this.bool(this.callFn(args[1], [x], line, 'test'), line); x = this.callFn(args[2], [x], line, 'apply')) {
              items.push(x);
              if (items.length > 100000) throw new LimitError('stream troppo lungo', line);
            }
            return this.makeStream(items, null);
          }
          return undefined;
        case 'IntStream': case 'DoubleStream': {
          const prim = cls === 'IntStream' ? 'int' : 'double';
          if (name === 'range' || name === 'rangeClosed') {
            const a = this.intOf(a0, line), b = this.intOf(args[1], line) + (name === 'rangeClosed' ? 1 : 0);
            if (b - a > 100000) throw new LimitError('intervallo troppo grande per il simulatore', line);
            const items = [];
            for (let i = a; i < b; i++) items.push(mk.int(i));
            return this.makeStream(items, 'int');
          }
          if (name === 'of') return this.makeStream(args.length === 1 && a0.t === 'ref' ? a0.v.items.slice() : args.map((x) => (prim === 'int' ? mk.int(x.v) : mk.double(x.v))), prim);
          return undefined;
        }
        case 'Arrays': {
          const arr = a0 && a0.t === 'ref' && a0.v.kind === 'array' ? a0.v : null;
          if (name === 'stream' && arr) {
            const e = arr.elem;
            const prim = e.dims === 0 && ['int', 'double', 'long'].includes(e.name) ? e.name : null;
            return this.makeStream(arr.items.slice(), prim);
          }
          if (name === 'sort' && arr) {
            if (args.length === 3 && args[1].t === 'int') {
              const from = args[1].v, to = args[2].v;
              const part = this.sortValues(arr.items.slice(from, to), null, line);
              arr.items.splice(from, to - from, ...part);
            } else this.sortValues(arr.items, args[1] || null, line);
            return VOID;
          }
          return undefined;
        }
        case 'List': case 'Set': case 'Map':
          if (cls === 'List' && (name === 'of' || name === 'copyOf')) {
            const items = name === 'copyOf' ? this.iterValues(a0, line) : (args.length === 1 && a0.t === 'ref' && a0.v.kind === 'array' ? a0.v.items.slice() : args.slice());
            if (items.some((x) => x.t === 'null')) throw this.jthrow('NullPointerException', null, line);
            return list(items, true);
          }
          if (cls === 'Set' && name === 'of') {
            const st = this.newSet('ImmutableSet', 'linked');
            for (const x of args) {
              if (this.mapIndex(st, x, line) >= 0) throw this.jthrow('IllegalArgumentException', 'duplicate element: ' + this.toStr(x), line);
              this.mapPut(st, x, mk.bool(true), line);
            }
            st.immutable = true;
            return { t: 'ref', v: st };
          }
          if (cls === 'Map' && name === 'of') {
            const m = this.newMap('ImmutableMap', 'linked');
            for (let i = 0; i + 1 < args.length; i += 2) this.mapPut(m, args[i], args[i + 1], line);
            m.immutable = true;
            return { t: 'ref', v: m };
          }
          if (cls === 'Map' && name === 'entry') return { t: 'ref', v: { kind: 'entry', ent: { k: a0, v: args[1] }, addr: '' } };
          return undefined;
        case 'Optional':
          if (name === 'of') { if (a0.t === 'null') throw this.jthrow('NullPointerException', null, line); return this.optional(a0); }
          if (name === 'ofNullable') return this.optional(a0.t === 'null' ? null : a0);
          if (name === 'empty') return this.optional(null);
          return undefined;
        case 'Objects':
          if (name === 'hash') return mk.int(args.reduce((h, x) => (Math.imul(31, h) + this.hashOf(x)) | 0, 1));
          return undefined;
        case 'Paths': case 'Path':
          if (name === 'get' || name === 'of') return { t: 'ref', v: this.alloc({ kind: 'path', name: args.map((x) => x.v).join('/') }) };
          return undefined;
        case 'Files': {
          const name0 = a0 ? this.fsName(a0, line) : '';
          const missing = () => this.jthrow('NoSuchFileException', name0, line);
          switch (name) {
            case 'exists': return mk.bool(this.fs.has(name0));
            case 'readAllLines': {
              if (!this.fs.has(name0)) throw missing();
              const ls = this.fs.get(name0).split('\n');
              if (ls[ls.length - 1] === '') ls.pop();
              return list(ls.map((x) => this.str(x)));
            }
            case 'readString': if (!this.fs.has(name0)) throw missing(); return this.str(this.fs.get(name0));
            case 'lines': {
              if (!this.fs.has(name0)) throw missing();
              const ls = this.fs.get(name0).split('\n');
              if (ls[ls.length - 1] === '') ls.pop();
              return this.makeStream(ls.map((x) => this.str(x)), null);
            }
            case 'writeString': this.fs.set(name0, this.toStr(args[1])); return a0;
            case 'write': this.fs.set(name0, this.iterValues(args[1], line).map((x) => this.toStr(x) + '\n').join('')); return a0;
            case 'delete': case 'deleteIfExists': { const had = this.fs.has(name0); if (!had && name === 'delete') throw missing(); this.fs.delete(name0); return name === 'delete' ? VOID : mk.bool(had); }
            default: return undefined;
          }
        }
        case 'Integer':
          if (name === 'valueOf' && a0 && a0.t === 'int') return { ...a0, boxed: true };
          return undefined;
        default: return undefined;
      }
    }

    shortLabel(o) {
      const dv = (x) => this.dispVal(x).val;
      switch (o.kind) {
        case 'entry': return `${dv(o.ent.k)}=${dv(o.ent.v)}`;
        case 'lambda': return 'λ ' + (o.label || 'lambda');
        case 'stream': return 'Stream';
        case 'optional': return o.val ? `Optional[${dv(o.val)}]` : 'Optional.empty';
        case 'collector': return 'Collector';
        case 'set': case 'list': return `${o.cls} (${(o.entries || o.items).length})`;
        case 'classobj': return 'class ' + o.name;
        default: return '<' + o.kind + '>';
      }
    }

    // ── Trace / istantanee ──
    dispVal(v) {
      if (v === undefined) return { val: '—', uninit: true };
      switch (v.t) {
        case 'String': return { val: JSON.stringify(v.v.length > 40 ? v.v.slice(0, 40) + '…' : v.v), str: true };
        case 'char': return { val: v.v === 0 ? "'\\u0000'" : "'" + String.fromCharCode(v.v) + "'" };
        case 'null': return { val: 'null', nul: true };
        case 'ref': return v.v.addr ? { val: v.v.addr, ref: v.v.addr } : { val: this.shortLabel(v.v) };
        case 'double': return { val: javaDouble(v.v) };
        case 'class': return { val: v.v };
        case 'void': return { val: 'void' };
        default: return { val: String(v.v) };
      }
    }

    heapLabel(o) {
      switch (o.kind) {
        case 'obj': return o.enumName !== undefined ? `${o.cls}.${o.enumName}` : o.cls;
        case 'array': return `${typeStr(o.elem)}[${o.items.length}]`;
        case 'list': return `${o.cls}<> (size ${o.items.length})`;
        case 'map': case 'set': return `${o.cls}<> (size ${o.entries.length})`;
        case 'lambda': return 'λ ' + (o.label || 'lambda');
        case 'scanner': return `Scanner(${o.src.isStdin ? 'System.in' : 'testo/file'})`;
        case 'file': return `File("${o.name}")`;
        case 'path': return `Path("${o.name}")`;
        case 'reader': case 'writer': return `${o.cls}("${o.name}")`;
        case 'iter': return 'Iterator';
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
        const kids = o.kind === 'obj' ? [...o.fields.values()].map((f) => f.value)
          : (o.kind === 'array' || o.kind === 'list') ? o.items
            : (o.kind === 'map' || o.kind === 'set') ? o.entries.flatMap((e) => [e.k, e.v])
              : (o.kind === 'iter' && o.list && o.list.addr) ? [{ t: 'ref', v: o.list }] : [];
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
        else if (o.kind === 'map' || o.kind === 'set') {
          const ord = this.mapOrdered(o, 0);
          ord.slice(0, 16).forEach((e, i) => {
            if (o.kind === 'map') fields.push({ name: this.dispVal(e.k).val, ...this.dispVal(e.v) });
            else fields.push({ name: `[${i}]`, ...this.dispVal(e.k) });
          });
          if (ord.length > 16) fields.push({ name: '…', val: `+${ord.length - 16}` });
        } else if (o.kind === 'scanner') {
          const rest = o.src.text.slice(o.src.pos);
          fields.push({ name: 'input residuo', ...this.dispVal(this.str(rest.replace(/\n/g, '⏎'))) });
        } else if (o.kind === 'writer') {
          const w = o.inner || o;
          fields.push({ name: 'buffer (non ancora su file)', ...this.dispVal(this.str(w.pending.replace(/\n/g, '⏎'))) });
          fields.push({ name: 'chiuso', val: String(!!w.closed) });
        } else if (o.kind === 'reader') {
          const r = o.inner || o;
          fields.push({ name: 'posizione', val: `${r.pos}/${r.text.length}` });
        } else if (o.kind === 'lambda' && o.params) {
          fields.push({ name: 'parametri', val: '(' + o.params.join(', ') + ')' });
        }
        if (o.enumName !== undefined) fields.unshift({ name: 'ordinal()', val: String(o.ordinal) });
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
      try {
        const ex = this.explain(kind, data || {}, line);
        this.trace.push({
          line, kind, outLen: this.out.length,
          frames: this.snapFrames(), statics: this.snapStatics(), heap: this.snapHeap(),
          files: this.fs.size ? Object.fromEntries(this.fs) : null,
          it: ex.it, ar: ex.ar,
        });
      } finally { this.silent--; }
    }

    recordExpr(s, v) {
      const e = s.e;
      if (e.k === 'assign') {
        const tgt = exprStr(e.target);
        const val = e.target.k === 'name' ? this.peekValue(e.target, v) : v;
        this.record(s.line, 'assign', { input: this.lastInput, target: tgt, val, op: e.op, isNew: e.value.k === 'new' || e.value.k === 'newarray', isField: e.target.k !== 'name' || !this.findVar(e.target.name), rhsName: e.value.k === 'name' });
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
      if ((kind === 'decl' || kind === 'assign') && d.input) {
        const who = d.name || d.target;
        return {
          it: `Lettura dell'input con \`${d.input.method}()\`: ${d.input.empty ? 'restituisce una riga VUOTA perché il precedente nextInt()/nextDouble() aveva lasciato il carattere di a capo (\\n) nel buffer' : `l'utente ha digitato ${d.input.val}`}; il valore viene salvato in \`${who}\`.`,
          ar: d.input.empty
            ? `القراءة بـ \`${d.input.method}()\` أعادت سطراً فارغاً! السبب أن \`nextInt()\` أو \`nextDouble()\` السابقة قرأت الرقم فقط وتركت محرف نهاية السطر (Enter) في المخزن المؤقت. الحل: استدعِ \`nextLine()\` إضافية بعد قراءة الرقم.`
            : `قراءة إدخال المستخدم بالدالة \`${d.input.method}()\`: كتب المستخدم ${d.input.val}، وتُخزَّن القيمة في المتغير \`${who}\`.`,
        };
      }
      switch (kind) {
        case 'lambdacall':
          return {
            it: `Esecuzione del corpo della lambda: nuovo frame con ${d.params.length ? d.params.map((p, i) => `\`${p}\` = ${disp(d.args[i])}`).join(', ') : 'nessun parametro'}.`,
            ar: `تنفيذ جسم تعبير lambda: يُنشأ إطار جديد في الـStack ${d.params.length ? 'تُمرَّر فيه القيم ' + d.params.map((p, i) => `\`${p}\` = ${disp(d.args[i])}`).join('، ') : 'بدون معاملات'}.`,
          };
        case 'close':
          return {
            it: `try-with-resources: la risorsa \`${d.name}\` viene chiusa automaticamente con close() all'uscita dal blocco try.`,
            ar: `try-with-resources: يتم إغلاق المورد \`${d.name}\` تلقائياً باستدعاء close() عند الخروج من كتلة try، حتى لو حدث استثناء.`,
          };
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
  function run(src, opts) {
    const res = { ok: false, stdout: [], trace: [], error: null, exception: null, truncated: false, files: {} };
    let interp = null;
    try {
      const parser = new Parser(tokenize(src));
      const types = parser.parseUnit();
      interp = new Interp(src, types, opts);
      interp.typeParams = parser.typeParams;
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
      res.files = Object.fromEntries(interp.fs);
    }
    res.text = res.stdout.filter((c) => !c.err && !c.input).map((c) => c.text).join('');
    res.errText = res.stdout.filter((c) => c.err).map((c) => c.text).join('');
    return res;
  }

  const api = { run, tokenize, Parser, javaDouble, CompileError };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CFInterpreter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
