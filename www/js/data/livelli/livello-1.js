/* CodeForge — Livello 1: Fondamenti, Tipi di Dato e Input (Apprendista). */
(function (root) {
  'use strict';
  const livello = {
    numero: 1, id: 'L1', colore: '#79C0FF', icona: 'cube',
    titolo: 'Fondamenti, Tipi di Dato e Input', titoloAr: 'الأساسيات وأنواع البيانات والإدخال',
    grado: 'Apprendista', gradoAr: 'متدرّب',
    descr: 'Variabili e tipi primitivi, costanti e String, operatori e casting, input da tastiera con Scanner.',
    lezioni: [
      {
        id: 'l04', titolo: 'Variabili e tipi primitivi in memoria', durata: '14 min',
        obiettivi: ['Dichiarare e inizializzare variabili', 'Scegliere il tipo primitivo corretto', 'Prevedere il risultato della divisione intera'],
        teoria: [
          {
            it: 'Una variabile è una locazione di memoria identificata da un nome, che contiene un valore di un tipo ben preciso.',
            t: 'Variabile', ar: 'المتغير هو موقع في الذاكرة له اسم، ويحتوي على قيمة من نوع محدد.',
            ex: 'عند كتابة `int eta = 20;` تحجز JVM مساحة 32 بت داخل إطار الدالة في الـStack، وتسمّيها `eta`، وتضع فيها القيمة 20. يمكن تغيير القيمة لاحقاً لكن لا يمكن تغيير النوع.',
            bn: 'Dai alle variabili nomi significativi in camelCase (numeroStudenti, non ns).', bnAr: 'أعطِ المتغيرات أسماء ذات معنى بأسلوب camelCase (numeroStudenti وليس ns).',
          },
          {
            it: 'Java è un linguaggio fortemente tipizzato: ogni variabile deve essere dichiarata con il suo tipo prima di essere usata.',
            t: 'Tipizzazione statica', ar: 'Java لغة قوية التنميط: يجب التصريح عن كل متغير مع نوعه قبل استخدامه.',
            ex: 'المترجم يتحقق من الأنواع قبل التشغيل: لا يمكنك وضع نص داخل متغير `int`، ولا استخدام متغير لم تصرّح عنه. هذا يكشف كثيراً من الأخطاء مبكراً.',
            bn: 'Dichiara le variabili il più vicino possibile al loro primo utilizzo.', bnAr: 'صرّح عن المتغير في أقرب مكان لأول استخدام له.',
          },
          {
            it: 'Esistono otto tipi primitivi: byte, short, int, long per gli interi, float e double per i numeri reali, char per i caratteri e boolean per i valori logici.',
            t: 'Tipi primitivi', ar: 'توجد ثمانية أنواع بدائية: byte و short و int و long للأعداد الصحيحة، و float و double للأعداد الحقيقية، و char للحروف، و boolean للقيم المنطقية.',
            ex: 'القيمة البدائية تُخزَّن مباشرة داخل المتغير في الـStack. الأكثر استخداماً: `int` (عدد صحيح)، `double` (عدد عشري)، `boolean` (true/false)، `char` (حرف بين \' \'). أما `String` فليس بدائياً بل صنف.',
            bn: 'Usa int per i conteggi e double per le grandezze reali.', bnAr: 'استخدم int للعدّ و double للقيم الحقيقية.',
          },
          {
            it: 'La divisione tra due interi produce un risultato intero: la parte decimale viene troncata.',
            t: 'Divisione intera', ar: 'القسمة بين عددين صحيحين تُنتج عدداً صحيحاً: يتم حذف الجزء العشري.',
            ex: 'مثال شهير في الامتحانات: `7 / 2` نتيجته `3` وليس `3.5` لأن الطرفين `int`. والمعامل `%` يعطي باقي القسمة: `7 % 2` يساوي `1`. للحصول على `3.5` يجب أن يكون أحد الطرفين `double`.',
            bn: 'Attenzione alle divisioni tra interi quando calcoli medie e percentuali.', bnAr: 'انتبه إلى القسمة بين الأعداد الصحيحة عند حساب المعدلات والنسب.',
          },
        ],
        analogia: {
          titolo: 'Le scatole etichettate',
          it: 'Una variabile è una scatola con un\'etichetta (il nome) e una forma precisa (il tipo): in una scatola per uova non entra una bottiglia.',
          ar: 'المتغير مثل صندوق في خزانة: عليه ملصق يحمل اسمه (`eta`)، وله شكل محدد حسب نوعه. صندوق البيض (`int`) لا تدخله زجاجة ماء (`3.5`)! ويمكنك تغيير ما بداخل الصندوق متى شئت، لكن لا يمكنك تغيير شكله بعد صنعه.',
        },
        esempio: {
          file: 'TipiPrimitivi.java',
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
            ['int eta = 20', { t: 'Variabile intera (int)', ar: 'متغير عدد صحيح', ex: 'يُنشأ المتغير `eta` داخل إطار `main` في الـStack ويحتوي مباشرة على القيمة 20. لا يوجد أي كائن في الـHeap لأن `int` نوع بدائي.' }],
            ['int quoziente', { t: 'Divisione intera', ar: 'قسمة صحيحة', ex: 'بما أن `totale` و`divisore` كلاهما `int`، فإن `7 / 2` = `3` ويُحذف الجزء العشري.' }],
            ['(double) totale', { t: 'Cast esplicito a double', ar: 'تحويل صريح إلى double', ex: 'التحويل `(double) totale` يحدث قبل القسمة، فتصبح `7.0 / 2` = `3.5`. أما `(double) (totale / divisore)` فتعطي `3.0` لأن القسمة الصحيحة تحدث أولاً!' }],
          ],
        },
        norma: {
          it: 'Nomi delle variabili in camelCase e significativi; attenzione alla divisione intera; cast espliciti solo quando necessari.',
          ar: 'أسماء المتغيرات بأسلوب camelCase ومعبّرة؛ انتبه للقسمة الصحيحة؛ واستخدم التحويل الصريح فقط عند الحاجة.',
        },
        quiz: [
          {
            d: 'Quanto vale l\'espressione 9 / 4 in Java?', dAr: 'ما قيمة التعبير 9 / 4 في Java؟',
            opzioni: ['2.25', '2', '2.0', '3'], corretta: 1,
            it: '9 e 4 sono int: la divisione è intera e la parte decimale viene scartata, quindi il risultato è 2.',
            ar: 'العددان 9 و 4 من النوع int، لذلك القسمة صحيحة ويُحذف الجزء العشري فتكون النتيجة 2.',
          },
          {
            d: 'Dove si trova il valore di una variabile locale int x = 5 in memoria?', dAr: 'أين توجد قيمة المتغير المحلي int x = 5 في الذاكرة؟',
            opzioni: ['Nello Heap, dentro un oggetto', 'Direttamente nel frame del metodo sullo Stack', 'Nel file .class', 'Nella console'], corretta: 1,
            it: 'Le variabili locali di tipo primitivo vivono nel frame del metodo sullo Stack e contengono direttamente il valore.',
            ar: 'المتغيرات المحلية من الأنواع البدائية تعيش في إطار الدالة داخل الـStack وتحتوي القيمة مباشرة.',
          },
        ],
        costruisci: {
          consegna: 'Scegli i tipi corretti: un numero intero di studenti, una media con la virgola e un valore vero/falso.',
          consegnaAr: 'اختر الأنواع الصحيحة: عدد صحيح للطلاب، ومعدل بفاصلة عشرية، وقيمة صح/خطأ.',
          codice: `public class Classe {

    public static void main(String[] args) {
        ⟦int⟧ numeroStudenti = 25;
        ⟦double⟧ mediaVoti = 26.5;
        ⟦boolean⟧ corsoAttivo = true;
        System.out.println(numeroStudenti + " studenti, media " + mediaVoti + ", attivo: " + corsoAttivo);
    }
}`,
          output: '25 studenti, media 26.5, attivo: true\n',
        },
        laboratorio: {
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
        riepilogo: [
          { it: 'Ogni variabile ha un nome, un tipo e un valore.', ar: 'لكل متغير اسم ونوع وقيمة.' },
          { it: 'I tipi primitivi più usati: int, double, boolean, char.', ar: 'أكثر الأنواع البدائية استخداماً: int و double و boolean و char.' },
          { it: 'int / int dà un intero: per un risultato reale serve un double.', ar: 'قسمة int على int تعطي عدداً صحيحاً، وللحصول على نتيجة حقيقية نحتاج double.' },
        ],
      },
      {
        id: 'l05', titolo: 'Costanti, String e regole di denominazione', durata: '12 min',
        obiettivi: ['Dichiarare costanti con final', 'Usare i metodi principali di String', 'Applicare le convenzioni sui nomi'],
        teoria: [
          {
            it: 'La parola chiave final rende una variabile una costante: dopo la prima assegnazione il suo valore non può più cambiare.',
            t: 'Costante (final)', ar: 'الكلمة المفتاحية final تجعل المتغير ثابتاً: بعد الإسناد الأول لا يمكن تغيير قيمته.',
            ex: 'إذا حاولت تغيير قيمة ثابت `final` يرفض المترجم البرنامج. الثوابت تجعل الكود أوضح (`ALIQUOTA_IVA` بدلاً من `0.22`) وتسمح بتعديل القيمة في مكان واحد فقط.',
            bn: 'Sostituisci i "numeri magici" con costanti dal nome significativo.', bnAr: 'استبدل "الأرقام السحرية" بثوابت ذات أسماء واضحة.',
          },
          {
            it: 'Per convenzione le costanti si scrivono in maiuscolo con le parole separate da underscore, ad esempio ALIQUOTA_IVA.',
            t: 'UPPER_SNAKE_CASE', ar: 'بحسب العُرف تُكتب الثوابت بأحرف كبيرة مع فصل الكلمات بشرطة سفلية، مثل ALIQUOTA_IVA.',
            ex: 'هذا الأسلوب يجعل القارئ يميّز الثابت فوراً. القاعدة الكاملة: الأصناف `PascalCase`، والمتغيرات والدوال `camelCase`، والثوابت `UPPER_SNAKE_CASE`.',
            bn: 'Costanti: UPPER_SNAKE_CASE; variabili e metodi: camelCase; classi: PascalCase.', bnAr: 'الثوابت UPPER_SNAKE_CASE، والمتغيرات والدوال camelCase، والأصناف PascalCase.',
          },
          {
            it: 'String non è un tipo primitivo ma una classe: ogni stringa è un oggetto immutabile memorizzato nello Heap.',
            t: 'String (oggetto immutabile)', ar: 'String ليس نوعاً بدائياً بل صنف: كل سلسلة نصية كائن غير قابل للتعديل مخزّن في الـHeap.',
            ex: 'دوال مثل `toUpperCase()` لا تغيّر النص الأصلي بل تُعيد كائناً جديداً، لذلك يجب إسناد النتيجة: `nome = nome.trim();`. ومن أهم الدوال: `length()` و `charAt(i)` و `substring(a, b)` و `contains(...)`.',
            bn: 'Ricorda di assegnare il risultato dei metodi di String.', bnAr: 'تذكّر إسناد نتيجة دوال String لأن النص الأصلي لا يتغير.',
          },
          {
            it: 'Il contenuto di due stringhe si confronta con il metodo equals e non con l\'operatore ==, che confronta i riferimenti.',
            t: 'equals() vs ==', ar: 'يُقارَن محتوى سلسلتين نصيتين بالدالة equals وليس بالمعامل == الذي يقارن المراجع.',
            ex: 'المعامل `==` يسأل: "هل المرجعان يشيران إلى نفس الكائن؟" بينما `equals()` يسأل: "هل النصان متطابقان حرفاً بحرف؟". نصّان متطابقان قد يكونان كائنين مختلفين فيعطي `==` النتيجة `false`.',
            bn: 'Confronta sempre le stringhe con equals(); preferisci "costante".equals(variabile).', bnAr: 'قارن النصوص دائماً بـ equals()، ويفضّل كتابة "ثابت".equals(متغير) لتجنب NullPointerException.',
          },
        ],
        analogia: {
          titolo: 'L\'indirizzo inciso e la fotocopia',
          it: 'Una costante è un valore inciso nella pietra; una String è un foglio stampato: per cambiarlo ne stampi uno nuovo.',
          ar: 'الثابت `final` مثل اسم محفور على لوحة رخامية: لا يمكن تعديله بعد نقشه. أما الـ`String` فهي ورقة مطبوعة: لا يمكنك تغيير الحروف عليها، بل تطبع ورقة جديدة (كائن جديد). ومقارنة `==` تسأل "هل هي نفس الورقة؟" بينما `equals` تسأل "هل مكتوب عليها نفس الكلام؟".',
        },
        esempio: {
          file: 'Scontrino.java',
          codice: `public class Scontrino {

    private static final double ALIQUOTA_IVA = 0.22;

    public static void main(String[] args) {
        String nomeProdotto = "Manuale di Java";
        double prezzoNetto = 30.0;

        double prezzoLordo = prezzoNetto * (1 + ALIQUOTA_IVA);
        String titolo = nomeProdotto.toUpperCase();

        System.out.println(titolo + " (" + nomeProdotto.length() + " caratteri)");
        System.out.println("Iniziale: " + nomeProdotto.charAt(0) + ", parola: " + nomeProdotto.substring(0, 7));
        System.out.println("Prezzo con IVA: " + prezzoLordo);

        String copia = new String("Manuale di Java");
        System.out.println("Con == : " + (nomeProdotto == copia));
        System.out.println("Con equals: " + nomeProdotto.equals(copia));
    }
}`,
          normaAmmesse: ['string-equals'],
          note: [
            ['private static final double ALIQUOTA_IVA', { t: 'Costante di classe', ar: 'ثابت على مستوى الصنف', ex: '`static final` ثابت واحد مشترك للصنف كله، والقيمة 0.22 أصبح لها اسم يشرح معناها (ضريبة القيمة المضافة 22% في إيطاليا).' }],
            ['toUpperCase()', { t: 'Metodo di String', ar: 'دالة من دوال String', ex: '`toUpperCase()` لا تعدّل `nomeProdotto` بل تُنشئ كائناً نصياً جديداً بأحرف كبيرة ونخزّن مرجعه في `titolo`.' }],
            ['(nomeProdotto == copia)', { t: 'Confronto di riferimenti (==)', ar: 'مقارنة المراجع', ex: 'النتيجة `false`: المعامل `==` يقارن العناوين في الـHeap، والكائنان مختلفان رغم تطابق النص. (الفاحص سيعلّم هذا السطر عمداً كمخالفة.)' }],
          ],
        },
        norma: {
          it: 'Classi in PascalCase, variabili e metodi in camelCase, costanti in UPPER_SNAKE_CASE. Le stringhe si confrontano con equals().',
          ar: 'الأصناف PascalCase، والمتغيرات والدوال camelCase، والثوابت UPPER_SNAKE_CASE. والنصوص تُقارن بـ equals().',
        },
        quiz: [
          {
            d: 'Cosa stampa: String s = "java"; s.toUpperCase(); System.out.println(s);', dAr: 'ماذا يطبع هذا الكود؟',
            opzioni: ['JAVA', 'java', 'Java', 'Errore di compilazione'], corretta: 1,
            it: 'String è immutabile: toUpperCase() restituisce una nuova stringa che qui non viene assegnata, quindi s resta «java».',
            ar: 'String غير قابل للتعديل: toUpperCase() تُعيد نصاً جديداً لم يُسند إلى أي متغير، لذلك تبقى s بقيمة «java».',
          },
          {
            d: 'Quale nome rispetta la convenzione per una costante?', dAr: 'أي اسم يتبع العُرف الصحيح لتسمية ثابت؟',
            opzioni: ['maxStudenti', 'MaxStudenti', 'MAX_STUDENTI', 'max_studenti'], corretta: 2,
            it: 'Le costanti si scrivono in UPPER_SNAKE_CASE: tutte maiuscole e parole separate da underscore.',
            ar: 'تُكتب الثوابت بأسلوب UPPER_SNAKE_CASE: أحرف كبيرة كلها مع شرطة سفلية بين الكلمات.',
          },
        ],
        costruisci: {
          consegna: 'Completa la costante, il confronto corretto tra stringhe e il metodo che restituisce la lunghezza.',
          consegnaAr: 'أكمل الثابت والمقارنة الصحيحة بين النصوص والدالة التي تُعيد طول النص.',
          codice: `public class Login {

    private static ⟦final⟧ String PASSWORD_CORRETTA = "java2024";

    public static void main(String[] args) {
        String inserita = "java2024";
        if (PASSWORD_CORRETTA.⟦equals⟧(inserita)) {
            System.out.println("Accesso consentito");
        }
        System.out.println("Caratteri: " + inserita.⟦length⟧());
    }
}`,
          output: 'Accesso consentito\nCaratteri: 8\n',
        },
        laboratorio: {
          titolo: 'Correggi i nomi (Buona Norma)',
          consegna: 'Il codice funziona ma viola le regole di denominazione. Correggi i nomi di classe, variabili e costante (puoi usare «Applica Correzione») e fai stampare «Corso: Java, studenti: 25».',
          consegnaAr: 'الكود يعمل لكنه يخالف قواعد التسمية. صحّح أسماء الصنف والمتغيرات والثابت (يمكنك استخدام «Applica Correzione») واجعله يطبع «Corso: Java, studenti: 25».',
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
        riepilogo: [
          { it: 'final crea una costante; si scrive in UPPER_SNAKE_CASE.', ar: 'final تُنشئ ثابتاً ويُكتب بأسلوب UPPER_SNAKE_CASE.' },
          { it: 'String è un oggetto immutabile con metodi come length, charAt, substring.', ar: 'String كائن غير قابل للتعديل وله دوال مثل length و charAt و substring.' },
          { it: 'Le stringhe si confrontano con equals, mai con ==.', ar: 'تُقارن النصوص بـ equals وليس بـ == أبداً.' },
        ],
      },
      {
        id: 'l06', titolo: 'Operatori aritmetici, relazionali, logici e casting', durata: '14 min',
        obiettivi: ['Usare operatori aritmetici e di assegnazione composta', 'Scrivere condizioni con operatori relazionali e logici', 'Applicare il casting implicito ed esplicito'],
        teoria: [
          {
            it: 'Gli operatori aritmetici sono +, -, *, / e %, e seguono le stesse precedenze della matematica: prima moltiplicazioni e divisioni, poi somme e sottrazioni.',
            t: 'Operatori aritmetici e precedenza', ar: 'المعاملات الحسابية هي + و - و * و / و %، وتتبع نفس أولويات الرياضيات: الضرب والقسمة أولاً ثم الجمع والطرح.',
            ex: 'التعبير `2 + 3 * 4` يساوي 14 وليس 20. استخدم الأقواس لتوضيح الترتيب: `(2 + 3) * 4`. والمعاملات `+=` و `-=` و `++` اختصارات لتعديل نفس المتغير.',
            bn: 'Usa le parentesi quando la precedenza non è ovvia a prima vista.', bnAr: 'استخدم الأقواس عندما لا تكون الأولوية واضحة من النظرة الأولى.',
          },
          {
            it: 'Gli operatori relazionali ==, !=, <, >, <= e >= confrontano due valori e producono un risultato di tipo boolean.',
            t: 'Operatori relazionali', ar: 'المعاملات العلائقية == و != و < و > و <= و >= تقارن قيمتين وتُنتج نتيجة من النوع boolean.',
            ex: 'نتيجة `voto >= 18` هي `true` أو `false` ويمكن تخزينها في متغير `boolean promosso`. لا تخلط بين `=` (إسناد) و `==` (مقارنة).',
            bn: 'Non confondere = (assegnazione) con == (confronto).', bnAr: 'لا تخلط بين = (الإسناد) و == (المقارنة).',
          },
          {
            it: 'Gli operatori logici && (AND), || (OR) e ! (NOT) combinano condizioni e vengono valutati in cortocircuito.',
            t: 'Operatori logici e cortocircuito', ar: 'المعاملات المنطقية && (و) و || (أو) و ! (نفي) تجمع الشروط وتُقيَّم بطريقة الدائرة القصيرة.',
            ex: 'في `a && b` إذا كان `a` خاطئاً لا يُقيَّم `b` أصلاً، وفي `a || b` إذا كان `a` صحيحاً لا يُقيَّم `b`. هذا يحمي من الأخطاء: `if (n != 0 && totale / n > 5)` لا يقسم على صفر أبداً.',
            bn: 'Sfrutta il cortocircuito per proteggerti da divisioni per zero e null.', bnAr: 'استفد من الدائرة القصيرة للحماية من القسمة على صفر ومن null.',
          },
          {
            it: 'Il casting converte un valore in un altro tipo: da int a double avviene automaticamente, da double a int serve un cast esplicito che tronca i decimali.',
            t: 'Casting implicito ed esplicito', ar: 'التحويل (casting) يحوّل قيمة إلى نوع آخر: من int إلى double يتم تلقائياً، ومن double إلى int يحتاج تحويلاً صريحاً يحذف الجزء العشري.',
            ex: '`double d = 5;` تحويل آمن تلقائي (widening). أما `int x = (int) 3.9;` فتحويل صريح والنتيجة 3 (حذف وليس تقريب). للتقريب استخدم `Math.round(3.9)` التي تعطي 4.',
            bn: 'Rendi espliciti i cast che perdono informazione.', bnAr: 'اجعل التحويلات التي تفقد معلومات صريحة.',
          },
        ],
        analogia: {
          titolo: 'La bilancia e il cancello',
          it: 'Gli operatori relazionali sono una bilancia che risponde sì o no; && è un cancello che si apre solo se tutte le chiavi girano.',
          ar: 'المعاملات العلائقية مثل الميزان: تضع قيمتين وتحصل على جواب "نعم" أو "لا" (`true`/`false`). أما `&&` فهو باب بقفلين: لا يُفتح إلا إذا فُتح القفلان، وإذا فشل المفتاح الأول لا تحاول حتى استخدام الثاني (الدائرة القصيرة). و `||` باب يُفتح بأي مفتاح من المفتاحين.',
        },
        esempio: {
          file: 'Operatori.java',
          codice: `public class Operatori {

    public static void main(String[] args) {
        int a = 17;
        int b = 5;
        System.out.println("Somma: " + (a + b) + ", prodotto: " + a * b);
        System.out.println("Quoziente: " + a / b + ", resto: " + a % b);

        int punti = 10;
        punti += 5;
        punti++;
        System.out.println("Punti: " + punti);

        boolean maggiorenne = a >= 18;
        boolean conPermesso = true;
        boolean puoEntrare = maggiorenne || conPermesso;
        System.out.println("Maggiorenne: " + maggiorenne + ", può entrare: " + puoEntrare);

        int divisore = 0;
        boolean sicuro = divisore != 0 && a / divisore > 1;
        System.out.println("Divisione sicura: " + sicuro);

        double prezzo = 9.99;
        int euro = (int) prezzo;
        long arrotondato = Math.round(prezzo);
        System.out.println("Troncato: " + euro + ", arrotondato: " + arrotondato + ", radice: " + Math.sqrt(16));
    }
}`,
          note: [
            ['punti += 5', { t: 'Assegnazione composta', ar: 'إسناد مركّب', ex: '`punti += 5` تعني `punti = punti + 5`، ثم `punti++` تزيد واحداً فتصبح القيمة 16.' }],
            ['divisore != 0 && a / divisore', { t: 'Cortocircuito', ar: 'الدائرة القصيرة', ex: 'بما أن `divisore != 0` خاطئ، لا يُقيَّم الجزء الثاني `a / divisore` أصلاً، فلا يحدث `ArithmeticException`.' }],
            ['(int) prezzo', { t: 'Cast che tronca', ar: 'تحويل يحذف الكسور', ex: '`(int) 9.99` يعطي 9: التحويل يحذف الجزء العشري ولا يقرّب. أما `Math.round` فتعطي 10.' }],
          ],
        },
        norma: {
          it: 'Condizioni booleane chiare, parentesi quando aiutano la lettura e cast espliciti solo dove servono; sfrutta il cortocircuito per scrivere controlli sicuri.',
          ar: 'شروط منطقية واضحة، وأقواس عندما تسهّل القراءة، وتحويلات صريحة فقط عند الحاجة؛ واستفد من الدائرة القصيرة لكتابة فحوص آمنة.',
        },
        quiz: [
          {
            d: 'Quanto vale 2 + 3 * 4 - 6 / 4?', dAr: 'ما قيمة التعبير 2 + 3 * 4 - 6 / 4؟',
            opzioni: ['18.5', '13', '12.5', '5'], corretta: 1,
            it: 'Prima moltiplicazione e divisione intera: 3*4 = 12 e 6/4 = 1. Poi 2 + 12 - 1 = 13.',
            ar: 'أولاً الضرب والقسمة الصحيحة: 3*4 = 12 و 6/4 = 1، ثم 2 + 12 - 1 = 13.',
          },
          {
            d: 'Con int n = 0, cosa succede valutando (n != 0 && 10 / n > 1)?', dAr: 'إذا كان int n = 0، ماذا يحدث عند تقييم (n != 0 && 10 / n > 1)؟',
            opzioni: ['ArithmeticException: divisione per zero', 'Il risultato è false e la divisione non viene eseguita', 'Il risultato è true', 'Errore di compilazione'], corretta: 1,
            it: 'Grazie al cortocircuito, n != 0 è falso e la seconda parte non viene valutata: nessuna divisione per zero.',
            ar: 'بفضل الدائرة القصيرة، الشرط n != 0 خاطئ فلا يُقيَّم الجزء الثاني، ولا تحدث قسمة على صفر.',
          },
        ],
        costruisci: {
          consegna: 'Completa: l\'operatore del resto per capire se un numero è pari, l\'operatore logico AND e il cast a int.',
          consegnaAr: 'أكمل: معامل باقي القسمة لمعرفة إن كان العدد زوجياً، والمعامل المنطقي AND، والتحويل إلى int.',
          codice: `public class Controlli {

    public static void main(String[] args) {
        int numero = 24;
        boolean pari = numero ⟦%⟧ 2 == 0;
        boolean grande = numero > 10;
        System.out.println("Pari e grande: " + (pari ⟦&&⟧ grande));
        double media = 27.8;
        int votoIntero = (⟦int⟧) media;
        System.out.println("Voto intero: " + votoIntero);
    }
}`,
          output: 'Pari e grande: true\nVoto intero: 27\n',
        },
        laboratorio: {
          titolo: 'Il calcolatore dello sconto',
          consegna: 'Dato un prezzo di 80.0 euro e una costante SCONTO_PERCENTUALE = 15, calcola il prezzo scontato e stampa «Prezzo scontato: 68.0». Poi stampa «Spedizione gratuita: true» se il prezzo scontato è almeno 50 euro (usa una costante SOGLIA_SPEDIZIONE).',
          consegnaAr: 'إذا كان السعر 80.0 يورو والثابت SCONTO_PERCENTUALE = 15، احسب السعر بعد الخصم واطبع «Prezzo scontato: 68.0». ثم اطبع «Spedizione gratuita: true» إذا كان السعر بعد الخصم 50 يورو على الأقل (استخدم ثابتاً SOGLIA_SPEDIZIONE).',
          codice: `public class Sconto {

    public static void main(String[] args) {
        double prezzo = 80.0;
        // dichiara le costanti e calcola il prezzo scontato

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Prezzo scontato: 68.0\nSpedizione gratuita: true', msg: 'Output atteso: «Prezzo scontato: 68.0» e «Spedizione gratuita: true».', msgAr: 'المخرجات المتوقعة: «Prezzo scontato: 68.0» ثم «Spedizione gratuita: true».' },
            { tipo: 'codice', re: 'final\\s+(int|double)\\s+SCONTO_PERCENTUALE', msg: 'Dichiara la costante SCONTO_PERCENTUALE.', msgAr: 'صرّح عن الثابت SCONTO_PERCENTUALE.' },
            { tipo: 'codice', re: 'SOGLIA_SPEDIZIONE', msg: 'Usa la costante SOGLIA_SPEDIZIONE.', msgAr: 'استخدم الثابت SOGLIA_SPEDIZIONE.' },
          ],
          soluzione: `public class Sconto {

    public static void main(String[] args) {
        double prezzo = 80.0;
        final int SCONTO_PERCENTUALE = 15;
        final double SOGLIA_SPEDIZIONE = 50.0;
        double scontato = prezzo - prezzo * SCONTO_PERCENTUALE / 100;
        System.out.println("Prezzo scontato: " + scontato);
        System.out.println("Spedizione gratuita: " + (scontato >= SOGLIA_SPEDIZIONE));
    }
}`,
        },
        riepilogo: [
          { it: '* / % hanno precedenza su + e -; le parentesi chiariscono.', ar: 'للمعاملات * و / و % أولوية على + و -، والأقواس توضح الترتيب.' },
          { it: 'Relazionali e logici producono boolean; && e || valutano in cortocircuito.', ar: 'المعاملات العلائقية والمنطقية تُنتج boolean، و && و || تعمل بالدائرة القصيرة.' },
          { it: '(int) tronca i decimali; Math.round arrotonda.', ar: '(int) يحذف الكسور و Math.round تقرّب.' },
        ],
      },
      {
        id: 'l07', titolo: 'Input interattivo con Scanner', durata: '15 min',
        obiettivi: ['Leggere numeri e testo dalla tastiera', 'Evitare l\'errore classico tra nextInt e nextLine', 'Chiudere lo Scanner'],
        teoria: [
          {
            it: 'La classe Scanner del pacchetto java.util permette di leggere l\'input digitato dall\'utente sulla tastiera.',
            t: 'Scanner e System.in', ar: 'الصنف Scanner من الحزمة java.util يتيح قراءة ما يكتبه المستخدم على لوحة المفاتيح.',
            ex: 'نكتب في أعلى الملف `import java.util.Scanner;` ثم ننشئ الكائن `Scanner sc = new Scanner(System.in);`. الكائن `System.in` يمثل لوحة المفاتيح (الإدخال القياسي). في المحاكي تكتب الإدخال مسبقاً في خانة «Input (stdin)».',
            bn: 'Crea un solo Scanner su System.in per tutto il programma.', bnAr: 'أنشئ كائن Scanner واحداً على System.in للبرنامج كله.',
          },
          {
            it: 'I metodi nextInt e nextDouble leggono un numero, next legge una parola e nextLine legge tutta la riga.',
            t: 'nextInt, nextDouble, next, nextLine', ar: 'الدالتان nextInt و nextDouble تقرآن عدداً، و next تقرأ كلمة واحدة، و nextLine تقرأ السطر كاملاً.',
            ex: 'إذا كتب المستخدم نصاً بدلاً من رقم تُطلق `nextInt()` الاستثناء `InputMismatchException`. لقراءة الاسم الكامل "Mario Rossi" استخدم `nextLine()` لأن `next()` تقرأ "Mario" فقط.',
            bn: 'Mostra sempre un messaggio (prompt) prima di leggere: l\'utente deve sapere cosa inserire.', bnAr: 'اعرض دائماً رسالة توضيحية قبل القراءة ليعرف المستخدم ما المطلوب إدخاله.',
          },
          {
            it: 'Dopo nextInt il carattere di a capo resta nel buffer, quindi una nextLine successiva restituisce una stringa vuota.',
            t: 'Errore classico nextInt + nextLine', ar: 'بعد nextInt يبقى محرف السطر الجديد في المخزن المؤقت، لذلك تُعيد nextLine التالية نصاً فارغاً.',
            ex: 'عند كتابة `25` ثم Enter، تقرأ `nextInt()` الرقم 25 فقط وتترك `\\n`. أول `nextLine()` بعدها تقرأ هذا الـ`\\n` فتعيد "". الحل: استدعِ `sc.nextLine();` إضافية لتفريغ السطر قبل قراءة النص. سؤال شائع جداً في الامتحانات!',
            bn: 'Dopo nextInt/nextDouble, consuma il fine riga con una nextLine() prima di leggere testo.', bnAr: 'بعد nextInt أو nextDouble استهلك نهاية السطر بـ nextLine() قبل قراءة نص.',
          },
          {
            it: 'Lo Scanner è una risorsa e va chiuso con close() quando non serve più.',
            t: 'Chiusura della risorsa', ar: 'الـScanner مورد (resource) يجب إغلاقه بـ close() عند الانتهاء منه.',
            ex: 'إغلاق الموارد عادة جيدة يطلبها الأساتذة. انتبه: إغلاق Scanner المرتبط بـ `System.in` يغلق لوحة المفاتيح أيضاً، لذلك أغلقه مرة واحدة في نهاية البرنامج.',
            bn: 'Chiudi lo Scanner una sola volta, alla fine del programma.', bnAr: 'أغلق الـScanner مرة واحدة فقط في نهاية البرنامج.',
          },
        ],
        analogia: {
          titolo: 'Lo sportello della segreteria',
          it: 'Lo Scanner è l\'impiegato allo sportello: chiede un dato alla volta e prende esattamente quello che chiedi, lasciando il resto sul bancone.',
          ar: 'الـScanner مثل موظف شبّاك في شؤون الطلاب: تطلب منه "رقماً" فيأخذ الرقم فقط من الورقة التي قدّمها الطالب ويترك الباقي على الطاولة، حتى زر Enter! فإذا طلبت منه بعد ذلك "السطر كاملاً" أعطاك ما تبقّى على الطاولة: سطراً فارغاً. لذلك نطلب منه أولاً أن يرفع ما تبقّى (`nextLine()`) ثم نطلب الاسم.',
        },
        esempio: {
          file: 'Iscrizione.java',
          input: '20\nMario Rossi\n27,5\n',
          codice: `import java.util.Scanner;

public class Iscrizione {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Età: ");
        int eta = sc.nextInt();
        sc.nextLine();

        System.out.print("Nome e cognome: ");
        String nome = sc.nextLine();

        System.out.print("Media: ");
        double media = sc.nextDouble();

        System.out.println(nome + " (" + eta + " anni) ha media " + media);
        sc.close();
    }
}`,
          note: [
            ['import java.util.Scanner', { t: 'Importazione di Scanner', ar: 'استيراد Scanner', ex: 'الصنف Scanner ليس في `java.lang` لذلك يجب استيراده من الحزمة `java.util`.' }],
            ['new Scanner(System.in)', { t: 'Scanner sulla tastiera', ar: 'Scanner على لوحة المفاتيح', ex: 'يُنشأ كائن Scanner في الـHeap مرتبط بالإدخال القياسي. في المحاكي يقرأ من خانة «Input (stdin)»: هنا 20 ثم "Mario Rossi" ثم 27,5.' }],
            ['sc.nextLine();', { t: 'Svuotare il fine riga', ar: 'تفريغ نهاية السطر', ex: 'هذه القراءة "تبتلع" محرف Enter المتبقي بعد `nextInt()`. احذفها وشغّل البرنامج: سيصبح الاسم نصاً فارغاً!' }],
            ['sc.nextDouble()', { t: 'Lettura di un double', ar: 'قراءة عدد عشري', ex: 'في إيطاليا الإعدادات المحلية تجعل Scanner يقبل الفاصلة `27,5`. المحاكي يقبل الفاصلة والنقطة معاً.' }],
          ],
        },
        norma: {
          it: 'Un prompt chiaro prima di ogni lettura, una nextLine() dopo nextInt/nextDouble prima di leggere testo, e chiusura dello Scanner alla fine.',
          ar: 'رسالة واضحة قبل كل قراءة، و nextLine() بعد nextInt أو nextDouble قبل قراءة نص، وإغلاق الـScanner في النهاية.',
        },
        quiz: [
          {
            d: 'L\'utente digita «30» e poi «Anna Bianchi». Il codice esegue int x = sc.nextInt(); String n = sc.nextLine(); Cosa contiene n?', dAr: 'كتب المستخدم «30» ثم «Anna Bianchi». ماذا تحتوي n؟',
            opzioni: ['«Anna Bianchi»', 'Una stringa vuota', '«30»', '«Anna»'], corretta: 1,
            it: 'nextInt legge 30 ma lascia il fine riga: la nextLine successiva legge quella riga vuota.',
            ar: 'nextInt تقرأ 30 وتترك محرف نهاية السطر، فتقرأ nextLine التالية سطراً فارغاً.',
          },
          {
            d: 'Cosa succede se l\'utente scrive «ciao» quando il programma esegue sc.nextInt()?', dAr: 'ماذا يحدث إذا كتب المستخدم «ciao» عند تنفيذ sc.nextInt()؟',
            opzioni: ['Restituisce 0', 'Viene lanciata InputMismatchException', 'Restituisce la stringa «ciao»', 'Il programma aspetta un altro valore'], corretta: 1,
            it: '«ciao» non è un intero valido: nextInt lancia java.util.InputMismatchException.',
            ar: '«ciao» ليس عدداً صحيحاً، لذلك تُطلق nextInt الاستثناء java.util.InputMismatchException.',
          },
        ],
        costruisci: {
          consegna: 'Completa la creazione dello Scanner, la lettura del numero e la chiusura della risorsa.',
          consegnaAr: 'أكمل إنشاء الـScanner وقراءة العدد وإغلاق المورد.',
          input: '7\n',
          codice: `import java.util.Scanner;

public class Doppio {

    public static void main(String[] args) {
        Scanner sc = new Scanner(⟦System.in⟧);
        System.out.print("Numero: ");
        int n = sc.⟦nextInt⟧();
        System.out.println("Il doppio è " + n * 2);
        sc.⟦close⟧();
    }
}`,
          output: 'Numero: Il doppio è 14\n',
        },
        laboratorio: {
          titolo: 'Somma e media da tastiera',
          consegna: 'Leggi un nome (riga intera) e poi due voti interi. Stampa «Studente: <nome>», «Somma: <somma>» e «Media: <media reale>». Prova con l\'input già inserito.',
          consegnaAr: 'اقرأ اسماً (سطراً كاملاً) ثم درجتين صحيحتين. اطبع «Studente: <الاسم>» و «Somma: <المجموع>» و «Media: <المعدل الحقيقي>». جرّب بالإدخال الموجود مسبقاً.',
          input: 'Giulia Verdi\n28\n25\n',
          codice: `import java.util.Scanner;

public class Voti {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // leggi il nome e i due voti, poi stampa i risultati

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Studente: Giulia Verdi\nSomma: 53\nMedia: 26.5', msg: 'Con l\'input di esempio l\'output deve essere Studente / Somma / Media.', msgAr: 'مع الإدخال المعطى يجب أن تكون المخرجات Studente ثم Somma ثم Media.' },
            { tipo: 'output', input: 'Marco Neri\n30\n30\n', atteso: 'Studente: Marco Neri\nSomma: 60\nMedia: 30.0', msg: 'Il programma deve funzionare anche con altri dati (Marco Neri, 30, 30).', msgAr: 'يجب أن يعمل البرنامج مع بيانات أخرى أيضاً (Marco Neri و 30 و 30).' },
            { tipo: 'codice', re: 'nextLine', msg: 'Leggi il nome con nextLine().', msgAr: 'اقرأ الاسم بـ nextLine().' },
          ],
          soluzione: `import java.util.Scanner;

public class Voti {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String nome = sc.nextLine();
        int voto1 = sc.nextInt();
        int voto2 = sc.nextInt();
        int somma = voto1 + voto2;
        System.out.println("Studente: " + nome);
        System.out.println("Somma: " + somma);
        System.out.println("Media: " + somma / 2.0);
        sc.close();
    }
}`,
        },
        riepilogo: [
          { it: 'import java.util.Scanner e new Scanner(System.in) per leggere dalla tastiera.', ar: 'import java.util.Scanner و new Scanner(System.in) للقراءة من لوحة المفاتيح.' },
          { it: 'nextInt/nextDouble per i numeri, next per una parola, nextLine per la riga.', ar: 'nextInt و nextDouble للأعداد، و next لكلمة، و nextLine للسطر.' },
          { it: 'Dopo nextInt serve una nextLine() per consumare il fine riga.', ar: 'بعد nextInt نحتاج nextLine() لاستهلاك نهاية السطر.' },
        ],
      },
    ],
  };
  if (typeof module === 'object' && module.exports) module.exports = livello;
  else (root.CF_LIVELLI = root.CF_LIVELLI || []).push(livello);
})(typeof globalThis !== 'undefined' ? globalThis : this);
