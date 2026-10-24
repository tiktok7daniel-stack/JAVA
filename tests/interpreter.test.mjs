import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { run } = require('../www/js/interpreter.js');

const main = (body, extra = '') => `${extra}\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}\n`;
const out = (src) => {
  const r = run(src);
  assert.equal(r.error, null, r.error && r.error.msg);
  return r.text;
};

test('hello world', () => {
  assert.equal(out(main('        System.out.println("Ciao, mondo!");')), 'Ciao, mondo!\n');
});

test('somma con un ciclo for', () => {
  assert.equal(out(main('        int somma = 0;\n        for (int i = 1; i <= 10; i++) {\n            somma += i;\n        }\n        System.out.println("Somma: " + somma);')), 'Somma: 55\n');
});

test('divisione intera, cast e stampa dei double come in Java', () => {
  const t = out(main('        int a = 7;\n        int b = 2;\n        System.out.println(a / b);\n        System.out.println((double) a / b);\n        double d = a / b;\n        System.out.println(d);\n        System.out.println(a % b);\n        System.out.println(0.1 + 0.2);\n        System.out.println("x" + 2 + 3);'));
  assert.equal(t, '3\n3.5\n3.0\n1\n0.30000000000000004\nx23\n');
});

test('char, while, do-while e switch', () => {
  const t = out(main(`        char c = 'A';
        c++;
        System.out.println(c);
        int i = 0;
        do {
            i++;
        } while (i < 3);
        switch (i) {
            case 3:
                System.out.println("tre");
                break;
            default:
                System.out.println("altro");
        }`));
  assert.equal(t, 'B\ntre\n');
});

test('try-catch-finally: ordine di esecuzione', () => {
  const t = out(main('        try {\n            System.out.println("A");\n            int x = 10 / 0;\n            System.out.println("B");\n        } catch (ArithmeticException e) {\n            System.out.println("C: " + e.getMessage());\n        } finally {\n            System.out.println("D");\n        }'));
  assert.equal(t, 'A\nC: / by zero\nD\n');
});

test('eccezione personalizzata checked con throw e throws', () => {
  const extra = 'class SaldoException extends Exception {\n    public SaldoException(String m) {\n        super(m);\n    }\n}\nclass Conto {\n    private double saldo = 10;\n    public void preleva(double x) throws SaldoException {\n        if (x > saldo) {\n            throw new SaldoException("Saldo insufficiente");\n        }\n        saldo -= x;\n    }\n}';
  const t = out(main('        Conto c = new Conto();\n        try {\n            c.preleva(50);\n        } catch (SaldoException e) {\n            System.out.println(e.getMessage());\n            System.out.println(e);\n        }', extra));
  assert.equal(t, 'Saldo insufficiente\nSaldoException: Saldo insufficiente\n');
});

test('eccezione non gestita: messaggio e stack trace su System.err', () => {
  const r = run(main('        int[] v = new int[3];\n        v[3] = 1;'));
  assert.equal(r.error, null);
  assert.equal(r.exception.cls, 'ArrayIndexOutOfBoundsException');
  assert.match(r.errText, /^Exception in thread "main" java\.lang\.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3\n\tat Main\.main\(Main\.java:5\)/);
});

test('NullPointerException con messaggio descrittivo', () => {
  const r = run(main('        String s = null;\n        System.out.println(s.length());'));
  assert.match(r.errText, /NullPointerException: Cannot invoke "String\.length\(\)" because "s" is null/);
});

test('oggetti, costruttori sovraccarichi, this(...) e toString', () => {
  const extra = `class Conto {
    private String titolare;
    private double saldo;
    public Conto(String t) { this(t, 0.0); }
    public Conto(String titolare, double saldo) { this.titolare = titolare; this.saldo = saldo; }
    public void deposita(double x) { saldo += x; }
    public double getSaldo() { return saldo; }
    public String toString() { return titolare + ": " + saldo; }
}`;
  const t = out(main('        Conto a = new Conto("Mario", 100);\n        Conto b = new Conto("Lucia");\n        Conto c = a;\n        c.deposita(50);\n        System.out.println(a);\n        System.out.println(b.getSaldo());', extra));
  assert.equal(t, 'Mario: 150.0\n0.0\n');
});

test('ereditarietà, classi astratte, interfacce e legame dinamico', () => {
  const extra = `interface Sonoro { String verso(); }
abstract class Animale implements Sonoro {
    protected String nome;
    public Animale(String nome) { this.nome = nome; }
    public String descrivi() { return nome + " fa " + verso(); }
}
class Cane extends Animale {
    public Cane(String n) { super(n); }
    @Override
    public String verso() { return "Bau"; }
}
class Gatto extends Animale {
    public Gatto(String n) { super(n); }
    @Override
    public String verso() { return "Miao"; }
}`;
  const t = out(main('        Animale[] zoo = {new Cane("Fido"), new Gatto("Tom")};\n        for (Animale a : zoo) {\n            System.out.println(a.descrivi());\n        }\n        System.out.println(zoo[0] instanceof Sonoro);', extra));
  assert.equal(t, 'Fido fa Bau\nTom fa Miao\ntrue\n');
});

