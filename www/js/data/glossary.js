/*
 * CodeForge — Glossario accademico IT → AR.
 * { it, ar, cat, ex (spiegazione in arabo), code (esempio Java), bn (buona norma IT) }
 */
(function (root) {
  'use strict';

  const glossario = [
    // ── Fondamenti ──
    { it: 'Classe', ar: 'صنف', cat: 'OOP', ex: 'قالب (مخطط) يصف الحقول (الحالة) والدوال (السلوك) لمجموعة من الكائنات. لا يشغل بيانات بنفسه بل تُنشأ منه الكائنات.', code: 'public class ContoCorrente { ... }', bn: 'Nome in PascalCase, un concetto per classe.' },
    { it: 'Oggetto (istanza)', ar: 'كائن (نسخة)', cat: 'OOP', ex: 'نسخة حقيقية من الصنف تُنشأ أثناء التشغيل بـ new وتُخزَّن في الـHeap، ولها حالتها الخاصة المستقلة عن الكائنات الأخرى.', code: 'ContoCorrente c = new ContoCorrente("Mario");' },
    { it: 'Metodo', ar: 'دالة (طريقة)', cat: 'OOP', ex: 'مجموعة تعليمات داخل الصنف تصف سلوكاً للكائن. عند الاستدعاء يُنشأ لها إطار في الـStack.', code: 'public void deposita(double importo) { ... }', bn: 'camelCase e un verbo: calcolaMedia().' },
    { it: 'Attributo (campo)', ar: 'حقل (خاصية)', cat: 'OOP', ex: 'متغير معرّف داخل الصنف وخارج الدوال، يمثل جزءاً من حالة الكائن ويُخزَّن داخل الكائن في الـHeap.', code: 'private double saldo;', bn: 'Sempre private.' },
    { it: 'Costruttore', ar: 'مُنشئ', cat: 'OOP', ex: 'دالة خاصة بنفس اسم الصنف وبلا نوع إرجاع، تُستدعى تلقائياً مع new لتهيئة الكائن الجديد.', code: 'public Punto(int x, int y) {\n    this.x = x;\n    this.y = y;\n}' },
    { it: 'Firma del metodo', ar: 'توقيع الدالة', cat: 'OOP', ex: 'اسم الدالة مع عدد وأنواع وترتيب معاملاتها. نوع الإرجاع ليس جزءاً من التوقيع. يُستخدم لتمييز الدوال المحمّلة (overloading).', code: 'somma(int, int)  ≠  somma(double, double)' },
    { it: 'Overloading (sovraccarico)', ar: 'التحميل الزائد', cat: 'OOP', ex: 'تعريف عدة دوال أو مُنشئات بنفس الاسم وتواقيع مختلفة في نفس الصنف. يختار المترجم النسخة المناسبة وقت الترجمة (ربط ساكن).', code: 'int max(int a, int b)\ndouble max(double a, double b)' },
    { it: 'Overriding (ridefinizione)', ar: 'إعادة التعريف', cat: 'OOP', ex: 'إعادة كتابة دالة موروثة في الصنف الفرعي بنفس التوقيع تماماً. تُختار النسخة المناسبة وقت التشغيل حسب نوع الكائن الحقيقي (ربط ديناميكي).', code: '@Override\npublic String toString() { ... }', bn: 'Usa sempre @Override.' },
    { it: 'Incapsulamento', ar: 'التغليف', cat: 'OOP', ex: 'إخفاء الحالة الداخلية للكائن (حقول private) وإتاحة الوصول إليها فقط عبر دوال عامة تتحقق من صحة البيانات (get/set).', code: 'private double saldo;\npublic double getSaldo() { return saldo; }', bn: 'Attributi private + get/set con validazione.' },
    { it: 'Modificatore di accesso', ar: 'مُحدِّد الوصول', cat: 'OOP', ex: 'كلمات تحدد من يرى عضو الصنف: private (الصنف فقط)، بدون محدد (الحزمة)، protected (الحزمة والأبناء)، public (الجميع).', code: 'private | protected | public' },
    { it: 'Metodo get / set', ar: 'دوال القراءة والتعديل', cat: 'OOP', ex: 'getter يُعيد قيمة حقل خاص، وsetter يغيّرها بعد التحقق من صحتها. أسماؤها getX / setX / isX للقيم المنطقية.', code: 'public void setEta(int eta) {\n    if (eta < 0) throw new IllegalArgumentException();\n    this.eta = eta;\n}' },
    { it: 'this', ar: 'المرجع this', cat: 'OOP', ex: 'مرجع إلى الكائن الحالي الذي استُدعيت عليه الدالة. يميّز الحقل عن المعامل بنفس الاسم، و this(...) تستدعي مُنشئاً آخر.', code: 'this.nome = nome;' },
    { it: 'Ereditarietà', ar: 'الوراثة', cat: 'OOP', ex: 'آلية تسمح لصنف فرعي (extends) بأن يرث حقول ودوال صنف أب، ويضيف عليها أو يعيد تعريفها. Java تسمح بالوراثة من صنف واحد فقط.', code: 'class Studente extends Persona { ... }', bn: 'Solo per relazioni "è un".' },
    { it: 'super', ar: 'المرجع super', cat: 'OOP', ex: 'يشير إلى الصنف الأب: super(...) تستدعي مُنشئه (أول تعليمة)، و super.metodo() تستدعي نسخته من الدالة.', code: 'super(nome);\nsuper.descrivi();' },
    { it: 'Polimorfismo', ar: 'تعدد الأشكال', cat: 'OOP', ex: 'قدرة مرجع من نوع الصنف الأب (أو الواجهة) على الإشارة إلى كائنات من أصناف فرعية مختلفة، بحيث يتصرف كل منها بطريقته.', code: 'Forma f = new Cerchio(2);\nf.area();' },
    { it: 'Legame dinamico (Dynamic Binding)', ar: 'الربط الديناميكي', cat: 'OOP', ex: 'اختيار الدالة المُعاد تعريفها وقت التشغيل حسب النوع الحقيقي للكائن في الـHeap، وليس حسب نوع المرجع المُصرَّح به.', code: 'Animale a = new Cane();\na.verso(); // "Bau"' },
    { it: 'Tipo statico e tipo dinamico', ar: 'النوع الساكن والنوع الديناميكي', cat: 'OOP', ex: 'النوع الساكن هو النوع المُصرَّح للمرجع (يحدد الدوال المسموح استدعاؤها وقت الترجمة)، والديناميكي هو نوع الكائن الحقيقي (يحدد أي نسخة تُنفَّذ).', code: 'Animale a = new Cane();\n// statico: Animale, dinamico: Cane' },
    { it: 'Classe astratta', ar: 'صنف مجرد', cat: 'OOP', ex: 'صنف مُعرَّف بـ abstract لا يمكن إنشاء كائنات منه، وقد يحتوي على دوال مجردة بلا جسم يجب على الأبناء تنفيذها.', code: 'abstract class Forma {\n    public abstract double area();\n}' },
    { it: 'Interfaccia', ar: 'واجهة', cat: 'OOP', ex: 'عقد يحتوي على دوال (مجردة غالباً) يلتزم الصنف بتنفيذها عبر implements. يمكن للصنف تطبيق عدة واجهات.', code: 'interface Confrontabile {\n    int confronta(Object o);\n}' },
    { it: 'Classe Object', ar: 'الصنف Object', cat: 'OOP', ex: 'الجذر الذي ترث منه كل الأصناف في Java، ويوفر دوالاً مثل toString و equals و hashCode.', code: 'public boolean equals(Object o)' },

    // ── Memoria ──
    { it: 'Stack', ar: 'المكدس (Stack)', cat: 'Memoria', ex: 'منطقة ذاكرة تعمل بمبدأ LIFO، فيها إطار (frame) لكل دالة قيد التنفيذ يحتوي على معاملاتها ومتغيراتها المحلية. يُزال الإطار عند انتهاء الدالة.', code: 'int x = 5;  // x vive nel frame sullo Stack' },
    { it: 'Heap', ar: 'الكومة (Heap)', cat: 'Memoria', ex: 'منطقة الذاكرة التي تُحجز فيها جميع الكائنات المُنشأة بـ new، وتبقى ما دام يوجد مرجع إليها.', code: 'new Punto(1, 2);  // oggetto nello Heap' },
    { it: 'Frame (record di attivazione)', ar: 'إطار التنشيط', cat: 'Memoria', ex: 'كتلة في الـStack تُنشأ عند كل استدعاء دالة، تحتوي على المعاملات والمتغيرات المحلية وعنوان العودة. تُزال عند return.', code: 'main() → deposita() → ...' },
    { it: 'Riferimento', ar: 'مرجع', cat: 'Memoria', ex: 'قيمة تمثل عنوان كائن في الـHeap. المتغير من نوع صنف لا يحتوي الكائن بل مرجعاً إليه (مثل @4a9f).', code: 'Punto p = new Punto(0, 0);  // p contiene @4a9f' },
    { it: 'Tipo primitivo', ar: 'نوع بدائي', cat: 'Memoria', ex: 'الأنواع الثمانية (int, double, boolean, char, ...) التي تُخزَّن قيمتها مباشرة في المتغير وليست كائنات.', code: 'int eta = 20;\ndouble media = 27.5;' },
    { it: 'Aliasing', ar: 'الأسماء المستعارة', cat: 'Memoria', ex: 'حالة وجود مرجعين أو أكثر يشيران إلى نفس الكائن؛ أي تعديل عبر أحدهما يظهر عبر الآخر.', code: 'Punto p2 = p1;\np2.sposta(10); // anche p1 cambia' },
    { it: 'null', ar: 'القيمة null', cat: 'Memoria', ex: 'قيمة خاصة تعني أن المرجع لا يشير إلى أي كائن. استدعاء دالة عليه يسبب NullPointerException.', code: 'String s = null;\ns.length(); // NullPointerException' },
    { it: 'Garbage Collector', ar: 'جامع القمامة', cat: 'Memoria', ex: 'مكوّن في JVM يحرر تلقائياً ذاكرة الكائنات التي لم يعد يشير إليها أي مرجع، فلا يحتاج المبرمج إلى تحرير الذاكرة يدوياً.', code: 'p = null; // l\'oggetto diventa eleggibile per il GC' },
    { it: 'Variabile locale', ar: 'متغير محلي', cat: 'Memoria', ex: 'متغير مُعرَّف داخل دالة أو كتلة، يعيش في إطار الـStack فقط من مكان تعريفه حتى نهاية الكتلة.', code: 'for (int i = 0; i < n; i++) { ... } // i esiste solo qui' },
    { it: 'Visibilità (scope)', ar: 'نطاق الرؤية', cat: 'Memoria', ex: 'الجزء من الكود الذي يمكن فيه استخدام متغير. للمتغير المحلي يمتد من التصريح حتى نهاية الكتلة { }.', code: '{ int x = 1; }\n// x qui non esiste' },
    { it: 'static', ar: 'ساكن (static)', cat: 'Memoria', ex: 'عضو ينتمي إلى الصنف نفسه وليس إلى كائن: الحقل الساكن نسخة واحدة مشتركة، والدالة الساكنة تُستدعى بلا كائن ولا تستخدم this.', code: 'private static int contatore = 0;' },

    // ── Eccezioni ──
    { it: 'Eccezione', ar: 'استثناء', cat: 'Eccezioni', ex: 'كائن يمثل حدثاً غير طبيعي يقطع سير البرنامج، يحمل نوع الخطأ ورسالته ومسار الاستدعاءات.', code: 'throw new IllegalStateException("Conto chiuso");' },
    { it: 'try-catch-finally', ar: 'كتل try و catch و finally', cat: 'Eccezioni', ex: 'try تحيط بالكود الخطر، catch تلتقط استثناءً من نوع محدد وتعالجه، finally تُنفَّذ دائماً لتحرير الموارد.', code: 'try { ... }\ncatch (IOException e) { ... }\nfinally { ... }' },
    { it: 'throw', ar: 'رمي استثناء', cat: 'Eccezioni', ex: 'تعليمة ترمي كائن استثناء بشكل صريح فتتوقف الدالة ويصعد الاستثناء عبر الـStack.', code: 'throw new IllegalArgumentException("Valore negativo");' },
    { it: 'throws', ar: 'إعلان الاستثناءات', cat: 'Eccezioni', ex: 'عبارة في توقيع الدالة تعلن الاستثناءات المُراقَبة التي قد تمررها إلى المستدعي (قاعدة: عالِج أو أعلِن).', code: 'public void leggi() throws IOException' },
    { it: 'Eccezione controllata (checked)', ar: 'استثناء مُراقَب', cat: 'Eccezioni', ex: 'استثناء يرث من Exception (وليس RuntimeException)؛ المترجم يُلزم بمعالجته أو إعلانه. يمثل مشاكل خارجية متوقعة.', code: 'IOException, FileNotFoundException' },
    { it: 'Eccezione non controllata (unchecked)', ar: 'استثناء غير مُراقَب', cat: 'Eccezioni', ex: 'استثناء يرث من RuntimeException؛ المترجم لا يُلزم بمعالجته. غالباً يدل على خطأ برمجي يجب تصحيحه.', code: 'NullPointerException, ArithmeticException' },
    { it: 'NullPointerException', ar: 'استثناء المرجع الفارغ', cat: 'Eccezioni', ex: 'يُطلق عند استدعاء دالة أو الوصول إلى حقل عبر مرجع قيمته null. الوقاية بالفحص if (x != null).', code: 'String s = null;\ns.length();' },
    { it: 'IndexOutOfBoundsException', ar: 'استثناء الفهرس خارج الحدود', cat: 'Eccezioni', ex: 'يُطلق عند استخدام فهرس سالب أو أكبر من أو يساوي الطول (ArrayIndexOutOfBoundsException للمصفوفات).', code: 'int[] a = new int[3];\na[3] = 1;' },
    { it: 'Stack trace', ar: 'مسار الاستدعاءات', cat: 'Eccezioni', ex: 'القائمة التي تطبعها JVM عند استثناء غير معالَج: نوع الاستثناء ورسالته ثم سلسلة الدوال وأرقام الأسطر التي أدت إليه.', code: 'Exception in thread "main" java.lang.ArithmeticException: / by zero\n\tat Main.main(Main.java:5)' },
    { it: 'Eccezione personalizzata', ar: 'استثناء مخصص', cat: 'Eccezioni', ex: 'صنف استثناء يكتبه المبرمج بوراثة Exception أو RuntimeException ليعبّر عن خطأ في مجال المشكلة.', code: 'class SaldoInsufficienteException extends Exception { ... }' },

    // ── Buona Norma ──
    { it: 'camelCase', ar: 'أسلوب camelCase', cat: 'Buona Norma', ex: 'أسلوب تسمية المتغيرات والدوال: يبدأ بحرف صغير وكل كلمة تالية بحرف كبير، بلا شرطات.', code: 'int numeroStudenti;\nvoid calcolaMedia()' },
    { it: 'PascalCase', ar: 'أسلوب PascalCase', cat: 'Buona Norma', ex: 'أسلوب تسمية الأصناف والواجهات: كل كلمة تبدأ بحرف كبير، بما فيها الأولى.', code: 'class ContoCorrente\ninterface Disegnabile' },
    { it: 'UPPER_SNAKE_CASE', ar: 'أسلوب الثوابت', cat: 'Buona Norma', ex: 'أسلوب تسمية الثوابت (static final): أحرف كبيرة مع فصل الكلمات بشرطة سفلية.', code: 'private static final double ALIQUOTA_IVA = 0.22;' },
    { it: 'Numero magico', ar: 'رقم سحري', cat: 'Buona Norma', ex: 'قيمة رقمية تظهر في الكود دون اسم يشرح معناها. يجب استبدالها بثابت مُسمّى.', code: 'prezzo * 1.22  →  prezzo * (1 + ALIQUOTA_IVA)' },
    { it: 'Salto non strutturato', ar: 'قفزة غير مُهيكلة', cat: 'Buona Norma', ex: 'استخدام break أو continue داخل الحلقات، مما يعطي الحلقة أكثر من نقطة خروج. البديل: متغير منطقي في الشرط.', code: 'while (i < n && !trovato) { ... }' },
    { it: 'Catch vuoto', ar: 'كتلة catch فارغة', cat: 'Buona Norma', ex: 'كتلة catch لا تحتوي على أي معالجة، فتُخفي الخطأ تماماً. ممنوعة في قواعد البرمجة الجيدة.', code: 'catch (IOException e) { }  // ✗ da evitare' },
    { it: 'Indentazione', ar: 'الإزاحة', cat: 'Buona Norma', ex: 'إزاحة الكتل المتداخلة بمسافات ثابتة (عادة 4) لتوضيح بنية الكود. لا تؤثر على التنفيذ لكنها أساسية للقراءة والتقييم.', code: 'if (x > 0) {\n    stampa();\n}' },
    { it: 'equals vs ==', ar: 'المقارنة equals مقابل ==', cat: 'Buona Norma', ex: '== تقارن المراجع (هل هو نفس الكائن؟) بينما equals تقارن المحتوى. النصوص والكائنات تُقارن بـ equals.', code: '"ciao".equals(s)  // ✓\ns == "ciao"       // ✗' },
  ];

  if (typeof module === 'object' && module.exports) module.exports = glossario;
  else root.CF_GLOSSARIO = glossario;
})(typeof globalThis !== 'undefined' ? globalThis : this);
