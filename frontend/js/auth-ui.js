(() => {
  const API_BASE = `${window.location.origin}/api`;

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
  }

  async function apiJson(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const text = await res.text();
    const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
    if (!res.ok) {
      const msg = typeof data === "string" ? data : (data?.message || "Request failed");
      throw new Error(msg);
    }
    return data;
  }

  function afterAuthSuccess(user) {
    setCurrentUser(user);
    const role = user && user.role;
    if (role === "CLIENT" || role == null) {
      window.location.href = "espace-client.html";
    } else {
      window.location.href = "index.html";
    }
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
        ? `
          <a href="espace-client.html" class="ve-cta-btn" style="margin-right:10px;">Mon crédit</a>
          <a href="http://localhost:4200/espace-client#remboursements" class="ve-cta-btn" style="margin-right:10px;">Remboursements</a>
        `
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
        const user = await apiJson("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        afterAuthSuccess(user);
      } catch (err) {
        if (msg) msg.textContent = err.message || "Login failed";
      }
    });

    initOAuthOnLoginPage(msg);
  }

  /** Même endpoint que la connexion : crée le compte Google s’il n’existe pas encore. */
  function initGoogleSignInButton(googleHost, msg) {
    if (!googleHost) return;
    const cid =
      typeof window.FINANCIA_GOOGLE_CLIENT_ID === "string"
        ? window.FINANCIA_GOOGLE_CLIENT_ID.trim()
        : "";

    if (cid) {
      let n = 0;
      const timer = setInterval(() => {
        n++;
        const g = window.google?.accounts?.id;
        if (g) {
          clearInterval(timer);
          g.initialize({
            client_id: cid,
            callback: (res) => {
              apiJson("/auth/google", {
                method: "POST",
                body: JSON.stringify({ idToken: res.credential }),
              })
                .then(afterAuthSuccess)
                .catch((err) => {
                  if (msg) msg.textContent = err.message || "Google sign-in failed";
                });
            },
          });
          g.renderButton(googleHost, { theme: "outline", size: "large", width: 320 });
        } else if (n > 80) clearInterval(timer);
      }, 100);
    } else {
      googleHost.innerHTML =
        '<p style="font-size:12px;color:#64748b;margin:0;line-height:1.4;">Renseignez <code>window.FINANCIA_GOOGLE_CLIENT_ID</code> dans login.html / register.html (identique à <code>google.oauth.client-id</code> dans Spring).</p>';
    }
  }

  function initOAuthOnLoginPage(msg) {
    const googleHost = document.getElementById("google-signin-button");
    const faceBtn = document.getElementById("ve-face-login-btn");
    const faceFile = document.getElementById("ve-face-file");
    const form = document.getElementById("ve-login-form");

    initGoogleSignInButton(googleHost, msg);

    if (faceBtn && faceFile && form) {
      faceBtn.addEventListener("click", () => {
        const email = form.querySelector("input[name='email']")?.value?.trim();
        if (!email) {
          if (msg) msg.textContent = "Indiquez votre e-mail pour Face ID.";
          return;
        }
        faceFile.click();
      });
      faceFile.addEventListener("change", (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        const email = form.querySelector("input[name='email']")?.value?.trim();
        if (!email) return;
        const reader = new FileReader();
        reader.onload = () => {
          apiJson("/auth/face-login", {
            method: "POST",
            body: JSON.stringify({ email, imageBase64: reader.result }),
          })
            .then(afterAuthSuccess)
            .catch((err) => {
              if (msg) msg.textContent = err.message || "Face login failed";
            });
        };
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

      try {
        const user = await apiJson("/auth/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        afterAuthSuccess(user);
      } catch (err) {
        if (msg) msg.textContent = err.message || "Register failed";
      }
    });

    const googleRegisterHost = document.getElementById("google-signin-button-register");
    initGoogleSignInButton(googleRegisterHost, msg);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderAuthArea();
    updateHeroAuthButtons();
    handleLoginForm();
    handleRegisterForm();
  });

  window.FinanciaAuth = {
    API_BASE,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    apiJson,
    renderAuthArea,
    updateHeroAuthButtons,
  };
})();

