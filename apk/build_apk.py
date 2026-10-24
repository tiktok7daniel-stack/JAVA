#!/usr/bin/env python3
"""
CodeForge — costruzione dell'APK Android senza Android SDK né Gradle.

Passi: scarica gli strumenti da Maven Central (android.jar, dx, apksig), compila
MainActivity, la converte in classes.dex, codifica AndroidManifest.xml e
resources.arsc in formato binario Android, impacchetta www/ negli asset,
allinea lo zip e firma con lo schema v2 (sempre con la stessa chiave,
così ogni nuova versione si installa come aggiornamento della precedente).

Uso:  python3 apk/build_apk.py           → dist/CodeForge.apk
Versione: apk/version.json (aumentare versionCode a ogni rilascio).
"""
import json
import os
import shutil
import struct
import subprocess
import sys
import time
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APK = ROOT / 'apk'
TOOLS = APK / '.tools'
BUILD = APK / 'build'
DIST = ROOT / 'dist'
WWW = ROOT / 'www'

PACKAGE = 'it.codeforge.java'
LABEL = 'CodeForge'
MIN_SDK = 24
TARGET_SDK = 34
KEYSTORE = APK / 'codeforge-release.p12'          # fuori da git: conservarla per gli aggiornamenti
KEY_PROPS = APK / 'keystore.properties'            # fuori da git: contiene la password
KEY_ALIAS = 'codeforge'

MAVEN = 'https://repo.maven.apache.org/maven2/'
JARS = {
    'android.jar': 'com/google/android/android/4.1.1.4/android-4.1.1.4.jar',
    'dx.jar': 'com/jakewharton/android/repackaged/dalvik-dx/16.0.1/dalvik-dx-16.0.1.jar',
    'apksig.jar': 'com/android/tools/build/apksig/2.3.0/apksig-2.3.0.jar',
}

# Identificativi delle risorse del framework (android.R.attr / android.R.style).
ATTR = {
    'theme': 0x01010000, 'label': 0x01010001, 'icon': 0x01010002, 'name': 0x01010003,
    'exported': 0x01010010, 'configChanges': 0x0101001F, 'launchMode': 0x0101001D,
    'minSdkVersion': 0x0101020C, 'versionCode': 0x0101021B, 'versionName': 0x0101021C,
    'windowSoftInputMode': 0x0101022B, 'targetSdkVersion': 0x01010270,
    'hardwareAccelerated': 0x010102D3,
}
THEME_BLACK_NOTITLEBAR = 0x01030009
ICON_ID = 0x7F010000
ICON_PATH = 'res/drawable-xxxhdpi-v4/icon.png'

T_REF, T_STR, T_INT, T_HEX, T_BOOL = 0x01, 0x03, 0x10, 0x11, 0x12
NS_ANDROID = 'http://schemas.android.com/apk/res/android'
NO_INDEX = 0xFFFFFFFF


def log(msg):
    print('▸ ' + msg, flush=True)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stdout.write(r.stdout)
        sys.stderr.write(r.stderr)
        raise SystemExit('comando fallito: ' + ' '.join(map(str, cmd)))
    return r.stdout


# ───────────────────────── Strumenti ─────────────────────────
def scarica_strumenti():
    TOOLS.mkdir(parents=True, exist_ok=True)
    for nome, percorso in JARS.items():
        dest = TOOLS / nome
        if dest.exists() and dest.stat().st_size > 0:
            continue
        for tentativo in range(8):
            try:
                with urllib.request.urlopen(MAVEN + percorso, timeout=90) as r:
                    dest.write_bytes(r.read())
                log(f'scaricato {nome}')
                break
            except Exception as e:  # Maven Central limita spesso le richieste (HTTP 429)
                attesa = 3 * (tentativo + 1)
                log(f'{nome}: {e} — nuovo tentativo tra {attesa}s')
                time.sleep(attesa)
        else:
            raise SystemExit('impossibile scaricare ' + nome)


