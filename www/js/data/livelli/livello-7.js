/* CodeForge — Livello 7: Eccezioni, File e Programmazione Funzionale (Sviluppatore Robusto). */
(function (root) {
  'use strict';
  const livello = {
    numero: 7, id: 'L7', colore: '#F0883E', icona: 'shield',
    titolo: 'Eccezioni, File e Stream', titoloAr: 'الاستثناءات والملفات والتدفقات',
    grado: 'Sviluppatore Robusto', gradoAr: 'مطوّر متين',
    descr: 'Gestione degli errori con le eccezioni, lettura e scrittura di file di testo, lambda e Stream API.',
    lezioni: [
      {
        id: 'l32', titolo: 'try, catch, finally e la gerarchia Throwable', durata: '14 min',
        obiettivi: ['Catturare eccezioni specifiche', 'Usare finally', 'Conoscere la gerarchia Throwable'],
        teoria: [
          {
            it: 'Un\'eccezione è un oggetto che rappresenta un errore avvenuto durante l\'esecuzione e interrompe il flusso normale del programma.',
            t: 'Eccezione', ar: 'الاستثناء كائن يمثل خطأً حدث أثناء التنفيذ ويقطع السير الطبيعي للبرنامج.',
            ex: 'عندما يحدث خطأ (قسمة على صفر، مؤشر خارج الحدود...) تُنشئ JVM كائن استثناء و"ترميه". يصعد الاستثناء عبر إطارات الـStack حتى يجد `catch` مناسباً، وإن لم يجد يتوقف البرنامج ويطبع الـstack trace.',
            bn: 'Leggi lo stack trace dal basso verso l\'alto per capire il percorso dell\'errore.', bnAr: 'اقرأ الـstack trace لفهم مسار الخطأ.',
          },
          {
            it: 'Il blocco try contiene il codice che può fallire, e ogni blocco catch gestisce un tipo specifico di eccezione.',
            t: 'try / catch', ar: 'كتلة try تحتوي الكود الذي قد يفشل، وكل كتلة catch تعالج نوعاً محدداً من الاستثناءات.',
            ex: 'تُفحص كتل `catch` بالترتيب، وأول واحدة متوافقة تُنفَّذ. لذلك تُكتب الاستثناءات الأكثر تخصصاً أولاً: كتابة `catch (Exception e)` قبل `catch (ArithmeticException e)` خطأ ترجمة لأن الثانية لن تُصل أبداً.',
            bn: 'Cattura eccezioni specifiche, non Exception generica, e non lasciare mai un catch vuoto.', bnAr: 'التقط استثناءات محددة وليس Exception العامة، ولا تترك catch فارغة أبداً.',
          },
          {
            it: 'Il blocco finally viene eseguito sempre, sia che l\'eccezione si verifichi sia che non si verifichi.',
            t: 'finally', ar: 'كتلة finally تُنفَّذ دائماً، سواء حدث الاستثناء أم لا.',
            ex: 'تُستخدم لتحرير الموارد (إغلاق ملف أو اتصال). تُنفَّذ حتى لو كان في `try` تعليمة `return`. اليوم نفضّل غالباً try-with-resources لإغلاق الموارد تلقائياً.',
            bn: 'Usa finally (o try-with-resources) per rilasciare le risorse.', bnAr: 'استخدم finally (أو try-with-resources) لتحرير الموارد.',
          },
          {
            it: 'Tutte le eccezioni derivano da Throwable, che si divide in Error, per i problemi gravi della JVM, ed Exception, per gli errori gestibili.',
            t: 'Gerarchia Throwable', ar: 'كل الاستثناءات مشتقة من Throwable، التي تنقسم إلى Error للمشاكل الخطيرة في JVM، و Exception للأخطاء القابلة للمعالجة.',
            ex: '`Error` مثل `StackOverflowError` و`OutOfMemoryError` لا نلتقطها عادة. `Exception` تتفرع منها `RuntimeException` (مثل `NullPointerException` و`ArithmeticException` و`ArrayIndexOutOfBoundsException`) وبقية الاستثناءات مثل `IOException`.',
            bn: 'Non catturare mai Error o Throwable.', bnAr: 'لا تلتقط أبداً Error أو Throwable.',
          },
        ],
        analogia: {
          titolo: 'La rete del trapezista',
          it: 'Il try è il numero del trapezista, il catch è la rete di sicurezza, il finally è l\'inchino finale che si fa comunque.',
          ar: 'كتلة `try` مثل عرض لاعب الأكروبات في السيرك، و`catch` هي شبكة الأمان التي تلتقطه إن سقط، فيستمر العرض بدلاً من أن ينتهي بكارثة. و`finally` هي التحية في نهاية العرض: يقوم بها دائماً، سقط أم لم يسقط. وإن لم توجد شبكة مناسبة يسقط البرنامج كله.',
        },
        esempio: {
          file: 'Divisioni.java',
          codice: `public class Divisioni {

    public static int dividi(int a, int b) {
        return a / b;
    }

    public static void main(String[] args) {
        int[] divisori = {2, 0};
        for (int d : divisori) {
            try {
                System.out.println("100 / " + d + " = " + dividi(100, d));
            } catch (ArithmeticException e) {
                System.out.println("Errore: " + e.getMessage());
            } finally {
                System.out.println("Tentativo con " + d + " concluso");
            }
        }

        int[] voti = {28, 30};
        try {
            System.out.println(voti[2]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Indice non valido: " + e.getMessage());
        }
        System.out.println("Il programma continua");
    }
}`,
          note: [
            ['} catch (ArithmeticException e) {', { t: 'catch specifico', ar: 'catch محددة', ex: 'تلتقط فقط القسمة على صفر. الرسالة "/ by zero" تأتي من JVM.' }],
            ['} finally {', { t: 'finally', ar: 'finally', ex: 'تُنفَّذ في الحالتين: بعد النجاح مع 2 وبعد الخطأ مع 0.' }],
          ],
          normaAmmesse: ['eccezioni-flusso'],
        },
        norma: {
          it: 'catch specifici e mai vuoti, dal più specifico al più generale, e finally o try-with-resources per le risorse.',
          ar: 'كتل catch محددة وغير فارغة، من الأكثر تخصصاً إلى الأعم، و finally أو try-with-resources للموارد.',
        },
        quiz: [
          {
            d: 'try { return 1; } finally { System.out.print("F"); } — viene stampato «F»?', dAr: 'هل تُطبع «F»؟',
            opzioni: ['No, il return esce subito', 'Sì, finally viene eseguito prima di uscire', 'Solo se c\'è un\'eccezione', 'Errore di compilazione'], corretta: 1,
            it: 'Il finally viene eseguito anche quando il try termina con return.',
            ar: 'تُنفَّذ finally حتى عندما ينتهي try بـ return.',
          },
          {
            d: 'NullPointerException è una sottoclasse di…', dAr: 'NullPointerException صنف فرعي من...',
            opzioni: ['Error', 'IOException', 'RuntimeException', 'Throwable direttamente'], corretta: 2,
            it: 'NullPointerException, ArithmeticException e ArrayIndexOutOfBoundsException sono RuntimeException (unchecked).',
            ar: 'NullPointerException و ArithmeticException و ArrayIndexOutOfBoundsException كلها RuntimeException (غير مفحوصة).',
          },
        ],
        costruisci: {
          consegna: 'Completa i blocchi try, catch e finally.',
          consegnaAr: 'أكمل كتل try و catch و finally.',
          codice: `public class Conversione {

    public static void main(String[] args) {
        String[] input = {"42", "ciao"};
        for (String s : input) {
            ⟦try⟧ {
                int n = Integer.parseInt(s);
                System.out.println("Numero: " + n);
            } ⟦catch⟧ (⟦NumberFormatException⟧ e) {
                System.out.println("Non è un numero: " + s);
            } ⟦finally⟧ {
                System.out.println("Fatto");
            }
        }
    }
}`,
          output: 'Numero: 42\nFatto\nNon è un numero: ciao\nFatto\n',
        },
        laboratorio: {
          titolo: 'Input robusto',
          consegna: 'Leggi una riga con Scanner e convertila con Integer.parseInt. Se non è un numero, cattura NumberFormatException e stampa «Valore non valido»; altrimenti stampa «Doppio: X». In ogni caso stampa «Fine» in un finally.',
          consegnaAr: 'اقرأ سطراً بـ Scanner وحوّله بـ Integer.parseInt. إن لم يكن رقماً فالتقط NumberFormatException واطبع «Valore non valido»، وإلا اطبع «Doppio: X». وفي كل الحالات اطبع «Fine» داخل finally.',
          input: 'abc\n',
          codice: `import java.util.Scanner;

public class Robusto {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String riga = sc.nextLine();
        int n = Integer.parseInt(riga);
        System.out.println("Doppio: " + n * 2);
        sc.close();
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Valore non valido\nFine', msg: 'Con «abc» deve stampare «Valore non valido» e «Fine».', msgAr: 'مع «abc» يجب أن يطبع «Valore non valido» ثم «Fine».' },
            { tipo: 'output', input: '21\n', atteso: 'Doppio: 42\nFine', msg: 'Con «21» deve stampare «Doppio: 42» e «Fine».', msgAr: 'مع «21» يجب أن يطبع «Doppio: 42» ثم «Fine».' },
            { tipo: 'codice', re: 'catch\\s*\\(\\s*NumberFormatException', msg: 'Cattura NumberFormatException (non Exception).', msgAr: 'التقط NumberFormatException وليس Exception.' },
            { tipo: 'codice', re: 'finally', msg: 'Usa un blocco finally.', msgAr: 'استخدم كتلة finally.' },
          ],
          soluzione: `import java.util.Scanner;

public class Robusto {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String riga = sc.nextLine();
        try {
            int n = Integer.parseInt(riga);
            System.out.println("Doppio: " + n * 2);
        } catch (NumberFormatException e) {
            System.out.println("Valore non valido");
        } finally {
            System.out.println("Fine");
        }
        sc.close();
    }
}`,
        },
        riepilogo: [
          { it: 'try contiene il codice rischioso, catch gestisce tipi specifici.', ar: 'try تحتوي الكود الخطِر و catch تعالج أنواعاً محددة.' },
          { it: 'finally viene eseguito sempre.', ar: 'finally تُنفَّذ دائماً.' },
          { it: 'Throwable → Error e Exception → RuntimeException.', ar: 'Throwable ← Error و Exception ← RuntimeException.' },
        ],
      },
      {
        id: 'l33', titolo: 'Eccezioni checked e unchecked, throw, throws ed eccezioni personalizzate', durata: '15 min',
        obiettivi: ['Distinguere checked e unchecked', 'Lanciare e dichiarare eccezioni', 'Creare eccezioni personalizzate'],
        teoria: [
          {
            it: 'Le eccezioni checked devono essere catturate o dichiarate con throws, mentre le unchecked, sottoclassi di RuntimeException, non sono controllate dal compilatore.',
            t: 'Checked contro unchecked', ar: 'الاستثناءات المفحوصة (checked) يجب التقاطها أو التصريح عنها بـ throws، أما غير المفحوصة (unchecked)، وهي أصناف فرعية من RuntimeException، فلا يفحصها المترجم.',
            ex: 'المفحوصة تمثل مشاكل خارجية متوقعة لا يتحكم بها المبرمج (ملف غير موجود: `IOException`). غير المفحوصة تمثل أخطاء برمجية (null، مؤشر خاطئ) يجب إصلاحها في الكود وليس التقاطها.',
            bn: 'Checked per le condizioni recuperabili esterne, unchecked per gli errori di programmazione.', bnAr: 'المفحوصة للظروف الخارجية القابلة للمعالجة، وغير المفحوصة لأخطاء البرمجة.',
          },
          {
            it: 'L\'istruzione throw lancia un oggetto eccezione, mentre la clausola throws nella firma dichiara quali eccezioni checked il metodo può propagare.',
            t: 'throw e throws', ar: 'التعليمة throw ترمي كائن استثناء، أما throws في التوقيع فتعلن الاستثناءات المفحوصة التي قد تنشرها الدالة.',
            ex: '`throw new SaldoInsufficienteException(...)` داخل الجسم (فعل). `void preleva(double x) throws SaldoInsufficienteException` في التوقيع (إعلان). المستدعي مُلزم إما بالتقاطه أو بإضافة throws بدوره.',
            bn: 'Lancia l\'eccezione il prima possibile, gestiscila dove sai cosa fare.', bnAr: 'ارمِ الاستثناء في أقرب وقت، وعالجه حيث تعرف ماذا تفعل.',
          },
          {
            it: 'Un\'eccezione personalizzata si crea estendendo Exception per una checked o RuntimeException per una unchecked.',
            t: 'Eccezione personalizzata', ar: 'يُنشأ الاستثناء المخصص بالوراثة من Exception لاستثناء مفحوص، أو من RuntimeException لاستثناء غير مفحوص.',
            ex: 'اسمه ينتهي بـ `Exception`، ومُنشئه يستدعي `super(messaggio)`. يمكن أن يحمل بيانات إضافية مثل المبلغ الناقص، مما يعطي معلومات أوضح من استثناء عام.',
            bn: 'Il nome di un\'eccezione termina con Exception e descrive il problema.', bnAr: 'اسم الاستثناء ينتهي بـ Exception ويصف المشكلة.',
          },
          {
            it: 'Le eccezioni non vanno usate per gestire il flusso normale del programma, ma solo per le situazioni eccezionali.',
            t: 'Niente eccezioni per il flusso', ar: 'لا تُستخدم الاستثناءات لإدارة السير الطبيعي للبرنامج، بل للحالات الاستثنائية فقط.',
            ex: 'خطأ: التقاط `ArrayIndexOutOfBoundsException` لمعرفة نهاية المصفوفة. الصحيح: الشرط `i < v.length`. الاستثناءات أبطأ وتُخفي المنطق الحقيقي.',
            bn: 'Se puoi controllare una condizione con un if, non usare un\'eccezione.', bnAr: 'إذا استطعت فحص الحالة بـ if فلا تستخدم استثناء.',
          },
        ],
        analogia: {
          titolo: 'L\'allarme antincendio',
          it: 'throw è premere l\'allarme, throws è il cartello «in questo edificio può suonare l\'allarme», catch è la squadra che interviene.',
          ar: '`throw` مثل الضغط على زر إنذار الحريق، و`throws` مثل لافتة على باب المبنى تقول: "قد ينطلق إنذار هنا، كن مستعداً". و`catch` هو فريق الإطفاء الذي يتدخل. والاستثناء المفحوص هو إنذار يجب أن يكون له فريق مستعد بالقانون، أما غير المفحوص فهو خلل كان يجب إصلاحه قبل أن يحدث.',
        },
        esempio: {
          file: 'Prelievi.java',
          codice: `class SaldoInsufficienteException extends Exception {

    private final double mancante;

    public SaldoInsufficienteException(double mancante) {
        super("Saldo insufficiente: mancano " + mancante + " euro");
        this.mancante = mancante;
    }

    public double getMancante() {
        return mancante;
    }
}

class Conto {

    private double saldo;

    public Conto(double saldo) {
        this.saldo = saldo;
    }

    public void preleva(double importo) throws SaldoInsufficienteException {
        if (importo <= 0) {
            throw new IllegalArgumentException("Importo non positivo");
        }
        if (importo > saldo) {
            throw new SaldoInsufficienteException(importo - saldo);
        }
        saldo -= importo;
    }

    public double getSaldo() {
        return saldo;
    }
}

public class Prelievi {

    public static void main(String[] args) {
        Conto conto = new Conto(100);
        try {
            conto.preleva(40);
            conto.preleva(80);
        } catch (SaldoInsufficienteException e) {
            System.out.println(e.getMessage());
            System.out.println("Ti mancano " + e.getMancante() + " euro");
        }
        System.out.println("Saldo finale: " + conto.getSaldo());
    }
}`,
          note: [
            ['class SaldoInsufficienteException extends Exception {', { t: 'Eccezione checked personalizzata', ar: 'استثناء مفحوص مخصص', ex: 'ترث من Exception فيُلزم المترجم كل مستدعٍ بالتعامل معها.' }],
            ['throws SaldoInsufficienteException', { t: 'throws', ar: 'throws', ex: 'الدالة تعلن أنها قد ترمي هذا الاستثناء المفحوص.' }],
            ['throw new SaldoInsufficienteException(importo - saldo);', { t: 'throw', ar: 'throw', ex: 'يُنشأ الكائن ويُرمى؛ يتوقف تنفيذ الدالة ولا يتغير الرصيد.' }],
          ],
        },
        norma: {
          it: 'Eccezioni con nomi che finiscono in Exception, checked per i casi recuperabili, mai usate per il flusso normale.',
          ar: 'استثناءات بأسماء تنتهي بـ Exception، ومفحوصة للحالات القابلة للمعالجة، ولا تُستخدم أبداً للسير الطبيعي.',
        },
        quiz: [
          {
            d: 'Un metodo chiama new FileReader("a.txt"), che può lanciare FileNotFoundException (checked). Cosa deve fare?', dAr: 'ماذا يجب أن تفعل الدالة؟',
            opzioni: ['Niente', 'Catturarla con try-catch oppure dichiararla con throws', 'Solo dichiararla con throw', 'Estendere RuntimeException'], corretta: 1,
            it: 'Per le checked vale la regola «catch or declare»: o la gestisci o la dichiari.',
            ar: 'مع الاستثناءات المفحوصة تنطبق قاعدة "التقط أو أعلن": إما أن تعالجه أو تعلن عنه.',
          },
          {
            d: 'Qual è la differenza tra throw e throws?', dAr: 'ما الفرق بين throw و throws؟',
            opzioni: ['Nessuna', 'throw lancia un\'eccezione nel corpo, throws la dichiara nella firma', 'throws lancia, throw dichiara', 'throw si usa solo con Error'], corretta: 1,
            it: 'throw è un\'istruzione che lancia un oggetto; throws è una clausola della firma del metodo.',
            ar: 'throw تعليمة ترمي كائناً، و throws جزء من توقيع الدالة.',
          },
        ],
        costruisci: {
          consegna: 'Completa la superclasse dell\'eccezione, la dichiarazione throws e il lancio.',
          consegnaAr: 'أكمل الصنف الأب للاستثناء والتصريح throws وتعليمة الرمي.',
          codice: `class EtaNonValidaException extends ⟦Exception⟧ {

    public EtaNonValidaException(String messaggio) {
        ⟦super⟧(messaggio);
    }
}

public class Iscrizione {

    private static final int ETA_MINIMA = 18;

    public static void verifica(int eta) ⟦throws⟧ EtaNonValidaException {
        if (eta < ETA_MINIMA) {
            ⟦throw⟧ new EtaNonValidaException("Età " + eta + " troppo bassa");
        }
        System.out.println("Iscrizione accettata");
    }

    public static void main(String[] args) {
        try {
            verifica(20);
            verifica(16);
        } catch (EtaNonValidaException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
          output: 'Iscrizione accettata\nEtà 16 troppo bassa\n',
        },
        laboratorio: {
          titolo: 'Voto non valido',
          consegna: 'Crea l\'eccezione checked VotoNonValidoException. Scrivi static void registra(int voto) throws VotoNonValidoException che la lancia se il voto non è tra 18 e 30, altrimenti stampa «Registrato X». Nel main registra 27 e 35, catturando l\'eccezione e stampandone il messaggio «Voto 35 fuori intervallo».',
          consegnaAr: 'أنشئ الاستثناء المفحوص VotoNonValidoException. اكتب static void registra(int voto) throws VotoNonValidoException التي ترميه إذا لم تكن الدرجة بين 18 و 30، وإلا تطبع «Registrato X». في main سجّل 27 ثم 35 والتقط الاستثناء واطبع رسالته «Voto 35 fuori intervallo».',
          codice: `// eccezione personalizzata

public class Registro {

    private static final int VOTO_MINIMO = 18;
    private static final int VOTO_MASSIMO = 30;

    // metodo registra

    public static void main(String[] args) {

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Registrato 27\nVoto 35 fuori intervallo', msg: 'Output atteso: «Registrato 27» e «Voto 35 fuori intervallo».', msgAr: 'المخرجات المتوقعة: «Registrato 27» ثم «Voto 35 fuori intervallo».' },
            { tipo: 'codice', re: 'class\\s+VotoNonValidoException\\s+extends\\s+Exception', msg: 'VotoNonValidoException deve estendere Exception (checked).', msgAr: 'يجب أن يرث VotoNonValidoException من Exception (مفحوص).' },
            { tipo: 'codice', re: 'throws\\s+VotoNonValidoException', msg: 'registra deve dichiarare throws VotoNonValidoException.', msgAr: 'يجب أن تعلن registra عن throws VotoNonValidoException.' },
          ],
          soluzione: `class VotoNonValidoException extends Exception {

    public VotoNonValidoException(String messaggio) {
        super(messaggio);
    }
}

public class Registro {

    private static final int VOTO_MINIMO = 18;
    private static final int VOTO_MASSIMO = 30;

    public static void registra(int voto) throws VotoNonValidoException {
        if (voto < VOTO_MINIMO || voto > VOTO_MASSIMO) {
            throw new VotoNonValidoException("Voto " + voto + " fuori intervallo");
        }
        System.out.println("Registrato " + voto);
    }

    public static void main(String[] args) {
        try {
            registra(27);
            registra(35);
        } catch (VotoNonValidoException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
        },
        riepilogo: [
          { it: 'Checked: catch or declare; unchecked: RuntimeException.', ar: 'المفحوصة: التقط أو أعلن، وغير المفحوصة: RuntimeException.' },
          { it: 'throw lancia, throws dichiara.', ar: 'throw ترمي و throws تعلن.' },
          { it: 'Eccezioni personalizzate estendono Exception o RuntimeException.', ar: 'الاستثناءات المخصصة ترث من Exception أو RuntimeException.' },
        ],
      },
      {
        id: 'l34', titolo: 'File di testo: lettura e scrittura', durata: '15 min',
        obiettivi: ['Leggere file riga per riga con BufferedReader', 'Scrivere file con PrintWriter', 'Chiudere le risorse con try-with-resources'],
        teoria: [
          {
            it: 'Per leggere un file di testo riga per riga si usa un BufferedReader costruito su un FileReader.',
            t: 'BufferedReader', ar: 'لقراءة ملف نصي سطراً بسطر نستخدم BufferedReader مبنياً على FileReader.',
            ex: '`readLine()` تُعيد السطر التالي، أو `null` عند نهاية الملف. النمط الكلاسيكي: `String riga = br.readLine(); while (riga != null) { ...; riga = br.readLine(); }`.',
            bn: 'Controlla la fine del file con riga != null.', bnAr: 'افحص نهاية الملف بـ riga != null.',
          },
          {
            it: 'Per scrivere un file di testo si usa un PrintWriter, che offre gli stessi metodi print e println di System.out.',
            t: 'PrintWriter', ar: 'لكتابة ملف نصي نستخدم PrintWriter، الذي يوفر نفس دوال print و println الموجودة في System.out.',
            ex: '`new PrintWriter(new FileWriter("esito.txt"))` يُنشئ الملف (أو يمسح محتواه إن كان موجوداً). البيانات لا تُكتب فعلياً على القرص إلا عند `flush()` أو `close()`؛ إن نسيت الإغلاق قد يبقى الملف فارغاً!',
            bn: 'Chiudi sempre il writer, altrimenti i dati possono andare persi.', bnAr: 'أغلق الكاتب دائماً وإلا قد تضيع البيانات.',
          },
          {
            it: 'Il costrutto try-with-resources chiude automaticamente le risorse dichiarate tra parentesi alla fine del blocco, anche in caso di eccezione.',
            t: 'try-with-resources', ar: 'بنية try-with-resources تغلق تلقائياً الموارد المعلنة بين القوسين في نهاية الكتلة، حتى عند حدوث استثناء.',
            ex: '`try (BufferedReader br = new BufferedReader(new FileReader("voti.txt"))) { ... }` — لا حاجة لـ `finally` ولا لـ `close()` يدوياً. يعمل مع كل صنف ينفّذ `AutoCloseable`.',
            bn: 'Apri file, Scanner e connessioni sempre con try-with-resources.', bnAr: 'افتح الملفات والـScanner والاتصالات دائماً بـ try-with-resources.',
          },
          {
            it: 'Le operazioni sui file possono lanciare IOException, un\'eccezione checked che deve essere gestita o dichiarata.',
            t: 'IOException', ar: 'عمليات الملفات قد ترمي IOException، وهو استثناء مفحوص يجب معالجته أو إعلانه.',
            ex: 'مثلاً `FileNotFoundException` (صنف فرعي من IOException) إن لم يوجد الملف. في المحاكي يوجد نظام ملفات افتراضي: أضف الملفات في لوحة "File" في المحرر.',
            bn: 'Gestisci IOException con un messaggio chiaro per l\'utente.', bnAr: 'عالج IOException برسالة واضحة للمستخدم.',
          },
        ],
        analogia: {
          titolo: 'Il libro della biblioteca',
          it: 'Leggere un file è come prendere un libro in prestito: lo apri, lo leggi pagina per pagina e lo restituisci. try-with-resources è il bibliotecario che lo riprende sempre, anche se ti addormenti.',
          ar: 'قراءة ملف مثل استعارة كتاب من المكتبة: تفتحه، وتقرؤه صفحة صفحة (`readLine`) حتى لا تبقى صفحات (`null`)، ثم تعيده. و`try-with-resources` مثل أمين مكتبة يستعيد الكتاب منك تلقائياً في النهاية حتى لو نسيت أو حدث طارئ. أما الكتابة فمثل رسالة: لا تصل حتى تغلق الظرف (`close`).',
        },
        esempio: {
          file: 'Esiti.java',
          files: { 'voti.txt': 'Rossi;27\nBianchi;15\nVerdi;30\n' },
          codice: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

public class Esiti {

    private static final int SUFFICIENZA = 18;

    public static void main(String[] args) {
        try (BufferedReader lettore = new BufferedReader(new FileReader("voti.txt"));
             PrintWriter scrittore = new PrintWriter(new FileWriter("esiti.txt"))) {
            String riga = lettore.readLine();
            int promossi = 0;
            while (riga != null) {
                String[] campi = riga.split(";");
                int voto = Integer.parseInt(campi[1]);
                String esito = voto >= SUFFICIENZA ? "PROMOSSO" : "RESPINTO";
                scrittore.println(campi[0] + " " + esito);
                if (voto >= SUFFICIENZA) {
                    promossi++;
                }
                riga = lettore.readLine();
            }
            System.out.println("Promossi: " + promossi);
        } catch (IOException e) {
            System.out.println("Errore di lettura: " + e.getMessage());
        }
    }
}`,
          note: [
            ['try (BufferedReader lettore = new BufferedReader(new FileReader("voti.txt"));', { t: 'try-with-resources', ar: 'try-with-resources', ex: 'الملفان يُغلقان تلقائياً في نهاية الكتلة؛ عندها فقط يُكتب esiti.txt على القرص.' }],
            ['while (riga != null) {', { t: 'Fine del file', ar: 'نهاية الملف', ex: 'readLine تُعيد null عندما لا تبقى أسطر.' }],
          ],
        },
        norma: {
          it: 'try-with-resources per ogni file, ciclo con riga != null e IOException gestita con un messaggio utile.',
          ar: 'try-with-resources لكل ملف، وحلقة بشرط riga != null، و IOException تُعالج برسالة مفيدة.',
        },
        quiz: [
          {
            d: 'Cosa restituisce readLine() quando il file è finito?', dAr: 'ماذا تُعيد readLine() عند انتهاء الملف؟',
            opzioni: ['Una stringa vuota', 'null', '-1', 'Lancia EOFException'], corretta: 1,
            it: 'BufferedReader.readLine() restituisce null alla fine del file.',
            ar: 'تُعيد BufferedReader.readLine() القيمة null عند نهاية الملف.',
          },
          {
            d: 'Un programma scrive con PrintWriter ma non chiama mai close(). Cosa può succedere?', dAr: 'ماذا قد يحدث إذا لم يُستدعَ close()؟',
            opzioni: ['Niente', 'Il file può restare vuoto perché i dati restano nel buffer', 'Errore di compilazione', 'Il file viene cancellato'], corretta: 1,
            it: 'I dati sono scritti su disco solo con flush() o close(): senza chiusura possono andare persi.',
            ar: 'لا تُكتب البيانات على القرص إلا عند flush() أو close()، وبدون إغلاق قد تضيع.',
          },
        ],
        costruisci: {
          consegna: 'Completa la scrittura del file con try-with-resources e la sua rilettura.',
          consegnaAr: 'أكمل كتابة الملف بـ try-with-resources وإعادة قراءته.',
          codice: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

public class Diario {

    public static void main(String[] args) {
        try (⟦PrintWriter⟧ out = new PrintWriter(new FileWriter("diario.txt"))) {
            out.⟦println⟧("Lunedì: Analisi");
            out.println("Martedì: Programmazione");
        } catch (IOException e) {
            System.out.println("Errore: " + e.getMessage());
        }
        try (BufferedReader in = new BufferedReader(new ⟦FileReader⟧("diario.txt"))) {
            String riga = in.readLine();
            while (riga != ⟦null⟧) {
                System.out.println(riga);
                riga = in.readLine();
            }
        } catch (⟦IOException⟧ e) {
            System.out.println("Errore: " + e.getMessage());
        }
    }
}`,
          output: 'Lunedì: Analisi\nMartedì: Programmazione\n',
        },
        laboratorio: {
          titolo: 'Media dal file',
          consegna: 'Il file numeri.txt contiene un numero intero per riga. Leggilo con BufferedReader in un try-with-resources, calcola la media e scrivila nel file media.txt come «Media: X» (X double). Stampa anche «Letti N numeri».',
          consegnaAr: 'يحتوي الملف numeri.txt على عدد صحيح في كل سطر. اقرأه بـ BufferedReader داخل try-with-resources، واحسب المعدل واكتبه في الملف media.txt بالشكل «Media: X» (X من نوع double). واطبع أيضاً «Letti N numeri».',
          files: { 'numeri.txt': '10\n20\n30\n40\n' },
          codice: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

public class Media {

    public static void main(String[] args) {
        // leggi numeri.txt e scrivi media.txt

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Letti 4 numeri', msg: 'Deve stampare «Letti 4 numeri».', msgAr: 'يجب أن يطبع «Letti 4 numeri».' },
            { tipo: 'file', nome: 'media.txt', atteso: 'Media: 25.0', msg: 'Il file media.txt deve contenere «Media: 25.0».', msgAr: 'يجب أن يحتوي الملف media.txt على «Media: 25.0».' },
            { tipo: 'codice', re: 'try\\s*\\(\\s*BufferedReader', msg: 'Apri il file con try-with-resources.', msgAr: 'افتح الملف بـ try-with-resources.' },
          ],
          soluzione: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

public class Media {

    public static void main(String[] args) {
        int somma = 0;
        int conteggio = 0;
        try (BufferedReader in = new BufferedReader(new FileReader("numeri.txt"))) {
            String riga = in.readLine();
            while (riga != null) {
                somma += Integer.parseInt(riga.trim());
                conteggio++;
                riga = in.readLine();
            }
        } catch (IOException e) {
            System.out.println("Errore di lettura: " + e.getMessage());
        }
        System.out.println("Letti " + conteggio + " numeri");
        try (PrintWriter out = new PrintWriter(new FileWriter("media.txt"))) {
            out.println("Media: " + (double) somma / conteggio);
        } catch (IOException e) {
            System.out.println("Errore di scrittura: " + e.getMessage());
        }
    }
}`,
        },
        riepilogo: [
          { it: 'BufferedReader.readLine() fino a null.', ar: 'BufferedReader.readLine() حتى null.' },
          { it: 'PrintWriter scrive davvero solo con flush o close.', ar: 'PrintWriter لا يكتب فعلياً إلا عند flush أو close.' },
          { it: 'try-with-resources chiude tutto in automatico.', ar: 'try-with-resources تغلق كل شيء تلقائياً.' },
        ],
      },
      {
        id: 'l35', titolo: 'Espressioni lambda e Stream API', durata: '16 min',
        obiettivi: ['Scrivere espressioni lambda e method reference', 'Usare filter, map, sorted e collect', 'Raggruppare dati con Collectors.groupingBy'],
        teoria: [
          {
            it: 'Un\'espressione lambda è una funzione anonima e compatta che implementa un\'interfaccia funzionale, cioè con un solo metodo astratto.',
            t: 'Espressione lambda', ar: 'تعبير لامدا دالة مجهولة ومختصرة تنفّذ واجهة وظيفية، أي واجهة فيها دالة مجردة واحدة فقط.',
            ex: '`x -> x * 2` تعني "خذ x وأعِد x × 2". بدلاً من كتابة صنف مجهول من 5 أسطر لـ `Comparator` نكتب `(a, b) -> a.length() - b.length()`. المتغيرات الخارجية المستخدمة داخلها يجب أن تكون final فعلياً (لا يتغير بعد تعيينه).',
            bn: 'Lambda brevi e leggibili; se diventa lunga, estrai un metodo.', bnAr: 'لامدا قصيرة ومقروءة، وإن طالت فاستخرج منها دالة.',
          },
          {
            it: 'Un method reference come String::toUpperCase è una forma abbreviata di lambda che chiama un metodo esistente.',
            t: 'Method reference (::)', ar: 'مرجع الدالة مثل String::toUpperCase صيغة مختصرة للامدا تستدعي دالة موجودة.',
            ex: '`s -> s.toUpperCase()` تساوي `String::toUpperCase`، و`x -> System.out.println(x)` تساوي `System.out::println`. أوضح عندما لا تضيف اللامدا أي منطق.',
            bn: 'Preferisci il method reference quando la lambda chiama solo un metodo.', bnAr: 'فضّل مرجع الدالة عندما تستدعي اللامدا دالة واحدة فقط.',
          },
          {
            it: 'Uno Stream è una sequenza di elementi su cui si costruisce una pipeline di operazioni intermedie e una operazione terminale.',
            t: 'Stream API', ar: 'الـStream تسلسل من العناصر نبني عليه خط معالجة من عمليات وسيطة وعملية نهائية.',
            ex: 'عمليات وسيطة (كسولة): `filter` (تصفية)، `map` (تحويل)، `sorted` (ترتيب)، `distinct`، `limit`. عمليات نهائية: `collect`، `count`، `forEach`، `sum`، `average`. لا يُنفَّذ شيء حتى تُستدعى العملية النهائية، والـstream لا يعدّل المجموعة الأصلية.',
            bn: 'Uno stream si usa una sola volta e non modifica la sorgente.', bnAr: 'الـstream يُستخدم مرة واحدة ولا يعدّل المصدر.',
          },
          {
            it: 'I Collectors raccolgono il risultato di uno stream in una lista, una stringa o una mappa raggruppata.',
            t: 'Collectors', ar: 'الـCollectors تجمع نتيجة الـstream في قائمة أو نص أو خريطة مجمّعة.',
            ex: '`Collectors.toList()` إلى قائمة، `Collectors.joining(", ")` إلى نص، `Collectors.groupingBy(Studente::getCorso)` إلى `Map` تجمع العناصر حسب مفتاح، ومع `Collectors.counting()` تعدّها.',
            bn: 'Usa groupingBy invece di cicli con mappe costruite a mano.', bnAr: 'استخدم groupingBy بدلاً من الحلقات مع خرائط مبنية يدوياً.',
          },
        ],
        analogia: {
          titolo: 'La catena di montaggio',
          it: 'Uno stream è una catena di montaggio: i pezzi passano dal controllo qualità (filter), dalla verniciatura (map), dall\'imballaggio in ordine (sorted) e finiscono nel camion (collect).',
          ar: 'الـStream مثل خط إنتاج في مصنع: القطع تمرّ أولاً على مراقبة الجودة (`filter`) فتُستبعد المعيبة، ثم على الطلاء (`map`) فتتغير، ثم تُرتَّب (`sorted`)، وأخيراً تُحمَّل في الشاحنة (`collect`). والخط لا يبدأ بالدوران حتى تصل الشاحنة (العملية النهائية). أما اللامدا فهي التعليمة القصيرة المكتوبة لكل محطة.',
        },
        esempio: {
          file: 'Statistiche.java',
          codice: `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Statistiche {

    private static final int SOGLIA_ECCELLENZA = 28;

    public static void main(String[] args) {
        List<String> corsi = List.of("analisi", "fisica", "programmazione", "algebra", "fisica");
        List<String> conA = corsi.stream()
                .filter(c -> c.startsWith("a"))
                .map(String::toUpperCase)
                .sorted()
                .collect(Collectors.toList());
        System.out.println(conA);
        System.out.println(corsi.stream().distinct().collect(Collectors.joining(", ")));

        List<Integer> voti = List.of(24, 30, 18, 28, 27, 30);
        double media = voti.stream().mapToInt(Integer::intValue).average().orElse(0);
        long eccellenti = voti.stream().filter(v -> v >= SOGLIA_ECCELLENZA).count();
        System.out.printf("Media %.2f, eccellenti %d%n", media, eccellenti);

        Map<Integer, Long> frequenze = voti.stream()
                .collect(Collectors.groupingBy(v -> v, Collectors.counting()));
        System.out.println("Frequenze: " + frequenze);
        voti.stream().filter(v -> v == 30).forEach(v -> System.out.println("Lode possibile: " + v));
    }
}`,
          note: [
            ['.filter(c -> c.startsWith("a"))', { t: 'filter con lambda', ar: 'filter مع لامدا', ex: 'تُبقي فقط المقررات التي تبدأ بحرف a.' }],
            ['.map(String::toUpperCase)', { t: 'map con method reference', ar: 'map مع مرجع دالة', ex: 'تحوّل كل نص إلى أحرف كبيرة.' }],
            ['Collectors.groupingBy(v -> v, Collectors.counting())', { t: 'groupingBy', ar: 'groupingBy', ex: 'خريطة: الدرجة ← عدد مرات ظهورها.' }],
          ],
        },
        norma: {
          it: 'Lambda corte, method reference quando possibile, pipeline una operazione per riga e nessun effetto collaterale dentro map o filter.',
          ar: 'لامدا قصيرة، ومراجع الدوال عند الإمكان، وخط معالجة بعملية في كل سطر، ولا آثار جانبية داخل map أو filter.',
        },
        quiz: [
          {
            d: 'List.of(1, 2, 3, 4).stream().filter(x -> x % 2 == 0).map(x -> x * 10).collect(Collectors.toList()) — risultato?', dAr: 'ما النتيجة؟',
            opzioni: ['[10, 30]', '[20, 40]', '[2, 4]', '[10, 20, 30, 40]'], corretta: 1,
            it: 'filter tiene i pari (2, 4), map li moltiplica per 10: [20, 40].',
            ar: 'filter تُبقي الزوجية (2، 4) ثم map تضربها في 10: [20, 40].',
          },
          {
            d: 'Quale di queste è un\'operazione terminale?', dAr: 'أي من هذه عملية نهائية؟',
            opzioni: ['filter', 'map', 'sorted', 'collect'], corretta: 3,
            it: 'filter, map e sorted sono intermedie (pigre); collect avvia la pipeline e produce il risultato.',
            ar: 'filter و map و sorted عمليات وسيطة كسولة، أما collect فتشغّل الخط وتنتج النتيجة.',
          },
        ],
        costruisci: {
          consegna: 'Completa la pipeline: filtra, trasforma, ordina e raccogli.',
          consegnaAr: 'أكمل خط المعالجة: صفِّ وحوِّل ورتِّب واجمع.',
          codice: `import java.util.List;
import java.util.stream.Collectors;

public class Pipeline {

    public static void main(String[] args) {
        List<String> nomi = List.of("luca", "anna", "bo", "giulia");
        String risultato = nomi.⟦stream⟧()
                .⟦filter⟧(n -> n.length() > 2)
                .map(String::⟦toUpperCase⟧)
                .sorted()
                .collect(Collectors.⟦joining⟧(" - "));
        System.out.println(risultato);
    }
}`,
          output: 'ANNA - GIULIA - LUCA\n',
        },
        laboratorio: {
          titolo: 'Analisi con gli stream',
          consegna: 'Dalla lista di prezzi List.of(12.5, 80.0, 45.0, 60.5, 5.0) usa uno stream per: (1) stampare «Costosi: [80.0, 60.5]» cioè i prezzi sopra 50 in ordine decrescente; (2) stampare «Totale: 203.0» con mapToDouble e sum. Niente cicli for/while.',
          consegnaAr: 'من قائمة الأسعار List.of(12.5, 80.0, 45.0, 60.5, 5.0) استخدم stream من أجل: (1) طباعة «Costosi: [80.0, 60.5]» أي الأسعار فوق 50 بترتيب تنازلي؛ (2) طباعة «Totale: 203.0» باستخدام mapToDouble و sum. بدون حلقات for/while.',
          codice: `import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class Prezzi {

    private static final double SOGLIA = 50.0;

    public static void main(String[] args) {
        List<Double> prezzi = List.of(12.5, 80.0, 45.0, 60.5, 5.0);

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Costosi: [80.0, 60.5]\nTotale: 203.0', msg: 'Output atteso: «Costosi: [80.0, 60.5]» e «Totale: 203.0».', msgAr: 'المخرجات المتوقعة: «Costosi: [80.0, 60.5]» ثم «Totale: 203.0».' },
            { tipo: 'nonCodice', re: '\\b(for|while)\\s*\\(', msg: 'Niente cicli: usa gli stream.', msgAr: 'بدون حلقات، استخدم الـstreams.' },
            { tipo: 'codice', re: 'filter\\s*\\(', msg: 'Usa filter.', msgAr: 'استخدم filter.' },
          ],
          soluzione: `import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class Prezzi {

    private static final double SOGLIA = 50.0;

    public static void main(String[] args) {
        List<Double> prezzi = List.of(12.5, 80.0, 45.0, 60.5, 5.0);
        List<Double> costosi = prezzi.stream()
                .filter(p -> p > SOGLIA)
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());
        System.out.println("Costosi: " + costosi);
        double totale = prezzi.stream().mapToDouble(Double::doubleValue).sum();
        System.out.println("Totale: " + totale);
    }
}`,
        },
        riepilogo: [
          { it: 'Lambda: (parametri) -> espressione; method reference: Classe::metodo.', ar: 'اللامدا: (معاملات) -> تعبير، ومرجع الدالة: Classe::metodo.' },
          { it: 'Stream: sorgente → operazioni intermedie → operazione terminale.', ar: 'الـStream: مصدر ← عمليات وسيطة ← عملية نهائية.' },
          { it: 'Collectors: toList, joining, groupingBy, counting.', ar: 'الـCollectors: toList و joining و groupingBy و counting.' },
        ],
      },
    ],
  };
  if (typeof module === 'object' && module.exports) module.exports = livello;
  else (root.CF_LIVELLI = root.CF_LIVELLI || []).push(livello);
})(typeof globalThis !== 'undefined' ? globalThis : this);
