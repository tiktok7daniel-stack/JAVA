/*
 * CodeForge — Simulazione d'esame: prova scritta (caccia all'errore, cosa stampa)
 * e prova orale (domande frequenti con risposta modello).
 */
(function (root) {
  'use strict';

  // Caccia all'errore: l'utente tocca la riga che viola la Buona Norma.
  const caccia = [
    {
      titolo: 'Incapsulamento',
      codice: `class Studente {
    private String nome;
    public double media;

    public Studente(String nome) {
        this.nome = nome;
    }
}`,
      riga: 3,
      it: 'L\'attributo media è public: viola l\'incapsulamento. Deve essere private con un metodo getMedia().',
      ar: 'الحقل media عام public وهذا يكسر مبدأ التغليف: يجب أن يكون private مع دالة getMedia().',
    },
    {
      titolo: 'Confronto tra stringhe',
      codice: `public class Login {
    public static void main(String[] args) {
        String password = leggiPassword();
        if (password == "segreta") {
            System.out.println("Accesso consentito");
        }
    }
}`,
      riga: 4,
      it: 'Le stringhe si confrontano con equals: "segreta".equals(password). Con == si confrontano i riferimenti.',
      ar: 'النصوص تُقارن بـ equals مثل "segreta".equals(password)، أما == فتقارن المراجع وقد تعطي false رغم تطابق النص.',
    },
    {
      titolo: 'Gestione delle eccezioni',
      codice: `public class Lettore {
    public void apri(String file) {
        try {
            leggiFile(file);
        } catch (IOException e) {
        }
        System.out.println("Fatto");
    }
}`,
      riga: 5,
      it: 'Il blocco catch è vuoto: l\'errore viene ignorato senza traccia. Va gestito o almeno segnalato.',
      ar: 'كتلة catch فارغة: يتم تجاهل الخطأ دون أي أثر. يجب معالجته أو على الأقل الإبلاغ عنه.',
    },
    {
      titolo: 'Convenzioni di denominazione',
      codice: `public class Cerchio {
    private static final double pi_greco = 3.14159;
    private double raggio;

    public double area() {
        return pi_greco * raggio * raggio;
    }
}`,
      riga: 2,
      it: 'Una costante static final si scrive in UPPER_SNAKE_CASE: PI_GRECO (meglio ancora: usare Math.PI).',
      ar: 'الثابت static final يُكتب بأسلوب UPPER_SNAKE_CASE أي PI_GRECO (والأفضل استخدام Math.PI).',
    },
    {
      titolo: 'Salti non strutturati',
      codice: `public static int cerca(int[] v, int x) {
    int pos = -1;
    for (int i = 0; i < v.length; i++) {
        if (v[i] == x) {
            pos = i;
            break;
        }
    }
    return pos;
}`,
      riga: 6,
      it: 'break dentro un ciclo è un salto non strutturato: usa while (i < v.length && pos == -1).',
      ar: 'استخدام break داخل حلقة قفزة غير مُهيكلة: استخدم while (i < v.length && pos == -1) بدلاً منها.',
    },
    {
      titolo: 'Condizioni booleane',
      codice: `public class Semaforo {
    private boolean verde;

    public void attraversa() {
        if (verde == true) {
            System.out.println("Puoi passare");
        }
    }
}`,
      riga: 5,
      it: 'Il confronto con true è ridondante: scrivi semplicemente if (verde).',
      ar: 'المقارنة مع true زائدة: اكتب ببساطة if (verde).',
    },
  ];

  // Cosa stampa questo codice?
  const output = [
    {
      titolo: 'Divisione intera',
      codice: `public class Main {
    public static void main(String[] args) {
        int a = 7;
        int b = 2;
        double c = a / b;
        System.out.println(c);
    }
}`,
      opzioni: ['3.5', '3.0', '3', 'Errore di compilazione'],
      corretta: 1,
      it: 'a / b è una divisione tra int → 3; poi il risultato viene convertito in double → 3.0.',
      ar: 'a / b قسمة بين عددين صحيحين فالنتيجة 3، ثم تُحوَّل إلى double فتصبح 3.0. الحل الصحيح: (double) a / b.',
    },
    {
      titolo: 'Concatenazione',
      codice: `public class Main {
    public static void main(String[] args) {
        System.out.println("Risultato: " + 2 + 3);
        System.out.println(2 + 3 + " punti");
    }
}`,
      opzioni: ['Risultato: 5 / 5 punti', 'Risultato: 23 / 5 punti', 'Risultato: 23 / 23 punti', 'Risultato: 5 / 23 punti'],
      corretta: 1,
      it: 'L\'espressione è valutata da sinistra: "Risultato: " + 2 diventa una String, quindi + 3 concatena. Nella seconda riga 2 + 3 = 5 è calcolato prima.',
      ar: 'التعبير يُقيَّم من اليسار: "Risultato: " + 2 يصبح نصاً، ثم + 3 دمج نصي فتظهر 23. في السطر الثاني 2 + 3 = 5 تُحسب أولاً ثم الدمج.',
    },
    {
      titolo: 'Aliasing',
      codice: `class Box {
    int valore;
}

public class Main {
    public static void main(String[] args) {
        Box a = new Box();
        a.valore = 1;
        Box b = a;
        b.valore = 5;
        System.out.println(a.valore);
    }
}`,
      opzioni: ['1', '5', '0', 'NullPointerException'],
      corretta: 1,
      it: 'b = a copia il riferimento: a e b puntano allo stesso oggetto nello Heap, quindi a.valore vale 5.',
      ar: 'b = a ينسخ المرجع فقط: a و b يشيران إلى نفس الكائن في الـHeap، لذلك قيمة a.valore أصبحت 5.',
    },
    {
      titolo: 'Polimorfismo',
      codice: `class Animale {
    public String verso() { return "..."; }
}

class Cane extends Animale {
    @Override
    public String verso() { return "Bau"; }
}

public class Main {
    public static void main(String[] args) {
        Animale a = new Cane();
        System.out.println(a.verso());
    }
}`,
      opzioni: ['...', 'Bau', 'Errore di compilazione', 'ClassCastException'],
      corretta: 1,
      it: 'Legame dinamico: il tipo statico è Animale, ma l\'oggetto reale è un Cane, quindi viene eseguito Cane.verso().',
      ar: 'الربط الديناميكي: النوع الساكن Animale لكن الكائن الحقيقي Cane، لذلك تُنفَّذ نسخة Cane من الدالة وتطبع Bau.',
    },
    {
      titolo: 'finally',
      codice: `public class Main {
    public static void main(String[] args) {
        try {
            System.out.println("A");
            int x = 10 / 0;
            System.out.println("B");
        } catch (ArithmeticException e) {
            System.out.println("C");
        } finally {
            System.out.println("D");
        }
    }
}`,
      opzioni: ['A B D', 'A C D', 'A C', 'A B C D'],
      corretta: 1,
      it: 'Dopo "A" la divisione per zero lancia ArithmeticException: "B" viene saltata, il catch stampa "C" e finally stampa sempre "D".',
      ar: 'بعد طباعة A تُرمى ArithmeticException فيُتخطى B، ثم تطبع catch الحرف C، وتطبع finally دائماً D.',
    },
    {
      titolo: 'Overloading',
      codice: `public class Main {
    static String f(int x) { return "int"; }
    static String f(double x) { return "double"; }

    public static void main(String[] args) {
        System.out.println(f(5) + " " + f(5.0) + " " + f('a'));
    }
}`,
      opzioni: ['int double int', 'int double double', 'int int int', 'Errore di compilazione'],
      corretta: 0,
      it: 'Il compilatore sceglie la firma più specifica: 5 → int, 5.0 → double, \'a\' (char) viene promosso a int.',
      ar: 'يختار المترجم التوقيع الأنسب: 5 → int و 5.0 → double، والحرف \'a\' (char) يُرقّى إلى int لأنه أقرب من double.',
    },
    {
      titolo: 'Confronto di stringhe',
      codice: `public class Main {
    public static void main(String[] args) {
        String s1 = "java";
        String s2 = new String("java");
        System.out.println(s1 == s2);
        System.out.println(s1.equals(s2));
    }
}`,
      opzioni: ['true / true', 'false / true', 'true / false', 'false / false'],
      corretta: 1,
      it: 'new String crea un nuovo oggetto: == confronta i riferimenti (false), equals il contenuto (true).',
      ar: 'new String تُنشئ كائناً جديداً: == تقارن المراجع فتعطي false، و equals تقارن المحتوى فتعطي true.',
    },
    {
      titolo: 'Scope e incremento',
      codice: `public class Main {
    public static void main(String[] args) {
        int i = 0;
        int somma = 0;
        while (i < 3) {
            somma += i++;
        }
        System.out.println(somma + " " + i);
    }
}`,
      opzioni: ['3 3', '6 3', '3 4', '0 3'],
      corretta: 0,
      it: 'i++ restituisce il valore prima dell\'incremento: somma = 0 + 1 + 2 = 3, e alla fine i vale 3.',
      ar: 'i++ تُعيد القيمة قبل الزيادة: somma = 0 + 1 + 2 = 3، وفي النهاية قيمة i تساوي 3.',
    },
  ];

  // Domande frequenti della prova orale
  const orale = [
    {
      d: 'Qual è la differenza tra overloading e overriding?',
      r: 'L\'overloading consiste nel definire nella stessa classe più metodi con lo stesso nome ma firme diverse; la scelta avviene a tempo di compilazione (legame statico). L\'overriding consiste nel ridefinire in una sottoclasse un metodo ereditato con la stessa firma; la scelta avviene a tempo di esecuzione in base al tipo dinamico dell\'oggetto (legame dinamico).',
      ar: 'التحميل الزائد (overloading): عدة دوال بنفس الاسم وتواقيع مختلفة في نفس الصنف، ويختار المترجم بينها وقت الترجمة. إعادة التعريف (overriding): كتابة دالة موروثة من جديد في الصنف الفرعي بنفس التوقيع، وتختار JVM النسخة وقت التشغيل حسب نوع الكائن الحقيقي.',
      chiave: ['firma', 'tempo di compilazione', 'legame dinamico'],
    },
    {
      d: 'Qual è la differenza tra eccezioni controllate e non controllate?',
      r: 'Le eccezioni controllate (checked) estendono Exception ma non RuntimeException: il compilatore obbliga a gestirle con try-catch o a dichiararle con throws, e rappresentano situazioni anomale esterne e prevedibili, come IOException. Le non controllate (unchecked) estendono RuntimeException, non devono essere dichiarate e indicano di solito errori di programmazione, come NullPointerException o IndexOutOfBoundsException.',
      ar: 'المُراقَبة (checked) ترث Exception وليس RuntimeException، والمترجم يُلزم بمعالجتها أو إعلانها، وتمثل مشاكل خارجية متوقعة مثل IOException. غير المُراقَبة (unchecked) ترث RuntimeException، لا يلزم إعلانها، وتدل غالباً على أخطاء برمجية مثل NullPointerException.',
      chiave: ['Exception', 'RuntimeException', 'throws'],
    },
    {
      d: 'Che differenza c\'è tra Stack e Heap?',
      r: 'Lo Stack contiene i record di attivazione dei metodi in esecuzione, con parametri e variabili locali; è gestito in modo LIFO e ogni frame viene rimosso al termine del metodo. Lo Heap contiene gli oggetti creati con new, che sopravvivono finché esiste un riferimento a essi; la memoria non più raggiungibile viene liberata dal Garbage Collector.',
      ar: 'الـStack يحتوي على إطارات الدوال قيد التنفيذ مع معاملاتها ومتغيراتها المحلية، ويعمل بمبدأ LIFO ويُزال الإطار عند انتهاء الدالة. الـHeap يحتوي على الكائنات المُنشأة بـ new والتي تبقى ما دام هناك مرجع إليها، ويحرر جامع القمامة ما لا يمكن الوصول إليه.',
      chiave: ['record di attivazione', 'LIFO', 'Garbage Collector'],
    },
    {
      d: 'Che cos\'è l\'incapsulamento e perché è importante?',
      r: 'L\'incapsulamento è il principio per cui lo stato di un oggetto è nascosto dichiarando gli attributi private e reso accessibile solo tramite metodi pubblici. In questo modo la classe controlla la validità dei dati, può modificare la propria implementazione interna senza impatti sui client e riduce gli errori.',
      ar: 'التغليف مبدأ يُخفي حالة الكائن بجعل الحقول private وإتاحتها فقط عبر دوال عامة. هكذا يتحكم الصنف في صحة البيانات، ويمكنه تغيير تنفيذه الداخلي دون التأثير على من يستخدمه، وتقل الأخطاء.',
      chiave: ['private', 'metodi pubblici', 'validità'],
    },
    {
      d: 'Qual è la differenza tra classe astratta e interfaccia?',
      r: 'Una classe astratta può avere attributi, costruttori e metodi sia concreti sia astratti, e una classe può estenderne una sola. Un\'interfaccia definisce un contratto di metodi, non ha stato di istanza né costruttori, e una classe può implementarne molte. Si usa la classe astratta per condividere codice tra classi simili e l\'interfaccia per descrivere una capacità.',
      ar: 'الصنف المجرد يمكن أن يحتوي على حقول ومُنشئات ودوال ملموسة ومجردة، ويمكن الوراثة من صنف واحد فقط. الواجهة تحدد عقداً من الدوال بلا حالة ولا مُنشئات، ويمكن للصنف تطبيق عدة واجهات. نستخدم الصنف المجرد لمشاركة الكود والواجهة لوصف قدرة.',
      chiave: ['extends', 'implements', 'contratto'],
    },
    {
      d: 'Perché le stringhe si confrontano con equals e non con ==?',
      r: 'Perché String è una classe e le variabili contengono riferimenti: l\'operatore == confronta gli indirizzi degli oggetti, mentre equals, ridefinito in String, confronta il contenuto carattere per carattere. Due stringhe con lo stesso testo possono essere oggetti diversi nello Heap.',
      ar: 'لأن String صنف والمتغيرات تحمل مراجع: المعامل == يقارن عناوين الكائنات، أما equals (المُعاد تعريفها في String) فتقارن المحتوى حرفاً بحرف. نصّان بنفس الكلمات قد يكونان كائنين مختلفين في الـHeap.',
      chiave: ['riferimenti', 'contenuto', 'Heap'],
    },
    {
      d: 'Che cos\'è il polimorfismo?',
      r: 'Il polimorfismo è la capacità di un riferimento di un tipo generale, come una superclasse o un\'interfaccia, di riferirsi a oggetti di sottotipi diversi. Invocando un metodo, grazie al legame dinamico viene eseguita la versione ridefinita nella classe reale dell\'oggetto.',
      ar: 'تعدد الأشكال هو قدرة مرجع من نوع عام (صنف أب أو واجهة) على الإشارة إلى كائنات من أنواع فرعية مختلفة. وعند استدعاء دالة، وبفضل الربط الديناميكي، تُنفَّذ النسخة المُعاد تعريفها في الصنف الحقيقي للكائن.',
      chiave: ['superclasse', 'legame dinamico', 'ridefinita'],
    },
    {
      d: 'A cosa serve il costruttore e cosa succede se non lo scrivo?',
      r: 'Il costruttore inizializza lo stato di un nuovo oggetto subito dopo l\'allocazione nello Heap; ha lo stesso nome della classe e non ha tipo di ritorno. Se non se ne definisce nessuno, il compilatore fornisce un costruttore di default senza parametri; se invece se ne definisce almeno uno, il costruttore di default non viene più generato.',
      ar: 'المُنشئ يهيّئ حالة الكائن الجديد بعد حجزه في الـHeap مباشرة، ويحمل اسم الصنف ولا نوع إرجاع له. إذا لم نكتب أي مُنشئ يضيف المترجم مُنشئاً افتراضياً بلا معاملات، وإذا كتبنا واحداً على الأقل لا يُضاف الافتراضي.',
      chiave: ['inizializza', 'default', 'tipo di ritorno'],
    },
    {
      d: 'Cosa significa la parola chiave static?',
      r: 'Un membro static appartiene alla classe e non alle singole istanze: un attributo static è condiviso da tutti gli oggetti ed esiste in una sola copia, mentre un metodo static può essere invocato senza creare oggetti e non può usare this né accedere direttamente agli attributi d\'istanza.',
      ar: 'العضو static ينتمي إلى الصنف وليس إلى الكائنات: الحقل الساكن نسخة واحدة يتشاركها الجميع، والدالة الساكنة تُستدعى بدون إنشاء كائن ولا يمكنها استخدام this أو الوصول مباشرة إلى حقول الكائن.',
      chiave: ['classe', 'istanze', 'this'],
    },
    {
      d: 'Perché non si devono usare le eccezioni per controllare il flusso?',
      r: 'Perché le eccezioni rappresentano situazioni eccezionali: usarle per il flusso normale rende il codice meno leggibile, più lento, dato che creare un\'eccezione e il suo stack trace è costoso, e può nascondere errori reali. Le situazioni prevedibili vanno gestite con condizioni, ad esempio controllando gli indici o i riferimenti null.',
      ar: 'لأن الاستثناءات مخصصة للحالات الاستثنائية: استخدامها للسير الطبيعي يجعل الكود أقل وضوحاً وأبطأ (إنشاء الاستثناء ومسار الاستدعاءات مكلف)، وقد يُخفي أخطاء حقيقية. الحالات المتوقعة تُعالج بالشروط مثل فحص الفهارس أو null.',
      chiave: ['eccezionali', 'leggibile', 'condizioni'],
    },
  ];

  const data = { caccia, output, orale };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CF_ESAME = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
