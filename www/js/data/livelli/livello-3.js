/* CodeForge — Livello 3: Metodi, Array e Ricorsione (Sviluppatore Modulare). */
(function (root) {
  'use strict';
  const livello = {
    numero: 3, id: 'L3', colore: '#D2A8FF', icona: 'blocks',
    titolo: 'Metodi, Array e Ricorsione', titoloAr: 'الدوال والمصفوفات والاستدعاء الذاتي',
    grado: 'Sviluppatore Modulare', gradoAr: 'مطوّر تركيبي',
    descr: 'Scomporre i problemi in metodi, capire il passaggio per valore, lavorare con array e matrici e pensare in modo ricorsivo.',
    lezioni: [
      {
        id: 'l13', titolo: 'Metodi statici, parametri, return e overloading', durata: '14 min',
        obiettivi: ['Dichiarare e chiamare metodi statici', 'Restituire valori con return', 'Usare l\'overloading'],
        teoria: [
          {
            it: 'Un metodo è un blocco di codice con un nome che svolge un compito preciso e può essere chiamato più volte.',
            t: 'Metodo', ar: 'الدالة (الطريقة) كتلة كود لها اسم تؤدي مهمة محددة ويمكن استدعاؤها عدة مرات.',
            ex: 'بدلاً من تكرار نفس الكود في عدة أماكن نضعه في دالة ونستدعيها. هذا يطبّق مبدأ DRY (لا تكرر نفسك) ويجعل البرنامج أسهل في القراءة والاختبار.',
            bn: 'Ogni metodo deve fare una sola cosa e avere un nome che è un verbo (calcolaMedia).', bnAr: 'يجب أن تؤدي كل دالة مهمة واحدة، وأن يكون اسمها فعلاً مثل calcolaMedia.',
          },
          {
            it: 'La firma di un metodo comprende il nome e la lista dei tipi dei parametri; il tipo di ritorno indica cosa restituisce.',
            t: 'Firma e tipo di ritorno', ar: 'توقيع الدالة يتكوّن من اسمها وقائمة أنواع معاملاتها، ونوع الإرجاع يحدد ما تُعيده.',
            ex: 'في `static double media(int a, int b)`: نوع الإرجاع `double`، والاسم `media`، والمعاملات `(int a, int b)`. الدالة التي لا تُعيد شيئاً نوعها `void`.',
            bn: 'Dichiara parametri con nomi significativi, non a, b, c quando il contesto non è ovvio.', bnAr: 'استخدم أسماء معاملات ذات معنى.',
          },
          {
            it: 'L\'istruzione return termina il metodo e restituisce un valore al chiamante, che deve essere compatibile con il tipo di ritorno.',
            t: 'return', ar: 'تعليمة return تُنهي الدالة وتُعيد قيمة إلى المستدعي، ويجب أن تكون متوافقة مع نوع الإرجاع.',
            ex: 'عند الاستدعاء يُنشأ إطار جديد (frame) على الـStack فيه المعاملات والمتغيرات المحلية. عند `return` يُحذف الإطار وتعود القيمة إلى مكان الاستدعاء.',
            bn: 'Preferisci un solo return alla fine del metodo, salvo casi molto semplici.', bnAr: 'يُفضّل return واحد في نهاية الدالة إلا في الحالات البسيطة جداً.',
          },
          {
            it: 'L\'overloading permette di definire più metodi con lo stesso nome ma con liste di parametri diverse.',
            t: 'Sovraccarico (overloading)', ar: 'التحميل الزائد (overloading) يسمح بتعريف عدة دوال بنفس الاسم لكن بقوائم معاملات مختلفة.',
            ex: 'يختار المترجم الدالة المناسبة وقت الترجمة حسب أنواع وعدد الوسائط. لا يكفي اختلاف نوع الإرجاع وحده: `int f()` و `double f()` خطأ ترجمة.',
            bn: 'Usa l\'overloading solo per metodi che fanno davvero la stessa cosa.', bnAr: 'استخدم التحميل الزائد فقط لدوال تقوم فعلاً بنفس العمل.',
          },
        ],
        analogia: {
          titolo: 'La macchina del caffè',
          it: 'Un metodo è una macchina del caffè: metti gli ingredienti (parametri), premi il tasto (chiamata) e ottieni il caffè (valore di ritorno).',
          ar: 'الدالة مثل آلة القهوة: تضع المكونات (المعاملات)، تضغط الزر (الاستدعاء)، فتحصل على القهوة (القيمة المُعادة). لا يهمك ما يحدث داخل الآلة. والتحميل الزائد مثل آلة لها زرّان بنفس الاسم "قهوة": واحد لكوب صغير وآخر بإضافة الحليب، والآلة تعرف أيهما تقصد من المكونات التي وضعتها.',
        },
        esempio: {
          file: 'Calcolatrice.java',
          codice: `public class Calcolatrice {

    public static int somma(int a, int b) {
        return a + b;
    }

    public static double somma(double a, double b) {
        return a + b;
    }

    public static double media(int[] valori) {
        int totale = 0;
        for (int v : valori) {
            totale += v;
        }
        return (double) totale / valori.length;
    }

    public static void stampaRisultato(String etichetta, double valore) {
        System.out.println(etichetta + ": " + valore);
    }

    public static void main(String[] args) {
        int s = somma(3, 4);
        double d = somma(2.5, 1.5);
        int[] voti = {28, 30, 25};
        stampaRisultato("Somma intera", s);
        stampaRisultato("Somma decimale", d);
        stampaRisultato("Media", media(voti));
    }
}`,
          note: [
            ['public static double somma(double a, double b)', { t: 'Overloading', ar: 'تحميل زائد', ex: 'نفس الاسم `somma` لكن بمعاملات `double`. المترجم يختار هذه النسخة عند `somma(2.5, 1.5)`.' }],
            ['return (double) totale / valori.length;', { t: 'return con casting', ar: 'إرجاع مع تحويل', ex: 'نحوّل إلى double قبل القسمة حتى لا نفقد الكسور، ثم تعود القيمة إلى المستدعي ويُحذف إطار الدالة من الـStack.' }],
          ],
        },
        norma: {
          it: 'Metodi brevi con un solo compito, nomi in camelCase che iniziano con un verbo e parametri con nomi chiari.',
          ar: 'دوال قصيرة بمهمة واحدة، وأسماء camelCase تبدأ بفعل، ومعاملات بأسماء واضحة.',
        },
        quiz: [
          {
            d: 'Quali due metodi NON possono coesistere nella stessa classe?', dAr: 'أي دالتين لا يمكن أن توجدا معاً في نفس الصنف؟',
            opzioni: ['int f(int x) e int f(double x)', 'int f(int x) e double f(int x)', 'void f() e void f(int x)', 'int f(int x, int y) e int f(int x)'], corretta: 1,
            it: 'Hanno la stessa firma f(int): differire solo nel tipo di ritorno non basta per l\'overloading.',
            ar: 'لهما نفس التوقيع f(int)، واختلاف نوع الإرجاع وحده لا يكفي للتحميل الزائد.',
          },
          {
            d: 'Cosa succede al frame di un metodo quando esegue return?', dAr: 'ماذا يحدث لإطار الدالة عند تنفيذ return؟',
            opzioni: ['Rimane sullo Stack', 'Viene rimosso dallo Stack e il valore torna al chiamante', 'Viene spostato nello Heap', 'Viene copiato nel main'], corretta: 1,
            it: 'Il frame viene distrutto e le sue variabili locali spariscono; il valore di ritorno arriva al chiamante.',
            ar: 'يُحذف الإطار وتختفي متغيراته المحلية، وتصل القيمة المُعادة إلى المستدعي.',
          },
        ],
        costruisci: {
          consegna: 'Completa il tipo di ritorno, il return e la chiamata del metodo.',
          consegnaAr: 'أكمل نوع الإرجاع وتعليمة return واستدعاء الدالة.',
          codice: `public class Area {

    public static ⟦double⟧ areaRettangolo(double base, double altezza) {
        ⟦return⟧ base * altezza;
    }

    public static ⟦void⟧ main(String[] args) {
        double a = ⟦areaRettangolo⟧(3.0, 2.5);
        System.out.println("Area: " + a);
    }
}`,
          output: 'Area: 7.5\n',
        },
        laboratorio: {
          titolo: 'Il metodo massimo',
          consegna: 'Scrivi il metodo statico int massimo(int a, int b) e la sua versione sovraccaricata int massimo(int a, int b, int c) che riusa la prima. Nel main stampa «Max: 9» chiamando massimo(4, 9, 2).',
          consegnaAr: 'اكتب الدالة الساكنة int massimo(int a, int b) ونسختها المحمّلة int massimo(int a, int b, int c) التي تعيد استخدام الأولى. في main اطبع «Max: 9» باستدعاء massimo(4, 9, 2).',
          codice: `public class Massimo {

    // scrivi qui i due metodi massimo

    public static void main(String[] args) {

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Max: 9', msg: 'Deve stampare «Max: 9».', msgAr: 'يجب أن يطبع «Max: 9».' },
            { tipo: 'codice', re: 'int\\s+massimo\\s*\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)', msg: 'Manca massimo(int, int).', msgAr: 'الدالة massimo(int, int) غير موجودة.' },
            { tipo: 'codice', re: 'int\\s+massimo\\s*\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)', msg: 'Manca la versione con tre parametri.', msgAr: 'النسخة ذات المعاملات الثلاثة غير موجودة.' },
          ],
          soluzione: `public class Massimo {

    public static int massimo(int a, int b) {
        return a > b ? a : b;
    }

    public static int massimo(int a, int b, int c) {
        return massimo(massimo(a, b), c);
    }

    public static void main(String[] args) {
        System.out.println("Max: " + massimo(4, 9, 2));
    }
}`,
        },
        riepilogo: [
          { it: 'Un metodo ha firma (nome + parametri) e tipo di ritorno.', ar: 'للدالة توقيع (اسم + معاملات) ونوع إرجاع.' },
          { it: 'Ogni chiamata crea un frame sullo Stack, che sparisce con return.', ar: 'كل استدعاء ينشئ إطاراً على الـStack يختفي عند return.' },
          { it: 'Overloading: stesso nome, parametri diversi.', ar: 'التحميل الزائد: نفس الاسم ومعاملات مختلفة.' },
        ],
      },
      {
        id: 'l14', titolo: 'Passaggio dei parametri per valore', durata: '13 min',
        obiettivi: ['Capire che Java passa sempre per valore', 'Distinguere copia di un primitivo e copia di un riferimento'],
        teoria: [
          {
            it: 'In Java i parametri sono sempre passati per valore: il metodo riceve una copia del valore dell\'argomento.',
            t: 'Passaggio per valore', ar: 'في Java تُمرَّر المعاملات دائماً بالقيمة: تستلم الدالة نسخة من قيمة الوسيط.',
            ex: 'إذا مرّرت `int x = 5` إلى دالة وغيّرت المعامل داخلها، فإن `x` في `main` يبقى 5، لأن الدالة عدّلت نسختها الخاصة في إطارها على الـStack.',
            bn: 'Non riassegnare i parametri dentro il metodo: crea una variabile locale.', bnAr: 'لا تُعِد تعيين المعاملات داخل الدالة، بل أنشئ متغيراً محلياً.',
          },
          {
            it: 'Quando si passa un array o un oggetto, viene copiato il riferimento: entrambe le variabili puntano allo stesso oggetto nello Heap.',
            t: 'Copia del riferimento', ar: 'عند تمرير مصفوفة أو كائن تُنسخ المرجعية: يشير المتغيران إلى نفس الكائن في الـHeap.',
            ex: 'المرجع مثل عنوان. الدالة تحصل على نسخة من العنوان، لذلك إذا عدّلت محتوى المصفوفة `v[0] = 99` يرى `main` التعديل، لأن العنوانين يشيران إلى نفس المكان في الـHeap.',
            bn: 'Documenta quando un metodo modifica l\'array ricevuto.', bnAr: 'وضّح في التوثيق عندما تعدّل الدالة المصفوفة التي تستلمها.',
          },
          {
            it: 'Riassegnare il parametro a un nuovo oggetto non cambia la variabile del chiamante, che continua a puntare al vecchio oggetto.',
            t: 'Riassegnazione del parametro', ar: 'إعادة تعيين المعامل إلى كائن جديد لا تغيّر متغير المستدعي، الذي يبقى يشير إلى الكائن القديم.',
            ex: 'داخل الدالة `v = new int[3];` تجعل النسخة المحلية تشير إلى مصفوفة جديدة، لكن متغير `main` ما زال يشير إلى القديمة. هذا هو الدليل على أن Java لا تمرّر بالمرجع.',
            bn: 'Se un metodo deve produrre un nuovo array, restituiscilo con return.', bnAr: 'إذا كانت الدالة ستنتج مصفوفة جديدة فأعِدها بـ return.',
          },
        ],
        analogia: {
          titolo: 'La fotocopia e l\'indirizzo di casa',
          it: 'Per un int dai una fotocopia del foglio; per un array dai una copia dell\'indirizzo di casa: chi ha l\'indirizzo può entrare e spostare i mobili.',
          ar: 'مع النوع البدائي `int` تعطي الدالة صورة (فوتوكوبي) من ورقتك: مهما كتبت على الصورة لا تتغير ورقتك الأصلية. أما مع المصفوفة فتعطيها نسخة من عنوان بيتك: من يملك العنوان يستطيع الدخول وتحريك الأثاث (تعديل المحتوى). لكن إن شطب العنوان على ورقته وكتب عنواناً آخر، فبيتك لا يتغير.',
        },
        esempio: {
          file: 'Passaggio.java',
          codice: `public class Passaggio {

    public static void raddoppia(int numero) {
        numero = numero * 2;
        System.out.println("Dentro il metodo: " + numero);
    }

    public static void azzeraPrimo(int[] valori) {
        valori[0] = 0;
    }

    public static void sostituisci(int[] valori) {
        valori = new int[valori.length];
        System.out.println("Nuovo array locale: " + valori[0]);
    }

    public static void main(String[] args) {
        int x = 5;
        raddoppia(x);
        System.out.println("x nel main: " + x);

        int[] dati = {9, 8, 7};
        azzeraPrimo(dati);
        System.out.println("dati[0] dopo azzeraPrimo: " + dati[0]);
        sostituisci(dati);
        System.out.println("dati[1] dopo sostituisci: " + dati[1]);
    }
}`,
          note: [
            ['raddoppia(x);', { t: 'Copia di un primitivo', ar: 'نسخة من قيمة بدائية', ex: 'يُنشأ إطار جديد فيه `numero = 5` منفصل عن `x`. تغيير `numero` لا يؤثر على `x`.' }],
            ['valori[0] = 0;', { t: 'Modifica tramite riferimento', ar: 'تعديل عبر المرجع', ex: '`valori` و `dati` يشيران إلى نفس المصفوفة في الـHeap؛ شاهد السهمين في عرض الذاكرة.' }],
            ['valori = new int[valori.length];', { t: 'Riassegnazione locale', ar: 'إعادة تعيين محلية', ex: 'المتغير المحلي يشير الآن إلى مصفوفة جديدة، بينما `dati` في main ما زال يشير إلى القديمة.' }],
          ],
        },
        norma: {
          it: 'Non riassegnare i parametri; se un metodo modifica un array ricevuto, il suo nome deve dirlo (azzera, ordina, riempi).',
          ar: 'لا تُعِد تعيين المعاملات، وإذا عدّلت الدالة مصفوفة مستلمة فليدل اسمها على ذلك (azzera، ordina، riempi).',
        },
        quiz: [
          {
            d: 'static void f(int n) { n++; } — dopo int a = 1; f(a); quanto vale a?', dAr: 'بعد int a = 1; f(a); كم قيمة a؟',
            opzioni: ['1', '2', '0', 'Errore'], corretta: 0,
            it: 'f riceve una copia di a: l\'incremento avviene sulla copia nel frame di f.',
            ar: 'تستلم f نسخة من a، والزيادة تحدث على النسخة داخل إطار f.',
          },
          {
            d: 'static void g(int[] v) { v[0] = 9; } — dopo int[] w = {1}; g(w); quanto vale w[0]?', dAr: 'بعد int[] w = {1}; g(w); كم قيمة w[0]؟',
            opzioni: ['1', '9', '0', 'Errore'], corretta: 1,
            it: 'Viene copiato il riferimento: v e w puntano allo stesso array nello Heap.',
            ar: 'تُنسخ المرجعية فيشير v و w إلى نفس المصفوفة في الـHeap.',
          },
        ],
        costruisci: {
          consegna: 'Completa il metodo che modifica l\'array ricevuto e quello che restituisce un nuovo valore.',
          consegnaAr: 'أكمل الدالة التي تعدّل المصفوفة المستلمة والدالة التي تُعيد قيمة جديدة.',
          codice: `public class Bonus {

    private static final int BONUS = 2;

    public static void aggiungiBonus(int⟦[]⟧ voti) {
        for (int i = 0; i < voti.⟦length⟧; i++) {
            voti[i] += BONUS;
        }
    }

    public static int conBonus(int voto) {
        ⟦return⟧ voto + BONUS;
    }

    public static void main(String[] args) {
        int[] voti = {20, 25};
        aggiungiBonus(voti);
        int singolo = 18;
        singolo = ⟦conBonus⟧(singolo);
        System.out.println(voti[0] + " " + voti[1] + " " + singolo);
    }
}`,
          output: '22 27 20\n',
        },
        laboratorio: {
          titolo: 'Scambio che non funziona',
          consegna: 'Il metodo scambia(int a, int b) non scambia nulla nel main: è il passaggio per valore! Scrivi invece scambia(int[] v, int i, int j) che scambia v[i] e v[j], e stampa l\'array {1, 2, 3} dopo scambia(v, 0, 2) come «3 2 1».',
          consegnaAr: 'الدالة scambia(int a, int b) لا تبدّل شيئاً في main بسبب التمرير بالقيمة! اكتب بدلاً منها scambia(int[] v, int i, int j) التي تبدّل v[i] و v[j]، واطبع المصفوفة {1, 2, 3} بعد scambia(v, 0, 2) على الشكل «3 2 1».',
          codice: `public class Scambio {

    public static void scambia(int a, int b) {
        int temp = a;
        a = b;
        b = temp;
    }

    public static void main(String[] args) {
        int[] v = {1, 2, 3};
        scambia(v[0], v[2]);
        System.out.println(v[0] + " " + v[1] + " " + v[2]);
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: '3 2 1', msg: 'Dopo lo scambio deve stampare «3 2 1».', msgAr: 'بعد التبديل يجب أن يطبع «3 2 1».' },
            { tipo: 'codice', re: 'scambia\\s*\\(\\s*int\\s*\\[\\]\\s*\\w+\\s*,\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)', msg: 'Il metodo deve ricevere l\'array e i due indici.', msgAr: 'يجب أن تستلم الدالة المصفوفة والمؤشرين.' },
          ],
          soluzione: `public class Scambio {

    public static void scambia(int[] v, int i, int j) {
        int temp = v[i];
        v[i] = v[j];
        v[j] = temp;
    }

    public static void main(String[] args) {
        int[] v = {1, 2, 3};
        scambia(v, 0, 2);
        System.out.println(v[0] + " " + v[1] + " " + v[2]);
    }
}`,
        },
        riepilogo: [
          { it: 'Java passa sempre per valore.', ar: 'تمرّر Java دائماً بالقيمة.' },
          { it: 'Per gli array e gli oggetti si copia il riferimento: il contenuto è condiviso.', ar: 'مع المصفوفات والكائنات تُنسخ المرجعية فيكون المحتوى مشتركاً.' },
          { it: 'Riassegnare il parametro non tocca la variabile del chiamante.', ar: 'إعادة تعيين المعامل لا تمس متغير المستدعي.' },
        ],
      },
      {
        id: 'l15', titolo: 'Array monodimensionali', durata: '14 min',
        obiettivi: ['Dichiarare, creare e scorrere array', 'Evitare ArrayIndexOutOfBoundsException'],
        teoria: [
          {
            it: 'Un array è un oggetto che contiene un numero fisso di elementi dello stesso tipo, accessibili tramite un indice che parte da 0.',
            t: 'Array', ar: 'المصفوفة كائن يحتوي عدداً ثابتاً من العناصر من نفس النوع، يُوصَل إليها بمؤشر يبدأ من 0.',
            ex: 'في `int[] v = new int[5];` تُنشأ في الـHeap خمس خانات بقيمة افتراضية 0، والمتغير `v` على الـStack يحمل المرجع إليها. المؤشرات من 0 إلى 4.',
            bn: 'Scrivi le parentesi quadre accanto al tipo: int[] v, non int v[].', bnAr: 'اكتب الأقواس المربعة بجانب النوع: int[] v وليس int v[].',
          },
          {
            it: 'La lunghezza di un array si legge con il campo length e non può cambiare dopo la creazione.',
            t: 'length', ar: 'طول المصفوفة يُقرأ عبر الحقل length ولا يمكن تغييره بعد الإنشاء.',
            ex: '`v.length` حقل وليس دالة (بدون أقواس)، بعكس `s.length()` للنصوص. إذا احتجت حجماً متغيراً ستستخدم `ArrayList` في المستوى 6.',
            bn: 'Usa sempre v.length nella condizione del ciclo, mai un numero scritto a mano.', bnAr: 'استخدم دائماً v.length في شرط الحلقة وليس رقماً مكتوباً يدوياً.',
          },
          {
            it: 'Accedere a un indice negativo o maggiore o uguale a length lancia un\'eccezione ArrayIndexOutOfBoundsException.',
            t: 'ArrayIndexOutOfBoundsException', ar: 'الوصول إلى مؤشر سالب أو أكبر من أو يساوي length يرمي الاستثناء ArrayIndexOutOfBoundsException.',
            ex: 'الخطأ الكلاسيكي: `for (int i = 0; i <= v.length; i++)` — الإشارة `<=` تجعل آخر دورة تصل إلى `v[v.length]` غير الموجود. الشرط الصحيح `i < v.length`.',
            bn: 'Condizione del ciclo: i < v.length.', bnAr: 'شرط الحلقة: i < v.length.',
          },
          {
            it: 'Il ciclo for-each permette di leggere tutti gli elementi senza gestire l\'indice.',
            t: 'Ciclo for-each', ar: 'حلقة for-each تسمح بقراءة كل العناصر دون التعامل مع المؤشر.',
            ex: '`for (int x : v)` تقرأ كل عنصر بالترتيب. لكنها للقراءة فقط: إسناد `x = 0` لا يغيّر المصفوفة. وإن احتجت المؤشر استخدم for العادية.',
            bn: 'Usa for-each per leggere, il for con indice per modificare.', bnAr: 'استخدم for-each للقراءة و for بالمؤشر للتعديل.',
          },
        ],
        analogia: {
          titolo: 'Gli armadietti della palestra',
          it: 'Un array è una fila di armadietti numerati da 0: il numero degli armadietti è deciso quando costruisci la fila e non cambia più.',
          ar: 'المصفوفة مثل صف خزائن في النادي الرياضي مرقّمة من 0. عدد الخزائن يُحدَّد عند بناء الصف ولا يتغير بعدها. إن طلبت الخزانة رقم 10 في صف من 10 خزائن (0 إلى 9) فلن تجدها، وهذا بالضبط `ArrayIndexOutOfBoundsException`.',
        },
        esempio: {
          file: 'Voti.java',
          codice: `public class Voti {

    public static void main(String[] args) {
        int[] voti = new int[4];
        voti[0] = 27;
        voti[1] = 30;
        voti[2] = 22;
        voti[3] = 25;

        for (int i = 0; i < voti.length; i++) {
            System.out.println("Esame " + (i + 1) + ": " + voti[i]);
        }

        String[] corsi = {"Analisi", "Fisica", "Programmazione"};
        for (String corso : corsi) {
            System.out.println(corso + " (" + corso.length() + " lettere)");
        }
        System.out.println("Numero di corsi: " + corsi.length);
    }
}`,
          note: [
            ['int[] voti = new int[4];', { t: 'Creazione di un array', ar: 'إنشاء مصفوفة', ex: 'أربع خانات في الـHeap بقيمة 0. شاهد المصفوفة في عرض الذاكرة تمتلئ خطوة بخطوة.' }],
            ['i < voti.length', { t: 'Limite corretto', ar: 'الحد الصحيح', ex: 'آخر مؤشر هو length - 1 = 3، لذلك نستخدم `<` وليس `<=`.' }],
            ['for (String corso : corsi)', { t: 'for-each', ar: 'for-each', ex: 'يمرّ على كل نص في المصفوفة دون مؤشر.' }],
          ],
        },
        norma: {
          it: 'int[] v (non int v[]), cicli con i < v.length e for-each quando l\'indice non serve.',
          ar: 'اكتب int[] v وليس int v[]، والحلقات بـ i < v.length، و for-each عندما لا تحتاج المؤشر.',
        },
        quiz: [
          {
            d: 'int[] v = new int[3]; Quanto vale v[2]?', dAr: 'كم قيمة v[2]؟',
            opzioni: ['null', '0', '3', 'Errore: non inizializzato'], corretta: 1,
            it: 'Gli elementi di un array di int sono inizializzati automaticamente a 0.',
            ar: 'عناصر مصفوفة int تُهيّأ تلقائياً بالقيمة 0.',
          },
          {
            d: 'Quale ciclo lancia ArrayIndexOutOfBoundsException su un array v di 5 elementi?', dAr: 'أي حلقة ترمي ArrayIndexOutOfBoundsException؟',
            opzioni: ['for (int i = 0; i < v.length; i++)', 'for (int i = 0; i <= v.length; i++)', 'for (int x : v)', 'for (int i = v.length - 1; i >= 0; i--)'], corretta: 1,
            it: 'Con <= l\'ultima iterazione usa i = 5, ma gli indici validi vanno da 0 a 4.',
            ar: 'مع <= تستخدم الدورة الأخيرة i = 5 بينما المؤشرات الصالحة من 0 إلى 4.',
          },
        ],
        costruisci: {
          consegna: 'Completa la creazione dell\'array, la condizione del ciclo e il for-each.',
          consegnaAr: 'أكمل إنشاء المصفوفة وشرط الحلقة وحلقة for-each.',
          codice: `public class Quadrati {

    private static final int N = 4;

    public static void main(String[] args) {
        int[] quadrati = ⟦new⟧ int[N];
        for (int i = 0; i ⟦<⟧ quadrati.⟦length⟧; i++) {
            quadrati[i] = i * i;
        }
        for (int q ⟦:⟧ quadrati) {
            System.out.print(q + " ");
        }
        System.out.println();
    }
}`,
          output: '0 1 4 9 \n',
        },
        laboratorio: {
          titolo: 'Inverti l\'array',
          consegna: 'Scrivi il metodo static int[] inverti(int[] v) che restituisce un NUOVO array con gli elementi in ordine inverso, senza modificare v. Nel main stampa l\'array invertito di {1, 2, 3, 4, 5} come «5 4 3 2 1».',
          consegnaAr: 'اكتب الدالة static int[] inverti(int[] v) التي تُعيد مصفوفة جديدة بالعناصر بترتيب معكوس دون تعديل v. في main اطبع مقلوب {1, 2, 3, 4, 5} على الشكل «5 4 3 2 1».',
          codice: `public class Inverti {

    public static int[] inverti(int[] v) {
        // crea e riempi un nuovo array
        return v;
    }

    public static void main(String[] args) {
        int[] v = {1, 2, 3, 4, 5};
        int[] r = inverti(v);
        String riga = "";
        for (int x : r) {
            riga += x + " ";
        }
        System.out.println(riga.trim());
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: '5 4 3 2 1', msg: 'Deve stampare «5 4 3 2 1».', msgAr: 'يجب أن يطبع «5 4 3 2 1».' },
            { tipo: 'codice', re: 'new\\s+int\\s*\\[', msg: 'Crea un nuovo array con new int[...].', msgAr: 'أنشئ مصفوفة جديدة بـ new int[...].' },
          ],
          soluzione: `public class Inverti {

    public static int[] inverti(int[] v) {
        int[] risultato = new int[v.length];
        for (int i = 0; i < v.length; i++) {
            risultato[i] = v[v.length - 1 - i];
        }
        return risultato;
    }

    public static void main(String[] args) {
        int[] v = {1, 2, 3, 4, 5};
        int[] r = inverti(v);
        String riga = "";
        for (int x : r) {
            riga += x + " ";
        }
        System.out.println(riga.trim());
    }
}`,
        },
        riepilogo: [
          { it: 'Indici da 0 a length - 1; length è fisso.', ar: 'المؤشرات من 0 إلى length - 1، والطول ثابت.' },
          { it: 'i <= v.length causa ArrayIndexOutOfBoundsException.', ar: 'الشرط i <= v.length يسبب ArrayIndexOutOfBoundsException.' },
          { it: 'for-each per leggere, for con indice per modificare.', ar: 'for-each للقراءة و for بالمؤشر للتعديل.' },
        ],
      },
      {
        id: 'l16', titolo: 'Matrici (array bidimensionali)', durata: '14 min',
        obiettivi: ['Creare e scorrere matrici', 'Calcolare somme per riga e per colonna'],
        teoria: [
          {
            it: 'Una matrice in Java è un array di array: ogni elemento del primo array è a sua volta un array che rappresenta una riga.',
            t: 'Matrice (array bidimensionale)', ar: 'المصفوفة ثنائية الأبعاد في Java هي مصفوفة من المصفوفات: كل عنصر في المصفوفة الأولى هو بدوره مصفوفة تمثل صفاً.',
            ex: '`int[][] m = new int[3][4];` تُنشئ في الـHeap مصفوفة من 3 مراجع، وكل مرجع يشير إلى صف من 4 أعداد صحيحة. العنصر `m[1][2]` هو الصف 1 والعمود 2.',
            bn: 'Usa nomi espliciti per gli indici: riga e colonna (o i e j se standard nel corso).', bnAr: 'استخدم أسماء واضحة للمؤشرات مثل riga و colonna.',
          },
          {
            it: 'm.length è il numero di righe, mentre m[i].length è il numero di colonne della riga i.',
            t: 'Dimensioni di una matrice', ar: 'm.length هو عدد الصفوف، و m[i].length هو عدد أعمدة الصف i.',
            ex: 'بما أن كل صف مصفوفة مستقلة، يمكن نظرياً أن تكون الصفوف بأطوال مختلفة (jagged array). لذلك في الحلقة الداخلية نستخدم `m[riga].length` وليس رقماً ثابتاً.',
            bn: 'Nel ciclo interno usa m[riga].length.', bnAr: 'في الحلقة الداخلية استخدم m[riga].length.',
          },
          {
            it: 'Per scorrere una matrice si usano due cicli annidati: quello esterno sulle righe e quello interno sulle colonne.',
            t: 'Scansione per righe', ar: 'لاجتياز المصفوفة ثنائية الأبعاد نستخدم حلقتين متداخلتين: الخارجية للصفوف والداخلية للأعمدة.',
            ex: 'لحساب مجموع كل عمود نعكس الحلقات: الخارجية على الأعمدة والداخلية على الصفوف. هذه تمارين كلاسيكية في امتحانات Fondamenti di Informatica.',
            bn: 'Scegli l\'ordine dei cicli in base a cosa vuoi calcolare (righe o colonne).', bnAr: 'اختر ترتيب الحلقات حسب ما تريد حسابه (صفوف أم أعمدة).',
          },
        ],
        analogia: {
          titolo: 'Il cinema',
          it: 'Una matrice è la sala di un cinema: il biglietto indica fila e posto, m[fila][posto].',
          ar: 'المصفوفة ثنائية الأبعاد مثل قاعة سينما: التذكرة تحدد رقم الصف ورقم المقعد `m[fila][posto]`. وفي Java كل صف هو "شريط" مستقل من المقاعد، لذلك يمكن أن يكون لكل صف عدد مقاعد مختلف.',
        },
        esempio: {
          file: 'Pagella.java',
          codice: `public class Pagella {

    public static void main(String[] args) {
        int[][] voti = {
            {28, 30, 25},
            {18, 22, 24},
        };
        String[] studenti = {"Anna", "Luca"};

        for (int riga = 0; riga < voti.length; riga++) {
            int somma = 0;
            for (int colonna = 0; colonna < voti[riga].length; colonna++) {
                somma += voti[riga][colonna];
            }
            System.out.println(studenti[riga] + ": totale " + somma);
        }

        for (int colonna = 0; colonna < voti[0].length; colonna++) {
            int sommaEsame = 0;
            for (int riga = 0; riga < voti.length; riga++) {
                sommaEsame += voti[riga][colonna];
            }
            System.out.println("Esame " + (colonna + 1) + ": media " + (double) sommaEsame / voti.length);
        }
    }
}`,
          note: [
            ['int[][] voti = {', { t: 'Matrice inizializzata', ar: 'مصفوفة ثنائية مهيأة', ex: 'صفان، وكل صف مصفوفة من 3 درجات. في عرض الذاكرة ترى مصفوفة المراجع وكل صف كائناً مستقلاً.' }],
            ['voti[riga].length', { t: 'Colonne della riga', ar: 'أعمدة الصف', ex: 'طول الصف الحالي، أي عدد الأعمدة.' }],
          ],
        },
        norma: {
          it: 'Cicli annidati con limiti m.length e m[riga].length, mai numeri scritti a mano.',
          ar: 'حلقات متداخلة بحدود m.length و m[riga].length وليس أرقاماً مكتوبة يدوياً.',
        },
        quiz: [
          {
            d: 'int[][] m = new int[3][5]; Quanto vale m[0].length?', dAr: 'كم قيمة m[0].length؟',
            opzioni: ['3', '5', '15', '0'], corretta: 1,
            it: 'm[0] è la prima riga, che contiene 5 colonne.',
            ar: 'm[0] هو الصف الأول ويحتوي 5 أعمدة.',
          },
          {
            d: 'Per sommare la diagonale principale di una matrice quadrata n×n cosa si somma?', dAr: 'لجمع القطر الرئيسي لمصفوفة مربعة ماذا نجمع؟',
            opzioni: ['m[i][0]', 'm[0][i]', 'm[i][i]', 'm[i][n - i]'], corretta: 2,
            it: 'La diagonale principale ha indice di riga uguale a indice di colonna: un solo ciclo con m[i][i].',
            ar: 'في القطر الرئيسي يتساوى مؤشر الصف ومؤشر العمود، فتكفي حلقة واحدة مع m[i][i].',
          },
        ],
        costruisci: {
          consegna: 'Completa la dichiarazione della matrice e i limiti dei due cicli.',
          consegnaAr: 'أكمل تعريف المصفوفة وحدود الحلقتين.',
          codice: `public class Griglia {

    public static void main(String[] args) {
        int⟦[][]⟧ g = new int[2][3];
        for (int r = 0; r < g.⟦length⟧; r++) {
            for (int c = 0; c < g⟦[r]⟧.length; c++) {
                g[r][c] = r * 10 + c;
                System.out.print(g[r][c] + " ");
            }
            System.out.println();
        }
    }
}`,
          output: '0 1 2 \n10 11 12 \n',
        },
        laboratorio: {
          titolo: 'Traccia e diagonale',
          consegna: 'Scrivi static int diagonale(int[][] m) che restituisce la somma della diagonale principale. Con la matrice {{1,2,3},{4,5,6},{7,8,9}} stampa «Diagonale: 15».',
          consegnaAr: 'اكتب static int diagonale(int[][] m) التي تُعيد مجموع القطر الرئيسي. مع المصفوفة {{1,2,3},{4,5,6},{7,8,9}} اطبع «Diagonale: 15».',
          codice: `public class Diagonale {

    public static int diagonale(int[][] m) {
        return 0;
    }

    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        System.out.println("Diagonale: " + diagonale(m));
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Diagonale: 15', msg: 'Deve stampare «Diagonale: 15».', msgAr: 'يجب أن يطبع «Diagonale: 15».' },
            { tipo: 'codice', re: '\\[\\s*(\\w+)\\s*\\]\\s*\\[\\s*\\1\\s*\\]', msg: 'Accedi agli elementi m[i][i].', msgAr: 'استخدم العناصر m[i][i].' },
          ],
          soluzione: `public class Diagonale {

    public static int diagonale(int[][] m) {
        int somma = 0;
        for (int i = 0; i < m.length; i++) {
            somma += m[i][i];
        }
        return somma;
    }

    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        System.out.println("Diagonale: " + diagonale(m));
    }
}`,
        },
        riepilogo: [
          { it: 'Una matrice è un array di array.', ar: 'المصفوفة ثنائية الأبعاد هي مصفوفة من المصفوفات.' },
          { it: 'm.length = righe, m[r].length = colonne della riga r.', ar: 'm.length عدد الصفوف و m[r].length عدد أعمدة الصف r.' },
          { it: 'Due cicli annidati: l\'ordine dipende dal calcolo.', ar: 'حلقتان متداخلتان وترتيبهما يعتمد على الحساب.' },
        ],
      },
      {
        id: 'l17', titolo: 'Ricorsione: caso base e passo ricorsivo', durata: '15 min',
        obiettivi: ['Scrivere metodi ricorsivi', 'Riconoscere caso base e passo ricorsivo', 'Capire lo StackOverflowError'],
        teoria: [
          {
            it: 'Un metodo ricorsivo è un metodo che chiama sé stesso per risolvere una versione più piccola dello stesso problema.',
            t: 'Ricorsione', ar: 'الدالة التعاودية (الاستدعاء الذاتي) دالة تستدعي نفسها لحل نسخة أصغر من نفس المشكلة.',
            ex: 'مثال: `n! = n × (n-1)!`. لحساب 4! نحتاج 3!، ولحساب 3! نحتاج 2!... وهكذا حتى نصل إلى حالة نعرف جوابها مباشرة.',
            bn: 'Usa la ricorsione quando il problema ha una struttura naturalmente ricorsiva.', bnAr: 'استخدم التعاود عندما تكون للمشكلة بنية تعاودية طبيعية.',
          },
          {
            it: 'Il caso base è la condizione in cui il metodo restituisce il risultato senza chiamarsi di nuovo.',
            t: 'Caso base', ar: 'الحالة الأساسية هي الشرط الذي تُعيد فيه الدالة النتيجة دون أن تستدعي نفسها مجدداً.',
            ex: 'بدون حالة أساسية (أو إن لم نقترب منها) تستمر الاستدعاءات بلا نهاية، فيمتلئ الـStack بالإطارات ويرمي البرنامج `StackOverflowError`.',
            bn: 'Scrivi sempre per primo il caso base.', bnAr: 'اكتب الحالة الأساسية دائماً أولاً.',
          },
          {
            it: 'Il passo ricorsivo riduce il problema e combina il risultato della chiamata ricorsiva.',
            t: 'Passo ricorsivo', ar: 'الخطوة التعاودية تُصغّر المشكلة وتدمج نتيجة الاستدعاء التعاودي.',
            ex: 'كل استدعاء ينشئ إطاراً جديداً على الـStack بقيمة `n` خاصة به. شاهد في عرض الذاكرة كيف تتراكم الإطارات ثم تُزال واحداً تلو الآخر عند العودة.',
            bn: 'Ogni chiamata ricorsiva deve avvicinarsi al caso base.', bnAr: 'يجب أن يقترب كل استدعاء تعاودي من الحالة الأساسية.',
          },
        ],
        analogia: {
          titolo: 'Le matrioske',
          it: 'Apri una matrioska e dentro ce n\'è una più piccola, finché arrivi all\'ultima, piena: quello è il caso base.',
          ar: 'التعاود مثل دمى الماتريوشكا الروسية: تفتح الدمية فتجد داخلها دمية أصغر، وتفتحها فتجد أصغر... حتى تصل إلى الدمية الأخيرة الصلبة التي لا تُفتح: هذه هي الحالة الأساسية. ثم تعيد إغلاقها بالترتيب العكسي، وهذا ما يحدث عند عودة الاستدعاءات.',
        },
        esempio: {
          file: 'Ricorsione.java',
          codice: `public class Ricorsione {

    private static final int BASE_DIECI = 10;

    public static long fattoriale(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * fattoriale(n - 1);
    }

    public static int sommaCifre(int numero) {
        if (numero < BASE_DIECI) {
            return numero;
        }
        return numero % BASE_DIECI + sommaCifre(numero / BASE_DIECI);
    }

    public static void main(String[] args) {
        System.out.println("4! = " + fattoriale(4));
        System.out.println("Somma cifre di 2024: " + sommaCifre(2024));
    }
}`,
          note: [
            ['if (n <= 1) {', { t: 'Caso base', ar: 'الحالة الأساسية', ex: 'عندما يصبح n يساوي 1 تتوقف الاستدعاءات ويبدأ إرجاع النتائج.' }],
            ['return n * fattoriale(n - 1);', { t: 'Passo ricorsivo', ar: 'الخطوة التعاودية', ex: 'استدعاء بقيمة أصغر بواحد. في عرض الذاكرة ترى إطارات fattoriale متراكمة: n=4، n=3، n=2، n=1.' }],
          ],
        },
        norma: {
          it: 'Caso base all\'inizio del metodo e chiamata ricorsiva che si avvicina sempre al caso base.',
          ar: 'الحالة الأساسية في بداية الدالة، والاستدعاء التعاودي يقترب دائماً منها.',
        },
        quiz: [
          {
            d: 'Cosa succede se un metodo ricorsivo non ha caso base?', dAr: 'ماذا يحدث إذا لم تكن للدالة التعاودية حالة أساسية؟',
            opzioni: ['Restituisce 0', 'Errore di compilazione', 'StackOverflowError: lo Stack si riempie di frame', 'Il programma termina normalmente'], corretta: 2,
            it: 'Ogni chiamata aggiunge un frame: senza caso base lo Stack si esaurisce e la JVM lancia StackOverflowError.',
            ar: 'كل استدعاء يضيف إطاراً، وبدون حالة أساسية يمتلئ الـStack فترمي JVM الخطأ StackOverflowError.',
          },
          {
            d: 'static int f(int n) { if (n == 0) { return 0; } return n + f(n - 1); } Quanto vale f(3)?', dAr: 'كم قيمة f(3)؟',
            opzioni: ['3', '6', '0', '9'], corretta: 1,
            it: 'f(3) = 3 + f(2) = 3 + 2 + f(1) = 3 + 2 + 1 + f(0) = 6.',
            ar: 'نجمع حتى نصل إلى الحالة الأساسية: f(3) = 3 + 2 + 1 + 0 = 6.',
          },
        ],
        costruisci: {
          consegna: 'Completa il caso base e il passo ricorsivo della potenza.',
          consegnaAr: 'أكمل الحالة الأساسية والخطوة التعاودية لدالة القوة.',
          codice: `public class Potenza {

    public static int potenza(int base, int esponente) {
        if (esponente == ⟦0⟧) {
            return ⟦1⟧;
        }
        return base * ⟦potenza⟧(base, esponente ⟦- 1|-1⟧);
    }

    public static void main(String[] args) {
        System.out.println("2^5 = " + potenza(2, 5));
    }
}`,
          output: '2^5 = 32\n',
        },
        laboratorio: {
          titolo: 'Fibonacci ricorsivo',
          consegna: 'Scrivi static int fibonacci(int n) ricorsivo, con fibonacci(0) = 0 e fibonacci(1) = 1. Stampa «F(10) = 55».',
          consegnaAr: 'اكتب الدالة التعاودية static int fibonacci(int n) حيث fibonacci(0) = 0 و fibonacci(1) = 1. اطبع «F(10) = 55».',
          codice: `public class Fibonacci {

    public static int fibonacci(int n) {
        return 0;
    }

    public static void main(String[] args) {
        System.out.println("F(10) = " + fibonacci(10));
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'F(10) = 55', msg: 'Deve stampare «F(10) = 55».', msgAr: 'يجب أن يطبع «F(10) = 55».' },
            { tipo: 'codice', re: 'fibonacci\\s*\\(\\s*n\\s*-\\s*1\\s*\\)', msg: 'Il metodo deve chiamare sé stesso con n - 1.', msgAr: 'يجب أن تستدعي الدالة نفسها بـ n - 1.' },
            { tipo: 'nonCodice', re: '\\b(for|while)\\s*\\(', msg: 'Niente cicli: usa la ricorsione.', msgAr: 'بدون حلقات، استخدم التعاود.' },
          ],
          soluzione: `public class Fibonacci {

    public static int fibonacci(int n) {
        if (n <= 1) {
            return n;
        }
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        System.out.println("F(10) = " + fibonacci(10));
    }
}`,
        },
        riepilogo: [
          { it: 'Ricorsione = caso base + passo ricorsivo.', ar: 'التعاود = حالة أساسية + خطوة تعاودية.' },
          { it: 'Ogni chiamata crea un nuovo frame sullo Stack.', ar: 'كل استدعاء ينشئ إطاراً جديداً على الـStack.' },
          { it: 'Senza caso base: StackOverflowError.', ar: 'بدون حالة أساسية: StackOverflowError.' },
        ],
      },
    ],
  };
  if (typeof module === 'object' && module.exports) module.exports = livello;
  else (root.CF_LIVELLI = root.CF_LIVELLI || []).push(livello);
})(typeof globalThis !== 'undefined' ? globalThis : this);
