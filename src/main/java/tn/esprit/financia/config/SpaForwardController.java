package tn.esprit.financia.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Lorsque l’interface Angular est servie depuis Spring (dossier {@code frontend/} ou resources static),
 * une navigation directe vers une route client (ex. {@code /f/formation}) ne correspond à aucun fichier :
 * Spring renvoie alors une erreur 404 HTML. On renvoie {@code index.html} pour laisser le routeur Angular
 * afficher la bonne vue.
 * <p>
 * Pour le développement pur Angular, utilisez {@code ng serve} sur le port 4200 (sans préfixe {@code /f} dans l’URL).
 */
@Controller
public class SpaForwardController {

    @GetMapping({
            "/formation",
            "/formation/**",
            "/services",
            "/about",
            "/contact",
            "/login",
            "/register",
            "/espace-client",
            "/admin",
            "/admin/**"
    })
    public String forwardAngularSpa() {
        return "forward:/index.html";
    }
}
