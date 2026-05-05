(() => {
  function show(el, html, isError) {
    if (!el) return;
    el.innerHTML = html;
    el.style.display = "block";
    el.style.color = isError ? "#fecaca" : "#bbf7d0";
    el.style.background = isError ? "rgba(127,29,29,0.35)" : "rgba(21,128,61,0.25)";
    el.style.borderRadius = "8px";
    el.style.padding = "12px 14px";
    el.style.marginTop = "12px";
  }

  function fmtMoney(n) {
    if (n == null || n === "") return "—";
    const x = typeof n === "number" ? n : Number(n);
    if (!Number.isFinite(x)) return String(n);
    return x.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function statusLabel(status) {
    const s = String(status || "").toUpperCase();
    const map = {
      PENDING: "En attente de décision",
      APPROVED: "Approuvé",
      ACTIVE: "En cours de remboursement",
      REJECTED: "Refusé",
      CLOSED: "Clôturé",
    };
    return map[s] || (status ? String(status) : "—");
  }

  function renderBlockingPanel(credit) {
    const st = statusLabel(credit.status);
    return `
      <div class="ve-credit-summary">
        <span class="ve-section-tag">Dossier en cours</span>
        <h2 style="color:#78350f;margin:0.5rem 0 0.35rem;font-size:1.45rem;">Votre crédit</h2>
        <p style="color:#92400e;line-height:1.55;margin:0 0 1rem;font-size:0.95rem;">
          Vous avez déjà un dossier ouvert. Une nouvelle demande sera possible lorsque celui-ci sera
          <strong>soldé</strong> ou <strong>clôturé</strong>.
        </p>
        <div class="ve-credit-status-row">
          <span class="ve-credit-status-lbl">Statut</span>
          <span class="ve-credit-status-pill">${st}</span>
        </div>
        <div class="ve-credit-metrics">
          <div class="ve-credit-metric">
            <span class="ve-credit-metric-lbl">Montant emprunté</span>
            <span class="ve-credit-metric-val">${fmtMoney(credit.amount)}<span class="ve-credit-metric-unit">&nbsp;€</span></span>
          </div>
          <div class="ve-credit-metric">
            <span class="ve-credit-metric-lbl">Durée</span>
            <span class="ve-credit-metric-val">${fmt(credit.durationMonths)}<span class="ve-credit-metric-unit">&nbsp;mois</span></span>
          </div>
          <div class="ve-credit-metric ve-credit-metric--primary">
            <span class="ve-credit-metric-lbl">Reste à payer</span>
            <span class="ve-credit-metric-val">${fmtMoney(credit.remainingAmount)}<span class="ve-credit-metric-unit">&nbsp;€</span></span>
          </div>
        </div>
      </div>
    `;
  }

  function fmt(v) {
    if (v == null) return "—";
    if (typeof v === "number") return String(v);
    return String(v);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#039;");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const Fin = window.FinanciaAuth;
    if (!Fin) return;

    const user = Fin.getCurrentUser();
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    if (user.role && user.role !== "CLIENT") {
      window.location.href = "index.html";
      return;
    }

    const token = Fin.getToken && Fin.getToken();

    const greet = document.getElementById("ve-client-greet");
    if (greet) {
      const n = user.firstName || user.email || "Client";
      greet.textContent = `Bonjour, ${n}`;
    }

    const profilePanel = document.getElementById("ve-profile-panel");
    const profileForm = document.getElementById("ve-profile-form");
    const profileMsg = document.getElementById("ve-profile-msg");
    if (profilePanel && profileForm && token) {
      profilePanel.style.display = "block";
      const phoneIn = profileForm.querySelector("input[name='phone']");
      const incomeIn = profileForm.querySelector("input[name='monthlyIncome']");
      if (phoneIn) {
        const p = user.phone || "";
        phoneIn.value = String(p).startsWith("GOOGLE:") ? "" : p;
      }
      if (incomeIn && user.monthlyIncome != null && user.monthlyIncome !== "") {
        incomeIn.value = String(user.monthlyIncome);
      }
      profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (profileMsg) {
          profileMsg.style.display = "none";
          profileMsg.textContent = "";
        }
        const phone = profileForm.querySelector("input[name='phone']")?.value?.trim() || "";
        const incomeRaw = profileForm.querySelector("input[name='monthlyIncome']")?.value?.trim() || "";
        const incomeNum = incomeRaw === "" ? null : Number(incomeRaw);
        if (!phone && incomeRaw === "") {
          if (profileMsg) {
            profileMsg.style.display = "block";
            profileMsg.style.color = "#fecaca";
            profileMsg.style.background = "rgba(127,29,29,0.2)";
            profileMsg.textContent = "Indiquez au moins un téléphone ou un revenu mensuel.";
          }
          return;
        }
        if (incomeRaw !== "" && (incomeNum == null || !Number.isFinite(incomeNum) || incomeNum < 0)) {
          if (profileMsg) {
            profileMsg.style.display = "block";
            profileMsg.style.color = "#fecaca";
            profileMsg.style.background = "rgba(127,29,29,0.2)";
            profileMsg.textContent = "Revenu invalide (nombre ≥ 0 ou laissez vide).";
          }
          return;
        }
        const body = {};
        if (phone) body.phone = phone;
        if (incomeRaw !== "" && Number.isFinite(incomeNum)) {
          body.monthlyIncome = incomeNum;
        }
        try {
          const updated = await Fin.apiJson("/auth/me", {
            method: "POST",
            body: JSON.stringify(body),
          });
          Fin.setCurrentUser(updated);
          if (profileMsg) {
            profileMsg.style.display = "block";
            profileMsg.style.color = "#166534";
            profileMsg.style.background = "rgba(21,128,61,0.15)";
            profileMsg.textContent = "Profil mis à jour.";
          }
          if (phoneIn) phoneIn.value = updated.phone || "";
          if (incomeIn && updated.monthlyIncome != null) {
            incomeIn.value = String(updated.monthlyIncome);
          } else if (incomeIn && body.monthlyIncome == null) {
            incomeIn.value = "";
          }
        } catch (err) {
          if (profileMsg) {
            profileMsg.style.display = "block";
            profileMsg.style.color = "#fecaca";
            profileMsg.style.background = "rgba(127,29,29,0.2)";
            profileMsg.textContent = err.message || "Échec de la mise à jour.";
          }
        }
      });
    }

    const alertsEl = document.getElementById("ve-security-alerts");
    const enrollBtn = document.getElementById("ve-face-enroll-btn");
    const enrollFile = document.getElementById("ve-face-enroll-file");
    const enrollMsg = document.getElementById("ve-face-enroll-msg");

    if (!token && alertsEl) {
      alertsEl.innerHTML =
        "<p style=\"color:#fde68a;line-height:1.5;\">Session sans jeton JWT. Déconnectez-vous puis reconnectez-vous une fois pour activer Face ID (enregistrement) et les alertes sécurité.</p>";
    }
    if (token && alertsEl) {
      try {
        const alerts = await Fin.apiJson("/auth/security-alerts", { method: "GET" });
        if (Array.isArray(alerts) && alerts.length > 0) {
          alertsEl.innerHTML = alerts
            .slice(0, 8)
            .map(
              (a) =>
                `<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08);"><strong>${escapeHtml(
                  a.severity || ""
                )}</strong> — ${escapeHtml(a.message || "")}<br><span style="opacity:0.75;font-size:0.85rem;">${escapeHtml(
                  String(a.createdAt || "")
                )}</span></div>`
            )
            .join("");
        } else {
          alertsEl.innerHTML = "<p>Aucune alerte récente.</p>";
        }
      } catch {
        alertsEl.innerHTML =
          "<p style=\"color:#fecaca;\">Impossible de charger les alertes.</p>";
      }
    }

    async function submitFaceEnroll(imageBase64) {
      if (!Fin.getToken || !Fin.getToken()) return;
      try {
        await Fin.apiJson("/auth/face-enroll", {
          method: "POST",
          body: JSON.stringify({ imageBase64 }),
        });
        if (enrollMsg) {
          enrollMsg.style.color = "#bbf7d0";
          enrollMsg.textContent = "Photo enregistrée. Vous pouvez utiliser Face ID sur la page de connexion.";
        }
      } catch (err) {
        if (enrollMsg) {
          enrollMsg.style.color = "#fecaca";
          enrollMsg.textContent = err.message || "Échec de l'enregistrement.";
        }
      }
    }

    const enrollFileBtn = document.getElementById("ve-face-enroll-file-btn");

    if (enrollBtn && enrollFile) {
      enrollBtn.disabled = !token;
      enrollBtn.style.opacity = token ? "1" : "0.55";
      enrollBtn.addEventListener("click", () => {
        if (!Fin.getToken || !Fin.getToken()) return;
        if (enrollMsg) enrollMsg.textContent = "";
        const Cam = window.FinanciaFaceCamera;
        if (Cam && typeof Cam.open === "function") {
          Cam.open({
            title: "Enregistrer votre visage",
            onCapture: (dataUrl) => submitFaceEnroll(dataUrl),
            onPickFile: () => enrollFile.click(),
          });
        } else {
          enrollFile.click();
        }
      });
    }
    if (enrollFileBtn && enrollFile) {
      enrollFileBtn.disabled = !token;
      enrollFileBtn.style.opacity = token ? "1" : "0.55";
      enrollFileBtn.addEventListener("click", () => {
        if (!Fin.getToken || !Fin.getToken()) return;
        if (enrollMsg) enrollMsg.textContent = "";
        enrollFile.click();
      });
    }
    if (enrollFile) {
      enrollFile.addEventListener("change", (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => submitFaceEnroll(reader.result);
        reader.readAsDataURL(f);
      });
    }

    const loadingEl = document.getElementById("ve-credit-loading");
    const formWrap = document.getElementById("ve-credit-form-wrap");
    const blockingWrap = document.getElementById("ve-credit-blocking");
    const form = document.getElementById("ve-credit-request-form");
    const msg = document.getElementById("ve-credit-msg");
    const result = document.getElementById("ve-credit-result");

    let info = null;
    try {
      info = await Fin.apiJson(`/credits/user/${user.idUser}/blocking-info`, {
        method: "GET",
      });
    } catch (e) {
      if (loadingEl) {
        loadingEl.textContent =
          "Impossible de charger vos crédits. Vérifiez que le serveur Spring est démarré.";
        loadingEl.style.color = "#b91c1c";
      }
      return;
    }

    if (loadingEl) loadingEl.style.display = "none";

    const blockingCredit = info && info.blocking === true && info.credit ? info.credit : null;
    if (info && info.blocking === true && blockingWrap) {
      blockingWrap.innerHTML = blockingCredit
        ? renderBlockingPanel(blockingCredit)
        : `<div class="ve-credit-summary">
             <span class="ve-section-tag">Dossier en cours</span>
             <h2 style="color:#78350f;margin:0.5rem 0 0.35rem;font-size:1.45rem;">Crédit existant</h2>
             <p style="color:#92400e;line-height:1.55;margin:0;">Nouvelle demande indisponible jusqu’à clôture ou rejet du dossier.</p>
           </div>`;
      blockingWrap.style.display = "block";
      if (formWrap) formWrap.style.display = "none";
      return;
    }

    if (blockingWrap) blockingWrap.style.display = "none";
    if (formWrap) formWrap.style.display = "block";

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (msg) {
        msg.textContent = "";
        msg.style.display = "none";
      }
      if (result) result.innerHTML = "";

      const amount = form.querySelector("input[name='amount']").value.trim();
      const durationMonths = form.querySelector("input[name='durationMonths']").value.trim();
      const startDate = form.querySelector("input[name='startDate']").value.trim();

      const payload = {
        amount: Number(amount),
        durationMonths: Number(durationMonths),
      };
      if (startDate) payload.startDate = startDate;

      if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
        if (msg) show(msg, "Indiquez un montant valide.", true);
        return;
      }
      if (!Number.isFinite(payload.durationMonths) || payload.durationMonths < 1 || payload.durationMonths > 360) {
        if (msg) show(msg, "La durée doit être entre 1 et 360 mois.", true);
        return;
      }

      try {
        const credit = await Fin.apiJson(`/credits/user/${user.idUser}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        form.reset();
        if (formWrap) formWrap.style.display = "none";
        if (blockingWrap) {
          blockingWrap.innerHTML = renderBlockingPanel(credit);
          blockingWrap.style.display = "block";
        }
        if (result) result.style.display = "none";
      } catch (err) {
        if (msg) show(msg, err.message || "Échec de la demande.", true);
      }
    });
  });
})();
