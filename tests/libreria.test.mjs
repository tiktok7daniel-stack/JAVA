// Funzionalità avanzate del simulatore. Gli output attesi sono stati confrontati con una vera JVM (JDK 21).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { run } = require('../www/js/interpreter.js');

const M = (body, extra = '') => `import java.util.*;\nimport java.util.stream.*;\nimport java.io.*;\n${extra}\npublic class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}\n`;
const out = (src, opts) => {
  const r = run(src, opts);
  assert.equal(r.error, null, r.error && `${r.error.msg} (riga ${r.error.line})`);
  return r.text;
};

test('Scanner: input simulato, nextInt seguito da nextLine (riga vuota) e virgola decimale', () => {
  const src = M(`        Scanner sc = new Scanner(System.in);
        System.out.print("Età: ");
        int eta = sc.nextInt();
        String resto = sc.nextLine();
        System.out.print("Nome: ");
        String nome = sc.nextLine();
        double media = sc.nextDouble();
        System.out.println(nome + " ha " + eta + " anni, resto=[" + resto + "], media " + media);
        sc.close();`);
  const r = run(src, { input: '25\nMario Rossi\n27,5\n' });
  assert.equal(r.text, 'Età: Nome: Mario Rossi ha 25 anni, resto=[], media 27.5\n');
  assert.ok(r.stdout.some((c) => c.input && c.text === '25\n'), 'eco dell\'input nella console');
  assert.ok(r.trace.some((s) => s.kind === 'decl' && /riga VUOTA/.test(s.it)), 'spiegazione del classico errore nextInt/nextLine');
});

test('Scanner: InputMismatchException e input esaurito', () => {
  const r = run(M('        Scanner sc = new Scanner(System.in);\n        int x = sc.nextInt();'), { input: 'abc\n' });
  assert.match(r.errText, /java\.util\.InputMismatchException: For input string: "abc"/);
  const r2 = run(M('        Scanner sc = new Scanner(System.in);\n        int x = sc.nextInt();'), { input: '' });
  assert.equal(r2.error.type, 'unsupported');
  assert.match(r2.error.msg, /Input \(stdin\)/);
});

test('enum: costanti, ordinal, values, valueOf, switch, costruttore e switch expression', () => {
  const t = out(M(`        Colore c = Colore.VERDE;
        System.out.println(c + " " + c.ordinal() + " " + c.name());
        for (Colore x : Colore.values()) System.out.print(x + " ");
        System.out.println();
        switch (c) { case ROSSO: System.out.println("stop"); break; case VERDE: System.out.println("vai"); break; default: System.out.println("?"); }
        System.out.println(Pianeta.TERRA.getMassa() + " " + Colore.valueOf("BLU").compareTo(Colore.ROSSO));
        String s = switch (c) { case ROSSO -> "R"; case VERDE -> "V"; default -> "B"; };
        System.out.println(s);`, `enum Colore { ROSSO, VERDE, BLU }
enum Pianeta { MERCURIO(3.3), TERRA(5.97); private final double massa; Pianeta(double m) { massa = m; } public double getMassa() { return massa; } }`));
  assert.equal(t, 'VERDE 1 VERDE\nROSSO VERDE BLU \nvai\n5.97 2\nV\n');
  const r = run(M('        Colore c = new Colore();', 'enum Colore { R }'));
  assert.match(r.error.msg, /non possono essere istanziati con new/);
});

test('HashMap/HashSet: stesso ordine di iterazione della JVM (anche dopo il ridimensionamento)', () => {
  const t = out(M(`        Map<String, Integer> m = new HashMap<>();
        String[] parole = {"mela", "pera", "banana", "kiwi", "arancia", "mela", "kiwi", "uva", "fragola", "ciliegia"};
        for (String p : parole) m.put(p, m.getOrDefault(p, 0) + 1);
        System.out.println(m);
        Set<Integer> s = new HashSet<>(Arrays.asList(100, 5, 33, 17, 64, 1));
        System.out.println(s);
        Map<Integer, String> big = new HashMap<>();
        for (int i = 0; i < 20; i++) big.put(i * 37 % 101, "v");
        System.out.println(big.keySet());
        Set<Double> ds = new HashSet<>(List.of(1.5, 2.25, 10.0, 3.0));
        System.out.println(ds);
        Map<String, Integer> t = new TreeMap<>(m);
        System.out.println(t.keySet() + " " + t.firstKey());
        Map<Character, Integer> lm = new LinkedHashMap<>();
        lm.put('z', 1);
        lm.put('a', 2);
        System.out.println(lm);`));
  assert.equal(t, `{pera=1, banana=1, uva=1, kiwi=2, arancia=1, ciliegia=1, fragola=1, mela=2}
[64, 33, 17, 1, 100, 5]
[0, 97, 67, 3, 37, 40, 74, 10, 77, 13, 47, 50, 84, 20, 87, 23, 57, 60, 94, 30]
[2.25, 10.0, 1.5, 3.0]
[arancia, banana, ciliegia, fragola, kiwi, mela, pera, uva] arancia
{z=1, a=2}
`);
});