# ───────────────────────── Formato binario Android ─────────────────────────
def string_pool(strings):
    """ResStringPool in UTF-16."""
    offsets, data = [], b''
    for s in strings:
        offsets.append(len(data))
        enc = s.encode('utf-16-le')
        n = len(enc) // 2
        if n > 0x7FFF:
            raise ValueError('stringa troppo lunga')
        data += struct.pack('<H', n) + enc + b'\0\0'
    while len(data) % 4:
        data += b'\0'
    start = 28 + 4 * len(strings)
    head = struct.pack('<HHIIIIII', 0x0001, 28, start + len(data), len(strings), 0, 0, start, 0)
    return head + b''.join(struct.pack('<I', o) for o in offsets) + data


class BinaryXml:
    """Codificatore minimale di XML binario Android (AXML)."""

    def __init__(self, root):
        self.root = root
        names = []
        self._collect(root, names)
        self.strings = list(names)          # i nomi degli attributi android: per primi
        self.resids = [ATTR[n] for n in names]

    def _collect(self, el, names):
        for ns, name, _ in el[1]:
            if ns and name not in names:
                names.append(name)
        for c in el[2]:
            self._collect(c, names)

    def idx(self, s):
        if s not in self.strings:
            self.strings.append(s)
        return self.strings.index(s)

    def _element(self, el, out):
        tag, attrs, children = el
        uri = self.idx(NS_ANDROID)
        enc = []
        for ns, name, (kind, val) in attrs:
            nsi = uri if ns else NO_INDEX
            ni = self.idx(name)
            if kind == 'str':
                si = self.idx(val)
                enc.append((ATTR.get(name, 0) if ns else 0, struct.pack('<IIIHBBI', nsi, ni, si, 8, 0, T_STR, si)))
            else:
                t = {'int': T_INT, 'hex': T_HEX, 'bool': T_BOOL, 'ref': T_REF}[kind]
                data = (0xFFFFFFFF if val else 0) if kind == 'bool' else val
                enc.append((ATTR.get(name, 0) if ns else 0, struct.pack('<IIIHBBI', nsi, ni, NO_INDEX, 8, 0, t, data)))
        enc.sort(key=lambda x: x[0])   # Android richiede gli attributi ordinati per id di risorsa
        name_i = self.idx(tag)
        body = struct.pack('<II', 1, NO_INDEX) + struct.pack('<IIHHHHHH', NO_INDEX, name_i, 20, 20, len(enc), 0, 0, 0)
        body += b''.join(e for _, e in enc)
        out.append(struct.pack('<HHI', 0x0102, 16, 8 + len(body)) + body)
        for c in children:
            self._element(c, out)
        out.append(struct.pack('<HHIIIII', 0x0103, 16, 24, 1, NO_INDEX, NO_INDEX, name_i))

    def pack(self):
        prefix, uri = self.idx('android'), self.idx(NS_ANDROID)
        chunks = []
        self._element(self.root, chunks)
        ns_start = struct.pack('<HHIIIII', 0x0100, 16, 24, 1, NO_INDEX, prefix, uri)
        ns_end = struct.pack('<HHIIIII', 0x0101, 16, 24, 1, NO_INDEX, prefix, uri)
        pool = string_pool(self.strings)
        resmap = struct.pack('<HHI', 0x0180, 8, 8 + 4 * len(self.resids)) + b''.join(struct.pack('<I', r) for r in self.resids)
        body = pool + resmap + ns_start + b''.join(chunks) + ns_end
        return struct.pack('<HHI', 0x0003, 8, 8 + len(body)) + body


