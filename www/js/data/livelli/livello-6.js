/* CodeForge — Livello 6: Enum e Collezioni (Gestore di Dati). */
(function (root) {
  'use strict';
  const livello = {
    numero: 6, id: 'L6', colore: '#D29922', icona: 'stack',
    titolo: 'Enum e Collezioni', titoloAr: 'التعدادات والمجموعات',
    grado: 'Gestore di Dati', gradoAr: 'مدير البيانات',
    descr: 'Tipi enumerativi, ArrayList generici, HashMap e HashSet, ordinamento con Comparable e Comparator.',
    lezioni: [
      {
        id: 'l28', titolo: 'Tipi enumerativi (enum)', durata: '12 min',
        obiettivi: ['Dichiarare enum con attributi e metodi', 'Usare enum nello switch e con values()'],
        teoria: [
          {
            it: 'Un enum è un tipo che ammette solo un insieme fisso di valori costanti con nome.',
            t: 'Tipo enumerativo (enum)', ar: 'التعداد (enum) نوع لا يقبل إلا مجموعة ثابتة من القيم الثابتة المسمّاة.',
            ex: 'بدلاً من تمثيل أيام الأسبوع بالأعداد 1 إلى 7 (ويمكن أن يُكتب 8 بالخطأ) نعرّف `enum Giorno { LUNEDI, MARTEDI, ... }`. المترجم يمنع أي قيمة غير موجودة، والكود يصبح مقروءاً.',
            bn: 'Usa un enum invece di costanti int o String quando i valori sono un insieme chiuso.', bnAr: 'استخدم enum بدلاً من ثوابت int أو String عندما تكون القيم مجموعة مغلقة.',
          },
          {
            it: 'Ogni costante di un enum è un oggetto unico, quindi può essere confrontata con == e usata nello switch.',
            t: 'Costanti enum', ar: 'كل ثابت في التعداد كائن فريد، لذلك يمكن مقارنته بـ == واستخدامه في switch.',
            ex: 'الدالة `values()` تُعيد مصفوفة بكل الثوابت بترتيب تعريفها، و`name()` تُعيد الاسم كنص، و`ordinal()` تُعيد الترتيب بدءاً من 0. و`valueOf("LUNEDI")` تحوّل النص إلى ثابت.',
            bn: 'Le costanti enum si scrivono in MAIUSCOLO.', bnAr: 'ثوابت التعداد تُكتب بأحرف كبيرة.',
          },
          {
            it: 'Un enum può avere attributi, un costruttore privato e metodi, come una classe.',
            t: 'Enum con attributi', ar: 'يمكن للتعداد أن يحتوي خصائص ومُنشئاً خاصاً ودوالاً، تماماً مثل الصنف.',
            ex: '`MERCURIO(3.7)` يستدعي المُنشئ بالقيمة 3.7. المُنشئ دائماً private ضمنياً لأنه لا يمكن إنشاء ثوابت جديدة من الخارج.',
            bn: 'Associa i dati alle costanti invece di usare switch sparsi nel codice.', bnAr: 'اربط البيانات بالثوابت بدلاً من استخدام switch متفرقة في الكود.',
          },
        ],
        analogia: {
          titolo: 'Il semaforo',
          it: 'Un semaforo ha solo tre colori possibili: non esiste il «viola». Un enum è un tipo con un menu chiuso di valori.',
          ar: 'إشارة المرور لها ثلاثة ألوان فقط: أحمر وأصفر وأخضر، ولا يوجد "بنفسجي". التعداد نوع بقائمة مغلقة من القيم، والمترجم يرفض أي قيمة خارجها. ويمكن لكل لون أن يحمل معلومة، مثل مدة بقائه مضاءً.',
        },
        esempio: {
          file: 'Semaforo.java',
          codice: `enum Colore {
    ROSSO(30), GIALLO(5), VERDE(25);

    private final int secondi;

    Colore(int secondi) {
        this.secondi = secondi;
    }

    public int getSecondi() {
        return secondi;
    }

    public Colore successivo() {
        switch (this) {
            case ROSSO:
                return VERDE;
            case VERDE:
                return GIALLO;
            default:
                return ROSSO;
        }
    }
}

public class Semaforo {

    public static void main(String[] args) {
        Colore c = Colore.ROSSO;
        int totale = 0;
        for (Colore colore : Colore.values()) {
            totale += colore.getSecondi();
            System.out.println(colore.ordinal() + ": " + colore + " per " + colore.getSecondi() + "s");
        }
        System.out.println("Ciclo completo: " + totale + "s");
        System.out.println("Dopo " + c + " viene " + c.successivo());
        System.out.println(c == Colore.valueOf("ROSSO"));
    }
}`,
          note: [
            ['ROSSO(30), GIALLO(5), VERDE(25);', { t: 'Costanti con valore', ar: 'ثوابت بقيم', ex: 'كل ثابت كائن يُنشأ مرة واحدة باستدعاء المُنشئ بقيمته.' }],
            ['Colore.values()', { t: 'values()', ar: 'values()', ex: 'مصفوفة بكل الثوابت بترتيب التعريف.' }],
          ],
        },
        norma: {
          it: 'Enum per gli insiemi chiusi di valori, costanti in MAIUSCOLO e dati associati alle costanti.',
          ar: 'التعداد للمجموعات المغلقة من القيم، والثوابت بأحرف كبيرة، والبيانات مرتبطة بالثوابت.',
        },
        quiz: [
          {
            d: 'enum Taglia { S, M, L } — cosa restituisce Taglia.L.ordinal()?', dAr: 'ماذا تُعيد Taglia.L.ordinal()؟',
            opzioni: ['3', '2', '"L"', '1'], corretta: 1,
            it: 'ordinal() parte da 0: S = 0, M = 1, L = 2.',
            ar: 'ordinal() تبدأ من 0: S = 0 و M = 1 و L = 2.',
          },
          {
            d: 'Perché un enum è meglio di final int ROSSO = 0, GIALLO = 1, VERDE = 2?', dAr: 'لماذا التعداد أفضل من ثوابت int؟',
            opzioni: ['È più veloce', 'Il compilatore impedisce valori non previsti e il codice è più leggibile', 'Occupa meno memoria', 'Non c\'è differenza'], corretta: 1,
            it: 'Con gli int si può passare 42 per sbaglio; con un enum sono ammessi solo i valori dichiarati.',
            ar: 'مع int يمكن تمرير 42 بالخطأ، أما مع التعداد فتُقبل القيم المعلنة فقط.',
          },
        ],
        costruisci: {
          consegna: 'Completa la dichiarazione dell\'enum, il ciclo sui valori e lo switch.',
          consegnaAr: 'أكمل تعريف التعداد والحلقة على القيم وجملة switch.',
          codice: `⟦enum⟧ Stagione {
    INVERNO, PRIMAVERA, ESTATE, AUTUNNO
}

public class Clima {

    public static void main(String[] args) {
        for (Stagione s : Stagione.⟦values⟧()) {
            String tipo = switch (s) {
                case ⟦ESTATE⟧ -> "caldo";
                case INVERNO -> "freddo";
                ⟦default⟧ -> "mite";
            };
            System.out.println(s + ": " + tipo);
        }
    }
}`,
          output: 'INVERNO: freddo\nPRIMAVERA: mite\nESTATE: caldo\nAUTUNNO: mite\n',
        },
        laboratorio: {
          titolo: 'Livelli di priorità',
          consegna: 'Crea enum Priorita { BASSA(1), MEDIA(2), ALTA(3) } con attributo peso e getter getPeso(). Nel main somma i pesi di tutte le priorità con values() e stampa «Peso totale: 6».',
          consegnaAr: 'أنشئ enum Priorita { BASSA(1), MEDIA(2), ALTA(3) } بخاصية peso و getter باسم getPeso(). في main اجمع أوزان كل الأولويات باستخدام values() واطبع «Peso totale: 6».',
          codice: `// enum Priorita

public class Attivita {

    public static void main(String[] args) {

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Peso totale: 6', msg: 'Deve stampare «Peso totale: 6».', msgAr: 'يجب أن يطبع «Peso totale: 6».' },
            { tipo: 'codice', re: 'enum\\s+Priorita', msg: 'Dichiara enum Priorita.', msgAr: 'صرّح عن enum Priorita.' },
            { tipo: 'codice', re: 'values\\s*\\(\\s*\\)', msg: 'Usa Priorita.values().', msgAr: 'استخدم Priorita.values().' },
          ],
          soluzione: `enum Priorita {
    BASSA(1), MEDIA(2), ALTA(3);

    private final int peso;

    Priorita(int peso) {
        this.peso = peso;
    }

    public int getPeso() {
        return peso;
    }
}

public class Attivita {

    public static void main(String[] args) {
        int totale = 0;
        for (Priorita p : Priorita.values()) {
            totale += p.getPeso();
        }
        System.out.println("Peso totale: " + totale);
    }
}`,
        },
        riepilogo: [
          { it: 'enum = insieme chiuso di costanti tipizzate.', ar: 'التعداد مجموعة مغلقة من الثوابت ذات النوع.' },
          { it: 'values(), name(), ordinal(), valueOf().', ar: 'values() و name() و ordinal() و valueOf().' },
          { it: 'Gli enum possono avere attributi, costruttore e metodi.', ar: 'يمكن للتعدادات أن تملك خصائص ومُنشئاً ودوالاً.' },
        ],
      },
      {
        id: 'l29', titolo: 'ArrayList<T>, generics e ciclo for-each', durata: '15 min',
        obiettivi: ['Usare ArrayList con i generics', 'Aggiungere, leggere e rimuovere elementi', 'Evitare la ConcurrentModificationException'],
        teoria: [
          {
            it: 'ArrayList è una lista ridimensionabile: a differenza dell\'array cresce automaticamente quando si aggiungono elementi.',
            t: 'ArrayList', ar: 'ArrayList قائمة قابلة لتغيير الحجم: بعكس المصفوفة تكبر تلقائياً عند إضافة عناصر.',
            ex: 'الدوال الأساسية: `add(e)` للإضافة، و`get(i)` للقراءة، و`set(i, e)` للتعديل، و`remove(i)` للحذف، و`size()` لعدد العناصر (وليس `length`). و`contains(e)` و`indexOf(e)` تستخدمان `equals`.',
            bn: 'Dichiara la variabile con l\'interfaccia: List<String> nomi = new ArrayList<>();', bnAr: 'صرّح عن المتغير بالواجهة: List<String> nomi = new ArrayList<>();',
          },
          {
            it: 'I generics, scritti tra parentesi angolari, indicano il tipo degli elementi e permettono al compilatore di controllarlo.',
            t: 'Generics (<T>)', ar: 'الأنواع العامة (generics) تُكتب بين أقواس زاوية، وتحدد نوع العناصر وتسمح للمترجم بالتحقق منه.',
            ex: '`ArrayList<String>` لا تقبل إلا نصوصاً. الأنواع البدائية غير مسموحة: نكتب `ArrayList<Integer>` وليس `ArrayList<int>`، وJava تحوّل تلقائياً بين `int` و`Integer` (autoboxing).',
            bn: 'Usa sempre i generics; usa l\'operatore diamante <> a destra.', bnAr: 'استخدم دائماً الأنواع العامة، والمعامل الماسي <> في الطرف الأيمن.',
          },
          {
            it: 'Rimuovere elementi da una lista mentre la si scorre con un for-each lancia ConcurrentModificationException.',
            t: 'ConcurrentModificationException', ar: 'حذف عناصر من قائمة أثناء المرور عليها بـ for-each يرمي ConcurrentModificationException.',
            ex: 'الـfor-each يستخدم مكرّراً (Iterator) يكتشف أن القائمة تغيرت. الحل الحديث: `lista.removeIf(x -> x < 18)`، أو استخدام `Iterator` و`it.remove()`.',
            bn: 'Per rimuovere durante la scansione usa removeIf o un Iterator.', bnAr: 'للحذف أثناء المرور استخدم removeIf أو Iterator.',
          },
          {
            it: 'Attenzione: in una List<Integer> il metodo remove(int) rimuove per indice, non per valore.',
            t: 'remove(indice) contro remove(oggetto)', ar: 'انتبه: في List<Integer> الدالة remove(int) تحذف حسب المؤشر وليس حسب القيمة.',
            ex: 'في `[10, 20, 30]` الأمر `remove(1)` يحذف 20 (المؤشر 1). لحذف القيمة 10 اكتب `remove(Integer.valueOf(10))`. سؤال فخ متكرر في الامتحانات.',
            bn: 'Per rimuovere un valore Integer usa Integer.valueOf(x).', bnAr: 'لحذف قيمة Integer استخدم Integer.valueOf(x).',
          },
        ],
        analogia: {
          titolo: 'Il treno a vagoni',
          it: 'Un array è un pullman con posti fissi; un ArrayList è un treno a cui puoi agganciare o staccare vagoni.',
          ar: 'المصفوفة مثل حافلة بعدد مقاعد ثابت: إن امتلأت لا يمكن إضافة راكب. أما `ArrayList` فمثل قطار يمكنك إضافة عربات إليه أو فصلها متى شئت. والنوع العام `<String>` مثل لافتة على القطار: "ركاب فقط، ممنوع البضائع".',
        },
        esempio: {
          file: 'Lista.java',
          codice: `import java.util.ArrayList;
import java.util.List;

public class Lista {

    private static final int SUFFICIENZA = 18;

    public static void main(String[] args) {
        List<String> corsi = new ArrayList<>();
        corsi.add("Analisi");
        corsi.add("Programmazione");
        corsi.add("Fisica");
        corsi.add(1, "Algebra");
        System.out.println(corsi + " (" + corsi.size() + " corsi)");
        System.out.println("Primo: " + corsi.get(0) + ", contiene Fisica? " + corsi.contains("Fisica"));

        List<Integer> voti = new ArrayList<>(List.of(24, 15, 30, 17, 28));
        voti.removeIf(v -> v < SUFFICIENZA);
        int somma = 0;
        for (int v : voti) {
            somma += v;
        }
        System.out.println("Voti validi: " + voti + ", somma " + somma);

        voti.remove(0);
        voti.remove(Integer.valueOf(28));
        System.out.println("Dopo le rimozioni: " + voti);
    }
}`,
          note: [
            ['List<String> corsi = new ArrayList<>();', { t: 'Lista generica', ar: 'قائمة عامة', ex: 'النوع المعلن هو الواجهة `List` والتنفيذ `ArrayList`. المعامل الماسي `<>` يستنتج `String`.' }],
            ['voti.removeIf(v -> v < SUFFICIENZA);', { t: 'removeIf', ar: 'removeIf', ex: 'يحذف كل العناصر التي تحقق الشرط بأمان، دون ConcurrentModificationException.' }],
            ['voti.remove(Integer.valueOf(28));', { t: 'Rimozione per valore', ar: 'الحذف حسب القيمة', ex: 'نمرّر كائن Integer لذلك يُحذف العنصر الذي قيمته 28 وليس العنصر رقم 28.' }],
          ],
        },
        norma: {
          it: 'Variabili di tipo List<T>, operatore diamante, size() per la lunghezza e removeIf per le rimozioni durante la scansione.',
          ar: 'متغيرات من نوع List<T>، والمعامل الماسي، و size() للطول، و removeIf للحذف أثناء المرور.',
        },
        quiz: [
          {
            d: 'List<Integer> l = new ArrayList<>(List.of(10, 20, 30)); l.remove(1); Cosa contiene l?', dAr: 'ماذا تحتوي l؟',
            opzioni: ['[20, 30]', '[10, 30]', '[10, 20]', '[10, 20, 30]'], corretta: 1,
            it: 'remove(int) rimuove per indice: l\'elemento in posizione 1 è 20.',
            ar: 'remove(int) تحذف حسب المؤشر، والعنصر في الموضع 1 هو 20.',
          },
          {
            d: 'Quale dichiarazione NON compila?', dAr: 'أي تصريح لا يُترجم؟',
            opzioni: ['ArrayList<Integer> a = new ArrayList<>();', 'List<String> b = new ArrayList<>();', 'ArrayList<int> c = new ArrayList<>();', 'List<Double> d = new ArrayList<Double>();'], corretta: 2,
            it: 'I generics non accettano tipi primitivi: serve la classe wrapper Integer.',
            ar: 'الأنواع العامة لا تقبل الأنواع البدائية، بل الصنف المغلّف Integer.',
          },
        ],
        costruisci: {
          consegna: 'Completa la creazione della lista, l\'aggiunta, la dimensione e il for-each.',
          consegnaAr: 'أكمل إنشاء القائمة والإضافة والحجم وحلقة for-each.',
          codice: `import java.util.ArrayList;
import java.util.List;

public class Spesa {

    public static void main(String[] args) {
        List<⟦String⟧> lista = new ArrayList⟦<>⟧();
        lista.⟦add⟧("pane");
        lista.add("latte");
        System.out.println("Articoli: " + lista.⟦size⟧());
        for (String articolo ⟦:⟧ lista) {
            System.out.println("- " + articolo);
        }
    }
}`,
          output: 'Articoli: 2\n- pane\n- latte\n',
        },
        laboratorio: {
          titolo: 'Filtra i nomi',
          consegna: 'Leggi con Scanner dei nomi (uno per riga) finché l\'utente scrive «fine» e salvali in una List<String>. Poi rimuovi quelli più corti di 4 lettere con removeIf e stampa la lista.',
          consegnaAr: 'اقرأ بـ Scanner أسماءً (اسم في كل سطر) حتى يكتب المستخدم «fine» واحفظها في List<String>. ثم احذف الأسماء التي طولها أقل من 4 أحرف باستخدام removeIf واطبع القائمة.',
          input: 'Anna\nLuca\nBo\nGiovanni\nEva\nfine\n',
          codice: `import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Nomi {

    private static final int LUNGHEZZA_MINIMA = 4;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<String> nomi = new ArrayList<>();
        // leggi fino a "fine"

        sc.close();
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: '[Anna, Luca, Giovanni]', msg: 'Deve stampare «[Anna, Luca, Giovanni]».', msgAr: 'يجب أن يطبع «[Anna, Luca, Giovanni]».' },
            { tipo: 'codice', re: 'removeIf', msg: 'Usa removeIf.', msgAr: 'استخدم removeIf.' },
            { tipo: 'norma', regole: ['salto-non-strutturato', 'string-equals'], msg: 'Niente break e confronto delle stringhe con equals.', msgAr: 'بدون break، وقارن النصوص بـ equals.' },
          ],
          soluzione: `import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Nomi {

    private static final int LUNGHEZZA_MINIMA = 4;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<String> nomi = new ArrayList<>();
        String nome = sc.nextLine();
        while (!nome.equals("fine")) {
            nomi.add(nome);
            nome = sc.nextLine();
        }
        nomi.removeIf(n -> n.length() < LUNGHEZZA_MINIMA);
        System.out.println(nomi);
        sc.close();
    }
}`,
        },
        riepilogo: [
          { it: 'ArrayList cresce da sola: add, get, set, remove, size.', ar: 'ArrayList تكبر تلقائياً: add و get و set و remove و size.' },
          { it: 'Generics con classi wrapper: List<Integer>, non List<int>.', ar: 'الأنواع العامة مع الأصناف المغلّفة: List<Integer> وليس List<int>.' },
          { it: 'Niente remove nel for-each: usa removeIf.', ar: 'لا تستخدم remove داخل for-each، بل removeIf.' },
        ],
      },
      {
        id: 'l30', titolo: 'HashMap e HashSet', durata: '15 min',
        obiettivi: ['Associare chiavi e valori con HashMap', 'Eliminare duplicati con HashSet', 'Contare occorrenze con getOrDefault e merge'],
        teoria: [
          {
            it: 'Una HashMap associa a ogni chiave un valore e permette di trovarlo molto velocemente a partire dalla chiave.',
            t: 'HashMap<K, V>', ar: 'HashMap تربط كل مفتاح بقيمة وتسمح بإيجادها بسرعة كبيرة انطلاقاً من المفتاح.',
            ex: '`put(k, v)` تضيف أو تستبدل، `get(k)` تُعيد القيمة أو `null` إن لم يوجد المفتاح، `containsKey(k)` تفحص الوجود. المفاتيح فريدة: `put` بنفس المفتاح يستبدل القيمة القديمة.',
            bn: 'Usa getOrDefault per evitare null quando la chiave potrebbe mancare.', bnAr: 'استخدم getOrDefault لتجنب null عندما قد يكون المفتاح غائباً.',
          },
          {
            it: 'Un HashSet è un insieme che non ammette duplicati e non garantisce alcun ordine degli elementi.',
            t: 'HashSet<E>', ar: 'HashSet مجموعة لا تقبل التكرار ولا تضمن أي ترتيب للعناصر.',
            ex: '`add` تُعيد `false` إذا كان العنصر موجوداً مسبقاً. الترتيب عند الطباعة يعتمد على قيم الـhash وليس على ترتيب الإضافة. إن احتجت ترتيب الإضافة استخدم `LinkedHashSet`، وللترتيب الأبجدي `TreeSet`.',
            bn: 'Non fare affidamento sull\'ordine di HashMap e HashSet.', bnAr: 'لا تعتمد على ترتيب عناصر HashMap و HashSet.',
          },
          {
            it: 'HashMap e HashSet usano hashCode() ed equals() delle chiavi per trovare e confrontare gli elementi.',
            t: 'hashCode ed equals', ar: 'تستخدم HashMap و HashSet الدالتين hashCode() و equals() للمفاتيح لإيجاد العناصر ومقارنتها.',
            ex: 'لهذا يجب أن تعيد تعريف الاثنتين معاً في أصنافك: إن تساوى كائنان بـ `equals` يجب أن يكون لهما نفس `hashCode`، وإلا قد تجد المجموعة "تكراراً" لا يجب أن يوجد.',
            bn: 'Chiavi immutabili (String, Integer, enum) sono le più sicure.', bnAr: 'المفاتيح غير القابلة للتغيير (String و Integer و enum) هي الأكثر أماناً.',
          },
          {
            it: 'Per contare le occorrenze si usa merge(chiave, 1, Integer::sum) oppure put con getOrDefault.',
            t: 'Conteggio con le mappe', ar: 'لعدّ التكرارات نستخدم merge(chiave, 1, Integer::sum) أو put مع getOrDefault.',
            ex: 'النمط الكلاسيكي: `conteggi.put(p, conteggi.getOrDefault(p, 0) + 1);` أو الأقصر `conteggi.merge(p, 1, Integer::sum);`. والمرور على الخريطة يكون عبر `entrySet()` للحصول على المفتاح والقيمة معاً.',
            bn: 'Scorri una mappa con entrySet() quando servono chiave e valore.', bnAr: 'مرّ على الخريطة بـ entrySet() عندما تحتاج المفتاح والقيمة.',
          },
        ],
        analogia: {
          titolo: 'La rubrica e la lista degli invitati',
          it: 'Una HashMap è una rubrica: cerchi il nome e trovi subito il numero. Un HashSet è la lista degli invitati: ogni nome compare una volta sola.',
          ar: 'الـ`HashMap` مثل دليل الهاتف: تبحث عن الاسم (المفتاح) فتجد الرقم (القيمة) فوراً دون قراءة الدليل كله. أما الـ`HashSet` فمثل قائمة المدعوين إلى حفلة: كل اسم يظهر مرة واحدة فقط، وإن حاولت إضافة نفس الشخص مرتين يرفض الحارس.',
        },
        esempio: {
          file: 'Parole.java',
          codice: `import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class Parole {

    public static void main(String[] args) {
        String testo = "il gatto e il cane e il topo";
        Map<String, Integer> conteggi = new HashMap<>();
        for (String parola : testo.split(" ")) {
            conteggi.merge(parola, 1, Integer::sum);
        }
        System.out.println("Occorrenze di il: " + conteggi.get("il"));
        System.out.println("Occorrenze di leone: " + conteggi.getOrDefault("leone", 0));
        for (Map.Entry<String, Integer> voce : conteggi.entrySet()) {
            System.out.println(voce.getKey() + " -> " + voce.getValue());
        }

        Set<String> uniche = new HashSet<>();
        for (String parola : testo.split(" ")) {
            uniche.add(parola);
        }
        System.out.println("Parole distinte: " + uniche.size());
        System.out.println("Aggiungo di nuovo gatto: " + uniche.add("gatto"));
    }
}`,
          note: [
            ['conteggi.merge(parola, 1, Integer::sum);', { t: 'Conteggio con merge', ar: 'العدّ بـ merge', ex: 'إن لم يوجد المفتاح يضع 1، وإن وُجد يجمع القيمة القديمة مع 1.' }],
            ['conteggi.entrySet()', { t: 'Scansione della mappa', ar: 'المرور على الخريطة', ex: 'كل عنصر زوج مفتاح/قيمة. لاحظ أن الترتيب ليس ترتيب الإضافة بل ترتيب الـhash (وهو نفسه في JVM الحقيقية).' }],
            ['uniche.add("gatto")', { t: 'Nessun duplicato', ar: 'لا تكرار', ex: 'تُعيد false لأن "gatto" موجود مسبقاً.' }],
          ],
        },
        norma: {
          it: 'Variabili di tipo Map e Set, getOrDefault invece di controlli su null e nessuna dipendenza dall\'ordine degli elementi.',
          ar: 'متغيرات من نوع Map و Set، و getOrDefault بدلاً من فحص null، وعدم الاعتماد على ترتيب العناصر.',
        },
        quiz: [
          {
            d: 'Map<String, Integer> m = new HashMap<>(); m.put("a", 1); m.put("a", 5); Quanto vale m.size() e m.get("a")?', dAr: 'كم قيمة m.size() و m.get("a")؟',
            opzioni: ['2 e 1', '1 e 5', '2 e 5', '1 e 1'], corretta: 1,
            it: 'Le chiavi sono uniche: il secondo put sostituisce il valore, la mappa ha un solo elemento.',
            ar: 'المفاتيح فريدة، فـ put الثانية تستبدل القيمة وتبقى في الخريطة عنصراً واحداً.',
          },
          {
            d: 'Cosa restituisce m.get("z") se la chiave "z" non esiste?', dAr: 'ماذا تُعيد m.get("z") إذا لم يوجد المفتاح؟',
            opzioni: ['0', 'null', 'Lancia un\'eccezione', 'Una stringa vuota'], corretta: 1,
            it: 'get restituisce null per le chiavi assenti; con getOrDefault si sceglie un valore predefinito.',
            ar: 'تُعيد get القيمة null للمفاتيح الغائبة، ومع getOrDefault نختار قيمة افتراضية.',
          },
        ],
        costruisci: {
          consegna: 'Completa la mappa dei prezzi, la lettura sicura e l\'insieme senza duplicati.',
          consegnaAr: 'أكمل خريطة الأسعار والقراءة الآمنة والمجموعة دون تكرار.',
          codice: `import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class Listino {

    public static void main(String[] args) {
        Map<String, Double> prezzi = new ⟦HashMap⟧<>();
        prezzi.⟦put⟧("caffè", 1.2);
        prezzi.put("cornetto", 1.5);
        System.out.println(prezzi.get("caffè"));
        System.out.println(prezzi.⟦getOrDefault⟧("tè", 0.0));
        Set<Integer> numeri = new HashSet<>();
        numeri.add(3);
        numeri.add(3);
        System.out.println(numeri.⟦size⟧());
    }
}`,
          output: '1.2\n0.0\n1\n',
        },
        laboratorio: {
          titolo: 'Voti per corso',
          consegna: 'Data la lista di esami "Analisi:24", "Fisica:28", "Analisi:30", costruisci una Map<String, Integer> con il voto massimo per ogni corso (usa merge con Math::max) e stampa «Analisi: 30» e «Fisica: 28» (una riga per corso, nell\'ordine di iterazione della mappa).',
          consegnaAr: 'من قائمة الامتحانات "Analisi:24" و "Fisica:28" و "Analisi:30" ابنِ Map<String, Integer> فيها أعلى درجة لكل مقرر (استخدم merge مع Math::max)، واطبع «Analisi: 30» و «Fisica: 28» (سطر لكل مقرر حسب ترتيب الخريطة).',
          codice: `import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Libretto {

    public static void main(String[] args) {
        List<String> esami = List.of("Analisi:24", "Fisica:28", "Analisi:30");
        Map<String, Integer> migliori = new HashMap<>();
        // riempi la mappa e stampala

    }
}`,
          verifiche: [
            { tipo: 'contiene', testo: 'Analisi: 30', msg: 'Deve stampare «Analisi: 30».', msgAr: 'يجب أن يطبع «Analisi: 30».' },
            { tipo: 'contiene', testo: 'Fisica: 28', msg: 'Deve stampare «Fisica: 28».', msgAr: 'يجب أن يطبع «Fisica: 28».' },
            { tipo: 'nonCodice', re: 'System\\.out\\.print\\w*\\(\\s*"Analisi', msg: 'Non scrivere i risultati a mano: stampali dalla mappa.', msgAr: 'لا تكتب النتائج يدوياً بل اطبعها من الخريطة.' },
            { tipo: 'codice', re: 'merge\\s*\\(', msg: 'Usa merge.', msgAr: 'استخدم merge.' },
          ],
          soluzione: `import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Libretto {

    public static void main(String[] args) {
        List<String> esami = List.of("Analisi:24", "Fisica:28", "Analisi:30");
        Map<String, Integer> migliori = new HashMap<>();
        for (String esame : esami) {
            String[] parti = esame.split(":");
            migliori.merge(parti[0], Integer.parseInt(parti[1]), Math::max);
        }
        for (Map.Entry<String, Integer> voce : migliori.entrySet()) {
            System.out.println(voce.getKey() + ": " + voce.getValue());
        }
    }
}`,
        },
        riepilogo: [
          { it: 'HashMap: chiave → valore, chiavi uniche, get restituisce null se manca.', ar: 'HashMap: مفتاح ← قيمة، مفاتيح فريدة، و get تُعيد null عند الغياب.' },
          { it: 'HashSet: nessun duplicato, nessun ordine garantito.', ar: 'HashSet: لا تكرار ولا ترتيب مضمون.' },
          { it: 'Contare con merge(k, 1, Integer::sum); scorrere con entrySet().', ar: 'العدّ بـ merge(k, 1, Integer::sum) والمرور بـ entrySet().' },
        ],
      },
      {
        id: 'l31', titolo: 'Ordinamento con Comparable e Comparator', durata: '14 min',
        obiettivi: ['Definire l\'ordine naturale con Comparable', 'Creare ordinamenti alternativi con Comparator', 'Ordinare liste con Collections.sort e List.sort'],
        teoria: [
          {
            it: 'Una classe che implementa Comparable<T> definisce il proprio ordine naturale tramite il metodo compareTo.',
            t: 'Comparable e compareTo', ar: 'الصنف الذي ينفّذ Comparable<T> يحدد ترتيبه الطبيعي عبر الدالة compareTo.',
            ex: '`a.compareTo(b)` تُعيد عدداً سالباً إن كان `a` قبل `b`، وصفراً إن تساويا، وموجباً إن كان بعده. `String` و`Integer` تنفّذانها مسبقاً (ترتيب أبجدي وعددي).',
            bn: 'Usa Integer.compare(a, b) invece di a - b, che può andare in overflow.', bnAr: 'استخدم Integer.compare(a, b) بدلاً من a - b التي قد تسبب فيضاناً.',
          },
          {
            it: 'Un Comparator è un oggetto esterno che definisce un ordinamento alternativo senza modificare la classe.',
            t: 'Comparator', ar: 'الـComparator كائن خارجي يعرّف ترتيباً بديلاً دون تعديل الصنف.',
            ex: 'يمكن ترتيب الطلاب حسب الاسم مرة وحسب المعدل مرة أخرى. منذ Java 8 نكتبه بسهولة: `Comparator.comparing(Studente::getNome)`.',
            bn: 'Preferisci Comparator.comparing a classi anonime lunghe.', bnAr: 'فضّل Comparator.comparing على الأصناف المجهولة الطويلة.',
          },
          {
            it: 'I comparatori si combinano con thenComparing per i pareggi e reversed per l\'ordine decrescente.',
            t: 'thenComparing e reversed', ar: 'تُدمج المقارنات بـ thenComparing لحالات التعادل و reversed للترتيب التنازلي.',
            ex: '`Comparator.comparing(Studente::getMedia).reversed().thenComparing(Studente::getNome)` يرتب من الأعلى معدلاً، وعند التساوي أبجدياً. `Collections.sort(lista)` تستخدم الترتيب الطبيعي، و`lista.sort(comp)` تستخدم المقارن.',
            bn: 'Rendi esplicito il criterio di parità.', bnAr: 'اجعل معيار التعادل صريحاً.',
          },
        ],
        analogia: {
          titolo: 'La classifica',
          it: 'Comparable è l\'ordine «di nascita» di un oggetto (gli studenti per matricola); Comparator è il giudice esterno che li mette in fila per media o per nome.',
          ar: 'الـ`Comparable` هو الترتيب "الطبيعي" المكتوب في هوية الكائن، مثل ترتيب الطلاب حسب رقم التسجيل. أما الـ`Comparator` فهو حَكَم خارجي يستطيع ترتيبهم حسب أي معيار يريده: المعدل، أو الاسم، أو العمر — دون تغيير هوياتهم.',
        },
        esempio: {
          file: 'Classifica.java',
          codice: `import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

class Studente implements Comparable<Studente> {

    private final int matricola;
    private final String nome;
    private final double media;

    public Studente(int matricola, String nome, double media) {
        this.matricola = matricola;
        this.nome = nome;
        this.media = media;
    }

    public String getNome() {
        return nome;
    }

    public double getMedia() {
        return media;
    }

    @Override
    public int compareTo(Studente altro) {
        return Integer.compare(matricola, altro.matricola);
    }

    @Override
    public String toString() {
        return nome + "(" + matricola + ", " + media + ")";
    }
}

public class Classifica {

    public static void main(String[] args) {
        List<Studente> studenti = new ArrayList<>();
        studenti.add(new Studente(300, "Luca", 27.5));
        studenti.add(new Studente(100, "Anna", 29.0));
        studenti.add(new Studente(200, "Bea", 27.5));

        Collections.sort(studenti);
        System.out.println("Per matricola: " + studenti);

        studenti.sort(Comparator.comparing(Studente::getNome));
        System.out.println("Per nome: " + studenti);

        studenti.sort(Comparator.comparing(Studente::getMedia).reversed().thenComparing(Studente::getNome));
        System.out.println("Classifica: " + studenti);
    }
}`,
          note: [
            ['return Integer.compare(matricola, altro.matricola);', { t: 'compareTo', ar: 'compareTo', ex: 'الترتيب الطبيعي حسب رقم التسجيل. Integer.compare آمنة من الفيضان.' }],
            ['Comparator.comparing(Studente::getMedia).reversed().thenComparing(Studente::getNome)', { t: 'Comparator combinato', ar: 'مقارن مركّب', ex: 'تنازلياً حسب المعدل، وعند التساوي (Luca و Bea بـ 27.5) أبجدياً.' }],
          ],
        },
        norma: {
          it: 'compareTo coerente con equals, Integer.compare/Double.compare invece della sottrazione e Comparator.comparing per ordini alternativi.',
          ar: 'compareTo متوافقة مع equals، و Integer.compare/Double.compare بدلاً من الطرح، و Comparator.comparing للترتيبات البديلة.',
        },
        quiz: [
          {
            d: 'Se a.compareTo(b) restituisce un numero negativo, cosa significa?', dAr: 'ماذا يعني أن تُعيد a.compareTo(b) عدداً سالباً؟',
            opzioni: ['a è uguale a b', 'a viene prima di b', 'a viene dopo b', 'Si è verificato un errore'], corretta: 1,
            it: 'Negativo: a precede b; zero: uguali; positivo: a segue b.',
            ar: 'السالب يعني أن a قبل b، والصفر تساوٍ، والموجب أن a بعد b.',
          },
          {
            d: 'Come ordini una List<String> parole dalla più lunga alla più corta?', dAr: 'كيف ترتب قائمة كلمات من الأطول إلى الأقصر؟',
            opzioni: ['Collections.sort(parole)', 'parole.sort(Comparator.comparing(String::length).reversed())', 'parole.sort(String::length)', 'Collections.reverse(parole)'], corretta: 1,
            it: 'comparing(String::length) ordina per lunghezza crescente; reversed() la rende decrescente.',
            ar: 'comparing(String::length) يرتب تصاعدياً حسب الطول، و reversed() يجعله تنازلياً.',
          },
        ],
        costruisci: {
          consegna: 'Completa l\'interfaccia implementata, il confronto e il comparatore inverso.',
          consegnaAr: 'أكمل الواجهة المنفّذة والمقارنة والمقارن العكسي.',
          codice: `import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

class Prodotto implements ⟦Comparable⟧<Prodotto> {

    private final String nome;
    private final int prezzo;

    public Prodotto(String nome, int prezzo) {
        this.nome = nome;
        this.prezzo = prezzo;
    }

    public int getPrezzo() {
        return prezzo;
    }

    @Override
    public int ⟦compareTo⟧(Prodotto altro) {
        return nome.compareTo(altro.nome);
    }

    @Override
    public String toString() {
        return nome;
    }
}

public class Vetrina {

    public static void main(String[] args) {
        List<Prodotto> lista = new ArrayList<>(List.of(new Prodotto("mela", 2), new Prodotto("ananas", 4), new Prodotto("kiwi", 3)));
        Collections.⟦sort⟧(lista);
        System.out.println(lista);
        lista.sort(Comparator.comparing(Prodotto::getPrezzo).⟦reversed⟧());
        System.out.println(lista);
    }
}`,
          output: '[ananas, kiwi, mela]\n[ananas, kiwi, mela]\n',
        },
        laboratorio: {
          titolo: 'Classifica del campionato',
          consegna: 'Completa la classe Squadra con compareTo che ordina per punti decrescenti e, a parità, per nome crescente. Dopo Collections.sort deve stampare «[Inter 80, Milan 75, Roma 75]».',
          consegnaAr: 'أكمل الصنف Squadra بالدالة compareTo التي ترتب حسب النقاط تنازلياً، وعند التساوي حسب الاسم تصاعدياً. بعد Collections.sort يجب أن يطبع «[Inter 80, Milan 75, Roma 75]».',
          codice: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class Squadra implements Comparable<Squadra> {

    private final String nome;
    private final int punti;

    public Squadra(String nome, int punti) {
        this.nome = nome;
        this.punti = punti;
    }

    @Override
    public int compareTo(Squadra altra) {
        return 0;
    }

    @Override
    public String toString() {
        return nome + " " + punti;
    }
}

public class Campionato {

    public static void main(String[] args) {
        List<Squadra> squadre = new ArrayList<>();
        squadre.add(new Squadra("Roma", 75));
        squadre.add(new Squadra("Inter", 80));
        squadre.add(new Squadra("Milan", 75));
        Collections.sort(squadre);
        System.out.println(squadre);
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: '[Inter 80, Milan 75, Roma 75]', msg: 'Deve stampare «[Inter 80, Milan 75, Roma 75]».', msgAr: 'يجب أن يطبع «[Inter 80, Milan 75, Roma 75]».' },
            { tipo: 'codice', re: 'Integer\\.compare', msg: 'Usa Integer.compare per i punti.', msgAr: 'استخدم Integer.compare للنقاط.' },
          ],
          soluzione: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class Squadra implements Comparable<Squadra> {

    private final String nome;
    private final int punti;

    public Squadra(String nome, int punti) {
        this.nome = nome;
        this.punti = punti;
    }

    @Override
    public int compareTo(Squadra altra) {
        int confronto = Integer.compare(altra.punti, punti);
        if (confronto == 0) {
            confronto = nome.compareTo(altra.nome);
        }
        return confronto;
    }

    @Override
    public String toString() {
        return nome + " " + punti;
    }
}

public class Campionato {

    public static void main(String[] args) {
        List<Squadra> squadre = new ArrayList<>();
        squadre.add(new Squadra("Roma", 75));
        squadre.add(new Squadra("Inter", 80));
        squadre.add(new Squadra("Milan", 75));
        Collections.sort(squadre);
        System.out.println(squadre);
    }
}`,
        },
        riepilogo: [
          { it: 'Comparable: ordine naturale con compareTo.', ar: 'Comparable: الترتيب الطبيعي عبر compareTo.' },
          { it: 'Comparator: ordini alternativi, combinabili con thenComparing e reversed.', ar: 'Comparator: ترتيبات بديلة قابلة للدمج بـ thenComparing و reversed.' },
          { it: 'Integer.compare invece di a - b.', ar: 'Integer.compare بدلاً من a - b.' },
        ],
      },
    ],
  };
  if (typeof module === 'object' && module.exports) module.exports = livello;
  else (root.CF_LIVELLI = root.CF_LIVELLI || []).push(livello);
})(typeof globalThis !== 'undefined' ? globalThis : this);