test('lambda, riferimenti a metodo, Comparable e Comparator', () => {
  const t = out(M(`        List<Studente> l = new ArrayList<>();
        l.add(new Studente("Luca", 27));
        l.add(new Studente("Anna", 30));
        l.add(new Studente("Bea", 27));
        l.sort((a, b) -> a.getVoto() - b.getVoto());
        System.out.println(l);
        l.sort(Comparator.comparing(Studente::getVoto).reversed().thenComparing(Studente::getNome));
        System.out.println(l);
        Collections.sort(l);
        System.out.println(l);
        l.forEach(s -> System.out.print(s.getNome() + " "));
        System.out.println();
        int base = 10;
        Operazione somma = (a, b) -> a + b + base;
        System.out.println(somma.calcola(2, 3));
        List.of("x", "y").forEach(System.out::println);`, `class Studente implements Comparable<Studente> {
    private String nome;
    private int voto;
    Studente(String n, int v) { nome = n; voto = v; }
    public String getNome() { return nome; }
    public int getVoto() { return voto; }
    public int compareTo(Studente o) { return nome.compareTo(o.nome); }
    public String toString() { return nome + ":" + voto; }
}
interface Operazione { int calcola(int a, int b); }`));
  assert.equal(t, '[Luca:27, Bea:27, Anna:30]\n[Anna:30, Bea:27, Luca:27]\n[Anna:30, Bea:27, Luca:27]\nAnna Bea Luca \n15\nx\ny\n');
  const r = run(M('        int c = 0;\n        Runnable r = () -> { c++; };\n        r.run();'));
  assert.match(r.error.msg, /effettivamente final/);
});

test('Stream API, Collectors e Optional (con valutazione pigra come in Java)', () => {
  const t = out(M(`        List<Integer> n = List.of(5, 3, 8, 1, 9, 2);
        System.out.println(n.stream().filter(x -> x % 2 == 0).map(x -> x * 10).collect(Collectors.toList()));
        System.out.println(n.stream().mapToInt(Integer::intValue).sum() + " " + n.stream().mapToInt(x -> x).average().getAsDouble());
        System.out.println(n.stream().sorted().map(String::valueOf).collect(Collectors.joining(", ", "[", "]")));
        System.out.println(n.stream().max(Integer::compare).get() + " " + n.stream().count() + " " + n.stream().anyMatch(x -> x > 8));
        Stream.of("a", "bb", "ccc").filter(s -> { System.out.print("f" + s + " "); return s.length() > 1; }).limit(1).forEach(s -> System.out.println("->" + s));
        System.out.println(IntStream.rangeClosed(1, 5).map(x -> x * x).boxed().collect(Collectors.toList()));
        System.out.println(n.stream().collect(Collectors.partitioningBy(x -> x > 4)));
        Optional<Integer> vuoto = n.stream().filter(x -> x > 100).findFirst();
        System.out.println(vuoto + " " + vuoto.orElse(-1));
        List<String> l = List.of("ape", "bue", "asino", "cane", "bruco");
        System.out.println(l.stream().collect(Collectors.groupingBy(x -> x.charAt(0), Collectors.counting())));
        System.out.println(l.stream().collect(Collectors.groupingBy(x -> x.length() > 3 ? "lunghe" : "corte")));`));
  assert.equal(t, `[80, 20]
28 4.666666666666667
[1, 2, 3, 5, 8, 9]
9 6 true
fa fbb ->bb
[1, 4, 9, 16, 25]
{false=[3, 1, 2], true=[5, 8, 9]}
Optional.empty -1
{a=2, b=2, c=1}
{lunghe=[asino, cane, bruco], corte=[ape, bue]}
`);
});

test('classi anonime con variabili catturate', () => {
  const t = out(M(`        int soglia = 3;
        Comparator<String> c = new Comparator<String>() {
            @Override
            public int compare(String a, String b) { return a.length() - b.length(); }
        };
        List<String> l = new ArrayList<>(List.of("ccc", "a", "bb"));
        Collections.sort(l, c);
        System.out.println(l);
        Filtro f = new Filtro() { public boolean ok(int x) { return x > soglia; } };
        System.out.println(f.ok(5) + " " + f.ok(1));`, 'interface Filtro { boolean ok(int x); }'));
  assert.equal(t, '[a, bb, ccc]\ntrue false\n');
});

