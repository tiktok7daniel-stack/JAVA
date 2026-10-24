import com.android.apksig.ApkSigner;
import com.android.apksig.ApkVerifier;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.Collections;

/** Firma un APK con lo schema v2 (apksig) e verifica il risultato. */
public class Firma {

    public static void main(String[] args) throws Exception {
        if (args.length != 6) {
            System.err.println("uso: Firma <input.apk> <output.apk> <keystore.p12> <alias> <password> <minSdk>");
            System.exit(2);
        }
        char[] password = args[4].toCharArray();
        KeyStore ks = KeyStore.getInstance("PKCS12");
        try (InputStream in = new FileInputStream(args[2])) {
            ks.load(in, password);
        }
        PrivateKey chiave = (PrivateKey) ks.getKey(args[3], password);
        X509Certificate cert = (X509Certificate) ks.getCertificate(args[3]);
        ApkSigner.SignerConfig firmatario =
                new ApkSigner.SignerConfig.Builder("CODEFORG", chiave, Collections.singletonList(cert)).build();
        File output = new File(args[1]);
        new ApkSigner.Builder(Collections.singletonList(firmatario))
                .setInputApk(new File(args[0]))
                .setOutputApk(output)
                .setMinSdkVersion(Integer.parseInt(args[5]))
                .setV1SigningEnabled(false) // minSdk 24: lo schema v2 è sufficiente
                .setV2SigningEnabled(true)
                .setCreatedBy("CodeForge build")
                .build()
                .sign();

        ApkVerifier.Result esito = new ApkVerifier.Builder(output).build().verify();
        System.out.println("verificato=" + esito.isVerified()
                + " v1=" + esito.isVerifiedUsingV1Scheme()
                + " v2=" + esito.isVerifiedUsingV2Scheme());
        for (Object e : esito.getErrors()) {
            System.out.println("ERRORE: " + e);
        }
        for (Object w : esito.getWarnings()) {
            System.out.println("avviso: " + w);
        }
        if (!esito.isVerified()) {
            System.exit(1);
        }
    }
}
