/* CodeForge — Livello 5: Ereditarietà e Polimorfismo (Architetto di Gerarchie). */
(function (root) {
  'use strict';
  const livello = {
    numero: 5, id: 'L5', colore: '#56D364', icona: 'tree',
    titolo: 'Ereditarietà e Polimorfismo', titoloAr: 'الوراثة وتعدد الأشكال',
    grado: 'Architetto di Gerarchie', gradoAr: 'مهندس الهرميات',
    descr: 'extends e super, overriding, polimorfismo e binding dinamico, classi astratte e interfacce.',
    lezioni: [
      {
        id: 'l23', titolo: 'Ereditarietà con extends e super', durata: '14 min',
        obiettivi: ['Creare sottoclassi con extends', 'Chiamare il costruttore della superclasse con super(...)', 'Usare protected con criterio'],
        teoria: [
          {
            it: 'Con extends una sottoclasse eredita attributi e metodi della superclasse e può aggiungerne di nuovi.',
            t: 'Ereditarietà (extends)', ar: 'باستخدام extends يرث الصنف الفرعي خصائص ودوال الصنف الأب ويمكنه إضافة جديدة.',
            ex: 'العلاقة "هو نوع من" (is-a): `Studente extends Persona` لأن كل طالب هو شخص. في Java يرث الصنف من أب واحد فقط (وراثة مفردة)، وكل الأصناف ترث في النهاية من `Object`.',
            bn: 'Usa l\'ereditarietà solo per vere relazioni «è un»; altrimenti usa la composizione.', bnAr: 'استخدم الوراثة فقط لعلاقات "هو نوع من" الحقيقية، وإلا فاستخدم التركيب.',
          },
          {
            it: 'Il costruttore della sottoclasse deve chiamare quello della superclasse con super(...) come prima istruzione.',
            t: 'super(...)', ar: 'يجب أن يستدعي مُنشئ الصنف الفرعي مُنشئ الصنف الأب عبر super(...) كأول تعليمة.',
            ex: 'الصنف الأب يهيّئ خصائصه الخاصة (حتى الـprivate منها). إن لم تكتب `super(...)` يضيف المترجم `super()` بلا معاملات، فإن لم يكن للأب مُنشئ بلا معاملات يحدث خطأ ترجمة.',
            bn: 'Lascia che sia la superclasse a inizializzare i propri attributi.', bnAr: 'دع الصنف الأب يهيّئ خصائصه بنفسه.',
          },
          {
            it: 'Gli attributi private della superclasse non sono accessibili direttamente dalla sottoclasse, che deve usare i metodi pubblici o protected.',
            t: 'private e protected', ar: 'خصائص الصنف الأب الـprivate لا يمكن للصنف الفرعي الوصول إليها مباشرة، بل عبر الدوال العامة أو protected.',
            ex: '`protected` يسمح للأصناف الفرعية (ولأصناف نفس الحزمة) بالوصول. لكن الأفضل غالباً إبقاء الخصائص `private` وتوفير getters، حتى لا تكسر الأصناف الفرعية ثوابت الأب.',
            bn: 'Preferisci attributi private con getter anche nelle gerarchie.', bnAr: 'فضّل الخصائص private مع getters حتى في الهرميات.',
          },
        ],
        analogia: {
          titolo: 'L\'eredità di famiglia',
          it: 'La sottoclasse eredita dal genitore la casa e i mobili, e ci aggiunge la sua stanza; prima di entrare però il genitore deve aprire la porta (super).',
          ar: 'الصنف الفرعي يرث من أبيه البيت والأثاث (الخصائص والدوال) ويضيف غرفته الخاصة. لكن قبل أن يدخل يجب أن يفتح الأب الباب أولاً: هذا هو `super(...)` الذي يُستدعى أول شيء في المُنشئ. والخزانة المقفلة (`private`) تبقى للأب، ويطلب الابن ما فيها عبر دوال الأب.',
        },
        esempio: {
          file: 'Ateneo.java',
          codice: `class Persona {

    private final String nome;
    private final String cognome;

    public Persona(String nome, String cognome) {
        this.nome = nome;
        this.cognome = cognome;
    }

    public String getNomeCompleto() {
        return nome + " " + cognome;
    }
}

class Studente extends Persona {

    private final int matricola;

    public Studente(String nome, String cognome, int matricola) {
        super(nome, cognome);
        this.matricola = matricola;
    }

    public int getMatricola() {
        return matricola;
    }
}

public class Ateneo {

    public static void main(String[] args) {
        Studente s = new Studente("Sara", "Bianchi", 987654);
        System.out.println(s.getNomeCompleto() + " - matricola " + s.getMatricola());
    }
}`,
          note: [
            ['class Studente extends Persona {', { t: 'extends', ar: 'extends', ex: 'Studente يرث `getNomeCompleto()` دون إعادة كتابته.' }],
            ['super(nome, cognome);', { t: 'Chiamata a super', ar: 'استدعاء super', ex: 'يجب أن يكون السطر الأول: الأب يهيّئ nome و cognome الخاصة به.' }],
          ],
        },
        norma: {
          it: 'super(...) come prima istruzione, attributi private anche nella superclasse e gerarchie solo per relazioni «è un».',
          ar: 'super(...) كأول تعليمة، وخصائص private حتى في الصنف الأب، والهرميات فقط لعلاقات "هو نوع من".',
        },
        quiz: [
          {
            d: 'Quale relazione giustifica Auto extends Veicolo?', dAr: 'أي علاقة تبرّر Auto extends Veicolo؟',
            opzioni: ['Un\'auto ha un veicolo', 'Un\'auto è un veicolo', 'Un veicolo è un\'auto', 'Nessuna, è solo per riusare codice'], corretta: 1,
            it: 'L\'ereditarietà modella la relazione «è un»: ogni Auto è un Veicolo.',
            ar: 'الوراثة تمثّل علاقة "هو نوع من": كل سيارة هي مركبة.',
          },
          {
            d: 'Studente estende Persona, che ha solo il costruttore Persona(String nome). Cosa succede se il costruttore di Studente non chiama super(...)?', dAr: 'ماذا يحدث إذا لم يستدعِ مُنشئ Studente الدالة super(...)؟',
            opzioni: ['Il nome resta null', 'Errore di compilazione: Persona() non esiste', 'Funziona normalmente', 'Eccezione a runtime'], corretta: 1,
            it: 'Il compilatore inserisce super(), ma Persona non ha un costruttore senza parametri.',
            ar: 'يضيف المترجم super() لكن Persona لا تملك مُنشئاً بلا معاملات.',
          },
        ],
        costruisci: {
          consegna: 'Completa la dichiarazione della sottoclasse e la chiamata al costruttore padre.',
          consegnaAr: 'أكمل تعريف الصنف الفرعي واستدعاء مُنشئ الأب.',
          codice: `class Veicolo {

    private final String targa;

    public Veicolo(String targa) {
        this.targa = targa;
    }

    public String getTarga() {
        return targa;
    }
}

class Moto ⟦extends⟧ Veicolo {

    private final int cilindrata;

    public Moto(String targa, int cilindrata) {
        ⟦super⟧(targa);
        this.cilindrata = cilindrata;
    }

    public String scheda() {
        return ⟦getTarga⟧() + " " + cilindrata + "cc";
    }
}

public class Garage {

    public static void main(String[] args) {
        Moto m = new Moto("AB12345", 650);
        System.out.println(m.scheda());
    }
}`,
          output: 'AB12345 650cc\n',
        },
        laboratorio: {
          titolo: 'Docente e Persona',
          consegna: 'Crea la classe Docente che estende Persona aggiungendo l\'attributo private String corso, un costruttore che usa super(...) e il metodo String presentazione() che restituisce «Prof. Mario Rossi - Programmazione».',
          consegnaAr: 'أنشئ الصنف Docente الذي يرث من Persona ويضيف الخاصية private String corso، ومُنشئاً يستخدم super(...)، والدالة String presentazione() التي تُعيد «Prof. Mario Rossi - Programmazione».',
          codice: `class Persona {

    private final String nome;
    private final String cognome;

    public Persona(String nome, String cognome) {
        this.nome = nome;
        this.cognome = cognome;
    }

    public String getNomeCompleto() {
        return nome + " " + cognome;
    }
}

// classe Docente

public class Facolta {

    public static void main(String[] args) {
        Docente d = new Docente("Mario", "Rossi", "Programmazione");
        System.out.println(d.presentazione());
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Prof. Mario Rossi - Programmazione', msg: 'Deve stampare «Prof. Mario Rossi - Programmazione».', msgAr: 'يجب أن يطبع «Prof. Mario Rossi - Programmazione».' },
            { tipo: 'codice', re: 'class\\s+Docente\\s+extends\\s+Persona', msg: 'Docente deve estendere Persona.', msgAr: 'يجب أن يرث Docente من Persona.' },
            { tipo: 'codice', re: 'super\\s*\\(', msg: 'Il costruttore deve chiamare super(...).', msgAr: 'يجب أن يستدعي المُنشئ super(...).' },
          ],
          soluzione: `class Persona {

    private final String nome;
    private final String cognome;

    public Persona(String nome, String cognome) {
        this.nome = nome;
        this.cognome = cognome;
    }

    public String getNomeCompleto() {
        return nome + " " + cognome;
    }
}

class Docente extends Persona {

    private final String corso;

    public Docente(String nome, String cognome, String corso) {
        super(nome, cognome);
        this.corso = corso;
    }

    public String presentazione() {
        return "Prof. " + getNomeCompleto() + " - " + corso;
    }
}

public class Facolta {

    public static void main(String[] args) {
        Docente d = new Docente("Mario", "Rossi", "Programmazione");
        System.out.println(d.presentazione());
    }
}`,
        },
        riepilogo: [
          { it: 'extends crea una relazione «è un» ed eredita i membri.', ar: 'extends تُنشئ علاقة "هو نوع من" وترث الأعضاء.' },
          { it: 'super(...) è la prima istruzione del costruttore figlio.', ar: 'super(...) هي أول تعليمة في مُنشئ الصنف الفرعي.' },
          { it: 'Gli attributi private del padre si usano tramite i suoi metodi.', ar: 'خصائص الأب الـprivate تُستخدم عبر دواله.' },
        ],
      },
      {
        id: 'l24', titolo: 'Overriding contro overloading e @Override', durata: '13 min',
        obiettivi: ['Ridefinire un metodo ereditato', 'Distinguere overriding e overloading', 'Usare super.metodo()'],
        teoria: [
          {
            it: 'L\'overriding consiste nel ridefinire in una sottoclasse un metodo ereditato con la stessa firma, per specializzarne il comportamento.',
            t: 'Ridefinizione (overriding)', ar: 'إعادة التعريف (overriding) تعني كتابة دالة موروثة من جديد في الصنف الفرعي بنفس التوقيع لتخصيص سلوكها.',
            ex: 'نفس الاسم ونفس المعاملات ونوع إرجاع متوافق. لا يمكن تضييق مستوى الوصول: دالة `public` في الأب تبقى `public` في الابن.',
            bn: 'Metti sempre @Override sui metodi ridefiniti.', bnAr: 'ضع دائماً @Override على الدوال المعاد تعريفها.',
          },
          {
            it: 'L\'annotazione @Override chiede al compilatore di verificare che il metodo ridefinisca davvero un metodo della superclasse.',
            t: '@Override', ar: 'التعليق التوضيحي @Override يطلب من المترجم التحقق من أن الدالة تعيد فعلاً تعريف دالة من الصنف الأب.',
            ex: 'إذا أخطأت في الاسم (مثلاً `tostring` بدلاً من `toString`) أو في المعاملات، فبدون `@Override` تُنشئ دالة جديدة بصمت ولا يحدث overriding. مع `@Override` يعطيك المترجم خطأ فوراً.',
            bn: '@Override trasforma un errore silenzioso in un errore di compilazione.', bnAr: '@Override تحوّل خطأً صامتاً إلى خطأ ترجمة واضح.',
          },
          {
            it: 'L\'overloading invece crea un nuovo metodo con lo stesso nome ma parametri diversi, e viene scelto a tempo di compilazione.',
            t: 'Overriding contro overloading', ar: 'أما التحميل الزائد (overloading) فيُنشئ دالة جديدة بنفس الاسم ومعاملات مختلفة، ويُختار وقت الترجمة.',
            ex: 'السؤال الكلاسيكي في الامتحان الشفهي: الـoverriding = نفس التوقيع في صنف فرعي، يُختار وقت التشغيل حسب نوع الكائن الحقيقي. الـoverloading = توقيع مختلف، يُختار وقت الترجمة حسب أنواع الوسائط.',
            bn: 'Non confondere i due meccanismi: firma uguale = overriding, firma diversa = overloading.', bnAr: 'لا تخلط بينهما: نفس التوقيع overriding، وتوقيع مختلف overloading.',
          },
          {
            it: 'Con super.metodo() la sottoclasse può richiamare la versione della superclasse ed estenderla.',
            t: 'super.metodo()', ar: 'باستخدام super.metodo() يمكن للصنف الفرعي استدعاء نسخة الأب والبناء عليها.',
            ex: 'مثلاً `toString()` في Studente تُعيد `super.toString() + " matricola..."` فتعيد استخدام وصف Persona وتضيف عليه.',
            bn: 'Riusa il comportamento del padre con super.metodo() invece di copiarlo.', bnAr: 'أعد استخدام سلوك الأب بـ super.metodo() بدلاً من نسخه.',
          },
        ],
        analogia: {
          titolo: 'La ricetta della nonna',
          it: 'Overriding: rifai la ricetta della nonna a modo tuo con lo stesso nome. Overloading: aggiungi una ricetta con lo stesso nome ma ingredienti diversi.',
          ar: 'الـoverriding مثل أن تأخذ وصفة جدّتك "كعكة الشوكولاتة" وتعدّل طريقة تحضيرها، فعندما يطلب أحد منك "كعكة الشوكولاتة" يحصل على نسختك. و`super.metodo()` تعني: "أحضّرها كما تفعل جدّتي ثم أضيف لمستي". أما الـoverloading فهو وصفة جديدة بنفس الاسم لكن بمكونات مختلفة، مثل "كعكة الشوكولاتة بدون سكر".',
        },
        esempio: {
          file: 'Zoo.java',
          codice: `class Animale {

    private final String nome;

    public Animale(String nome) {
        this.nome = nome;
    }

    public String verso() {
        return "...";
    }

    @Override
    public String toString() {
        return nome + " fa " + verso();
    }
}

class Cane extends Animale {

    public Cane(String nome) {
        super(nome);
    }

    @Override
    public String verso() {
        return "Bau";
    }

    public String verso(int volte) {
        return verso().repeat(volte);
    }

    @Override
    public String toString() {
        return super.toString() + " (cane)";
    }
}

public class Zoo {

    public static void main(String[] args) {
        Animale generico = new Animale("Animale");
        Cane fido = new Cane("Fido");
        System.out.println(generico);
        System.out.println(fido);
        System.out.println(fido.verso(3));
    }
}`,
          note: [
            ['@Override\n    public String verso() {\n        return "Bau";', { t: 'Overriding', ar: 'إعادة تعريف', ex: 'نفس توقيع `verso()` في Animale. حتى `toString()` في Animale ستستدعي هذه النسخة لكائن Cane.' }],
            ['public String verso(int volte) {', { t: 'Overloading', ar: 'تحميل زائد', ex: 'توقيع مختلف (معامل int) فهي دالة جديدة وليست إعادة تعريف، لذلك لا نضع @Override.' }],
            ['return super.toString() + " (cane)";', { t: 'super.toString()', ar: 'super.toString()', ex: 'نعيد استخدام وصف الأب ونضيف عليه.' }],
          ],
        },
        norma: {
          it: '@Override su ogni metodo ridefinito, nessun @Override sugli overload, riuso con super.metodo().',
          ar: '@Override على كل دالة معاد تعريفها، ولا @Override على دوال التحميل الزائد، وإعادة الاستخدام بـ super.metodo().',
        },
        quiz: [
          {
            d: 'Quale coppia è un overriding?', dAr: 'أي زوج يمثل إعادة تعريف (overriding)؟',
            opzioni: ['Padre: void f(int x) — Figlio: void f(double x)', 'Padre: void f(int x) — Figlio: void f(int x)', 'Stessa classe: void f() e void f(int x)', 'Padre: void f() — Figlio: void g()'], corretta: 1,
            it: 'Stessa firma in una sottoclasse: è overriding. Le altre sono overloading o metodi diversi.',
            ar: 'نفس التوقيع في صنف فرعي هو overriding، والباقي تحميل زائد أو دوال مختلفة.',
          },
          {
            d: 'Cosa succede se scrivi @Override sopra public String tostring() (con la s minuscola)?', dAr: 'ماذا يحدث إذا كتبت @Override فوق tostring() بحرف s صغير؟',
            opzioni: ['Niente, funziona', 'Errore di compilazione: il metodo non ridefinisce nulla', 'Viene chiamato toString()', 'Eccezione a runtime'], corretta: 1,
            it: '@Override fa controllare al compilatore che esista un metodo da ridefinire: tostring non esiste in Object.',
            ar: '@Override تجعل المترجم يتحقق من وجود دالة يُعاد تعريفها، و tostring غير موجودة في Object.',
          },
        ],
        costruisci: {
          consegna: 'Completa l\'annotazione, la firma ridefinita e la chiamata alla versione del padre.',
          consegnaAr: 'أكمل التعليق التوضيحي والتوقيع المعاد تعريفه واستدعاء نسخة الأب.',
          codice: `class Dipendente {

    private static final double STIPENDIO_BASE = 1500.0;

    public double stipendio() {
        return STIPENDIO_BASE;
    }
}

class Manager extends Dipendente {

    private static final double BONUS = 800.0;

    ⟦@Override⟧
    public ⟦double⟧ stipendio() {
        return ⟦super⟧.stipendio() + BONUS;
    }
}

public class Azienda {

    public static void main(String[] args) {
        Manager m = new Manager();
        System.out.println("Stipendio: " + m.stipendio());
    }
}`,
          output: 'Stipendio: 2300.0\n',
        },
        laboratorio: {
          titolo: 'Forme e perimetri',
          consegna: 'Crea Quadrato extends Forma che ridefinisce double perimetro() con @Override (lato * 4) e toString() con super.toString() + " quadrato". Stampa «Forma di perimetro 12.0 quadrato» per lato 3.',
          consegnaAr: 'أنشئ Quadrato extends Forma يعيد تعريف double perimetro() مع @Override (الضلع × 4)، و toString() بالصيغة super.toString() + " quadrato". اطبع «Forma di perimetro 12.0 quadrato» لضلع طوله 3.',
          codice: `class Forma {

    public double perimetro() {
        return 0;
    }

    @Override
    public String toString() {
        return "Forma di perimetro " + perimetro();
    }
}

// classe Quadrato

public class Geometria {

    public static void main(String[] args) {
        Forma f = new Quadrato(3);
        System.out.println(f);
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Forma di perimetro 12.0 quadrato', msg: 'Deve stampare «Forma di perimetro 12.0 quadrato».', msgAr: 'يجب أن يطبع «Forma di perimetro 12.0 quadrato».' },
            { tipo: 'codice', re: '@Override\\s+public\\s+double\\s+perimetro', msg: 'perimetro() deve avere @Override.', msgAr: 'يجب أن تحمل perimetro() التعليق @Override.' },
            { tipo: 'codice', re: 'super\\.toString\\s*\\(', msg: 'Riusa super.toString().', msgAr: 'أعد استخدام super.toString().' },
          ],
          soluzione: `class Forma {

    public double perimetro() {
        return 0;
    }

    @Override
    public String toString() {
        return "Forma di perimetro " + perimetro();
    }
}

class Quadrato extends Forma {

    private static final int LATI = 4;

    private final double lato;

    public Quadrato(double lato) {
        this.lato = lato;
    }

    @Override
    public double perimetro() {
        return lato * LATI;
    }

    @Override
    public String toString() {
        return super.toString() + " quadrato";
    }
}

public class Geometria {

    public static void main(String[] args) {
        Forma f = new Quadrato(3);
        System.out.println(f);
    }
}`,
        },
        riepilogo: [
          { it: 'Overriding: stessa firma in una sottoclasse, scelto a runtime.', ar: 'الـoverriding: نفس التوقيع في صنف فرعي ويُختار وقت التشغيل.' },
          { it: 'Overloading: firma diversa, scelto in compilazione.', ar: 'الـoverloading: توقيع مختلف ويُختار وقت الترجمة.' },
          { it: '@Override sempre; super.metodo() per riusare il padre.', ar: '@Override دائماً، و super.metodo() لإعادة استخدام الأب.' },
        ],
      },
      {
        id: 'l25', titolo: 'Polimorfismo, upcasting, downcasting e binding dinamico', durata: '15 min',
        obiettivi: ['Usare riferimenti del tipo padre', 'Capire il binding dinamico', 'Fare downcasting sicuro con instanceof'],
        teoria: [
          {
            it: 'Il polimorfismo permette a una variabile del tipo superclasse di riferirsi a oggetti di qualsiasi sottoclasse.',
            t: 'Polimorfismo', ar: 'تعدد الأشكال يسمح لمتغير من نوع الصنف الأب بالإشارة إلى كائنات من أي صنف فرعي.',
            ex: '`Animale a = new Cane("Fido");` صحيح لأن كل كلب هو حيوان. هذا يسمح بكتابة كود عام مثل مصفوفة `Animale[]` تحتوي كلاباً وقططاً معاً، ومعالجتها بحلقة واحدة.',
            bn: 'Programma verso il tipo più generale possibile.', bnAr: 'برمج باتجاه النوع الأعم الممكن.',
          },
          {
            it: 'Il binding dinamico fa sì che, a runtime, venga eseguita la versione del metodo del tipo reale dell\'oggetto, non del tipo della variabile.',
            t: 'Binding dinamico', ar: 'الربط الديناميكي يعني أنه وقت التشغيل تُنفَّذ نسخة الدالة الخاصة بالنوع الحقيقي للكائن وليس بنوع المتغير.',
            ex: 'المترجم يتحقق فقط أن الدالة موجودة في النوع المعلن (`Animale`)، لكن JVM وقت التشغيل تنظر إلى الكائن الحقيقي في الـHeap: إن كان `Cane` تنفّذ `verso()` الخاصة بالكلب.',
            bn: 'Lascia che sia il polimorfismo a scegliere il comportamento, non catene di if sul tipo.', bnAr: 'دع تعدد الأشكال يختار السلوك بدلاً من سلاسل if على النوع.',
          },
          {
            it: 'L\'upcasting è implicito e sicuro, mentre il downcasting verso una sottoclasse deve essere esplicito e può lanciare ClassCastException.',
            t: 'Upcasting e downcasting', ar: 'التحويل للأعلى ضمني وآمن، أما التحويل للأسفل إلى صنف فرعي فيجب أن يكون صريحاً وقد يرمي ClassCastException.',
            ex: 'من خلال متغير `Animale` لا يمكنك استدعاء `riporta()` الخاصة بالكلب. تحتاج `(Cane) a`، لكن إن كان الكائن قطة فعلاً ترمي JVM `ClassCastException`.',
            bn: 'Prima di un downcasting verifica il tipo con instanceof.', bnAr: 'قبل التحويل للأسفل تحقق من النوع بـ instanceof.',
          },
          {
            it: 'L\'operatore instanceof verifica se un oggetto è un\'istanza di una certa classe e, da Java 16, può dichiarare direttamente la variabile convertita.',
            t: 'instanceof', ar: 'المعامل instanceof يتحقق مما إذا كان الكائن نسخة من صنف معين، ومنذ Java 16 يمكنه التصريح مباشرة عن المتغير المحوَّل.',
            ex: '`if (a instanceof Cane c) { c.riporta(); }` يفحص ويحوّل في خطوة واحدة (pattern matching). لكن تذكّر: كثرة `instanceof` غالباً علامة على تصميم ينقصه تعدد الأشكال.',
            bn: 'Usa instanceof con parsimonia.', bnAr: 'استخدم instanceof باعتدال.',
          },
        ],
        analogia: {
          titolo: 'Il telecomando universale',
          it: 'Un telecomando universale ha il tasto «accendi»: premendolo, ogni dispositivo si accende a modo suo. Il tasto è lo stesso, il comportamento lo decide il dispositivo.',
          ar: 'تعدد الأشكال مثل جهاز تحكم عالمي فيه زر "تشغيل": تضغطه فيعمل التلفاز بطريقته والمكيّف بطريقته والمذياع بطريقته. الزر واحد (المتغير من نوع الأب)، والسلوك يقرره الجهاز الحقيقي (الكائن في الـHeap) — وهذا هو الربط الديناميكي. وإن أردت زراً خاصاً بالمكيّف فقط (درجة الحرارة) فعليك أولاً التأكد أنه مكيّف (`instanceof`).',
        },
        esempio: {
          file: 'Coro.java',
          codice: `class Animale {

    public String verso() {
        return "...";
    }
}

class Cane extends Animale {

    @Override
    public String verso() {
        return "Bau";
    }

    public String riporta() {
        return "riporta la pallina";
    }
}

class Gatto extends Animale {

    @Override
    public String verso() {
        return "Miao";
    }
}

public class Coro {

    public static void main(String[] args) {
        Animale[] animali = {new Cane(), new Gatto(), new Cane()};
        for (Animale a : animali) {
            System.out.print(a.verso() + " ");
        }
        System.out.println();

        for (Animale a : animali) {
            if (a instanceof Cane cane) {
                System.out.println("Il cane " + cane.riporta());
            }
        }

        Animale qualcuno = animali[1];
        try {
            Cane forse = (Cane) qualcuno;
            System.out.println(forse.riporta());
        } catch (ClassCastException e) {
            System.out.println("Non è un cane!");
        }
    }
}`,
          normaAmmesse: ['eccezioni-flusso'],
          note: [
            ['Animale[] animali = {new Cane(), new Gatto(), new Cane()};', { t: 'Upcasting implicito', ar: 'تحويل ضمني للأعلى', ex: 'كل كائن يُخزَّن كـ Animale، لكنه في الـHeap يبقى Cane أو Gatto.' }],
            ['System.out.print(a.verso() + " ");', { t: 'Binding dinamico', ar: 'الربط الديناميكي', ex: 'نفس السطر يطبع "Bau" ثم "Miao" ثم "Bau": JVM تختار الدالة حسب النوع الحقيقي.' }],
            ['if (a instanceof Cane cane) {', { t: 'Pattern matching', ar: 'مطابقة النمط', ex: 'يفحص النوع وينشئ المتغير `cane` المحوَّل إذا كان الفحص صحيحاً.' }],
          ],
        },
        norma: {
          it: 'Variabili del tipo più generale, comportamento affidato all\'overriding e downcasting solo dopo instanceof.',
          ar: 'متغيرات من النوع الأعم، والسلوك يُترك لإعادة التعريف، والتحويل للأسفل فقط بعد instanceof.',
        },
        quiz: [
          {
            d: 'Animale a = new Gatto(); System.out.println(a.verso()); Gatto ridefinisce verso(). Quale versione viene eseguita?', dAr: 'أي نسخة من verso() تُنفَّذ؟',
            opzioni: ['Quella di Animale, tipo della variabile', 'Quella di Gatto, tipo reale dell\'oggetto', 'Entrambe', 'Errore di compilazione'], corretta: 1,
            it: 'Binding dinamico: a runtime conta il tipo dell\'oggetto nello Heap.',
            ar: 'الربط الديناميكي: وقت التشغيل يهم نوع الكائن في الـHeap.',
          },
          {
            d: 'Animale a = new Gatto(); Cane c = (Cane) a; Cosa succede?', dAr: 'ماذا يحدث؟',
            opzioni: ['Compila e funziona', 'Errore di compilazione', 'Compila ma lancia ClassCastException a runtime', 'c vale null'], corretta: 2,
            it: 'Il compilatore accetta il cast (Cane è sottoclasse di Animale), ma a runtime l\'oggetto è un Gatto.',
            ar: 'يقبل المترجم التحويل لأن Cane صنف فرعي من Animale، لكن الكائن وقت التشغيل قطة.',
          },
        ],
        costruisci: {
          consegna: 'Completa il tipo dell\'array polimorfico, il controllo del tipo e il downcasting.',
          consegnaAr: 'أكمل نوع المصفوفة متعددة الأشكال وفحص النوع والتحويل للأسفل.',
          codice: `class Strumento {

    public String suona() {
        return "suono";
    }
}

class Chitarra extends Strumento {

    @Override
    public String suona() {
        return "dlen";
    }

    public String accorda() {
        return "accordata";
    }
}

class Tamburo extends Strumento {

    @Override
    public String suona() {
        return "bum";
    }
}

public class Orchestra {

    public static void main(String[] args) {
        ⟦Strumento⟧[] banda = {new Chitarra(), new Tamburo()};
        for (Strumento s : banda) {
            System.out.print(s.⟦suona⟧() + " ");
            if (s ⟦instanceof⟧ Chitarra) {
                Chitarra c = (⟦Chitarra⟧) s;
                System.out.print(c.accorda() + " ");
            }
        }
        System.out.println();
    }
}`,
          output: 'dlen accordata bum \n',
        },
        laboratorio: {
          titolo: 'Area totale polimorfica',
          consegna: 'Completa Cerchio e Rettangolo ridefinendo area(). Poi scrivi static double areaTotale(Forma[] forme) che somma le aree con un solo ciclo, senza instanceof. Con un cerchio di raggio 1 e un rettangolo 2×3 stampa «Area totale: 9.14» usando String.format("%.2f") — con Locale italiano diventa «9,14».',
          consegnaAr: 'أكمل Cerchio و Rettangolo بإعادة تعريف area(). ثم اكتب static double areaTotale(Forma[] forme) التي تجمع المساحات بحلقة واحدة دون instanceof. مع دائرة نصف قطرها 1 ومستطيل 2×3 اطبع المجموع بـ String.format("%.2f") فيظهر «Area totale: 9,14» بالتنسيق الإيطالي.',
          codice: `abstract class Forma {

    public abstract double area();
}

class Cerchio extends Forma {

    private final double raggio;

    public Cerchio(double raggio) {
        this.raggio = raggio;
    }

    // area()
}

class Rettangolo extends Forma {

    private final double base;
    private final double altezza;

    public Rettangolo(double base, double altezza) {
        this.base = base;
        this.altezza = altezza;
    }

    // area()
}

public class Geometria {

    // areaTotale

    public static void main(String[] args) {
        Forma[] forme = {new Cerchio(1), new Rettangolo(2, 3)};
        System.out.println("Area totale: " + String.format("%.2f", areaTotale(forme)));
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Area totale: 9,14', msg: 'Deve stampare «Area totale: 9,14».', msgAr: 'يجب أن يطبع «Area totale: 9,14».' },
            { tipo: 'nonCodice', re: 'instanceof', msg: 'Non usare instanceof: sfrutta il binding dinamico.', msgAr: 'لا تستخدم instanceof بل استفد من الربط الديناميكي.' },
            { tipo: 'codice', re: 'static\\s+double\\s+areaTotale\\s*\\(\\s*Forma\\s*\\[\\]', msg: 'Scrivi static double areaTotale(Forma[] forme).', msgAr: 'اكتب static double areaTotale(Forma[] forme).' },
          ],
          soluzione: `abstract class Forma {

    public abstract double area();
}

class Cerchio extends Forma {

    private final double raggio;

    public Cerchio(double raggio) {
        this.raggio = raggio;
    }

    @Override
    public double area() {
        return Math.PI * raggio * raggio;
    }
}

class Rettangolo extends Forma {

    private final double base;
    private final double altezza;

    public Rettangolo(double base, double altezza) {
        this.base = base;
        this.altezza = altezza;
    }

    @Override
    public double area() {
        return base * altezza;
    }
}

public class Geometria {

    public static double areaTotale(Forma[] forme) {
        double totale = 0;
        for (Forma f : forme) {
            totale += f.area();
        }
        return totale;
    }

    public static void main(String[] args) {
        Forma[] forme = {new Cerchio(1), new Rettangolo(2, 3)};
        System.out.println("Area totale: " + String.format("%.2f", areaTotale(forme)));
    }
}`,
        },
        riepilogo: [
          { it: 'Un riferimento del padre può puntare a un oggetto figlio (upcasting).', ar: 'مرجع من نوع الأب يمكن أن يشير إلى كائن ابن (تحويل للأعلى).' },
          { it: 'Binding dinamico: si esegue il metodo del tipo reale.', ar: 'الربط الديناميكي: تُنفَّذ دالة النوع الحقيقي.' },
          { it: 'Downcasting solo dopo instanceof, altrimenti ClassCastException.', ar: 'التحويل للأسفل فقط بعد instanceof وإلا ClassCastException.' },
        ],
      },
      {
        id: 'l26', titolo: 'Classi astratte e metodi astratti', durata: '13 min',
        obiettivi: ['Dichiarare classi e metodi abstract', 'Capire perché una classe astratta non si istanzia'],
        teoria: [
          {
            it: 'Una classe astratta, dichiarata con abstract, rappresenta un concetto generico e non può essere istanziata con new.',
            t: 'Classe astratta', ar: 'الصنف المجرد المعلن بـ abstract يمثل مفهوماً عاماً ولا يمكن إنشاء نسخ منه بـ new.',
            ex: 'لا يوجد "شكل" بحد ذاته في الواقع، بل دوائر ومستطيلات. لذلك `Forma` مجردة: `new Forma()` خطأ ترجمة. لكن يمكن أن يكون لها خصائص ومُنشئات ودوال كاملة.',
            bn: 'Rendi astratte le classi che rappresentano concetti generici.', bnAr: 'اجعل الأصناف التي تمثل مفاهيم عامة مجردة.',
          },
          {
            it: 'Un metodo astratto ha solo la firma, senza corpo, e obbliga ogni sottoclasse concreta a implementarlo.',
            t: 'Metodo astratto', ar: 'الدالة المجردة لها توقيع فقط دون جسم، وتُلزم كل صنف فرعي ملموس بتنفيذها.',
            ex: '`public abstract double area();` — تنتهي بفاصلة منقوطة بلا `{ }`. إن لم ينفّذها صنف فرعي فيجب أن يكون هو نفسه مجرداً، وإلا يحدث خطأ ترجمة.',
            bn: 'Un metodo astratto è un contratto che le sottoclassi devono rispettare.', bnAr: 'الدالة المجردة عقد يجب أن تلتزم به الأصناف الفرعية.',
          },
          {
            it: 'Una classe astratta può contenere metodi concreti che usano metodi astratti, realizzando lo schema del template method.',
            t: 'Template method', ar: 'يمكن للصنف المجرد أن يحتوي دوالاً كاملة تستخدم الدوال المجردة، وهذا نمط "الدالة القالب".',
            ex: 'مثلاً `descrivi()` في Forma تطبع "Area: " + `area()`. الأب يكتب الهيكل العام مرة واحدة، والأبناء يملؤون التفاصيل. هكذا لا يتكرر الكود.',
            bn: 'Metti nella classe astratta il codice comune, nelle sottoclassi le differenze.', bnAr: 'ضع الكود المشترك في الصنف المجرد والاختلافات في الأصناف الفرعية.',
          },
        ],
        analogia: {
          titolo: 'Il modulo da compilare',
          it: 'Una classe astratta è un modulo con alcuni campi già stampati e altri vuoti: non vale finché qualcuno non compila i campi vuoti (i metodi astratti).',
          ar: 'الصنف المجرد مثل استمارة رسمية بعض حقولها مطبوع مسبقاً (الدوال الكاملة) وبعضها فارغ (الدوال المجردة). لا يمكن تقديم الاستمارة كما هي (لا يمكن `new`)، بل يجب على كل شخص (صنف فرعي) أن يملأ الحقول الفارغة بطريقته.',
        },
        esempio: {
          file: 'Pagamenti.java',
          codice: `abstract class Pagamento {

    private final double importo;

    protected Pagamento(double importo) {
        this.importo = importo;
    }

    public double getImporto() {
        return importo;
    }

    public abstract double commissione();

    public String ricevuta() {
        return String.format("Importo %.2f + commissione %.2f = %.2f",
                importo, commissione(), importo + commissione());
    }
}

class PagamentoCarta extends Pagamento {

    private static final double PERCENTUALE = 0.015;

    public PagamentoCarta(double importo) {
        super(importo);
    }

    @Override
    public double commissione() {
        return getImporto() * PERCENTUALE;
    }
}

class Bonifico extends Pagamento {

    private static final double COSTO_FISSO = 1.0;

    public Bonifico(double importo) {
        super(importo);
    }

    @Override
    public double commissione() {
        return COSTO_FISSO;
    }
}

public class Pagamenti {

    public static void main(String[] args) {
        Pagamento[] pagamenti = {new PagamentoCarta(200), new Bonifico(200)};
        for (Pagamento p : pagamenti) {
            System.out.println(p.ricevuta());
        }
    }
}`,
          note: [
            ['public abstract double commissione();', { t: 'Metodo astratto', ar: 'دالة مجردة', ex: 'بلا جسم: كل نوع دفع يحسب العمولة بطريقته.' }],
            ['public String ricevuta() {', { t: 'Template method', ar: 'الدالة القالب', ex: 'هيكل الإيصال مكتوب مرة واحدة ويستدعي `commissione()` التي يختارها الربط الديناميكي.' }],
          ],
        },
        norma: {
          it: 'Classi astratte per i concetti generici, costruttore protected, codice comune nel padre e metodi astratti per le differenze.',
          ar: 'أصناف مجردة للمفاهيم العامة، ومُنشئ protected، والكود المشترك في الأب، والدوال المجردة للاختلافات.',
        },
        quiz: [
          {
            d: 'abstract class Forma { ... } — new Forma() è valido?', dAr: 'هل new Forma() صحيح؟',
            opzioni: ['Sì', 'No, una classe astratta non si istanzia', 'Sì, se ha un costruttore', 'Solo dentro una sottoclasse'], corretta: 1,
            it: 'Le classi astratte non possono essere istanziate direttamente; si istanziano le sottoclassi concrete.',
            ar: 'لا يمكن إنشاء نسخ من الأصناف المجردة مباشرة، بل من الأصناف الفرعية الملموسة.',
          },
          {
            d: 'Una sottoclasse concreta non implementa un metodo astratto ereditato. Cosa succede?', dAr: 'ماذا يحدث إذا لم ينفّذ صنف فرعي ملموس دالة مجردة موروثة؟',
            opzioni: ['Il metodo restituisce null', 'Errore di compilazione', 'Eccezione quando viene chiamato', 'Viene ereditato vuoto'], corretta: 1,
            it: 'Una classe concreta deve implementare tutti i metodi astratti, altrimenti deve essere dichiarata abstract.',
            ar: 'يجب أن ينفّذ الصنف الملموس كل الدوال المجردة وإلا يجب التصريح عنه كمجرد.',
          },
        ],
        costruisci: {
          consegna: 'Completa la classe astratta, il metodo astratto e la sua implementazione.',
          consegnaAr: 'أكمل الصنف المجرد والدالة المجردة وتنفيذها.',
          codice: `⟦abstract⟧ class Dispositivo {

    public abstract String ⟦avvia⟧();

    public void accendi() {
        System.out.println("Avvio: " + avvia());
    }
}

class Stampante ⟦extends⟧ Dispositivo {

    @Override
    public String avvia() {
        return "stampante pronta";
    }
}

public class Ufficio {

    public static void main(String[] args) {
        Dispositivo d = new ⟦Stampante⟧();
        d.accendi();
    }
}`,
          output: 'Avvio: stampante pronta\n',
        },
        laboratorio: {
          titolo: 'Dipendenti e stipendi',
          consegna: 'Completa la gerarchia: Dipendente è astratta con abstract double stipendio(). Crea DipendenteFisso (stipendio fisso) e Consulente (ore × tariffa oraria). Stampa «Totale: 2600.0» per un fisso da 1800 e un consulente con 20 ore a 40 €/h.',
          consegnaAr: 'أكمل الهرمية: Dipendente صنف مجرد بالدالة abstract double stipendio(). أنشئ DipendenteFisso (راتب ثابت) و Consulente (الساعات × أجر الساعة). اطبع «Totale: 2600.0» لموظف ثابت براتب 1800 ومستشار عمل 20 ساعة بأجر 40.',
          codice: `abstract class Dipendente {

    public abstract double stipendio();
}

// DipendenteFisso e Consulente

public class Paghe {

    public static void main(String[] args) {
        Dipendente[] dipendenti = {new DipendenteFisso(1800), new Consulente(20, 40)};
        double totale = 0;
        for (Dipendente d : dipendenti) {
            totale += d.stipendio();
        }
        System.out.println("Totale: " + totale);
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Totale: 2600.0', msg: 'Deve stampare «Totale: 2600.0».', msgAr: 'يجب أن يطبع «Totale: 2600.0».' },
            { tipo: 'codice', re: 'class\\s+DipendenteFisso\\s+extends\\s+Dipendente', msg: 'DipendenteFisso deve estendere Dipendente.', msgAr: 'يجب أن يرث DipendenteFisso من Dipendente.' },
            { tipo: 'codice', re: 'class\\s+Consulente\\s+extends\\s+Dipendente', msg: 'Consulente deve estendere Dipendente.', msgAr: 'يجب أن يرث Consulente من Dipendente.' },
          ],
          soluzione: `abstract class Dipendente {

    public abstract double stipendio();
}

class DipendenteFisso extends Dipendente {

    private final double mensile;

    public DipendenteFisso(double mensile) {
        this.mensile = mensile;
    }

    @Override
    public double stipendio() {
        return mensile;
    }
}

class Consulente extends Dipendente {

    private final int ore;
    private final double tariffaOraria;

    public Consulente(int ore, double tariffaOraria) {
        this.ore = ore;
        this.tariffaOraria = tariffaOraria;
    }

    @Override
    public double stipendio() {
        return ore * tariffaOraria;
    }
}

public class Paghe {

    public static void main(String[] args) {
        Dipendente[] dipendenti = {new DipendenteFisso(1800), new Consulente(20, 40)};
        double totale = 0;
        for (Dipendente d : dipendenti) {
            totale += d.stipendio();
        }
        System.out.println("Totale: " + totale);
    }
}`,
        },
        riepilogo: [
          { it: 'abstract class: concetto generico, non istanziabile.', ar: 'الصنف المجرد مفهوم عام لا يمكن إنشاء نسخ منه.' },
          { it: 'abstract method: firma senza corpo, obbligatoria per le sottoclassi concrete.', ar: 'الدالة المجردة توقيع بلا جسم يُلزم الأصناف الفرعية الملموسة.' },
          { it: 'Codice comune nel padre, differenze nei figli.', ar: 'الكود المشترك في الأب والاختلافات في الأبناء.' },
        ],
      },
      {
        id: 'l27', titolo: 'Interfacce: contratti e implementazione multipla', durata: '14 min',
        obiettivi: ['Dichiarare e implementare interfacce', 'Implementare più interfacce', 'Distinguere interfacce e classi astratte'],
        teoria: [
          {
            it: 'Un\'interfaccia definisce un contratto, cioè un insieme di metodi che una classe si impegna a fornire con implements.',
            t: 'Interfaccia', ar: 'الواجهة (interface) تعرّف عقداً، أي مجموعة دوال يلتزم الصنف بتوفيرها باستخدام implements.',
            ex: 'دوال الواجهة عامة ومجردة ضمنياً. الواجهة تقول "ماذا يستطيع الكائن أن يفعل" (قدرة) دون أن تقول "ما هو". أسماؤها غالباً صفات مثل `Pagabile` و `Stampabile` و `Comparable`.',
            bn: 'Dai alle interfacce nomi di capacità (-abile, -ibile).', bnAr: 'سمِّ الواجهات بأسماء قدرات (-abile، -ibile).',
          },
          {
            it: 'Una classe può estendere una sola classe ma implementare più interfacce.',
            t: 'Implementazione multipla', ar: 'يمكن للصنف أن يرث صنفاً واحداً فقط لكنه يستطيع تنفيذ عدة واجهات.',
            ex: '`class Smartphone extends Dispositivo implements Fotografabile, Chiamabile` — هكذا تحل Java مشكلة الوراثة المتعددة: نوع واحد كأب، وقدرات متعددة كواجهات.',
            bn: 'Usa le interfacce come tipo delle variabili e dei parametri.', bnAr: 'استخدم الواجهات كنوع للمتغيرات والمعاملات.',
          },
          {
            it: 'Da Java 8 un\'interfaccia può avere metodi default con un\'implementazione e metodi static.',
            t: 'Metodi default', ar: 'منذ Java 8 يمكن للواجهة أن تحتوي دوالاً default لها تنفيذ، ودوالاً static.',
            ex: 'الدالة `default` توفر سلوكاً افتراضياً يمكن للأصناف إعادة تعريفه. سمح هذا بإضافة دوال جديدة إلى واجهات قديمة مثل `List` دون كسر الكود الموجود.',
            bn: 'Interfaccia per «cosa sa fare», classe astratta per «cosa è» con stato comune.', bnAr: 'الواجهة لـ"ماذا يستطيع أن يفعل"، والصنف المجرد لـ"ما هو" مع حالة مشتركة.',
          },
        ],
        analogia: {
          titolo: 'La patente',
          it: 'Un\'interfaccia è una patente: chiunque la ottenga (implements) si impegna a saper guidare, che sia uno studente o un docente.',
          ar: 'الواجهة مثل رخصة القيادة: أي شخص يحصل عليها (`implements`) يلتزم بأنه يعرف القيادة، سواء كان طالباً أو أستاذاً أو طبيباً. يمكن لشخص أن يحمل عدة رخص (قيادة، سباحة، طيران)، لكن له أب واحد فقط (`extends`).',
        },
        esempio: {
          file: 'Negozio.java',
          codice: `interface Prezzabile {

    double prezzo();

    default double prezzoScontato(double percentuale) {
        return prezzo() * (1 - percentuale);
    }
}

interface Descrivibile {

    String descrizione();
}

class Libro implements Prezzabile, Descrivibile {

    private final String titolo;
    private final double prezzo;

    public Libro(String titolo, double prezzo) {
        this.titolo = titolo;
        this.prezzo = prezzo;
    }

    @Override
    public double prezzo() {
        return prezzo;
    }

    @Override
    public String descrizione() {
        return "Libro: " + titolo;
    }
}

class Corso implements Prezzabile {

    private final int ore;
    private final double tariffa;

    public Corso(int ore, double tariffa) {
        this.ore = ore;
        this.tariffa = tariffa;
    }

    @Override
    public double prezzo() {
        return ore * tariffa;
    }
}

public class Negozio {

    private static final double SCONTO_STUDENTI = 0.2;

    public static void main(String[] args) {
        Prezzabile[] carrello = {new Libro("Java", 40.0), new Corso(10, 15.0)};
        double totale = 0;
        for (Prezzabile p : carrello) {
            totale += p.prezzoScontato(SCONTO_STUDENTI);
        }
        System.out.println("Totale con sconto studenti: " + totale);
        Descrivibile d = new Libro("Algoritmi", 35.0);
        System.out.println(d.descrizione());
    }
}`,
          note: [
            ['default double prezzoScontato', { t: 'Metodo default', ar: 'دالة default', ex: 'كل صنف ينفّذ Prezzabile يحصل عليها مجاناً، وهي تستدعي `prezzo()` الخاصة به.' }],
            ['class Libro implements Prezzabile, Descrivibile {', { t: 'Più interfacce', ar: 'عدة واجهات', ex: 'Libro يلتزم بعقدين: له سعر وله وصف.' }],
          ],
        },
        norma: {
          it: 'Interfacce piccole e coese, @Override sui metodi implementati e variabili dichiarate con il tipo dell\'interfaccia.',
          ar: 'واجهات صغيرة ومتماسكة، و @Override على الدوال المنفّذة، ومتغيرات معلنة بنوع الواجهة.',
        },
        quiz: [
          {
            d: 'Quale dichiarazione è valida in Java?', dAr: 'أي تصريح صحيح في Java؟',
            opzioni: ['class A extends B, C', 'class A implements B, C', 'class A extends B implements C extends D', 'interface A implements B'], corretta: 1,
            it: 'Si estende una sola classe ma si possono implementare più interfacce (un\'interfaccia estende altre interfacce con extends).',
            ar: 'يُورث صنف واحد فقط لكن يمكن تنفيذ عدة واجهات (والواجهة ترث واجهات أخرى بـ extends).',
          },
          {
            d: 'Quando preferire una classe astratta a un\'interfaccia?', dAr: 'متى نفضّل الصنف المجرد على الواجهة؟',
            opzioni: ['Mai', 'Quando le sottoclassi condividono stato (attributi) e codice comune', 'Quando serve implementazione multipla', 'Quando non ci sono metodi'], corretta: 1,
            it: 'La classe astratta può avere attributi d\'istanza e costruttori; l\'interfaccia descrive solo capacità.',
            ar: 'الصنف المجرد يمكن أن يحتوي خصائص نسخة ومُنشئات، أما الواجهة فتصف القدرات فقط.',
          },
        ],
        costruisci: {
          consegna: 'Completa la dichiarazione dell\'interfaccia, la parola chiave per implementarla e il tipo della variabile.',
          consegnaAr: 'أكمل تعريف الواجهة والكلمة المفتاحية لتنفيذها ونوع المتغير.',
          codice: `⟦interface⟧ Volante {

    String vola();
}

class Aereo ⟦implements⟧ Volante {

    @Override
    public String vola() {
        return "Decollo!";
    }
}

public class Aeroporto {

    public static void main(String[] args) {
        ⟦Volante⟧ v = new Aereo();
        System.out.println(v.⟦vola⟧());
    }
}`,
          output: 'Decollo!\n',
        },
        laboratorio: {
          titolo: 'Notifiche',
          consegna: 'Crea l\'interfaccia Notificabile con il metodo String invia(String messaggio). Implementala in Email («Email: ...») e Sms («SMS: ...»). Nel main usa un array Notificabile[] per inviare «Esame il 12/06» con entrambe.',
          consegnaAr: 'أنشئ الواجهة Notificabile بالدالة String invia(String messaggio). نفّذها في Email («Email: ...») و Sms («SMS: ...»). في main استخدم مصفوفة Notificabile[] لإرسال «Esame il 12/06» بالاثنين.',
          codice: `// interfaccia e classi

public class Avvisi {

    public static void main(String[] args) {

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Email: Esame il 12/06\nSMS: Esame il 12/06', msg: 'Output atteso: «Email: Esame il 12/06» e «SMS: Esame il 12/06».', msgAr: 'المخرجات المتوقعة: «Email: Esame il 12/06» ثم «SMS: Esame il 12/06».' },
            { tipo: 'codice', re: 'interface\\s+Notificabile', msg: 'Dichiara l\'interfaccia Notificabile.', msgAr: 'صرّح عن الواجهة Notificabile.' },
            { tipo: 'codice', re: 'Notificabile\\s*\\[\\]', msg: 'Usa un array Notificabile[].', msgAr: 'استخدم مصفوفة Notificabile[].' },
          ],
          soluzione: `interface Notificabile {

    String invia(String messaggio);
}

class Email implements Notificabile {

    @Override
    public String invia(String messaggio) {
        return "Email: " + messaggio;
    }
}

class Sms implements Notificabile {

    @Override
    public String invia(String messaggio) {
        return "SMS: " + messaggio;
    }
}

public class Avvisi {

    public static void main(String[] args) {
        Notificabile[] canali = {new Email(), new Sms()};
        for (Notificabile canale : canali) {
            System.out.println(canale.invia("Esame il 12/06"));
        }
    }
}`,
        },
        riepilogo: [
          { it: 'Un\'interfaccia è un contratto; una classe lo rispetta con implements.', ar: 'الواجهة عقد يلتزم به الصنف عبر implements.' },
          { it: 'Una classe estende una sola classe ma implementa più interfacce.', ar: 'الصنف يرث صنفاً واحداً وينفّذ عدة واجهات.' },
          { it: 'I metodi default forniscono un comportamento predefinito.', ar: 'دوال default توفر سلوكاً افتراضياً.' },
        ],
      },
    ],
  };
  if (typeof module === 'object' && module.exports) module.exports = livello;
  else (root.CF_LIVELLI = root.CF_LIVELLI || []).push(livello);
})(typeof globalThis !== 'undefined' ? globalThis : this);