def manifest(version_code, version_name):
    A = True
    activity = ('activity', [
        (A, 'name', ('str', PACKAGE + '.MainActivity')),
        (A, 'exported', ('bool', True)),
        (A, 'launchMode', ('int', 2)),                 # singleTask
        (A, 'configChanges', ('hex', 0x0FA0)),         # orientation|screenSize|screenLayout|keyboardHidden|smallestScreenSize|uiMode
        (A, 'windowSoftInputMode', ('hex', 0x10)),     # adjustResize
    ], [
        ('intent-filter', [], [
            ('action', [(A, 'name', ('str', 'android.intent.action.MAIN'))], []),
            ('category', [(A, 'name', ('str', 'android.intent.category.LAUNCHER'))], []),
        ]),
    ])
    root = ('manifest', [
        (False, 'package', ('str', PACKAGE)),
        (A, 'versionCode', ('int', version_code)),
        (A, 'versionName', ('str', version_name)),
    ], [
        ('uses-sdk', [(A, 'minSdkVersion', ('int', MIN_SDK)), (A, 'targetSdkVersion', ('int', TARGET_SDK))], []),
        # Visibilità del motore di sintesi vocale (necessaria da Android 11).
        ('queries', [], [('intent', [], [('action', [(A, 'name', ('str', 'android.intent.action.TTS_SERVICE'))], [])])]),
        ('application', [
            (A, 'label', ('str', LABEL)),
            (A, 'icon', ('ref', ICON_ID)),
            (A, 'theme', ('ref', THEME_BLACK_NOTITLEBAR)),
            (A, 'hardwareAccelerated', ('bool', True)),
        ], [activity]),
    ])
    return BinaryXml(root).pack()


def resources_arsc():
    """Tabella risorse con una sola voce: drawable/icon (xxxhdpi)."""
    gpool = string_pool([ICON_PATH])
    types = string_pool(['drawable'])
    keys = string_pool(['icon'])
    spec = struct.pack('<HHIBBHI', 0x0202, 16, 20, 1, 0, 0, 1) + struct.pack('<I', 0)
    cfg = bytearray(64)
    struct.pack_into('<I', cfg, 0, 64)
    struct.pack_into('<H', cfg, 14, 640)   # densità xxxhdpi
    struct.pack_into('<H', cfg, 24, 4)     # sdkVersion v4
    entry = struct.pack('<HHI', 8, 0, 0) + struct.pack('<HBBI', 8, 0, T_STR, 0)
    head_size = 20 + len(cfg)
    start = head_size + 4
    typ = struct.pack('<HHIBBHII', 0x0201, head_size, start + len(entry), 1, 0, 0, 1, start) + bytes(cfg) + struct.pack('<I', 0) + entry
    name = PACKAGE.encode('utf-16-le').ljust(256, b'\0')
    pkg_body = types + keys + spec + typ
    pkg = struct.pack('<HHII', 0x0200, 288, 288 + len(pkg_body), 0x7F) + name
    pkg += struct.pack('<IIIII', 288, 1, 288 + len(types), 1, 0) + pkg_body
    return struct.pack('<HHII', 0x0002, 12, 12 + len(gpool) + len(pkg), 1) + gpool + pkg


# ───────────────────────── Zip allineato ─────────────────────────
def scrivi_zip(path, voci):
    """voci: lista di (nome, bytes, compresso). Le voci non compresse sono allineate a 4 byte."""
    data_fissa = (2024, 1, 1, 0, 0, 0)
    with zipfile.ZipFile(path, 'w') as zf:
        for nome, contenuto, compresso in voci:
            zi = zipfile.ZipInfo(nome, date_time=data_fissa)
            zi.create_system = 0
            zi.external_attr = 0
            if compresso:
                zi.compress_type = zipfile.ZIP_DEFLATED
            else:
                zi.compress_type = zipfile.ZIP_STORED
                allinea = 4096 if nome.endswith('.so') else 4
                pos = zf.fp.tell() + 30 + len(nome.encode())
                pad = (-(pos + 6)) % allinea
                zi.extra = struct.pack('<HHH', 0xD935, 2 + pad, allinea) + b'\0' * pad
            zf.writestr(zi, contenuto)


def controlla_allineamento(path):
    with zipfile.ZipFile(path) as zf:
        raw = Path(path).read_bytes()
        for zi in zf.infolist():
            if zi.compress_type != zipfile.ZIP_STORED:
                continue
            off = zi.header_offset
            n, e = struct.unpack('<HH', raw[off + 26: off + 30])
            dati = off + 30 + n + e
            if dati % 4:
                raise SystemExit(f'voce non allineata: {zi.filename}')


