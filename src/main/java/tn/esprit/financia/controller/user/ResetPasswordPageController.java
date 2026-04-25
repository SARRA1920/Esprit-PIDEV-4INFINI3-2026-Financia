package tn.esprit.financia.controller.user;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sert la page HTML de réinitialisation du mot de passe.
 * Le lien dans l'email pointe vers ce contrôleur (ex. http://localhost:8083/f/reset-password).
 * Fonctionne sur PC (localhost) et mobile (IP du PC sur le réseau).
 */
@RestController
public class ResetPasswordPageController {

    @GetMapping(value = "/reset-password", produces = MediaType.TEXT_HTML_VALUE)
    public String resetPasswordPage(@RequestParam(required = false) String token) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Réinitialiser le mot de passe - Financia</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f4f8; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
                    .card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 32px; max-width: 400px; width: 100%; }
                    h1 { font-size: 1.5rem; color: #1a1a2e; margin-bottom: 8px; }
                    .subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 24px; }
                    label { display: block; font-weight: 500; color: #334155; margin-bottom: 6px; font-size: 0.9rem; }
                    input { width: 100%; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; margin-bottom: 16px; }
                    input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
                    button { width: 100%; padding: 14px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
                    button:hover { background: #2563eb; }
                    button:disabled { background: #94a3b8; cursor: not-allowed; }
                    .error { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 16px; display: none; }
                    .success { background: #f0fdf4; color: #16a34a; padding: 12px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 16px; display: none; }
                    .token-missing { background: #fef3c7; color: #b45309; padding: 12px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 16px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Nouveau mot de passe</h1>
                    <p class="subtitle">Choisissez un mot de passe sécurisé</p>
                    
                    <div id="tokenMissing" class="token-missing" style="display:none">
                        Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.
                    </div>
                    
                    <div id="error" class="error"></div>
                    <div id="success" class="success"></div>
                    
                    <form id="form" style="display:none">
                        <label for="password">Nouveau mot de passe</label>
                        <input type="password" id="password" name="password" minlength="6" required placeholder="••••••••">
                        <label for="confirm">Confirmer le mot de passe</label>
                        <input type="password" id="confirm" name="confirm" minlength="6" required placeholder="••••••••">
                        <button type="submit" id="btn">Réinitialiser</button>
                    </form>
                </div>
                <script>
                    const params = new URLSearchParams(window.location.search);
                    const token = params.get('token');
                    const form = document.getElementById('form');
                    const tokenMissing = document.getElementById('tokenMissing');
                    const errorDiv = document.getElementById('error');
                    const successDiv = document.getElementById('success');
                    
                    if (!token) {
                        tokenMissing.style.display = 'block';
                    } else {
                        form.style.display = 'block';
                    }
                    
                    form.onsubmit = async (e) => {
                        e.preventDefault();
                        const password = document.getElementById('password').value;
                        const confirm = document.getElementById('confirm').value;
                        const btn = document.getElementById('btn');
                        
                        if (password.length < 6) {
                            errorDiv.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
                            errorDiv.style.display = 'block';
                            successDiv.style.display = 'none';
                            return;
                        }
                        if (password !== confirm) {
                            errorDiv.textContent = 'Les mots de passe ne correspondent pas.';
                            errorDiv.style.display = 'block';
                            successDiv.style.display = 'none';
                            return;
                        }
                        
                        btn.disabled = true;
                        errorDiv.style.display = 'none';
                        
                        try {
                            const path = window.location.pathname || '';
                            const m = path.match(/^(\\/[^/]+)\\/reset-password/);
                            const ctx = m ? m[1] : '/f';
                            const apiUrl = window.location.origin + ctx + '/api/auth/reset-password';
                            const res = await fetch(apiUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token: token, newPassword: password })
                            });
                            let data = {};
                            try { data = await res.json(); } catch (_) {}
                            if (res.ok) {
                                successDiv.textContent = (data && data.message) ? data.message : 'Mot de passe mis à jour ! Vous pouvez vous connecter.';
                                successDiv.style.display = 'block';
                                form.style.display = 'none';
                            } else {
                                errorDiv.textContent = (data && data.message) ? data.message : 'Erreur lors de la réinitialisation.';
                                errorDiv.style.display = 'block';
                                btn.disabled = false;
                            }
                        } catch (err) {
                            errorDiv.textContent = 'Erreur de connexion. Vérifiez que le serveur est accessible.';
                            errorDiv.style.display = 'block';
                            btn.disabled = false;
                        }
                    };
                </script>
            </body>
            </html>
            """;
    }
}
