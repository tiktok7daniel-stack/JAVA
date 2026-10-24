import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { run } = require('../www/js/interpreter.js');
const { analizza } = require('../www/js/linter.js');
const { verificaEsercizio } = require('../www/js/verifica.js');
const { moduli, esempi } = require('../www/js/data/curriculum.js');
const esame = require('../www/js/data/esame.js');
const glossario = require('../www/js/data/glossary.js');

const AR = /[؀-ۿ]/;
const deps = { run, analizza };

test('il programma contiene i 5 moduli con lezioni ed esercizi', () => {
  assert.equal(moduli.length, 5);
  for (const m of moduli) {
    assert.ok(m.lezioni.length >= 2, `${m.id}: almeno due lezioni`);
    assert.ok(AR.test(m.titoloAr));
    for (const l of m.lezioni) assert.ok(l.esercizio, `${l.id}: esercizio presente`);
  }
});

test('ogni frase ha termine tecnico, traduzione e spiegazione in arabo', () => {
  for (const m of moduli) for (const l of m.lezioni) for (const s of l.sezioni) {
    if (s.tipo !== 'testo') continue;
    for (const f of s.frasi) {
      assert.ok(f.it && f.t, `${l.id}: frase incompleta`);
      assert.ok(AR.test(f.ar) && AR.test(f.ex), `${l.id}: arabo mancante in «${f.it.slice(0, 30)}»`);
    }
  }
});

test('il codice delle lezioni compila, gira e rispetta la Buona Norma', () => {
  for (const m of moduli) for (const l of m.lezioni) for (const s of l.sezioni) {
    if (s.tipo !== 'codice') continue;
    const r = run(s.codice);
    assert.equal(r.error, null, `${l.id}: ${r.error && r.error.msg}`);
    assert.ok(r.trace.length > 0);
    for (const [frag] of s.note || []) assert.ok(s.codice.includes(frag), `${l.id}: nota senza riga «${frag}»`);
    // Unica eccezione voluta: il confronto con == mostrato in m1l3 per spiegare equals.
    const f = analizza(s.codice).filter((x) => !(l.id === 'm1l3' && x.regola === 'string-equals'));
    assert.deepEqual(f.map((x) => `${x.line}:${x.regola}`), [], `${l.id}: violazioni nel codice della lezione`);
  }
});

test('le soluzioni superano le verifiche, il codice iniziale no', () => {
  for (const m of moduli) for (const l of m.lezioni) {
    const e = l.esercizio;
    const sol = verificaEsercizio(e.soluzione, e, deps);
    assert.ok(sol.superato, `${l.id}: soluzione non superata: ${sol.risultati.filter((x) => !x.ok).map((x) => x.msg).join(' | ')}`);
    assert.equal(verificaEsercizio(e.codice, e, deps).superato, false, `${l.id}: lo starter non deve superare`);
    for (const v of e.verifiche) assert.ok(AR.test(v.msgAr), `${l.id}: messaggio arabo mancante`);
  }
});

test('gli esempi dell\'editor si eseguono', () => {
  for (const e of esempi) {
    const r = run(e.codice);
    assert.equal(r.error, null, `${e.id}: ${r.error && r.error.msg}`);
  }
  assert.ok(analizza(esempi[0].codice).length >= 8, 'l\'esempio da correggere contiene molte violazioni');
});

test('le risposte di «Cosa stampa?» coincidono con il simulatore', () => {
  for (const q of esame.output) {
    const printed = run(q.codice).text.trim().split('\n').join(' / ');
    assert.equal(printed.replace(/ \/ /g, ' '), q.opzioni[q.corretta].replace(/ \/ /g, ' '), q.titolo);
  }
});

test('la caccia all\'errore indica una riga che il linter segnala', () => {
  for (const q of esame.caccia) {
    const lines = q.codice.split('\n');
    assert.ok(q.riga >= 1 && q.riga <= lines.length, q.titolo);
    const wrapped = /class\s/.test(q.codice) ? q.codice : `class Esercizio {\n${q.codice}\n}`;
    const offset = wrapped === q.codice ? 0 : 1;
    const flagged = analizza(wrapped).map((f) => f.line - offset);
    assert.ok(flagged.includes(q.riga), `${q.titolo}: riga ${q.riga} non segnalata (${flagged})`);
  }
});

test('domande orali e glossario completi', () => {
  assert.ok(esame.orale.length >= 8);
  for (const q of esame.orale) assert.ok(q.d && q.r && AR.test(q.ar) && q.chiave.length);
  assert.ok(glossario.length >= 40);
  const cats = new Set(glossario.map((g) => g.cat));
  for (const c of ['OOP', 'Memoria', 'Eccezioni', 'Buona Norma']) assert.ok(cats.has(c), c);
  for (const g of glossario) assert.ok(AR.test(g.ar) && AR.test(g.ex), g.it);
});
