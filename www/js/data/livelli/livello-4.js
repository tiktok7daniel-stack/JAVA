/* CodeForge — Livello 4: Programmazione a Oggetti (Progettista di Classi). */
(function (root) {
  'use strict';
  const livello = {
    numero: 4, id: 'L4', colore: '#3FB950', icona: 'object',
    titolo: 'Programmazione a Oggetti', titoloAr: 'البرمجة كائنية التوجه',
    grado: 'Progettista di Classi', gradoAr: 'مصمّم أصناف',
    descr: 'Classi e oggetti, costruttori e this, incapsulamento, memoria Stack/Heap e la differenza tra static e istanza.',
    lezioni: [
      {
        id: 'l18', titolo: 'Classi e oggetti: attributi e metodi d\'istanza', durata: '14 min',
        obiettivi: ['Definire una classe con attributi e metodi', 'Creare oggetti con new e chiamarne i metodi'],
        teoria: [
          {
            it: 'Una classe è un modello che descrive lo stato (attributi) e il comportamento (metodi) di un tipo di oggetti.',
            t: 'Classe', ar: 'الصنف (الكلاس) نموذج يصف الحالة (الخصائص) والسلوك (الدوال) لنوع من الكائنات.',
            ex: 'الصنف `Studente` يحدد أن لكل طالب اسماً ورقم تسجيل (matricola) ودوال مثل `presentati()`. الصنف بحد ذاته لا يحجز ذاكرة للبيانات، بل هو المخطط.',
            bn: 'Nomi di classe in PascalCase e al singolare: Studente, non studenti.', bnAr: 'أسماء الأصناف بصيغة PascalCase ومفردة: Studente وليس studenti.',
          },
          {
            it: 'Un oggetto è un\'istanza concreta di una classe, creata nello Heap con l\'operatore new.',
            t: 'Oggetto (istanza)', ar: 'الكائن نسخة فعلية من الصنف، تُنشأ في الـHeap باستخدام المعامل new.',
            ex: '`Studente s = new Studente();` — `new` يحجز ذاكرة في الـHeap للكائن، والمتغير `s` على الـStack يحمل مرجعاً (عنواناً) إليه. يمكن إنشاء عدد غير محدود من الكائنات من نفس الصنف، ولكل منها خصائصه الخاصة.',
            bn: 'Una variabile oggetto contiene un riferimento, non l\'oggetto stesso.', bnAr: 'متغير الكائن يحمل مرجعاً وليس الكائن نفسه.',
          },
          {
            it: 'I metodi d\'istanza si chiamano con la notazione punto e operano sugli attributi dell\'oggetto su cui sono invocati.',
            t: 'Metodo d\'istanza', ar: 'دوال النسخة تُستدعى بصيغة النقطة وتعمل على خصائص الكائن الذي استُدعيت عليه.',
            ex: 'عند `anna.presentati()` تعمل الدالة على بيانات `anna`، وعند `luca.presentati()` على بيانات `luca`. نفس الكود، كائنات مختلفة.',
            bn: 'Gli attributi sono private (lo vedremo nell\'incapsulamento).', bnAr: 'الخصائص تكون private (سنرى ذلك في التغليف).',
          },
        ],
        analogia: {
          titolo: 'Lo stampo per biscotti',
          it: 'La classe è lo stampo, gli oggetti sono i biscotti: stessa forma, ma ognuno può avere una glassa diversa.',
          ar: 'الصنف هو قالب الحلوى، والكائنات هي قطع الحلوى المصنوعة به: كلها بنفس الشكل (نفس الخصائص والدوال)، لكن لكل قطعة زينتها الخاصة (قيم خصائصها). القالب نفسه لا يؤكل، والحلوى تُصنع في الفرن (الـHeap) عند استخدام `new`.',
        },
        esempio: {
          file: 'Universita.java',
          codice: `class Studente {

    private String nome;
    private int crediti;

    public void imposta(String nuovoNome, int nuoviCrediti) {
        nome = nuovoNome;
        crediti = nuoviCrediti;
    }

    public void aggiungiCrediti(int cfu) {
        crediti += cfu;
    }

    public void presentati() {
        System.out.println("Sono " + nome + " e ho " + crediti + " CFU");
    }
}

public class Universita {

    public static void main(String[] args) {
        Studente anna = new Studente();
        anna.imposta("Anna", 60);
        Studente luca = new Studente();
        luca.imposta("Luca", 12);

        anna.aggiungiCrediti(9);
        anna.presentati();
        luca.presentati();
    }
}`,
          note: [
            ['Studente anna = new Studente();', { t: 'Creazione di un oggetto', ar: 'إنشاء كائن', ex: 'يُنشأ كائن في الـHeap وتحمل `anna` مرجعه. شاهد السهم من الـStack إلى الـHeap في عرض الذاكرة.' }],
            ['anna.aggiungiCrediti(9);', { t: 'Chiamata su un oggetto', ar: 'استدعاء على كائن', ex: 'تتغير خاصية `crediti` لكائن anna فقط، ويبقى كائن luca كما هو.' }],
          ],
        },
        norma: {
          it: 'Una classe per concetto, nome al singolare in PascalCase, attributi private e metodi che agiscono sullo stato dell\'oggetto.',
          ar: 'صنف لكل مفهوم، باسم مفرد بصيغة PascalCase، وخصائص private، ودوال تعمل على حالة الكائن.',
        },
        quiz: [
          {
            d: 'Cosa contiene la variabile anna dopo Studente anna = new Studente();?', dAr: 'ماذا يحتوي المتغير anna بعد إنشاء الكائن؟',
            opzioni: ['L\'oggetto intero', 'Un riferimento all\'oggetto nello Heap', 'Una copia della classe', 'null'], corretta: 1,
            it: 'Le variabili di tipo classe contengono riferimenti; l\'oggetto vive nello Heap.',
            ar: 'متغيرات الأصناف تحمل مراجع، والكائن نفسه يعيش في الـHeap.',
          },
          {
            d: 'Due oggetti della stessa classe condividono i valori degli attributi d\'istanza?', dAr: 'هل يتشارك كائنان من نفس الصنف قيم خصائص النسخة؟',
            opzioni: ['Sì, sempre', 'No, ogni oggetto ha la propria copia degli attributi', 'Solo se sono public', 'Solo i numeri'], corretta: 1,
            it: 'Ogni istanza ha il proprio stato: cambiare anna non cambia luca.',
            ar: 'لكل نسخة حالتها الخاصة، وتغيير anna لا يغيّر luca.',
          },
        ],
        costruisci: {
          consegna: 'Completa la creazione dell\'oggetto e la chiamata dei metodi.',
          consegnaAr: 'أكمل إنشاء الكائن واستدعاء الدوال.',
          codice: `class Lampada {

    private boolean accesa;

    public void premi() {
        accesa = !accesa;
    }

    public void stato() {
        System.out.println(accesa ? "Accesa" : "Spenta");
    }
}

public class Casa {

    public static void main(String[] args) {
        Lampada lampada = ⟦new⟧ Lampada⟦()⟧;
        lampada⟦.⟧premi();
        lampada.⟦stato⟧();
    }
}`,
          output: 'Accesa\n',
        },
        laboratorio: {
          titolo: 'Il contatore',
          consegna: 'Crea la classe Contatore con un attributo private int valore e i metodi incrementa(), azzera() e int getValore(). Nel main incrementa 3 volte e stampa «Valore: 3».',
          consegnaAr: 'أنشئ الصنف Contatore بخاصية private int valore والدوال incrementa() و azzera() و int getValore(). في main زِد العدّاد 3 مرات واطبع «Valore: 3».',
          codice: `// scrivi qui la classe Contatore

public class Prova {

    public static void main(String[] args) {

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Valore: 3', msg: 'Deve stampare «Valore: 3».', msgAr: 'يجب أن يطبع «Valore: 3».' },
            { tipo: 'codice', re: 'class\\s+Contatore', msg: 'Manca la classe Contatore.', msgAr: 'الصنف Contatore غير موجود.' },
            { tipo: 'codice', re: 'private\\s+int\\s+valore', msg: 'L\'attributo valore deve essere private.', msgAr: 'يجب أن تكون الخاصية valore من نوع private.' },
            { tipo: 'codice', re: 'new\\s+Contatore\\s*\\(', msg: 'Crea un oggetto Contatore con new.', msgAr: 'أنشئ كائناً من Contatore باستخدام new.' },
          ],
          soluzione: `class Contatore {

    private int valore;

    public void incrementa() {
        valore++;
    }

    public void azzera() {
        valore = 0;
    }

    public int getValore() {
        return valore;
    }
}

public class Prova {

    public static void main(String[] args) {
        Contatore c = new Contatore();
        c.incrementa();
        c.incrementa();
        c.incrementa();
        System.out.println("Valore: " + c.getValore());
    }
}`,
        },
        riepilogo: [
          { it: 'Classe = modello; oggetto = istanza creata con new nello Heap.', ar: 'الصنف نموذج، والكائن نسخة تُنشأ بـ new في الـHeap.' },
          { it: 'La variabile contiene un riferimento all\'oggetto.', ar: 'المتغير يحمل مرجعاً إلى الكائن.' },
          { it: 'Ogni oggetto ha i propri attributi.', ar: 'لكل كائن خصائصه الخاصة.' },
        ],
      },
      {
        id: 'l19', titolo: 'Costruttori e la parola chiave this', durata: '13 min',
        obiettivi: ['Inizializzare oggetti con i costruttori', 'Usare this per distinguere attributi e parametri', 'Concatenare costruttori con this(...)'],
        teoria: [
          {
            it: 'Il costruttore è un metodo speciale con lo stesso nome della classe e senza tipo di ritorno, chiamato automaticamente da new.',
            t: 'Costruttore', ar: 'المُنشئ دالة خاصة بنفس اسم الصنف ودون نوع إرجاع، تُستدعى تلقائياً عند new.',
            ex: 'وظيفته أن يضع الكائن في حالة صحيحة منذ لحظة ولادته. إذا لم تكتب أي مُنشئ يضيف المترجم مُنشئاً افتراضياً بلا معاملات؛ وإن كتبت مُنشئاً بمعاملات يختفي الافتراضي.',
            bn: 'Un oggetto deve essere valido subito dopo il costruttore.', bnAr: 'يجب أن يكون الكائن صالحاً مباشرة بعد المُنشئ.',
          },
          {
            it: 'La parola chiave this indica l\'oggetto corrente e permette di distinguere un attributo da un parametro con lo stesso nome.',
            t: 'this', ar: 'الكلمة المفتاحية this تشير إلى الكائن الحالي وتسمح بالتمييز بين خاصية ومعامل يحملان نفس الاسم.',
            ex: 'في `this.nome = nome;` الطرف الأيسر هو خاصية الكائن والأيمن هو المعامل. بدون `this` تكتب `nome = nome;` فتسند المعامل إلى نفسه وتبقى الخاصية `null` — خطأ شائع جداً.',
            bn: 'Dai ai parametri del costruttore lo stesso nome degli attributi e usa this.', bnAr: 'أعطِ معاملات المُنشئ نفس أسماء الخصائص واستخدم this.',
          },
          {
            it: 'Con this(...) come prima istruzione un costruttore può chiamarne un altro della stessa classe, evitando codice duplicato.',
            t: 'Concatenazione di costruttori', ar: 'باستخدام this(...) كأول تعليمة يمكن لمُنشئ أن يستدعي مُنشئاً آخر من نفس الصنف لتجنب تكرار الكود.',
            ex: 'المُنشئ المختصر `Rettangolo(double lato)` يستدعي `this(lato, lato)` فيمرّر العمل إلى المُنشئ الكامل. يجب أن يكون `this(...)` أول سطر وإلا يحدث خطأ ترجمة.',
            bn: 'Metti la logica in un solo costruttore e fai chiamare quello dagli altri.', bnAr: 'ضع المنطق في مُنشئ واحد واجعل الباقي يستدعيه.',
          },
        ],
        analogia: {
          titolo: 'Il modulo di iscrizione',
          it: 'Il costruttore è il modulo di iscrizione: non puoi diventare studente senza compilarlo; this è la parola «mio» nel modulo.',
          ar: 'المُنشئ مثل استمارة التسجيل في الجامعة: لا يمكنك أن تصبح طالباً دون ملئها، فتخرج من التسجيل ومعك اسم ورقم تسجيل صحيحان. و`this` تعني "الخاص بي": `this.nome = nome` أي "اسمي (في السجل) = الاسم الذي كتبته في الاستمارة".',
        },
        esempio: {
          file: 'Figure.java',
          codice: `class Rettangolo {

    private double base;
    private double altezza;

    public Rettangolo(double base, double altezza) {
        this.base = base;
        this.altezza = altezza;
    }

    public Rettangolo(double lato) {
        this(lato, lato);
    }

    public double area() {
        return base * altezza;
    }
}

public class Figure {

    public static void main(String[] args) {
        Rettangolo r = new Rettangolo(3.0, 2.0);
        Rettangolo quadrato = new Rettangolo(4.0);
        System.out.println("Area rettangolo: " + r.area());
        System.out.println("Area quadrato: " + quadrato.area());
    }
}`,
          note: [
            ['this.base = base;', { t: 'this', ar: 'this', ex: 'الخاصية `base` للكائن الجديد تأخذ قيمة المعامل `base`.' }],
            ['this(lato, lato);', { t: 'this(...)', ar: 'استدعاء مُنشئ آخر', ex: 'المربع حالة خاصة من المستطيل: نعيد استخدام المُنشئ الكامل بدلاً من تكرار الكود.' }],
          ],
        },
        norma: {
          it: 'Ogni attributo inizializzato nel costruttore, this.attributo = parametro, e costruttori secondari che delegano con this(...).',
          ar: 'كل خاصية تُهيّأ في المُنشئ عبر this.attributo = parametro، والمُنشئات الثانوية تفوّض عبر this(...).',
        },
        quiz: [
          {
            d: 'Nel costruttore Persona(String nome) { nome = nome; } cosa succede all\'attributo nome?', dAr: 'ماذا يحدث للخاصية nome؟',
            opzioni: ['Prende il valore del parametro', 'Resta null: il parametro viene assegnato a sé stesso', 'Errore di compilazione', 'Diventa una stringa vuota'], corretta: 1,
            it: 'Senza this, entrambi i nome si riferiscono al parametro: l\'attributo non viene toccato.',
            ar: 'بدون this يشير الاسمان إلى المعامل، فلا تُمَس الخاصية وتبقى null.',
          },
          {
            d: 'Se una classe dichiara solo Punto(int x, int y), new Punto() compila?', dAr: 'هل يُترجم new Punto() إذا كان المُنشئ الوحيد Punto(int x, int y)؟',
            opzioni: ['Sì, Java aggiunge sempre un costruttore vuoto', 'No: il costruttore di default esiste solo se non ne scrivi nessuno', 'Sì, con x e y a 0', 'Solo se Punto è public'], corretta: 1,
            it: 'Il costruttore di default viene generato solo quando la classe non dichiara alcun costruttore.',
            ar: 'المُنشئ الافتراضي يُولَّد فقط عندما لا يحتوي الصنف أي مُنشئ.',
          },
        ],
        costruisci: {
          consegna: 'Completa il costruttore con this e la creazione dell\'oggetto.',
          consegnaAr: 'أكمل المُنشئ باستخدام this وإنشاء الكائن.',
          codice: `class Libro {

    private String titolo;
    private int pagine;

    public ⟦Libro⟧(String titolo, int pagine) {
        ⟦this⟧.titolo = titolo;
        this.pagine = ⟦pagine⟧;
    }

    public String descrivi() {
        return titolo + " (" + pagine + " pagine)";
    }
}

public class Biblioteca {

    public static void main(String[] args) {
        Libro libro = new Libro(⟦"Java"⟧, 450);
        System.out.println(libro.descrivi());
    }
}`,
          output: 'Java (450 pagine)\n',
        },
        laboratorio: {
          titolo: 'Il punto nel piano',
          consegna: 'Crea la classe Punto con attributi private double x e y, un costruttore Punto(double x, double y) con this, un costruttore Punto() che con this(0, 0) crea l\'origine, e il metodo double distanza(Punto altro). Stampa la distanza tra l\'origine e (3, 4): «Distanza: 5.0».',
          consegnaAr: 'أنشئ الصنف Punto بخاصيتين private double x و y، ومُنشئ Punto(double x, double y) يستخدم this، ومُنشئ Punto() يستدعي this(0, 0) لإنشاء نقطة الأصل، ودالة double distanza(Punto altro). اطبع المسافة بين الأصل و(3, 4): «Distanza: 5.0».',
          codice: `// classe Punto

public class Piano {

    public static void main(String[] args) {

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Distanza: 5.0', msg: 'Deve stampare «Distanza: 5.0».', msgAr: 'يجب أن يطبع «Distanza: 5.0».' },
            { tipo: 'codice', re: 'this\\.x\\s*=\\s*x', msg: 'Nel costruttore usa this.x = x.', msgAr: 'في المُنشئ استخدم this.x = x.' },
            { tipo: 'codice', re: 'this\\s*\\(\\s*0', msg: 'Il costruttore vuoto deve chiamare this(0, 0).', msgAr: 'يجب أن يستدعي المُنشئ الفارغ this(0, 0).' },
          ],
          soluzione: `class Punto {

    private double x;
    private double y;

    public Punto(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public Punto() {
        this(0, 0);
    }

    public double distanza(Punto altro) {
        double dx = x - altro.x;
        double dy = y - altro.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

public class Piano {

    public static void main(String[] args) {
        Punto origine = new Punto();
        Punto p = new Punto(3, 4);
        System.out.println("Distanza: " + origine.distanza(p));
    }
}`,
        },
        riepilogo: [
          { it: 'Il costruttore ha il nome della classe e nessun tipo di ritorno.', ar: 'المُنشئ يحمل اسم الصنف ولا نوع إرجاع له.' },
          { it: 'this.attributo = parametro evita l\'auto-assegnazione.', ar: 'this.attributo = parametro تمنع الإسناد الذاتي.' },
          { it: 'this(...) richiama un altro costruttore come prima istruzione.', ar: 'this(...) تستدعي مُنشئاً آخر كأول تعليمة.' },
        ],
      },
      {
        id: 'l20', titolo: 'Incapsulamento: private, getter, setter e validazione', durata: '14 min',
        obiettivi: ['Nascondere lo stato con private', 'Esporre getter e setter', 'Proteggere gli invarianti con la validazione'],
        teoria: [
          {
            it: 'L\'incapsulamento consiste nel nascondere gli attributi dichiarandoli private e nel permettere l\'accesso solo tramite metodi pubblici.',
            t: 'Incapsulamento', ar: 'التغليف يعني إخفاء الخصائص بجعلها private والسماح بالوصول إليها فقط عبر دوال عامة.',
            ex: 'إذا كانت `saldo` عامة يستطيع أي كود كتابة `conto.saldo = -1000000`. مع `private` لا يمكن تغييرها إلا عبر دوال الصنف التي تتحقق من صحة العملية. هذا من أهم مبادئ البرمجة كائنية التوجه وأول ما يفحصه الأستاذ.',
            bn: 'Attributi sempre private.', bnAr: 'الخصائص دائماً private.',
          },
          {
            it: 'Un getter restituisce il valore di un attributo; un setter lo modifica e può verificarne la validità.',
            t: 'Getter e setter', ar: 'دالة getter تُعيد قيمة الخاصية، ودالة setter تعدّلها ويمكنها التحقق من صحتها.',
            ex: 'الاصطلاح: `getNome()` و `setNome(String nome)`، ومع boolean يُستخدم `isAttivo()`. لا تُنشئ setter تلقائياً لكل خاصية: الخصائص التي لا يجب أن تتغير (مثل رقم الحساب) لا setter لها.',
            bn: 'Crea un setter solo se ha senso modificare l\'attributo dall\'esterno.', bnAr: 'أنشئ setter فقط إذا كان تعديل الخاصية من الخارج منطقياً.',
          },
          {
            it: 'Un invariante è una condizione che deve essere sempre vera per l\'oggetto, come un saldo mai negativo.',
            t: 'Invariante di classe', ar: 'الثابت (invariant) شرط يجب أن يكون صحيحاً دائماً للكائن، مثل رصيد غير سالب أبداً.',
            ex: 'المُنشئ والـsetters ودوال التعديل كلها تتحقق من الثابت قبل تغيير الحالة. إذا كانت القيمة غير صالحة ترمي `IllegalArgumentException` بدلاً من قبولها بصمت.',
            bn: 'Valida i dati in ingresso e rifiuta i valori non validi con un\'eccezione.', bnAr: 'تحقق من البيانات الداخلة وارفض القيم غير الصالحة باستثناء.',
          },
        ],
        analogia: {
          titolo: 'Lo sportello della banca',
          it: 'Non entri nel caveau a prendere i soldi: passi dallo sportello (metodo pubblico), dove l\'impiegato controlla che l\'operazione sia valida.',
          ar: 'لا يُسمح لك بدخول خزنة البنك (الخصائص private) وأخذ المال بنفسك. يجب أن تمرّ عبر الشبّاك (الدوال العامة): الموظف يتحقق من هويتك ومن أن رصيدك يكفي، ثم ينفّذ العملية. هذا هو التغليف: حماية البيانات من التعديلات الخاطئة.',
        },
        esempio: {
          file: 'Banca.java',
          codice: `class ContoCorrente {

    private final String iban;
    private double saldo;

    public ContoCorrente(String iban) {
        this.iban = iban;
        this.saldo = 0;
    }

    public String getIban() {
        return iban;
    }

    public double getSaldo() {
        return saldo;
    }

    public void deposita(double importo) {
        if (importo <= 0) {
            throw new IllegalArgumentException("Importo non valido: " + importo);
        }
        saldo += importo;
    }
}

public class Banca {

    public static void main(String[] args) {
        ContoCorrente conto = new ContoCorrente("IT60X0542811101000000123456");
        conto.deposita(250.0);
        System.out.println("Saldo: " + conto.getSaldo());
        try {
            conto.deposita(-50.0);
        } catch (IllegalArgumentException e) {
            System.out.println("Rifiutato: " + e.getMessage());
        }
        System.out.println("Saldo invariato: " + conto.getSaldo());
    }
}`,
          note: [
            ['private final String iban;', { t: 'Attributo immutabile', ar: 'خاصية ثابتة', ex: 'رقم IBAN لا يتغير: `final` ولا setter له. يُكتب بصيغة camelCase لأنه خاصية نسخة وليس ثابتاً static.' }],
            ['if (importo <= 0) {', { t: 'Validazione', ar: 'التحقق', ex: 'نحمي الثابت: لا نقبل إيداعاً سالباً أو صفراً، بل نرمي استثناء.' }],
          ],
        },
        norma: {
          it: 'Attributi private, getter per leggere, setter o metodi di dominio (deposita, preleva) che validano prima di modificare.',
          ar: 'خصائص private، و getter للقراءة، و setter أو دوال المجال (deposita، preleva) التي تتحقق قبل التعديل.',
        },
        quiz: [
          {
            d: 'Perché public double saldo; è una cattiva pratica?', dAr: 'لماذا يُعد public double saldo; ممارسة سيئة؟',
            opzioni: ['È più lento', 'Chiunque può assegnare un valore non valido senza controlli', 'Non compila', 'Occupa più memoria'], corretta: 1,
            it: 'Un attributo public può essere modificato ovunque, aggirando ogni validazione: viola l\'incapsulamento.',
            ar: 'يمكن تعديل الخاصية العامة من أي مكان متجاوزاً كل تحقق، وهذا يخالف التغليف.',
          },
          {
            d: 'Qual è il nome convenzionale del getter di boolean attivo?', dAr: 'ما الاسم المعتاد لدالة getter لخاصية boolean attivo؟',
            opzioni: ['getAttivo()', 'isAttivo()', 'attivo()', 'leggiAttivo()'], corretta: 1,
            it: 'Per i boolean la convenzione JavaBeans usa il prefisso is.',
            ar: 'مع النوع boolean يستخدم اصطلاح JavaBeans البادئة is.',
          },
        ],
        costruisci: {
          consegna: 'Completa la visibilità, il getter e la validazione del setter.',
          consegnaAr: 'أكمل مستوى الوصول ودالة getter والتحقق في setter.',
          codice: `class Termostato {

    private static final int MINIMO = 5;
    private static final int MASSIMO = 30;

    ⟦private⟧ int temperatura = 20;

    public int ⟦getTemperatura⟧() {
        return temperatura;
    }

    public void setTemperatura(int temperatura) {
        if (temperatura < MINIMO || temperatura ⟦>⟧ MASSIMO) {
            throw new ⟦IllegalArgumentException⟧("Fuori intervallo");
        }
        this.temperatura = temperatura;
    }
}

public class Casa {

    public static void main(String[] args) {
        Termostato t = new Termostato();
        t.setTemperatura(22);
        System.out.println("Temperatura: " + t.getTemperatura());
    }
}`,
          output: 'Temperatura: 22\n',
        },
        laboratorio: {
          titolo: 'Prelievo sicuro',
          consegna: 'Completa ContoCorrente con il metodo preleva(double importo) che lancia IllegalArgumentException se importo <= 0 e IllegalStateException («Saldo insufficiente») se importo > saldo. Il main deve stampare «Saldo: 70.0» e poi «Errore: Saldo insufficiente».',
          consegnaAr: 'أكمل ContoCorrente بالدالة preleva(double importo) التي ترمي IllegalArgumentException إذا كان المبلغ <= 0، و IllegalStateException («Saldo insufficiente») إذا كان المبلغ أكبر من الرصيد. يجب أن يطبع main «Saldo: 70.0» ثم «Errore: Saldo insufficiente».',
          codice: `class ContoCorrente {

    private double saldo;

    public ContoCorrente(double saldoIniziale) {
        this.saldo = saldoIniziale;
    }

    public double getSaldo() {
        return saldo;
    }

    // scrivi preleva
}

public class Bancomat {

    public static void main(String[] args) {
        ContoCorrente c = new ContoCorrente(100.0);
        c.preleva(30.0);
        System.out.println("Saldo: " + c.getSaldo());
        try {
            c.preleva(500.0);
        } catch (IllegalStateException e) {
            System.out.println("Errore: " + e.getMessage());
        }
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Saldo: 70.0\nErrore: Saldo insufficiente', msg: 'Output atteso: «Saldo: 70.0» e «Errore: Saldo insufficiente».', msgAr: 'المخرجات المتوقعة: «Saldo: 70.0» ثم «Errore: Saldo insufficiente».' },
            { tipo: 'codice', re: 'IllegalArgumentException', msg: 'Rifiuta gli importi non positivi con IllegalArgumentException.', msgAr: 'ارفض المبالغ غير الموجبة بـ IllegalArgumentException.' },
            { tipo: 'norma', regole: ['incapsulamento'], msg: 'Gli attributi devono restare private.', msgAr: 'يجب أن تبقى الخصائص private.' },
          ],
          soluzione: `class ContoCorrente {

    private double saldo;

    public ContoCorrente(double saldoIniziale) {
        this.saldo = saldoIniziale;
    }

    public double getSaldo() {
        return saldo;
    }

    public void preleva(double importo) {
        if (importo <= 0) {
            throw new IllegalArgumentException("Importo non valido");
        }
        if (importo > saldo) {
            throw new IllegalStateException("Saldo insufficiente");
        }
        saldo -= importo;
    }
}

public class Bancomat {

    public static void main(String[] args) {
        ContoCorrente c = new ContoCorrente(100.0);
        c.preleva(30.0);
        System.out.println("Saldo: " + c.getSaldo());
        try {
            c.preleva(500.0);
        } catch (IllegalStateException e) {
            System.out.println("Errore: " + e.getMessage());
        }
    }
}`,
        },
        riepilogo: [
          { it: 'Attributi private, accesso tramite metodi pubblici.', ar: 'خصائص private ووصول عبر دوال عامة.' },
          { it: 'getX / setX / isX secondo la convenzione.', ar: 'getX و setX و isX حسب الاصطلاح.' },
          { it: 'I metodi che modificano lo stato validano e lanciano eccezioni sui dati errati.', ar: 'الدوال التي تعدّل الحالة تتحقق وترمي استثناءات عند البيانات الخاطئة.' },
        ],
      },
      {
        id: 'l21', titolo: 'Memoria: Stack, Heap, aliasing, null e Garbage Collector', durata: '15 min',
        obiettivi: ['Visualizzare riferimenti e oggetti', 'Riconoscere l\'aliasing', 'Prevenire la NullPointerException'],
        teoria: [
          {
            it: 'Lo Stack contiene i frame dei metodi con le variabili locali, mentre lo Heap contiene tutti gli oggetti creati con new.',
            t: 'Stack e Heap', ar: 'الـStack يحتوي إطارات الدوال بمتغيراتها المحلية، أما الـHeap فيحتوي كل الكائنات المُنشأة بـ new.',
            ex: 'المتغيرات البدائية المحلية (`int`، `double`) تُخزَّن قيمتها مباشرة في الإطار على الـStack. متغيرات الكائنات تُخزّن مرجعاً فقط، والكائن الحقيقي في الـHeap. الإطار يختفي عند انتهاء الدالة، بينما الكائن يبقى طالما يشير إليه مرجع.',
            bn: 'Ragiona sempre su «chi punta a cosa» quando lavori con gli oggetti.', bnAr: 'فكّر دائماً في "من يشير إلى ماذا" عند التعامل مع الكائنات.',
          },
          {
            it: 'L\'aliasing si verifica quando due variabili contengono lo stesso riferimento e quindi puntano allo stesso oggetto.',
            t: 'Aliasing', ar: 'الأسماء المستعارة (aliasing) تحدث عندما يحمل متغيران نفس المرجع فيشيران إلى نفس الكائن.',
            ex: '`Punto b = a;` لا تُنشئ نسخة! تنسخ المرجع فقط، فيصبح `a` و `b` اسمين لنفس الكائن. أي تعديل عبر `b` يظهر عبر `a`. لإنشاء نسخة حقيقية يجب استخدام `new`.',
            bn: 'Per copiare un oggetto creane uno nuovo (costruttore di copia).', bnAr: 'لنسخ كائن أنشئ كائناً جديداً (مُنشئ النسخ).',
          },
          {
            it: 'Una variabile riferimento che vale null non punta a nessun oggetto e chiamarci un metodo lancia NullPointerException.',
            t: 'null e NullPointerException', ar: 'المتغير المرجعي الذي قيمته null لا يشير إلى أي كائن، واستدعاء دالة عليه يرمي NullPointerException.',
            ex: 'الخصائص من نوع كائن تبدأ بـ `null` إن لم تُهيَّأ. قبل استخدام مرجع قد يكون null تحقق منه: `if (s != null)`. رسالة JVM الحديثة تخبرك بالضبط أي متغير كان null.',
            bn: 'Controlla null prima di usare riferimenti che potrebbero esserlo.', bnAr: 'تحقق من null قبل استخدام المراجع التي قد تكون null.',
          },
          {
            it: 'Il Garbage Collector libera automaticamente la memoria degli oggetti che non sono più raggiungibili da nessun riferimento.',
            t: 'Garbage Collector', ar: 'جامع القمامة يحرر تلقائياً ذاكرة الكائنات التي لم يعد يصل إليها أي مرجع.',
            ex: 'في Java لا يوجد `free` أو `delete` كما في C/C++. عندما يُعاد تعيين آخر مرجع لكائن (مثلاً `a = null;`) يصبح الكائن "يتيماً" ومؤهلاً للحذف، ويزيله الـGC في الوقت الذي يراه مناسباً.',
            bn: 'Non serve (e non si può) liberare la memoria a mano.', bnAr: 'لا حاجة (ولا إمكانية) لتحرير الذاكرة يدوياً.',
          },
        ],
        analogia: {
          titolo: 'Il telecomando e il televisore',
          it: 'La variabile è un telecomando, l\'oggetto è il televisore. Due telecomandi possono comandare la stessa TV; un telecomando senza TV è null.',
          ar: 'المتغير المرجعي مثل جهاز التحكم عن بُعد، والكائن مثل التلفاز. يمكن أن يتحكم جهازان في نفس التلفاز (aliasing): إن غيّرت القناة بأحدهما تتغير للجميع. جهاز تحكم غير مرتبط بأي تلفاز هو `null`، والضغط عليه يسبب `NullPointerException`. والتلفاز الذي لم يعد له أي جهاز تحكم يأخذه جامع القمامة.',
        },
        esempio: {
          file: 'Memoria.java',
          codice: `class Punto {

    private int x;
    private int y;

    public Punto(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public Punto(Punto altro) {
        this(altro.x, altro.y);
    }

    public void sposta(int dx, int dy) {
        x += dx;
        y += dy;
    }

    public String descrivi() {
        return "(" + x + ", " + y + ")";
    }
}

public class Memoria {

    public static void main(String[] args) {
        Punto a = new Punto(1, 2);
        Punto b = a;
        b.sposta(10, 0);
        System.out.println("a = " + a.descrivi() + ", b = " + b.descrivi());

        Punto copia = new Punto(a);
        copia.sposta(0, 5);
        System.out.println("a = " + a.descrivi() + ", copia = " + copia.descrivi());
        System.out.println("a == b? " + (a == b) + ", a == copia? " + (a == copia));

        Punto vuoto = null;
        if (vuoto != null) {
            System.out.println(vuoto.descrivi());
        } else {
            System.out.println("vuoto non punta a nessun oggetto");
        }
        b = null;
        a = null;
    }
}`,
          note: [
            ['Punto b = a;', { t: 'Aliasing', ar: 'اسم مستعار', ex: 'لا يُنشأ كائن جديد: سهمان من الـStack إلى نفس الكائن في الـHeap.' }],
            ['Punto copia = new Punto(a);', { t: 'Costruttore di copia', ar: 'مُنشئ النسخ', ex: 'كائن جديد مستقل بنفس القيم؛ تعديله لا يؤثر على a.' }],
            ['a = null;', { t: 'Oggetto irraggiungibile', ar: 'كائن لا يمكن الوصول إليه', ex: 'لم يعد أي مرجع يشير إلى الكائن الأول، فيصبح مؤهلاً لجامع القمامة.' }],
          ],
        },
        norma: {
          it: 'Copie esplicite con un costruttore di copia, controllo di null prima dell\'uso e == solo per confrontare riferimenti.',
          ar: 'نسخ صريحة بمُنشئ النسخ، وفحص null قبل الاستخدام، و == فقط لمقارنة المراجع.',
        },
        quiz: [
          {
            d: 'Punto a = new Punto(1, 1); Punto b = a; b.sposta(1, 0); Quanti oggetti Punto esistono nello Heap?', dAr: 'كم كائن Punto يوجد في الـHeap؟',
            opzioni: ['0', '1', '2', '3'], corretta: 1,
            it: 'new è stato chiamato una sola volta: a e b sono due riferimenti allo stesso oggetto.',
            ar: 'استُدعي new مرة واحدة فقط، و a و b مرجعان إلى نفس الكائن.',
          },
          {
            d: 'Quando un oggetto diventa idoneo per il Garbage Collector?', dAr: 'متى يصبح الكائن مؤهلاً لجامع القمامة؟',
            opzioni: ['Quando il metodo che lo ha creato termina, sempre', 'Quando nessun riferimento raggiungibile punta più a lui', 'Quando si chiama delete', 'Mai, resta per sempre'], corretta: 1,
            it: 'Conta la raggiungibilità: se nessun riferimento porta all\'oggetto, il GC può liberarlo.',
            ar: 'المهم هو إمكانية الوصول: إذا لم يعد أي مرجع يؤدي إلى الكائن يستطيع الـGC تحريره.',
          },
        ],
        costruisci: {
          consegna: 'Completa il codice: crea un alias, una copia indipendente e un controllo su null.',
          consegnaAr: 'أكمل الكود: أنشئ اسماً مستعاراً ونسخة مستقلة وفحصاً لـ null.',
          codice: `public class Alias {

    public static void main(String[] args) {
        int[] originale = {1, 2, 3};
        int[] alias = ⟦originale⟧;
        int[] copia = ⟦new⟧ int[originale.length];
        for (int i = 0; i < originale.length; i++) {
            copia[i] = originale[i];
        }
        alias[0] = 100;
        System.out.println(originale[0] + " " + copia[0]);
        int[] niente = ⟦null⟧;
        if (niente ⟦!=⟧ null) {
            System.out.println(niente.length);
        } else {
            System.out.println("nessun array");
        }
    }
}`,
          output: '100 1\nnessun array\n',
        },
        laboratorio: {
          titolo: 'Caccia alla NullPointerException',
          consegna: 'Il programma lancia NullPointerException perché l\'attributo autore di Libro non viene mai inizializzato. Correggi il costruttore in modo che riceva e salvi l\'autore e stampi «MANZONI».',
          consegnaAr: 'يرمي البرنامج NullPointerException لأن الخاصية autore في Libro لا تُهيّأ أبداً. صحّح المُنشئ ليستلم المؤلف ويحفظه فيُطبع «MANZONI».',
          codice: `class Libro {

    private String titolo;
    private String autore;

    public Libro(String titolo) {
        this.titolo = titolo;
    }

    public String getAutoreMaiuscolo() {
        return autore.toUpperCase();
    }
}

public class Lettura {

    public static void main(String[] args) {
        Libro libro = new Libro("I Promessi Sposi");
        System.out.println(libro.getAutoreMaiuscolo());
    }
}`,
          verifiche: [
            { tipo: 'noEccezione', msg: 'Il programma non deve più lanciare eccezioni.', msgAr: 'يجب ألا يرمي البرنامج أي استثناء بعد الآن.' },
            { tipo: 'output', atteso: 'MANZONI', msg: 'Deve stampare «MANZONI».', msgAr: 'يجب أن يطبع «MANZONI».' },
            { tipo: 'codice', re: 'this\\.autore\\s*=\\s*autore', msg: 'Inizializza l\'attributo con this.autore = autore.', msgAr: 'هيّئ الخاصية بـ this.autore = autore.' },
          ],
          soluzione: `class Libro {

    private String titolo;
    private String autore;

    public Libro(String titolo, String autore) {
        this.titolo = titolo;
        this.autore = autore;
    }

    public String getAutoreMaiuscolo() {
        return autore.toUpperCase();
    }
}

public class Lettura {

    public static void main(String[] args) {
        Libro libro = new Libro("I Promessi Sposi", "Manzoni");
        System.out.println(libro.getAutoreMaiuscolo());
    }
}`,
        },
        riepilogo: [
          { it: 'Stack: frame e variabili locali; Heap: oggetti.', ar: 'الـStack للإطارات والمتغيرات المحلية، والـHeap للكائنات.' },
          { it: 'b = a copia il riferimento (aliasing), non l\'oggetto.', ar: 'b = a تنسخ المرجع (aliasing) وليس الكائن.' },
          { it: 'Usare un riferimento null lancia NullPointerException; gli oggetti irraggiungibili vengono raccolti dal GC.', ar: 'استخدام مرجع null يرمي NullPointerException، والكائنات التي لا يمكن الوصول إليها يجمعها الـGC.' },
        ],
      },
      {
        id: 'l22', titolo: 'static contro istanza, toString() ed equals()', durata: '15 min',
        obiettivi: ['Distinguere membri static e d\'istanza', 'Ridefinire toString() ed equals()'],
        teoria: [
          {
            it: 'Un attributo static appartiene alla classe ed è condiviso da tutti gli oggetti, mentre un attributo d\'istanza appartiene al singolo oggetto.',
            t: 'Membri static', ar: 'الخاصية الساكنة static تنتمي إلى الصنف ويتشاركها كل الكائنات، بينما خاصية النسخة تنتمي إلى كائن واحد.',
            ex: 'مثال: عدّاد الطلاب المسجلين `private static int iscritti` موجود مرة واحدة فقط مهما أنشأنا من كائنات. يُستخدم أيضاً لتوليد أرقام تسجيل تلقائية.',
            bn: 'Accedi ai membri static tramite il nome della classe: Studente.getIscritti().', bnAr: 'استخدم اسم الصنف للوصول إلى الأعضاء الساكنة: Studente.getIscritti().',
          },
          {
            it: 'Un metodo static non ha this e quindi non può accedere direttamente agli attributi d\'istanza.',
            t: 'Metodi static', ar: 'الدالة الساكنة لا تملك this، لذلك لا يمكنها الوصول مباشرة إلى خصائص النسخة.',
            ex: 'هذا سبب الخطأ الشهير "non-static variable cannot be referenced from a static context" عندما تحاول استخدام خاصية نسخة داخل `main`. الدوال الساكنة مناسبة للأدوات العامة مثل `Math.sqrt`.',
            bn: 'Rendi static solo ciò che non dipende dallo stato di un oggetto.', bnAr: 'اجعل static فقط ما لا يعتمد على حالة كائن.',
          },
          {
            it: 'Il metodo toString() restituisce una rappresentazione testuale dell\'oggetto e viene chiamato automaticamente nella concatenazione.',
            t: 'toString()', ar: 'الدالة toString() تُعيد تمثيلاً نصياً للكائن وتُستدعى تلقائياً عند الدمج مع النصوص.',
            ex: 'بدون إعادة تعريفها يطبع الكائن شيئاً مثل `Studente@1b6d3586`. نعيد تعريفها مع `@Override` لنحصل على نص مفهوم، ويستخدمها `println` تلقائياً.',
            bn: 'Ridefinisci sempre toString() con @Override nelle classi di dominio.', bnAr: 'أعد تعريف toString() دائماً مع @Override في أصناف المجال.',
          },
          {
            it: 'L\'operatore == confronta i riferimenti, mentre equals() confronta il contenuto logico degli oggetti se viene ridefinito.',
            t: 'equals() contro ==', ar: 'المعامل == يقارن المراجع، أما equals() فتقارن المحتوى المنطقي للكائنات إذا أُعيد تعريفها.',
            ex: 'كائنان منفصلان بنفس رقم التسجيل: `==` يعطي false لأنهما في مكانين مختلفين في الـHeap. `equals` المعاد تعريفها تقارن الحقول وتعطي true. القاعدة: إذا أعدت تعريف `equals` أعد تعريف `hashCode` أيضاً.',
            bn: 'equals(Object o) con @Override, controllo del tipo e hashCode coerente.', bnAr: 'equals(Object o) مع @Override وفحص النوع و hashCode متوافقة.',
          },
        ],
        analogia: {
          titolo: 'La bacheca e i quaderni',
          it: 'Un attributo static è la bacheca dell\'aula: una sola per tutti. Gli attributi d\'istanza sono i quaderni: ognuno ha il suo.',
          ar: 'الخاصية الساكنة مثل لوحة الإعلانات في القاعة: لوحة واحدة يراها ويعدّلها الجميع. أما خصائص النسخة فمثل دفاتر الطلاب: لكل طالب دفتره. و`==` تسأل "هل هذا هو نفس الدفتر بالضبط؟" بينما `equals` تسأل "هل في الدفترين نفس المحتوى؟".',
        },
        esempio: {
          file: 'Segreteria.java',
          codice: `import java.util.Objects;

class Studente {

    private static int iscritti = 0;

    private final int matricola;
    private final String nome;

    public Studente(int matricola, String nome) {
        this.matricola = matricola;
        this.nome = nome;
        iscritti++;
    }

    public static int getIscritti() {
        return iscritti;
    }

    @Override
    public String toString() {
        return nome + " [" + matricola + "]";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Studente)) {
            return false;
        }
        Studente altro = (Studente) o;
        return matricola == altro.matricola;
    }

    @Override
    public int hashCode() {
        return Objects.hash(matricola);
    }
}

public class Segreteria {

    public static void main(String[] args) {
        Studente a = new Studente(123456, "Giulia");
        Studente b = new Studente(123456, "Giulia");
        Studente c = new Studente(654321, "Marco");

        System.out.println(a);
        System.out.println("Iscritti: " + Studente.getIscritti());
        System.out.println("a == b: " + (a == b));
        System.out.println("a.equals(b): " + a.equals(b));
        System.out.println("a.equals(c): " + a.equals(c));
    }
}`,
          note: [
            ['private static int iscritti = 0;', { t: 'Attributo di classe', ar: 'خاصية الصنف', ex: 'نسخة واحدة مشتركة؛ في عرض الذاكرة تظهر في منطقة الأعضاء الساكنة وليس داخل كل كائن.' }],
            ['System.out.println(a);', { t: 'toString implicito', ar: 'toString ضمنياً', ex: 'println يستدعي `a.toString()` تلقائياً فيطبع "Giulia [123456]".' }],
            ['return matricola == altro.matricola;', { t: 'Uguaglianza logica', ar: 'المساواة المنطقية', ex: 'طالبان متساويان إذا كان لهما نفس رقم التسجيل، حتى لو كانا كائنين مختلفين.' }],
          ],
        },
        norma: {
          it: '@Override su toString, equals e hashCode; equals con controllo del tipo; membri static chiamati con il nome della classe.',
          ar: '@Override على toString و equals و hashCode، و equals مع فحص النوع، والأعضاء الساكنة تُستدعى باسم الصنف.',
        },
        quiz: [
          {
            d: 'Cosa stampa System.out.println(oggetto) se la classe non ridefinisce toString()?', dAr: 'ماذا يطبع println إذا لم يُعَد تعريف toString()؟',
            opzioni: ['Tutti gli attributi', 'NomeClasse@codiceEsadecimale', 'null', 'Errore di compilazione'], corretta: 1,
            it: 'Viene usato toString() di Object, che stampa nome della classe e hash in esadecimale.',
            ar: 'تُستخدم toString() الخاصة بـ Object والتي تطبع اسم الصنف ورمزاً ست عشرياً.',
          },
          {
            d: 'Perché in main non si può scrivere System.out.println(nome); se nome è un attributo d\'istanza?', dAr: 'لماذا لا يمكن استخدام خاصية نسخة مباشرة داخل main؟',
            opzioni: ['Perché main è public', 'Perché main è static e non ha un oggetto this', 'Perché nome è una String', 'Si può, nessun problema'], corretta: 1,
            it: 'main è static: non esiste un oggetto corrente da cui leggere l\'attributo.',
            ar: 'main دالة ساكنة فلا يوجد كائن حالي تُقرأ منه الخاصية.',
          },
        ],
        costruisci: {
          consegna: 'Completa il contatore static, l\'annotazione e la firma di toString.',
          consegnaAr: 'أكمل العداد الساكن والتعليق التوضيحي وتوقيع toString.',
          codice: `class Biglietto {

    private ⟦static⟧ int emessi = 0;
    private final int numero;

    public Biglietto() {
        emessi++;
        numero = emessi;
    }

    ⟦@Override⟧
    public ⟦String⟧ toString() {
        return "Biglietto n. " + numero;
    }
}

public class Cinema {

    public static void main(String[] args) {
        Biglietto primo = new Biglietto();
        Biglietto secondo = new Biglietto();
        System.out.println(⟦secondo⟧);
    }
}`,
          output: 'Biglietto n. 2\n',
        },
        laboratorio: {
          titolo: 'Frazioni uguali',
          consegna: 'Completa la classe Frazione con toString() che restituisce «num/den» ed equals(Object o) che considera uguali due frazioni equivalenti (a/b equals c/d se a*d == c*b). Il main deve stampare «1/2», «true» e «false».',
          consegnaAr: 'أكمل الصنف Frazione بالدالة toString() التي تُعيد «num/den»، و equals(Object o) التي تعتبر الكسرين المتكافئين متساويين (a/b يساوي c/d إذا كان a*d == c*b). يجب أن يطبع main «1/2» ثم «true» ثم «false».',
          codice: `class Frazione {

    private final int num;
    private final int den;

    public Frazione(int num, int den) {
        this.num = num;
        this.den = den;
    }

    // toString, equals e hashCode
}

public class Prova {

    public static void main(String[] args) {
        Frazione a = new Frazione(1, 2);
        Frazione b = new Frazione(2, 4);
        Frazione c = new Frazione(2, 3);
        System.out.println(a);
        System.out.println(a.equals(b));
        System.out.println(a.equals(c));
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: '1/2\ntrue\nfalse', msg: 'Output atteso: 1/2, true, false.', msgAr: 'المخرجات المتوقعة: 1/2 ثم true ثم false.' },
            { tipo: 'codice', re: '@Override\\s+public\\s+boolean\\s+equals\\s*\\(\\s*Object', msg: 'equals deve ridefinire equals(Object o) con @Override.', msgAr: 'يجب أن تعيد equals تعريف equals(Object o) مع @Override.' },
          ],
          soluzione: `class Frazione {

    private final int num;
    private final int den;

    public Frazione(int num, int den) {
        this.num = num;
        this.den = den;
    }

    @Override
    public String toString() {
        return num + "/" + den;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Frazione)) {
            return false;
        }
        Frazione altra = (Frazione) o;
        return num * altra.den == altra.num * den;
    }

    @Override
    public int hashCode() {
        return Double.hashCode((double) num / den);
    }
}

public class Prova {

    public static void main(String[] args) {
        Frazione a = new Frazione(1, 2);
        Frazione b = new Frazione(2, 4);
        Frazione c = new Frazione(2, 3);
        System.out.println(a);
        System.out.println(a.equals(b));
        System.out.println(a.equals(c));
    }
}`,
        },
        riepilogo: [
          { it: 'static = della classe, condiviso; senza static = del singolo oggetto.', ar: 'static تعني خاص بالصنف ومشترك، وبدونها خاص بكل كائن.' },
          { it: 'toString() dà una descrizione leggibile dell\'oggetto.', ar: 'toString() تعطي وصفاً مقروءاً للكائن.' },
          { it: '== confronta riferimenti, equals() il contenuto; con equals ridefinisci hashCode.', ar: '== تقارن المراجع و equals() المحتوى، ومع equals أعد تعريف hashCode.' },
        ],
      },
    ],
  };
  if (typeof module === 'object' && module.exports) module.exports = livello;
  else (root.CF_LIVELLI = root.CF_LIVELLI || []).push(livello);
})(typeof globalThis !== 'undefined' ? globalThis : this);
