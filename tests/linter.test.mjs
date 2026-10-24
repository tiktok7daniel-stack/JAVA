import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { analizza, applicaCorrezione, calcolaVoto, toCamel, toPascal, toUpperSnake } = require('../www/js/linter.js');

const wrap = (body, fields = '') => `public class Main {\n${fields}\n    public static void main(String[] args) {\n${body}\n    }\n}\n`;
const rules = (code) => analizza(code).map((f) => f.regola);
const find = (code, regola) => analizza(code).find((f) => f.regola === regola);

test('conversioni di nomi', () => {
  assert.equal(toCamel('Numero'), 'numero');
  assert.equal(toCamel('NUMERO_STUDENTI'), 'numeroStudenti');
  assert.equal(toCamel('area_totale'), 'areaTotale');
  assert.equal(toPascal('conto_corrente'), 'ContoCorrente');
  assert.equal(toUpperSnake('aliquotaIva'), 'ALIQUOTA_IVA');
});

test('int Numero viola camelCase e suggerisce int numero', () => {
  const code = wrap('        int Numero = 5;\n        System.out.println(Numero);');
  const f = find(code, 'camel-case');
  assert.ok(f, 'violazione attesa');
  assert.equal(f.severity, 'errore');
  assert.equal(f.suggestedFix, 'int numero = 5;');
  const fixed = applicaCorrezione(code, f);
  assert.match(fixed, /int numero = 5;/);
  assert.match(fixed, /println\(numero\)/, 'tutte le occorrenze vengono rinominate');
});

test('int numero è conforme', () => {
  assert.deepEqual(rules(wrap('        int numero = 5;\n        System.out.println(numero);')), []);
});

test('float Area viola camelCase', () => {
  const f = find(wrap('        float Area = 3.5f;'), 'camel-case');
  assert.ok(f);
  assert.equal(f.rename.to, 'area');
});

test('la rinomina non tocca stringhe e commenti', () => {
  const code = wrap('        int Totale = 1; // Totale\n        System.out.println("Totale: " + Totale);');
  const fixed = applicaCorrezione(code, find(code, 'camel-case'));
  assert.match(fixed, /\/\/ Totale/);
  assert.match(fixed, /"Totale: " \+ totale/);
});

test('public int saldo viola l\'incapsulamento con correzione a private', () => {
  const code = 'class Conto {\n    public int saldo;\n}\n';
  const f = find(code, 'incapsulamento');
  assert.ok(f);
  assert.equal(f.severity, 'errore');
  assert.equal(f.suggestedFix, 'private int saldo;');
  assert.match(applicaCorrezione(code, f), /private int saldo;/);
});

test('attributo senza modificatore: avviso, correzione aggiunge private', () => {
  const code = 'class Conto {\n    double tasso;\n}\n';
  const f = find(code, 'incapsulamento');
  assert.equal(f.severity, 'avviso');
  assert.equal(f.suggestedFix, 'private double tasso;');
});

test('le costanti public static final sono ammesse', () => {
  assert.deepEqual(rules('class Costanti {\n    public static final double PI_GRECO = 3.14;\n}\n'), []);
});

test('costante final non in UPPER_SNAKE_CASE', () => {
  const code = 'class C {\n    private static final int maxStudenti = 30;\n}\n';
  const f = find(code, 'costante-maiuscolo');
  assert.ok(f);
  assert.equal(f.rename.to, 'MAX_STUDENTI');
});

test('un attributo private final di istanza resta in camelCase', () => {
  assert.deepEqual(rules('class C {\n    private final String iban;\n    C(String iban) { this.iban = iban; }\n}\n'), []);
});

test('nome di classe non in PascalCase', () => {
  const f = find('public class conto_corrente {\n}\n', 'pascal-case');
  assert.ok(f);
  assert.equal(f.suggestedFix, 'public class ContoCorrente {');
});

test('metodo non in camelCase', () => {
  assert.ok(find('class C {\n    public void Deposita(double importo) {\n    }\n}\n', 'camel-case-metodo'));
});

test('confronto di String con == suggerisce equals con la costante a sinistra', () => {
  const code = wrap('        String nome = "Mario";\n        if (nome == "Mario") {\n            System.out.println("ok");\n        }');
  const f = find(code, 'string-equals');
  assert.ok(f);
  assert.equal(f.suggestedFix, '"Mario".equals(nome)');
  assert.match(applicaCorrezione(code, f), /if \("Mario"\.equals\(nome\)\)/);
});

test('!= tra String diventa !equals', () => {
  const code = wrap('        String a = "x";\n        String b = "y";\n        boolean diversi = a != b;');
  assert.equal(find(code, 'string-equals').suggestedFix, '!a.equals(b)');
});

test('confronto con null non è segnalato', () => {
  assert.ok(!rules(wrap('        String s = null;\n        if (s == null) {\n            s = "";\n        }')).includes('string-equals'));
});

