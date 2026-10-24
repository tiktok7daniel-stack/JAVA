# CodeForge — Programmazione Java (IT → عربي)

CodeForge è un prototipo funzionante di un'app per studiare la **Programmazione in Java** come nei corsi di Laurea in Informatica italiani. L'interfaccia e le lezioni sono **al 100% in italiano**. Ogni frase e ogni riga di codice si può **toccare** per avere subito traduzione e spiegazione **in arabo**.

> تطبيق CodeForge لتعلّم البرمجة بلغة Java باللغة الإيطالية كما في الجامعات الإيطالية، مع شرح فوري بالعربية لكل جملة ولكل سطر كود، ومحاكي JVM، ومُصحّح خطوة بخطوة يعرض الـStack والـHeap، وفاحص «Buona Norma» مع تصحيح تلقائي.

## Funzionalità

| Area | Cosa fa |
|---|---|
| **Percorso Accademico** | Albero delle competenze con **9 livelli (0–8) e 38 lezioni**, da «Livello 0: Matricola» a «Livello 8: Ingegnere Java 30 e Lode». Le lezioni si sbloccano in ordine (voto ≥ 18), oppure tutte insieme con la «Modalità libera». Il grado accademico attuale compare nell'intestazione. |
| **Lezione in 5 fasi** | **Fase 1** Teoria guidata (frasi toccabili), analogia «Perché serve davvero? (المفهوم ببساطة)», esempio eseguibile passo-passo e regola di Buona Norma · **Fase 2** Micro-quiz con spiegazione IT/AR · **Fase 3** Costruisci il Codice (spazi da completare, suggerimenti, esecuzione del codice completato) · **Fase 4** Laboratorio nell'editor con verifiche automatiche (output, input, file, eccezioni, Buona Norma) · **Fase 5** Riepilogo e **voto della lezione in trentesimi** (quiz 10 + costruzione 10 + laboratorio 10). L'ultima lezione è una simulazione completa d'esame (scritto 40%, calcolatore 40%, orale 20%). |
| **Studio guidato** | Al primo avvio un **tutorial** di 6 pagine (in arabo, con esempi da provare) spiega l'app. La home mostra una sola cosa da fare: **«La tua lezione di oggi»** con obiettivi, le 5 tappe e un grande pulsante. Prima di ogni lezione c'è la schermata **«Cosa imparerai oggi»**. In ogni fase la mascotte **Forgy** dice in arabo cosa fare, e la barra in basso indica cosa manca per andare avanti. Nell'editor un **tour guidato** illustra ogni pulsante. Ogni riga della **console** si può toccare: spiega quale istruzione l'ha stampata, cosa significa un'eccezione e il codice di uscita. Il pulsante **?** in alto riapre la guida. |
| **Tap-to-Understand** | Il bottom sheet mostra *Termine Tecnico (IT)*, *المعنى بالعربية*, *الشرح التفصيلي* e la *Regola di Buona Norma*. Si naviga con ◀ Precedente / Successivo ▶ (anche con le frecce della tastiera), c'è «Ascolta Pronuncia» in italiano (Web Speech API) e «★ Salva per l'Esame». |
| **Editor Java** | Editor con colorazione della sintassi, numeri di riga, indentazione automatica e «Vista interattiva» che spiega ogni riga. Il pannello «Input (stdin) e File» fornisce l'input per `Scanner` e i file di testo virtuali; i file scritti dal programma compaiono nella console. |
| **Simulatore JVM** | Interprete didattico di gran parte del Java dei corsi: classi, costruttori, overloading, ereditarietà, classi astratte, interfacce con metodi `default`, classi anonime, legame dinamico, `instanceof` con pattern, `enum` con attributi, `switch` con frecce e come espressione, array e matrici, ricorsione, `String`/`StringBuilder`, **`Scanner` con input (stdin)**, `ArrayList`/`LinkedList`/`HashMap`/`HashSet`/`TreeMap` (con lo stesso ordine di iterazione della JVM), `Comparable`/`Comparator`, **lambda, method reference e Stream API** (`filter`, `map`, `sorted`, `collect`, `groupingBy`…), `Optional`, **file di testo** (`BufferedReader`, `PrintWriter`, try-with-resources) su un file system virtuale, eccezioni checked/unchecked/personalizzate con stack trace reali e `printf` con Locale italiano. Gli errori di compilazione hanno una spiegazione in italiano e in arabo. |
| **Passo-Passo (Debug)** | Controlli ⏮ ◀ ▶ ⏭ e riproduzione automatica. Per ogni passo evidenzia la riga attiva e mostra la **Memoria JVM** (frame sullo Stack, oggetti nello Heap con frecce dei riferimenti, campi `private` e oggetti eleggibili per il GC) con commento in italiano e in arabo. |
| **Feedback del Professore** | Il linter «Buona Norma» controlla camelCase/PascalCase/UPPER_SNAKE_CASE, l'incapsulamento, `==` tra String, i confronti ridondanti con `true`/`false`, i catch vuoti o generici, le eccezioni usate per il flusso, i numeri magici, `break`/`continue` nei cicli, le graffe mancanti e le risorse (`Scanner`, file) non chiuse. Mostra il prima/dopo con **Applica Correzione** e calcola il voto in trentesimi (fino a **30 e Lode**). |
| **Esame** | Caccia all'errore, «Cosa stampa questo codice?» (con verifica nel simulatore) e domande frequenti dell'orale con risposta modello, parole chiave e spiegazione in arabo. |
| **Glossario** | 69 termini con ricerca, filtri (Tutti, ★ Da Ripassare, Fondamenti, OOP, Memoria, Collezioni, Eccezioni, Buona Norma) e **flashcard** che si girano in 3D. |
| **Identità e avvio** | Logo «Forge Spark» (parentesi di codice e scintilla della forgia), animazione di avvio con tracciamento del logo, esplosione di scintille, scritta animata e motto «Forgia il tuo codice. Capisci ogni riga.»; font incorporati. |
| **Progressi** | XP, giorni consecutivi, fase raggiunta, risposte, voto di ogni lezione e grado accademico, salvati in `localStorage` (restano dopo un aggiornamento dell'APK). |

## Avvio rapido

Non serve nessuna build. Basta servire la cartella `www/`:

```bash
npm start            # equivale a: python3 -m http.server 8080 --directory www
# poi apri http://localhost:8080
```

L'app funziona anche offline: i font sono incorporati e un service worker mette in cache tutti i file dell'app.

## Test

```bash
npm test             # node --test tests/*.test.mjs  (nessuna dipendenza)
```

I test coprono:
- tutte le regole del linter, comprese le correzioni automatiche;
- il simulatore (output, eccezioni, errori di compilazione, trace di Stack e Heap);
- la coerenza del percorso: per ognuna delle 38 lezioni l'esempio gira e rispetta la Buona Norma, i quiz sono validi, il codice completato di «Costruisci» produce l'output atteso, la soluzione del laboratorio supera le verifiche e il codice iniziale no;
- le risposte d'esame coincidono con il simulatore.

Confronto con una vera JVM (richiede `javac`/`java` nel PATH):

```bash
node tools/confronta-jdk.mjs          # tutte le lezioni, oppure: node tools/confronta-jdk.mjs l30 l35
```

Lo strumento compila ed esegue con il JDK (Locale it_IT) l'esempio, il codice completato e la soluzione di ogni lezione e confronta stdout, stderr e file scritti con il simulatore: attualmente **114 programmi su 114 sono identici**.

## APK Android

L'APK già pronto si trova in **`dist/CodeForge.apk`** (versione 2.1.0, Android 7.0+, circa 440 KB, funziona completamente offline).

Per ricostruirlo non servono né Android SDK né Gradle, bastano JDK 17+ e Python 3:

```bash
python3 apk/build_apk.py      # → dist/CodeForge.apk
```

Lo script scarica da Maven Central `android.jar`, `dx` e `apksig`, compila il guscio nativo (`apk/src/…/MainActivity.java`: WebView a schermo intero, barre di sistema scure, sintesi vocale nativa esposta come `window.CodeForgeNative`), poi:
- codifica `AndroidManifest.xml` e `resources.arsc` in formato binario;
- mette `www/` negli asset;
- allinea lo zip;
- firma l'APK con lo schema v2 e verifica la firma.

**Aggiornamenti sulla stessa app:** Android installa una nuova versione sopra la precedente (mantenendo progressi, XP ed elementi salvati) solo se il package `it.codeforge.java` e la chiave di firma sono gli stessi. Per pubblicare un aggiornamento basta:
1. aumentare `versionCode` (e `versionName`) in `apk/version.json`;
2. rilanciare lo script con la stessa chiave.

La chiave (`apk/codeforge-release.p12`) e la sua password (`apk/keystore.properties`, oppure la variabile `CODEFORGE_KEY_PASS`) vengono create alla prima build. Sono escluse da git: conservale in un luogo sicuro, perché senza di esse non si possono firmare aggiornamenti compatibili.

In alternativa si può usare Capacitor (`capacitor.config.json`, `webDir: "www"`): `npm install && npx cap add android && npx cap open android`.

## Struttura

```
www/
  index.html               shell, navigazione, bottom sheet, icone SVG
  css/style.css            design system dark (glass, splash di avvio, identità di marca)
  css/fonts.css, fonts/    Inter, JetBrains Mono e Cairo incorporati (offline)
  js/app.js                router, lezioni, editor, debugger, memoria JVM, esame, glossario
  js/interpreter.js        simulatore JVM didattico con trace passo-passo
  js/linter.js             analizzatore «Buona Norma» con correzioni automatiche e voto /30
  js/explainer.js          spiegazione riga per riga e colorazione della sintassi
  js/verifica.js           verifica automatica degli esercizi
  js/data/livelli/         livello-0.js … livello-8.js: le 38 lezioni in 5 fasi
  js/data/percorso.js      riunisce i livelli, spazi di «Costruisci», esempi dell'editor
  js/data/glossary.js      glossario IT → AR
  js/data/esame.js         domande per la prova scritta e la prova orale
tests/                     test con node:test
tools/confronta-jdk.mjs    confronto del simulatore con una vera JVM
apk/                       guscio Android nativo, script di build, versione
dist/CodeForge.apk         APK firmato pronto da installare
```

## Limiti del simulatore

Il simulatore è uno strumento didattico, non una vera JVM. I costrutti fuori dal programma del corso (thread, `record`, reflection, rete, librerie non trattate nel corso…) producono il messaggio «Costrutto non supportato dal simulatore». L'input da tastiera arriva dalla casella «Input (stdin)»: se il programma chiede più dati di quelli forniti, il simulatore lo segnala.
