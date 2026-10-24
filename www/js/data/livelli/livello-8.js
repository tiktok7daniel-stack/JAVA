/* CodeForge — Livello 8: Progetti Finali e Simulazione d'Esame (Ingegnere Java 30 e Lode). */
(function (root) {
  'use strict';
  const livello = {
    numero: 8, id: 'L8', colore: '#F85149', icona: 'trophy',
    titolo: 'Progetti Finali e Simulazione d\'Esame', titoloAr: 'المشاريع النهائية ومحاكاة الامتحان',
    grado: 'Ingegnere Java 30 e Lode', gradoAr: 'مهندس Java بدرجة 30 مع مرتبة الشرف',
    descr: 'Progetti completi che uniscono tutto il percorso: sistema bancario, gestione degli esami universitari e simulazione dell\'esame di Programmazione.',
    lezioni: [
      {
        id: 'l36', titolo: 'Progetto: sistema bancario completo', durata: '25 min',
        obiettivi: ['Progettare una gerarchia di conti con classe astratta', 'Gestire gli errori con eccezioni personalizzate', 'Usare collezioni e polimorfismo insieme'],
        teoria: [
          {
            it: 'Un progetto reale si progetta partendo dai concetti del dominio, che diventano classi, e dalle loro relazioni.',
            t: 'Analisi del dominio', ar: 'يُصمَّم المشروع الحقيقي انطلاقاً من مفاهيم المجال التي تصبح أصنافاً، ومن العلاقات بينها.',
            ex: 'في البنك: "الحساب" مفهوم عام (صنف مجرد `Conto`)، والحساب الجاري والحساب الادخاري نوعان منه (وراثة). و"البنك" يحتوي حسابات (تركيب: `Map<String, Conto>`). الأسماء في نص المسألة تصبح أصنافاً، والأفعال تصبح دوالاً.',
            bn: 'Prima progetta (classi, attributi, relazioni), poi scrivi il codice.', bnAr: 'صمّم أولاً (الأصناف والخصائص والعلاقات) ثم اكتب الكود.',
          },
          {
            it: 'Il conto corrente ammette uno scoperto fino a un fido, mentre il conto di risparmio non può andare in negativo ma matura interessi.',
            t: 'Regole di business', ar: 'الحساب الجاري يسمح بالسحب على المكشوف حتى حدّ معين، أما حساب الادخار فلا يمكن أن يصبح سالباً لكنه يُنتج فوائد.',
            ex: 'كل صنف فرعي يعيد تعريف `disponibile()` بطريقته، والدالة `preleva()` في الأب تستخدمها (نمط الدالة القالب). هكذا تبقى قاعدة السحب مكتوبة في مكان واحد.',
            bn: 'Le regole che cambiano tra sottoclassi vanno in metodi ridefiniti, non in if sul tipo.', bnAr: 'القواعد التي تختلف بين الأصناف الفرعية مكانها دوال معاد تعريفها وليس if على النوع.',
          },
          {
            it: 'Le operazioni non valide, come un prelievo oltre il disponibile, vengono segnalate con eccezioni personalizzate che il chiamante gestisce.',
            t: 'Eccezioni di dominio', ar: 'العمليات غير الصالحة مثل السحب فوق المتاح يُبلَّغ عنها باستثناءات مخصصة يعالجها المستدعي.',
            ex: '`FondiInsufficientiException` (مفحوص) يُجبر كل من يسحب على التفكير في حالة الفشل. والتحويل بين حسابين يجب أن يكون "ذرياً": إن فشل السحب لا يحدث الإيداع.',
            bn: 'Un\'operazione fallita non deve lasciare lo stato a metà.', bnAr: 'العملية الفاشلة يجب ألا تترك الحالة في منتصف الطريق.',
          },
        ],
        analogia: {
          titolo: 'L\'agenzia bancaria',
          it: 'La banca è l\'agenzia, i conti sono i fascicoli dei clienti; ogni tipo di conto ha le sue regole, ma tutti passano dallo stesso sportello.',
          ar: 'البنك مثل فرع مصرفي، والحسابات ملفات العملاء في الأدراج (الخريطة بالـIBAN). لكل نوع حساب قواعده الخاصة (حدّ المكشوف، الفوائد)، لكن كل العمليات تمرّ عبر نفس الشبّاك (الدوال العامة). وإن رُفضت عملية يعطيك الموظف ورقة رسمية بالسبب (الاستثناء المخصص) بدلاً من أن يصمت.',
        },
        esempio: {
          file: 'BancaApp.java',
          codice: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class FondiInsufficientiException extends Exception {

    public FondiInsufficientiException(String iban, double richiesto) {
        super("Conto " + iban + ": fondi insufficienti per " + richiesto);
    }
}

abstract class Conto {

    private final String iban;
    private final String titolare;
    private double saldo;
    private final List<String> movimenti = new ArrayList<>();

    protected Conto(String iban, String titolare) {
        this.iban = iban;
        this.titolare = titolare;
    }

    public abstract double disponibile();

    public void deposita(double importo) {
        if (importo <= 0) {
            throw new IllegalArgumentException("Importo non valido");
        }
        saldo += importo;
        movimenti.add("+" + importo);
    }

    public void preleva(double importo) throws FondiInsufficientiException {
        if (importo > disponibile()) {
            throw new FondiInsufficientiException(iban, importo);
        }
        saldo -= importo;
        movimenti.add("-" + importo);
    }

    public String getIban() {
        return iban;
    }

    public double getSaldo() {
        return saldo;
    }

    public List<String> getMovimenti() {
        return movimenti;
    }

    @Override
    public String toString() {
        return String.format("%s (%s) saldo %.2f", iban, titolare, saldo);
    }
}

class ContoCorrente extends Conto {

    private final double fido;

    public ContoCorrente(String iban, String titolare, double fido) {
        super(iban, titolare);
        this.fido = fido;
    }

    @Override
    public double disponibile() {
        return getSaldo() + fido;
    }
}

class ContoRisparmio extends Conto {

    private final double tasso;

    public ContoRisparmio(String iban, String titolare, double tasso) {
        super(iban, titolare);
        this.tasso = tasso;
    }

    @Override
    public double disponibile() {
        return getSaldo();
    }

    public void maturaInteressi() {
        deposita(getSaldo() * tasso);
    }
}

class Banca {

    private final Map<String, Conto> conti = new HashMap<>();

    public void apri(Conto conto) {
        conti.put(conto.getIban(), conto);
    }

    public void bonifico(String da, String a, double importo) throws FondiInsufficientiException {
        Conto origine = conti.get(da);
        Conto destinazione = conti.get(a);
        origine.preleva(importo);
        destinazione.deposita(importo);
    }

    public double patrimonio() {
        double totale = 0;
        for (Conto c : conti.values()) {
            totale += c.getSaldo();
        }
        return totale;
    }
}

public class BancaApp {

    public static void main(String[] args) {
        Banca banca = new Banca();
        ContoCorrente cc = new ContoCorrente("IT01", "Rossi", 500);
        ContoRisparmio cr = new ContoRisparmio("IT02", "Rossi", 0.02);
        banca.apri(cc);
        banca.apri(cr);
        cc.deposita(1000);
        cr.deposita(2000);
        try {
            banca.bonifico("IT01", "IT02", 1300);
            System.out.println("Bonifico 1 eseguito");
            banca.bonifico("IT02", "IT01", 5000);
            System.out.println("Bonifico 2 eseguito");
        } catch (FondiInsufficientiException e) {
            System.out.println("Rifiutato: " + e.getMessage());
        }
        cr.maturaInteressi();
        System.out.println(cc);
        System.out.println(cr);
        System.out.println("Movimenti IT02: " + cr.getMovimenti());
        System.out.printf("Patrimonio della banca: %.2f%n", banca.patrimonio());
    }
}`,
          note: [
            ['public abstract double disponibile();', { t: 'Regola specializzata', ar: 'قاعدة متخصصة', ex: 'كل نوع حساب يحدد ما هو متاح للسحب: الجاري مع حدّ المكشوف، والادخاري بلا مكشوف.' }],
            ['if (importo > disponibile()) {', { t: 'Template method + binding dinamico', ar: 'الدالة القالب مع الربط الديناميكي', ex: 'نفس الدالة preleva تعمل للنوعين، والربط الديناميكي يختار disponibile() المناسبة.' }],
            ['origine.preleva(importo);\n        destinazione.deposita(importo);', { t: 'Atomicità', ar: 'الذرية', ex: 'إن رمى preleva استثناءً لا يُنفَّذ الإيداع: لا يُخلق المال من العدم.' }],
          ],
        },
        norma: {
          it: 'Classe astratta per il concetto comune, regole specifiche nelle sottoclassi, eccezioni checked per gli errori di business e operazioni atomiche.',
          ar: 'صنف مجرد للمفهوم المشترك، والقواعد الخاصة في الأصناف الفرعية، واستثناءات مفحوصة لأخطاء الأعمال، وعمليات ذرية.',
        },
        quiz: [
          {
            d: 'ContoCorrente con saldo 100 e fido 500: un prelievo di 550 va a buon fine?', dAr: 'حساب جارٍ رصيده 100 وحدّ مكشوفه 500: هل ينجح سحب 550؟',
            opzioni: ['No, il saldo è 100', 'Sì, il disponibile è 600', 'Sì, ma lancia un\'eccezione', 'Dipende dal tasso'], corretta: 1,
            it: 'disponibile() = saldo + fido = 600 ≥ 550, quindi il prelievo riesce e il saldo diventa -450.',
            ar: 'المتاح = الرصيد + حدّ المكشوف = 600 وهو أكبر من 550، فينجح السحب ويصبح الرصيد -450.',
          },
          {
            d: 'Nel bonifico, perché si chiama preleva prima di deposita?', dAr: 'لماذا نستدعي preleva قبل deposita في التحويل؟',
            opzioni: ['Per velocità', 'Se il prelievo fallisce, l\'eccezione impedisce il deposito e i saldi restano coerenti', 'È indifferente', 'Perché deposita è static'], corretta: 1,
            it: 'L\'eccezione interrompe il metodo prima del deposito: nessun denaro viene creato dal nulla.',
            ar: 'الاستثناء يوقف الدالة قبل الإيداع، فلا يُخلق مال من العدم.',
          },
        ],
        costruisci: {
          consegna: 'Completa la gerarchia: classe astratta, ridefinizione e lancio dell\'eccezione.',
          consegnaAr: 'أكمل الهرمية: الصنف المجرد وإعادة التعريف ورمي الاستثناء.',
          codice: `class LimiteSuperatoException extends Exception {

    public LimiteSuperatoException(String messaggio) {
        super(messaggio);
    }
}

⟦abstract⟧ class Carta {

    protected double speso;

    public abstract double limite();

    public void paga(double importo) ⟦throws⟧ LimiteSuperatoException {
        if (speso + importo > limite()) {
            ⟦throw⟧ new LimiteSuperatoException("Limite di " + limite() + " superato");
        }
        speso += importo;
    }
}

class CartaOro extends Carta {

    private static final double LIMITE_ORO = 5000;

    ⟦@Override⟧
    public double limite() {
        return LIMITE_ORO;
    }
}

public class Pagamenti {

    public static void main(String[] args) {
        Carta carta = new CartaOro();
        try {
            carta.paga(3000);
            carta.paga(2500);
        } catch (LimiteSuperatoException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
          output: 'Limite di 5000.0 superato\n',
        },
        laboratorio: {
          titolo: 'Estratto conto',
          consegna: 'Aggiungi a Banca il metodo List<String> contiInRosso() che restituisce, ordinati, gli IBAN dei conti con saldo negativo (usa uno stream con filter, map, sorted e collect). Il main deve stampare «In rosso: [IT03, IT07]».',
          consegnaAr: 'أضف إلى Banca الدالة List<String> contiInRosso() التي تُعيد، مرتّبة، أرقام IBAN للحسابات ذات الرصيد السالب (استخدم stream مع filter و map و sorted و collect). يجب أن يطبع main «In rosso: [IT03, IT07]».',
          codice: `import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

class Conto {

    private final String iban;
    private final double saldo;

    public Conto(String iban, double saldo) {
        this.iban = iban;
        this.saldo = saldo;
    }

    public String getIban() {
        return iban;
    }

    public double getSaldo() {
        return saldo;
    }
}

class Banca {

    private final Map<String, Conto> conti = new HashMap<>();

    public void apri(Conto c) {
        conti.put(c.getIban(), c);
    }

    // contiInRosso()
}

public class Estratto {

    public static void main(String[] args) {
        Banca b = new Banca();
        b.apri(new Conto("IT07", -20));
        b.apri(new Conto("IT01", 300));
        b.apri(new Conto("IT03", -150));
        System.out.println("In rosso: " + b.contiInRosso());
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'In rosso: [IT03, IT07]', msg: 'Deve stampare «In rosso: [IT03, IT07]».', msgAr: 'يجب أن يطبع «In rosso: [IT03, IT07]».' },
            { tipo: 'codice', re: '\\.stream\\s*\\(\\s*\\)', msg: 'Usa uno stream sui conti.', msgAr: 'استخدم stream على الحسابات.' },
            { tipo: 'codice', re: 'sorted\\s*\\(', msg: 'Ordina gli IBAN con sorted().', msgAr: 'رتّب أرقام IBAN بـ sorted().' },
          ],
          soluzione: `import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

class Conto {

    private final String iban;
    private final double saldo;

    public Conto(String iban, double saldo) {
        this.iban = iban;
        this.saldo = saldo;
    }

    public String getIban() {
        return iban;
    }

    public double getSaldo() {
        return saldo;
    }
}

class Banca {

    private final Map<String, Conto> conti = new HashMap<>();

    public void apri(Conto c) {
        conti.put(c.getIban(), c);
    }

    public List<String> contiInRosso() {
        return conti.values().stream()
                .filter(c -> c.getSaldo() < 0)
                .map(Conto::getIban)
                .sorted()
                .collect(Collectors.toList());
    }
}

public class Estratto {

    public static void main(String[] args) {
        Banca b = new Banca();
        b.apri(new Conto("IT07", -20));
        b.apri(new Conto("IT01", 300));
        b.apri(new Conto("IT03", -150));
        System.out.println("In rosso: " + b.contiInRosso());
    }
}`,
        },
        riepilogo: [
          { it: 'Dominio → classi; «è un» → ereditarietà; «ha un» → composizione.', ar: 'المجال ← أصناف؛ "هو نوع من" ← وراثة؛ "يملك" ← تركيب.' },
          { it: 'Regole variabili nei metodi ridefiniti, codice comune nel padre astratto.', ar: 'القواعد المتغيرة في الدوال المعاد تعريفها والكود المشترك في الأب المجرد.' },
          { it: 'Eccezioni di dominio e operazioni atomiche.', ar: 'استثناءات المجال والعمليات الذرية.' },
        ],
      },
      {
        id: 'l37', titolo: 'Progetto: gestione esami universitari e voto di laurea', durata: '25 min',
        obiettivi: ['Modellare Studente, Esame e Libretto', 'Calcolare la media ponderata sui CFU', 'Calcolare la base del voto di laurea in 110'],
        teoria: [
          {
            it: 'Nel sistema universitario italiano ogni esame ha un voto da 18 a 30, eventualmente con lode, e un peso in crediti formativi (CFU).',
            t: 'Voti e CFU', ar: 'في النظام الجامعي الإيطالي لكل امتحان درجة من 18 إلى 30، وقد تكون مع مرتبة الشرف (lode)، ووزن بالوحدات الدراسية (CFU).',
            ex: 'امتحان "التحليل" بـ 12 CFU يزن ضعف امتحان بـ 6 CFU. الـlode تُسجَّل كعلامة إضافية (`boolean lode`)، وتُحسب عادة في المعدل كـ 30 (بعض الجامعات تحسبها 31 أو 33).',
            bn: 'Rappresenta la lode con un boolean separato, non con il numero 31.', bnAr: 'مثّل الـlode بمتغير boolean منفصل وليس بالرقم 31.',
          },
          {
            it: 'La media ponderata si calcola sommando voto per CFU di ogni esame e dividendo per il totale dei CFU.',
            t: 'Media ponderata', ar: 'المعدل الموزون يُحسب بجمع (الدرجة × الوحدات) لكل امتحان ثم القسمة على مجموع الوحدات.',
            ex: 'مثال: 30 في 12 CFU و 24 في 6 CFU ← (30×12 + 24×6) / 18 = 504 / 18 = 28.0، بينما المعدل الحسابي البسيط 27.0. الجامعات الإيطالية تستخدم الموزون دائماً.',
            bn: 'Calcola la media in double e controlla la divisione per zero (libretto vuoto).', bnAr: 'احسب المعدل بنوع double وافحص القسمة على صفر (سجل فارغ).',
          },
          {
            it: 'La base del voto di laurea si ottiene convertendo la media ponderata in centodecimi: media × 110 / 30.',
            t: 'Voto di laurea (base in 110)', ar: 'أساس درجة التخرج يُحسب بتحويل المعدل الموزون إلى مقياس 110: المعدل × 110 / 30.',
            ex: 'معدل 28.0 ← 28 × 110 / 30 = 102.67. تضيف اللجنة نقاطاً على الأطروحة، وإن تجاوز المجموع 110 قد تُمنح "110 e lode". في المشروع نحسب الأساس فقط ونقرّبه.',
            bn: 'Isola le formule in metodi con nomi chiari (mediaPonderata, baseLaurea).', bnAr: 'اعزل المعادلات في دوال بأسماء واضحة (mediaPonderata، baseLaurea).',
          },
        ],
        analogia: {
          titolo: 'Il libretto universitario',
          it: 'Il Libretto è il quaderno blu dello studente: ogni riga è un Esame con voto e crediti, e la segreteria lo usa per calcolare la media.',
          ar: 'الـ`Libretto` مثل دفتر العلامات الجامعي الأزرق: كل سطر فيه امتحان (`Esame`) بدرجته ووحداته وتاريخه. والأمانة (الدوال) تستخدمه لحساب المعدل الموزون. والامتحان الثقيل (12 وحدة) مثل مادة رئيسية تؤثر في المعدل أكثر من مادة صغيرة (6 وحدات).',
        },
        esempio: {
          file: 'Segreteria.java',
          codice: `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

class Esame {

    private static final int VOTO_MINIMO = 18;
    private static final int VOTO_MASSIMO = 30;

    private final String corso;
    private final int voto;
    private final int cfu;
    private final boolean lode;

    public Esame(String corso, int voto, int cfu, boolean lode) {
        if (voto < VOTO_MINIMO || voto > VOTO_MASSIMO) {
            throw new IllegalArgumentException("Voto non valido: " + voto);
        }
        if (lode && voto != VOTO_MASSIMO) {
            throw new IllegalArgumentException("La lode richiede 30");
        }
        this.corso = corso;
        this.voto = voto;
        this.cfu = cfu;
        this.lode = lode;
    }

    public String getCorso() {
        return corso;
    }

    public int getVoto() {
        return voto;
    }

    public int getCfu() {
        return cfu;
    }

    @Override
    public String toString() {
        return corso + " " + voto + (lode ? " e lode" : "") + " (" + cfu + " CFU)";
    }
}

class Libretto {

    private static final double SCALA_LAUREA = 110.0;
    private static final double SCALA_ESAMI = 30.0;

    private final List<Esame> esami = new ArrayList<>();

    public void registra(Esame esame) {
        esami.add(esame);
    }

    public int totaleCfu() {
        int totale = 0;
        for (Esame e : esami) {
            totale += e.getCfu();
        }
        return totale;
    }

    public double mediaPonderata() {
        if (esami.isEmpty()) {
            return 0;
        }
        double somma = 0;
        for (Esame e : esami) {
            somma += e.getVoto() * e.getCfu();
        }
        return somma / totaleCfu();
    }

    public double baseLaurea() {
        return mediaPonderata() * SCALA_LAUREA / SCALA_ESAMI;
    }

    public Esame migliore() {
        return esami.stream().max(Comparator.comparing(Esame::getVoto)).orElse(null);
    }
}

class Studente {

    private final String nome;
    private final int matricola;
    private final Libretto libretto = new Libretto();

    public Studente(String nome, int matricola) {
        this.nome = nome;
        this.matricola = matricola;
    }

    public Libretto getLibretto() {
        return libretto;
    }

    @Override
    public String toString() {
        return nome + " [" + matricola + "]";
    }
}

public class Segreteria {

    public static void main(String[] args) {
        Studente s = new Studente("Giulia Verdi", 902345);
        Libretto l = s.getLibretto();
        l.registra(new Esame("Analisi I", 30, 12, true));
        l.registra(new Esame("Programmazione", 28, 12, false));
        l.registra(new Esame("Fisica", 24, 6, false));
        try {
            l.registra(new Esame("Chimica", 16, 6, false));
        } catch (IllegalArgumentException e) {
            System.out.println("Registrazione rifiutata: " + e.getMessage());
        }
        System.out.println(s + " - CFU: " + l.totaleCfu());
        System.out.printf("Media ponderata: %.2f%n", l.mediaPonderata());
        System.out.printf("Base di laurea: %.2f/110%n", l.baseLaurea());
        System.out.println("Esame migliore: " + l.migliore());
    }
}`,
          note: [
            ['if (lode && voto != VOTO_MASSIMO) {', { t: 'Invariante', ar: 'ثابت الصنف', ex: 'لا توجد lode إلا مع 30: الكائن يرفض أن يولد في حالة غير صالحة.' }],
            ['somma += e.getVoto() * e.getCfu();', { t: 'Media ponderata', ar: 'المعدل الموزون', ex: '30×12 + 28×12 + 24×6 = 840، والمجموع 30 CFU، فالمعدل 28.0.' }],
            ['private final Libretto libretto = new Libretto();', { t: 'Composizione', ar: 'التركيب', ex: 'الطالب "يملك" سجلاً: علاقة has-a وليست وراثة.' }],
          ],
          normaAmmesse: ['eccezioni-flusso'],
        },
        norma: {
          it: 'Invarianti verificati nel costruttore, composizione per le relazioni «ha un», formule isolate in metodi e costanti per le scale (30, 110).',
          ar: 'الثوابت يُتحقق منها في المُنشئ، والتركيب لعلاقات "يملك"، والمعادلات معزولة في دوال، وثوابت للمقاييس (30، 110).',
        },
        quiz: [
          {
            d: 'Esami: 30 (6 CFU) e 20 (12 CFU). Qual è la media ponderata?', dAr: 'امتحانان: 30 (6 وحدات) و 20 (12 وحدة). ما المعدل الموزون؟',
            opzioni: ['25.0', '23.33', '26.67', '20.0'], corretta: 1,
            it: '(30×6 + 20×12) / 18 = 420 / 18 ≈ 23.33: pesa di più l\'esame da 12 CFU.',
            ar: '(30×6 + 20×12) / 18 = 420 / 18 ≈ 23.33، فالامتحان ذو الـ12 وحدة يزن أكثر.',
          },
          {
            d: 'Tra Studente e Libretto quale relazione è corretta?', dAr: 'أي علاقة صحيحة بين Studente و Libretto؟',
            opzioni: ['Studente extends Libretto', 'Libretto extends Studente', 'Studente ha un Libretto (composizione)', 'Nessuna relazione'], corretta: 2,
            it: 'Uno studente non «è un» libretto: lo possiede. Si usa un attributo, non l\'ereditarietà.',
            ar: 'الطالب ليس "نوعاً من" السجل بل يملكه، لذلك نستخدم خاصية وليس وراثة.',
          },
        ],
        costruisci: {
          consegna: 'Completa il calcolo della media ponderata e della base di laurea.',
          consegnaAr: 'أكمل حساب المعدل الموزون وأساس درجة التخرج.',
          codice: `public class Laurea {

    private static final double SCALA_LAUREA = 110.0;
    private static final double SCALA_ESAMI = 30.0;

    public static void main(String[] args) {
        int[] voti = {27, 30, 24};
        int[] cfu = {9, 12, 6};
        double somma = 0;
        int totaleCfu = 0;
        for (int i = 0; i < voti.length; i++) {
            somma += voti[i] ⟦*⟧ cfu[i];
            totaleCfu ⟦+=⟧ cfu[i];
        }
        double media = somma / ⟦totaleCfu⟧;
        double base = media * SCALA_LAUREA / ⟦SCALA_ESAMI⟧;
        System.out.printf("Media %.2f, base %.2f%n", media, base);
    }
}`,
          output: 'Media 27,67, base 101,44\n',
        },
        laboratorio: {
          titolo: 'Esami da file',
          consegna: 'Il file libretto.txt contiene righe «corso;voto;cfu». Leggilo con try-with-resources, ignora le righe con voto fuori da 18-30 contandole come scartate, e stampa «Esami validi: N», «Scartati: M» e «Media ponderata: X» (con %.2f).',
          consegnaAr: 'يحتوي الملف libretto.txt على أسطر بالشكل «corso;voto;cfu». اقرأه بـ try-with-resources، وتجاهل الأسطر ذات الدرجة خارج 18-30 مع عدّها كمرفوضة، واطبع «Esami validi: N» و «Scartati: M» و «Media ponderata: X» (بتنسيق %.2f).',
          files: { 'libretto.txt': 'Analisi;28;12\nFisica;15;6\nAlgebra;30;6\nBasi di dati;26;9\n' },
          codice: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class LibrettoFile {

    private static final int VOTO_MINIMO = 18;
    private static final int VOTO_MASSIMO = 30;

    public static void main(String[] args) {
        // leggi libretto.txt

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Esami validi: 3\nScartati: 1\nMedia ponderata: 27,78', msg: 'Output atteso: 3 validi, 1 scartato, media 27,78.', msgAr: 'المخرجات المتوقعة: 3 صالحة، 1 مرفوض، والمعدل 27,78.' },
            { tipo: 'codice', re: 'try\\s*\\(\\s*BufferedReader', msg: 'Usa try-with-resources con BufferedReader.', msgAr: 'استخدم try-with-resources مع BufferedReader.' },
            { tipo: 'norma', msg: 'Nessun errore di Buona Norma.', msgAr: 'لا أخطاء في قواعد البرمجة الجيدة.' },
          ],
          soluzione: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class LibrettoFile {

    private static final int VOTO_MINIMO = 18;
    private static final int VOTO_MASSIMO = 30;

    public static void main(String[] args) {
        int validi = 0;
        int scartati = 0;
        double somma = 0;
        int totaleCfu = 0;
        try (BufferedReader in = new BufferedReader(new FileReader("libretto.txt"))) {
            String riga = in.readLine();
            while (riga != null) {
                String[] campi = riga.split(";");
                int voto = Integer.parseInt(campi[1]);
                int cfu = Integer.parseInt(campi[2]);
                if (voto >= VOTO_MINIMO && voto <= VOTO_MASSIMO) {
                    validi++;
                    somma += voto * cfu;
                    totaleCfu += cfu;
                } else {
                    scartati++;
                }
                riga = in.readLine();
            }
        } catch (IOException e) {
            System.out.println("Errore di lettura: " + e.getMessage());
        }
        System.out.println("Esami validi: " + validi);
        System.out.println("Scartati: " + scartati);
        System.out.printf("Media ponderata: %.2f%n", somma / totaleCfu);
    }
}`,
        },
        riepilogo: [
          { it: 'Media ponderata = Σ(voto × CFU) / Σ CFU.', ar: 'المعدل الموزون = مجموع (الدرجة × الوحدات) / مجموع الوحدات.' },
          { it: 'Base di laurea = media × 110 / 30.', ar: 'أساس درجة التخرج = المعدل × 110 / 30.' },
          { it: 'Studente ha un Libretto che contiene Esami: composizione.', ar: 'الطالب يملك سجلاً يحتوي امتحانات: تركيب.' },
        ],
      },
      {
        id: 'l38', titolo: 'Simulazione completa dell\'esame di Programmazione', durata: '40 min',
        obiettivi: ['Affrontare la prova scritta (tracciamento del codice)', 'Superare la prova al calcolatore', 'Prepararsi alla prova orale e ottenere il voto finale in trentesimi'],
        teoria: [
          {
            it: 'L\'esame di Programmazione in Italia comprende di solito una prova scritta, una prova pratica al calcolatore e una prova orale.',
            t: 'Struttura dell\'esame', ar: 'امتحان البرمجة في إيطاليا يتضمن عادة اختباراً كتابياً، واختباراً عملياً على الحاسوب، واختباراً شفهياً.',
            ex: 'الكتابي: "ماذا يطبع هذا الكود؟" وأسئلة نظرية. العملي: كتابة برنامج يُترجم ويعمل ويحترم قواعد الكتابة الجيدة. الشفهي: شرح المفاهيم (Stack/Heap، الوراثة، الاستثناءات) والدفاع عن الكود. الدرجة النهائية من 30، والنجاح من 18.',
            bn: 'All\'esame il codice che non compila vale zero: compila spesso.', bnAr: 'في الامتحان الكود الذي لا يُترجم قيمته صفر، فترجم كثيراً.',
          },
          {
            it: 'Nella prova scritta si traccia il codice a mano, tenendo traccia di variabili, Stack e Heap riga per riga.',
            t: 'Tracciamento del codice', ar: 'في الاختبار الكتابي يُتتبَّع الكود يدوياً مع متابعة المتغيرات والـStack والـHeap سطراً بسطر.',
            ex: 'ارسم جدولاً بأعمدة للمتغيرات، وصناديق للكائنات في الـHeap مع أسهم المراجع. انتبه للفخاخ: القسمة الصحيحة، `==` على النصوص، التمرير بالقيمة، الـaliasing، السقوط في switch، والربط الديناميكي.',
            bn: 'Disegna sempre Stack e Heap quando ci sono oggetti.', bnAr: 'ارسم دائماً الـStack والـHeap عند وجود كائنات.',
          },
          {
            it: 'Il voto finale combina le prove con pesi stabiliti dal docente e la lode viene assegnata solo con il massimo in tutte le prove.',
            t: 'Voto finale in trentesimi', ar: 'الدرجة النهائية تجمع الاختبارات بأوزان يحددها الأستاذ، والـlode تُمنح فقط مع الدرجة القصوى في كل الاختبارات.',
            ex: 'في هذه المحاكاة: الكتابي 40%، والعملي 40%، والشفهي 20%. إن كان أي اختبار أقل من 18 فالامتحان غير ناجح. ستحصل على درجتك في المرحلة 5 من هذا الدرس.',
            bn: 'Rispondi all\'orale con il lessico tecnico italiano corretto.', bnAr: 'أجب في الشفهي بالمصطلحات التقنية الإيطالية الصحيحة.',
          },
        ],
        analogia: {
          titolo: 'Il collaudo finale',
          it: 'L\'esame è il collaudo di un ponte: lo scritto controlla il progetto, la prova pratica fa passare i camion, l\'orale verifica che l\'ingegnere sappia spiegare perché il ponte regge.',
          ar: 'الامتحان مثل الفحص النهائي لجسر قبل افتتاحه: الكتابي يراجع المخططات (هل تفهم ما يفعله الكود؟)، والعملي يمرّر الشاحنات عليه فعلاً (هل يعمل برنامجك؟)، والشفهي يسأل المهندس: "لماذا يصمد الجسر؟" (هل تستطيع شرح المفاهيم؟). لتحصل على "30 e Lode" يجب أن تنجح في الثلاثة بامتياز.',
        },
        esempio: {
          file: 'Traccia.java',
          codice: `class Nodo {

    private final int valore;
    private Nodo prossimo;

    public Nodo(int valore) {
        this.valore = valore;
    }

    public int getValore() {
        return valore;
    }

    public Nodo getProssimo() {
        return prossimo;
    }

    public void setProssimo(Nodo prossimo) {
        this.prossimo = prossimo;
    }
}

public class Traccia {

    public static int somma(Nodo testa) {
        if (testa == null) {
            return 0;
        }
        return testa.getValore() + somma(testa.getProssimo());
    }

    public static void main(String[] args) {
        Nodo a = new Nodo(3);
        Nodo b = new Nodo(5);
        a.setProssimo(b);
        b.setProssimo(new Nodo(7));
        Nodo c = a;
        c = c.getProssimo();
        String s1 = "esame";
        String s2 = new String("esame");
        System.out.println(somma(a) + " " + somma(c));
        System.out.println((s1 == s2) + " " + s1.equals(s2));
        System.out.println(7 / 2 + 7 % 2 + " " + 7 / 2.0);
    }
}`,
          normaAmmesse: ['string-equals', 'numero-magico'],
          note: [
            ['c = c.getProssimo();', { t: 'Riassegnazione del riferimento', ar: 'إعادة تعيين المرجع', ex: '`c` ينتقل إلى العقدة 5، أما `a` فيبقى على العقدة 3. لا يتغير أي كائن.' }],
            ['return testa.getValore() + somma(testa.getProssimo());', { t: 'Ricorsione su lista collegata', ar: 'التعاود على قائمة مترابطة', ex: 'somma(a) = 3 + 5 + 7 = 15 و somma(c) = 5 + 7 = 12. الحالة الأساسية: null.' }],
            ['System.out.println(7 / 2 + 7 % 2 + " " + 7 / 2.0);', { t: 'Trappola aritmetica', ar: 'فخ حسابي', ex: '7/2 = 3 (قسمة صحيحة) و 7%2 = 1، فالمجموع 4 قبل الدمج مع النص، ثم 7/2.0 = 3.5.' }],
          ],
        },
        norma: {
          it: 'All\'esame: codice che compila, nomi chiari, attributi private, costanti, graffe sempre, nessun break nei cicli, catch specifici e risorse chiuse.',
          ar: 'في الامتحان: كود يُترجم، وأسماء واضحة، وخصائص private، وثوابت، وأقواس دائماً، ولا break في الحلقات، و catch محددة، وموارد مغلقة.',
        },
        quiz: [
          {
            d: 'Prova scritta — cosa stampa la seconda riga dell\'esempio, (s1 == s2) + " " + s1.equals(s2)?', dAr: 'الاختبار الكتابي: ماذا يطبع السطر الثاني من المثال؟',
            opzioni: ['true true', 'false true', 'true false', 'false false'], corretta: 1,
            it: 'new String crea un oggetto distinto: == confronta i riferimenti (false), equals il contenuto (true).',
            ar: 'new String تُنشئ كائناً مختلفاً: == تقارن المراجع (false) و equals المحتوى (true).',
          },
          {
            d: 'Prova scritta — Animale a = new Cane(); a.verso(); dove Cane ridefinisce verso(). Quale meccanismo sceglie il metodo?', dAr: 'أي آلية تختار الدالة؟',
            opzioni: ['Overloading a tempo di compilazione', 'Binding dinamico a runtime', 'Casting implicito', 'Il metodo di Animale, sempre'], corretta: 1,
            it: 'Overriding + binding dinamico: si esegue verso() di Cane, il tipo reale dell\'oggetto.',
            ar: 'إعادة التعريف مع الربط الديناميكي: تُنفَّذ verso() الخاصة بـ Cane لأنه النوع الحقيقي للكائن.',
          },
          {
            d: 'Prova scritta — int[] v = {1, 2, 3}; int[] w = v; w[0] = 9; v = new int[]{4}; Quanto valgono w[0] e v[0]?', dAr: 'كم قيمة w[0] و v[0]؟',
            opzioni: ['9 e 4', '1 e 4', '9 e 9', '4 e 4'], corretta: 0,
            it: 'w e v condividono l\'array (w[0] = 9); poi v punta a un nuovo array {4}, mentre w resta sul vecchio.',
            ar: 'w و v يتشاركان المصفوفة (w[0] = 9)، ثم يشير v إلى مصفوفة جديدة {4} بينما يبقى w على القديمة.',
          },
          {
            d: 'Prova scritta — quale eccezione è checked?', dAr: 'أي استثناء مفحوص (checked)؟',
            opzioni: ['NullPointerException', 'ArithmeticException', 'IOException', 'ClassCastException'], corretta: 2,
            it: 'IOException estende Exception ma non RuntimeException: va catturata o dichiarata.',
            ar: 'IOException ترث من Exception وليس من RuntimeException، فيجب التقاطها أو إعلانها.',
          },
        ],
        costruisci: {
          consegna: 'Prova al calcolatore, parte 1: completa la classe Coda (FIFO) basata su ArrayList.',
          consegnaAr: 'الاختبار العملي، الجزء 1: أكمل الصنف Coda (طابور FIFO) المبني على ArrayList.',
          codice: `import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

class Coda<T> {

    private final List<T> elementi = new ⟦ArrayList⟧<>();

    public void accoda(T elemento) {
        elementi.⟦add⟧(elemento);
    }

    public T estrai() {
        if (elementi.⟦isEmpty⟧()) {
            throw new NoSuchElementException("Coda vuota");
        }
        return elementi.remove(⟦0⟧);
    }

    public int dimensione() {
        return elementi.size();
    }
}

public class Sportello {

    public static void main(String[] args) {
        Coda<String> coda = new Coda<>();
        coda.accoda("Anna");
        coda.accoda("Luca");
        coda.accoda("Sara");
        System.out.println("Serviamo " + coda.estrai());
        System.out.println("In attesa: " + coda.dimensione());
    }
}`,
          output: 'Serviamo Anna\nIn attesa: 2\n',
        },
        laboratorio: {
          titolo: 'Prova al calcolatore: biblioteca universitaria',
          consegna: 'Completa la classe Biblioteca: (1) presta(String titolo) lancia LibroNonDisponibileException (checked, da creare) se il libro non esiste o è già in prestito, altrimenti lo segna come prestato; (2) disponibili() restituisce i titoli non in prestito ordinati alfabeticamente. Il main deve stampare «Prestato: Algoritmi», «Errore: Algoritmi non disponibile» e «Disponibili: [Basi di dati, Java]».',
          consegnaAr: 'أكمل الصنف Biblioteca: (1) الدالة presta(String titolo) ترمي LibroNonDisponibileException (استثناء مفحوص تنشئه بنفسك) إذا لم يوجد الكتاب أو كان مُعاراً، وإلا تسجّله كمُعار؛ (2) الدالة disponibili() تُعيد عناوين الكتب غير المُعارة مرتبة أبجدياً. يجب أن يطبع main «Prestato: Algoritmi» ثم «Errore: Algoritmi non disponibile» ثم «Disponibili: [Basi di dati, Java]».',
          codice: `import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// LibroNonDisponibileException

class Biblioteca {

    private final Map<String, Boolean> inPrestito = new HashMap<>();

    public void aggiungi(String titolo) {
        inPrestito.put(titolo, false);
    }

    // presta e disponibili
}

public class Esame {

    public static void main(String[] args) {
        Biblioteca b = new Biblioteca();
        b.aggiungi("Java");
        b.aggiungi("Algoritmi");
        b.aggiungi("Basi di dati");
        try {
            b.presta("Algoritmi");
            System.out.println("Prestato: Algoritmi");
            b.presta("Algoritmi");
        } catch (LibroNonDisponibileException e) {
            System.out.println("Errore: " + e.getMessage());
        }
        System.out.println("Disponibili: " + b.disponibili());
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Prestato: Algoritmi\nErrore: Algoritmi non disponibile\nDisponibili: [Basi di dati, Java]', msg: 'L\'output non corrisponde alla consegna.', msgAr: 'المخرجات لا تطابق المطلوب.' },
            { tipo: 'codice', re: 'class\\s+LibroNonDisponibileException\\s+extends\\s+Exception', msg: 'LibroNonDisponibileException deve essere checked (extends Exception).', msgAr: 'يجب أن يكون LibroNonDisponibileException مفحوصاً (extends Exception).' },
            { tipo: 'codice', re: 'throws\\s+LibroNonDisponibileException', msg: 'presta deve dichiarare throws.', msgAr: 'يجب أن تعلن presta عن throws.' },
            { tipo: 'norma', msg: 'Il codice deve rispettare la Buona Norma (nessun errore).', msgAr: 'يجب أن يحترم الكود قواعد البرمجة الجيدة (بدون أخطاء).' },
          ],
          soluzione: `import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

class LibroNonDisponibileException extends Exception {

    public LibroNonDisponibileException(String titolo) {
        super(titolo + " non disponibile");
    }
}

class Biblioteca {

    private final Map<String, Boolean> inPrestito = new HashMap<>();

    public void aggiungi(String titolo) {
        inPrestito.put(titolo, false);
    }

    public void presta(String titolo) throws LibroNonDisponibileException {
        if (!inPrestito.containsKey(titolo) || inPrestito.get(titolo)) {
            throw new LibroNonDisponibileException(titolo);
        }
        inPrestito.put(titolo, true);
    }

    public List<String> disponibili() {
        return inPrestito.entrySet().stream()
                .filter(voce -> !voce.getValue())
                .map(Map.Entry::getKey)
                .sorted()
                .collect(Collectors.toList());
    }
}

public class Esame {

    public static void main(String[] args) {
        Biblioteca b = new Biblioteca();
        b.aggiungi("Java");
        b.aggiungi("Algoritmi");
        b.aggiungi("Basi di dati");
        try {
            b.presta("Algoritmi");
            System.out.println("Prestato: Algoritmi");
            b.presta("Algoritmi");
        } catch (LibroNonDisponibileException e) {
            System.out.println("Errore: " + e.getMessage());
        }
        System.out.println("Disponibili: " + b.disponibili());
    }
}`,
        },
        orale: [
          {
            d: 'Qual è la differenza tra Stack e Heap?',
            r: 'Lo Stack contiene i frame dei metodi con parametri e variabili locali e si svuota quando il metodo termina; lo Heap contiene gli oggetti creati con new, che restano finché sono raggiungibili e poi vengono liberati dal Garbage Collector.',
            ar: 'الـStack يحتوي إطارات الدوال بمعاملاتها ومتغيراتها المحلية ويُفرَّغ عند انتهاء الدالة؛ والـHeap يحتوي الكائنات المُنشأة بـ new والتي تبقى طالما يمكن الوصول إليها ثم يحررها جامع القمامة.',
          },
          {
            d: 'Spieghi la differenza tra overloading e overriding.',
            r: 'L\'overloading è avere più metodi con lo stesso nome e parametri diversi, risolto dal compilatore; l\'overriding è ridefinire in una sottoclasse un metodo con la stessa firma, scelto a runtime con il binding dinamico in base al tipo reale dell\'oggetto.',
            ar: 'الـoverloading هو وجود عدة دوال بنفس الاسم ومعاملات مختلفة ويحسمه المترجم؛ والـoverriding هو إعادة تعريف دالة بنفس التوقيع في صنف فرعي وتُختار وقت التشغيل بالربط الديناميكي حسب النوع الحقيقي للكائن.',
          },
          {
            d: 'Perché in Java si dice che i parametri sono passati per valore anche per gli oggetti?',
            r: 'Perché il metodo riceve una copia del riferimento: può modificare l\'oggetto puntato, ma se riassegna il parametro la variabile del chiamante continua a puntare all\'oggetto originale.',
            ar: 'لأن الدالة تستلم نسخة من المرجع: يمكنها تعديل الكائن المشار إليه، لكن إن أعادت تعيين المعامل يبقى متغير المستدعي مشيراً إلى الكائن الأصلي.',
          },
          {
            d: 'Quando usa una classe astratta e quando un\'interfaccia?',
            r: 'Uso una classe astratta quando le sottoclassi condividono stato e codice e sono legate da una relazione «è un»; uso un\'interfaccia per descrivere una capacità che classi diverse possono avere, sfruttando anche l\'implementazione multipla.',
            ar: 'أستخدم الصنف المجرد عندما تتشارك الأصناف الفرعية حالة وكوداً وتربطها علاقة "هو نوع من"؛ وأستخدم الواجهة لوصف قدرة يمكن أن تملكها أصناف مختلفة، مع الاستفادة من التنفيذ المتعدد.',
          },
          {
            d: 'Che differenza c\'è tra eccezioni checked e unchecked?',
            r: 'Le checked, che estendono Exception ma non RuntimeException, devono essere catturate o dichiarate con throws e rappresentano condizioni esterne recuperabili; le unchecked estendono RuntimeException, non sono controllate dal compilatore e indicano errori di programmazione.',
            ar: 'المفحوصة ترث من Exception وليس من RuntimeException، ويجب التقاطها أو إعلانها بـ throws وتمثل ظروفاً خارجية قابلة للمعالجة؛ وغير المفحوصة ترث من RuntimeException ولا يفحصها المترجم وتدل على أخطاء برمجية.',
          },
          {
            d: 'Perché quando si ridefinisce equals bisogna ridefinire anche hashCode?',
            r: 'Perché le collezioni basate su hash come HashMap e HashSet usano prima hashCode per trovare il bucket e poi equals: due oggetti uguali per equals devono avere lo stesso hashCode, altrimenti la collezione non li riconosce come uguali.',
            ar: 'لأن المجموعات المعتمدة على الـhash مثل HashMap و HashSet تستخدم hashCode أولاً لإيجاد الخانة ثم equals: الكائنان المتساويان بـ equals يجب أن يكون لهما نفس hashCode، وإلا لن تعرفهما المجموعة كمتساويين.',
          },
        ],
        esame: { pesi: { scritto: 0.4, pratica: 0.4, orale: 0.2 } },
        riepilogo: [
          { it: 'Scritto: traccia il codice disegnando Stack e Heap.', ar: 'الكتابي: تتبّع الكود برسم الـStack والـHeap.' },
          { it: 'Pratica: codice che compila, corretto e conforme alla Buona Norma.', ar: 'العملي: كود يُترجم وصحيح ومتوافق مع قواعد البرمجة الجيدة.' },
          { it: 'Orale: lessico tecnico preciso; 30 e lode solo con il massimo ovunque.', ar: 'الشفهي: مصطلحات تقنية دقيقة، و 30 مع مرتبة الشرف فقط مع الدرجة القصوى في كل شيء.' },
        ],
      },
    ],
  };
  if (typeof module === 'object' && module.exports) module.exports = livello;
  else (root.CF_LIVELLI = root.CF_LIVELLI || []).push(livello);
})(typeof globalThis !== 'undefined' ? globalThis : this);