# ───────────────────────── Build ─────────────────────────
def main():
    versione = json.loads((APK / 'version.json').read_text())
    vcode, vname = int(versione['versionCode']), versione['versionName']
    log(f'CodeForge {vname} (versionCode {vcode}) — package {PACKAGE}')
    scarica_strumenti()
    android_jar, dx_jar, apksig_jar = (TOOLS / n for n in ('android.jar', 'dx.jar', 'apksig.jar'))

    if BUILD.exists():
        shutil.rmtree(BUILD)
    classi = BUILD / 'classes'
    classi.mkdir(parents=True)

    log('compilazione di MainActivity')
    sorgenti = [str(p) for p in (APK / 'src').rglob('*.java')] + [str(p) for p in (APK / 'stubs').rglob('*.java')]
    # java.* dall'API Java 8 del JDK, android.* da android.jar (che contiene solo il framework).
    run(['javac', '-nowarn', '-Xlint:-options', '--release', '8', '-encoding', 'UTF-8',
         '-cp', str(android_jar), '-d', str(classi)] + sorgenti)
    shutil.rmtree(classi / 'android')   # lo stub dell'annotazione non va nel dex

    log('conversione in classes.dex')
    dex = BUILD / 'classes.dex'
    run(['java', '-cp', str(dx_jar), 'com.android.dx.command.Main', '--dex',
         f'--min-sdk-version={MIN_SDK}', f'--output={dex}', str(classi)])

    log('manifest e risorse in formato binario')
    voci = [
        ('AndroidManifest.xml', manifest(vcode, vname), True),
        ('classes.dex', dex.read_bytes(), True),
        ('resources.arsc', resources_arsc(), False),
        (ICON_PATH, (APK / 'res' / 'icon-192.png').read_bytes(), False),
    ]
    n_asset = 0
    for f in sorted(WWW.rglob('*')):
        if f.is_file() and f.name != 'sw.js':
            voci.append(('assets/www/' + f.relative_to(WWW).as_posix(), f.read_bytes(), True))
            n_asset += 1
    log(f'{n_asset} file web negli asset')

    non_firmato = BUILD / 'non-firmato.apk'
    scrivi_zip(non_firmato, voci)
    controlla_allineamento(non_firmato)

    key_pass = os.environ.get('CODEFORGE_KEY_PASS')
    if not key_pass and KEY_PROPS.exists():
        key_pass = KEY_PROPS.read_text().strip().split('=', 1)[1]
    if not KEYSTORE.exists():
        import secrets
        key_pass = key_pass or secrets.token_urlsafe(18)
        KEY_PROPS.write_text('password=' + key_pass + '\n')
        os.chmod(KEY_PROPS, 0o600)
        log('creazione della chiave di firma (una sola volta): conserva apk/codeforge-release.p12 e apk/keystore.properties')
        run(['keytool', '-genkeypair', '-keystore', str(KEYSTORE), '-storetype', 'PKCS12', '-alias', KEY_ALIAS,
             '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000', '-storepass', key_pass, '-keypass', key_pass,
             '-dname', 'CN=CodeForge, OU=Didattica, O=CodeForge, L=Roma, C=IT'])

    if not key_pass:
        raise SystemExit('password della chiave mancante: imposta CODEFORGE_KEY_PASS o apk/keystore.properties')
    log('firma (schema v2)')
    strumenti = BUILD / 'tools'
    strumenti.mkdir()
    run(['javac', '-nowarn', '-cp', str(apksig_jar), '-d', str(strumenti), str(APK / 'tools' / 'Firma.java')])
    DIST.mkdir(exist_ok=True)
    finale = DIST / 'CodeForge.apk'
    # apksig 2.3 usa classi interne del JDK (sun.security.*): vanno esportate esplicitamente.
    esporta = [a for m in ('sun.security.x509', 'sun.security.pkcs', 'sun.security.util')
               for a in ('--add-exports', f'java.base/{m}=ALL-UNNAMED')]
    out = run(['java'] + esporta + ['-cp', f'{strumenti}{os.pathsep}{apksig_jar}', 'Firma', str(non_firmato), str(finale),
               str(KEYSTORE), KEY_ALIAS, key_pass, str(MIN_SDK)])
    print(out.strip())
    controlla_allineamento(finale)
    log(f'APK pronto: {finale.relative_to(ROOT)} ({finale.stat().st_size / 1024:.0f} KB)')


if __name__ == '__main__':
    main()
