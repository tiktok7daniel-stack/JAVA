// Dati della simulazione d'esame e del glossario.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { run } = require('../www/js/interpreter.js');
const { analizza } = require('../www/js/linter.js');
const { esempi } = require('../www/js/data/percorso.js');
const esame = require('../www/js/data/esame.js');
const glossario = require('../www/js/data/glossary.js');

const AR = /[؀-ۿ]/;

test('l\'esempio da correggere contiene molte violazioni', () => {
  assert.ok(analizza(esempi[0].codice).length >= 8);
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
