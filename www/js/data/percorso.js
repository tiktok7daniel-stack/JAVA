/*
 * CodeForge — Percorso Accademico Strutturato: 9 livelli (0–8) di lezioni.
 * Ogni lezione segue le 5 fasi: teoria + analogia, micro-quiz, costruisci il codice,
 * laboratorio, riepilogo. Nel codice di «Costruisci» gli spazi da completare sono
 * scritti come ⟦risposta⟧ oppure ⟦risposta|alternativa⟧.
 */
(function (root) {
  'use strict';
  const isNode = typeof module === 'object' && module.exports;
  let livelli;
  if (isNode) {
    livelli = [];
    for (let i = 0; i <= 8; i++) {
      try {
        livelli.push(require(`./livelli/livello-${i}.js`));
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') throw e;
      }
    }
  } else livelli = (root.CF_LIVELLI || []).slice();
  livelli.sort((a, b) => a.numero - b.numero);

  const BLANK = /⟦([^⟧]*)⟧/g;

  /** Codice completo: ogni spazio sostituito dalla prima risposta accettata. */
  function completaCostruisci(codice) {
    return codice.replace(BLANK, (m, a) => a.split('|')[0]);
  }

  /** Divide il codice in parti di testo e spazi da completare. */
  function analizzaCostruisci(codice) {
    const parti = [];
    let last = 0;
    let m;
    BLANK.lastIndex = 0;
    while ((m = BLANK.exec(codice))) {
      parti.push({ testo: codice.slice(last, m.index) });
      parti.push({ risposte: m[1].split('|') });
      last = m.index + m[0].length;
    }
    parti.push({ testo: codice.slice(last) });
    return parti;
  }

  const lezioni = [];
  livelli.forEach((liv) => liv.lezioni.forEach((l) => lezioni.push({ ...l, livello: liv })));
  lezioni.forEach((l, i) => { l.indice = i + 1; });

  const esempi = [
    {
      id: 'da-correggere', titolo: '⚠ Codice da correggere (Buona Norma)',
      codice: `public class conto_bancario {

    public double Saldo;
    public String titolare;
    private static final double tasso = 0.02;

    public conto_bancario(String titolare) {
        this.titolare = titolare;
    }

    public void Deposita(double Importo) {
        Saldo += Importo;
    }

    public static void main(String[] args) {
        conto_bancario c = new conto_bancario("Mario");
        c.Deposita(1500);
        float Area = 3.5f;
        boolean attivo = true;
        String nome = "Mario";
        if (attivo == true) {
            System.out.println("Conto attivo di " + c.titolare);
        }
        if (nome == c.titolare) {
            System.out.println("Stesso titolare");
        }
        try {
            int rate = 12;
            System.out.println("Rata: " + c.Saldo / rate);
        } catch (Exception e) {
        }
        System.out.println("Area: " + Area + ", interessi: " + c.Saldo * tasso);
    }
}`,
    },
  ];
  const scelti = ['l07', 'l12', 'l17', 'l21', 'l25', 'l28', 'l30', 'l31', 'l34', 'l35', 'l36'];
  for (const id of scelti) {
    const l = lezioni.find((x) => x.id === id);
    if (l && l.esempio) esempi.push({ id: 'es-' + id, titolo: `Lez. ${l.indice}: ${l.titolo}`, codice: l.esempio.codice, input: l.esempio.input, files: l.esempio.files });
  }

  const data = { livelli, lezioni, esempi, completaCostruisci, analizzaCostruisci };
  if (isNode) module.exports = data;
  else root.CF_PERCORSO = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
