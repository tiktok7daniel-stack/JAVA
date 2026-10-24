// Coerenza del Percorso Accademico: struttura delle 5 fasi, codice eseguibile,
// esercizi risolvibili, quiz validi e testi arabi presenti.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { run } = require('../www/js/interpreter.js');
const { analizza } = require('../www/js/linter.js');
const { verificaEsercizio } = require('../www/js/verifica.js');
const { livelli, lezioni, esempi, completaCostruisci, analizzaCostruisci } = require('../www/js/data/percorso.js');

const AR = /[؀-ۿ]/;
const deps = { run, analizza };

test('9 livelli (0–8) con grado accademico e almeno 36 lezioni', () => {
  assert.deepEqual(livelli.map((l) => l.numero), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  for (const l of livelli) {
    assert.ok(l.grado && AR.test(l.gradoAr) && AR.test(l.titoloAr), `livello ${l.numero}`);
    assert.ok(l.lezioni.length >= 3, `livello ${l.numero}: almeno 3 lezioni`);
  }
  assert.equal(livelli[0].grado, 'Matricola');
  assert.match(livelli[8].grado, /30 e Lode/);
  assert.ok(lezioni.length >= 36, `lezioni: ${lezioni.length}`);
  assert.equal(new Set(lezioni.map((l) => l.id)).size, lezioni.length, 'id univoci');
});

for (const l of lezioni) {
  test(`${l.id} · ${l.titolo}`, () => {
    // Fase 1: teoria e analogia
    assert.ok(l.teoria.length >= 3, 'almeno 3 frasi di teoria');
    for (const f of l.teoria) {
      assert.ok(f.it && f.t, 'frase con termine tecnico');
      assert.ok(AR.test(f.ar) && AR.test(f.ex), `arabo mancante in «${f.it.slice(0, 40)}»`);
    }
    assert.ok(l.analogia && l.analogia.titolo && AR.test(l.analogia.ar), 'analogia araba');
    assert.ok(l.norma && AR.test(l.norma.ar), 'regola di buona norma');

    // Esempio eseguibile
    const r = run(l.esempio.codice, { input: l.esempio.input, files: l.esempio.files });
    assert.equal(r.error, null, `esempio: ${r.error && r.error.msg} (riga ${r.error && r.error.line})`);
    assert.ok(r.trace.length > 0, 'trace passo-passo');
    for (const [frag] of l.esempio.note || []) assert.ok(l.esempio.codice.includes(frag), `nota senza riga: ${frag}`);
    const ammesse = new Set(l.esempio.normaAmmesse || []);
    const viol = analizza(l.esempio.codice).filter((f) => !ammesse.has(f.regola));
    assert.deepEqual(viol.map((f) => `${f.line}:${f.regola}`), [], 'l\'esempio rispetta la Buona Norma');

    // Fase 2: micro-quiz
    assert.ok(l.quiz.length >= 2, 'almeno 2 domande');
    for (const q of l.quiz) {
      assert.ok(q.d && AR.test(q.dAr) && AR.test(q.ar) && q.it, 'domanda completa');
      assert.ok(Number.isInteger(q.corretta) && q.corretta >= 0 && q.corretta < q.opzioni.length, 'indice corretto valido');
      assert.equal(new Set(q.opzioni).size, q.opzioni.length, 'opzioni distinte');
    }

    // Fase 3: costruisci il codice
    const c = l.costruisci;
    assert.ok(AR.test(c.consegnaAr), 'consegna araba');
    const spazi = analizzaCostruisci(c.codice).filter((p) => p.risposte);
    assert.ok(spazi.length >= 2, 'almeno 2 spazi da completare');
    const completo = completaCostruisci(c.codice);
    const rc = run(completo, { input: c.input, files: c.files });
    assert.equal(rc.error, null, `costruisci: ${rc.error && rc.error.msg}`);
    if (c.output !== undefined) assert.equal(rc.text, c.output, 'output del codice completato');

    // Fase 4: laboratorio
    const lab = l.laboratorio;
    assert.ok(AR.test(lab.consegnaAr), 'consegna araba del laboratorio');
    for (const v of lab.verifiche) assert.ok(AR.test(v.msgAr), 'messaggio di verifica in arabo');
    const sol = verificaEsercizio(lab.soluzione, lab, deps);
    assert.ok(sol.superato, 'la soluzione deve superare: ' + sol.risultati.filter((x) => !x.ok).map((x) => x.msg).join(' | '));
    assert.equal(verificaEsercizio(lab.codice, lab, deps).superato, false, 'il codice iniziale non deve superare');
    const violSol = analizza(lab.soluzione).filter((f) => f.severity === 'errore');
    assert.deepEqual(violSol.map((f) => `${f.line}:${f.regola}`), [], 'la soluzione non ha errori di Buona Norma');

    // Fase 5: riepilogo
    assert.ok(l.riepilogo.length >= 3, 'almeno 3 punti di riepilogo');
    for (const p of l.riepilogo) assert.ok(p.it && AR.test(p.ar));
    for (const o of l.orale || []) assert.ok(o.d && o.r && AR.test(o.ar), 'domanda orale completa');
  });
}

test('gli esempi dell\'editor si eseguono', () => {
  for (const e of esempi) {
    const r = run(e.codice, { input: e.input, files: e.files });
    assert.equal(r.error, null, `${e.id}: ${r.error && r.error.msg}`);
  }
});
