# CodeForge — Programmazione Java (IT → عربي)

CodeForge è un prototipo funzionante di un'app per studiare la **Programmazione in Java** come nei corsi di Laurea in Informatica italiani. L'interfaccia e le lezioni sono **al 100% in italiano**. Ogni frase e ogni riga di codice si può **toccare** per avere subito traduzione e spiegazione **in arabo**.

> تطبيق CodeForge لتعلّم البرمجة بلغة Java باللغة الإيطالية كما في الجامعات الإيطالية، مع شرح فوري بالعربية لكل جملة ولكل سطر كود، ومحاكي JVM، ومُصحّح خطوة بخطوة يعرض الـStack والـHeap، وفاحص «Buona Norma» مع تصحيح تلقائي.

## Funzionalità

| Area | Cosa fa |
|---|---|
| **Lezioni** | 5 moduli e 13 lezioni (Fondamenti, Controllo del flusso, OOP, Ereditarietà e Polimorfismo, Eccezioni), ognuna con un esercizio verificato automaticamente. |
| **Tap-to-Understand** | Il bottom sheet mostra *Termine Tecnico (IT)*, *المعنى بالعربية*, *الشرح التفصيلي* e la *Regola di Buona Norma*. Si naviga con ◀ Precedente / Successivo ▶ (anche con le frecce della tastiera), c'è «Ascolta Pronuncia» in italiano (Web Speech API) e «★ Salva per l'Esame». |
| **Editor Java** | Editor con colorazione della sintassi, numeri di riga, indentazione automatica e «Vista interattiva» che spiega ogni riga. |
| **Simulatore JVM** | Interprete didattico di un sottoinsieme di Java: classi, costruttori, overloading, ereditarietà, classi astratte, interfacce, legame dinamico, array, `String`, `ArrayList`, `try-catch-finally`, `throw`/`throws`, eccezioni personalizzate, NPE e IndexOutOfBounds con stack trace reali. Gli errori di compilazione hanno una spiegazione in italiano e in arabo. |
| **Passo-Passo (Debug)** | Controlli ⏮ ◀ ▶ ⏭ e riproduzione automatica. Per ogni passo evidenzia la riga attiva e mostra la **Memoria JVM** (frame sullo Stack, oggetti nello Heap con frecce dei riferimenti, campi `private` e oggetti eleggibili per il GC) con commento in italiano e in arabo. |
| **Feedback del Professore** | Il linter «Buona Norma» controlla camelCase/PascalCase/UPPER_SNAKE_CASE, l'incapsulamento, `==` tra String, i confronti ridondanti con `true`/`false`, i catch vuoti o generici, le eccezioni usate per il flusso, i numeri magici, `break`/`continue` nei cicli e le graffe mancanti. Mostra il prima/dopo con **Applica Correzione** e calcola il voto in trentesimi (fino a **30 e Lode**). |
| **Esame** | Caccia all'errore, «Cosa stampa questo codice?» (con verifica nel simulatore) e domande frequenti dell'orale con risposta modello, parole chiave e spiegazione in arabo. |
| **Glossario** | 49 termini con ricerca, filtri (Tutti, ★ Da Ripassare, OOP, Memoria, Eccezioni, Buona Norma) e **flashcard** che si girano in 3D. |
| **Identità e avvio** | Logo «Forge Spark» (parentesi di codice e scintilla della forgia), animazione di avvio con tracciamento del logo, esplosione di scintille, scritta animata e motto «Forgia il tuo codice. Capisci ogni riga.»; font incorporati. |
| **Progressi** | XP, giorni consecutivi, lezioni completate ed esercizi superati, salvati in `localStorage`. |

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
- la coerenza del programma didattico: il codice delle lezioni compila, le soluzioni superano le verifiche e le risposte d'esame coincidono con il simulatore.

## APK Android

L'APK già pronto si trova in **`dist/CodeForge.apk`** (Android 7.0+, circa 320 KB, funziona completamente offline).

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
  js/data/curriculum.js    i 5 moduli con lezioni, codice annotato ed esercizi
  js/data/glossary.js      glossario IT → AR
  js/data/esame.js         domande per la prova scritta e la prova orale
tests/                     test con node:test
apk/                       guscio Android nativo, script di build, versione
dist/CodeForge.apk         APK firmato pronto da installare
```

## Limiti del simulatore

Il simulatore è uno strumento didattico, non una vera JVM. I costrutti non supportati (Scanner/input da tastiera, lambda, enum, classi anonime, HashMap, thread…) producono il messaggio «Costrutto non supportato dal simulatore». Nel codice va usato `public static void main(String[] args)` con valori fissi.
