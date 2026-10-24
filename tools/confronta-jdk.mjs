#!/usr/bin/env node
// Confronta l'output del simulatore CodeForge con una vera JVM (richiede javac/java nel PATH).
// Per ogni lezione esegue: esempio, codice completato del "Costruisci", soluzione del laboratorio.
// La JVM gira con Locale italiano (it_IT), come sui computer degli studenti in Italia.
// Uso: node tools/confronta-jdk.mjs [idLezione ...]
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { run } = require('../www/js/interpreter.js');
const { livelli, completaCostruisci } = require('../www/js/data/percorso.js');

const filtro = new Set(process.argv.slice(2));
const env = { ...process.env };
delete env.JAVA_TOOL_OPTIONS;
delete env.JDK_JAVA_OPTIONS;

function eseguiJdk(codice, input, files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-jdk-'));
  const m = /public\s+(?:final\s+|abstract\s+)*(?:class|enum|interface)\s+(\w+)/.exec(codice);
  const nome = m ? m[1] : 'Main';
  fs.writeFileSync(path.join(dir, nome + '.java'), codice);
  for (const [f, c] of Object.entries(files || {})) fs.writeFileSync(path.join(dir, f), c);
  try {
    execFileSync('javac', ['-encoding', 'UTF-8', '-d', dir, path.join(dir, nome + '.java')], { cwd: dir, env, stdio: 'pipe' });
  } catch (e) {
    return { compile: String(e.stderr || e.message) };
  }
  let stdout = '', stderr = '';
  try {
    stdout = execFileSync('java', ['-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-Dstderr.encoding=UTF-8', '-Duser.language=it', '-Duser.country=IT', '-cp', dir, nome], { cwd: dir, env, input: input || '', stdio: 'pipe', timeout: 20000 }).toString();
  } catch (e) {
    stdout = String(e.stdout || '');
    stderr = String(e.stderr || '');
  }
  const out = {};
  for (const f of Object.keys(files || {}).concat(fs.readdirSync(dir).filter((f) => f.endsWith('.txt') || f.endsWith('.csv')))) {
    if (fs.existsSync(path.join(dir, f))) out[f] = fs.readFileSync(path.join(dir, f), 'utf8');
  }
  fs.rmSync(dir, { recursive: true, force: true });
  return { stdout, stderr: stderr.split('\n')[0], files: out };
}

let ok = 0, ko = 0;
for (const liv of livelli) {
  for (const l of liv.lezioni) {
    if (filtro.size && !filtro.has(l.id)) continue;
    const casi = [];
    if (l.esempio) casi.push(['esempio', l.esempio.codice, l.esempio.input, l.esempio.files]);
    if (l.costruisci) casi.push(['costruisci', completaCostruisci(l.costruisci.codice), l.costruisci.input, l.costruisci.files]);
    if (l.laboratorio) casi.push(['soluzione', l.laboratorio.soluzione, l.laboratorio.input, l.laboratorio.files]);
    for (const [tipo, codice, input, files] of casi) {
      const sim = run(codice, { input, files });
      const jdk = eseguiJdk(codice, input, files);
      const problemi = [];
      if (jdk.compile) problemi.push('javac: ' + jdk.compile.split('\n').slice(0, 3).join(' | '));
      if (sim.error && sim.error.type !== 'limit') problemi.push('simulatore: ' + sim.error.msg + ' (riga ' + sim.error.line + ')');
      if (!jdk.compile && sim.text !== jdk.stdout) problemi.push(`stdout diverso\n      sim: ${JSON.stringify(sim.text)}\n      jdk: ${JSON.stringify(jdk.stdout)}`);
      for (const [nome, cont] of Object.entries(sim.files || {})) {
        if (files && files[nome] === cont) continue;
        if (!jdk.compile && jdk.files[nome] !== cont) problemi.push(`file ${nome} diverso\n      sim: ${JSON.stringify(cont)}\n      jdk: ${JSON.stringify(jdk.files[nome])}`);
      }
      const simErr = (sim.errText || '').split('\n')[0];
      if (!jdk.compile && simErr !== jdk.stderr) problemi.push(`stderr diverso\n      sim: ${JSON.stringify(simErr)}\n      jdk: ${JSON.stringify(jdk.stderr)}`);
      if (problemi.length) {
        ko++;
        console.log(`✗ ${l.id} ${tipo}\n    ${problemi.join('\n    ')}`);
      } else ok++;
    }
  }
}
console.log(`\n${ok} programmi identici alla JVM, ${ko} con differenze`);
process.exit(ko ? 1 : 0);
