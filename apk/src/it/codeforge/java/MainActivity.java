package it.codeforge.java;

import android.app.Activity;
import android.content.Intent;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.lang.reflect.Method;
import java.util.Locale;

/**
 * CodeForge — guscio Android: un WebView a schermo intero che carica l'app web
 * dagli asset (funziona offline) e offre la sintesi vocale nativa al JavaScript.
 */
public class MainActivity extends Activity {

    private static final int SFONDO = 0xFF070A10;
    private static final String PAGINA = "file:///android_asset/www/index.html";

    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsPronto = false;

    @Override
    protected void onCreate(Bundle stato) {
        super.onCreate(stato);
        Window finestra = getWindow();
        finestra.setBackgroundDrawable(new ColorDrawable(SFONDO));
        coloraBarreDiSistema(finestra);

        web = new WebView(this);
        web.setBackgroundColor(SFONDO);
        web.setVerticalScrollBarEnabled(false);
        WebSettings impostazioni = web.getSettings();
        impostazioni.setJavaScriptEnabled(true);
        impostazioni.setDomStorageEnabled(true);
        impostazioni.setDatabaseEnabled(true);
        impostazioni.setAllowFileAccess(true);
        impostazioni.setSupportZoom(false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView vista, String url) {
                if (url.startsWith("file:")) {
                    return false;
                }
                // I link esterni si aprono nel browser.
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (RuntimeException e) {
                    // nessuna app in grado di aprire il link
                }
                return true;
            }
        });
        web.addJavascriptInterface(new PonteNativo(), "CodeForgeNative");

        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int esito) {
                ttsPronto = esito == TextToSpeech.SUCCESS;
            }
        });

        setContentView(web);
        if (stato == null || web.restoreState(stato) == null) {
            web.loadUrl(PAGINA);
        }
    }

    /** Barra di stato e di navigazione scure (API 21+), tramite riflessione per compatibilità. */
    private void coloraBarreDiSistema(Window finestra) {
        if (Build.VERSION.SDK_INT < 21) {
            return;
        }
        try {
            finestra.addFlags(0x80000000); // FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS
            Method stato = Window.class.getMethod("setStatusBarColor", int.class);
            Method navigazione = Window.class.getMethod("setNavigationBarColor", int.class);
            stato.invoke(finestra, SFONDO);
            navigazione.invoke(finestra, SFONDO);
        } catch (Exception e) {
            // colori predefiniti del sistema
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle stato) {
        super.onSaveInstanceState(stato);
        web.saveState(stato);
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onPause() {
        if (tts != null) {
            tts.stop();
        }
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) {
            tts.shutdown();
        }
        if (web != null) {
            web.destroy();
        }
        super.onDestroy();
    }

    /** Metodi esposti al JavaScript come window.CodeForgeNative. */
    private final class PonteNativo {

        @JavascriptInterface
        public void speak(String testo, String lingua) {
            if (!ttsPronto || testo == null) {
                return;
            }
            Locale locale = lingua != null && lingua.startsWith("ar") ? new Locale("ar") : Locale.ITALIAN;
            int esito = tts.setLanguage(locale);
            if (esito == TextToSpeech.LANG_MISSING_DATA || esito == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts.setLanguage(Locale.getDefault());
            }
            tts.setSpeechRate(0.95f);
            tts.speak(testo, TextToSpeech.QUEUE_FLUSH, null);
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) {
                tts.stop();
            }
        }

        @JavascriptInterface
        public boolean disponibile() {
            return ttsPronto;
        }
    }
}