test('if (attivo == true) suggerisce if (attivo)', () => {
  const code = wrap('        boolean attivo = true;\n        if (attivo == true) {\n            System.out.println(attivo);\n        }');
  const f = find(code, 'booleano-ridondante');
  assert.equal(f.suggestedFix, 'attivo');
  assert.match(applicaCorrezione(code, f), /if \(attivo\) \{/);
  const g = find(wrap('        boolean attivo = true;\n        if (attivo == false) {\n            attivo = true;\n        }'), 'booleano-ridondante');
  assert.equal(g.suggestedFix, '!attivo');
});

test('catch vuoto (anche su più righe) con correzione automatica', () => {
  const code = wrap('        try {\n            int x = Integer.parseInt("1");\n        } catch (NumberFormatException e) {\n        }');
  const f = find(code, 'catch-vuoto');
  assert.ok(f);
  const fixed = applicaCorrezione(code, f);
  assert.match(fixed, /System\.err\.println\("Errore: " \+ e\.getMessage\(\)\);/);
  assert.ok(!rules(fixed).includes('catch-vuoto'));
});

test('catch (Exception e) è troppo generico', () => {
  const code = wrap('        try {\n            System.out.println(1);\n        } catch (Exception e) {\n            System.out.println(e);\n        }');
  assert.ok(rules(code).includes('catch-generico'));
});

test('catturare NullPointerException è uso delle eccezioni per il flusso', () => {
  const code = wrap('        String s = null;\n        try {\n            s.length();\n        } catch (NullPointerException e) {\n            System.out.println("x");\n        }');
  assert.ok(rules(code).includes('eccezioni-flusso'));
});

test('numero magico fuori dal main, non nelle costanti final', () => {
  const code = 'class Prezzo {\n    private static final double ALIQUOTA_IVA = 0.22;\n    public double lordo(double netto) {\n        return netto * 1.22;\n    }\n}\n';
  const f = analizza(code).filter((x) => x.regola === 'numero-magico');
  assert.equal(f.length, 1);
  assert.equal(f[0].line, 4);
});

test('break in un ciclo è segnalato, break nello switch no', () => {
  const loop = wrap('        for (int i = 0; i < 5; i++) {\n            if (i == 2) {\n                break;\n            }\n        }');
  assert.ok(rules(loop).includes('salto-non-strutturato'));
  const sw = wrap('        int x = 1;\n        switch (x) {\n            case 1:\n                System.out.println(x);\n                break;\n            default:\n                break;\n        }');
  assert.ok(!rules(sw).includes('salto-non-strutturato'));
  const cont = wrap('        int i = 0;\n        while (i < 5) {\n            i++;\n            if (i == 2) {\n                continue;\n            }\n        }');
  assert.ok(rules(cont).includes('salto-non-strutturato'));
});

test('corpo di if senza graffe con correzione', () => {
  const code = wrap('        int x = 1;\n        if (x > 0) System.out.println(x);');
  const f = find(code, 'graffe');
  assert.equal(f.suggestedFix, 'if (x > 0) { System.out.println(x); }');
});

test('ogni segnalazione ha i campi richiesti', () => {
  const code = 'public class conto_bancario {\n    public double Saldo;\n    public void Deposita(double Importo) {\n        Saldo += Importo * 1.22;\n    }\n}\n';
  for (const f of analizza(code)) {
    for (const k of ['line', 'severity', 'regola', 'it', 'ar', 'badSnippet', 'suggestedFix', 'fix']) assert.ok(k in f, `campo ${k} mancante`);
    assert.ok(['errore', 'avviso', 'suggerimento'].includes(f.severity));
    assert.ok(/[؀-ۿ]/.test(f.ar), 'spiegazione araba presente');
  }
});

test('applicare tutte le correzioni porta a un codice senza errori correggibili', () => {
  let code = 'public class conto_bancario {\n    public double Saldo;\n    public String titolare;\n    public void Deposita(double Importo) {\n        Saldo += Importo;\n    }\n    public static void main(String[] args) {\n        boolean attivo = true;\n        if (attivo == true) {\n            System.out.println("ok");\n        }\n    }\n}\n';
  for (let i = 0; i < 30; i++) {
    const f = analizza(code).find((x) => x.fix);
    if (!f) break;
    code = applicaCorrezione(code, f);
  }
  assert.deepEqual(analizza(code).filter((x) => x.fix), []);
  assert.match(code, /public class ContoBancario/);
  assert.match(code, /private double saldo;/);
  assert.match(code, /public void deposita\(double importo\)/);
});

test('calcolo del voto in trentesimi', () => {
  assert.deepEqual(calcolaVoto([], { ok: true }), { voto: 30, lode: true, giudizio: '30 e Lode', superato: true });
  const v = calcolaVoto([{ severity: 'errore' }, { severity: 'avviso' }], { ok: true });
  assert.equal(v.voto, 26);
  assert.equal(v.lode, false);
  assert.ok(calcolaVoto([], { ok: false, error: { type: 'compile' } }).voto < 18);
});
