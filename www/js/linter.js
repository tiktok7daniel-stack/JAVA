/*
 * CodeForge — Analizzatore "Buona Norma".
 * Controlla le regole di stile e di buona programmazione richieste nei corsi
 * universitari italiani di Programmazione in Java. Ogni segnalazione può
 * includere una correzione automatica (fix.edits) applicabile con applicaCorrezione().
 */
(function (root) {
  'use strict';

  const SEV = { errore: 3, avviso: 1.5, suggerimento: 0.5 };
  const TYPE = '(?:int|long|short|byte|double|float|boolean|char|String|var|[A-Z][\\w$]*(?:<[^;=()]*?>)?)(?:\\s*\\[\\s*\\])*';
  const MODS = '(?:(?:public|private|protected|static|final|transient|volatile)\\s+)*';
  const JAVA_WORDS = new Set(['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue',
    'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import',
    'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short',
    'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while',
    'true', 'false', 'null', 'var']);

  /** Sostituisce commenti e contenuto dei letterali con spazi, mantenendo posizioni e a capo. */
  function maskCode(src) {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
      const c = src[i], d = src[i + 1];
      if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') { out += ' '; i++; } continue; }
      if (c === '/' && d === '*') {
        out += '  '; i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { out += src[i] === '\n' ? '\n' : ' '; i++; }
        if (i < n) { out += '  '; i += 2; }
        continue;
      }
      if (c === '"' || c === "'") {
        const q = c;
        out += q; i++;
        while (i < n && src[i] !== q && src[i] !== '\n') {
          if (src[i] === '\\' && i + 1 < n) { out += '  '; i += 2; continue; }
          out += ' '; i++;
        }
        if (i < n && src[i] === q) { out += q; i++; }
        continue;
      }
      out += c; i++;
    }
    return out;
  }

  // ── Conversioni di nomi ──
  function words(name) {
    return name
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .split(/[_\s]+/)
      .filter(Boolean)
      .map((w) => w.toLowerCase());
  }
  const toCamel = (n) => { const w = words(n); return w.map((x, i) => (i ? x[0].toUpperCase() + x.slice(1) : x)).join('') || n; };
  const toPascal = (n) => words(n).map((x) => x[0].toUpperCase() + x.slice(1)).join('') || n;
  const toUpperSnake = (n) => words(n).join('_').toUpperCase() || n;
  const isCamel = (n) => /^[a-z][a-zA-Z0-9]*$/.test(n);
  const isPascal = (n) => /^[A-Z][a-zA-Z0-9]*$/.test(n);
  const isUpperSnake = (n) => /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(n);

  /** Analisi strutturale: contesto (classe/metodo/blocco) all'inizio di ogni riga e posizione di break/continue. */
  function structure(masked) {
    const lines = masked.split('\n');
    const lineCtx = [];
    const inMain = [];
    const jumps = [];
    const stack = [];
    let header = '';
    let paren = 0;
    for (let li = 0; li < lines.length; li++) {
      const L = lines[li];
      const firstNonSpace = L.search(/\S/);
      let ctxSet = false;
      for (let j = 0; j < L.length; j++) {
        if (j === firstNonSpace && !ctxSet) {
          lineCtx[li] = stack.length ? stack[stack.length - 1].kind : 'top';
          inMain[li] = stack.some((x) => x.main);
          ctxSet = true;
        }
        const ch = L[j];
        if (ch === '{') {
          const h = header.trim();
          const parent = stack.length ? stack[stack.length - 1].kind : 'top';
          let kind;
          if (/\b(class|interface|enum|record)\b/.test(h) && !/\bnew\b/.test(h)) kind = 'class';
          else if (/(=|\]|,|\{)\s*$/.test(h) || (parent === 'init' && !h)) kind = 'init';
          else if (parent === 'class') kind = 'method';
          else if (/\bswitch\s*\(/.test(h)) kind = 'switch';
          else if (/\b(for|while|do)\b/.test(h)) kind = 'loop';
          else kind = 'block';
          stack.push({ kind, line: li, main: kind === 'method' && /\bstatic\b[^;]*\bmain\s*\(/.test(h) });
          header = '';
        } else if (ch === '}') {
          stack.pop();
          header = '';
        } else if (ch === ';' && paren === 0) {
          header = '';
        } else {
          if (ch === '(') paren++;
          else if (ch === ')') paren = Math.max(0, paren - 1);
          if ((ch === 'b' || ch === 'c') && /[^\w$]/.test(L[j - 1] || ' ')) {
            const m = /^(break|continue)\b/.exec(L.slice(j));
            if (m) {
              let target = null;
              for (let k = stack.length - 1; k >= 0; k--) {
                if (stack[k].kind === 'loop' || stack[k].kind === 'switch') { target = stack[k].kind; break; }
                if (stack[k].kind === 'method' || stack[k].kind === 'class') break;
              }
              jumps.push({ line: li, col: j, kw: m[1], target });
            }
          }
          header += ch;
        }
      }
      if (!ctxSet) {
        lineCtx[li] = stack.length ? stack[stack.length - 1].kind : 'top';
        inMain[li] = stack.some((x) => x.main);
      }
      header += '\n';
    }
    return { lineCtx, inMain, jumps };
  }

  function lineStarts(src) {
    const starts = [0];
    for (let i = 0; i < src.length; i++) if (src[i] === '\n') starts.push(i + 1);
    return starts;
  }

  function identifierExists(masked, name) {
    const re = /[A-Za-z_$][\w$]*/g;
    let m;
    while ((m = re.exec(masked))) if (m[0] === name) return true;
    return false;
  }

  function renameEdits(masked, from, to) {
    const edits = [];
    const re = /[A-Za-z_$][\w$]*/g;
    let m;
    while ((m = re.exec(masked))) if (m[0] === from) edits.push({ start: m.index, end: m.index + from.length, text: to });
    return edits;
  }

  function applyEditsTo(text, edits) {
    let out = text;
    for (const e of [...edits].sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    return out;
  }

  function findMatching(masked, openIdx) {
    const open = masked[openIdx];
    const close = open === '(' ? ')' : open === '{' ? '}' : ']';
    let depth = 0;
    for (let i = openIdx; i < masked.length; i++) {
      if (masked[i] === open) depth++;
      else if (masked[i] === close) { depth--; if (!depth) return i; }
    }
    return -1;
  }

  /**
   * Analizza il codice e restituisce le violazioni di Buona Norma.
   * @returns {Array<{id,line,severity,regola,titolo,it,ar,badSnippet,suggestedFix,fix}>}
   */
  function analizza(src) {
    const code = String(src).replace(/\r\n?/g, '\n');
    const masked = maskCode(code);
    const mLines = masked.split('\n');
    const oLines = code.split('\n');
    const starts = lineStarts(code);
    const { lineCtx, inMain, jumps } = structure(masked);
    const findings = [];
    const renamed = new Set();
    const stringNames = new Set();

    const lineFix = (li, newLine) => ({ edits: [{ start: starts[li], end: starts[li] + oLines[li].length, text: newLine }] });
    const add = (f) => {
      f.id = `${f.regola}:${f.line}:${findings.length}`;
      f.badSnippet = f.badSnippet !== undefined ? f.badSnippet : (oLines[f.line - 1] || '').trim();
      if (f.fix && f.suggestedFix === undefined) {
        const li = f.line - 1;
        const lineStart = starts[li], lineEnd = starts[li] + oLines[li].length;
        const local = f.fix.edits.filter((e) => e.start >= lineStart && e.end <= lineEnd).map((e) => ({ ...e, start: e.start - lineStart, end: e.end - lineStart }));
        f.suggestedFix = applyEditsTo(oLines[li], local).trim();
      }
      if (f.suggestedFix === undefined) f.suggestedFix = null;
      if (f.fix === undefined) f.fix = null;
      findings.push(f);
    };

    const renameFinding = (li, name, target, base) => {
      if (renamed.has(name) || name === target) return;
      renamed.add(name);
      const collision = identifierExists(masked, target);
      add({
        ...base,
        line: li + 1,
        fix: collision ? null : { edits: renameEdits(masked, name, target) },
        suggestedFix: collision ? `${target} (nome già in uso: rinomina a mano)` : undefined,
        rename: { from: name, to: target },
      });
    };

    // ── 1/2/4: dichiarazioni di variabili, parametri, campi ──
    const declRe = new RegExp('(^\\s*|[;({,]\\s*)(' + MODS + ')(' + TYPE + ')\\s+([A-Za-z_$][\\w$]*)\\s*(=|;|,|\\)|:|\\[)', 'g');
    mLines.forEach((L, li) => {
      declRe.lastIndex = 0;
      let m;
      while ((m = declRe.exec(L))) {
        const prefix = m[1], mods = m[2] || '', type = m[3], name = m[4], term = m[5];
        if (JAVA_WORDS.has(name) || /^(return|new|throw|else|case|package|import)$/.test(type)) continue;
        if (/^(class|interface|extends|implements|instanceof)\b/.test(type)) continue;
        const before = L.slice(0, m.index + prefix.length);
        if (/\b(new|return|throw|instanceof)\s*$/.test(before)) continue;
        if (/\.\s*$/.test(before)) continue;
        const isParam = /[(,]\s*$/.test(prefix) && !/\bfor\s*\($/.test(before.trim()) && term !== '=' && term !== ';';
        const ctx = lineCtx[li];
        const isField = ctx === 'class' && !/[(,]/.test(prefix.trim());
        const isFinal = /\bfinal\b/.test(mods);
        const isStatic = /\bstatic\b/.test(mods);
        if (type === 'String' || /^String\b/.test(type)) stringNames.add(name);

        const isConst = isFinal && !isParam && (!isField || isStatic);
        if (isConst) {
          if (!isUpperSnake(name)) {
            renameFinding(li, name, toUpperSnake(name), {
              severity: 'avviso', regola: 'costante-maiuscolo', titolo: 'Costante non in UPPER_SNAKE_CASE',
              it: `La costante «${name}» è dichiarata final: per convenzione le costanti si scrivono in MAIUSCOLO con underscore (UPPER_SNAKE_CASE), es. ${toUpperSnake(name)}.`,
              ar: `الثابت \`${name}\` مُعرَّف كـ \`final\`، والعُرف في Java أن تُكتب الثوابت بأحرف كبيرة مع شرطة سفلية (UPPER_SNAKE_CASE) مثل \`${toUpperSnake(name)}\` حتى يُميَّز فوراً أنه لا يتغير.`,
            });
          }
        } else if (!isCamel(name)) {
          const upper = isUpperSnake(name) && name.length > 1;
          renameFinding(li, name, toCamel(name), {
            severity: 'errore', regola: 'camel-case', titolo: isParam ? 'Parametro non in camelCase' : isField ? 'Attributo non in camelCase' : 'Variabile non in camelCase',
            it: upper
              ? `«${name}» è scritto come una costante ma non è final: le variabili si scrivono in camelCase (es. ${toCamel(name)}); se il valore non deve cambiare aggiungi final.`
              : `Il nome «${name}» viola la convenzione camelCase: ${isParam ? 'parametri' : isField ? 'attributi' : 'variabili'} iniziano con la lettera minuscola e ogni parola successiva con la maiuscola (es. ${toCamel(name)}).`,
            ar: upper
              ? `الاسم \`${name}\` مكتوب كأنه ثابت لكنه ليس \`final\`: المتغيرات تُكتب بأسلوب camelCase مثل \`${toCamel(name)}\`، وإذا كانت القيمة لا تتغير فأضف \`final\`.`
              : `الاسم \`${name}\` يخالف أسلوب camelCase: ${isParam ? 'المعاملات' : isField ? 'الحقول (attributes)' : 'المتغيرات'} تبدأ بحرف صغير، وكل كلمة تالية تبدأ بحرف كبير بدون شرطات (مثل \`${toCamel(name)}\`). الأحرف الكبيرة في البداية مخصصة لأسماء الأصناف.`,
          });
        }

        if (isField && !/\bprivate\b/.test(mods) && !(isStatic && isFinal)) {
          const fieldStart = starts[li] + m.index + prefix.length;
          const accessM = /\b(public|protected)\b/.exec(mods);
          let edits;
          if (accessM) {
            const s = fieldStart + accessM.index;
            edits = [{ start: s, end: s + accessM[1].length, text: 'private' }];
          } else edits = [{ start: fieldStart, end: fieldStart, text: 'private ' }];
          const isPublic = accessM && accessM[1] === 'public';
          const isProt = accessM && accessM[1] === 'protected';
          add({
            line: li + 1,
            severity: isProt ? 'suggerimento' : isPublic ? 'errore' : 'avviso',
            regola: 'incapsulamento',
            titolo: isPublic ? 'Attributo public: incapsulamento violato' : isProt ? 'Attributo protected' : 'Attributo senza modificatore di accesso',
            it: isProt
              ? `L'attributo «${name}» è protected: è accettabile nelle gerarchie di ereditarietà, ma la regola d'esame preferisce private con metodi get/set (o costruttore della superclasse).`
              : `L'attributo «${name}» è ${isPublic ? 'public' : 'senza modificatore (package-private)'}: viola l'incapsulamento. Gli attributi devono essere private e accessibili solo tramite metodi get/set che ne controllano la validità.`,
            ar: isProt
              ? `الحقل \`${name}\` معرّف كـ \`protected\`: هذا مقبول في الوراثة، لكن القاعدة المفضلة في الامتحان هي \`private\` مع دوال get/set أو مُنشئ الصنف الأب.`
              : `الحقل \`${name}\` ${isPublic ? 'عام \`public\`' : 'بدون محدد وصول'}: هذا يكسر مبدأ التغليف (Encapsulation) لأن أي صنف آخر يمكنه تغيير قيمته مباشرة (مثلاً وضع رصيد سالب). اجعله \`private\` واستخدم دوال \`get\`/\`set\` تتحقق من صحة القيمة.`,
            fix: { edits },
          });
        }
      }
    });

    // ── 3: nomi di classi e interfacce ──
    const classRe = /\b(class|interface|enum)\s+([A-Za-z_$][\w$]*)/g;
    mLines.forEach((L, li) => {
      classRe.lastIndex = 0;
      let m;
      while ((m = classRe.exec(L))) {
        const name = m[2];
        if (!isPascal(name)) {
          renameFinding(li, name, toPascal(name), {
            severity: 'errore', regola: 'pascal-case', titolo: `Nome di ${m[1] === 'class' ? 'classe' : m[1]} non in PascalCase`,
            it: `Il nome «${name}» deve essere in PascalCase: iniziale maiuscola e ogni parola con la maiuscola, senza underscore (es. ${toPascal(name)}).`,
            ar: `اسم الصنف \`${name}\` يجب أن يُكتب بأسلوب PascalCase: يبدأ بحرف كبير وكل كلمة تبدأ بحرف كبير بدون شرطات (مثل \`${toPascal(name)}\`).`,
          });
        }
      }
    });

    // ── nomi dei metodi ──
    const methRe = new RegExp('(^|[;{}]\\s*|^\\s*)((?:(?:public|private|protected|static|final|abstract|synchronized|default)\\s+)*)(' + TYPE + '|void)\\s+([A-Za-z_$][\\w$]*)\\s*\\(', 'g');
    mLines.forEach((L, li) => {
      if (lineCtx[li] !== 'class') return;
      methRe.lastIndex = 0;
      let m;
      while ((m = methRe.exec(L))) {
        const name = m[4];
        if (JAVA_WORDS.has(name) || name === 'main') continue;
        if (!isCamel(name)) {
          renameFinding(li, name, toCamel(name), {
            severity: 'errore', regola: 'camel-case-metodo', titolo: 'Metodo non in camelCase',
            it: `Il metodo «${name}» deve essere in camelCase e preferibilmente iniziare con un verbo (es. ${toCamel(name)}).`,
            ar: `اسم الدالة \`${name}\` يجب أن يكون بأسلوب camelCase (يبدأ بحرف صغير)، ويُفضّل أن يبدأ بفعل يصف ما تفعله مثل \`${toCamel(name)}\`.`,
          });
        }
      }
    });

    // ── 5: confronto di String con == ──
    const operand = '([\\w$.]+(?:\\(\\s*\\))?|"[^"\\n]*")';
    const strEqRe = new RegExp(operand + '\\s*(==|!=)\\s*' + operand, 'g');
    const STR_METHODS = /\.(toUpperCase|toLowerCase|trim|strip|substring|concat|toString|getNome|getCognome|getTitolare|nextLine|next|replace)\(\s*\)$/;
    const isStrOperand = (s) => s.startsWith('"') || stringNames.has(s.replace(/^this\./, '')) || STR_METHODS.test(s);
    mLines.forEach((L, li) => {
      strEqRe.lastIndex = 0;
      let m;
      while ((m = strEqRe.exec(L))) {
        const a = m[1], op = m[2], b = m[3];
        if (a === 'null' || b === 'null' || /^(true|false|\d.*)$/.test(a) || /^(true|false|\d.*)$/.test(b)) continue;
        if (!(isStrOperand(a) || isStrOperand(b))) continue;
        const oa = oLines[li].slice(m.index, m.index + a.length);
        const bStart = m.index + m[0].length - b.length;
        const ob = oLines[li].slice(bStart, bStart + b.length);
        const left = !oa.startsWith('"') && ob.startsWith('"') ? ob : oa;
        const right = left === ob ? oa : ob;
        const repl = (op === '!=' ? '!' : '') + `${left}.equals(${right})`;
        const s = starts[li] + m.index;
        add({
          line: li + 1, severity: 'errore', regola: 'string-equals', titolo: 'Confronto tra String con ' + op,
          badSnippet: oLines[li].slice(m.index, m.index + m[0].length),
          it: `Le stringhe si confrontano con equals(), non con ${op}: l'operatore ${op} confronta i riferimenti (indirizzi nello Heap), non il contenuto. Due stringhe uguali possono essere oggetti diversi.`,
          ar: `تُقارَن السلاسل النصية بالدالة \`equals()\` وليس بـ \`${op}\`: المعامل \`${op}\` يقارن المراجع (عناوين الكائنات في الـHeap) وليس المحتوى، لذا قد تكون سلسلتان متطابقتان في النص لكنهما كائنان مختلفان فتكون النتيجة خاطئة. ${left.startsWith('"') ? 'وضع النص الثابت أولاً مثل `"ciao".equals(s)` يحمي أيضاً من NullPointerException.' : ''}`,
          fix: { edits: [{ start: s, end: s + m[0].length, text: repl }] },
          suggestedFix: repl,
        });
      }
    });

    // ── 6: confronto ridondante con true/false ──
    const boolRe1 = /([\w$.]+(?:\([^()]*\))?)\s*(==|!=)\s*(true|false)\b/g;
    const boolRe2 = /\b(true|false)\s*(==|!=)\s*([\w$.]+(?:\([^()]*\))?)/g;
    mLines.forEach((L, li) => {
      const handle = (whole, idx, expr, op, lit) => {
        const neg = (op === '==') !== (lit === 'true');
        const orig = oLines[li].slice(idx, idx + whole.length);
        const exprO = expr;
        const repl = (neg ? '!' : '') + exprO;
        add({
          line: li + 1, severity: 'avviso', regola: 'booleano-ridondante', titolo: 'Confronto ridondante con ' + lit,
          badSnippet: orig,
          it: `Confrontare un boolean con ${lit} è ridondante: usa direttamente ${repl}. Una condizione booleana è già vera o falsa.`,
          ar: `مقارنة قيمة منطقية boolean مع \`${lit}\` أمر زائد عن الحاجة: اكتب مباشرة \`${repl}\` لأن الشرط نفسه قيمته true أو false. هذا يجعل الكود أوضح وأقصر.`,
          fix: { edits: [{ start: starts[li] + idx, end: starts[li] + idx + whole.length, text: repl }] },
          suggestedFix: repl,
        });
      };
      let m;
      boolRe1.lastIndex = 0;
      while ((m = boolRe1.exec(L))) {
        if (/^(true|false)$/.test(m[1])) continue;
        handle(m[0], m.index, oLines[li].slice(m.index, m.index + m[1].length), m[2], m[3]);
      }
      boolRe2.lastIndex = 0;
      while ((m = boolRe2.exec(L))) {
        if (/^(true|false)$/.test(m[3])) continue;
        const eStart = m.index + m[0].length - m[3].length;
        handle(m[0], m.index, oLines[li].slice(eStart, eStart + m[3].length), m[2], m[1]);
      }
    });

    // ── 7: catch vuoti, generici o usati per il flusso ──
    const catchRe = /catch\s*\(\s*(?:final\s+)?([\w$.|\s]+?)\s+([A-Za-z_$][\w$]*)\s*\)\s*\{/g;
    let cm;
    while ((cm = catchRe.exec(masked))) {
      const types = cm[1].split('|').map((t) => t.trim());
      const v = cm[2];
      const li = masked.slice(0, cm.index).split('\n').length - 1;
      const braceIdx = cm.index + cm[0].length - 1;
      const close = findMatching(masked, braceIdx);
      const body = close > 0 ? masked.slice(braceIdx + 1, close) : 'x';
      if (!body.trim()) {
        const indent = (oLines[li].match(/^\s*/) || [''])[0];
        const text = `{\n${indent}    System.err.println("Errore: " + ${v}.getMessage());\n${indent}}`;
        add({
          line: li + 1, severity: 'errore', regola: 'catch-vuoto', titolo: 'Blocco catch vuoto',
          it: 'Un blocco catch vuoto "inghiotte" l\'eccezione: l\'errore sparisce senza traccia e il programma continua in uno stato inconsistente. Gestisci l\'errore o almeno segnalalo.',
          ar: 'كتلة `catch` الفارغة "تبتلع" الاستثناء: يختفي الخطأ دون أي أثر ويستمر البرنامج في حالة غير سليمة، فيصبح اكتشاف المشكلة صعباً جداً. عالج الخطأ أو على الأقل اطبع رسالة توضّحه.',
          fix: { edits: [{ start: braceIdx, end: close + 1, text }] },
          suggestedFix: `catch (${types.join(' | ')} ${v}) { System.err.println("Errore: " + ${v}.getMessage()); }`,
        });
      }
      for (const t of types) {
        if (t === 'Exception' || t === 'Throwable') {
          add({
            line: li + 1, severity: 'avviso', regola: 'catch-generico', titolo: `catch (${t}) troppo generico`,
            it: `Catturare ${t} intercetta qualunque errore, anche quelli di programmazione (es. NullPointerException) che andrebbero corretti. Cattura le eccezioni specifiche che ti aspetti.`,
            ar: `التقاط \`${t}\` يلتقط أي خطأ، حتى أخطاء البرمجة مثل \`NullPointerException\` التي يجب تصحيحها لا إخفاؤها. التقط الاستثناءات المحددة التي تتوقعها فقط (مثل \`NumberFormatException\`).`,
          });
        }
        if (/^(NullPointerException|ArrayIndexOutOfBoundsException|IndexOutOfBoundsException|StringIndexOutOfBoundsException|ClassCastException)$/.test(t)) {
          add({
            line: li + 1, severity: 'avviso', regola: 'eccezioni-flusso', titolo: `Eccezione ${t} usata per controllare il flusso`,
            it: `${t} segnala un errore di programmazione: non va catturata per gestire il flusso normale. Previenila con un controllo (es. if (x != null) oppure if (i < arr.length)).`,
            ar: `الاستثناء \`${t}\` يدل على خطأ برمجي ولا يجوز استخدامه للتحكم في سير البرنامج. امنعه مسبقاً بشرط بسيط مثل \`if (x != null)\` أو \`if (i < arr.length)\` بدلاً من التقاطه.`,
          });
        }
      }
    }

    // ── 8: numeri magici ──
    mLines.forEach((L, li) => {
      const ctx = lineCtx[li];
      if (!['method', 'block', 'loop', 'switch'].includes(ctx)) return;
      // I dati di prova nel main non sono considerati numeri magici.
      if (inMain[li]) return;
      if (/\bfinal\b/.test(L) || /^\s*case\b/.test(L) || /^\s*return\s+-?\d+\s*;/.test(L)) return;
      // Un letterale come unico inizializzatore di una variabile ha già un nome che lo spiega.
      if (new RegExp('^\\s*' + TYPE + '\\s+[\\w$]+\\s*=\\s*(-?[\\d.]+[fFdDlL]?|\\{[\\d.,\\s-]*\\})\\s*;\\s*$').test(L)) return;
      const nums = [];
      const re = /\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFdDlL]?/g;
      let m;
      while ((m = re.exec(L))) {
        const prev = L[m.index - 1] || ' ';
        const next = L[m.index + m[0].length] || ' ';
        if (/[\w$.]/.test(prev) || /[\w$.]/.test(next)) continue;
        const val = parseFloat(m[0]);
        if ([0, 1, 2].includes(val)) continue;
        const before = L.slice(0, m.index).replace(/\s+$/, '');
        const after = L.slice(m.index + m[0].length).replace(/^\s+/, '');
        if (before.endsWith('[') && after.startsWith(']')) continue;
        nums.push(m[0]);
      }
      if (nums.length) {
        add({
          line: li + 1, severity: 'suggerimento', regola: 'numero-magico', titolo: 'Numero magico: ' + nums.join(', '),
          it: `Il valore ${nums.join(', ')} compare "a sorpresa" nel codice: dichiaralo come costante con nome (es. private static final double ALIQUOTA_IVA = 0.22;) per renderne chiaro il significato e facilitarne la modifica.`,
          ar: `القيمة ${nums.join('، ')} تظهر في الكود دون اسم يشرح معناها (رقم سحري Magic Number). صرّح عنها كثابت باسم واضح مثل \`private static final double ALIQUOTA_IVA = 0.22;\` ليفهم القارئ معناها ويسهل تعديلها في مكان واحد.`,
        });
      }
    });

    // ── 9: break / continue non strutturati ──
    for (const j of jumps) {
      if (j.kw === 'break' && j.target === 'switch') continue;
      if (j.kw === 'break' && !j.target) continue;
      add({
        line: j.line + 1, severity: 'avviso', regola: 'salto-non-strutturato', titolo: `${j.kw} dentro un ciclo`,
        it: j.kw === 'break'
          ? 'break dentro un ciclo è un salto non strutturato: il ciclo ha due punti di uscita. Inserisci la condizione di uscita direttamente nella condizione del while/for (es. con una variabile boolean trovato).'
          : 'continue è un salto non strutturato che rende il flusso più difficile da seguire: riscrivi il corpo del ciclo con un if che racchiude le istruzioni da eseguire.',
        ar: j.kw === 'break'
          ? 'استخدام `break` داخل حلقة قفزة غير مُهيكلة تجعل للحلقة أكثر من نقطة خروج. ضع شرط الخروج مباشرة في شرط `while`/`for` (مثلاً باستخدام متغير boolean مثل `trovato`). استخدام `break` مسموح فقط داخل `switch`.'
          : 'الأمر `continue` قفزة غير مُهيكلة تصعّب تتبع سير الحلقة: أعد كتابة جسم الحلقة باستخدام `if` يحيط بالتعليمات المراد تنفيذها.',
      });
    }

    // ── 10: risorse (Scanner, file) aperte e mai chiuse ──
    const RES_RE = /\b(\w+)\s*=\s*new\s+(Scanner|BufferedReader|PrintWriter|FileReader|FileWriter|BufferedWriter)\s*\(/g;
    let rm;
    while ((rm = RES_RE.exec(masked))) {
      const nome = rm[1], tipo = rm[2];
      // dichiarata tra le parentesi di un try-with-resources?
      let depth = 0, inTry = false;
      for (let k = rm.index - 1; k >= 0; k--) {
        const ch = masked[k];
        if (ch === ')') depth++;
        else if (ch === '(') {
          if (depth === 0) { inTry = /\btry\s*$/.test(masked.slice(Math.max(0, k - 10), k)); break; }
          depth--;
        } else if ((ch === '{' || ch === '}') && depth === 0) break;
      }
      if (inTry || new RegExp('\\b' + nome + '\\s*\\.\\s*close\\s*\\(').test(masked)) continue;
      const line = masked.slice(0, rm.index).split('\n').length;
      add({
        line, severity: 'avviso', regola: 'risorsa-non-chiusa', titolo: `Risorsa ${tipo} non chiusa`,
        it: `Lo ${tipo} «${nome}» viene aperto ma mai chiuso: le risorse (Scanner, file) vanno chiuse con ${nome}.close() oppure, meglio, dichiarate in un try-with-resources che le chiude automaticamente. Un PrintWriter non chiuso può lasciare il file vuoto.`,
        ar: `المورد \`${tipo}\` باسم \`${nome}\` يُفتح ولا يُغلق أبداً: يجب إغلاق الموارد (Scanner والملفات) عبر \`${nome}.close()\`، أو الأفضل التصريح عنها داخل \`try-with-resources\` التي تغلقها تلقائياً. الـ\`PrintWriter\` غير المغلق قد يترك الملف فارغاً.`,
      });
    }

    // ── extra: if/for/while senza parentesi graffe ──
    mLines.forEach((L, li) => {
      const m = /^(\s*)(?:\}\s*)?(if|for|while|else if)\s*\(/.exec(L);
      if (!m) return;
      if (m[2] === 'while' && /^\s*\}/.test(L)) return; // coda di un do-while
      const openIdx = starts[li] + L.indexOf('(', m.index + m[1].length);
      const close = findMatching(masked, openIdx);
      if (close < 0) return;
      const lineEnd = starts[li] + L.length;
      if (close > lineEnd) return;
      const rest = masked.slice(close + 1, lineEnd);
      if (!rest.trim() || rest.trim().startsWith('{') || !rest.trim().endsWith(';')) return;
      const stmtStart = close + 1 + rest.search(/\S/);
      const stmt = code.slice(stmtStart, lineEnd).trim();
      add({
        line: li + 1, severity: 'suggerimento', regola: 'graffe', titolo: 'Corpo senza parentesi graffe',
        it: `Il corpo di ${m[2]} non è racchiuso tra { }: aggiungere le graffe anche per una sola istruzione evita errori quando in futuro si aggiungono altre righe.`,
        ar: `جسم \`${m[2]}\` غير محاط بالأقواس \`{ }\`: أضف الأقواس دائماً حتى لو كانت تعليمة واحدة، لتجنب الأخطاء عند إضافة أسطر جديدة لاحقاً (من القواعد المعتمدة في الجامعات الإيطالية).`,
        fix: { edits: [{ start: stmtStart, end: lineEnd, text: `{ ${stmt} }` }] },
      });
    });

    findings.sort((a, b) => a.line - b.line || SEV[b.severity] - SEV[a.severity]);
    return findings;
  }

  /** Applica la correzione automatica di una segnalazione. Restituisce il nuovo codice (o quello originale se non correggibile). */
  function applicaCorrezione(src, finding) {
    if (!finding || !finding.fix || !finding.fix.edits) return src;
    return applyEditsTo(String(src).replace(/\r\n?/g, '\n'), finding.fix.edits);
  }

  /** Calcola il voto in trentesimi a partire dalle segnalazioni e dall'esito dell'esecuzione. */
  function calcolaVoto(findings, esito) {
    let penalty = 0;
    for (const f of findings || []) penalty += SEV[f.severity] || 0;
    penalty = Math.min(penalty, 16);
    let voto = 30 - penalty;
    if (esito && esito.error && esito.error.type === 'compile') voto = Math.min(voto, 14);
    else if (esito && esito.error && esito.error.type === 'limit') voto -= 6;
    else if (esito && esito.exception) voto -= 4;
    voto = Math.max(0, Math.round(voto));
    const lode = voto === 30 && (!findings || findings.length === 0) && esito && esito.ok && !esito.exception;
    let giudizio;
    if (lode) giudizio = '30 e Lode';
    else if (voto >= 28) giudizio = 'Ottimo';
    else if (voto >= 25) giudizio = 'Buono';
    else if (voto >= 18) giudizio = 'Sufficiente';
    else giudizio = 'Respinto';
    return { voto, lode, giudizio, superato: voto >= 18 };
  }

  const api = { analizza, applicaCorrezione, calcolaVoto, maskCode, toCamel, toPascal, toUpperSnake };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CFLinter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