test('String: == confronta i riferimenti, equals il contenuto', () => {
  assert.equal(out(main('        String a = "java";\n        String b = new String("java");\n        System.out.println(a == b);\n        System.out.println(a.equals(b));\n        System.out.println(a == "java");')), 'false\ntrue\ntrue\n');
});

test('ArrayList, printf e metodi di String', () => {
  const t = out(main('        java.util.ArrayList<String> l = new ArrayList<>();\n        l.add("a");\n        l.add("b");\n        System.out.println(l + " " + l.size());\n        System.out.printf("%.2f %d %s%n", 2.0 / 3, 42, "ok");\n        System.out.println("Ciao".toUpperCase().charAt(1));'));
  assert.equal(t, '[a, b] 2\n0.67 42 ok\nI\n');
});

test('errori di compilazione con spiegazione italiana e araba', () => {
  const cases = [
    [main('        int x = 3.5;'), /perdita di precisione/],
    [main('        System.out.println(y);'), /simbolo non trovato: y/],
    [main('        A a = new A();\n        a.x = 5;', 'class A {\n    private int x;\n}'), /x ha accesso private in A/],
    [main('        Forma f = new Forma();', 'abstract class Forma {\n}'), /astratta; non può essere istanziata/],
    [main('        int x = 1\n        x++;'), /atteso ';'/],
    [main('        String s = "a";\n        if (s = "b") {\n        }'), /boolean/],
  ];
  for (const [src, re] of cases) {
    const r = run(src);
    assert.ok(r.error, 'errore atteso per: ' + src);
    assert.equal(r.error.type, 'compile');
    assert.match(r.error.msg, re);
    assert.ok(/[؀-ۿ]/.test(r.error.ar), 'spiegazione araba');
  }
});

test('una classe concreta deve implementare i metodi astratti', () => {
  const r = run(main('        int x = 1;', 'abstract class Forma {\n    public abstract double area();\n}\nclass Quadrato extends Forma {\n}'));
  assert.equal(r.error.type, 'compile');
  assert.match(r.error.msg, /non implementa il metodo astratto area\(\)/);
});

test('ciclo infinito interrotto dal limite di esecuzione', () => {
  const r = run(main('        int i = 0;\n        while (i < 10) {\n            i = i + 0;\n        }'));
  assert.equal(r.error.type, 'limit');
});

test('costrutto non supportato: messaggio dedicato', () => {
  const r = run(main('        Thread t = new Thread();'));
  assert.equal(r.error.type, 'unsupported');
  assert.match(r.error.msg, /^Costrutto non supportato dal simulatore/);
});

test('trace passo-passo: Stack, Heap, riferimenti e spiegazioni', () => {
  const extra = 'class Punto {\n    private int x;\n    public Punto(int x) {\n        this.x = x;\n    }\n}';
  const r = run(main('        int a = 5;\n        Punto p1 = new Punto(1);\n        Punto p2 = p1;\n        p1 = null;\n        System.out.println(a);', extra));
  assert.ok(r.trace.length > 5);
  for (const s of r.trace) {
    for (const k of ['line', 'outLen', 'frames', 'heap', 'it', 'ar']) assert.ok(k in s, `campo ${k}`);
  }
  const declP2 = r.trace.find((s) => s.kind === 'decl' && s.frames.at(-1).vars.some((v) => v.name === 'p2'));
  const vars = declP2.frames.at(-1).vars;
  const p1 = vars.find((v) => v.name === 'p1'), p2 = vars.find((v) => v.name === 'p2');
  assert.equal(p1.ref, p2.ref, 'aliasing: stesso indirizzo');
  const obj = declP2.heap.find((o) => o.addr === p1.ref);
  assert.equal(obj.label, 'Punto');
  assert.deepEqual(obj.fields.map((f) => [f.name, f.val, f.access]), [['x', '1', 'private']]);
  assert.match(declP2.it, /riferimento/);
  assert.ok(/[؀-ۿ]/.test(declP2.ar));
  const ctorStep = r.trace.find((s) => s.kind === 'ctor');
  assert.equal(ctorStep.frames.length, 2, 'il costruttore ha il proprio frame');
  const last = r.trace.at(-1);
  assert.equal(last.kind, 'end');
  assert.equal(last.frames.length, 0);
  assert.equal(r.stdout.slice(0, last.outLen).map((c) => c.text).join(''), '5\n');
});

test('ricorsione: un frame per chiamata', () => {
  const src = 'public class F {\n    static int fatt(int n) {\n        int r = 1;\n        if (n > 1) {\n            r = n * fatt(n - 1);\n        }\n        return r;\n    }\n    public static void main(String[] args) {\n        System.out.println(fatt(5));\n    }\n}\n';
  const r = run(src);
  assert.equal(r.text, '120\n');
  assert.equal(Math.max(...r.trace.map((s) => s.frames.length)), 6);
});
