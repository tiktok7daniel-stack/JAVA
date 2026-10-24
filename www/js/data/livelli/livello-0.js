/* CodeForge — Livello 0: Primi Passi (Matricola). */
(function (root) {
  'use strict';
  const livello = {
    numero: 0, id: 'L0', colore: '#58A6FF', icona: 'sparkle',
    titolo: 'Primi Passi', titoloAr: 'الخطوات الأولى',
    grado: 'Matricola', gradoAr: 'طالب مستجد',
    descr: 'Che cos\'è un programma, come nasce un file Java e come leggere i primi errori.',
    lezioni: [
      {
        id: 'l01', titolo: 'Cos\'è un programma? javac, bytecode e JVM', durata: '10 min',
        obiettivi: ['Capire che un programma è una sequenza ordinata di istruzioni', 'Distinguere codice sorgente, bytecode e JVM'],
        teoria: [
          {
            it: 'Un programma è una sequenza di istruzioni che il computer esegue una dopo l\'altra, dall\'alto verso il basso.',
            t: 'Programma ed esecuzione sequenziale', ar: 'البرنامج سلسلة من التعليمات ينفّذها الحاسوب واحدة تلو الأخرى، من الأعلى إلى الأسفل.',
            ex: 'الحاسوب لا "يفهم" ما نريد، بل ينفّذ حرفياً ما نكتبه وبالترتيب. إذا بدّلت ترتيب سطرين تتغيّر النتيجة. هذا المبدأ (التنفيذ المتسلسل) هو أساس كل البرمجة.',
            bn: 'Scrivi un\'istruzione per riga: il codice si legge come un elenco ordinato di passi.', bnAr: 'اكتب تعليمة واحدة في كل سطر، ليُقرأ الكود كقائمة خطوات مرتّبة.',
          },
          {
            it: 'Il codice sorgente Java si scrive in un file di testo con estensione .java ed è leggibile dalle persone.',
            t: 'Codice sorgente (.java)', ar: 'الكود المصدري لـ Java يُكتب في ملف نصي بامتداد .java ويستطيع البشر قراءته.',
            ex: 'الملف `Main.java` ملف نصي عادي يمكن فتحه بأي محرر. فيه كلمات إنجليزية مثل `class` و `public` ورموز مثل `{ }`، لكن الحاسوب لا يستطيع تشغيله مباشرة.',
            bn: 'Il nome del file coincide con il nome della classe pubblica.', bnAr: 'اسم الملف يطابق اسم الصنف العام بالضبط.',
          },
          {
            it: 'Il compilatore javac controlla il codice e lo traduce in bytecode, che viene salvato in un file .class.',
            t: 'Compilazione e bytecode', ar: 'المترجم javac يفحص الكود ويترجمه إلى bytecode يُحفظ في ملف .class.',
            ex: 'الأمر `javac Main.java` يتحقق أولاً من صحة الكتابة (القواعد والأنواع). إذا وجد خطأً يرفض الترجمة ويخبرك بالسطر. إذا كان كل شيء صحيحاً يُنتج `Main.class` بلغة وسيطة اسمها bytecode.',
            bn: 'Correggi gli errori a partire dal primo segnalato: spesso gli altri ne sono la conseguenza.', bnAr: 'صحّح الأخطاء بدءاً من أول خطأ يظهر، فكثيراً ما تكون الأخطاء التالية نتيجة له.',
          },
          {
            it: 'La Java Virtual Machine (JVM) esegue il bytecode: per questo lo stesso programma funziona su Windows, Linux e Android.',
            t: 'JVM e portabilità', ar: 'آلة جافا الافتراضية (JVM) تنفّذ الـbytecode، ولهذا يعمل البرنامج نفسه على Windows و Linux و Android.',
            ex: 'الأمر `java Main` يشغّل الـJVM التي تقرأ الـbytecode وتنفذه. لكل نظام تشغيل JVM خاصة به، لكن الـbytecode واحد: "اكتب مرة، شغّل في كل مكان" (Write once, run anywhere).',
            bn: 'Non serve ricompilare per ogni sistema operativo: basta una JVM.', bnAr: 'لا حاجة لإعادة الترجمة لكل نظام تشغيل: يكفي وجود JVM.',
          },
        ],
        analogia: {
          titolo: 'La ricetta, il traduttore e il cuoco',
          it: 'Il codice .java è una ricetta, javac la traduce in una lingua universale e la JVM è il cuoco presente in ogni cucina.',
          ar: 'تخيّل أنك كتبت وصفة طبخ بالإيطالية (الكود المصدري .java). المترجم javac يراجع الوصفة ويترجمها إلى لغة عالمية يفهمها كل الطهاة (الـbytecode). الـJVM هو الطاهي الموجود في كل مطبخ — في Windows أو Linux أو هاتف Android — يقرأ الوصفة العالمية وينفذها خطوة بخطوة بالترتيب.',
        },
        esempio: {
          file: 'Ordine.java',
          codice: `public class Ordine {

    public static void main(String[] args) {
        System.out.println("1. Prendo gli ingredienti");
        System.out.println("2. Preparo l'impasto");
        System.out.println("3. Inforno la pizza");
    }
}`,
          note: [
            ['public class Ordine', { t: 'Classe che contiene il programma', ar: 'الصنف الذي يحتوي البرنامج', ex: 'كل برنامج Java يعيش داخل صنف. اسم الصنف `Ordine` يعني أن الملف يجب أن يكون `Ordine.java`.' }],
            ['"1. Prendo', { t: 'Prima istruzione eseguita', ar: 'أول تعليمة تُنفَّذ', ex: 'الـJVM تبدأ من أول سطر داخل `main` ثم تنتقل إلى التالي. شغّل البرنامج خطوة بخطوة لترى الترتيب.' }],
          ],
        },
        norma: {
          it: 'Un programma ben scritto si legge dall\'alto verso il basso come una ricetta: un\'istruzione per riga, nell\'ordine in cui deve avvenire.',
          ar: 'البرنامج الجيد يُقرأ من الأعلى إلى الأسفل مثل الوصفة: تعليمة واحدة في كل سطر وبالترتيب الذي يجب أن تحدث به.',
        },
        quiz: [
          {
            d: 'Quale strumento traduce il file .java in bytecode?', dAr: 'أي أداة تترجم ملف .java إلى bytecode؟',
            opzioni: ['La JVM', 'Il compilatore javac', 'Il sistema operativo', 'Il file .class'], corretta: 1,
            it: 'javac è il compilatore: controlla il codice e produce il bytecode nel file .class. La JVM invece lo esegue.',
            ar: 'javac هو المترجم: يفحص الكود ويُنتج الـbytecode في ملف .class، أما الـJVM فهي التي تنفّذه.',
          },
          {
            d: 'Se scambio le prime due righe del main, che cosa succede?', dAr: 'إذا بدّلت أول سطرين داخل main، ماذا يحدث؟',
            opzioni: ['Nulla: Java riordina le istruzioni', 'Errore di compilazione', 'Le prime due righe vengono stampate in ordine inverso', 'Il programma non parte'], corretta: 2,
            it: 'Le istruzioni vengono eseguite nell\'ordine in cui sono scritte: cambiando l\'ordine cambia l\'output.',
            ar: 'التعليمات تُنفَّذ بالترتيب الذي كُتبت به، لذلك تغيير الترتيب يغيّر المخرجات.',
          },
        ],
        costruisci: {
          consegna: 'Completa le parole chiave mancanti del programma più piccolo possibile.',
          consegnaAr: 'أكمل الكلمات المفتاحية الناقصة في أصغر برنامج Java ممكن.',
          codice: `public ⟦class⟧ Saluto {

    public static void ⟦main⟧(String[] args) {
        System.out.⟦println⟧("Ciao JVM!");
    }
}`,
          output: 'Ciao JVM!\n',
        },
        laboratorio: {
          titolo: 'Le tre fasi di Java',
          consegna: 'Stampa, in quest\'ordine e su tre righe, «1. Scrivo il codice», «2. Compilo con javac» e «3. Eseguo con la JVM».',
          consegnaAr: 'اطبع بهذا الترتيب وعلى ثلاثة أسطر: «1. Scrivo il codice» ثم «2. Compilo con javac» ثم «3. Eseguo con la JVM».',
          codice: `public class Fasi {

    public static void main(String[] args) {
        // scrivi qui le tre istruzioni di stampa

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: '1. Scrivo il codice\n2. Compilo con javac\n3. Eseguo con la JVM', msg: 'Le tre righe devono comparire nell\'ordine richiesto.', msgAr: 'يجب أن تظهر الأسطر الثلاثة بالترتيب المطلوب.' },
          ],
          soluzione: `public class Fasi {

    public static void main(String[] args) {
        System.out.println("1. Scrivo il codice");
        System.out.println("2. Compilo con javac");
        System.out.println("3. Eseguo con la JVM");
    }
}`,
        },
        riepilogo: [
          { it: 'Un programma è una sequenza ordinata di istruzioni.', ar: 'البرنامج سلسلة مرتبة من التعليمات.' },
          { it: 'javac traduce il file .java in bytecode (.class).', ar: 'javac يترجم ملف .java إلى bytecode في ملف .class.' },
          { it: 'La JVM esegue il bytecode su qualsiasi sistema operativo.', ar: 'الـJVM تنفّذ الـbytecode على أي نظام تشغيل.' },
        ],
      },
      {
        id: 'l02', titolo: 'Anatomia del primo programma', durata: '10 min',
        obiettivi: ['Riconoscere classe, metodo main e istruzione di stampa', 'Usare correttamente punto e virgola e parentesi graffe'],
        teoria: [
          {
            it: 'Un programma Java è composto da una o più classi: ogni istruzione deve trovarsi all\'interno di una classe.',
            t: 'Classe', ar: 'يتكوّن برنامج Java من صنف واحد أو أكثر، ويجب أن تكون كل تعليمة داخل صنف.',
            ex: 'الصنف (`class`) هو الوحدة الأساسية في Java. لا يمكن كتابة أي تعليمة أو دالة خارج صنف، على عكس لغات مثل C أو Python. حتى برنامج "Ciao mondo" البسيط يحتاج إلى صنف.',
            bn: 'Il nome della classe è un sostantivo in PascalCase (es. ContoCorrente).', bnAr: 'اسم الصنف اسمٌ (وليس فعلاً) بأسلوب PascalCase مثل ContoCorrente.',
          },
          {
            it: 'L\'esecuzione inizia sempre dal metodo main, che è il punto di ingresso del programma.',
            t: 'Punto di ingresso (main)', ar: 'يبدأ التنفيذ دائماً من الدالة main، وهي نقطة الدخول إلى البرنامج.',
            ex: 'عند التشغيل تبحث JVM عن الدالة `public static void main(String[] args)` بهذا التوقيع تماماً، وتُنشئ لها أول إطار (frame) في ذاكرة الـStack. إذا لم تجدها لا يعمل البرنامج.',
            bn: 'Il main deve restare breve: crea gli oggetti e delega il lavoro ai metodi.', bnAr: 'اجعل main قصيرة: تُنشئ الكائنات وتوزّع العمل على الدوال.',
          },
          {
            it: 'System.out.println stampa un testo sulla console e poi va a capo, mentre System.out.print non va a capo.',
            t: 'Stampa su console', ar: 'System.out.println تطبع نصاً على الشاشة ثم تنتقل إلى سطر جديد، أما System.out.print فلا تنتقل.',
            ex: 'الكائن `System.out` يمثل الشاشة (المخرجات القياسية). النص بين علامتي تنصيص مزدوجة `"..."` هو قيمة من النوع `String`. الفرق بين `print` و `println` سؤال متكرر في الامتحان.',
            bn: 'Messaggi chiari, in italiano corretto: l\'output è l\'interfaccia con l\'utente.', bnAr: 'اكتب رسائل واضحة وصحيحة لغوياً، فالمخرجات هي واجهة البرنامج مع المستخدم.',
          },
          {
            it: 'Ogni istruzione termina con il punto e virgola e i blocchi di codice sono delimitati da parentesi graffe.',
            t: 'Istruzione e blocco', ar: 'كل تعليمة تنتهي بفاصلة منقوطة، والكتل البرمجية محصورة بين أقواس معقوفة.',
            ex: 'الفاصلة المنقوطة `;` تُعلن نهاية التعليمة، ونسيانها هو أشهر خطأ ترجمة. الأقواس `{ }` تحدد بداية ونهاية الصنف والدالة، ويجب أن يكون لكل قوس مفتوح قوس مغلق.',
            bn: 'Indenta ogni blocco annidato di 4 spazi e apri la graffa sulla stessa riga.', bnAr: 'أزِح كل كتلة متداخلة بأربع مسافات، وافتح القوس { في نفس السطر.',
          },
        ],
        analogia: {
          titolo: 'La lettera ufficiale',
          it: 'La classe è la busta, il main è la prima pagina che si legge, le istruzioni sono le frasi che finiscono con il punto.',
          ar: 'فكّر في رسالة رسمية: الصنف `class` هو الظرف الذي يحتوي كل شيء، والدالة `main` هي الصفحة الأولى التي يبدأ منها القارئ دائماً، وكل تعليمة جملة يجب أن تنتهي بنقطة (هنا `;`). والأقواس `{ }` مثل بداية ونهاية الفقرة: إن فتحت فقرة يجب أن تغلقها.',
        },
        esempio: {
          file: 'Main.java',
          codice: `/**
 * Il mio primo programma Java.
 */
public class Main {

    public static void main(String[] args) {
        // Stampa un messaggio sulla console
        System.out.println("Ciao, mondo!");
        System.out.print("Benvenuto ");
        System.out.println("nel corso di Programmazione");
    }
}`,
          note: [
            ['/**', { t: 'Commento Javadoc', ar: 'تعليق توثيقي Javadoc', ex: 'التعليق الذي يبدأ بـ `/**` تعليق توثيق: أداة javadoc تحوّله إلى صفحات توثيق. المترجم يتجاهل كل التعليقات.' }],
            ['public class Main', { t: 'Dichiarazione della classe pubblica', ar: 'تعريف الصنف العام Main', ex: '`public` تعني أن الصنف مرئي للجميع، و`class` تعرّف صنفاً اسمه `Main`، لذلك يجب أن يُحفظ في ملف `Main.java`.' }],
            ['System.out.print("Benvenuto', { t: 'print senza a capo', ar: 'طباعة بدون سطر جديد', ex: '`print` تطبع النص وتبقى في نفس السطر، لذلك يظهر النص التالي ملاصقاً له: "Benvenuto nel corso di Programmazione".' }],
          ],
        },
        norma: {
          it: 'Indentazione coerente (4 spazi), una istruzione per riga, nomi delle classi in PascalCase e commenti che spiegano il perché, non il cosa.',
          ar: 'إزاحة منتظمة (4 مسافات)، تعليمة واحدة في كل سطر، أسماء الأصناف بأسلوب PascalCase، وتعليقات تشرح "لماذا" وليس "ماذا".',
        },
        quiz: [
          {
            d: 'Come deve chiamarsi il file che contiene «public class Saluto»?', dAr: 'ما اسم الملف الذي يجب أن يحتوي على «public class Saluto»؟',
            opzioni: ['saluto.java', 'Saluto.java', 'Saluto.class', 'Main.java'], corretta: 1,
            it: 'Il file deve avere esattamente lo stesso nome della classe pubblica, maiuscole comprese, con estensione .java.',
            ar: 'يجب أن يحمل الملف نفس اسم الصنف العام تماماً مع مراعاة الأحرف الكبيرة، وبامتداد .java.',
          },
          {
            d: 'Cosa stampa: System.out.print("A"); System.out.println("B"); System.out.print("C");', dAr: 'ماذا يطبع هذا الكود؟',
            opzioni: ['A, B e C su tre righe', '«AB» su una riga e «C» sulla riga successiva', '«ABC» su una riga', '«A» e poi «BC»'], corretta: 1,
            it: 'print("A") non va a capo, println("B") stampa B e poi va a capo, quindi C finisce sulla riga successiva.',
            ar: 'print("A") لا تنتقل لسطر جديد، و println("B") تطبع B ثم تنتقل لسطر جديد، لذلك يظهر C في السطر التالي.',
          },
        ],
        costruisci: {
          consegna: 'Completa la firma del main, il punto e virgola mancante e la parentesi di chiusura della classe.',
          consegnaAr: 'أكمل توقيع الدالة main والفاصلة المنقوطة الناقصة والقوس الذي يغلق الصنف.',
          codice: `public class Benvenuto {

    public static void main(⟦String⟧[] args) {
        System.out.println("Primo giorno di lezione")⟦;⟧
    }
⟦}⟧`,
          output: 'Primo giorno di lezione\n',
        },
        laboratorio: {
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
        riepilogo: [
          { it: 'Tutto il codice sta dentro una classe; il file ha il nome della classe pubblica.', ar: 'كل الكود داخل صنف، والملف يحمل اسم الصنف العام.' },
          { it: 'L\'esecuzione parte da public static void main(String[] args).', ar: 'التنفيذ يبدأ من public static void main(String[] args).' },
          { it: 'println va a capo, print no; ogni istruzione finisce con ;', ar: 'println تنتقل لسطر جديد و print لا تفعل، وكل تعليمة تنتهي بـ ;' },
        ],
      },
      {
        id: 'l03', titolo: 'Leggere e correggere gli errori di compilazione', durata: '12 min',
        obiettivi: ['Leggere un messaggio di errore del compilatore', 'Correggere gli errori di sintassi più comuni'],
        teoria: [
          {
            it: 'Un errore di compilazione impedisce a javac di produrre il bytecode: il programma non parte finché non viene corretto.',
            t: 'Errore di compilazione', ar: 'خطأ الترجمة يمنع javac من إنتاج الـbytecode: لا يعمل البرنامج حتى يتم تصحيحه.',
            ex: 'هذا النوع من الأخطاء "صديق" للمبرمج: يُكتشف قبل التشغيل ويخبرك المترجم بمكانه بالضبط. أخطر منه أخطاء وقت التشغيل التي تظهر فقط عند تنفيذ البرنامج.',
            bn: 'Compila spesso: è più facile correggere un errore alla volta.', bnAr: 'ترجم الكود كثيراً: من الأسهل تصحيح خطأ واحد في كل مرة.',
          },
          {
            it: 'Il messaggio indica il file, il numero di riga e una descrizione, per esempio «Main.java:5: error: \';\' expected».',
            t: 'Messaggio di errore', ar: 'رسالة الخطأ تحدد الملف ورقم السطر ووصف الخطأ، مثل «Main.java:5: error: \';\' expected».',
            ex: 'اقرأ الرسالة من اليسار: اسم الملف، ثم رقم السطر (5)، ثم الوصف (`\';\' expected` أي "كانت متوقعة فاصلة منقوطة"). أحياناً يكون الخطأ الحقيقي في السطر الذي قبله مباشرة.',
            bn: 'Leggi sempre il primo messaggio di errore con attenzione prima di modificare il codice.', bnAr: 'اقرأ دائماً أول رسالة خطأ بعناية قبل تعديل الكود.',
          },
          {
            it: 'Gli errori più comuni sono il punto e virgola mancante, le parentesi non bilanciate e le stringhe non chiuse.',
            t: 'Errori di sintassi frequenti', ar: 'أكثر الأخطاء شيوعاً: نسيان الفاصلة المنقوطة، والأقواس غير المتوازنة، والنصوص غير المغلقة.',
            ex: 'كل `(` تحتاج `)`، وكل `{` تحتاج `}`، وكل نص يبدأ بـ `"` يجب أن ينتهي بـ `"` في نفس السطر. الإزاحة المنتظمة تساعدك على رؤية الأقواس الناقصة بسرعة.',
            bn: 'Indenta il codice: le parentesi mancanti diventano evidenti.', bnAr: 'نسّق الإزاحة لتظهر الأقواس الناقصة بوضوح.',
          },
          {
            it: 'Java distingue le maiuscole dalle minuscole: system e System sono due nomi diversi.',
            t: 'Case sensitivity', ar: 'لغة Java تميّز بين الأحرف الكبيرة والصغيرة: system و System اسمان مختلفان.',
            ex: 'كتابة `system.out.println` تسبب الخطأ "cannot find symbol" لأن الصنف اسمه `System` بحرف S كبير. نفس الشيء مع أسماء المتغيرات: `voto` و `Voto` متغيران مختلفان.',
            bn: 'Rispetta le convenzioni sui nomi: aiutano a evitare errori di maiuscole.', bnAr: 'التزم بقواعد التسمية لتتجنب أخطاء الأحرف الكبيرة والصغيرة.',
          },
        ],
        analogia: {
          titolo: 'Il professore che corregge la bozza',
          it: 'Il compilatore è come un professore che rilegge la bozza della tesi prima della discussione e segnala riga per riga gli errori.',
          ar: 'المترجم javac مثل أستاذ صارم يقرأ مسودة بحثك قبل المناقشة: لا يسمح لك بالتقديم (التشغيل) حتى تصحح كل الأخطاء، لكنه يضع علامة على رقم الصفحة والسطر ويكتب بجانبها ما المشكلة. اقرأ ملاحظته بهدوء وصحّح من أول ملاحظة.',
        },
        esempio: {
          file: 'Corretto.java',
          codice: `public class Corretto {

    public static void main(String[] args) {
        // Ogni istruzione termina con ;
        System.out.println("Il punto e virgola chiude l'istruzione");
        // Ogni stringa si apre e si chiude con le virgolette
        System.out.println("Stringa chiusa correttamente");
        // System si scrive con la S maiuscola
        System.out.println("Maiuscole rispettate");
    }
}`,
          note: [
            ['System.out.println("Il punto', { t: 'Istruzione completa', ar: 'تعليمة كاملة', ex: 'لاحظ الأجزاء الثلاثة: `System` بحرف كبير، والنص بين علامتي تنصيص، و`;` في النهاية. جرّب في المحرر حذف `;` وشاهد رسالة المترجم.' }],
          ],
        },
        norma: {
          it: 'Correggi un errore alla volta partendo dal primo segnalato, ricompila e solo dopo passa al successivo.',
          ar: 'صحّح خطأً واحداً في كل مرة بدءاً من الأول، ثم أعد الترجمة، وبعدها انتقل إلى الخطأ التالي.',
        },
        quiz: [
          {
            d: 'Il compilatore segnala «error: \';\' expected» alla riga 4. Cosa manca?', dAr: 'يظهر الخطأ «\';\' expected» في السطر 4. ما الناقص؟',
            opzioni: ['Una parentesi graffa', 'Il punto e virgola alla fine dell\'istruzione', 'Il metodo main', 'Le virgolette'], corretta: 1,
            it: '«\';\' expected» significa che il compilatore si aspettava un punto e virgola alla fine dell\'istruzione.',
            ar: '«\';\' expected» تعني أن المترجم كان يتوقع فاصلة منقوطة في نهاية التعليمة.',
          },
          {
            d: 'Perché system.out.println("Ciao"); non compila?', dAr: 'لماذا لا يُترجم السطر system.out.println("Ciao");؟',
            opzioni: ['Manca il punto e virgola', 'Java distingue maiuscole e minuscole: la classe si chiama System', 'Le virgolette sono sbagliate', 'println non esiste'], corretta: 1,
            it: 'Java è case sensitive: «system» non esiste, la classe corretta è «System» con la S maiuscola.',
            ar: 'Java حساسة لحالة الأحرف: «system» غير موجود، والاسم الصحيح هو «System» بحرف S كبير.',
          },
        ],
        costruisci: {
          consegna: 'Correggi gli errori riempiendo gli spazi: la S maiuscola, la virgoletta di chiusura e il punto e virgola.',
          consegnaAr: 'صحّح الأخطاء بملء الفراغات: حرف S الكبير، وعلامة التنصيص الختامية، والفاصلة المنقوطة.',
          codice: `public class Correzione {

    public static void main(String[] args) {
        ⟦System⟧.out.println("Errore corretto⟦"⟧);
        System.out.println("Ora compila")⟦;⟧
    }
}`,
          output: 'Errore corretto\nOra compila\n',
        },
        laboratorio: {
          titolo: 'Caccia agli errori di sintassi',
          consegna: 'Il programma contiene tre errori di compilazione. Premi «Analizza & Esegui», leggi i messaggi e correggili uno alla volta finché stampa le tre righe.',
          consegnaAr: 'يحتوي البرنامج على ثلاثة أخطاء ترجمة. اضغط «Analizza & Esegui» واقرأ الرسائل وصحّحها واحداً تلو الآخر حتى يطبع الأسطر الثلاثة.',
          codice: `public class Errori {

    public static void main(String[] args) {
        system.out.println("Riga 1");
        System.out.println("Riga 2")
        System.out.println("Riga 3);
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Riga 1\nRiga 2\nRiga 3', msg: 'Il programma deve compilare e stampare le tre righe.', msgAr: 'يجب أن يُترجم البرنامج ويطبع الأسطر الثلاثة.' },
          ],
          soluzione: `public class Errori {

    public static void main(String[] args) {
        System.out.println("Riga 1");
        System.out.println("Riga 2");
        System.out.println("Riga 3");
    }
}`,
        },
        riepilogo: [
          { it: 'Gli errori di compilazione si leggono: file, riga, descrizione.', ar: 'رسالة خطأ الترجمة تُقرأ هكذا: الملف، رقم السطر، الوصف.' },
          { it: 'Controlla ; , parentesi bilanciate e stringhe chiuse.', ar: 'تحقق من ; ومن توازن الأقواس ومن إغلاق النصوص.' },
          { it: 'Java distingue maiuscole e minuscole.', ar: 'Java تميّز بين الأحرف الكبيرة والصغيرة.' },
        ],
      },
    ],
  };
  if (typeof module === 'object' && module.exports) module.exports = livello;
  else (root.CF_LIVELLI = root.CF_LIVELLI || []).push(livello);
})(typeof globalThis !== 'undefined' ? globalThis : this);
