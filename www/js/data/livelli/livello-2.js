/* CodeForge — Livello 2: Logica e Controllo del Flusso (Programmatore Junior). */
(function (root) {
  'use strict';
  const livello = {
    numero: 2, id: 'L2', colore: '#A371F7', icona: 'flow',
    titolo: 'Logica e Controllo del Flusso', titoloAr: 'المنطق والتحكم في سير البرنامج',
    grado: 'Programmatore Junior', gradoAr: 'مبرمج مبتدئ',
    descr: 'Decisioni con if e switch, cicli while, do-while e for, visibilità delle variabili e schemi algoritmici classici.',
    lezioni: [
      {
        id: 'l08', titolo: 'Decisioni con if, else if, else e operatore ternario', durata: '12 min',
        obiettivi: ['Scrivere catene if / else if / else', 'Usare l\'operatore ternario per scelte semplici'],
        teoria: [
          {
            it: 'L\'istruzione if esegue un blocco di codice solo se la condizione booleana tra parentesi è vera.',
            t: 'Istruzione condizionale (if)', ar: 'تعليمة if تنفّذ كتلة من الكود فقط إذا كان الشرط المنطقي بين القوسين صحيحاً.',
            ex: 'الشرط يجب أن يكون من النوع `boolean` مثل `voto >= 18`. في Java لا يمكن استخدام عدد كشرط كما في C: كتابة `if (x = 5)` خطأ ترجمة.',
            bn: 'Usa sempre le parentesi graffe, anche per una sola istruzione.', bnAr: 'استخدم الأقواس { } دائماً حتى لو كانت تعليمة واحدة.',
          },
          {
            it: 'Il ramo else viene eseguito quando la condizione è falsa; con else if si possono concatenare più alternative.',
            t: 'else / else if', ar: 'يُنفَّذ فرع else عندما يكون الشرط خاطئاً، ومع else if يمكن ربط عدة بدائل متتالية.',
            ex: 'في سلسلة `if / else if / else` تُفحص الشروط بالترتيب من الأعلى، وأول شرط صحيح يُنفَّذ فرعه فقط ويتم تجاهل الباقي. لذلك ترتيب الشروط مهم جداً.',
            bn: 'Ordina le condizioni in modo che ogni ramo sia raggiungibile.', bnAr: 'رتّب الشروط بحيث يمكن الوصول إلى كل فرع.',
          },
          {
            it: 'L\'operatore ternario condizione ? valore1 : valore2 sceglie tra due valori in una sola espressione.',
            t: 'Operatore ternario', ar: 'المعامل الثلاثي شرط ? قيمة1 : قيمة2 يختار بين قيمتين في تعبير واحد.',
            ex: '`String esito = voto >= 18 ? "Promosso" : "Respinto";` إذا كان الشرط صحيحاً يأخذ القيمة الأولى وإلا الثانية. مناسب للاختيارات البسيطة فقط؛ لا تضع معاملات ثلاثية متداخلة.',
            bn: 'Usa il ternario solo per scelte semplici: se diventa complesso, preferisci if-else.', bnAr: 'استخدم المعامل الثلاثي للاختيارات البسيطة فقط، وإن تعقّد فاستخدم if-else.',
          },
          {
            it: 'Una condizione booleana va scritta in modo esplicito e leggibile, senza confronti ridondanti con true o false.',
            t: 'Condizioni booleane pulite', ar: 'يجب كتابة الشرط المنطقي بشكل صريح ومقروء، دون مقارنات زائدة مع true أو false.',
            ex: 'بدلاً من `if (attivo == true)` اكتب `if (attivo)`، وبدلاً من `if (attivo == false)` اكتب `if (!attivo)`. الفاحص Buona Norma يصحح هذا تلقائياً.',
            bn: 'Mai confrontare un boolean con true/false.', bnAr: 'لا تقارن متغيراً منطقياً مع true أو false.',
          },
        ],
        analogia: {
          titolo: 'Il bivio sulla strada',
          it: 'Un if è un bivio: il cartello (la condizione) decide se andare a destra o a sinistra; else if aggiunge altre strade.',
          ar: 'تعليمة `if` مثل مفترق طرق: اللافتة (الشرط) تسأل "هل معك تذكرة؟" فإن كان الجواب نعم تسلك الطريق الأول، وإلا (`else`) تسلك الآخر. و`else if` تضيف طرقاً أخرى تُفحص بالترتيب، وأول طريق مفتوح تسلكه وتتجاهل الباقي.',
        },
        esempio: {
          file: 'Esito.java',
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

        String esito = voto >= VOTO_MINIMO ? "superato" : "da ripetere";
        System.out.println("Esame " + esito);
    }
}`,
          note: [
            ['voto == VOTO_MASSIMO && lode', { t: 'Condizione composta (&&)', ar: 'شرط مركّب', ex: 'الشرط صحيح فقط إذا تحقق الطرفان. لاحظ أننا نكتب `lode` مباشرة وليس `lode == true`.' }],
            ['voto >= VOTO_MINIMO ? "superato"', { t: 'Operatore ternario', ar: 'المعامل الثلاثي', ex: 'الشرط صحيح فتأخذ `esito` القيمة "superato". لو كان خاطئاً لأخذت "da ripetere".' }],
          ],
        },
        norma: {
          it: 'Graffe sempre, condizioni booleane pulite e nessun numero magico: le soglie (18, 30) diventano costanti.',
          ar: 'الأقواس دائماً، وشروط منطقية نظيفة، ولا أرقام سحرية: الحدود مثل 18 و 30 تصبح ثوابت.',
        },
        quiz: [
          {
            d: 'Con int voto = 25, cosa stampa la catena: if (voto >= 18) "A" else if (voto >= 24) "B" else "C"?', dAr: 'إذا كان voto = 25 ماذا تطبع السلسلة؟',
            opzioni: ['A', 'B', 'A e B', 'C'], corretta: 0,
            it: 'Il primo ramo vero (voto >= 18) viene eseguito e gli altri sono ignorati: le condizioni sono ordinate male!',
            ar: 'يُنفَّذ أول فرع صحيح (voto >= 18) ويتم تجاهل الباقي، فالشروط هنا مرتّبة بشكل خاطئ!',
          },
          {
            d: 'Quale forma rispetta la Buona Norma?', dAr: 'أي صيغة تتبع قواعد البرمجة الجيدة؟',
            opzioni: ['if (attivo == true)', 'if (attivo)', 'if (attivo = true)', 'if (true == attivo)'], corretta: 1,
            it: 'Una variabile boolean è già una condizione: basta scrivere if (attivo).',
            ar: 'المتغير المنطقي هو شرط بحد ذاته، فيكفي أن تكتب if (attivo).',
          },
        ],
        costruisci: {
          consegna: 'Completa la catena di decisioni e l\'operatore ternario.',
          consegnaAr: 'أكمل سلسلة القرارات والمعامل الثلاثي.',
          codice: `public class Temperatura {

    private static final int FREDDO = 10;
    private static final int CALDO = 28;

    public static void main(String[] args) {
        int gradi = 31;
        ⟦if⟧ (gradi < FREDDO) {
            System.out.println("Fa freddo");
        } ⟦else if⟧ (gradi > CALDO) {
            System.out.println("Fa caldo");
        } ⟦else⟧ {
            System.out.println("Temperatura gradevole");
        }
        String consiglio = gradi > CALDO ⟦?⟧ "bevi acqua" : "tutto ok";
        System.out.println(consiglio);
    }
}`,
          output: 'Fa caldo\nbevi acqua\n',
        },
        laboratorio: {
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
            { tipo: 'codice', re: 'static\\s+final\\s+int', msg: 'Dichiara le soglie come costanti static final.', msgAr: 'صرّح عن الحدود كثوابت static final.' },
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
        riepilogo: [
          { it: 'if / else if / else: viene eseguito solo il primo ramo con condizione vera.', ar: 'في if / else if / else يُنفَّذ أول فرع شرطه صحيح فقط.' },
          { it: 'Il ternario c ? a : b sceglie tra due valori.', ar: 'المعامل الثلاثي c ? a : b يختار بين قيمتين.' },
          { it: 'Scrivi if (attivo), non if (attivo == true).', ar: 'اكتب if (attivo) وليس if (attivo == true).' },
        ],
      },
      {
        id: 'l09', titolo: 'Selezione multipla con switch', durata: '11 min',
        obiettivi: ['Usare switch con case, break e default', 'Conoscere lo switch moderno con le frecce'],
        teoria: [
          {
            it: 'Lo switch confronta un valore con una serie di costanti case e salta direttamente a quella corrispondente.',
            t: 'Selezione multipla (switch)', ar: 'تعليمة switch تقارن قيمة بسلسلة من الثوابت case وتقفز مباشرة إلى المطابقة منها.',
            ex: 'يعمل `switch` مع `int` و `char` و `String` و `enum`. هو أوضح من سلسلة طويلة من `if (x == 1) ... else if (x == 2)` عندما نقارن نفس المتغير بقيم ثابتة.',
            bn: 'Usa switch quando confronti la stessa variabile con molti valori costanti.', bnAr: 'استخدم switch عندما تقارن نفس المتغير بقيم ثابتة كثيرة.',
          },
          {
            it: 'Ogni case dovrebbe terminare con break, altrimenti l\'esecuzione prosegue nel case successivo (fall-through).',
            t: 'break e fall-through', ar: 'يجب أن تنتهي كل حالة case بـ break، وإلا يستمر التنفيذ إلى الحالة التالية (السقوط fall-through).',
            ex: 'بدون `break` يُنفَّذ كود الحالة المطابقة ثم كود كل الحالات التي بعدها حتى أول `break`. هذا مصدر أخطاء شائع، وهو سؤال كلاسيكي في امتحان "ماذا يطبع الكود؟".',
            bn: 'Termina ogni case con break; il break è ammesso solo nello switch.', bnAr: 'أنهِ كل case بـ break، واستخدام break مقبول داخل switch فقط.',
          },
          {
            it: 'Il caso default gestisce tutti i valori che non corrispondono a nessun case.',
            t: 'Caso default', ar: 'الحالة default تعالج كل القيم التي لا تطابق أي case.',
            ex: 'أضف `default` دائماً حتى لو "لا يمكن" أن تصل قيمة غير متوقعة: البرامج الحقيقية تستقبل دائماً قيماً غير متوقعة، والأستاذ يخصم درجات على غيابه.',
            bn: 'Prevedi sempre il caso default.', bnAr: 'أضف دائماً حالة default.',
          },
          {
            it: 'Lo switch moderno usa le frecce -> senza break e può anche produrre un valore come espressione.',
            t: 'switch con frecce (Java 14+)', ar: 'تعليمة switch الحديثة تستخدم الأسهم -> بدون break ويمكنها أيضاً إنتاج قيمة كتعبير.',
            ex: '`String tipo = switch (giorno) { case 6, 7 -> "weekend"; default -> "feriale"; };` لا يوجد سقوط بين الحالات، ويمكن جمع عدة قيم في حالة واحدة بفاصلة.',
            bn: 'Nei progetti moderni preferisci lo switch con le frecce: niente fall-through accidentali.', bnAr: 'في المشاريع الحديثة فضّل switch بالأسهم لتجنب السقوط غير المقصود.',
          },
        ],
        analogia: {
          titolo: 'L\'ascensore',
          it: 'Lo switch è un ascensore: premi il numero del piano e arrivi direttamente lì, senza fermarti agli altri piani.',
          ar: 'تعليمة `switch` مثل المصعد: تضغط رقم الطابق فيأخذك إليه مباشرة دون المرور بكل الطوابق. لكن انتبه: في `switch` القديم إن نسيت `break` فالمصعد لا يتوقف بل "يسقط" إلى الطوابق التالية وينفّذ ما فيها أيضاً!',
        },
        esempio: {
          file: 'Settimana.java',
          codice: `public class Settimana {

    public static void main(String[] args) {
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

        int numeroGiorno = 6;
        String tipo = switch (numeroGiorno) {
            case 6, 7 -> "weekend";
            default -> "feriale";
        };
        System.out.println("Il giorno " + numeroGiorno + " è " + tipo);
    }
}`,
          note: [
            ['switch (giorno)', { t: 'switch su char', ar: 'switch على حرف', ex: 'تقارن JVM قيمة `giorno` مع كل `case` وتقفز إلى المطابقة. مع `\'L\'` يُطبع "Lezione di Programmazione" ثم `break` يُخرجنا من switch.' }],
            ['case 6, 7 -> "weekend"', { t: 'switch expression', ar: 'switch كتعبير', ex: 'صيغة حديثة: حالة واحدة لعدة قيم، والسهم يُعيد القيمة مباشرة دون break.' }],
          ],
        },
        norma: {
          it: 'Ogni case termina con break (o usa le frecce) e c\'è sempre un default.',
          ar: 'كل case تنتهي بـ break (أو تستخدم الأسهم)، ويوجد دائماً default.',
        },
        quiz: [
          {
            d: 'int x = 1; switch (x) { case 1: System.out.print("A"); case 2: System.out.print("B"); break; default: System.out.print("C"); } Cosa stampa?', dAr: 'ماذا يطبع هذا الكود؟',
            opzioni: ['A', 'AB', 'ABC', 'B'], corretta: 1,
            it: 'Il case 1 non ha break: dopo «A» l\'esecuzione cade nel case 2 e stampa «B», poi il break esce.',
            ar: 'الحالة case 1 بلا break: بعد طباعة «A» يسقط التنفيذ إلى case 2 فيطبع «B» ثم يخرج عند break.',
          },
          {
            d: 'A cosa serve il caso default?', dAr: 'ما فائدة الحالة default؟',
            opzioni: ['A uscire dal programma', 'A gestire i valori che non corrispondono a nessun case', 'A ripetere lo switch', 'È obbligatorio come primo caso'], corretta: 1,
            it: 'default viene eseguito quando nessun case corrisponde al valore.',
            ar: 'تُنفَّذ default عندما لا تطابق القيمة أي case.',
          },
        ],
        costruisci: {
          consegna: 'Completa lo switch del menu: la parola chiave, il break mancante e il caso predefinito.',
          consegnaAr: 'أكمل switch الخاص بالقائمة: الكلمة المفتاحية، و break الناقصة، والحالة الافتراضية.',
          codice: `public class Menu {

    public static void main(String[] args) {
        int scelta = 2;
        ⟦switch⟧ (scelta) {
            case 1:
                System.out.println("Nuovo esame");
                break;
            case 2:
                System.out.println("Visualizza libretto");
                ⟦break⟧;
            ⟦default⟧:
                System.out.println("Scelta non valida");
        }
    }
}`,
          output: 'Visualizza libretto\n',
        },
        laboratorio: {
          titolo: 'Giorni del mese',
          consegna: 'Dato int mese = 4, usa uno switch per stampare «Giorni: 30». Mesi con 31 giorni: 1,3,5,7,8,10,12; febbraio (2) ne ha 28; gli altri 30. Gestisci un mese non valido con default stampando «Mese non valido».',
          consegnaAr: 'إذا كان int mese = 4، استخدم switch لطباعة «Giorni: 30». الأشهر ذات 31 يوماً: 1،3،5،7،8،10،12؛ وفبراير (2) فيه 28؛ والباقي 30. عالج الشهر غير الصالح بـ default وطباعة «Mese non valido».',
          codice: `public class Calendario {

    public static void main(String[] args) {
        int mese = 4;
        // usa uno switch

    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Giorni: 30', msg: 'Con mese = 4 deve stampare «Giorni: 30».', msgAr: 'عندما يكون mese = 4 يجب أن يطبع «Giorni: 30».' },
            { tipo: 'codice', re: 'switch\\s*\\(', msg: 'Usa uno switch.', msgAr: 'استخدم switch.' },
            { tipo: 'codice', re: 'default', msg: 'Prevedi il caso default.', msgAr: 'أضف الحالة default.' },
          ],
          soluzione: `public class Calendario {

    public static void main(String[] args) {
        int mese = 4;
        switch (mese) {
            case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                System.out.println("Giorni: 31");
                break;
            case 2:
                System.out.println("Giorni: 28");
                break;
            case 4: case 6: case 9: case 11:
                System.out.println("Giorni: 30");
                break;
            default:
                System.out.println("Mese non valido");
                break;
        }
    }
}`,
        },
        riepilogo: [
          { it: 'switch salta al case che corrisponde al valore.', ar: 'switch تقفز إلى الحالة case المطابقة للقيمة.' },
          { it: 'Senza break si ha il fall-through nel case successivo.', ar: 'بدون break يحدث السقوط إلى الحالة التالية.' },
          { it: 'default gestisce i valori inattesi; le frecce evitano il fall-through.', ar: 'default تعالج القيم غير المتوقعة، والأسهم تمنع السقوط.' },
        ],
      },
      {
        id: 'l10', titolo: 'Cicli while e do-while con guardia booleana', durata: '13 min',
        obiettivi: ['Ripetere istruzioni finché una condizione è vera', 'Uscire da un ciclo senza break usando una variabile booleana'],
        teoria: [
          {
            it: 'Il ciclo while ripete il corpo finché la condizione resta vera e si usa quando il numero di iterazioni non è noto in anticipo.',
            t: 'Ciclo while', ar: 'حلقة while تكرر الجسم طالما بقي الشرط صحيحاً، وتُستخدم عندما يكون عدد الدورات غير معروف مسبقاً.',
            ex: 'يُفحص الشرط قبل كل دورة، فإذا كان خاطئاً من البداية لا يُنفَّذ الجسم أبداً. يجب أن يغيّر الجسم شيئاً يجعل الشرط خاطئاً يوماً ما، وإلا تحدث حلقة لا نهائية.',
            bn: 'Assicurati che il corpo del ciclo modifichi la condizione.', bnAr: 'تأكد أن جسم الحلقة يغيّر الشرط.',
          },
          {
            it: 'Il ciclo do-while esegue il corpo almeno una volta, perché la condizione viene verificata alla fine.',
            t: 'Ciclo do-while', ar: 'حلقة do-while تنفّذ الجسم مرة واحدة على الأقل، لأن الشرط يُفحص في النهاية.',
            ex: 'مناسبة لعرض قائمة خيارات أو طلب إدخال حتى يكون صحيحاً: يجب أن يحدث الطلب مرة أولاً. لا تنسَ الفاصلة المنقوطة بعد `while (...)`.',
            bn: 'Usa do-while per menu e validazione dell\'input.', bnAr: 'استخدم do-while للقوائم والتحقق من الإدخال.',
          },
          {
            it: 'Una variabile booleana come trovato o fine permette di esprimere la condizione di uscita direttamente nella guardia del ciclo.',
            t: 'Guardia booleana (flag)', ar: 'متغير منطقي مثل trovato أو fine يسمح بكتابة شرط الخروج مباشرة في شرط الحلقة.',
            ex: 'البرمجة المُهيكلة تشترط مدخلاً واحداً ومخرجاً واحداً لكل حلقة. بدلاً من `while (true) { ... break; }` نكتب `while (!fine) { ... fine = true; }`. هكذا يرى القارئ متى تنتهي الحلقة من السطر الأول.',
            bn: 'Niente while(true) con break: la condizione di uscita sta nella guardia.', bnAr: 'لا تستخدم while(true) مع break: شرط الخروج مكانه رأس الحلقة.',
          },
        ],
        analogia: {
          titolo: 'Il cameriere al ristorante',
          it: 'while: il cameriere chiede «Altro?» prima di portare un piatto. do-while: prima porta il pane, poi chiede se ne vuoi ancora.',
          ar: 'حلقة `while` مثل نادل يسأل قبل كل طبق: "هل تريد شيئاً؟" — فإن قلت لا من البداية لا يحضر شيئاً. أما `do-while` فمثل الخبز: يضعه على الطاولة أولاً ثم يسأل "هل تريد المزيد؟". والعلَم `fine` هو أن تقول له بوضوح "انتهيت" بدلاً من أن تهرب من المطعم (`break`).',
        },
        esempio: {
          file: 'Risparmi.java',
          codice: `public class Risparmi {

    private static final double OBIETTIVO = 1000.0;
    private static final double RISPARMIO_MENSILE = 300.0;

    public static void main(String[] args) {
        double salvadanaio = 0;
        int mesi = 0;
        while (salvadanaio < OBIETTIVO) {
            salvadanaio += RISPARMIO_MENSILE;
            mesi++;
        }
        System.out.println("Obiettivo raggiunto in " + mesi + " mesi: " + salvadanaio);

        int tentativi = 0;
        boolean fine = false;
        do {
            tentativi++;
            if (tentativi == 3) {
                fine = true;
            }
        } while (!fine);
        System.out.println("Tentativi: " + tentativi);
    }
}`,
          note: [
            ['while (salvadanaio < OBIETTIVO)', { t: 'Condizione del while', ar: 'شرط while', ex: 'يُفحص قبل كل دورة: بعد 4 دورات يصبح المبلغ 1200 فيصبح الشرط خاطئاً وتنتهي الحلقة. شاهدها خطوة بخطوة.' }],
            ['} while (!fine);', { t: 'Fine del do-while', ar: 'نهاية do-while', ex: 'الشرط في النهاية: الجسم نُفّذ مرة على الأقل. المتغير `fine` هو مخرج الحلقة الوحيد، بدون break.' }],
          ],
        },
        norma: {
          it: 'Ogni ciclo ha un solo punto di uscita: la sua condizione. Usa variabili booleane (trovato, fine) invece di break.',
          ar: 'لكل حلقة نقطة خروج واحدة هي شرطها. استخدم متغيرات منطقية (trovato، fine) بدلاً من break.',
        },
        quiz: [
          {
            d: 'int i = 10; while (i < 5) { i++; } Quante volte viene eseguito il corpo?', dAr: 'كم مرة يُنفَّذ جسم الحلقة؟',
            opzioni: ['0', '1', '5', 'Infinite'], corretta: 0,
            it: 'La condizione 10 < 5 è falsa già all\'inizio: il corpo di un while può non essere mai eseguito.',
            ar: 'الشرط 10 < 5 خاطئ من البداية، لذلك قد لا يُنفَّذ جسم while أبداً.',
          },
          {
            d: 'Qual è la differenza principale tra while e do-while?', dAr: 'ما الفرق الأساسي بين while و do-while؟',
            opzioni: ['do-while è più veloce', 'do-while esegue il corpo almeno una volta', 'while non ammette condizioni composte', 'Non c\'è differenza'], corretta: 1,
            it: 'Nel do-while la condizione è controllata alla fine, quindi il corpo viene eseguito almeno una volta.',
            ar: 'في do-while يُفحص الشرط في النهاية، لذلك يُنفَّذ الجسم مرة واحدة على الأقل.',
          },
        ],
        costruisci: {
          consegna: 'Completa il conto alla rovescia con while e il ciclo do-while con la guardia booleana.',
          consegnaAr: 'أكمل العدّ التنازلي بـ while وحلقة do-while بالعلم المنطقي.',
          codice: `public class Conto {

    public static void main(String[] args) {
        int n = 3;
        ⟦while⟧ (n > 0) {
            System.out.print(n + " ");
            n⟦--⟧;
        }
        System.out.println("Via!");
        boolean pronto = false;
        int giri = 0;
        ⟦do⟧ {
            giri++;
            pronto = giri >= 2;
        } while (⟦!pronto⟧);
        System.out.println("Giri: " + giri);
    }
}`,
          output: '3 2 1 Via!\nGiri: 2\n',
        },
        laboratorio: {
          titolo: 'Indovina il PIN (senza break)',
          consegna: 'Leggi con Scanner dei PIN interi uno alla volta finché l\'utente inserisce 1234 o finisce i 3 tentativi. Usa una variabile boolean trovato nella condizione (niente break). Stampa «Accesso consentito» oppure «Bloccato».',
          consegnaAr: 'اقرأ بـ Scanner أرقام PIN واحداً تلو الآخر حتى يُدخل المستخدم 1234 أو تنتهي المحاولات الثلاث. استخدم متغيراً منطقياً trovato في شرط الحلقة (بدون break). اطبع «Accesso consentito» أو «Bloccato».',
          input: '1111\n1234\n',
          codice: `import java.util.Scanner;

public class Pin {

    private static final int PIN_CORRETTO = 1234;
    private static final int MAX_TENTATIVI = 3;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // ciclo con guardia booleana

        sc.close();
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Accesso consentito', msg: 'Con 1111 e poi 1234 deve stampare «Accesso consentito».', msgAr: 'مع 1111 ثم 1234 يجب أن يطبع «Accesso consentito».' },
            { tipo: 'output', input: '1\n2\n3\n1234\n', atteso: 'Bloccato', msg: 'Dopo 3 PIN sbagliati deve stampare «Bloccato» (senza leggere il quarto).', msgAr: 'بعد 3 أرقام خاطئة يجب أن يطبع «Bloccato» دون قراءة الرابع.' },
            { tipo: 'norma', regole: ['salto-non-strutturato'], msg: 'Nessun break o continue nel ciclo.', msgAr: 'لا break ولا continue داخل الحلقة.' },
            { tipo: 'codice', re: 'boolean\\s+trovato', msg: 'Usa una variabile boolean trovato.', msgAr: 'استخدم متغيراً منطقياً اسمه trovato.' },
          ],
          soluzione: `import java.util.Scanner;

public class Pin {

    private static final int PIN_CORRETTO = 1234;
    private static final int MAX_TENTATIVI = 3;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        boolean trovato = false;
        int tentativi = 0;
        while (!trovato && tentativi < MAX_TENTATIVI) {
            int pin = sc.nextInt();
            tentativi++;
            trovato = pin == PIN_CORRETTO;
        }
        if (trovato) {
            System.out.println("Accesso consentito");
        } else {
            System.out.println("Bloccato");
        }
        sc.close();
    }
}`,
        },
        riepilogo: [
          { it: 'while controlla la condizione prima, do-while dopo il corpo.', ar: 'while تفحص الشرط قبل الجسم و do-while بعده.' },
          { it: 'Il corpo deve modificare la condizione, altrimenti il ciclo è infinito.', ar: 'يجب أن يغيّر الجسم الشرط وإلا تصبح الحلقة لا نهائية.' },
          { it: 'Uscita strutturata: variabile booleana nella guardia, niente break.', ar: 'الخروج المهيكل: متغير منطقي في شرط الحلقة دون break.' },
        ],
      },
      {
        id: 'l11', titolo: 'Cicli for, cicli annidati e visibilità delle variabili', durata: '14 min',
        obiettivi: ['Scrivere cicli for con contatore', 'Annidare cicli per lavorare su righe e colonne', 'Capire lo scope delle variabili'],
        teoria: [
          {
            it: 'Il ciclo for si usa quando il numero di iterazioni è noto e raccoglie inizializzazione, condizione e aggiornamento in una sola riga.',
            t: 'Ciclo for', ar: 'تُستخدم حلقة for عندما يكون عدد الدورات معروفاً، وتجمع التهيئة والشرط والتحديث في سطر واحد.',
            ex: 'في `for (int i = 0; i < n; i++)`: التهيئة تُنفَّذ مرة واحدة، والشرط يُفحص قبل كل دورة، والتحديث بعد كل دورة. الشكل `i = 0; i < n` يتكرر n مرة بالضبط.',
            bn: 'Non modificare il contatore all\'interno del corpo del for.', bnAr: 'لا تعدّل متغير العدّاد داخل جسم حلقة for.',
          },
          {
            it: 'Un ciclo annidato è un ciclo dentro un altro: per ogni iterazione esterna, quello interno viene eseguito completamente.',
            t: 'Cicli annidati', ar: 'الحلقة المتداخلة هي حلقة داخل حلقة: في كل دورة للحلقة الخارجية تُنفَّذ الحلقة الداخلية بالكامل.',
            ex: 'إذا كانت الخارجية تدور 3 مرات والداخلية 4 مرات فإن الجسم الداخلي يُنفَّذ 3 × 4 = 12 مرة. هذا مفيد لجداول الضرب والمصفوفات ثنائية الأبعاد (صفوف وأعمدة).',
            bn: 'Usa nomi chiari per i contatori annidati (riga, colonna) quando aiutano.', bnAr: 'استخدم أسماء واضحة لعدادات الحلقات المتداخلة (riga، colonna) عندما تفيد.',
          },
          {
            it: 'La visibilità (scope) di una variabile locale va dalla dichiarazione fino alla fine del blocco in cui è dichiarata.',
            t: 'Visibilità (scope)', ar: 'نطاق رؤية المتغير المحلي يمتد من مكان التصريح عنه حتى نهاية الكتلة التي صُرّح فيها.',
            ex: 'المتغير `i` المعرّف داخل `for` لا يوجد بعد انتهاء الحلقة، واستخدامه خارجها يسبب خطأ "cannot find symbol". عند خروج التنفيذ من الكتلة يُحذف المتغير من إطار الـStack.',
            bn: 'Dichiara le variabili nello scope più piccolo possibile.', bnAr: 'صرّح عن المتغيرات في أضيق نطاق ممكن.',
          },
        ],
        analogia: {
          titolo: 'L\'orologio',
          it: 'I cicli annidati sono come le lancette: per ogni giro delle ore, i minuti fanno un giro completo.',
          ar: 'الحلقات المتداخلة تشبه عقارب الساعة: كلما تحرّك عقرب الساعات خطوة واحدة (الحلقة الخارجية)، أكمل عقرب الدقائق دورة كاملة من 60 خطوة (الحلقة الداخلية). أما النطاق (scope) فمثل غرفة: المتغير الذي يولد داخل الغرفة لا يمكن رؤيته من خارجها.',
        },
        esempio: {
          file: 'Tabellina.java',
          codice: `public class Tabellina {

    private static final int DIMENSIONE = 4;

    public static void main(String[] args) {
        int somma = 0;
        for (int i = 1; i <= DIMENSIONE; i++) {
            somma += i;
        }
        System.out.println("Somma da 1 a " + DIMENSIONE + ": " + somma);

        for (int riga = 1; riga <= DIMENSIONE; riga++) {
            String linea = "";
            for (int colonna = 1; colonna <= DIMENSIONE; colonna++) {
                linea += riga * colonna + "\\t";
            }
            System.out.println(linea);
        }
    }
}`,
          note: [
            ['for (int i = 1; i <= DIMENSIONE; i++)', { t: 'for con contatore', ar: 'حلقة for بعدّاد', ex: 'العداد `i` يأخذ القيم 1 و 2 و 3 و 4. بعد الحلقة يختفي `i` من الـStack لأن نطاقه داخل الحلقة فقط.' }],
            ['for (int colonna = 1', { t: 'Ciclo interno', ar: 'الحلقة الداخلية', ex: 'لكل قيمة من `riga` تدور هذه الحلقة 4 مرات كاملة وتبني سطراً من جدول الضرب.' }],
          ],
        },
        norma: {
          it: 'Contatori dichiarati nel for, condizioni con < length o < costante, e nessuna modifica del contatore nel corpo.',
          ar: 'عدّادات مصرّح عنها داخل for، وشروط مع < length أو < ثابت، وعدم تعديل العداد داخل الجسم.',
        },
        quiz: [
          {
            d: 'Quante volte viene stampato «*»? for (int i = 0; i < 3; i++) { for (int j = 0; j < 4; j++) { System.out.print("*"); } }', dAr: 'كم مرة تُطبع «*»؟',
            opzioni: ['7', '12', '3', '4'], corretta: 1,
            it: 'Il ciclo interno (4 iterazioni) viene eseguito per ognuna delle 3 iterazioni esterne: 3 × 4 = 12.',
            ar: 'الحلقة الداخلية (4 دورات) تُنفَّذ في كل واحدة من الدورات الخارجية الثلاث: 3 × 4 = 12.',
          },
          {
            d: 'Cosa succede se uso la variabile i dopo for (int i = 0; i < 5; i++) { ... }?', dAr: 'ماذا يحدث إذا استخدمت المتغير i بعد انتهاء الحلقة؟',
            opzioni: ['Vale 5', 'Vale 4', 'Errore di compilazione: i non è visibile', 'Vale 0'], corretta: 2,
            it: 'i è dichiarata nel for: il suo scope termina con il ciclo, quindi fuori non esiste.',
            ar: 'المتغير i مصرّح عنه داخل for، ونطاقه ينتهي بانتهاء الحلقة، لذلك لا يوجد خارجها.',
          },
        ],
        costruisci: {
          consegna: 'Completa le tre parti del for e il ciclo interno che stampa un triangolo di asterischi.',
          consegnaAr: 'أكمل الأجزاء الثلاثة لحلقة for والحلقة الداخلية التي تطبع مثلثاً من النجوم.',
          codice: `public class Triangolo {

    private static final int ALTEZZA = 3;

    public static void main(String[] args) {
        for (int riga = 1; riga ⟦<=⟧ ALTEZZA; riga⟦++⟧) {
            for (int k = 0; k < ⟦riga⟧; k++) {
                System.out.print("*");
            }
            System.out.⟦println⟧();
        }
    }
}`,
          output: '*\n**\n***\n',
        },
        laboratorio: {
          titolo: 'La tabellina del 7',
          consegna: 'Con un ciclo for stampa la tabellina del 7 da 1 a 10, una riga per numero nel formato «7 x 3 = 21». Usa le costanti NUMERO = 7 e LIMITE = 10.',
          consegnaAr: 'باستخدام حلقة for اطبع جدول ضرب 7 من 1 إلى 10، سطراً لكل رقم بالشكل «7 x 3 = 21». استخدم الثابتين NUMERO = 7 و LIMITE = 10.',
          codice: `public class Tabellina {

    public static void main(String[] args) {
        // costanti e ciclo for

    }
}`,
          verifiche: [
            { tipo: 'contiene', testo: '7 x 1 = 7\n7 x 2 = 14', msg: 'Le righe devono avere il formato «7 x 1 = 7».', msgAr: 'يجب أن تكون الأسطر بالشكل «7 x 1 = 7».' },
            { tipo: 'contiene', testo: '7 x 10 = 70', msg: 'L\'ultima riga deve essere «7 x 10 = 70».', msgAr: 'يجب أن يكون آخر سطر «7 x 10 = 70».' },
            { tipo: 'codice', re: 'for\\s*\\(', msg: 'Usa un ciclo for.', msgAr: 'استخدم حلقة for.' },
            { tipo: 'codice', re: 'LIMITE', msg: 'Usa la costante LIMITE.', msgAr: 'استخدم الثابت LIMITE.' },
          ],
          soluzione: `public class Tabellina {

    private static final int NUMERO = 7;
    private static final int LIMITE = 10;

    public static void main(String[] args) {
        for (int i = 1; i <= LIMITE; i++) {
            System.out.println(NUMERO + " x " + i + " = " + NUMERO * i);
        }
    }
}`,
        },
        riepilogo: [
          { it: 'for (inizializzazione; condizione; aggiornamento) per un numero noto di iterazioni.', ar: 'for (تهيئة؛ شرط؛ تحديث) لعدد دورات معروف.' },
          { it: 'Nei cicli annidati l\'interno ripete tutto per ogni passo dell\'esterno.', ar: 'في الحلقات المتداخلة تتكرر الداخلية بالكامل مع كل خطوة من الخارجية.' },
          { it: 'Una variabile è visibile solo nel blocco in cui è dichiarata.', ar: 'المتغير مرئي فقط داخل الكتلة التي صُرّح فيها.' },
        ],
      },
      {
        id: 'l12', titolo: 'Schemi algoritmici: accumulatore, contatore, massimo e minimo', durata: '15 min',
        obiettivi: ['Applicare gli schemi accumulatore e contatore', 'Trovare massimo e minimo di una sequenza'],
        teoria: [
          {
            it: 'Lo schema accumulatore usa una variabile inizializzata a zero a cui si aggiunge un valore a ogni iterazione, per esempio per calcolare una somma.',
            t: 'Accumulatore', ar: 'نمط المُراكِم يستخدم متغيراً يبدأ من الصفر وتُضاف إليه قيمة في كل دورة، مثلاً لحساب مجموع.',
            ex: 'الشكل الثابت: `int somma = 0;` قبل الحلقة، ثم `somma += valore;` داخلها، وبعد الحلقة تستخدم النتيجة. للضرب المتتالي يبدأ المراكم من 1 وليس 0.',
            bn: 'Inizializza l\'accumulatore prima del ciclo, mai dentro.', bnAr: 'هيّئ المراكم قبل الحلقة وليس داخلها.',
          },
          {
            it: 'Lo schema contatore incrementa una variabile ogni volta che un elemento soddisfa una condizione.',
            t: 'Contatore', ar: 'نمط العدّاد يزيد متغيراً كلما حقق عنصر شرطاً معيناً.',
            ex: '`int promossi = 0;` ثم داخل الحلقة `if (voto >= 18) { promossi++; }`. هكذا نعدّ كم عنصراً يحقق الشرط.',
            bn: 'Dai al contatore un nome che dice cosa conta (promossi, pari).', bnAr: 'سمِّ العدّاد باسم يوضح ما يعدّه (promossi، pari).',
          },
          {
            it: 'Per trovare il massimo si inizializza la variabile con il primo elemento e la si aggiorna quando si incontra un valore più grande.',
            t: 'Ricerca del massimo e del minimo', ar: 'لإيجاد القيمة العظمى نهيّئ المتغير بأول عنصر ثم نحدّثه كلما وجدنا قيمة أكبر.',
            ex: 'الخطأ الشائع: البدء من `max = 0` يفشل إذا كانت كل القيم سالبة. البدء من أول عنصر `max = v[0]` صحيح دائماً. وللقيمة الصغرى نفس الفكرة مع `<`.',
            bn: 'Inizializza massimo e minimo con il primo elemento, non con 0.', bnAr: 'هيّئ القيمة العظمى والصغرى بأول عنصر وليس بالصفر.',
          },
        ],
        analogia: {
          titolo: 'Il cassiere, il buttafuori e il campione',
          it: 'L\'accumulatore è il cassiere che somma lo scontrino, il contatore è il buttafuori che conta chi entra, il massimo è il record da battere.',
          ar: 'المراكِم مثل أمين الصندوق الذي يجمع ثمن كل منتج في الفاتورة. والعدّاد مثل حارس الباب الذي يضغط زر العدّ كلما دخل شخص يحمل تذكرة. والقيمة العظمى مثل "الرقم القياسي": يبدأ بأول متسابق، ويُستبدل كلما جاء من يتفوق عليه.',
        },
        esempio: {
          file: 'Statistiche.java',
          codice: `public class Statistiche {

    private static final int SUFFICIENZA = 18;

    public static void main(String[] args) {
        int[] voti = {24, 17, 30, 27, 15, 28};

        int somma = 0;
        int promossi = 0;
        int massimo = voti[0];
        int minimo = voti[0];
        for (int voto : voti) {
            somma += voto;
            if (voto >= SUFFICIENZA) {
                promossi++;
            }
            if (voto > massimo) {
                massimo = voto;
            }
            if (voto < minimo) {
                minimo = voto;
            }
        }
        double media = (double) somma / voti.length;
        System.out.println("Somma: " + somma + ", media: " + media);
        System.out.println("Promossi: " + promossi + " su " + voti.length);
        System.out.println("Voto massimo: " + massimo + ", minimo: " + minimo);
    }
}`,
          note: [
            ['int somma = 0', { t: 'Accumulatore', ar: 'المراكم', ex: 'يبدأ من الصفر قبل الحلقة، وفي كل دورة يُضاف إليه الصوت الحالي.' }],
            ['int massimo = voti[0]', { t: 'Inizializzazione del massimo', ar: 'تهيئة القيمة العظمى', ex: 'نبدأ بأول عنصر وليس بالصفر حتى يعمل الحل مع أي بيانات، حتى السالبة.' }],
            ['for (int voto : voti)', { t: 'Scansione con for-each', ar: 'المرور بـ for-each', ex: 'نمرّ على كل الدرجات مرة واحدة ونحدّث المراكم والعداد والقيم القصوى معاً في نفس الحلقة.' }],
          ],
        },
        norma: {
          it: 'Inizializza accumulatori e contatori prima del ciclo, massimo e minimo con il primo elemento, e usa nomi che dicono cosa rappresentano.',
          ar: 'هيّئ المراكمات والعدادات قبل الحلقة، والقيم القصوى بأول عنصر، واستخدم أسماء تعبّر عن معناها.',
        },
        quiz: [
          {
            d: 'Perché inizializzare max = 0 è un errore per l\'array {-5, -2, -9}?', dAr: 'لماذا تهيئة max = 0 خطأ مع المصفوفة {-5, -2, -9}؟',
            opzioni: ['Perché 0 non è un intero', 'Perché nessun elemento è maggiore di 0, e il risultato sarebbe 0 invece di -2', 'Perché l\'array è troppo corto', 'Non è un errore'], corretta: 1,
            it: 'Tutti i valori sono negativi: max resterebbe 0, un valore che non è nemmeno nell\'array. Si parte dal primo elemento.',
            ar: 'كل القيم سالبة فيبقى max = 0، وهي قيمة غير موجودة أصلاً في المصفوفة. لذلك نبدأ من أول عنصر.',
          },
          {
            d: 'Quale schema serve per sapere quanti studenti hanno preso almeno 28?', dAr: 'أي نمط نحتاجه لمعرفة عدد الطلاب الذين حصلوا على 28 على الأقل؟',
            opzioni: ['Accumulatore', 'Contatore con condizione', 'Ricerca del minimo', 'Ordinamento'], corretta: 1,
            it: 'Serve un contatore che si incrementa solo quando la condizione voto >= 28 è vera.',
            ar: 'نحتاج عدّاداً يزيد فقط عندما يكون الشرط voto >= 28 صحيحاً.',
          },
        ],
        costruisci: {
          consegna: 'Completa accumulatore, contatore e aggiornamento del minimo.',
          consegnaAr: 'أكمل المراكم والعداد وتحديث القيمة الصغرى.',
          codice: `public class Spese {

    private static final double SOGLIA = 50.0;

    public static void main(String[] args) {
        double[] spese = {12.5, 80.0, 45.0, 60.5};
        double totale = ⟦0⟧;
        int costose = 0;
        double minima = spese[⟦0⟧];
        for (double s : spese) {
            totale ⟦+=⟧ s;
            if (s > SOGLIA) {
                costose⟦++⟧;
            }
            if (s < minima) {
                minima = ⟦s⟧;
            }
        }
        System.out.println("Totale: " + totale + ", costose: " + costose + ", minima: " + minima);
    }
}`,
          output: 'Totale: 198.0, costose: 2, minima: 12.5\n',
        },
        laboratorio: {
          titolo: 'Analisi delle temperature',
          consegna: 'Leggi con Scanner prima un intero n e poi n temperature intere. Stampa «Massima: X», «Minima: Y» e «Sotto zero: Z» (quante sono negative).',
          consegnaAr: 'اقرأ بـ Scanner عدداً صحيحاً n ثم n درجات حرارة صحيحة. اطبع «Massima: X» و «Minima: Y» و «Sotto zero: Z» (عدد الدرجات السالبة).',
          input: '5\n3 -2 7 -5 0\n',
          codice: `import java.util.Scanner;

public class Temperature {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // leggi le n temperature e calcola massimo, minimo e contatore

        sc.close();
    }
}`,
          verifiche: [
            { tipo: 'output', atteso: 'Massima: 7\nMinima: -5\nSotto zero: 2', msg: 'Con 3 -2 7 -5 0: Massima 7, Minima -5, Sotto zero 2.', msgAr: 'مع 3 -2 7 -5 0: العظمى 7 والصغرى -5 والسالبة 2.' },
            { tipo: 'output', input: '3\n-4 -1 -8\n', atteso: 'Massima: -1\nMinima: -8\nSotto zero: 3', msg: 'Con sole temperature negative la massima deve essere -1 (non inizializzare a 0!).', msgAr: 'مع درجات سالبة فقط يجب أن تكون العظمى -1 (لا تهيّئ بالصفر!).' },
          ],
          soluzione: `import java.util.Scanner;

public class Temperature {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int prima = sc.nextInt();
        int massima = prima;
        int minima = prima;
        int sottoZero = prima < 0 ? 1 : 0;
        for (int i = 1; i < n; i++) {
            int t = sc.nextInt();
            if (t > massima) {
                massima = t;
            }
            if (t < minima) {
                minima = t;
            }
            if (t < 0) {
                sottoZero++;
            }
        }
        System.out.println("Massima: " + massima);
        System.out.println("Minima: " + minima);
        System.out.println("Sotto zero: " + sottoZero);
        sc.close();
    }
}`,
        },
        riepilogo: [
          { it: 'Accumulatore: parte da 0 e somma a ogni iterazione.', ar: 'المراكم يبدأ من 0 ويضيف في كل دورة.' },
          { it: 'Contatore: si incrementa solo se la condizione è vera.', ar: 'العداد يزيد فقط إذا كان الشرط صحيحاً.' },
          { it: 'Massimo e minimo partono dal primo elemento.', ar: 'القيمة العظمى والصغرى تبدآن من أول عنصر.' },
        ],
      },
    ],
  };
  if (typeof module === 'object' && module.exports) module.exports = livello;
  else (root.CF_LIVELLI = root.CF_LIVELLI || []).push(livello);
})(typeof globalThis !== 'undefined' ? globalThis : this);
