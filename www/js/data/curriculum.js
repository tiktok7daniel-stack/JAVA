/*
 * CodeForge — Programma didattico (Corso di Programmazione Java, CdL in Informatica).
 * Struttura: moduli → lezioni → sezioni (testo | codice | norma | schema) + esercizio.
 * Frasi:  { it, t (termine tecnico), ar (traduzione), ex (spiegazione in arabo), bn, bnAr (buona norma) }
 * Codice: stringa + note: [[frammento-di-riga, { t, ar, ex, bn, bnAr }]]; le righe senza nota
 *         vengono spiegate automaticamente da explainer.js.
 */
(function (root) {
  'use strict';

  const moduli = [
    // ═══════════════════════════════ MODULO 1 ═══════════════════════════════
    {
      id: 'm1', numero: 1, colore: '#58A6FF', icona: 'cube',
      titolo: 'Fondamenti di Java e Tipi Primitivi',
      titoloAr: 'أساسيات جافا والأنواع البدائية',
      descr: 'Struttura di una classe, il metodo main, variabili, costanti, tipi primitivi e String.',
      lezioni: [
        {
          id: 'm1l1', titolo: 'Struttura di una classe e il metodo main', durata: '10 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Dal codice sorgente alla JVM',
              frasi: [
                {
                  it: 'Un programma Java è composto da una o più classi: ogni istruzione deve trovarsi all\'interno di una classe.',
                  t: 'Classe', ar: 'يتكوّن برنامج Java من صنف واحد أو أكثر، ويجب أن تكون كل تعليمة داخل صنف.',
                  ex: 'الصنف (`class`) هو الوحدة الأساسية في Java. لا يمكن كتابة أي تعليمة أو دالة خارج صنف، على عكس لغات مثل C أو Python. حتى برنامج "Ciao mondo" البسيط يحتاج إلى صنف.',
                  bn: 'Il nome della classe è un sostantivo in PascalCase (es. ContoCorrente).', bnAr: 'اسم الصنف اسمٌ (وليس فعلاً) بأسلوب PascalCase مثل ContoCorrente.',
                },
                {
                  it: 'Il file sorgente deve avere lo stesso nome della classe pubblica, con estensione .java.',
                  t: 'File sorgente (.java)', ar: 'يجب أن يحمل ملف المصدر نفس اسم الصنف العام، بامتداد ‎.java.',
                  ex: 'إذا كان الصنف `public class Main` فيجب حفظه في ملف اسمه `Main.java` بالضبط مع مراعاة الأحرف الكبيرة والصغيرة، وإلا يرفض المترجم الملف. يُسمح بصنف عام واحد فقط في كل ملف.',
                  bn: 'Una sola classe public per file, con lo stesso nome del file.', bnAr: 'صنف عام واحد فقط في كل ملف، وبنفس اسم الملف.',
                },
                {
                  it: 'Il compilatore javac traduce il codice sorgente in bytecode, che viene poi eseguito dalla Java Virtual Machine (JVM).',
                  t: 'Bytecode e JVM', ar: 'يترجم المترجم javac الكود المصدري إلى bytecode، والذي تنفّذه بعد ذلك آلة جافا الافتراضية (JVM).',
                  ex: 'الخطوات: `javac Main.java` ينتج ملف `Main.class` يحتوي على bytecode (لغة وسيطة)، ثم `java Main` يشغّله على JVM. لهذا يعمل نفس البرنامج على Windows و Linux و Android: "اكتب مرة، شغّل في كل مكان" (Write once, run anywhere).',
                  bn: 'Correggi tutti gli errori di compilazione prima di eseguire: il compilatore è il tuo primo correttore.', bnAr: 'صحّح جميع أخطاء الترجمة قبل التشغيل: المترجم هو أول من يراجع عملك.',
                },
                {
                  it: 'L\'esecuzione inizia sempre dal metodo main, che è il punto di ingresso del programma.',
                  t: 'Punto di ingresso (main)', ar: 'يبدأ التنفيذ دائماً من الدالة main، وهي نقطة الدخول إلى البرنامج.',
                  ex: 'عند تشغيل البرنامج تبحث JVM عن الدالة `public static void main(String[] args)` بهذا التوقيع تماماً، وتُنشئ لها أول إطار (frame) في ذاكرة الـStack. إذا لم تجدها يظهر خطأ ولا يعمل البرنامج.',
                  bn: 'Il main deve essere breve: crea gli oggetti e delega il lavoro ai metodi.', bnAr: 'اجعل main قصيرة: تُنشئ الكائنات وتوزّع العمل على الدوال.',
                },
                {
                  it: 'Ogni istruzione termina con il punto e virgola e i blocchi di codice sono delimitati da parentesi graffe.',
                  t: 'Istruzione e blocco', ar: 'كل تعليمة تنتهي بفاصلة منقوطة، والكتل البرمجية محصورة بين أقواس معقوفة.',
                  ex: 'الفاصلة المنقوطة `;` تُعلن نهاية التعليمة، ونسيانها هو أشهر خطأ ترجمة (`\';\' expected`). الأقواس `{ }` تحدد بداية ونهاية الصنف والدالة والشرط والحلقة، وتحدد أيضاً نطاق (scope) المتغيرات.',
                  bn: 'Indenta ogni blocco annidato di 4 spazi e apri la graffa sulla stessa riga.', bnAr: 'أزِح كل كتلة متداخلة بأربع مسافات، وافتح القوس { في نفس السطر.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'Main.java', esegui: true,
              codice: `/**
 * Il mio primo programma Java.
 */
public class Main {

    public static void main(String[] args) {
        // Stampa un messaggio sulla console
        System.out.println("Ciao, mondo!");
        System.out.println("Benvenuto nel corso di Programmazione");
    }
}`,
              note: [
                ['/**', { t: 'Commento Javadoc', ar: 'تعليق توثيقي Javadoc', ex: 'التعليق الذي يبدأ بـ `/**` هو تعليق توثيق (Javadoc): أداة javadoc تحوّله تلقائياً إلى صفحات توثيق HTML. يُكتب فوق الأصناف والدوال لشرح وظيفتها.', bn: 'Documenta classi e metodi pubblici con Javadoc.', bnAr: 'وثّق الأصناف والدوال العامة بتعليقات Javadoc.' }],
                ['public class Main', { t: 'Dichiarazione della classe pubblica', ar: 'تعريف الصنف العام Main', ex: '`public` تعني أن الصنف مرئي للجميع، و`class` تعرّف صنفاً جديداً اسمه `Main`. بما أنه عام يجب أن يكون الملف `Main.java`. القوس `{` يفتح جسم الصنف.', bn: 'Classi in PascalCase; una classe public per file.', bnAr: 'أسماء الأصناف بأسلوب PascalCase وصنف عام واحد لكل ملف.' }],
                ['System.out.println("Ciao', { t: 'Istruzione di stampa', ar: 'تعليمة الطباعة', ex: '`System` صنف من مكتبة Java، و`out` حقل ساكن فيه يمثل مجرى الإخراج (الشاشة)، و`println` دالة تطبع النص بين علامتي التنصيص ثم تنتقل إلى سطر جديد. السلسلة `"Ciao, mondo!"` قيمة حرفية (literal) من النوع String.', bn: 'Messaggi chiari e in italiano corretto: l\'output è l\'interfaccia con l\'utente.', bnAr: 'اكتب رسائل واضحة وصحيحة لغوياً، فالمخرجات هي واجهة البرنامج مع المستخدم.' }],
              ],
            },
            {
              tipo: 'norma', it: 'Indentazione coerente (4 spazi), una istruzione per riga, nomi delle classi in PascalCase e commenti che spiegano il perché, non il cosa.',
              ar: 'إزاحة منتظمة (4 مسافات)، تعليمة واحدة في كل سطر، أسماء الأصناف بأسلوب PascalCase، وتعليقات تشرح "لماذا" وليس "ماذا". هذه القواعد يراقبها الأساتذة في تصحيح الامتحان العملي.',
            },
          ],
          esercizio: {
            titolo: 'Il tuo primo output',
            consegna: 'Completa il metodo main in modo che stampi esattamente due righe: «Benvenuto in CodeForge!» e «Corso di Programmazione Java».',
            consegnaAr: 'أكمل الدالة main بحيث تطبع سطرين بالضبط: «Benvenuto in CodeForge!» ثم «Corso di Programmazione Java».',
            codice: `public class Main {

    public static void main(String[] args) {
        // Scrivi qui le due istruzioni di stampa

    }
}`,
            verifiche: [
              { tipo: 'output', atteso: 'Benvenuto in CodeForge!\nCorso di Programmazione Java', msg: 'L\'output deve contenere esattamente le due righe richieste.', msgAr: 'يجب أن تحتوي المخرجات على السطرين المطلوبين بالضبط.' },
              { tipo: 'codice', re: 'println', msg: 'Usa System.out.println per andare a capo.', msgAr: 'استخدم System.out.println للانتقال إلى سطر جديد.' },
            ],
            soluzione: `public class Main {

    public static void main(String[] args) {
        System.out.println("Benvenuto in CodeForge!");
        System.out.println("Corso di Programmazione Java");
    }
}`,
          },
        },
        {
          id: 'm1l2', titolo: 'Variabili e tipi primitivi', durata: '14 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Memorizzare i dati',
              frasi: [
                {
                  it: 'Una variabile è una locazione di memoria identificata da un nome, che contiene un valore di un tipo ben preciso.',
                  t: 'Variabile', ar: 'المتغير هو موقع في الذاكرة له اسم، ويحتوي على قيمة من نوع محدد.',
                  ex: 'عند كتابة `int eta = 20;` تحجز JVM مساحة 32 بت داخل إطار الدالة في الـStack، وتسمّيها `eta`، وتضع فيها القيمة 20. يمكن تغيير القيمة لاحقاً لكن لا يمكن تغيير النوع.',
                  bn: 'Dai alle variabili nomi significativi in camelCase (numeroStudenti, non ns).', bnAr: 'أعطِ المتغيرات أسماء ذات معنى بأسلوب camelCase (numeroStudenti وليس ns).',
                },
                {
                  it: 'Java è un linguaggio fortemente tipizzato: ogni variabile deve essere dichiarata con il suo tipo prima di essere usata.',
                  t: 'Tipizzazione forte (statica)', ar: 'Java لغة قوية التنميط: يجب التصريح عن كل متغير مع نوعه قبل استخدامه.',
                  ex: 'المترجم يتحقق من الأنواع قبل التشغيل: لا يمكنك وضع نص داخل متغير `int`، ولا استخدام متغير لم تصرّح عنه. هذا يكشف كثيراً من الأخطاء مبكراً وقبل أن يصل البرنامج للمستخدم.',
                  bn: 'Dichiara le variabili il più vicino possibile al loro primo utilizzo.', bnAr: 'صرّح عن المتغير في أقرب مكان لأول استخدام له.',
                },
                {
                  it: 'Esistono otto tipi primitivi: byte, short, int, long per gli interi, float e double per i numeri reali, char per i caratteri e boolean per i valori logici.',
                  t: 'Tipi primitivi', ar: 'توجد ثمانية أنواع بدائية: byte و short و int و long للأعداد الصحيحة، و float و double للأعداد الحقيقية، و char للحروف، و boolean للقيم المنطقية.',
                  ex: 'الأنواع البدائية ليست كائنات: قيمتها تُخزَّن مباشرة داخل المتغير في الـStack. الأكثر استخداماً: `int` (عدد صحيح 32 بت)، `double` (عدد عشري 64 بت)، `boolean` (true/false)، `char` (حرف Unicode بين \' \'). أما `String` فليس بدائياً بل صنف.',
                  bn: 'Usa int per i conteggi e double per le grandezze reali; evita float senza motivo.', bnAr: 'استخدم int للعدّ و double للقيم الحقيقية، وتجنب float دون سبب.',
                },
                {
                  it: 'La divisione tra due interi produce un risultato intero: la parte decimale viene troncata.',
                  t: 'Divisione intera', ar: 'القسمة بين عددين صحيحين تُنتج عدداً صحيحاً: يتم حذف الجزء العشري.',
                  ex: 'مثال شهير في الامتحانات: `7 / 2` نتيجته `3` وليس `3.5` لأن كلا الطرفين `int`. والمعامل `%` يعطي باقي القسمة: `7 % 2` يساوي `1`. للحصول على `3.5` يجب أن يكون أحد الطرفين `double`.',
                  bn: 'Attenzione alle divisioni tra interi quando calcoli medie e percentuali.', bnAr: 'انتبه إلى القسمة بين الأعداد الصحيحة عند حساب المعدلات والنسب.',
                },
                {
                  it: 'Il cast esplicito permette di convertire un valore in un altro tipo, ad esempio (double) somma.',
                  t: 'Cast (conversione di tipo)', ar: 'التحويل الصريح (cast) يسمح بتحويل قيمة إلى نوع آخر، مثل ‎(double) somma.',
                  ex: 'التحويل من `int` إلى `double` يتم تلقائياً لأنه آمن (widening). أما من `double` إلى `int` فيجب أن يكون صريحاً `(int) 3.9` لأنه يفقد الجزء العشري (النتيجة 3 وليس 4). كتابة `int x = 3.5;` تسبب خطأ ترجمة.',
                  bn: 'Rendi espliciti i cast che perdono informazione, così il lettore li nota.', bnAr: 'اجعل التحويلات التي تفقد معلومات صريحة ليلاحظها القارئ.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'TipiPrimitivi.java', esegui: true,
              codice: `public class TipiPrimitivi {

    public static void main(String[] args) {
        int eta = 20;
        double altezza = 1.75;
        boolean iscritto = true;
        char iniziale = 'M';

        int totale = 7;
        int divisore = 2;
        int quoziente = totale / divisore;
        int resto = totale % divisore;
        double risultato = (double) totale / divisore;

        System.out.println("Età: " + eta + ", altezza: " + altezza);
        System.out.println("Iscritto: " + iscritto + ", iniziale: " + iniziale);
        System.out.println("7 / 2 = " + quoziente + " con resto " + resto);
        System.out.println("Divisione reale: " + risultato);
    }
}`,
              note: [
                ['int eta = 20', { t: 'Variabile intera (int)', ar: 'متغير عدد صحيح', ex: 'يُنشأ المتغير `eta` داخل إطار `main` في الـStack ويحتوي مباشرة على القيمة 20 (32 بت). لا يوجد أي كائن في الـHeap هنا لأن `int` نوع بدائي.', bn: 'Nome in camelCase e significativo.', bnAr: 'اسم معبّر بأسلوب camelCase.' }],
                ['double altezza', { t: 'Variabile reale (double)', ar: 'متغير عدد عشري', ex: '`double` عدد بفاصلة عائمة بدقة مزدوجة (64 بت). الفاصلة العشرية في Java تُكتب نقطة `1.75` وليس فاصلة.', bn: 'Usa double per le misure reali.', bnAr: 'استخدم double للقياسات الحقيقية.' }],
                ['boolean iscritto', { t: 'Variabile logica (boolean)', ar: 'متغير منطقي', ex: '`boolean` يأخذ قيمتين فقط: `true` أو `false`. يُستخدم في الشروط مباشرة: `if (iscritto)`.', bn: 'Nomi booleani che suonano come domande: iscritto, isAttivo.', bnAr: 'أسماء المتغيرات المنطقية تشبه السؤال مثل iscritto أو isAttivo.' }],
                ["char iniziale", { t: 'Carattere (char)', ar: 'متغير حرف', ex: '`char` يحتوي على حرف واحد بين علامتي تنصيص مفردة `\'M\'`. داخلياً هو رقم Unicode (الحرف M = 77)، لذا يمكن إجراء عمليات حسابية عليه.', bn: 'Non confondere \'M\' (char) con "M" (String).', bnAr: 'لا تخلط بين \'M\' (حرف char) و "M" (نص String).' }],
                ['int quoziente', { t: 'Divisione intera', ar: 'قسمة صحيحة', ex: 'بما أن `totale` و`divisore` كلاهما `int`، فإن `7 / 2` = `3` ويُحذف الجزء العشري. هذه من أكثر الأسئلة تكراراً في امتحان "ماذا يطبع هذا الكود؟".', bn: 'Verifica sempre i tipi degli operandi di una divisione.', bnAr: 'تحقق دائماً من أنواع طرفي القسمة.' }],
                ['int resto', { t: 'Operatore modulo (%)', ar: 'معامل باقي القسمة', ex: '`%` يعطي باقي القسمة الصحيحة: `7 % 2` = `1`. يُستخدم كثيراً لمعرفة إن كان العدد زوجياً: `n % 2 == 0`.', bn: 'Usa % per parità e cicli periodici.', bnAr: 'استخدم % لمعرفة الزوجي والفردي والدوريات.' }],
                ['(double) totale', { t: 'Cast esplicito a double', ar: 'تحويل صريح إلى double', ex: 'التحويل `(double) totale` يحدث قبل القسمة (أولوية أعلى)، فيصبح `7.0 / 2` = `3.5`. لو كتبنا `(double) (totale / divisore)` لكانت النتيجة `3.0` لأن القسمة الصحيحة تحدث أولاً!', bn: 'Applica il cast all\'operando, non al risultato della divisione.', bnAr: 'طبّق التحويل على أحد الطرفين وليس على نتيجة القسمة.' }],
              ],
            },
            {
              tipo: 'norma', it: 'Nomi delle variabili in camelCase, significativi e in italiano coerente; attenzione alla divisione intera; cast espliciti solo quando necessari.',
              ar: 'أسماء المتغيرات بأسلوب camelCase ومعبّرة؛ انتبه للقسمة الصحيحة؛ واستخدم التحويل الصريح فقط عند الحاجة. الأستاذ يخصم درجات على الأسماء غير الواضحة مثل a و b و x1.',
            },
          ],
          esercizio: {
            titolo: 'Calcola la media dei voti',
            consegna: 'Hai tre voti interi (30, 28, 27). Calcola la media come numero reale (attenzione alla divisione intera!) usando una costante NUMERO_ESAMI e stampa «Media: » seguito dal valore.',
            consegnaAr: 'لديك ثلاث درجات صحيحة (30 و 28 و 27). احسب المعدل كعدد حقيقي (انتبه للقسمة الصحيحة!) باستخدام ثابت NUMERO_ESAMI واطبع «Media: » متبوعاً بالقيمة.',
            codice: `public class Media {

    public static void main(String[] args) {
        int voto1 = 30;
        int voto2 = 28;
        int voto3 = 27;
        // Dichiara la costante NUMERO_ESAMI e calcola la media reale

    }
}`,
            verifiche: [
              { tipo: 'contiene', testo: 'Media: 28.33', msg: 'La media deve essere 28.333... (non 28.0): usa un cast a double.', msgAr: 'يجب أن يكون المعدل 28.333... وليس 28.0: استخدم التحويل إلى double.' },
              { tipo: 'codice', re: 'final\\s+int\\s+NUMERO_ESAMI', msg: 'Dichiara la costante final int NUMERO_ESAMI.', msgAr: 'صرّح عن الثابت final int NUMERO_ESAMI.' },
            ],
            soluzione: `public class Media {

    public static void main(String[] args) {
        int voto1 = 30;
        int voto2 = 28;
        int voto3 = 27;
        final int NUMERO_ESAMI = 3;
        double media = (double) (voto1 + voto2 + voto3) / NUMERO_ESAMI;
        System.out.println("Media: " + media);
    }
}`,
          },
        },
        {
          id: 'm1l3', titolo: 'Costanti, String e regole di denominazione', durata: '12 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Valori immutabili e testo',
              frasi: [
                {
                  it: 'La parola chiave final rende una variabile una costante: dopo la prima assegnazione il suo valore non può più cambiare.',
                  t: 'Costante (final)', ar: 'الكلمة المفتاحية final تجعل المتغير ثابتاً: بعد الإسناد الأول لا يمكن تغيير قيمته.',
                  ex: 'إذا حاولت تغيير قيمة ثابت `final` يرفض المترجم البرنامج. الثوابت تجعل الكود أوضح (`ALIQUOTA_IVA` بدلاً من `0.22`) وتسمح بتعديل القيمة في مكان واحد فقط.',
                  bn: 'Sostituisci i "numeri magici" con costanti dal nome significativo.', bnAr: 'استبدل "الأرقام السحرية" بثوابت ذات أسماء واضحة.',
                },
                {
                  it: 'Per convenzione le costanti si scrivono in maiuscolo con le parole separate da underscore, ad esempio ALIQUOTA_IVA.',
                  t: 'UPPER_SNAKE_CASE', ar: 'بحسب العُرف تُكتب الثوابت بأحرف كبيرة مع فصل الكلمات بشرطة سفلية، مثل ALIQUOTA_IVA.',
                  ex: 'هذا الأسلوب يجعل القارئ يميّز الثابت فوراً عن المتغير العادي. الثوابت المشتركة على مستوى الصنف تُكتب عادة `private static final double ALIQUOTA_IVA = 0.22;`.',
                  bn: 'Costanti: UPPER_SNAKE_CASE; variabili e metodi: camelCase; classi: PascalCase.', bnAr: 'الثوابت UPPER_SNAKE_CASE، والمتغيرات والدوال camelCase، والأصناف PascalCase.',
                },
                {
                  it: 'String non è un tipo primitivo ma una classe: ogni stringa è un oggetto immutabile memorizzato nello Heap.',
                  t: 'String (oggetto immutabile)', ar: 'String ليس نوعاً بدائياً بل صنف: كل سلسلة نصية كائن غير قابل للتعديل مخزّن في الـHeap.',
                  ex: 'المتغير `String nome` في الـStack يحمل مرجعاً إلى كائن النص في الـHeap. "غير قابل للتعديل" (immutable) يعني أن دوال مثل `toUpperCase()` لا تغيّر النص الأصلي بل تُعيد كائناً جديداً.',
                  bn: 'Ricorda di assegnare il risultato: nome = nome.trim();', bnAr: 'تذكّر إسناد النتيجة: nome = nome.trim(); لأن النص الأصلي لا يتغير.',
                },
                {
                  it: 'L\'operatore + applicato a una stringa esegue la concatenazione e converte automaticamente gli altri valori in testo.',
                  t: 'Concatenazione', ar: 'المعامل + عند تطبيقه على نص يقوم بالدمج ويحوّل القيم الأخرى إلى نص تلقائياً.',
                  ex: 'انتبه للترتيب: `"Somma: " + 2 + 3` يطبع `Somma: 23` لأن الدمج يتم من اليسار، بينما `"Somma: " + (2 + 3)` يطبع `Somma: 5`. سؤال كلاسيكي في الامتحان.',
                  bn: 'Usa le parentesi per rendere esplicito l\'ordine tra somma e concatenazione.', bnAr: 'استخدم الأقواس لتوضيح الترتيب بين الجمع والدمج.',
                },
                {
                  it: 'Il contenuto di due stringhe si confronta con il metodo equals e non con l\'operatore ==, che confronta i riferimenti.',
                  t: 'equals() vs ==', ar: 'يُقارَن محتوى سلسلتين نصيتين بالدالة equals وليس بالمعامل == الذي يقارن المراجع.',
                  ex: 'المعامل `==` يسأل: "هل المرجعان يشيران إلى نفس الكائن في الـHeap؟" بينما `equals()` يسأل: "هل النصان متطابقان حرفاً بحرف؟". نصّان متطابقان قد يكونان كائنين مختلفين فيعطي `==` النتيجة `false`.',
                  bn: 'Confronta sempre le stringhe con equals(); preferisci "costante".equals(variabile).', bnAr: 'قارن النصوص دائماً بـ equals()، ويفضّل كتابة "ثابت".equals(متغير) لتجنب NullPointerException.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'Scontrino.java', esegui: true,
              codice: `public class Scontrino {

    public static void main(String[] args) {
        final double ALIQUOTA_IVA = 0.22;
        String nomeProdotto = "Manuale di Java";
        double prezzoNetto = 30.0;

        double prezzoLordo = prezzoNetto * (1 + ALIQUOTA_IVA);
        String titolo = nomeProdotto.toUpperCase();

        System.out.println(titolo + " (" + nomeProdotto.length() + " caratteri)");
        System.out.println("Prezzo con IVA: " + prezzoLordo);

        String copia = new String("Manuale di Java");
        System.out.println("Con == : " + (nomeProdotto == copia));
        System.out.println("Con equals: " + nomeProdotto.equals(copia));
    }
}`,
              note: [
                ['final double ALIQUOTA_IVA', { t: 'Costante locale', ar: 'ثابت محلي', ex: '`final` تمنع تغيير القيمة بعد الإسناد، والاسم بأحرف كبيرة يوضح أنه ثابت. القيمة 0.22 لها الآن اسم يشرح معناها (نسبة ضريبة القيمة المضافة 22% في إيطاليا).', bn: 'Costanti in UPPER_SNAKE_CASE.', bnAr: 'الثوابت بأسلوب UPPER_SNAKE_CASE.' }],
                ['String nomeProdotto', { t: 'Riferimento a String', ar: 'مرجع إلى نص', ex: 'المتغير `nomeProdotto` في الـStack يحمل مرجعاً إلى الكائن النصي "Manuale di Java". النصوص الحرفية (literals) تُخزَّن في مكان خاص من الـHeap يسمى String Pool وتُعاد استخدامها.', bn: 'camelCase anche per i riferimenti.', bnAr: 'camelCase للمراجع أيضاً.' }],
                ['toUpperCase()', { t: 'Metodo di String', ar: 'دالة من دوال String', ex: '`toUpperCase()` لا تعدّل `nomeProdotto` (لأن String غير قابل للتعديل) بل تُنشئ كائناً نصياً جديداً بأحرف كبيرة ونخزّن مرجعه في `titolo`.', bn: 'Assegna sempre il risultato dei metodi di String.', bnAr: 'أسند دائماً نتيجة دوال String إلى متغير.' }],
                ['new String(', { t: 'Nuovo oggetto String', ar: 'كائن نصي جديد', ex: '`new String(...)` تُجبر JVM على إنشاء كائن جديد في الـHeap حتى لو كان النص نفسه موجوداً في الـString Pool. لذلك `copia` و`nomeProdotto` لهما نفس المحتوى لكن عنوانين مختلفين.', bn: 'Non serve new String(...) nel codice reale: qui serve solo a mostrare la differenza.', bnAr: 'لا حاجة لـ new String(...) في الكود الحقيقي؛ هنا فقط لتوضيح الفرق.' }],
                ['(nomeProdotto == copia)', { t: 'Confronto di riferimenti (==)', ar: 'مقارنة المراجع', ex: 'النتيجة `false`: المعامل `==` يقارن العناوين في الـHeap، والكائنان مختلفان رغم تطابق النص. هذا خطأ شائع جداً يخصم عليه الأساتذة.', bn: 'Mai == per confrontare il contenuto di stringhe.', bnAr: 'لا تستخدم == أبداً لمقارنة محتوى النصوص.' }],
                ['equals(copia)', { t: 'Confronto di contenuto (equals)', ar: 'مقارنة المحتوى', ex: 'النتيجة `true`: الدالة `equals()` تقارن الأحرف واحداً تلو الآخر، وهي الطريقة الصحيحة لمقارنة النصوص.', bn: 'Usa equals() (o equalsIgnoreCase) per le stringhe.', bnAr: 'استخدم equals() أو equalsIgnoreCase للنصوص.' }],
              ],
            },
            {
              tipo: 'norma', it: 'Regole di denominazione: classi in PascalCase, variabili e metodi in camelCase, costanti in UPPER_SNAKE_CASE. Le stringhe si confrontano con equals().',
              ar: 'قواعد التسمية: الأصناف PascalCase، والمتغيرات والدوال camelCase، والثوابت UPPER_SNAKE_CASE. والنصوص تُقارن بـ equals(). مخالفة هذه القواعد تُعتبر خطأ "Buona Norma" في التصحيح.',
            },
          ],
          esercizio: {
            titolo: 'Correggi i nomi (Buona Norma)',
            consegna: 'Il codice funziona ma viola le regole di denominazione. Correggi i nomi di classe, variabili e costante (puoi usare «Applica Correzione» nel Feedback del Professore) e fai stampare «Corso: Java, studenti: 25».',
            consegnaAr: 'الكود يعمل لكنه يخالف قواعد التسمية. صحّح أسماء الصنف والمتغيرات والثابت (يمكنك استخدام زر «Applica Correzione» في ملاحظات الأستاذ) واجعله يطبع «Corso: Java, studenti: 25».',
            codice: `public class registro_corso {

    public static void main(String[] args) {
        final int maxStudenti = 30;
        int Numero_Studenti = 25;
        String NomeCorso = "Java";
        if (Numero_Studenti <= maxStudenti) {
            System.out.println("Corso: " + NomeCorso + ", studenti: " + Numero_Studenti);
        }
    }
}`,
            verifiche: [
              { tipo: 'norma', regole: ['camel-case', 'pascal-case', 'costante-maiuscolo'], msg: 'Nessuna violazione delle regole di denominazione.', msgAr: 'لا توجد مخالفات لقواعد التسمية.' },
              { tipo: 'output', atteso: 'Corso: Java, studenti: 25', msg: 'L\'output deve restare «Corso: Java, studenti: 25».', msgAr: 'يجب أن تبقى المخرجات «Corso: Java, studenti: 25».' },
            ],
            soluzione: `public class RegistroCorso {

    public static void main(String[] args) {
        final int MAX_STUDENTI = 30;
        int numeroStudenti = 25;
        String nomeCorso = "Java";
        if (numeroStudenti <= MAX_STUDENTI) {
            System.out.println("Corso: " + nomeCorso + ", studenti: " + numeroStudenti);
        }
    }
}`,
          },
        },
      ],
    },

    // ═══════════════════════════════ MODULO 2 ═══════════════════════════════
    {
      id: 'm2', numero: 2, colore: '#A371F7', icona: 'flow',
      titolo: 'Controllo del Flusso e Cicli',
      titoloAr: 'التحكم في سير البرنامج والحلقات',
      descr: 'if-else, switch, cicli for/while/do-while, visibilità delle variabili e salti strutturati.',
      lezioni: [
        {
          id: 'm2l1', titolo: 'Istruzioni condizionali: if-else e switch', durata: '12 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Prendere decisioni',
              frasi: [
                {
                  it: 'L\'istruzione if esegue un blocco di codice solo se la condizione booleana tra parentesi è vera.',
                  t: 'Istruzione condizionale (if)', ar: 'تعليمة if تنفّذ كتلة من الكود فقط إذا كان الشرط المنطقي بين القوسين صحيحاً.',
                  ex: 'الشرط يجب أن يكون تعبيراً من النوع `boolean` (مثل `voto >= 18`). في Java لا يمكن استخدام عدد كشرط كما في C: كتابة `if (x = 5)` خطأ ترجمة.',
                  bn: 'Usa sempre le parentesi graffe, anche per una sola istruzione.', bnAr: 'استخدم الأقواس { } دائماً حتى لو كانت تعليمة واحدة.',
                },
                {
                  it: 'Il ramo else viene eseguito quando la condizione è falsa; con else if si possono concatenare più alternative.',
                  t: 'else / else if', ar: 'يُنفَّذ فرع else عندما يكون الشرط خاطئاً، ومع else if يمكن ربط عدة بدائل متتالية.',
                  ex: 'في سلسلة `if / else if / else` تُفحص الشروط بالترتيب من الأعلى، وأول شرط صحيح يُنفَّذ فرعه فقط ويتم تجاهل الباقي. لذلك يهم ترتيب الشروط.',
                  bn: 'Ordina le condizioni in modo che ogni ramo sia raggiungibile.', bnAr: 'رتّب الشروط بحيث يمكن الوصول إلى كل فرع.',
                },
                {
                  it: 'Gli operatori logici && (AND), || (OR) e ! (NOT) combinano più condizioni e vengono valutati in cortocircuito.',
                  t: 'Operatori logici e cortocircuito', ar: 'المعاملات المنطقية && (و) و || (أو) و ! (نفي) تجمع عدة شروط وتُقيَّم بطريقة الدائرة القصيرة.',
                  ex: 'الدائرة القصيرة (short-circuit): في `a && b` إذا كان `a` خاطئاً لا يُقيَّم `b` أصلاً. هذا مفيد للحماية: `if (s != null && s.length() > 0)` لا يسبب NullPointerException.',
                  bn: 'Sfrutta il cortocircuito per proteggerti da null e da indici non validi.', bnAr: 'استفد من الدائرة القصيرة للحماية من null ومن الفهارس غير الصالحة.',
                },
                {
                  it: 'Lo switch confronta un valore con una serie di costanti case; ogni case dovrebbe terminare con break.',
                  t: 'Selezione multipla (switch)', ar: 'تعليمة switch تقارن قيمة بسلسلة من الثوابت case، ويجب أن تنتهي كل حالة بـ break.',
                  ex: 'بدون `break` يحدث "السقوط" (fall-through): يستمر التنفيذ إلى الحالة التالية حتى لو لم تتطابق. `switch` يعمل مع `int` و`char` و`String`. الحالة `default` تلتقط القيم غير المتوقعة.',
                  bn: 'Prevedi sempre il caso default; il break è ammesso solo nello switch.', bnAr: 'أضف دائماً حالة default؛ واستخدام break مقبول داخل switch فقط.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'Esito.java', esegui: true,
              codice: `public class Esito {

    private static final int VOTO_MINIMO = 18;
    private static final int VOTO_MASSIMO = 30;

    public static void main(String[] args) {
        int voto = 30;
        boolean lode = true;

        if (voto < VOTO_MINIMO) {
            System.out.println("Respinto");
        } else if (voto == VOTO_MASSIMO && lode) {
            System.out.println("30 e Lode!");
        } else {
            System.out.println("Promosso con " + voto);
        }

        char giorno = 'L';
        switch (giorno) {
            case 'L':
                System.out.println("Lezione di Programmazione");
                break;
            case 'M':
                System.out.println("Laboratorio");
                break;
            default:
                System.out.println("Studio individuale");
                break;
        }
    }
}`,
              note: [
                ['private static final int VOTO_MINIMO', { t: 'Costante di classe', ar: 'ثابت على مستوى الصنف', ex: '`static final` يعني ثابتاً واحداً مشتركاً للصنف كله (يُخزَّن في منطقة الأصناف وليس داخل كل كائن). القيمة 18 أصبح لها اسم واضح بدل أن تكون "رقماً سحرياً".', bn: 'Nessun numero magico nelle condizioni.', bnAr: 'لا أرقام سحرية داخل الشروط.' }],
                ['voto == VOTO_MASSIMO && lode', { t: 'Condizione composta (&&)', ar: 'شرط مركّب', ex: 'الشرط صحيح فقط إذا تحقق الطرفان. لاحظ أننا نكتب `lode` مباشرة وليس `lode == true` لأن المتغير منطقي أصلاً.', bn: 'Mai confrontare un boolean con true/false.', bnAr: 'لا تقارن متغيراً منطقياً مع true أو false.' }],
                ['switch (giorno)', { t: 'switch su char', ar: 'switch على حرف', ex: 'تقارن JVM قيمة `giorno` مع كل `case` وتقفز إلى المطابقة. مع `\'L\'` يُطبع "Lezione di Programmazione" ثم `break` يُخرجنا من switch.', bn: 'Ogni case termina con break.', bnAr: 'كل حالة تنتهي بـ break.' }],
              ],
            },
          ],
          esercizio: {
            titolo: 'Classifica il voto',
            consegna: 'Dato int voto = 24, stampa «Respinto» se voto < 18, «Sufficiente» se 18-23, «Buono» se 24-27 e «Ottimo» altrimenti. Usa costanti per le soglie.',
            consegnaAr: 'إذا كان int voto = 24 فاطبع «Respinto» إذا كان أقل من 18، و«Sufficiente» من 18 إلى 23، و«Buono» من 24 إلى 27، و«Ottimo» غير ذلك. استخدم ثوابت للحدود.',
            codice: `public class Giudizio {

    public static void main(String[] args) {
        int voto = 24;
        // Scrivi la catena if / else if / else

    }
}`,
            verifiche: [
              { tipo: 'output', atteso: 'Buono', msg: 'Con voto = 24 l\'output deve essere «Buono».', msgAr: 'عندما تكون الدرجة 24 يجب أن تكون المخرجات «Buono».' },
              { tipo: 'codice', re: 'else\\s+if', msg: 'Usa una catena if / else if.', msgAr: 'استخدم سلسلة if / else if.' },
              { tipo: 'norma', regole: ['numero-magico', 'booleano-ridondante', 'graffe'], msg: 'Nessun numero magico: dichiara le soglie come costanti final.', msgAr: 'لا أرقام سحرية: صرّح عن الحدود كثوابت final.' },
            ],
            soluzione: `public class Giudizio {

    private static final int SOGLIA_SUFFICIENTE = 18;
    private static final int SOGLIA_BUONO = 24;
    private static final int SOGLIA_OTTIMO = 28;

    public static void main(String[] args) {
        int voto = 24;
        if (voto < SOGLIA_SUFFICIENTE) {
            System.out.println("Respinto");
        } else if (voto < SOGLIA_BUONO) {
            System.out.println("Sufficiente");
        } else if (voto < SOGLIA_OTTIMO) {
            System.out.println("Buono");
        } else {
            System.out.println("Ottimo");
        }
    }
}`,
          },
        },
        {
          id: 'm2l2', titolo: 'Cicli e visibilità delle variabili (scope)', durata: '15 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Ripetere le istruzioni',
              frasi: [
                {
                  it: 'Il ciclo for si usa quando il numero di iterazioni è noto in anticipo e raccoglie inizializzazione, condizione e aggiornamento in una sola riga.',
                  t: 'Ciclo for', ar: 'تُستخدم حلقة for عندما يكون عدد الدورات معروفاً مسبقاً، وتجمع التهيئة والشرط والتحديث في سطر واحد.',
                  ex: 'في `for (int i = 0; i < n; i++)`: التهيئة تُنفَّذ مرة واحدة، والشرط يُفحص قبل كل دورة، والتحديث بعد كل دورة. إذا كان الشرط خاطئاً من البداية لا يُنفَّذ الجسم أبداً.',
                  bn: 'Non modificare il contatore all\'interno del corpo del for.', bnAr: 'لا تعدّل متغير العدّاد داخل جسم حلقة for.',
                },
                {
                  it: 'Il ciclo while ripete il corpo finché la condizione resta vera e si usa quando il numero di iterazioni non è noto.',
                  t: 'Ciclo while', ar: 'حلقة while تكرر الجسم طالما بقي الشرط صحيحاً، وتُستخدم عندما يكون عدد الدورات غير معروف.',
                  ex: 'يجب أن يغيّر جسم الحلقة شيئاً في الشرط، وإلا تصبح الحلقة لا نهائية (ciclo infinito) ويتوقف البرنامج عن الاستجابة. المحاكي هنا يوقف التنفيذ تلقائياً بعد عدد كبير من العمليات.',
                  bn: 'Inserisci la condizione di uscita nel while, ad esempio con una variabile boolean trovato.', bnAr: 'ضع شرط الخروج داخل while نفسه، مثلاً باستخدام متغير منطقي trovato.',
                },
                {
                  it: 'Il ciclo do-while esegue il corpo almeno una volta, perché la condizione viene verificata alla fine.',
                  t: 'Ciclo do-while', ar: 'حلقة do-while تنفّذ الجسم مرة واحدة على الأقل، لأن الشرط يُفحص في النهاية.',
                  ex: 'مناسبة للحالات التي يجب أن يحدث فيها شيء مرة أولاً ثم نقرر التكرار، مثل عرض قائمة خيارات وطلب الإدخال حتى يكون صحيحاً. لا تنسَ الفاصلة المنقوطة بعد `while (...)`.',
                  bn: 'Usa do-while per menu e validazione dell\'input.', bnAr: 'استخدم do-while للقوائم والتحقق من الإدخال.',
                },
                {
                  it: 'La visibilità (scope) di una variabile locale va dal punto della dichiarazione fino alla fine del blocco in cui è dichiarata.',
                  t: 'Visibilità (scope)', ar: 'نطاق رؤية المتغير المحلي يمتد من مكان التصريح عنه حتى نهاية الكتلة التي صُرّح فيها.',
                  ex: 'المتغير `i` المعرّف داخل `for` لا يوجد بعد انتهاء الحلقة، واستخدامه خارجها يسبب خطأ "cannot find symbol". عند خروج التنفيذ من الكتلة يُحذف المتغير من إطار الـStack.',
                  bn: 'Dichiara le variabili nello scope più piccolo possibile.', bnAr: 'صرّح عن المتغيرات في أضيق نطاق ممكن.',
                },
                {
                  it: 'Le istruzioni break e continue dentro i cicli sono salti non strutturati e la buona norma ne sconsiglia l\'uso.',
                  t: 'Salti non strutturati', ar: 'الأمران break و continue داخل الحلقات قفزات غير مُهيكلة، وقواعد البرمجة الجيدة لا تنصح باستخدامهما.',
                  ex: 'البرمجة المُهيكلة تشترط أن يكون لكل حلقة مدخل واحد ومخرج واحد. الحلقة التي تحتوي على `break` لها عدة نقاط خروج ويصعب فهم متى تنتهي. الحل: متغير منطقي مثل `trovato` يُضاف إلى شرط الحلقة.',
                  bn: 'Niente break/continue nei cicli: usa una condizione booleana esplicita.', bnAr: 'لا تستخدم break/continue في الحلقات: استخدم شرطاً منطقياً صريحاً.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'Ricerca.java', esegui: true,
              codice: `public class Ricerca {

    public static void main(String[] args) {
        int[] voti = {24, 18, 30, 27};
        int somma = 0;
        for (int i = 0; i < voti.length; i++) {
            somma += voti[i];
        }
        System.out.println("Somma: " + somma);

        int cercato = 30;
        boolean trovato = false;
        int indice = 0;
        while (indice < voti.length && !trovato) {
            if (voti[indice] == cercato) {
                trovato = true;
            } else {
                indice++;
            }
        }
        if (trovato) {
            System.out.println("Trovato in posizione " + indice);
        }
    }
}`,
              note: [
                ['int[] voti', { t: 'Array di interi', ar: 'مصفوفة أعداد صحيحة', ex: 'المصفوفة كائن في الـHeap يحتوي على 4 خانات متتالية، والمتغير `voti` في الـStack يحمل مرجعاً إليها. حجمها ثابت ويُعرف من `voti.length`.', bn: 'Nomi al plurale per gli array (voti, studenti).', bnAr: 'استخدم صيغة الجمع لأسماء المصفوفات (voti، studenti).' }],
                ['for (int i = 0; i < voti.length', { t: 'Scansione con indice', ar: 'المرور على المصفوفة بالفهرس', ex: 'الفهرس يبدأ من 0 وينتهي عند `length - 1`. الشرط `i < voti.length` (وليس `<=`) يمنع الخطأ `ArrayIndexOutOfBoundsException`. المتغير `i` موجود فقط داخل الحلقة.', bn: 'Usa length, mai la dimensione scritta a mano.', bnAr: 'استخدم length وليس الحجم مكتوباً يدوياً.' }],
                ['while (indice < voti.length && !trovato)', { t: 'Ricerca con flag booleano', ar: 'البحث بعلم منطقي', ex: 'شرط الخروج كامل داخل `while`: نتوقف إما عند نهاية المصفوفة أو عند إيجاد العنصر. لا نحتاج إلى `break`، وهذه هي الطريقة التي يطلبها الأساتذة في الامتحان. الدائرة القصيرة في `&&` تحمي من تجاوز الحدود.', bn: 'Condizione di uscita esplicita, nessun break.', bnAr: 'شرط خروج صريح دون break.' }],
              ],
            },
            {
              tipo: 'norma', it: 'Ogni ciclo ha un solo punto di uscita: la condizione. Evita break e continue nei cicli (break è ammesso solo nello switch) e dichiara le variabili nello scope più piccolo.',
              ar: 'لكل حلقة نقطة خروج واحدة هي الشرط. تجنب break و continue داخل الحلقات (break مسموح داخل switch فقط)، وصرّح عن المتغيرات في أضيق نطاق ممكن.',
            },
          ],
          esercizio: {
            titolo: 'Elimina il break',
            consegna: 'Il programma trova il primo multiplo di 7 nell\'array usando break. Riscrivilo senza break, con una variabile boolean trovato nella condizione del ciclo. Deve stampare «Primo multiplo di 7: 21».',
            consegnaAr: 'البرنامج يجد أول مضاعف للعدد 7 في المصفوفة باستخدام break. أعد كتابته بدون break باستخدام متغير منطقي trovato داخل شرط الحلقة. يجب أن يطبع «Primo multiplo di 7: 21».',
            codice: `public class Multipli {

    private static final int DIVISORE = 7;

    public static void main(String[] args) {
        int[] numeri = {4, 10, 21, 35, 9};
        int risultato = 0;
        for (int i = 0; i < numeri.length; i++) {
            if (numeri[i] % DIVISORE == 0) {
                risultato = numeri[i];
                break;
            }
        }
        System.out.println("Primo multiplo di " + DIVISORE + ": " + risultato);
    }
}`,
            verifiche: [
              { tipo: 'output', atteso: 'Primo multiplo di 7: 21', msg: 'L\'output deve essere «Primo multiplo di 7: 21».', msgAr: 'يجب أن تكون المخرجات «Primo multiplo di 7: 21».' },
              { tipo: 'norma', regole: ['salto-non-strutturato'], msg: 'Nessun break/continue nei cicli.', msgAr: 'لا يوجد break أو continue داخل الحلقات.' },
              { tipo: 'codice', re: 'boolean\\s+trovato', msg: 'Usa una variabile boolean trovato.', msgAr: 'استخدم متغيراً منطقياً اسمه trovato.' },
            ],
            soluzione: `public class Multipli {

    private static final int DIVISORE = 7;

    public static void main(String[] args) {
        int[] numeri = {4, 10, 21, 35, 9};
        int risultato = 0;
        boolean trovato = false;
        int i = 0;
        while (i < numeri.length && !trovato) {
            if (numeri[i] % DIVISORE == 0) {
                risultato = numeri[i];
                trovato = true;
            }
            i++;
        }
        System.out.println("Primo multiplo di " + DIVISORE + ": " + risultato);
    }
}`,
          },
        },
      ],
    },

    // ═══════════════════════════════ MODULO 3 ═══════════════════════════════
    {
      id: 'm3', numero: 3, colore: '#3FB950', icona: 'box',
      titolo: 'Programmazione Orientata agli Oggetti',
      titoloAr: 'البرمجة كائنية التوجه (OOP)',
      descr: 'Classi e oggetti, costruttori e overloading, incapsulamento con get/set, memoria Stack e Heap.',
      lezioni: [
        {
          id: 'm3l1', titolo: 'Classi, oggetti e costruttori', durata: '16 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Dallo stampo all\'oggetto',
              frasi: [
                {
                  it: 'Una classe è uno stampo che descrive lo stato (attributi) e il comportamento (metodi) di una categoria di oggetti.',
                  t: 'Classe (attributi e metodi)', ar: 'الصنف قالب يصف الحالة (الحقول) والسلوك (الدوال) لفئة من الكائنات.',
                  ex: 'الصنف `ContoCorrente` يحدد أن لكل حساب "صاحب" و"رصيد" (الحالة)، وأنه يمكن "الإيداع" و"السحب" (السلوك). الصنف نفسه لا يشغل ذاكرة للبيانات؛ هو مجرد مخطط.',
                  bn: 'Una classe rappresenta un solo concetto (principio di singola responsabilità).', bnAr: 'كل صنف يمثل مفهوماً واحداً فقط (مبدأ المسؤولية الواحدة).',
                },
                {
                  it: 'Un oggetto è un\'istanza della classe, creata a tempo di esecuzione con l\'operatore new e memorizzata nello Heap.',
                  t: 'Oggetto (istanza)', ar: 'الكائن نسخة (instance) من الصنف، يُنشأ أثناء التشغيل بالمعامل new ويُخزَّن في الـHeap.',
                  ex: '`new ContoCorrente("Mario", 1000)` تفعل ثلاثة أشياء: تحجز مساحة للكائن في الـHeap، تهيئ الحقول بقيم افتراضية، ثم تستدعي المُنشئ. النتيجة مرجع (عنوان مثل @4a9f) يُخزَّن في متغير على الـStack.',
                  bn: 'Ogni oggetto ha il proprio stato: due conti diversi hanno saldi indipendenti.', bnAr: 'لكل كائن حالته الخاصة: حسابان مختلفان لهما رصيدان مستقلان.',
                },
                {
                  it: 'Il costruttore è un metodo speciale con lo stesso nome della classe e senza tipo di ritorno, che inizializza il nuovo oggetto.',
                  t: 'Costruttore', ar: 'المُنشئ دالة خاصة تحمل اسم الصنف نفسه وليس لها نوع إرجاع، وتقوم بتهيئة الكائن الجديد.',
                  ex: 'إذا لم تكتب أي مُنشئ يضيف المترجم مُنشئاً افتراضياً بدون معاملات. لكن بمجرد أن تكتب مُنشئاً بمعاملات يختفي الافتراضي، فيصبح `new ContoCorrente()` خطأ ترجمة.',
                  bn: 'Il costruttore deve lasciare l\'oggetto in uno stato valido e coerente.', bnAr: 'يجب أن يترك المُنشئ الكائن في حالة صحيحة ومتسقة.',
                },
                {
                  it: 'L\'overloading permette di definire più costruttori o metodi con lo stesso nome ma con firme diverse.',
                  t: 'Overloading (sovraccarico)', ar: 'التحميل الزائد يسمح بتعريف عدة مُنشئات أو دوال بنفس الاسم لكن بتواقيع مختلفة.',
                  ex: 'التوقيع (firma) = اسم الدالة + عدد وأنواع وترتيب المعاملات. نوع الإرجاع ليس جزءاً من التوقيع. المترجم يختار النسخة المناسبة حسب المعاملات الممرَّرة عند الاستدعاء (ربط ساكن في وقت الترجمة).',
                  bn: 'Evita la duplicazione: un costruttore può richiamarne un altro con this(...).', bnAr: 'تجنب التكرار: يمكن لمُنشئ أن يستدعي آخر بـ this(...).',
                },
                {
                  it: 'La parola chiave this è un riferimento all\'oggetto corrente e distingue gli attributi dai parametri con lo stesso nome.',
                  t: 'Riferimento this', ar: 'الكلمة this مرجع إلى الكائن الحالي، وتميّز الحقول عن المعاملات التي تحمل نفس الاسم.',
                  ex: 'في `this.titolare = titolare;` الطرف الأيسر هو حقل الكائن في الـHeap، والأيمن هو المعامل المحلي في الـStack. بدون `this` سنُسند المعامل إلى نفسه ويبقى الحقل `null`، وهو خطأ شائع جداً.',
                  bn: 'Usa this.attributo nei costruttori e nei setter.', bnAr: 'استخدم this.الحقل داخل المُنشئات ودوال set.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'ContoCorrente.java', esegui: true,
              codice: `class ContoCorrente {

    private String titolare;
    private double saldo;

    public ContoCorrente(String titolare) {
        this(titolare, 0.0);
    }

    public ContoCorrente(String titolare, double saldoIniziale) {
        this.titolare = titolare;
        this.saldo = saldoIniziale;
    }

    public void deposita(double importo) {
        saldo += importo;
    }

    public String toString() {
        return titolare + " - saldo: " + saldo + " euro";
    }
}

public class Main {

    public static void main(String[] args) {
        ContoCorrente c1 = new ContoCorrente("Mario Rossi", 1000.0);
        ContoCorrente c2 = new ContoCorrente("Lucia Bianchi");
        c1.deposita(500.0);
        System.out.println(c1);
        System.out.println(c2);
    }
}`,
              note: [
                ['class ContoCorrente', { t: 'Definizione della classe', ar: 'تعريف الصنف', ex: 'نعرّف صنفاً جديداً `ContoCorrente` (حساب جاري). هو القالب الذي سنصنع منه كائنات الحسابات. ليس `public` لأن الصنف العام في هذا الملف هو `Main`.', bn: 'Sostantivo singolare in PascalCase.', bnAr: 'اسم مفرد بأسلوب PascalCase.' }],
                ['private String titolare', { t: 'Attributo privato', ar: 'حقل خاص', ex: 'كل كائن `ContoCorrente` سيحمل نسخته الخاصة من هذا الحقل داخل الـHeap. `private` تعني أن لا أحد خارج الصنف يستطيع الوصول إليه مباشرة (التغليف).', bn: 'Attributi sempre private.', bnAr: 'الحقول دائماً private.' }],
                ['public ContoCorrente(String titolare) {', { t: 'Costruttore sovraccarico', ar: 'مُنشئ محمَّل (overloaded)', ex: 'هذا المُنشئ الأول يقبل معاملاً واحداً فقط، وهو نسخة "محمّلة" من المُنشئ الثاني. التوقيع `ContoCorrente(String)` يختلف عن `ContoCorrente(String, double)`.', bn: 'Overloading con firme diverse.', bnAr: 'تحميل زائد بتواقيع مختلفة.' }],
                ['this(titolare, 0.0)', { t: 'Concatenazione di costruttori', ar: 'تسلسل المُنشئات', ex: '`this(...)` يستدعي المُنشئ الآخر بمعاملين ويمرر رصيداً ابتدائياً 0.0. هكذا لا نكرر كود التهيئة. يجب أن يكون أول تعليمة في المُنشئ.', bn: 'Riusa il codice con this(...).', bnAr: 'أعد استخدام الكود بـ this(...).' }],
                ['this.titolare = titolare', { t: 'Inizializzazione con this', ar: 'التهيئة بـ this', ex: '`this.titolare` هو الحقل داخل الكائن في الـHeap، و`titolare` هو المعامل في إطار المُنشئ على الـStack. نسخ القيمة (هنا مرجع النص) من المعامل إلى الحقل.', bn: 'this distingue attributo e parametro.', bnAr: 'this تميّز الحقل عن المعامل.' }],
                ['public String toString()', { t: 'Ridefinizione di toString', ar: 'إعادة تعريف toString', ex: 'كل صنف يرث `toString()` من `Object`. بإعادة تعريفها نحدد كيف يُطبع الكائن: `System.out.println(c1)` يستدعيها تلقائياً. بدونها يُطبع شيء مثل `ContoCorrente@4a9f`.', bn: 'Ridefinisci toString per una stampa leggibile.', bnAr: 'أعد تعريف toString لطباعة مفهومة.' }],
                ['ContoCorrente c1 = new', { t: 'Creazione di un oggetto', ar: 'إنشاء كائن', ex: 'الذاكرة: يُحجز كائن في الـHeap (مثل @4a9f) فيه `titolare` و`saldo`، ويُستدعى المُنشئ بمعاملين، ثم يُخزَّن العنوان في المتغير `c1` على الـStack. اضغط "Esegui passo-passo" لترى ذلك.', bn: 'Riferimenti con nomi significativi.', bnAr: 'أسماء معبّرة للمراجع.' }],
                ['c1.deposita(500.0)', { t: 'Invocazione di un metodo d\'istanza', ar: 'استدعاء دالة على كائن', ex: 'تُنشئ JVM إطاراً جديداً لـ `deposita` في الـStack يحتوي على `this` (= عنوان c1) و`importo` = 500.0، فيتغير حقل `saldo` في كائن c1 فقط وليس في c2.', bn: 'I metodi modificano lo stato dell\'oggetto su cui sono invocati.', bnAr: 'الدوال تغيّر حالة الكائن الذي استُدعيت عليه فقط.' }],
              ],
            },
          ],
          esercizio: {
            titolo: 'Crea la classe Studente',
            consegna: 'Completa la classe Studente con gli attributi private nome e matricola, un costruttore con due parametri e toString() che restituisca «nome (matricola)». Nel main crea lo studente «Anna Verdi», 123456 e stampalo.',
            consegnaAr: 'أكمل الصنف Studente بحقلين خاصين nome و matricola، ومُنشئ بمعاملين، ودالة toString() تُعيد «nome (matricola)». في main أنشئ الطالب «Anna Verdi» برقم 123456 واطبعه.',
            codice: `class Studente {
    // attributi, costruttore e toString

}

public class Main {

    public static void main(String[] args) {
        // crea e stampa lo studente

    }
}`,
            verifiche: [
              { tipo: 'output', atteso: 'Anna Verdi (123456)', msg: 'La stampa deve essere «Anna Verdi (123456)».', msgAr: 'يجب أن تكون المخرجات «Anna Verdi (123456)».' },
              { tipo: 'codice', re: 'private\\s+String\\s+nome', msg: 'Dichiara private String nome.', msgAr: 'صرّح عن الحقل private String nome.' },
              { tipo: 'codice', re: 'Studente\\s*\\(\\s*String', msg: 'Scrivi un costruttore Studente(String nome, ...).', msgAr: 'اكتب مُنشئاً Studente(String nome, ...).' },
              { tipo: 'norma', regole: ['incapsulamento', 'camel-case'], msg: 'Attributi private e nomi in camelCase.', msgAr: 'الحقول private والأسماء بأسلوب camelCase.' },
            ],
            soluzione: `class Studente {

    private String nome;
    private int matricola;

    public Studente(String nome, int matricola) {
        this.nome = nome;
        this.matricola = matricola;
    }

    public String toString() {
        return nome + " (" + matricola + ")";
    }
}

public class Main {

    public static void main(String[] args) {
        Studente s = new Studente("Anna Verdi", 123456);
        System.out.println(s);
    }
}`,
          },
        },
        {
          id: 'm3l2', titolo: 'Incapsulamento: private, get e set', durata: '14 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Proteggere lo stato',
              frasi: [
                {
                  it: 'L\'incapsulamento nasconde lo stato interno di un oggetto e lo rende accessibile solo tramite metodi pubblici controllati.',
                  t: 'Incapsulamento', ar: 'التغليف يخفي الحالة الداخلية للكائن ويجعل الوصول إليها ممكناً فقط عبر دوال عامة مُتحكَّم بها.',
                  ex: 'الفكرة: الكائن مسؤول عن صحة بياناته. لو كان `saldo` عاماً لاستطاع أي كود أن يكتب `conto.saldo = -1000;` ويكسر قواعد البنك. مع التغليف يمر كل تعديل عبر دالة تتحقق من القيمة.',
                  bn: 'Tutti gli attributi private: è la regola più controllata all\'esame.', bnAr: 'جميع الحقول private: هذه أكثر قاعدة يتم التحقق منها في الامتحان.',
                },
                {
                  it: 'I modificatori di accesso private, protected, public e il livello di pacchetto stabiliscono chi può vedere un membro della classe.',
                  t: 'Modificatori di accesso', ar: 'محددات الوصول private و protected و public ومستوى الحزمة تحدد من يستطيع رؤية عضو من أعضاء الصنف.',
                  ex: '`private`: داخل الصنف فقط. بدون محدد (package): داخل نفس الحزمة. `protected`: الحزمة + الأصناف الوارثة. `public`: الجميع. محاولة الوصول إلى حقل `private` من صنف آخر تسبب خطأ ترجمة.',
                  bn: 'Usa il livello di accesso più restrittivo possibile.', bnAr: 'استخدم أضيق مستوى وصول ممكن.',
                },
                {
                  it: 'Un metodo get (accessore) restituisce il valore di un attributo senza esporlo direttamente.',
                  t: 'Metodo accessore (getter)', ar: 'دالة get (القراءة) تُعيد قيمة الحقل دون كشفه مباشرة.',
                  ex: 'الاسم يتبع النمط `getNomeAttributo()`، وللقيم المنطقية `isAttivo()`. لا نكتب getter لكل حقل تلقائياً، بل فقط لما يحتاج العالم الخارجي إلى معرفته.',
                  bn: 'Nomi: getSaldo(), isAttivo().', bnAr: 'الأسماء: getSaldo() و isAttivo().',
                },
                {
                  it: 'Un metodo set (modificatore) cambia un attributo solo dopo averne verificato la validità.',
                  t: 'Metodo modificatore (setter)', ar: 'دالة set (التعديل) تغيّر الحقل فقط بعد التحقق من صحة القيمة.',
                  ex: 'الـsetter ليس مجرد `this.x = x;` بل المكان المناسب لفرض القواعد: مثلاً رفض المبلغ السالب برمي `IllegalArgumentException`. بعض الحقول لا يجب أن يكون لها setter أصلاً (مثل الرقم التسلسلي).',
                  bn: 'Nei setter valida sempre il parametro; per alcuni attributi non fornire il setter.', bnAr: 'تحقق دائماً من المعامل داخل setter، ولا توفّر setter لبعض الحقول إطلاقاً.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'ContoSicuro.java', esegui: true,
              codice: `class ContoCorrente {

    private final String iban;
    private double saldo;

    public ContoCorrente(String iban) {
        this.iban = iban;
        this.saldo = 0.0;
    }

    public double getSaldo() {
        return saldo;
    }

    public String getIban() {
        return iban;
    }

    public void deposita(double importo) {
        if (importo <= 0) {
            throw new IllegalArgumentException("Importo non valido: " + importo);
        }
        saldo += importo;
    }

    public boolean preleva(double importo) {
        boolean eseguito = false;
        if (importo > 0 && importo <= saldo) {
            saldo -= importo;
            eseguito = true;
        }
        return eseguito;
    }
}

public class Main {

    public static void main(String[] args) {
        ContoCorrente conto = new ContoCorrente("IT60X0542811101000000123456");
        conto.deposita(200.0);
        boolean ok = conto.preleva(500.0);
        System.out.println("Prelievo riuscito? " + ok);
        System.out.println("Saldo: " + conto.getSaldo());
    }
}`,
              note: [
                ['private final String iban', { t: 'Attributo immutabile (final)', ar: 'حقل غير قابل للتغيير', ex: 'رقم IBAN لا يتغير بعد إنشاء الحساب، لذا هو `private final`: يُسند مرة واحدة في المُنشئ ولا يوجد له setter.', bn: 'Attributi che non cambiano: final e senza setter.', bnAr: 'الحقول التي لا تتغير: final وبدون setter.' }],
                ['public double getSaldo()', { t: 'Getter', ar: 'دالة قراءة', ex: 'يمكن للعالم الخارجي "قراءة" الرصيد، لكن لا يمكنه تغييره مباشرة. لا يوجد `setSaldo()` عمداً: الرصيد يتغير فقط بالإيداع والسحب.', bn: 'Esponi solo ciò che serve.', bnAr: 'اكشف فقط ما هو ضروري.' }],
                ['if (importo <= 0)', { t: 'Validazione del parametro', ar: 'التحقق من المعامل', ex: 'قبل تغيير الحالة نتحقق من صحة المدخل. المبلغ السالب أو الصفر غير مقبول، فنرمي استثناء `IllegalArgumentException` (unchecked) لأن الخطأ من المستدعي.', bn: 'Valida sempre i parametri nei metodi pubblici.', bnAr: 'تحقق دائماً من معاملات الدوال العامة.' }],
                ['public boolean preleva', { t: 'Metodo con esito booleano', ar: 'دالة تُعيد نتيجة منطقية', ex: 'السحب قد يفشل لسبب طبيعي (رصيد غير كافٍ)، لذا تُعيد الدالة `boolean` بدلاً من رمي استثناء: الاستثناءات للحالات غير الطبيعية فقط.', bn: 'Un solo return alla fine, con una variabile esito.', bnAr: 'أمر return واحد في النهاية مع متغير للنتيجة.' }],
              ],
            },
            {
              tipo: 'norma', it: 'Attributi sempre private; getter solo dove servono; setter e metodi modificatori validano i parametri; gli attributi che non cambiano sono final.',
              ar: 'الحقول دائماً private؛ الـgetters فقط عند الحاجة؛ الـsetters ودوال التعديل تتحقق من المعاملات؛ والحقول التي لا تتغير تكون final.',
            },
          ],
          esercizio: {
            titolo: 'Ripara l\'incapsulamento',
            consegna: 'La classe Termometro ha attributi pubblici. Rendili private, aggiungi getTemperatura() e un setter che rifiuti valori sotto -273.15 lanciando IllegalArgumentException. Il main deve stampare «Temperatura: 21.5».',
            consegnaAr: 'الصنف Termometro يحتوي على حقول عامة. اجعلها private وأضف getTemperatura() ودالة set ترفض القيم الأقل من -273.15 برمي IllegalArgumentException. يجب أن تطبع main «Temperatura: 21.5».',
            codice: `class Termometro {
    public double temperatura;
    public String luogo;

    public Termometro(String luogo) {
        this.luogo = luogo;
    }
}

public class Main {

    public static void main(String[] args) {
        Termometro t = new Termometro("Aula A");
        t.temperatura = 21.5;
        System.out.println("Temperatura: " + t.temperatura);
    }
}`,
            verifiche: [
              { tipo: 'norma', regole: ['incapsulamento'], msg: 'Nessun attributo public o senza modificatore.', msgAr: 'لا توجد حقول عامة أو بدون محدد وصول.' },
              { tipo: 'codice', re: 'getTemperatura\\s*\\(', msg: 'Aggiungi il metodo getTemperatura().', msgAr: 'أضف الدالة getTemperatura().' },
              { tipo: 'codice', re: 'IllegalArgumentException', msg: 'Il setter deve lanciare IllegalArgumentException per valori non validi.', msgAr: 'يجب أن ترمي دالة set الاستثناء IllegalArgumentException للقيم غير الصالحة.' },
              { tipo: 'output', atteso: 'Temperatura: 21.5', msg: 'L\'output deve essere «Temperatura: 21.5».', msgAr: 'يجب أن تكون المخرجات «Temperatura: 21.5».' },
            ],
            soluzione: `class Termometro {

    private static final double ZERO_ASSOLUTO = -273.15;

    private double temperatura;
    private final String luogo;

    public Termometro(String luogo) {
        this.luogo = luogo;
    }

    public double getTemperatura() {
        return temperatura;
    }

    public void setTemperatura(double temperatura) {
        if (temperatura < ZERO_ASSOLUTO) {
            throw new IllegalArgumentException("Sotto lo zero assoluto");
        }
        this.temperatura = temperatura;
    }
}

public class Main {

    public static void main(String[] args) {
        Termometro t = new Termometro("Aula A");
        t.setTemperatura(21.5);
        System.out.println("Temperatura: " + t.getTemperatura());
    }
}`,
          },
        },
        {
          id: 'm3l3', titolo: 'Gestione della memoria: Stack e Heap', durata: '15 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Dove vivono variabili e oggetti',
              frasi: [
                {
                  it: 'Lo Stack contiene un frame per ogni metodo in esecuzione, con i suoi parametri e le sue variabili locali.',
                  t: 'Stack (pila dei record di attivazione)', ar: 'الـStack يحتوي على إطار (frame) لكل دالة قيد التنفيذ، مع معاملاتها ومتغيراتها المحلية.',
                  ex: 'الـStack يعمل بمبدأ LIFO (آخر من يدخل أول من يخرج): عند استدعاء دالة يُضاف إطارها في الأعلى، وعند انتهائها يُزال فوراً مع كل متغيراته. لهذا لا "تتذكر" الدالة متغيراتها المحلية بين استدعاء وآخر.',
                  bn: 'Evita ricorsioni senza caso base: riempiono lo Stack (StackOverflowError).', bnAr: 'تجنب التعاود (recursion) بلا حالة توقف لأنه يملأ الـStack ويسبب StackOverflowError.',
                },
                {
                  it: 'Lo Heap è l\'area di memoria in cui vengono allocati tutti gli oggetti creati con new.',
                  t: 'Heap', ar: 'الـHeap هو منطقة الذاكرة التي تُحجز فيها جميع الكائنات المُنشأة بـ new.',
                  ex: 'الكائنات في الـHeap تبقى موجودة طالما يوجد مرجع واحد على الأقل يشير إليها، حتى بعد انتهاء الدالة التي أنشأتها. حقول الكائن (حتى البدائية مثل `double saldo`) تعيش داخل الكائن في الـHeap.',
                  bn: 'Non creare oggetti inutili dentro i cicli.', bnAr: 'لا تُنشئ كائنات غير ضرورية داخل الحلقات.',
                },
                {
                  it: 'Una variabile di tipo primitivo contiene direttamente il valore, mentre una variabile di tipo riferimento contiene l\'indirizzo di un oggetto.',
                  t: 'Tipi primitivi vs tipi riferimento', ar: 'المتغير من نوع بدائي يحتوي القيمة مباشرة، أما المتغير من نوع مرجعي فيحتوي عنوان الكائن.',
                  ex: '`int x = 5;` → الصندوق `x` فيه الرقم 5. `ContoCorrente c = new ...;` → الصندوق `c` فيه عنوان مثل `@4a9f`، والكائن نفسه في مكان آخر (الـHeap). هذا الفرق هو مفتاح فهم Java كلها.',
                  bn: 'Distingui sempre "il riferimento" da "l\'oggetto" quando spieghi il codice all\'orale.', bnAr: 'ميّز دائماً بين "المرجع" و"الكائن" عند شرح الكود في الامتحان الشفهي.',
                },
                {
                  it: 'L\'assegnazione tra riferimenti copia l\'indirizzo e non l\'oggetto: dopo c2 = c1 entrambe le variabili puntano allo stesso oggetto.',
                  t: 'Aliasing (copia del riferimento)', ar: 'الإسناد بين المراجع ينسخ العنوان وليس الكائن: بعد c2 = c1 يشير المتغيران إلى نفس الكائن.',
                  ex: 'إذا عدّلنا الكائن عبر `c2` سنرى التعديل عبر `c1` أيضاً لأنهما "اسمان مستعاران" (alias) لنفس الكائن. هذا سبب كثير من الأخطاء وأحد أكثر أسئلة "ماذا يطبع هذا الكود؟" تكراراً.',
                  bn: 'Per copiare un oggetto serve crearne uno nuovo (costruttore di copia).', bnAr: 'لنسخ كائن يجب إنشاء كائن جديد (مُنشئ نسخ).',
                },
                {
                  it: 'Quando un oggetto non è più raggiungibile da alcun riferimento, il Garbage Collector libera automaticamente la sua memoria.',
                  t: 'Garbage Collector', ar: 'عندما لا يعود أي مرجع يشير إلى كائن، يقوم جامع القمامة بتحرير ذاكرته تلقائياً.',
                  ex: 'في Java لا نحرر الذاكرة يدوياً كما في C (free). عندما نكتب `c1 = null;` ولا يوجد مرجع آخر، يصبح الكائن "يتيماً" ومؤهلاً للحذف. استخدام مرجع قيمته `null` لاستدعاء دالة يسبب `NullPointerException`.',
                  bn: 'Controlla i riferimenti che possono valere null prima di usarli.', bnAr: 'تحقق من المراجع التي قد تكون null قبل استخدامها.',
                },
              ],
            },
            { tipo: 'schema', variante: 'stack-heap' },
            {
              tipo: 'codice', titolo: 'Memoria.java', esegui: true,
              codice: `class Punto {

    private int x;
    private int y;

    public Punto(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public void sposta(int dx) {
        x += dx;
    }

    public int getX() {
        return x;
    }
}

public class Memoria {

    public static void main(String[] args) {
        int a = 5;
        int b = a;
        b++;
        Punto p1 = new Punto(1, 2);
        Punto p2 = p1;
        p2.sposta(10);
        System.out.println("a = " + a + ", b = " + b);
        System.out.println("p1.x = " + p1.getX());
        p1 = null;
        p2 = new Punto(0, 0);
        System.out.println("Fine");
    }
}`,
              note: [
                ['int b = a', { t: 'Copia di un valore primitivo', ar: 'نسخ قيمة بدائية', ex: '`b` يحصل على نسخة مستقلة من القيمة 5. عندما نزيد `b` لاحقاً لا تتأثر `a` أبداً: لكل متغير صندوقه الخاص في الـStack.', bn: 'I primitivi si copiano per valore.', bnAr: 'القيم البدائية تُنسخ بالقيمة.' }],
                ['Punto p1 = new Punto(1, 2)', { t: 'Oggetto nello Heap', ar: 'كائن في الـHeap', ex: 'يُنشأ كائن `Punto` في الـHeap بحقلين x=1 و y=2، و`p1` في الـStack يحمل عنوانه فقط. شاهد السهم في "Memoria JVM" عند التشغيل خطوة بخطوة.', bn: 'Il riferimento non è l\'oggetto.', bnAr: 'المرجع ليس هو الكائن.' }],
                ['Punto p2 = p1', { t: 'Aliasing', ar: 'نسخ المرجع (اسم مستعار)', ex: 'لا يُنشأ أي كائن جديد! `p2` يحصل على نفس العنوان الموجود في `p1`، فيصبح لدينا سهمان يشيران إلى نفس الكائن.', bn: 'Attenzione agli effetti collaterali dell\'aliasing.', bnAr: 'انتبه للآثار الجانبية للأسماء المستعارة.' }],
                ['p2.sposta(10)', { t: 'Modifica tramite alias', ar: 'التعديل عبر المرجع المستعار', ex: 'نعدّل الكائن عبر `p2`، لكن بما أن `p1` يشير إلى نفس الكائن فإن `p1.getX()` سيُعيد 11 وليس 1.', bn: 'Documenta i metodi che modificano lo stato.', bnAr: 'وثّق الدوال التي تغيّر الحالة.' }],
                ['p1 = null', { t: 'Riferimento a null', ar: 'إسناد null للمرجع', ex: '`p1` لم يعد يشير إلى شيء، لكن الكائن ما زال حياً لأن `p2` يشير إليه.', bn: 'Usa null solo quando ha un significato preciso.', bnAr: 'استخدم null فقط عندما يكون له معنى واضح.' }],
                ['p2 = new Punto(0, 0)', { t: 'Oggetto irraggiungibile', ar: 'كائن لا يمكن الوصول إليه', ex: 'الآن `p2` يشير إلى كائن جديد، والكائن القديم (x=11) لم يعد له أي مرجع: أصبح مؤهلاً لجامع القمامة (Garbage Collector). ستراه في "Memoria JVM" بعلامة GC.', bn: 'La memoria viene liberata dal GC, non dal programmatore.', bnAr: 'جامع القمامة هو من يحرر الذاكرة وليس المبرمج.' }],
              ],
            },
          ],
          esercizio: {
            titolo: 'Prevedi l\'aliasing',
            consegna: 'Crea due riferimenti allo stesso ContoCorrente (c2 = c1), deposita 100 tramite c2 e stampa il saldo tramite c1: deve stampare «Saldo c1: 100.0». Usa Esegui passo-passo per osservare Stack e Heap.',
            consegnaAr: 'أنشئ مرجعين لنفس الحساب (c2 = c1)، أودع 100 عبر c2 ثم اطبع الرصيد عبر c1: يجب أن يطبع «Saldo c1: 100.0». استخدم التنفيذ خطوة بخطوة لمراقبة الـStack والـHeap.',
            codice: `class ContoCorrente {

    private double saldo;

    public void deposita(double importo) {
        saldo += importo;
    }

    public double getSaldo() {
        return saldo;
    }
}

public class Main {

    public static void main(String[] args) {
        ContoCorrente c1 = new ContoCorrente();
        // crea l'alias c2, deposita tramite c2, stampa tramite c1

    }
}`,
            verifiche: [
              { tipo: 'output', atteso: 'Saldo c1: 100.0', msg: 'Deve stampare «Saldo c1: 100.0».', msgAr: 'يجب أن يطبع «Saldo c1: 100.0».' },
              { tipo: 'codice', re: 'ContoCorrente\\s+c2\\s*=\\s*c1\\s*;', msg: 'c2 deve essere un alias di c1 (ContoCorrente c2 = c1;).', msgAr: 'يجب أن يكون c2 اسماً مستعاراً لـ c1 أي ContoCorrente c2 = c1;' },
            ],
            soluzione: `class ContoCorrente {

    private double saldo;

    public void deposita(double importo) {
        saldo += importo;
    }

    public double getSaldo() {
        return saldo;
    }
}

public class Main {

    public static void main(String[] args) {
        ContoCorrente c1 = new ContoCorrente();
        ContoCorrente c2 = c1;
        c2.deposita(100.0);
        System.out.println("Saldo c1: " + c1.getSaldo());
    }
}`,
          },
        },
      ],
    },

    // ═══════════════════════════════ MODULO 4 ═══════════════════════════════
    {
      id: 'm4', numero: 4, colore: '#F2CC60', icona: 'tree',
      titolo: 'Ereditarietà, Polimorfismo e Interfacce',
      titoloAr: 'الوراثة وتعدد الأشكال والواجهات',
      descr: 'extends e super, overriding, classi astratte, interfacce e legame dinamico.',
      lezioni: [
        {
          id: 'm4l1', titolo: 'Ereditarietà: extends e super', durata: '14 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Riutilizzare e specializzare',
              frasi: [
                {
                  it: 'L\'ereditarietà permette di definire una nuova classe (sottoclasse) a partire da una classe esistente (superclasse) con la parola chiave extends.',
                  t: 'Ereditarietà (extends)', ar: 'الوراثة تسمح بتعريف صنف جديد (صنف فرعي) انطلاقاً من صنف موجود (صنف أب) باستخدام الكلمة extends.',
                  ex: 'الصنف الفرعي يرث جميع الحقول والدوال غير الخاصة من الأب، ويمكنه إضافة حقول ودوال جديدة أو إعادة تعريف الموجودة. Java تسمح بالوراثة من صنف واحد فقط (وراثة مفردة).',
                  bn: 'Usa l\'ereditarietà solo per relazioni "è un" (is-a): uno Studente è una Persona.', bnAr: 'استخدم الوراثة فقط لعلاقة "هو نوع من" (is-a): الطالب هو شخص.',
                },
                {
                  it: 'Tutte le classi Java derivano, direttamente o indirettamente, dalla classe Object.',
                  t: 'Classe Object', ar: 'جميع أصناف Java ترث بشكل مباشر أو غير مباشر من الصنف Object.',
                  ex: 'لهذا يملك كل كائن دوال مثل `toString()` و`equals()` و`hashCode()`. إذا لم تكتب `extends` فإن الصنف يرث من `Object` تلقائياً.',
                  bn: 'Ridefinisci toString ed equals quando servono.', bnAr: 'أعد تعريف toString و equals عند الحاجة.',
                },
                {
                  it: 'Nel costruttore della sottoclasse, super(...) richiama il costruttore della superclasse e deve essere la prima istruzione.',
                  t: 'Chiamata super(...)', ar: 'داخل مُنشئ الصنف الفرعي، تستدعي super(...) مُنشئ الصنف الأب ويجب أن تكون أول تعليمة.',
                  ex: 'الجزء الموروث من الكائن يجب أن يُهيَّأ أولاً بمُنشئ الأب. إذا لم تكتب `super(...)` تضيف Java `super()` بدون معاملات، فإذا لم يكن للأب مُنشئ بدون معاملات يحدث خطأ ترجمة.',
                  bn: 'Lascia che sia la superclasse a inizializzare i propri attributi private.', bnAr: 'دع الصنف الأب يهيّئ حقوله الخاصة بنفسه.',
                },
                {
                  it: 'L\'overriding consiste nel ridefinire in una sottoclasse un metodo ereditato, mantenendo la stessa firma.',
                  t: 'Overriding (ridefinizione)', ar: 'إعادة التعريف (Overriding) تعني إعادة كتابة دالة موروثة في الصنف الفرعي مع الحفاظ على نفس التوقيع.',
                  ex: 'لا تخلط بينه وبين الـOverloading: الـoverloading = نفس الاسم وتوقيع مختلف في نفس الصنف (يُحسم وقت الترجمة)، والـoverriding = نفس التوقيع في صنف فرعي (يُحسم وقت التشغيل). يمكن استدعاء نسخة الأب بـ `super.metodo()`.',
                  bn: 'Annota sempre con @Override i metodi ridefiniti.', bnAr: 'ضع دائماً @Override فوق الدوال المُعاد تعريفها.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'Universita.java', esegui: true,
              codice: `class Persona {

    private final String nome;

    public Persona(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    public String descrivi() {
        return "Sono " + nome;
    }
}

class Studente extends Persona {

    private final int matricola;

    public Studente(String nome, int matricola) {
        super(nome);
        this.matricola = matricola;
    }

    @Override
    public String descrivi() {
        return super.descrivi() + ", matricola " + matricola;
    }
}

public class Universita {

    public static void main(String[] args) {
        Persona p = new Persona("Paolo");
        Studente s = new Studente("Giulia", 654321);
        System.out.println(p.descrivi());
        System.out.println(s.descrivi());
        System.out.println(s.getNome());
    }
}`,
              note: [
                ['class Studente extends Persona', { t: 'Sottoclasse', ar: 'صنف فرعي', ex: '`Studente` يرث من `Persona` الدالتين `getNome()` و`descrivi()`، ويضيف الحقل `matricola`. الحقل `nome` موجود داخل كائن الطالب في الـHeap لكنه `private` في الأب، لذا يصل إليه الابن عبر `getNome()` فقط.', bn: 'Relazione is-a: uno Studente è una Persona.', bnAr: 'علاقة is-a: الطالب هو شخص.' }],
                ['super(nome)', { t: 'Costruttore della superclasse', ar: 'مُنشئ الصنف الأب', ex: 'أول تعليمة: نطلب من مُنشئ `Persona` تهيئة الحقل `nome`. في التنفيذ خطوة بخطوة ستلاحظ إطارين للمُنشئين في الـStack فوق بعضهما.', bn: 'super(...) sempre come prima istruzione.', bnAr: 'super(...) دائماً أول تعليمة.' }],
                ['@Override', { t: 'Annotazione @Override', ar: 'وسم إعادة التعريف', ex: 'نخبر المترجم أننا نعيد تعريف `descrivi()` الموروثة. إذا أخطأنا في الاسم (مثلاً `descrive`) سيظهر خطأ ترجمة فوراً.', bn: 'Sempre @Override.', bnAr: 'استخدم @Override دائماً.' }],
                ['super.descrivi()', { t: 'Riuso del metodo della superclasse', ar: 'إعادة استخدام دالة الأب', ex: '`super.descrivi()` يستدعي نسخة `Persona` من الدالة ("Sono Giulia") ثم نضيف إليها رقم القيد. هكذا نوسّع السلوك بدلاً من تكراره.', bn: 'Estendi il comportamento, non duplicarlo.', bnAr: 'وسّع السلوك ولا تكرّره.' }],
              ],
            },
          ],
          esercizio: {
            titolo: 'Docente extends Persona',
            consegna: 'Aggiungi la classe Docente che estende Persona con l\'attributo private String corso, un costruttore che usa super(nome) e ridefinisce descrivi() con @Override. Deve stampare «Sono Rossi, insegna Programmazione».',
            consegnaAr: 'أضف الصنف Docente الذي يرث Persona مع الحقل الخاص private String corso، ومُنشئ يستخدم super(nome)، وأعد تعريف descrivi() مع @Override. يجب أن يطبع «Sono Rossi, insegna Programmazione».',
            codice: `class Persona {

    private final String nome;

    public Persona(String nome) {
        this.nome = nome;
    }

    public String descrivi() {
        return "Sono " + nome;
    }
}

// Scrivi qui la classe Docente

public class Main {

    public static void main(String[] args) {
        Persona d = new Docente("Rossi", "Programmazione");
        System.out.println(d.descrivi());
    }
}`,
            verifiche: [
              { tipo: 'output', atteso: 'Sono Rossi, insegna Programmazione', msg: 'Deve stampare «Sono Rossi, insegna Programmazione».', msgAr: 'يجب أن يطبع «Sono Rossi, insegna Programmazione».' },
              { tipo: 'codice', re: 'class\\s+Docente\\s+extends\\s+Persona', msg: 'Docente deve estendere Persona.', msgAr: 'يجب أن يرث Docente من Persona.' },
              { tipo: 'codice', re: 'super\\s*\\(', msg: 'Usa super(nome) nel costruttore.', msgAr: 'استخدم super(nome) داخل المُنشئ.' },
              { tipo: 'codice', re: '@Override', msg: 'Annota il metodo ridefinito con @Override.', msgAr: 'ضع @Override فوق الدالة المُعاد تعريفها.' },
            ],
            soluzione: `class Persona {

    private final String nome;

    public Persona(String nome) {
        this.nome = nome;
    }

    public String descrivi() {
        return "Sono " + nome;
    }
}

class Docente extends Persona {

    private final String corso;

    public Docente(String nome, String corso) {
        super(nome);
        this.corso = corso;
    }

    @Override
    public String descrivi() {
        return super.descrivi() + ", insegna " + corso;
    }
}

public class Main {

    public static void main(String[] args) {
        Persona d = new Docente("Rossi", "Programmazione");
        System.out.println(d.descrivi());
    }
}`,
          },
        },
        {
          id: 'm4l2', titolo: 'Polimorfismo, classi astratte e interfacce', durata: '18 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Un riferimento, tante forme',
              frasi: [
                {
                  it: 'Il polimorfismo permette a un riferimento di una superclasse di puntare a oggetti di qualsiasi sottoclasse.',
                  t: 'Polimorfismo', ar: 'تعدد الأشكال يسمح لمرجع من نوع الصنف الأب بأن يشير إلى كائنات من أي صنف فرعي.',
                  ex: 'يمكن كتابة `Forma f = new Cerchio(2);`: النوع الساكن (المُصرَّح) هو `Forma` والنوع الديناميكي (الحقيقي) هو `Cerchio`. هكذا نضع أشكالاً مختلفة في نفس المصفوفة `Forma[]` ونعاملها بطريقة موحدة.',
                  bn: 'Programma verso il tipo più generale (interfaccia o superclasse).', bnAr: 'برمج باستخدام النوع الأعم (الواجهة أو الصنف الأب).',
                },
                {
                  it: 'Con il legame dinamico (dynamic binding) la JVM sceglie il metodo da eseguire in base al tipo reale dell\'oggetto, a tempo di esecuzione.',
                  t: 'Legame dinamico (Dynamic Binding)', ar: 'مع الربط الديناميكي تختار JVM الدالة المراد تنفيذها حسب النوع الحقيقي للكائن، أثناء التشغيل.',
                  ex: 'في `f.area()` المترجم يتحقق فقط أن `Forma` تملك دالة `area()`، لكن JVM وقت التشغيل تنظر إلى الكائن الحقيقي في الـHeap (Cerchio أو Rettangolo) وتنفذ نسخته المُعاد تعريفها. هذا قلب البرمجة كائنية التوجه.',
                  bn: 'Evita catene di instanceof: lascia lavorare il legame dinamico.', bnAr: 'تجنب سلاسل instanceof واترك الربط الديناميكي يقوم بالعمل.',
                },
                {
                  it: 'Una classe astratta non può essere istanziata e può contenere metodi astratti, privi di corpo, che le sottoclassi devono implementare.',
                  t: 'Classe astratta', ar: 'الصنف المجرد لا يمكن إنشاء كائنات منه، ويمكن أن يحتوي على دوال مجردة بلا جسم يجب على الأصناف الفرعية تنفيذها.',
                  ex: '`new Forma()` خطأ ترجمة لأن "الشكل" مفهوم عام. الدالة `abstract double area();` تُلزم كل صنف فرعي ملموس بكتابة طريقة حساب مساحته، وإلا يجب أن يكون هو أيضاً مجرداً.',
                  bn: 'Usa una classe astratta quando le sottoclassi condividono stato e codice.', bnAr: 'استخدم الصنف المجرد عندما تتشارك الأصناف الفرعية حالة وكوداً.',
                },
                {
                  it: 'Un\'interfaccia definisce un contratto, cioè un insieme di metodi che una classe si impegna a implementare con implements.',
                  t: 'Interfaccia (implements)', ar: 'الواجهة تحدد عقداً، أي مجموعة دوال يلتزم الصنف بتنفيذها باستخدام implements.',
                  ex: 'يمكن للصنف أن يرث صنفاً واحداً فقط لكنه يستطيع تطبيق عدة واجهات: `class Cerchio extends Forma implements Disegnabile, Comparable`. الواجهة تصف "ماذا يستطيع الكائن أن يفعل" (قدرة) وليس "ما هو".',
                  bn: 'Nomi delle interfacce come capacità: Disegnabile, Confrontabile.', bnAr: 'أسماء الواجهات تعبّر عن قدرة: Disegnabile و Confrontabile.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'Forme.java', esegui: true,
              codice: `interface Disegnabile {
    String disegna();
}

abstract class Forma implements Disegnabile {

    public abstract double area();

    public String disegna() {
        return getClass().getSimpleName() + " di area " + area();
    }
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

public class Forme {

    public static void main(String[] args) {
        Forma[] forme = {new Rettangolo(3.0, 4.0), new Cerchio(1.0)};
        for (Forma f : forme) {
            System.out.println(f.disegna());
        }
    }
}`,
              note: [
                ['interface Disegnabile', { t: 'Interfaccia', ar: 'واجهة', ex: 'عقد يحتوي على دالة واحدة `disegna()` مجردة و public ضمنياً. أي صنف يكتب `implements Disegnabile` يلتزم بتوفيرها.', bn: 'Interfacce piccole e coese.', bnAr: 'واجهات صغيرة ومتماسكة.' }],
                ['abstract class Forma implements', { t: 'Classe astratta che implementa un\'interfaccia', ar: 'صنف مجرد يطبّق واجهة', ex: '`Forma` تنفّذ `disegna()` مرة واحدة للجميع، لكنها تترك `area()` مجردة لأن كل شكل يحسب مساحته بطريقة مختلفة.', bn: 'Il codice comune va nella superclasse astratta.', bnAr: 'الكود المشترك يوضع في الصنف الأب المجرد.' }],
                ['public abstract double area()', { t: 'Metodo astratto', ar: 'دالة مجردة', ex: 'لا جسم لها، تنتهي بفاصلة منقوطة. كل صنف فرعي ملموس (Cerchio و Rettangolo) مُلزم بتنفيذها.', bn: 'I metodi astratti definiscono "cosa", le sottoclassi "come".', bnAr: 'الدوال المجردة تحدد "ماذا"، والأصناف الفرعية تحدد "كيف".' }],
                ['" di area " + area()', { t: 'Chiamata polimorfica', ar: 'استدعاء متعدد الأشكال', ex: 'داخل `Forma` نستدعي `area()` دون أن نعرف أي شكل هو! وقت التشغيل يختار ربط ديناميكي نسخة `Cerchio` أو `Rettangolo` حسب الكائن الحقيقي.', bn: 'Template method: lo schema è comune, i dettagli variano.', bnAr: 'نمط Template method: الهيكل مشترك والتفاصيل تختلف.' }],
                ['Forma[] forme', { t: 'Array polimorfico', ar: 'مصفوفة متعددة الأشكال', ex: 'مصفوفة من مراجع `Forma` تشير إلى كائنات من أصناف مختلفة. النوع الساكن واحد والأنواع الحقيقية متعددة.', bn: 'Dichiara variabili del tipo più generale possibile.', bnAr: 'صرّح عن المتغيرات بأعم نوع ممكن.' }],
                ['f.disegna()', { t: 'Legame dinamico', ar: 'الربط الديناميكي', ex: 'في الدورة الأولى `f` يشير إلى Rettangolo فتُستدعى مساحته (12.0)، وفي الثانية إلى Cerchio (π). نفس السطر، سلوك مختلف: هذا هو تعدد الأشكال.', bn: 'Niente if/instanceof per scegliere il comportamento.', bnAr: 'لا تستخدم if/instanceof لاختيار السلوك.' }],
              ],
            },
            {
              tipo: 'norma', it: 'Programma verso le interfacce, usa @Override, evita catene di instanceof e cast: affidati al legame dinamico. Classe astratta per codice condiviso, interfaccia per un contratto.',
              ar: 'برمج باستخدام الواجهات، واستخدم @Override، وتجنب سلاسل instanceof والتحويلات: اعتمد على الربط الديناميكي. الصنف المجرد للكود المشترك، والواجهة للعقد.',
            },
          ],
          esercizio: {
            titolo: 'Aggiungi il Quadrato',
            consegna: 'Aggiungi la classe Quadrato che estende Forma con un attributo lato e ridefinisce area(). Aggiungi un Quadrato di lato 2 all\'array: l\'ultima riga stampata deve essere «Quadrato di area 4.0».',
            consegnaAr: 'أضف الصنف Quadrato الذي يرث Forma مع حقل lato ويعيد تعريف area(). أضف مربعاً طول ضلعه 2 إلى المصفوفة: آخر سطر مطبوع يجب أن يكون «Quadrato di area 4.0».',
            codice: `abstract class Forma {

    public abstract double area();

    public String disegna() {
        return getClass().getSimpleName() + " di area " + area();
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

public class Main {

    public static void main(String[] args) {
        Forma[] forme = {new Rettangolo(3.0, 4.0)};
        for (Forma f : forme) {
            System.out.println(f.disegna());
        }
    }
}`,
            verifiche: [
              { tipo: 'contiene', testo: 'Quadrato di area 4.0', msg: 'Deve comparire «Quadrato di area 4.0».', msgAr: 'يجب أن يظهر «Quadrato di area 4.0».' },
              { tipo: 'codice', re: 'class\\s+Quadrato\\s+extends\\s+(Forma|Rettangolo)', msg: 'Quadrato deve estendere Forma (o Rettangolo).', msgAr: 'يجب أن يرث Quadrato من Forma (أو Rettangolo).' },
            ],
            soluzione: `abstract class Forma {

    public abstract double area();

    public String disegna() {
        return getClass().getSimpleName() + " di area " + area();
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

class Quadrato extends Forma {

    private final double lato;

    public Quadrato(double lato) {
        this.lato = lato;
    }

    @Override
    public double area() {
        return lato * lato;
    }
}

public class Main {

    public static void main(String[] args) {
        Forma[] forme = {new Rettangolo(3.0, 4.0), new Quadrato(2.0)};
        for (Forma f : forme) {
            System.out.println(f.disegna());
        }
    }
}`,
          },
        },
      ],
    },

    // ═══════════════════════════════ MODULO 5 ═══════════════════════════════
    {
      id: 'm5', numero: 5, colore: '#F85149', icona: 'shield',
      titolo: 'Gestione delle Eccezioni',
      titoloAr: 'معالجة الاستثناءات',
      descr: 'try-catch-finally, throw e throws, eccezioni checked e unchecked, buona norma.',
      lezioni: [
        {
          id: 'm5l1', titolo: 'Blocchi try, catch e finally', durata: '14 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Quando qualcosa va storto',
              frasi: [
                {
                  it: 'Un\'eccezione è un evento anomalo che interrompe il normale flusso di esecuzione del programma.',
                  t: 'Eccezione', ar: 'الاستثناء حدث غير طبيعي يقطع السير الطبيعي لتنفيذ البرنامج.',
                  ex: 'في Java الاستثناء كائن حقيقي في الـHeap (من صنف يرث `Throwable`) يحمل نوع الخطأ ورسالته ومسار الاستدعاءات (stack trace). أمثلة: القسمة على صفر، أو الوصول إلى فهرس غير موجود.',
                  bn: 'Leggi sempre lo stack trace dall\'alto: indica tipo, messaggio e riga.', bnAr: 'اقرأ الـstack trace دائماً من الأعلى: يوضح النوع والرسالة ورقم السطر.',
                },
                {
                  it: 'Il blocco try racchiude le istruzioni che potrebbero sollevare un\'eccezione.',
                  t: 'Blocco try', ar: 'كتلة try تحيط بالتعليمات التي قد تُطلق استثناءً.',
                  ex: 'عند حدوث استثناء داخل `try` يتوقف تنفيذ بقية الكتلة فوراً (التعليمات التالية لا تُنفَّذ)، وتنتقل JVM إلى كتل `catch` بحثاً عن واحدة مناسبة.',
                  bn: 'Tieni il blocco try il più piccolo possibile.', bnAr: 'اجعل كتلة try أصغر ما يمكن.',
                },
                {
                  it: 'Il blocco catch cattura le eccezioni di un certo tipo e permette di gestirle senza terminare il programma.',
                  t: 'Blocco catch', ar: 'كتلة catch تلتقط الاستثناءات من نوع معيّن وتسمح بمعالجتها دون إنهاء البرنامج.',
                  ex: 'تُفحص كتل `catch` بالترتيب، وأول كتلة يتوافق نوعها مع الاستثناء (أو أحد آبائه) تُنفَّذ. لذلك يجب وضع الأنواع الأكثر تحديداً أولاً ثم الأعم، وإلا يرفض المترجم الكود.',
                  bn: 'Cattura eccezioni specifiche e non lasciare mai un catch vuoto.', bnAr: 'التقط استثناءات محددة ولا تترك catch فارغة أبداً.',
                },
                {
                  it: 'Il blocco finally viene eseguito sempre, sia che si verifichi un\'eccezione sia che non si verifichi.',
                  t: 'Blocco finally', ar: 'كتلة finally تُنفَّذ دائماً سواء حدث استثناء أم لم يحدث.',
                  ex: 'حتى لو كان هناك `return` داخل try أو catch، تُنفَّذ `finally` قبل الخروج. المكان المثالي لإغلاق الموارد (ملفات، اتصالات قاعدة بيانات). في Java الحديثة نستخدم أيضاً try-with-resources.',
                  bn: 'Chiudi sempre le risorse in finally o con try-with-resources.', bnAr: 'أغلق الموارد دائماً في finally أو باستخدام try-with-resources.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'Divisione.java', esegui: true,
              codice: `public class Divisione {

    public static void main(String[] args) {
        String[] input = {"10", "0", "abc"};
        int dividendo = 100;

        for (String s : input) {
            try {
                int divisore = Integer.parseInt(s);
                int risultato = dividendo / divisore;
                System.out.println(dividendo + " / " + divisore + " = " + risultato);
            } catch (ArithmeticException e) {
                System.out.println("Errore: divisione per zero");
            } catch (NumberFormatException e) {
                System.out.println("Errore: '" + s + "' non è un numero");
            } finally {
                System.out.println("-- tentativo concluso --");
            }
        }
    }
}`,
              note: [
                ['Integer.parseInt(s)', { t: 'Conversione da String a int', ar: 'تحويل نص إلى عدد صحيح', ex: '`Integer.parseInt("10")` تُعيد 10، لكن مع `"abc"` ترمي `NumberFormatException` لأن النص ليس رقماً.', bn: 'Gestisci sempre NumberFormatException quando converti input dell\'utente.', bnAr: 'عالج دائماً NumberFormatException عند تحويل مدخلات المستخدم.' }],
                ['dividendo / divisore', { t: 'Possibile ArithmeticException', ar: 'احتمال قسمة على صفر', ex: 'قسمة عدد صحيح على صفر ترمي `ArithmeticException: / by zero`. (ملاحظة: مع `double` لا يحدث استثناء بل تكون النتيجة Infinity).', bn: 'Dove possibile, preferisci un controllo preventivo (if divisore != 0).', bnAr: 'عند الإمكان فضّل الفحص المسبق (if divisore != 0).' }],
                ['catch (ArithmeticException e)', { t: 'catch specifico', ar: 'التقاط محدد', ex: 'يلتقط فقط أخطاء الحساب. المتغير `e` مرجع إلى كائن الاستثناء في الـHeap. بعد الالتقاط يستمر البرنامج مع العنصر التالي بدلاً من التوقف.', bn: 'Un catch per ogni tipo di errore gestito in modo diverso.', bnAr: 'كتلة catch لكل نوع خطأ يُعالج بطريقة مختلفة.' }],
                ['finally {', { t: 'finally', ar: 'كتلة finally', ex: 'تُطبع هذه الرسالة ثلاث مرات: بعد النجاح، وبعد القسمة على صفر، وبعد خطأ التحويل. جرّب التنفيذ خطوة بخطوة لتراها بعد كل catch.', bn: 'finally per il codice di pulizia.', bnAr: 'finally لكود التنظيف وتحرير الموارد.' }],
              ],
            },
          ],
          esercizio: {
            titolo: 'Proteggi la conversione',
            consegna: 'Il programma termina con NumberFormatException. Aggiungi un try-catch specifico (non Exception generico) che stampi «Valore non valido: 12a» e poi lascia che il programma stampi «Fine».',
            consegnaAr: 'البرنامج يتوقف بسبب NumberFormatException. أضف try-catch محدداً (وليس Exception العامة) يطبع «Valore non valido: 12a» ثم دع البرنامج يطبع «Fine».',
            codice: `public class Main {

    public static void main(String[] args) {
        String testo = "12a";
        int numero = Integer.parseInt(testo);
        System.out.println("Numero: " + numero);
        System.out.println("Fine");
    }
}`,
            verifiche: [
              { tipo: 'output', atteso: 'Valore non valido: 12a\nFine', msg: 'Output atteso: «Valore non valido: 12a» e poi «Fine».', msgAr: 'المخرجات المتوقعة: «Valore non valido: 12a» ثم «Fine».' },
              { tipo: 'codice', re: 'catch\\s*\\(\\s*NumberFormatException', msg: 'Cattura NumberFormatException in modo specifico.', msgAr: 'التقط NumberFormatException بشكل محدد.' },
              { tipo: 'norma', regole: ['catch-vuoto', 'catch-generico'], msg: 'Niente catch vuoti o generici.', msgAr: 'لا كتل catch فارغة أو عامة.' },
            ],
            soluzione: `public class Main {

    public static void main(String[] args) {
        String testo = "12a";
        try {
            int numero = Integer.parseInt(testo);
            System.out.println("Numero: " + numero);
        } catch (NumberFormatException e) {
            System.out.println("Valore non valido: " + testo);
        }
        System.out.println("Fine");
    }
}`,
          },
        },
        {
          id: 'm5l2', titolo: 'throw, throws ed eccezioni personalizzate', durata: '15 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Segnalare gli errori',
              frasi: [
                {
                  it: 'L\'istruzione throw lancia esplicitamente un oggetto eccezione per segnalare una situazione anomala.',
                  t: 'throw', ar: 'التعليمة throw ترمي كائن استثناء بشكل صريح للإبلاغ عن حالة غير طبيعية.',
                  ex: '`throw new IllegalArgumentException("Importo negativo");` تُنشئ كائن الاستثناء في الـHeap ثم ترميه: تتوقف الدالة فوراً ويصعد الاستثناء عبر إطارات الـStack حتى يجد catch مناسباً.',
                  bn: 'Lancia eccezioni con messaggi chiari che spiegano la causa.', bnAr: 'ارمِ الاستثناءات مع رسائل واضحة تشرح السبب.',
                },
                {
                  it: 'La clausola throws nella firma di un metodo dichiara le eccezioni controllate che il metodo può propagare al chiamante.',
                  t: 'throws (propagazione)', ar: 'العبارة throws في توقيع الدالة تُعلن الاستثناءات المُراقَبة التي قد تمررها الدالة إلى المستدعي.',
                  ex: 'إذا كانت الدالة قد ترمي استثناءً مُراقَباً (checked) ولا تعالجه بنفسها، يجب أن تعلن عنه بـ `throws`. عندها يُجبر المترجم المستدعي على أن يختار: معالجته بـ try-catch أو إعلانه بدوره (قاعدة "handle or declare").',
                  bn: 'Non usare throws Exception generico: dichiara le eccezioni specifiche.', bnAr: 'لا تستخدم throws Exception العامة: أعلن الاستثناءات المحددة.',
                },
                {
                  it: 'Si può creare un\'eccezione personalizzata estendendo Exception, per le eccezioni controllate, o RuntimeException, per quelle non controllate.',
                  t: 'Eccezione personalizzata', ar: 'يمكن إنشاء استثناء مخصص بوراثة Exception للاستثناءات المُراقَبة، أو RuntimeException لغير المُراقَبة.',
                  ex: 'الاستثناء المخصص يجعل الخطأ ذا معنى في مجال المشكلة: `SaldoInsufficienteException` أوضح بكثير من `Exception` عامة. عادةً يكفي مُنشئ يستقبل الرسالة ويمررها بـ `super(messaggio)`.',
                  bn: 'Il nome di un\'eccezione termina sempre con Exception.', bnAr: 'اسم صنف الاستثناء ينتهي دائماً بـ Exception.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'Banca.java', esegui: true,
              codice: `class SaldoInsufficienteException extends Exception {

    public SaldoInsufficienteException(String messaggio) {
        super(messaggio);
    }
}

class Conto {

    private double saldo;

    public Conto(double saldo) {
        this.saldo = saldo;
    }

    public void preleva(double importo) throws SaldoInsufficienteException {
        if (importo > saldo) {
            throw new SaldoInsufficienteException("Saldo insufficiente: disponibili " + saldo);
        }
        saldo -= importo;
    }

    public double getSaldo() {
        return saldo;
    }
}

public class Banca {

    public static void main(String[] args) {
        Conto conto = new Conto(100.0);
        try {
            conto.preleva(30.0);
            conto.preleva(200.0);
            System.out.println("Questa riga non viene eseguita");
        } catch (SaldoInsufficienteException e) {
            System.out.println("Operazione rifiutata: " + e.getMessage());
        }
        System.out.println("Saldo finale: " + conto.getSaldo());
    }
}`,
              note: [
                ['class SaldoInsufficienteException extends Exception', { t: 'Eccezione controllata personalizzata', ar: 'استثناء مُراقَب مخصص', ex: 'بما أنه يرث `Exception` (وليس RuntimeException) فهو استثناء مُراقَب (checked): المترجم يُجبر كل من يستدعي دالة ترميه على معالجته أو إعلانه.', bn: 'Nome che termina con Exception.', bnAr: 'اسم ينتهي بـ Exception.' }],
                ['super(messaggio)', { t: 'Messaggio dell\'eccezione', ar: 'رسالة الاستثناء', ex: 'نمرر الرسالة إلى مُنشئ `Exception`، فتصبح متاحة لاحقاً عبر `getMessage()`.', bn: 'Messaggi descrittivi.', bnAr: 'رسائل وصفية.' }],
                ['throws SaldoInsufficienteException', { t: 'Dichiarazione throws', ar: 'إعلان throws', ex: 'الدالة تعلن أنها قد ترمي هذا الاستثناء المُراقَب. لو حذفنا `throws` لرفض المترجم الكود: "unreported exception".', bn: 'Dichiara solo eccezioni specifiche.', bnAr: 'أعلن الاستثناءات المحددة فقط.' }],
                ['throw new SaldoInsufficienteException', { t: 'Lancio dell\'eccezione', ar: 'رمي الاستثناء', ex: 'يُنشأ كائن الاستثناء ويُرمى: تتوقف `preleva` فوراً (لا يُخصم شيء من الرصيد)، ويُزال إطارها من الـStack، ويصعد الاستثناء إلى `main`.', bn: 'Verifica prima, modifica lo stato dopo.', bnAr: 'تحقق أولاً ثم غيّر الحالة.' }],
                ['catch (SaldoInsufficienteException e)', { t: 'Gestione nel chiamante', ar: 'المعالجة في الدالة المستدعية', ex: 'هنا يُلتقط الاستثناء: السطر "Questa riga non viene eseguita" يُتخطى فعلاً، ثم يستمر البرنامج ويطبع الرصيد النهائي 70.0.', bn: 'Gestisci l\'eccezione dove hai le informazioni per farlo.', bnAr: 'عالج الاستثناء في المكان الذي تملك فيه المعلومات اللازمة.' }],
              ],
            },
          ],
          esercizio: {
            titolo: 'Valida l\'età',
            consegna: 'Completa setEta in modo che lanci IllegalArgumentException con messaggio «Età non valida: -5» quando l\'età è negativa. Il main la cattura e stampa il messaggio.',
            consegnaAr: 'أكمل الدالة setEta بحيث ترمي IllegalArgumentException مع الرسالة «Età non valida: -5» عندما يكون العمر سالباً. الدالة main تلتقطها وتطبع الرسالة.',
            codice: `class Persona {

    private int eta;

    public void setEta(int eta) {
        // lancia l'eccezione se eta < 0
        this.eta = eta;
    }
}

public class Main {

    public static void main(String[] args) {
        Persona p = new Persona();
        try {
            p.setEta(-5);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
            verifiche: [
              { tipo: 'output', atteso: 'Età non valida: -5', msg: 'Deve stampare «Età non valida: -5».', msgAr: 'يجب أن يطبع «Età non valida: -5».' },
              { tipo: 'codice', re: 'throw\\s+new\\s+IllegalArgumentException', msg: 'Usa throw new IllegalArgumentException(...).', msgAr: 'استخدم throw new IllegalArgumentException(...).' },
            ],
            soluzione: `class Persona {

    private int eta;

    public void setEta(int eta) {
        if (eta < 0) {
            throw new IllegalArgumentException("Età non valida: " + eta);
        }
        this.eta = eta;
    }
}

public class Main {

    public static void main(String[] args) {
        Persona p = new Persona();
        try {
            p.setEta(-5);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
          },
        },
        {
          id: 'm5l3', titolo: 'Checked e unchecked: la buona norma', durata: '13 min',
          sezioni: [
            {
              tipo: 'testo', titolo: 'Due famiglie di eccezioni',
              frasi: [
                {
                  it: 'Le eccezioni controllate (checked) derivano da Exception e il compilatore obbliga a gestirle o a dichiararle.',
                  t: 'Eccezioni controllate (checked)', ar: 'الاستثناءات المُراقَبة (checked) ترث من Exception، والمترجم يُلزم بمعالجتها أو الإعلان عنها.',
                  ex: 'تمثل مشاكل خارجية متوقعة لا يتحكم فيها المبرمج: ملف غير موجود (`FileNotFoundException`)، انقطاع الشبكة (`IOException`). البرنامج الجيد يجب أن يستعد لها.',
                  bn: 'Usa le checked per errori recuperabili causati dall\'ambiente esterno.', bnAr: 'استخدم الاستثناءات المُراقَبة للأخطاء القابلة للمعالجة الناتجة عن البيئة الخارجية.',
                },
                {
                  it: 'Le eccezioni non controllate (unchecked) derivano da RuntimeException e di solito indicano errori di programmazione.',
                  t: 'Eccezioni non controllate (unchecked)', ar: 'الاستثناءات غير المُراقَبة (unchecked) ترث من RuntimeException وعادةً تدل على أخطاء برمجية.',
                  ex: 'المترجم لا يُلزمك بمعالجتها. أشهرها: `NullPointerException` (استخدام مرجع null)، `ArrayIndexOutOfBoundsException` و `IndexOutOfBoundsException` (فهرس خارج الحدود)، `ArithmeticException`، `ClassCastException`. الحل الصحيح هو تصحيح الكود وليس التقاطها.',
                  bn: 'Le unchecked si prevengono correggendo il codice, non si catturano.', bnAr: 'الاستثناءات غير المُراقَبة تُمنع بتصحيح الكود، ولا تُلتقط.',
                },
                {
                  it: 'Una NullPointerException si verifica quando si invoca un metodo o si accede a un campo tramite un riferimento che vale null.',
                  t: 'NullPointerException', ar: 'يحدث NullPointerException عند استدعاء دالة أو الوصول إلى حقل عبر مرجع قيمته null.',
                  ex: 'المرجع `null` لا يشير إلى أي كائن في الـHeap، فلا يوجد شيء يمكن استدعاء الدالة عليه. الوقاية: تهيئة الحقول في المُنشئ، والتحقق `if (x != null)` قبل الاستخدام، وكتابة `"testo".equals(s)`.',
                  bn: 'Controlla null prima dell\'uso; mai catturare NullPointerException.', bnAr: 'تحقق من null قبل الاستخدام، ولا تلتقط NullPointerException أبداً.',
                },
                {
                  it: 'Non bisogna mai usare le eccezioni per controllare il normale flusso del programma.',
                  t: 'Eccezioni e flusso di controllo', ar: 'لا يجوز أبداً استخدام الاستثناءات للتحكم في السير الطبيعي للبرنامج.',
                  ex: 'مثال سيئ: المرور على مصفوفة بحلقة لا نهائية والتوقف عند التقاط `ArrayIndexOutOfBoundsException`. هذا بطيء (إنشاء الاستثناء مكلف) وغير واضح ويخفي الأخطاء الحقيقية. استخدم شرطاً عادياً `i < arr.length`.',
                  bn: 'Le eccezioni sono per i casi eccezionali; per il flusso normale usa if e cicli.', bnAr: 'الاستثناءات للحالات الاستثنائية فقط؛ وللسير الطبيعي استخدم if والحلقات.',
                },
              ],
            },
            {
              tipo: 'codice', titolo: 'Prevenzione.java', esegui: true,
              codice: `public class Prevenzione {

    public static int lunghezzaSicura(String testo) {
        int lunghezza = 0;
        if (testo != null) {
            lunghezza = testo.length();
        }
        return lunghezza;
    }

    public static void main(String[] args) {
        String nome = null;
        int[] valori = {3, 6, 9};

        System.out.println("Lunghezza: " + lunghezzaSicura(nome));

        int indice = 3;
        if (indice >= 0 && indice < valori.length) {
            System.out.println("Valore: " + valori[indice]);
        } else {
            System.out.println("Indice " + indice + " fuori dai limiti");
        }

        System.out.println(nome.length());
    }
}`,
              note: [
                ['if (testo != null)', { t: 'Controllo preventivo di null', ar: 'فحص null مسبقاً', ex: 'بدلاً من انتظار `NullPointerException` ثم التقاطها، نتحقق من المرجع قبل استخدامه. هذا هو الأسلوب الصحيح للاستثناءات غير المُراقَبة.', bn: 'Prevenire, non catturare.', bnAr: 'امنع ولا تلتقط.' }],
                ['indice >= 0 && indice < valori.length', { t: 'Controllo dei limiti', ar: 'فحص الحدود', ex: 'نتحقق من الفهرس قبل الوصول إلى المصفوفة، فلا يحدث `ArrayIndexOutOfBoundsException`. الفهارس الصالحة من 0 إلى length-1 (هنا 0..2).', bn: 'Verifica gli indici prima di accedere.', bnAr: 'تحقق من الفهارس قبل الوصول.' }],
                ['System.out.println(nome.length())', { t: 'NullPointerException non gestita', ar: 'NullPointerException غير معالَج', ex: 'هنا نستخدم `nome` وهو `null` مباشرة: تُطلق JVM `NullPointerException` ويتوقف البرنامج مع stack trace. شغّل الكود لترى رسالة الخطأ الكاملة في الـConsole.', bn: 'Questo è l\'errore da evitare.', bnAr: 'هذا هو الخطأ الذي يجب تجنّبه.' }],
              ],
            },
            {
              tipo: 'norma', it: 'Mai catch vuoti; cattura eccezioni specifiche; non catturare NullPointerException o IndexOutOfBoundsException ma prevenile; non usare le eccezioni per il flusso normale.',
              ar: 'لا كتل catch فارغة؛ التقط استثناءات محددة؛ لا تلتقط NullPointerException أو IndexOutOfBoundsException بل امنعها مسبقاً؛ ولا تستخدم الاستثناءات للتحكم في السير الطبيعي للبرنامج.',
            },
          ],
          esercizio: {
            titolo: 'Niente eccezioni per il flusso',
            consegna: 'Il codice somma gli elementi dell\'array catturando ArrayIndexOutOfBoundsException per fermarsi. Riscrivilo con un normale ciclo for basato su length, senza try-catch. Deve stampare «Somma: 60».',
            consegnaAr: 'الكود يجمع عناصر المصفوفة ويلتقط ArrayIndexOutOfBoundsException ليتوقف. أعد كتابته بحلقة for عادية تعتمد على length وبدون try-catch. يجب أن يطبع «Somma: 60».',
            codice: `public class Main {

    public static void main(String[] args) {
        int[] numeri = {10, 20, 30};
        int somma = 0;
        int i = 0;
        try {
            while (true) {
                somma += numeri[i];
                i++;
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Somma: " + somma);
        }
    }
}`,
            verifiche: [
              { tipo: 'output', atteso: 'Somma: 60', msg: 'Deve stampare «Somma: 60».', msgAr: 'يجب أن يطبع «Somma: 60».' },
              { tipo: 'nonCodice', re: 'catch\\s*\\(\\s*ArrayIndexOutOfBoundsException', msg: 'Non catturare ArrayIndexOutOfBoundsException.', msgAr: 'لا تلتقط ArrayIndexOutOfBoundsException.' },
              { tipo: 'codice', re: '\\.length', msg: 'Usa numeri.length nella condizione del ciclo.', msgAr: 'استخدم numeri.length في شرط الحلقة.' },
            ],
            soluzione: `public class Main {

    public static void main(String[] args) {
        int[] numeri = {10, 20, 30};
        int somma = 0;
        for (int i = 0; i < numeri.length; i++) {
            somma += numeri[i];
        }
        System.out.println("Somma: " + somma);
    }
}`,
          },
        },
      ],
    },
  ];

  // Esempi pronti per l'Editor Java
  const esempi = [
    {
      id: 'da-correggere', titolo: '⚠ Codice da correggere (Buona Norma)',
      codice: `public class conto_bancario {

    public double Saldo;
    public String titolare;
    private static final double tasso = 0.02;

    public conto_bancario(String titolare) {
        this.titolare = titolare;
    }

    public void Deposita(double Importo) {
        Saldo += Importo;
    }

    public static void main(String[] args) {
        conto_bancario c = new conto_bancario("Mario");
        c.Deposita(1500);
        float Area = 3.5f;
        boolean attivo = true;
        String nome = "Mario";
        if (attivo == true) {
            System.out.println("Conto attivo di " + c.titolare);
        }
        if (nome == c.titolare) {
            System.out.println("Stesso titolare");
        }
        try {
            int rate = 12;
            System.out.println("Rata: " + c.Saldo / rate);
        } catch (Exception e) {
        }
        System.out.println("Area: " + Area + ", interessi: " + c.Saldo * tasso);
    }
}`,
    },
    { id: 'conto', titolo: 'OOP: ContoCorrente (Stack & Heap)', ref: 'm3l1' },
    { id: 'memoria', titolo: 'Memoria: aliasing e Garbage Collector', ref: 'm3l3' },
    { id: 'forme', titolo: 'Polimorfismo e legame dinamico', ref: 'm4l2' },
    { id: 'eccezioni', titolo: 'Eccezioni: try-catch-finally', ref: 'm5l1' },
    { id: 'banca', titolo: 'Eccezione personalizzata (checked)', ref: 'm5l2' },
    { id: 'npe', titolo: 'NullPointerException non gestita', ref: 'm5l3' },
    {
      id: 'ricorsione', titolo: 'Ricorsione: fattoriale (frame sullo Stack)',
      codice: `public class Fattoriale {

    public static long fattoriale(int n) {
        long risultato = 1;
        if (n > 1) {
            risultato = n * fattoriale(n - 1);
        }
        return risultato;
    }

    public static void main(String[] args) {
        int numero = 4;
        long valore = fattoriale(numero);
        System.out.println(numero + "! = " + valore);
    }
}`,
    },
    { id: 'tipi', titolo: 'Tipi primitivi e divisione intera', ref: 'm1l2' },
    { id: 'cicli', titolo: 'Cicli e ricerca con flag', ref: 'm2l2' },
  ];

  // Risolve gli esempi che rimandano al codice di una lezione.
  for (const e of esempi) {
    if (e.ref && !e.codice) {
      for (const m of moduli) {
        for (const l of m.lezioni) {
          if (l.id === e.ref) {
            const sez = l.sezioni.find((s) => s.tipo === 'codice');
            if (sez) e.codice = sez.codice;
          }
        }
      }
    }
  }

  const data = { moduli, esempi };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.CF_CURRICULUM = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
