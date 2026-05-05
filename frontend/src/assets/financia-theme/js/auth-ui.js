(() => {
  const API_BASE = `${window.location.origin}/api`;
  const TOKEN_KEY = "financia.jwt";

  function getToken() {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      return t && t.trim() ? t.trim() : null;
    } catch {
      return null;
    }
  }

  function setToken(token) {
    if (token && String(token).trim()) {
      localStorage.setItem(TOKEN_KEY, String(token).trim());
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem("financia.currentUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem("financia.currentUser", JSON.stringify(user));
  }

  function clearCurrentUser() {
    localStorage.removeItem("financia.currentUser");
    localStorage.removeItem(TOKEN_KEY);
  }

  function authHeaders(extra = {}) {
    const t = getToken();
    const h = { "Content-Type": "application/json", ...extra };
    if (t) h.Authorization = `Bearer ${t}`;
    return h;
  }

  /**
   * Réponse backend : { token, user, profileIncomplete } ou anciennement seulement l'objet user.
   */
  function normalizeAuthPayload(data) {
    if (data && typeof data === "object" && "user" in data && data.user) {
      return {
        token: data.token || null,
        user: data.user,
        profileIncomplete: Boolean(data.profileIncomplete),
      };
    }
    if (data && typeof data === "object" && "idUser" in data) {
      return { token: null, user: data, profileIncomplete: false };
    }
    return { token: null, user: null, profileIncomplete: false };
  }

  function finishLoginRedirect(role) {
    if (role === "CLIENT" || role == null) {
      window.location.href = "espace-client.html";
    } else {
      window.location.href = "index.html";
    }
  }

  /**
   * Après login / Google / Face : si profil incomplet sur login ou register, affiche le formulaire.
   */
  function openCompleteProfileAfterOAuth(user, onDone) {
    const root = document.createElement("div");
    root.className = "ve-oauth-profile-modal";
    root.innerHTML = `
      <div class="ve-oauth-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="ve-oauth-profile-title">
        <h3 id="ve-oauth-profile-title" class="ve-oauth-profile-title">Complétez votre profil</h3>
        <p class="ve-oauth-profile-intro">Ces informations manquent pour votre compte (ex. connexion Google). Les champs ci-dessous sont requis pour continuer.</p>
        <p class="ve-oauth-profile-note">La connexion se fait avec <strong>Google</strong> : le mot de passe ci-dessous est <strong>facultatif</strong> (pour vous connecter aussi par e-mail + mot de passe).</p>
        <p id="ve-oauth-profile-err" class="ve-oauth-profile-err" style="display:none;"></p>
        <form id="ve-oauth-profile-form" class="ve-contact-form">
          <div class="ve-form-group">
            <label>E-mail</label>
            <input name="email" type="email" readonly class="ve-oauth-profile-readonly">
          </div>
          <div class="ve-form-row">
            <div class="ve-form-group">
              <label>Prénom</label>
              <input name="firstName" type="text" readonly class="ve-oauth-profile-readonly">
            </div>
            <div class="ve-form-group">
              <label>Nom</label>
              <input name="lastName" type="text" readonly class="ve-oauth-profile-readonly">
            </div>
          </div>
          <div class="ve-form-group">
            <label>Téléphone <span class="ve-req">*</span></label>
            <input name="phone" type="tel" required autocomplete="tel" placeholder="+216 …">
          </div>
          <div class="ve-form-group">
            <label>Revenu mensuel (€) <span class="ve-req">*</span></label>
            <input name="monthlyIncome" type="number" min="0" step="0.01" required placeholder="Ex. 1500">
          </div>
          <div class="ve-form-group">
            <label>Adresse (optionnel)</label>
            <input name="address" type="text" placeholder="Ville, rue…">
          </div>
          <div class="ve-form-row">
            <div class="ve-form-group">
              <label>Mot de passe Financia (optionnel)</label>
              <input name="newPassword" type="password" autocomplete="new-password" placeholder="Min. 8 caractères">
            </div>
            <div class="ve-form-group">
              <label>Confirmer le mot de passe</label>
              <input name="confirmPassword" type="password" autocomplete="new-password">
            </div>
          </div>
          <div class="ve-oauth-profile-actions">
            <button type="submit" class="ve-btn-primary">Enregistrer et continuer</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(root);
    const f = root.querySelector("#ve-oauth-profile-form");
    const err = root.querySelector("#ve-oauth-profile-err");
    if (!f) return;
    f.querySelector("input[name='email']").value = user.email || "";
    f.querySelector("input[name='firstName']").value = user.firstName || "";
    f.querySelector("input[name='lastName']").value = user.lastName || "";
    if (user.phone && !String(user.phone).startsWith("GOOGLE:") && !String(user.phone).startsWith("g-")) {
      f.querySelector("input[name='phone']").value = user.phone;
    }
    if (user.monthlyIncome != null && user.monthlyIncome !== "") {
      f.querySelector("input[name='monthlyIncome']").value = String(user.monthlyIncome);
    }
    if (user.address) {
      f.querySelector("input[name='address']").value = user.address;
    }
    root.addEventListener("click", (ev) => {
      if (ev.target === root) {
        /* clic sur fond : ne pas fermer pour forcer la complétion */
      }
    });
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (err) {
        err.style.display = "none";
        err.textContent = "";
      }
      const phone = f.querySelector("input[name='phone']")?.value?.trim() || "";
      const incomeRaw = f.querySelector("input[name='monthlyIncome']")?.value?.trim() || "";
      const incomeNum = Number(incomeRaw);
      const address = f.querySelector("input[name='address']")?.value?.trim() || "";
      const np = f.querySelector("input[name='newPassword']")?.value || "";
      const cp = f.querySelector("input[name='confirmPassword']")?.value || "";
      if (!phone) {
        if (err) {
          err.style.display = "block";
          err.textContent = "Indiquez votre téléphone.";
        }
        return;
      }
      if (!incomeRaw || !Number.isFinite(incomeNum) || incomeNum < 0) {
        if (err) {
          err.style.display = "block";
          err.textContent = "Indiquez un revenu mensuel valide (≥ 0).";
        }
        return;
      }
      if (np || cp) {
        if (np !== cp) {
          if (err) {
            err.style.display = "block";
            err.textContent = "Les mots de passe ne correspondent pas.";
          }
          return;
        }
        if (np.length < 8) {
          if (err) {
            err.style.display = "block";
            err.textContent = "Le mot de passe doit faire au moins 8 caractères.";
          }
          return;
        }
      }
      const body = { phone, monthlyIncome: incomeNum };
      if (address) body.address = address;
      if (np) body.newPassword = np;
      try {
        const updated = await apiJson("/auth/me", { method: "POST", body: JSON.stringify(body) });
        setCurrentUser(updated);
        root.remove();
        if (typeof onDone === "function") onDone();
      } catch (ex) {
        if (err) {
          err.style.display = "block";
          err.textContent = ex.message || "Erreur";
        }
      }
    });
  }

  function proceedAfterLogin(session) {
    const n = normalizeAuthPayload(session);
    const user = n.user;
    const token = n.token;
    if (!user) return;
    if (token) setToken(token);
    setCurrentUser(user);
    const incomplete = n.profileIncomplete === true;
    const role = user.role;
    const path = window.location.pathname || "";
    const onAuthPage = /login\.html/i.test(path) || /register\.html/i.test(path);
    if (incomplete && onAuthPage) {
      openCompleteProfileAfterOAuth(user, () => finishLoginRedirect(role));
      return;
    }
    finishLoginRedirect(role);
  }

  async function apiJson(path, options = {}) {
    const useAuth = options.auth !== false;
    const { auth: _auth, headers: optHeaders, ...rest } = options;
    const res = await fetch(`${API_BASE}${path}`, {
      headers: useAuth ? authHeaders(optHeaders || {}) : { "Content-Type": "application/json", ...(optHeaders || {}) },
      ...rest,
    });
    const text = await res.text();
    const data =
      text && text.trim()
        ? (() => {
            try {
              return JSON.parse(text);
            } catch {
              return text;
            }
          })()
        : null;
    if (res.status === 204 || res.status === 205) {
      return null;
    }
    if (!res.ok) {
      const msg =
        typeof data === "string"
          ? data
          : data?.message || data?.error || data?.title || "Request failed";
      throw new Error(msg);
    }
    return data;
  }

  function updateHeroAuthButtons() {
    const guest = document.getElementById("ve-hero-guest-btns");
    const logged = document.getElementById("ve-hero-user-btns");
    if (!guest || !logged) return;
    const user = getCurrentUser();
    if (user) {
      guest.style.display = "none";
      logged.style.display = "";
    } else {
      guest.style.display = "";
      logged.style.display = "none";
    }
  }

  function renderAuthArea() {
    const mount = document.getElementById("ve-auth-area");
    if (!mount) return;

    const user = getCurrentUser();
    if (!user) {
      mount.innerHTML = `
        <a href="login.html" class="ve-cta-btn" style="margin-right:10px;">Login</a>
        <a href="register.html" class="ve-btn-primary">Register</a>
      `;
      updateHeroAuthButtons();
      return;
    }

    const name = (user.firstName || user.email || "User");
    const creditLink =
      !user.role || user.role === "CLIENT"
        ? `<a href="espace-client.html" class="ve-cta-btn" style="margin-right:10px;">Demande crédit</a>`
        : "";
    mount.innerHTML = `
      ${creditLink}
      <span style="color:#fff; margin-right:12px;">Bonjour, <strong>${escapeHtml(name)}</strong></span>
      <a href="#" id="ve-logout" class="ve-cta-btn">Logout</a>
    `;
    const btn = document.getElementById("ve-logout");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        clearCurrentUser();
        window.location.href = "index.html";
      });
    }
    updateHeroAuthButtons();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function handleLoginForm() {
    const form = document.getElementById("ve-login-form");
    if (!form) return;

    const msg = document.getElementById("ve-auth-msg");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msg) msg.textContent = "";

      const email = form.querySelector("input[name='email']").value.trim();
      const password = form.querySelector("input[name='password']").value;

      try {
        const session = await apiJson("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
          auth: false,
        });
        proceedAfterLogin(session);
      } catch (err) {
        if (msg) msg.textContent = err.message || "Login failed";
      }
    });

    initOAuthOnLoginPage(msg);
  }

  /** Attend l’API Google (script GSI) — injecte le script si absent (ex. cache HTML ancien avec async). */
  function waitForGoogleAccountsId(timeoutMs = 20000) {
    if (window.google?.accounts?.id) {
      return Promise.resolve(window.google.accounts.id);
    }
    const hasScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (!hasScript) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      document.head.appendChild(s);
    }
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + timeoutMs;
      const t = setInterval(() => {
        const g = window.google?.accounts?.id;
        if (g) {
          clearInterval(t);
          resolve(g);
        } else if (Date.now() > deadline) {
          clearInterval(t);
          reject(
            new Error(
              "Google Sign-In indisponible : vérifiez la connexion, les bloqueurs, et que cette origine est autorisée dans Google Cloud Console (OAuth → origines JavaScript)."
            )
          );
        }
      }, 50);
    });
  }

  /** Même endpoint que la connexion : crée le compte Google s’il n’existe pas encore. */
  function initGoogleSignInButton(googleHost, msg) {
    if (!googleHost) return;
    const cid =
      typeof window.FINANCIA_GOOGLE_CLIENT_ID === "string"
        ? window.FINANCIA_GOOGLE_CLIENT_ID.trim()
        : "";

    if (!cid) {
      googleHost.innerHTML =
        '<p class="ve-google-err">Renseignez <code>window.FINANCIA_GOOGLE_CLIENT_ID</code> dans login.html / register.html (identique à <code>google.oauth.client-id</code> dans Spring).</p>';
      return;
    }

    waitForGoogleAccountsId()
      .then((g) => {
        googleHost.textContent = "";
        g.initialize({
          client_id: cid,
          callback: (res) => {
            const cred = res?.credential;
            if (!cred) return;
            apiJson("/auth/google", {
              method: "POST",
              body: JSON.stringify({ idToken: cred }),
              auth: false,
            })
              .then((d) => proceedAfterLogin(d))
              .catch((err) => {
                if (msg) msg.textContent = err.message || "Google sign-in failed";
              });
          },
          auto_select: false,
        });
        const w = Math.min(400, Math.max(240, googleHost.offsetWidth || 320));
        g.renderButton(googleHost, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: w,
          text: "signin_with",
          locale: "fr",
        });
      })
      .catch((err) => {
        googleHost.innerHTML = `<p class="ve-google-err">${escapeHtml(err.message || "Google indisponible.")}</p>`;
        if (msg) msg.textContent = err.message || "Google indisponible.";
      });
  }

  function submitFaceLogin(email, imageBase64, msg) {
    return apiJson("/auth/face-login", {
      method: "POST",
      body: JSON.stringify({ email, imageBase64 }),
      auth: false,
    })
      .then((d) => proceedAfterLogin(d))
      .catch((err) => {
        if (msg) msg.textContent = err.message || "Face login failed";
      });
  }

  function initOAuthOnLoginPage(msg) {
    const googleHost = document.getElementById("google-signin-button");
    const faceBtn = document.getElementById("ve-face-login-btn");
    const faceFileBtn = document.getElementById("ve-face-file-btn");
    const faceFile = document.getElementById("ve-face-file");
    const form = document.getElementById("ve-login-form");

    initGoogleSignInButton(googleHost, msg);

    function readEmail() {
      return form?.querySelector("input[name='email']")?.value?.trim() || "";
    }

    function openFaceCamera() {
      const email = readEmail();
      if (!email) {
        if (msg) msg.textContent = "Indiquez votre e-mail pour Face ID.";
        return;
      }
      if (msg) msg.textContent = "";
      const Cam = window.FinanciaFaceCamera;
      if (Cam && typeof Cam.open === "function") {
        Cam.open({
          title: "Face ID — connexion",
          onCapture: (dataUrl) => submitFaceLogin(email, dataUrl, msg),
          onPickFile: () => faceFile?.click(),
        });
        return;
      }
      if (msg) {
        msg.textContent =
          "Module caméra indisponible. Chargez face-camera.js ou utilisez « fichier ».";
      }
      faceFile?.click();
    }

    if (faceBtn && faceFile && form) {
      faceBtn.addEventListener("click", openFaceCamera);
    }
    if (faceFileBtn && faceFile && form) {
      faceFileBtn.addEventListener("click", () => {
        const email = readEmail();
        if (!email) {
          if (msg) msg.textContent = "Indiquez votre e-mail pour Face ID.";
          return;
        }
        if (msg) msg.textContent = "";
        faceFile.click();
      });
    }
    if (faceFile && form) {
      faceFile.addEventListener("change", (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        const email = readEmail();
        if (!email) return;
        const reader = new FileReader();
        reader.onload = () => submitFaceLogin(email, reader.result, msg);
        reader.readAsDataURL(f);
      });
    }
  }

  async function handleRegisterForm() {
    const form = document.getElementById("ve-register-form");
    if (!form) return;

    const msg = document.getElementById("ve-auth-msg");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msg) msg.textContent = "";

      const faceInput = document.getElementById("ve-register-face");

      const incomeEl = form.querySelector("input[name='monthlyIncome']");
      const incomeRaw = incomeEl ? incomeEl.value.trim() : "";
      const incomeNum = incomeRaw === "" ? null : Number(incomeRaw);
      if (incomeRaw !== "" && (incomeNum == null || !Number.isFinite(incomeNum) || incomeNum < 0)) {
        if (msg) msg.textContent = "Monthly income must be a valid number ≥ 0, or leave empty.";
        return;
      }
      const monthlyIncome =
        incomeNum != null && Number.isFinite(incomeNum) && incomeNum >= 0 ? incomeNum : null;

      const payload = {
        firstName: form.querySelector("input[name='firstName']").value.trim(),
        lastName: form.querySelector("input[name='lastName']").value.trim(),
        email: form.querySelector("input[name='email']").value.trim(),
        password: form.querySelector("input[name='password']").value,
        phone: form.querySelector("input[name='phone']").value.trim(),
        address: form.querySelector("input[name='address']").value.trim(),
        role: "CLIENT",
        monthlyIncome,
      };

      if (faceInput && faceInput.files && faceInput.files[0]) {
        const b64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = () => reject(new Error("Impossible de lire la photo."));
          r.readAsDataURL(faceInput.files[0]);
        });
        payload.facePhotoBase64 = b64;
      }

      try {
        const session = await apiJson("/auth/register", {
          method: "POST",
          body: JSON.stringify(payload),
          auth: false,
        });
        proceedAfterLogin(session);
      } catch (err) {
        if (msg) msg.textContent = err.message || "Register failed";
      }
    });

    const googleRegisterHost = document.getElementById("google-signin-button-register");
    initGoogleSignInButton(googleRegisterHost, msg);
  }

  function initRegisterFaceCamera() {
    const btn = document.getElementById("ve-register-face-camera");
    const faceInput = document.getElementById("ve-register-face");
    const Cam = window.FinanciaFaceCamera;
    if (!btn || !faceInput || !Cam || typeof Cam.open !== "function") return;
    btn.addEventListener("click", () => {
      Cam.open({
        title: "Photo visage — inscription",
        onCapture: async (dataUrl) => {
          try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" });
            const dt = new DataTransfer();
            dt.items.add(file);
            faceInput.files = dt.files;
            faceInput.dispatchEvent(new Event("change", { bubbles: true }));
          } catch {
            /* ignore */
          }
        },
        onPickFile: () => faceInput.click(),
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderAuthArea();
    updateHeroAuthButtons();
    handleLoginForm();
    handleRegisterForm();
    initRegisterFaceCamera();
  });

  window.FinanciaAuth = {
    API_BASE,
    TOKEN_KEY,
    getToken,
    setToken,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    authHeaders,
    apiJson,
    renderAuthArea,
    updateHeroAuthButtons,
  };
})();