test('file system virtuale: PrintWriter, BufferedReader, Scanner(File), try-with-resources', () => {
  const r = run(M(`        try (PrintWriter pw = new PrintWriter(new FileWriter("voti.txt"))) {
            pw.println("Anna;30");
            pw.println("Luca;27");
        } catch (IOException e) {
            System.out.println("errore");
        }
        try (BufferedReader br = new BufferedReader(new FileReader("voti.txt"))) {
            String riga;
            while ((riga = br.readLine()) != null) {
                String[] p = riga.split(";");
                System.out.println(p[0] + " -> " + Integer.parseInt(p[1]));
            }
        } catch (IOException e) {
            System.out.println("errore lettura");
        }
        try {
            Scanner in = new Scanner(new File("manca.txt"));
        } catch (FileNotFoundException e) {
            System.out.println("Non trovato: " + e.getMessage());
        }
        Scanner fs = null;
        try {
            fs = new Scanner(new File("dati.txt"));
            int tot = 0;
            while (fs.hasNextInt()) tot += fs.nextInt();
            System.out.println("Totale " + tot);
        } catch (FileNotFoundException e) {
            System.out.println("?");
        } finally {
            if (fs != null) fs.close();
        }`), { files: { 'dati.txt': '3 4\n5\n' } });
  assert.equal(r.error, null);
  assert.equal(r.text, 'Anna -> 30\nLuca -> 27\nNon trovato: manca.txt (No such file or directory)\nTotale 12\n');
  assert.equal(r.files['voti.txt'], 'Anna;30\nLuca;27\n');
  assert.ok(r.trace.some((s) => s.kind === 'close'), 'chiusura automatica registrata');
});

test('PrintWriter non chiuso: il file resta vuoto (buffer non scritto)', () => {
  const r = run(M('        try {\n            PrintWriter pw = new PrintWriter("out.txt");\n            pw.println("ciao");\n        } catch (FileNotFoundException e) {\n        }'));
  assert.equal(r.files['out.txt'], '');
});

test('ConcurrentModificationException, Iterator.remove e remove(Object)', () => {
  const r = run(M('        List<Integer> l = new ArrayList<>(List.of(1, 2, 3, 4));\n        for (Integer x : l) {\n            if (x == 2) l.remove(x);\n        }'));
  assert.match(r.errText, /java\.util\.ConcurrentModificationException/);
  assert.equal(out(M('        List<Integer> l = new ArrayList<>(List.of(1, 2, 3));\n        for (Integer x : l) {\n            if (x == 2) l.remove(x);\n        }\n        System.out.println(l);')), '[1, 3]\n');
  assert.equal(out(M('        List<Integer> l = new ArrayList<>(List.of(1, 2, 3, 4));\n        Iterator<Integer> it = l.iterator();\n        while (it.hasNext()) {\n            if (it.next() % 2 == 0) it.remove();\n        }\n        System.out.println(l + " " + l.remove(Integer.valueOf(3)) + " " + l);')), '[1, 3] true [1]\n');
});

test('unboxing di null da una Map: NullPointerException', () => {
  const r = run(M('        Map<String, Integer> m = new HashMap<>();\n        int x = m.get("no");'));
  assert.match(r.errText, /NullPointerException: Cannot unbox a null value/);
});

test('generics, operatori di shift e switch con yield', () => {
  assert.equal(out(M('        Coppia<String, Integer> p = new Coppia<>("a", 1);\n        System.out.println(p.getPrimo() + p.getSecondo());',
    'class Coppia<K, V> {\n    private K primo;\n    private V secondo;\n    Coppia(K a, V b) { primo = a; secondo = b; }\n    K getPrimo() { return primo; }\n    V getSecondo() { return secondo; }\n}')), 'a1\n');
  assert.equal(out(M('        List<List<Integer>> m = new ArrayList<>();\n        m.add(new ArrayList<>(List.of(1, 2)));\n        System.out.println(m + " " + (16 >> 2) + " " + (-16 >>> 28));')), '[[1, 2]] 4 15\n');
  assert.equal(out(M('        int g = 3;\n        String t = switch (g) { case 1, 7 -> "weekend"; default -> { String r = "feriale"; yield r + g; } };\n        System.out.println(t);')), 'feriale3\n');
});

test('memoria: mappe, lambda e Scanner compaiono nello Heap', () => {
  const r = run(M('        Map<String, Integer> m = new HashMap<>();\n        m.put("a", 1);\n        Runnable r = () -> System.out.println("x");\n        System.out.println(m);'));
  const last = r.trace.filter((s) => s.kind !== 'end').at(-1);
  const labels = last.heap.map((h) => h.label).join(' | ');
  assert.match(labels, /HashMap<> \(size 1\)/);
  assert.match(labels, /λ/);
});
