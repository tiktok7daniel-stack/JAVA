/*
 * CodeForge — Motore "Tap-to-Understand" per le righe di codice Java
 * e colorazione della sintassi. Ogni riga riceve: termine tecnico (IT),
 * traduzione araba, spiegazione dettagliata in arabo (memoria Stack/Heap)
 * e la regola di Buona Norma collegata.
 */
(function (root) {
  'use strict';

  // ───────────── Syntax highlighting ─────────────
  const KW = new Set(['abstract', 'assert', 'break', 'case', 'catch', 'class', 'continue', 'default', 'do', 'else', 'enum',
    'extends', 'final', 'finally', 'for', 'if', 'implements', 'import', 'instanceof', 'interface', 'native', 'new', 'package',
    'private', 'protected', 'public', 'return', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
    'transient', 'try', 'volatile', 'while', 'var', 'record']);
  const PRIM = new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char', 'void']);
  const LIT = new Set(['true', 'false', 'null']);

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /** Colora un intero sorgente; restituisce un array di righe HTML. */
  function highlight(code) {
    const lines = String(code).replace(/\r\n?/g, '\n').split('\n');
    let inComment = false;
    return lines.map((line) => {
      let out = '';
      let i = 0;
      const n = line.length;
      while (i < n) {
        if (inComment) {
          const end = line.indexOf('*/', i);
          const stop = end < 0 ? n : end + 2;
          out += '<span class="tk-com">' + esc(line.slice(i, stop)) + '</span>';
          i = stop;
          if (end >= 0) inComment = false;
          continue;
        }
        const c = line[i];
        if (c === '/' && line[i + 1] === '/') { out += '<span class="tk-com">' + esc(line.slice(i)) + '</span>'; break; }
        if (c === '/' && line[i + 1] === '*') { inComment = true; continue; }
        if (c === '"' || c === "'") {
          let j = i + 1;
          while (j < n && line[j] !== c) j += line[j] === '\\' ? 2 : 1;
          j = Math.min(n, j + 1);
          out += '<span class="tk-str">' + esc(line.slice(i, j)) + '</span>';
          i = j;
          continue;
        }
        if (/[0-9]/.test(c) && !/[\w$]/.test(line[i - 1] || '')) {
          const m = /^(0[xX][0-9a-fA-F_]+|\d[\d_]*(\.\d+)?([eE][+-]?\d+)?[fFdDlL]?)/.exec(line.slice(i));
          out += '<span class="tk-num">' + esc(m[0]) + '</span>';
          i += m[0].length;
          continue;
        }
        if (c === '@' && /[A-Za-z]/.test(line[i + 1] || '')) {
          const m = /^@[\w$]+/.exec(line.slice(i));
          out += '<span class="tk-ann">' + esc(m[0]) + '</span>';
          i += m[0].length;
          continue;
        }
        if (/[A-Za-z_$]/.test(c)) {
          const m = /^[\w$]+/.exec(line.slice(i));
          const w = m[0];
          let cls = '';
          if (KW.has(w)) cls = 'tk-kw';
          else if (PRIM.has(w)) cls = 'tk-ty';
          else if (LIT.has(w)) cls = 'tk-lit';
          else if (/^[A-Z][A-Z0-9_]+$/.test(w) && w.length > 1) cls = 'tk-const';
          else if (/^[A-Z]/.test(w)) cls = 'tk-cls';
          else if (/^\s*\(/.test(line.slice(i + w.length))) cls = 'tk-fn';
          out += cls ? `<span class="${cls}">${esc(w)}</span>` : esc(w);
          i += w.length;
          continue;
        }
        if (/[{}()[\];,.]/.test(c)) { out += '<span class="tk-pun">' + esc(c) + '</span>'; i++; continue; }
        if (/[=+\-*/%<>!&|^?:~]/.test(c)) { out += '<span class="tk-op">' + esc(c) + '</span>'; i++; continue; }
        out += esc(c);
        i++;
      }
      return out || ' ';
    });
  }

  // ───────────── Spiegazioni per riga ─────────────
  const TYPE_AR = {
    int: ['عدد صحيح', 'عدد صحيح بحجم 32 بت (من −2,147,483,648 إلى 2,147,483,647)'],
    long: ['عدد صحيح طويل', 'عدد صحيح بحجم 64 بت للقيم الكبيرة جداً'],
    short: ['عدد صحيح قصير', 'عدد صحيح بحجم 16 بت'],
    byte: ['بايت', 'عدد صحيح بحجم 8 بت (من −128 إلى 127)'],
    double: ['عدد عشري مزدوج الدقة', 'عدد عشري بحجم 64 بت، وهو النوع الافتراضي للأعداد ذات الفاصلة'],
    float: ['عدد عشري أحادي الدقة', 'عدد عشري بحجم 32 بت، يحتاج إلى اللاحقة f مثل 3.5f'],
    boolean: ['قيمة منطقية', 'قيمة منطقية تأخذ true أو false فقط'],
    char: ['حرف', 'حرف واحد بترميز Unicode بحجم 16 بت يُكتب بين علامتي \' \''],
    String: ['سلسلة نصية', 'كائن نصي غير قابل للتعديل (immutable)؛ المتغير يحمل مرجعاً إلى الكائن'],
  };
  const PRIMS = new Set(['int', 'long', 'short', 'byte', 'double', 'float', 'boolean', 'char']);
  const c = (s) => '`' + s + '`';

  function typeInfo(type) {
    const base = type.replace(/<.*>/, '').replace(/\[\]/g, '').trim();
    const isArr = /\[\]/.test(type);
    if (isArr) return { prim: false, ar: `مصفوفة من ${TYPE_AR[base] ? TYPE_AR[base][0] : base}`, det: `المصفوفة (array) كائن في الـHeap يحتوي على عناصر من النوع ${c(base)} بحجم ثابت، والمتغير في الـStack يحمل مرجعاً إليها. أول عنصر فهرسه 0 وآخر عنصر فهرسه length-1.` };
    if (TYPE_AR[base]) return { prim: PRIMS.has(base), ar: TYPE_AR[base][0], det: TYPE_AR[base][1] };
    return { prim: false, ar: `مرجع إلى كائن من الصنف ${base}`, det: `${c(base)} نوع مرجعي (صنف): المتغير لا يحتوي على الكائن نفسه بل على عنوانه (مرجع) في الـHeap.` };
  }

  const CONTROL = /^(if|for|while|switch|catch|return|throw|new|else|do|try|synchronized|case|package|import|break|continue|default)\b/;
  const badType = (t) => !t || CONTROL.test(t) || /[=.()]/.test(t);
  const R = [];
  const rule = (re, fn) => R.push([re, fn]);

  rule(/^\s*$/, () => ({
    t: 'Riga vuota', ar: 'سطر فارغ',
    ex: 'الأسطر الفارغة لا يقرؤها المترجم، لكنها تفصل بين الأجزاء المنطقية للكود وتجعله أسهل في القراءة.',
    bn: 'Separa i blocchi logici (attributi, costruttori, metodi) con una riga vuota.', bnAr: 'افصل بين الأجزاء المنطقية (الحقول، المُنشئات، الدوال) بسطر فارغ لتحسين الوضوح.',
  }));
  rule(/^\s*(\/\/|\/\*|\*)/, () => ({
    t: 'Commento', ar: 'تعليق',
    ex: 'التعليقات يتجاهلها المترجم تماماً: `//` لسطر واحد و `/* ... */` لعدة أسطر و `/** ... */` لتوثيق Javadoc.',
    bn: 'Commenta il "perché", non il "cosa": il codice deve spiegarsi da solo con nomi chiari.', bnAr: 'اكتب في التعليق "لماذا" وليس "ماذا"؛ الكود نفسه يجب أن يكون واضحاً بأسماء معبّرة.',
  }));
  rule(/^\s*(package|import)\b\s*([\w.*]+)/, (m) => ({
    t: m[1] === 'import' ? 'Importazione (import)' : 'Pacchetto (package)', ar: m[1] === 'import' ? 'استيراد صنف' : 'تحديد الحزمة',
    ex: m[1] === 'import'
      ? `الأمر ${c('import ' + m[2])} يسمح باستخدام صنف من مكتبة أخرى باسمه المختصر دون كتابة اسمه الكامل في كل مرة. الحزمة ${c('java.lang')} (مثل String و Math) مستوردة تلقائياً.`
      : `يحدد الحزمة (package) التي ينتمي إليها هذا الملف؛ الحزم تنظّم الأصناف مثل المجلدات.`,
    bn: 'Importa solo le classi che usi: evita import con * nei progetti d\'esame.', bnAr: 'استورد فقط الأصناف التي تستخدمها، وتجنب الاستيراد بـ * في مشاريع الامتحان.',
  }));
  rule(/^\s*@Override/, () => ({
    t: 'Annotazione @Override', ar: 'وسم إعادة التعريف',
    ex: 'الوسم `@Override` يخبر المترجم أن الدالة التالية تعيد تعريف (override) دالة من الصنف الأب أو الواجهة. إذا أخطأت في الاسم أو المعاملات سيظهر خطأ ترجمة فوراً بدلاً من خطأ صامت.',
    bn: 'Usa sempre @Override quando ridefinisci un metodo: il compilatore verifica la firma.', bnAr: 'استخدم دائماً @Override عند إعادة تعريف دالة ليتحقق المترجم من صحة التوقيع.',
  }));
  rule(/^\s*public\s+static\s+void\s+main\s*\(\s*String\s*(\[\])?\s*\w+\s*(\[\])?\s*\)/, () => ({
    t: 'Metodo main (punto di ingresso)', ar: 'الدالة الرئيسية main (نقطة البداية)',
    ex: '`public` لتتمكن JVM من استدعائها، و`static` لأنها تُستدعى دون إنشاء كائن، و`void` لأنها لا تُعيد قيمة، و`String[] args` مصفوفة معاملات سطر الأوامر. عند التشغيل تُنشئ JVM أول إطار (frame) في الـStack لهذه الدالة.',
    bn: 'Il main deve restare breve: crea gli oggetti e delega il lavoro ai metodi delle classi.', bnAr: 'اجعل main قصيرة: تُنشئ الكائنات وتستدعي دوالها، ولا تضع فيها كل منطق البرنامج.',
  }));
  // ── Costrutti dei livelli avanzati (Scanner, enum, collezioni, lambda, stream, file) ──
  rule(/^\s*((?:public)\s+)?enum\s+(\w+)/, (m) => ({
    t: 'Tipo enumerativo (enum)', ar: 'نوع تعدادي',
    ex: `${c('enum ' + m[2])} يعرّف نوعاً لا يقبل إلا مجموعة ثابتة من القيم المسمّاة. كل ثابت كائن فريد يُنشأ مرة واحدة، ويمكن مقارنته بـ ${c('==')} واستخدامه في ${c('switch')}.`,
    bn: 'Usa un enum invece di costanti int quando i valori formano un insieme chiuso.', bnAr: 'استخدم enum بدلاً من ثوابت int عندما تكون القيم مجموعة مغلقة.',
  }));
  rule(/^\s*[A-Z][A-Z0-9_]*(?:\([^)]*\))?\s*(?:,\s*[A-Z][A-Z0-9_]*(?:\([^)]*\))?\s*)*[;,]?\s*$/, (m) => ({
    t: 'Costanti dell\'enum', ar: 'ثوابت التعداد',
    ex: `هذه هي القيم الوحيدة الممكنة للتعداد: ${c(m[0].trim())}. إن كان بجانب الثابت قوسان فهما وسيطات تُمرَّر إلى مُنشئ التعداد.`,
    bn: 'Le costanti di un enum si scrivono in MAIUSCOLO.', bnAr: 'ثوابت التعداد تُكتب بأحرف كبيرة.',
  }));
  rule(/^\s*(?:\}\s*)?case\s+(.+?)\s*->/, (m) => ({
    t: 'case con freccia (switch moderno)', ar: 'حالة switch بالسهم',
    ex: `إذا كانت القيمة ${c(m[1])} يُنفَّذ ما بعد السهم ${c('->')} فقط، دون سقوط إلى الحالات التالية ودون الحاجة إلى ${c('break')}.`,
    bn: 'Preferisci le frecce: niente fall-through accidentali.', bnAr: 'فضّل الأسهم لتجنب السقوط غير المقصود.',
  }));
  rule(/^\s*try\s*\((.*)/, () => ({
    t: 'try-with-resources', ar: 'try مع الموارد',
    ex: `الموارد المعلنة بين قوسي ${c('try ( ... )')} (ملفات، Scanner) تُغلق تلقائياً في نهاية الكتلة، حتى لو حدث استثناء. لا حاجة إلى ${c('finally')} ولا إلى ${c('close()')} يدوياً.`,
    bn: 'Apri file e Scanner sempre con try-with-resources.', bnAr: 'افتح الملفات والـScanner دائماً بـ try-with-resources.',
  }));
  rule(/new\s+Scanner\s*\(\s*System\.in\s*\)/, () => ({
    t: 'Scanner (lettura da tastiera)', ar: 'قارئ الإدخال Scanner',
    ex: `يُنشئ كائن ${c('Scanner')} في الـHeap يقرأ من ${c('System.in')} (لوحة المفاتيح). في المحاكي يأتي الإدخال من خانة «Input (stdin)». تذكّر إغلاقه في النهاية بـ ${c('close()')}.`,
    bn: 'Crea un solo Scanner su System.in e chiudilo alla fine.', bnAr: 'أنشئ Scanner واحداً على System.in وأغلقه في النهاية.',
  }));
  rule(/\.(nextInt|nextDouble|nextLine|next|nextBoolean|nextLong|hasNextInt|hasNextLine|hasNext)\s*\(\s*\)/, (m) => ({
    t: `Lettura con ${m[1]}()`, ar: 'قراءة إدخال',
    ex: {
      nextInt: `${c('nextInt()')} تقرأ العدد الصحيح التالي وتترك سطر الإدخال (Invio) في الذاكرة المؤقتة: إن استدعيت ${c('nextLine()')} بعدها مباشرة ستحصل على نص فارغ — فخ كلاسيكي!`,
      nextDouble: `${c('nextDouble()')} تقرأ عدداً عشرياً. مع الإعداد الإيطالي (Locale) يُكتب بفاصلة مثل ${c('27,5')}.`,
      nextLine: `${c('nextLine()')} تقرأ السطر كاملاً حتى زر Invio، بما فيه المسافات (مثل الاسم والكنية).`,
      next: `${c('next()')} تقرأ الكلمة التالية فقط حتى أول مسافة.`,
    }[m[1]] || `${c(m[1] + '()')} تفحص أو تقرأ القيمة التالية من الإدخال.`,
    bn: 'Dopo nextInt() o nextDouble() consuma il fine riga con nextLine() prima di leggere un testo.', bnAr: 'بعد nextInt() أو nextDouble() استهلك نهاية السطر بـ nextLine() قبل قراءة نص.',
  }));
  rule(/new\s+(BufferedReader|FileReader|PrintWriter|FileWriter)\s*\(/, (m) => ({
    t: m[1] === 'BufferedReader' || m[1] === 'FileReader' ? 'Lettura di un file' : 'Scrittura di un file', ar: m[1].includes('Read') ? 'قراءة ملف' : 'كتابة ملف',
    ex: m[1].includes('Read')
      ? `${c('BufferedReader')} يقرأ الملف سطراً بسطر بـ ${c('readLine()')} التي تُعيد ${c('null')} عند نهاية الملف. إن لم يوجد الملف يُرمى ${c('FileNotFoundException')} (استثناء مفحوص).`
      : `${c('PrintWriter')} يكتب في الملف بـ ${c('print')} و ${c('println')} مثل System.out. البيانات لا تُكتب فعلياً إلا عند ${c('close()')} أو ${c('flush()')}.`,
    bn: 'Gestisci IOException e chiudi sempre il file.', bnAr: 'عالج IOException وأغلق الملف دائماً.',
  }));
  rule(/^\s*\.(filter|map|mapToInt|mapToDouble|sorted|distinct|limit|collect|forEach|reduce|count|average|sum|max|min|orElse)\s*\(/, (m) => ({
    t: `Operazione di stream: ${m[1]}`, ar: 'عملية على التدفق Stream',
    ex: {
      filter: `${c('filter')} تُبقي فقط العناصر التي يكون الشرط (اللامدا) صحيحاً لها.`,
      map: `${c('map')} تحوّل كل عنصر إلى قيمة جديدة.`,
      sorted: `${c('sorted')} ترتب العناصر (طبيعياً أو بالمقارن الممرَّر).`,
      collect: `${c('collect')} عملية نهائية تجمع النتيجة في قائمة أو نص أو خريطة؛ عندها فقط يبدأ تنفيذ خط المعالجة.`,
      forEach: `${c('forEach')} عملية نهائية تنفّذ إجراءً على كل عنصر.`,
    }[m[1]] || `${c(m[1])} خطوة في خط معالجة الـStream: العمليات الوسيطة كسولة، والعملية النهائية تشغّل كل شيء.`,
    bn: 'Una operazione per riga rende leggibile la pipeline.', bnAr: 'عملية واحدة في كل سطر تجعل خط المعالجة مقروءاً.',
  }));
  rule(/\.stream\s*\(\s*\)/, () => ({
    t: 'Stream API', ar: 'واجهة التدفقات Stream',
    ex: `${c('stream()')} يحوّل المجموعة إلى تدفق من العناصر نبني عليه سلسلة عمليات (filter، map، sorted...) تنتهي بعملية نهائية. الـStream لا يعدّل المجموعة الأصلية.`,
    bn: 'Niente effetti collaterali dentro le operazioni dello stream.', bnAr: 'لا آثار جانبية داخل عمليات الـstream.',
  }));
  rule(/new\s+(ArrayList|LinkedList|HashMap|TreeMap|LinkedHashMap|HashSet|TreeSet|LinkedHashSet)\s*</, (m) => ({
    t: `Collezione ${m[1]}`, ar: 'مجموعة (Collection)',
    ex: /Map/.test(m[1])
      ? `${c(m[1])} خريطة تربط كل مفتاح فريد بقيمة. ${c('put')} تضيف أو تستبدل، و ${c('get')} تُعيد القيمة أو ${c('null')}.${m[1] === 'HashMap' ? ' ترتيب العناصر يعتمد على الـhash وليس على ترتيب الإضافة.' : ''}`
      : /Set/.test(m[1])
        ? `${c(m[1])} مجموعة لا تقبل التكرار: ${c('add')} تُعيد false إن كان العنصر موجوداً.`
        : `${c(m[1])} قائمة تكبر تلقائياً: ${c('add')} و ${c('get')} و ${c('remove')} و ${c('size()')}. المعامل الماسي ${c('<>')} يستنتج نوع العناصر.`,
    bn: 'Dichiara la variabile con l\'interfaccia (List, Map, Set).', bnAr: 'صرّح عن المتغير بنوع الواجهة (List أو Map أو Set).',
  }));
  rule(/\.(merge|getOrDefault|computeIfAbsent|entrySet|keySet|putIfAbsent)\s*\(/, (m) => ({
    t: `Metodo di Map: ${m[1]}`, ar: 'دالة على الخريطة',
    ex: {
      merge: `${c('merge(k, v, f)')} تضع v إن لم يوجد المفتاح، وإلا تدمج القيمة القديمة مع v بالدالة f (مثلاً ${c('Integer::sum')} للعدّ).`,
      getOrDefault: `${c('getOrDefault(k, d)')} تُعيد قيمة المفتاح أو القيمة الافتراضية d إن لم يوجد، فتتجنب ${c('null')}.`,
      entrySet: `${c('entrySet()')} تُعيد كل الأزواج مفتاح/قيمة للمرور عليها مع ${c('getKey()')} و ${c('getValue()')}.`,
    }[m[1]] || `${c(m[1])} دالة مفيدة للتعامل مع مفاتيح الخريطة وقيمها.`,
    bn: 'Usa getOrDefault e merge invece di controlli manuali su null.', bnAr: 'استخدم getOrDefault و merge بدلاً من فحص null يدوياً.',
  }));
  rule(/(\w+|\([^()]*\))\s*->/, (m) => ({
    t: 'Espressione lambda', ar: 'تعبير لامدا',
    ex: `${c(m[1] + ' -> ...')} دالة مجهولة قصيرة: على يسار السهم المعاملات وعلى يمينه النتيجة. تُستخدم مكان واجهة وظيفية (دالة مجردة واحدة) مثل Comparator أو Predicate. المتغيرات الخارجية فيها يجب ألا تتغير (effectively final).`,
    bn: 'Lambda brevi; se servono più righe, estrai un metodo.', bnAr: 'لامدا قصيرة، وإن احتاجت أسطراً كثيرة فاستخرج دالة.',
  }));
  rule(/(\w+)::(\w+)/, (m) => ({
    t: 'Method reference (::)', ar: 'مرجع إلى دالة',
    ex: `${c(m[0])} صيغة مختصرة للامدا تستدعي الدالة ${c(m[2])}، مثل ${c('x -> x.' + m[2] + '()')} أو ${c(m[1] + '.' + m[2] + '(x)')}.`,
    bn: 'Preferisci il method reference quando la lambda chiama solo un metodo.', bnAr: 'فضّل مرجع الدالة عندما تستدعي اللامدا دالة واحدة فقط.',
  }));
  rule(/^\s*((?:public|private|protected|abstract|final|static)\s+)*(class|interface)\s+(\w+)(?:\s*<[^>]*>)?(?:\s+extends\s+([\w\s,<>]+?))?(?:\s+implements\s+([\w\s,<>]+?))?\s*\{?\s*$/, (m) => {
    const isI = m[2] === 'interface';
    const abs = /abstract/.test(m[1] || '');
    let ex = isI
      ? `تصريح عن الواجهة (interface) ${c(m[3])}: عقد يحدد "ماذا" يجب أن تفعل الأصناف التي تطبّقها دون تحديد "كيف". الدوال فيها مجردة (abstract) و public ضمنياً.`
      : `تصريح عن الصنف ${c(m[3])}: الصنف قالب (مخطط) يصف الحالة (الحقول) والسلوك (الدوال) للكائنات التي ستُنشأ منه بـ new في الـHeap.`;
    if (abs) ex += ' الكلمة `abstract` تعني أن الصنف مجرد: لا يمكن إنشاء كائنات منه مباشرة، بل يُستخدم كأب للأصناف الفرعية.';
    if (m[4]) ex += ` الكلمة ${c('extends ' + m[4].trim())} تعني الوراثة: يرث الحقول والدوال من الصنف الأب (علاقة "هو نوع من" is-a).`;
    if (m[5]) ex += ` الكلمة ${c('implements ' + m[5].trim())} تعني أن الصنف يلتزم بتنفيذ جميع دوال الواجهة.`;
    if (/public/.test(m[1] || '')) ex += ' الصنف العام public يجب أن يكون في ملف يحمل نفس اسمه تماماً (' + m[3] + '.java).';
    return {
      t: isI ? 'Dichiarazione di interfaccia' : abs ? 'Dichiarazione di classe astratta' : m[4] ? 'Classe derivata (sottoclasse)' : 'Dichiarazione di classe',
      ar: isI ? 'تعريف واجهة' : abs ? 'تعريف صنف مجرد' : m[4] ? 'تعريف صنف فرعي (وارث)' : 'تعريف صنف',
      ex,
      bn: 'Nomi di classi e interfacce in PascalCase (es. ContoCorrente); una classe pubblica per file.',
      bnAr: 'أسماء الأصناف والواجهات بأسلوب PascalCase (مثل ContoCorrente)، وصنف عام واحد فقط في كل ملف.',
    };
  });
  rule(/^\s*(public|private|protected)?\s*([A-Z]\w*)\s*\(([^)]*)\)\s*(throws\s+[\w\s,]+)?\{?\s*$/, (m) => ({
    t: 'Costruttore', ar: 'المُنشئ (Constructor)',
    ex: `المُنشئ ${c(m[2] + '(' + m[3].trim() + ')')} يُستدعى تلقائياً مع ${c('new ' + m[2] + '(...)')}: بعد أن تحجز JVM مساحة الكائن في الـHeap، يقوم المُنشئ بتهيئة حقوله. ليس له نوع إرجاع (ولا حتى void) واسمه مطابق لاسم الصنف. ${m[3].trim() ? 'معاملاته متغيرات محلية في إطار المُنشئ داخل الـStack.' : 'هذا مُنشئ بدون معاملات.'}`,
    bn: 'Il costruttore deve lasciare l\'oggetto in uno stato valido: inizializza tutti gli attributi e valida i parametri.',
    bnAr: 'يجب أن يترك المُنشئ الكائن في حالة صحيحة: هيّئ جميع الحقول وتحقق من صحة المعاملات (مثلاً رصيد غير سالب).',
  }));
  rule(/^\s*((?:public|private|protected|static|final|abstract|synchronized|default)\s+)*([\w<>[\],\s]+?)\s+(\w+)\s*\(([^)]*)\)\s*(throws\s+([\w\s,]+?))?\s*(\{|;)?\s*$/, (m) => {
    const mods = m[1] || '';
    const ret = m[2].trim(), name = m[3], params = m[4].trim();
    if (badType(ret) || badType(name)) return null;
    const isGet = /^(get|is)[A-Z]/.test(name), isSet = /^set[A-Z]/.test(name);
    let ex = `تصريح عن الدالة ${c(name)}: توقيع الدالة (firma) هو الاسم مع أنواع المعاملات ${c(name + '(' + params + ')')}. نوع القيمة المُعادة ${c(ret)}${ret === 'void' ? ' يعني أنها لا تُعيد أي قيمة' : ''}. عند استدعائها يُنشأ إطار جديد في الـStack يحتوي على المعاملات والمتغيرات المحلية، ويُزال عند انتهائها.`;
    if (/static/.test(mods)) ex += ' الكلمة `static` تعني أنها تنتمي إلى الصنف نفسه وليس إلى كائن، فتُستدعى بدون إنشاء كائن ولا يمكنها استخدام this.';
    if (/abstract/.test(mods) || m[7] === ';') ex += ' هذه دالة مجردة بلا جسم: يجب على الأصناف الفرعية تقديم تنفيذها.';
    if (m[5]) ex += ` العبارة ${c(m[5].trim())} تُعلن أن الدالة قد ترمي هذه الاستثناءات، فيجب على المستدعي معالجتها بـ try-catch أو إعادة إعلانها (للاستثناءات المُراقَبة checked).`;
    if (isGet) ex += ' هذه دالة getter: تُعيد قيمة حقل خاص (private) دون كشفه مباشرة — جزء من مبدأ التغليف.';
    if (isSet) ex += ' هذه دالة setter: تغيّر حقلاً خاصاً بعد التحقق من صحة القيمة الجديدة — جزء من مبدأ التغليف.';
    return {
      t: isGet ? 'Metodo accessore (getter)' : isSet ? 'Metodo modificatore (setter)' : /abstract/.test(mods) ? 'Metodo astratto' : /static/.test(mods) ? 'Metodo statico' : 'Dichiarazione di metodo',
      ar: isGet ? 'دالة قراءة (getter)' : isSet ? 'دالة تعديل (setter)' : /abstract/.test(mods) ? 'دالة مجردة' : /static/.test(mods) ? 'دالة ساكنة (static)' : 'تعريف دالة',
      ex,
      bn: 'Nomi dei metodi in camelCase e con un verbo (calcolaArea, getSaldo); un metodo = un solo compito.',
      bnAr: 'أسماء الدوال بأسلوب camelCase وتبدأ بفعل (calcolaArea، getSaldo)، وكل دالة تقوم بمهمة واحدة فقط.',
    };
  });
  rule(/^\s*(\}\s*)?else\s+if\s*\((.*)\)\s*\{?\s*$/, (m) => ({
    t: 'Condizione alternativa (else if)', ar: 'شرط بديل (else if)',
    ex: `يُقيَّم الشرط ${c(m[2])} فقط إذا كانت جميع الشروط السابقة false. أول فرع يكون شرطه true يُنفَّذ ويتم تجاهل الباقي.`,
    bn: 'Ordina le condizioni dalla più specifica alla più generale.', bnAr: 'رتّب الشروط من الأكثر تحديداً إلى الأعم.',
  }));
  rule(/^\s*(\}\s*)?else\s*\{?\s*$/, () => ({
    t: 'Ramo alternativo (else)', ar: 'الفرع البديل (else)',
    ex: 'يُنفَّذ جسم `else` فقط عندما يكون شرط `if` السابق false.',
    bn: 'Usa sempre le parentesi graffe { } anche per una sola istruzione.', bnAr: 'استخدم دائماً الأقواس { } حتى لو كان الجسم تعليمة واحدة.',
  }));
  rule(/^\s*if\s*\((.*)\)\s*(\{|.*;)?\s*$/, (m) => ({
    t: 'Istruzione condizionale (if)', ar: 'جملة شرطية (if)',
    ex: `تُقيّم JVM الشرط ${c(m[1])} وهو تعبير منطقي (boolean). إذا كانت النتيجة true يُنفَّذ الجسم، وإلا يتم تخطيه (أو تنفيذ else إن وُجد).${/==\s*(true|false)/.test(m[1]) ? ' ملاحظة: المقارنة مع true/false زائدة.' : ''}${/"\s*==|==\s*"/.test(m[1]) ? ' تحذير: النصوص تُقارن بـ equals() وليس بـ ==.' : ''}`,
    bn: 'Condizioni booleane esplicite e leggibili: scrivi if (attivo) e non if (attivo == true).',
    bnAr: 'اكتب شروطاً منطقية واضحة: if (attivo) وليس if (attivo == true)، وقارن النصوص بـ equals().',
  }));
  rule(/^\s*for\s*\(\s*(final\s+)?([\w<>[\]]+)\s+(\w+)\s*:\s*(.+)\)\s*\{?\s*$/, (m) => ({
    t: 'Ciclo for-each (for avanzato)', ar: 'حلقة for-each (المُحسّنة)',
    ex: `تمر الحلقة على كل عنصر في ${c(m[4].trim())} بالترتيب، وفي كل دورة يأخذ المتغير ${c(m[3])} من النوع ${c(m[2])} قيمة العنصر الحالي. لا تحتاج إلى فهرس، لذا لا يوجد خطر الخروج عن حدود المصفوفة.`,
    bn: 'Usa il for-each quando devi solo leggere tutti gli elementi; usa il for classico se ti serve l\'indice.',
    bnAr: 'استخدم for-each عندما تريد قراءة جميع العناصر فقط، واستخدم for التقليدية إذا احتجت إلى الفهرس أو تعديل المصفوفة.',
  }));
  rule(/^\s*for\s*\((.*);(.*);(.*)\)\s*\{?\s*$/, (m) => ({
    t: 'Ciclo for (ciclo determinato)', ar: 'حلقة for (عدد دورات معروف)',
    ex: `حلقة من ثلاثة أجزاء: التهيئة ${c(m[1].trim())} تُنفَّذ مرة واحدة، ثم الشرط ${c(m[2].trim())} يُفحص قبل كل دورة، والتحديث ${c(m[3].trim())} يُنفَّذ بعد كل دورة. متغير العدّاد المعرَّف هنا مرئي فقط داخل الحلقة (scope).`,
    bn: 'Usa il for quando il numero di iterazioni è noto; non modificare il contatore dentro il corpo.',
    bnAr: 'استخدم for عندما يكون عدد الدورات معروفاً مسبقاً، ولا تعدّل متغير العدّاد داخل جسم الحلقة.',
  }));
  rule(/^\s*(\}\s*)?while\s*\((.*)\)\s*(\{|;)?\s*$/, (m) => (m[3] === ';' && m[1] ? {
    t: 'Condizione del do-while', ar: 'شرط حلقة do-while',
    ex: `في حلقة do-while يُفحص الشرط ${c(m[2])} في النهاية، لذا يُنفَّذ الجسم مرة واحدة على الأقل.`,
    bn: 'Usa do-while quando il corpo deve essere eseguito almeno una volta (es. menu).', bnAr: 'استخدم do-while عندما يجب تنفيذ الجسم مرة واحدة على الأقل (مثل القوائم).',
  } : {
    t: 'Ciclo while (ciclo indeterminato)', ar: 'حلقة while (عدد دورات غير معروف)',
    ex: `يُفحص الشرط ${c(m[2])} قبل كل دورة: طالما هو true يتكرر الجسم. يجب أن يغيّر الجسم شيئاً يجعل الشرط false يوماً ما، وإلا تحدث حلقة لا نهائية.`,
    bn: 'Inserisci la condizione di uscita nella condizione del while, evitando break.', bnAr: 'ضع شرط الخروج في شرط while نفسه، وتجنب استخدام break للخروج.',
  }));
  rule(/^\s*do\s*\{?\s*$/, () => ({
    t: 'Ciclo do-while', ar: 'حلقة do-while',
    ex: 'بداية حلقة do-while: يُنفَّذ الجسم أولاً ثم يُفحص الشرط في النهاية، لذا يُنفَّذ مرة واحدة على الأقل.',
    bn: 'Adatto per la validazione dell\'input e i menu.', bnAr: 'مناسبة للتحقق من الإدخال والقوائم التفاعلية.',
  }));
  rule(/^\s*switch\s*\((.*)\)\s*\{?\s*$/, (m) => ({
    t: 'Selezione multipla (switch)', ar: 'اختيار متعدد (switch)',
    ex: `تقارن جملة switch قيمة ${c(m[1])} مع كل حالة case وتقفز إلى الحالة المطابقة. تعمل مع int و char و String و enum.`,
    bn: 'Ogni case termina con break e prevedi sempre il caso default.', bnAr: 'أنهِ كل حالة case بـ break، وأضف دائماً الحالة default للقيم غير المتوقعة.',
  }));
  rule(/^\s*case\s+(.+?)\s*(:|->)/, (m) => ({
    t: 'Etichetta case', ar: 'حالة case',
    ex: `إذا كانت قيمة switch تساوي ${c(m[1])} يبدأ التنفيذ من هنا. بدون break يستمر التنفيذ إلى الحالة التالية (fall-through).`,
    bn: 'Termina ogni case con break per evitare il fall-through involontario.', bnAr: 'أنهِ كل case بـ break لتجنب الانتقال غير المقصود إلى الحالة التالية.',
  }));
  rule(/^\s*default\s*(:|->)/, () => ({
    t: 'Caso predefinito (default)', ar: 'الحالة الافتراضية (default)',
    ex: 'تُنفَّذ الحالة default عندما لا تطابق القيمة أي case.', bn: 'Prevedi sempre default per gestire i valori inattesi.', bnAr: 'أضف دائماً default لمعالجة القيم غير المتوقعة.',
  }));
  rule(/^\s*break\s*;/, () => ({
    t: 'Istruzione break', ar: 'أمر الخروج break',
    ex: '`break` يُنهي فوراً أقرب switch أو حلقة. داخل switch هو ضروري لمنع الانتقال إلى الحالة التالية.',
    bn: 'break è accettato solo nello switch: nei cicli è un salto non strutturato.', bnAr: 'استخدام break مقبول داخل switch فقط؛ أما داخل الحلقات فهو قفزة غير مُهيكلة يُفضّل تجنبها.',
  }));
  rule(/^\s*continue\s*;/, () => ({
    t: 'Istruzione continue', ar: 'أمر المتابعة continue',
    ex: '`continue` يتخطى بقية الدورة الحالية وينتقل مباشرة إلى الدورة التالية من الحلقة.',
    bn: 'Evita continue: riscrivi la logica con un if.', bnAr: 'تجنب continue وأعد كتابة المنطق باستخدام if.',
  }));
  rule(/^\s*try\s*\{?\s*$/, () => ({
    t: 'Blocco try', ar: 'كتلة المحاولة try',
    ex: 'تحتوي كتلة `try` على الكود الذي قد يرمي استثناءً. إذا حدث استثناء يتوقف تنفيذ باقي الكتلة فوراً وتنتقل JVM إلى أول catch مناسب.',
    bn: 'Racchiudi nel try solo le istruzioni che possono effettivamente fallire.', bnAr: 'ضع داخل try فقط التعليمات التي قد تفشل فعلاً، وليس الدالة بأكملها.',
  }));
  rule(/^\s*(\}\s*)?catch\s*\(\s*(?:final\s+)?([\w.|\s]+?)\s+(\w+)\s*\)\s*\{?\s*(\}?)\s*$/, (m) => ({
    t: 'Blocco catch (gestore di eccezione)', ar: 'كتلة الالتقاط catch',
    ex: `تلتقط هذه الكتلة الاستثناءات من النوع ${c(m[2].trim())} (أو أصنافه الفرعية) التي تُرمى داخل try. المتغير ${c(m[3])} مرجع إلى كائن الاستثناء في الـHeap، ومنه نحصل على الرسالة بـ ${c(m[3] + '.getMessage()')}.${m[4] ? ' تحذير: الكتلة فارغة!' : ''}`,
    bn: 'Mai lasciare un catch vuoto e cattura eccezioni specifiche, non Exception generico.',
    bnAr: 'لا تترك catch فارغة أبداً، والتقط استثناءات محددة بدلاً من Exception العامة.',
  }));
  rule(/^\s*(\}\s*)?finally\s*\{?\s*$/, () => ({
    t: 'Blocco finally', ar: 'كتلة finally',
    ex: 'كتلة `finally` تُنفَّذ دائماً بعد try/catch، سواء حدث استثناء أم لا، وحتى لو كان هناك return. تُستخدم لتحرير الموارد (إغلاق ملف أو اتصال).',
    bn: 'Usa finally (o try-with-resources) per chiudere sempre le risorse.', bnAr: 'استخدم finally (أو try-with-resources) لإغلاق الموارد دائماً.',
  }));
  rule(/^\s*throw\s+new\s+(\w+)\s*\((.*)\)\s*;/, (m) => ({
    t: 'Lancio di eccezione (throw)', ar: 'رمي استثناء (throw)',
    ex: `يُنشئ هذا السطر كائن استثناء ${c(m[1])} في الـHeap${m[2] ? ' مع الرسالة ' + c(m[2]) : ''} ثم يرميه بـ throw: يتوقف التنفيذ الطبيعي فوراً وتبحث JVM عن catch مناسب صعوداً عبر إطارات الـStack. إذا لم تجده يتوقف البرنامج.`,
    bn: 'Lancia eccezioni per segnalare situazioni anomale (es. parametro non valido), con un messaggio chiaro.',
    bnAr: 'ارمِ الاستثناءات للإبلاغ عن حالات غير طبيعية (مثل معامل غير صالح) مع رسالة واضحة تشرح السبب.',
  }));
  rule(/^\s*super\s*\((.*)\)\s*;/, (m) => ({
    t: 'Chiamata al costruttore della superclasse', ar: 'استدعاء مُنشئ الصنف الأب',
    ex: `${c('super(' + m[1] + ')')} يستدعي مُنشئ الصنف الأب لتهيئة الحقول الموروثة، ويجب أن يكون أول تعليمة في المُنشئ. إذا لم تكتبه تضيف Java تلقائياً ${c('super()')} بدون معاملات.`,
    bn: 'Inizializza gli attributi ereditati tramite super(...), non accedendo direttamente ai campi del padre.',
    bnAr: 'هيّئ الحقول الموروثة عبر super(...) وليس بالوصول المباشر إلى حقول الصنف الأب.',
  }));
  rule(/^\s*this\s*\((.*)\)\s*;/, (m) => ({
    t: 'Chiamata a un altro costruttore (this)', ar: 'استدعاء مُنشئ آخر (this)',
    ex: `${c('this(' + m[1] + ')')} يستدعي مُنشئاً آخر من نفس الصنف (تسلسل المُنشئات). يتجنب تكرار الكود ويجب أن يكون أول تعليمة.`,
    bn: 'Riusa i costruttori con this(...) invece di duplicare il codice.', bnAr: 'أعد استخدام المُنشئات بـ this(...) بدلاً من تكرار الكود.',
  }));
  rule(/^\s*this\.(\w+)\s*=\s*(.+);/, (m) => ({
    t: 'Inizializzazione di un attributo con this', ar: 'تهيئة حقل باستخدام this',
    ex: `${c('this.' + m[1])} هو حقل الكائن الموجود في الـHeap، بينما ${c(m[2].trim())} في الطرف الأيمن ${/^\w+$/.test(m[2].trim()) ? 'غالباً معامل محلي في الـStack يحمل نفس الاسم' : 'قيمة جديدة'}. الكلمة this مرجع إلى الكائن الحالي وتزيل الالتباس بين الحقل والمعامل.`,
    bn: 'Usa this per distinguere l\'attributo dal parametro con lo stesso nome.', bnAr: 'استخدم this للتمييز بين الحقل والمعامل الذي يحمل نفس الاسم.',
  }));
  rule(/^\s*return\b\s*(.*);/, (m) => ({
    t: 'Istruzione return', ar: 'أمر الإرجاع return',
    ex: m[1] ? `يُنهي الدالة ويُعيد القيمة ${c(m[1])} إلى المستدعي. بعدها يُزال إطار الدالة من الـStack وتُفقد متغيراتها المحلية.` : 'يُنهي الدالة void فوراً ويعيد التحكم إلى المستدعي.',
    bn: 'Preferisci un solo punto di uscita nei metodi complessi.', bnAr: 'في الدوال المعقدة يُفضّل وجود نقطة خروج واحدة.',
  }));
  rule(/^\s*System\.(out|err)\.(println|print|printf)\s*\((.*)\)\s*;/, (m) => ({
    t: m[2] === 'printf' ? 'Stampa formattata (printf)' : m[1] === 'err' ? 'Stampa su standard error' : 'Stampa su console',
    ar: m[2] === 'printf' ? 'طباعة منسّقة' : 'طباعة على الشاشة',
    ex: `${c('System.' + m[1])} هو مجرى الإخراج ${m[1] === 'err' ? 'الخاص بالأخطاء' : 'القياسي'}. الدالة ${c(m[2])} ${m[2] === 'println' ? 'تطبع ثم تنتقل إلى سطر جديد' : m[2] === 'print' ? 'تطبع دون الانتقال إلى سطر جديد' : 'تطبع حسب قالب مثل %d للأعداد الصحيحة و %.2f للعشرية و %s للنصوص'}${/\+/.test(m[3]) ? '. المعامل + مع نص يقوم بالدمج (concatenazione) ويحوّل القيم الأخرى إلى نص' : ''}.`,
    bn: 'Separa la logica dalla stampa: i metodi di calcolo restituiscono valori, il main li stampa.',
    bnAr: 'افصل المنطق عن الطباعة: دوال الحساب تُعيد القيم، و main هي التي تطبعها.',
  }));
  rule(/^\s*((?:public|private|protected|static|final|transient|volatile)\s+)*([\w<>[\],\s]+?)\s+(\w+)\s*(=\s*(.+))?;\s*(\/\/.*)?$/, (m) => {
    const mods = m[1] || '';
    const type = m[2].trim(), name = m[3], init = (m[5] || '').trim();
    if (badType(type) || badType(name)) return null;
    const info = typeInfo(type);
    const isFinal = /final/.test(mods);
    const isAccess = /public|private|protected/.test(mods);
    const isNew = /^new\s/.test(init);
    let ex;
    if (isAccess || /static/.test(mods)) {
      ex = `تصريح عن ${/static/.test(mods) ? 'حقل ساكن (static) مشترك بين جميع الكائنات ومخزن مرة واحدة فقط' : 'حقل (attributo) لكل كائن، يُخزّن داخل الكائن في الـHeap'} باسم ${c(name)} من النوع ${c(type)}: ${info.det}.`;
      if (/private/.test(mods)) ex += ' الكلمة `private` تخفي الحقل عن الأصناف الأخرى (التغليف Encapsulation): لا يمكن تغييره إلا عبر دوال الصنف.';
      if (/public/.test(mods) && !isFinal) ex += ' تحذير: الحقل public يكسر التغليف لأن أي صنف يمكنه تغييره مباشرة.';
      if (!init) ex += ` بدون قيمة أولية يأخذ القيمة الافتراضية (${info.prim ? (type === 'boolean' ? 'false' : '0') : 'null'}).`;
    } else if (isNew) {
      ex = `تصريح عن متغير محلي ${c(name)} من النوع ${c(type)} وإنشاء كائن: الكلمة new تحجز الكائن في الـHeap وتستدعي المُنشئ، ثم يُخزَّن عنوان الكائن (المرجع، مثل @4a9f) في المتغير ${c(name)} الموجود في الـStack.`;
    } else {
      ex = `تصريح عن ${isFinal ? 'ثابت' : 'متغير محلي'} ${c(name)} من النوع ${c(type)} (${info.ar}): ${info.det}. ${info.prim ? 'بما أنه نوع بدائي، تُخزَّن القيمة نفسها مباشرة داخل إطار الدالة في الـStack.' : 'المتغير في الـStack يحمل مرجعاً إلى الكائن في الـHeap.'}`;
      if (init) ex += ` القيمة الأولية: ${c(init)}.`;
      if (isFinal) ex += ' الكلمة `final` تعني أن القيمة لا يمكن تغييرها بعد الإسناد الأول.';
      if (init === 'null') ex += ' القيمة null تعني أن المرجع لا يشير إلى أي كائن؛ استدعاء دالة عليه يسبب NullPointerException.';
    }
    return {
      t: isAccess || /static/.test(mods) ? (isFinal && /static/.test(mods) ? 'Costante di classe (static final)' : 'Attributo (variabile di istanza)') : isFinal ? 'Costante locale (final)' : isNew ? 'Istanziazione di un oggetto (new)' : 'Dichiarazione di variabile',
      ar: isAccess || /static/.test(mods) ? (isFinal ? 'ثابت على مستوى الصنف' : 'حقل (متغير الكائن)') : isFinal ? 'ثابت محلي' : isNew ? 'إنشاء كائن جديد' : 'تصريح عن متغير',
      ex,
      bn: isFinal ? 'Le costanti si scrivono in UPPER_SNAKE_CASE (es. ALIQUOTA_IVA).' : (isAccess ? 'Attributi sempre private, accessibili con get/set; nomi in camelCase.' : 'Variabili in camelCase con nomi significativi (es. numeroStudenti, non n1).'),
      bnAr: isFinal ? 'تُكتب الثوابت بأحرف كبيرة مع شرطة سفلية UPPER_SNAKE_CASE مثل ALIQUOTA_IVA.' : (isAccess ? 'الحقول دائماً private ويُوصل إليها عبر get/set، وأسماؤها بأسلوب camelCase.' : 'أسماء المتغيرات بأسلوب camelCase ومعبّرة عن معناها (مثل numeroStudenti وليس n1).'),
    };
  });
  rule(/^\s*([\w.[\]]+)\s*(\+\+|--)\s*;|^\s*(\+\+|--)\s*([\w.[\]]+)\s*;/, (m) => ({
    t: (m[2] || m[3]) === '++' ? 'Incremento (++)' : 'Decremento (--)', ar: (m[2] || m[3]) === '++' ? 'زيادة بمقدار 1' : 'إنقاص بمقدار 1',
    ex: `يغيّر قيمة ${c(m[1] || m[4])} بمقدار 1. الصيغة x++ تُعيد القيمة القديمة ثم تزيد، و ++x تزيد أولاً ثم تُعيد القيمة الجديدة.`,
    bn: 'Usa ++ come istruzione a sé, evitando espressioni come a = i++ + ++i.', bnAr: 'استخدم ++ كتعليمة مستقلة، وتجنب التعابير المربكة مثل a = i++ + ++i.',
  }));
  rule(/^\s*([\w.[\]]+)\s*(\+=|-=|\*=|\/=|%=)\s*(.+);/, (m) => ({
    t: 'Assegnazione composta', ar: 'إسناد مركّب',
    ex: `${c(m[1] + ' ' + m[2] + ' ' + m[3])} يكافئ ${c(m[1] + ' = ' + m[1] + ' ' + m[2][0] + ' (' + m[3] + ')')}: يحسب القيمة الجديدة ويخزنها في نفس المتغير.`,
    bn: 'Le assegnazioni composte rendono il codice più compatto e leggibile.', bnAr: 'الإسناد المركّب يجعل الكود أقصر وأوضح.',
  }));
  rule(/^\s*([\w.[\]]+)\s*=\s*(.+);/, (m) => ({
    t: /^new\s/.test(m[2].trim()) ? 'Assegnazione di un nuovo oggetto' : 'Assegnazione', ar: 'إسناد قيمة',
    ex: /^new\s/.test(m[2].trim())
      ? `يُنشئ كائناً جديداً في الـHeap ويخزن مرجعه في ${c(m[1])}. إذا كان ${c(m[1])} يشير سابقاً إلى كائن آخر لا يملك مراجع أخرى، يصبح ذلك الكائن مؤهلاً لجامع القمامة.`
      : `يحسب التعبير ${c(m[2].trim())} في الطرف الأيمن أولاً، ثم يخزن النتيجة في ${c(m[1])}. ${m[1].includes('.') ? 'هذا حقل لكائن في الـHeap.' : 'إذا كان النوع بدائياً تُنسخ القيمة؛ وإذا كان مرجعاً يُنسخ العنوان فقط (وليس الكائن).'}`,
    bn: 'Una sola assegnazione per riga; non assegnare dentro le condizioni.', bnAr: 'إسناد واحد في كل سطر، ولا تضع الإسناد داخل الشروط.',
  }));
  rule(/^\s*([\w.]+)\.(\w+)\s*\((.*)\)\s*;/, (m) => ({
    t: 'Invocazione di metodo', ar: 'استدعاء دالة على كائن',
    ex: `يستدعي الدالة ${c(m[2] + '()')} على ${c(m[1])}${m[3] ? ' مع المعاملات ' + c(m[3]) : ''}. تبحث JVM عن الدالة في الصنف الفعلي للكائن (الربط الديناميكي Dynamic Binding)، وتُنشئ لها إطاراً جديداً في الـStack. إذا كان ${c(m[1])} يساوي null يحدث NullPointerException.`,
    bn: 'Invoca i metodi tramite l\'interfaccia pubblica dell\'oggetto, mai manipolando i suoi campi.', bnAr: 'تعامل مع الكائن عبر دواله العامة، ولا تعدّل حقوله مباشرة.',
  }));
  rule(/^\s*(\w+)\s*\((.*)\)\s*;/, (m) => ({
    t: 'Chiamata di metodo', ar: 'استدعاء دالة',
    ex: `يستدعي الدالة ${c(m[1] + '()')} من نفس الصنف${m[2] ? ' مع المعاملات ' + c(m[2]) : ''}: يُنشأ إطار جديد أعلى الـStack ثم يُزال عند انتهائها.`,
    bn: 'Scomponi il problema in metodi brevi con nomi chiari.', bnAr: 'قسّم المشكلة إلى دوال قصيرة بأسماء واضحة.',
  }));
  rule(/^\s*\}\s*;?\s*$/, () => ({
    t: 'Chiusura del blocco', ar: 'إغلاق الكتلة',
    ex: 'القوس `}` يُغلق كتلة (صنف، دالة، شرط أو حلقة). المتغيرات المحلية المعرّفة داخل الكتلة تنتهي صلاحيتها هنا (نهاية النطاق scope).',
    bn: 'Indenta il codice in modo coerente: ogni blocco annidato rientra di 4 spazi.', bnAr: 'نسّق الإزاحة بشكل ثابت: كل كتلة متداخلة تُزاح بأربع مسافات.',
  }));
  rule(/^\s*\{\s*$/, () => ({
    t: 'Apertura del blocco', ar: 'بداية كتلة',
    ex: 'القوس `{` يبدأ كتلة جديدة ونطاقاً (scope) جديداً للمتغيرات.',
    bn: 'Stile K&R: la graffa aperta sulla stessa riga dell\'istruzione.', bnAr: 'أسلوب K&R: ضع القوس { في نفس سطر التعليمة.',
  }));

  /** Spiega una singola riga di codice Java. */
  function spiega(line) {
    const src = String(line || '');
    for (const [re, fn] of R) {
      const m = re.exec(src);
      if (m) {
        const r = fn(m);
        if (r) return r;
      }
    }
    return {
      t: 'Istruzione Java', ar: 'تعليمة Java',
      ex: `هذا السطر ${c(src.trim())} تعليمة تنفذها JVM بالترتيب من الأعلى إلى الأسفل. كل تعليمة بسيطة تنتهي بفاصلة منقوطة ;`,
      bn: 'Una istruzione per riga, con indentazione coerente.', bnAr: 'تعليمة واحدة في كل سطر مع إزاحة منتظمة.',
    };
  }

  const api = { highlight, spiega, escapeHtml: esc };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CFExplainer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
