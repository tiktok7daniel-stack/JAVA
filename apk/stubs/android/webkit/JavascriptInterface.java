package android.webkit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Stub solo per la compilazione: android.jar (API 16) non contiene l'annotazione,
 * aggiunta in API 17. Non finisce nel dex: a runtime si usa quella del framework.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface JavascriptInterface {
}
