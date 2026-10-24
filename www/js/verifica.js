/*
 * CodeForge — Verifica automatica degli esercizi.
 * Combina l'esito del simulatore JVM, l'analisi "Buona Norma" e i controlli sul codice.
 */
(function (root) {
  'use strict';

  const norm = (s) => String(s || '').replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').trim();

  /**
   * @param {string} codice  sorgente dello studente
   * @param {object} esercizio  { verifiche: [...] }
   * @param {object} deps  { run, analizza } (CFInterpreter.run, CFLinter.analizza)
   * @returns {{ superato: boolean, risultati: Array<{ok, msg, msgAr}>, esito, findings }}
   */
  function verificaEsercizio(codice, esercizio, deps) {
    const esito = deps.run(codice);
    const findings = deps.analizza(codice);
    const out = norm(esito.text);
    const risultati = [];
    if (esito.error && (esito.error.type === 'compile' || esito.error.type === 'unsupported')) {
      risultati.push({
        ok: false,
        msg: `Il codice non compila (riga ${esito.error.line}): ${esito.error.msg}`,
        msgAr: `الكود لا يُترجم (السطر ${esito.error.line}): ${esito.error.ar || ''}`,
      });
    }
    for (const v of esercizio.verifiche || []) {
      let ok = false;
      switch (v.tipo) {
        case 'output': ok = out === norm(v.atteso); break;
        case 'contiene': ok = out.includes(v.testo); break;
        case 'codice': ok = new RegExp(v.re).test(codice); break;
        case 'nonCodice': ok = !new RegExp(v.re).test(codice); break;
        case 'norma': {
          const rel = findings.filter((f) => (v.regole ? v.regole.includes(f.regola) : f.severity === 'errore'));
          ok = rel.length === 0;
          break;
        }
        case 'noEccezione': ok = !esito.exception && !esito.error; break;
        default: ok = false;
      }
      risultati.push({ ok, msg: v.msg, msgAr: v.msgAr });
    }
    return { superato: risultati.every((r) => r.ok), risultati, esito, findings };
  }

  const api = { verificaEsercizio };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CFVerifica = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
