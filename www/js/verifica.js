/*
 * CodeForge — Verifica automatica degli esercizi.
 * Combina l'esito del simulatore JVM (con input e file simulati), l'analisi
 * "Buona Norma" e i controlli sul codice.
 */
(function (root) {
  'use strict';

  const norm = (s) => String(s || '').replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').trim();

  /**
   * @param {string} codice  sorgente dello studente
   * @param {object} esercizio  { verifiche: [...], input?, files? }
   * @param {object} deps  { run, analizza } (CFInterpreter.run, CFLinter.analizza)
   * @returns {{ superato: boolean, risultati: Array<{ok, msg, msgAr}>, esito, findings }}
   */
  function verificaEsercizio(codice, esercizio, deps) {
    const base = { input: esercizio.input || '', files: esercizio.files || {} };
    const cache = new Map();
    const esegui = (input) => {
      const key = input === undefined ? '\u0000base' : input;
      if (!cache.has(key)) cache.set(key, deps.run(codice, { input: input === undefined ? base.input : input, files: base.files }));
      return cache.get(key);
    };
    const esito = esegui(undefined);
    const findings = deps.analizza(codice);
    const risultati = [];
    if (esito.error && (esito.error.type === 'compile' || esito.error.type === 'unsupported')) {
      risultati.push({
        ok: false,
        msg: `Il codice non compila (riga ${esito.error.line}): ${esito.error.msg}`,
        msgAr: `الكود لا يُترجم (السطر ${esito.error.line}): ${esito.error.ar || ''}`,
      });
    }
    for (const v of esercizio.verifiche || []) {
      const r = esegui(v.input);
      const out = norm(r.text);
      let ok = false;
      switch (v.tipo) {
        case 'output': ok = !r.error && out === norm(v.atteso); break;
        case 'contiene': ok = !r.error && out.includes(v.testo); break;
        case 'codice': ok = new RegExp(v.re).test(codice); break;
        case 'nonCodice': ok = !new RegExp(v.re).test(codice); break;
        case 'norma': {
          const rel = findings.filter((f) => (v.regole ? v.regole.includes(f.regola) : f.severity === 'errore'));
          ok = rel.length === 0;
          break;
        }
        case 'noEccezione': ok = !r.exception && !r.error; break;
        case 'eccezione': ok = !!r.exception && (!v.classe || r.exception.cls === v.classe); break;
        case 'file': ok = !r.error && r.files && norm(r.files[v.nome]) === norm(v.atteso); break;
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
