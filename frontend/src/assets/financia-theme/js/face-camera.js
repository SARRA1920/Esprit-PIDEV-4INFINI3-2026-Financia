/**
 * Capture visage via la webcam (getUserMedia).
 * Fonctionne sur https:// ou http://localhost (contexte « sécurisé »).
 */
(function (global) {
  function stopStream(stream) {
    if (!stream) return;
    try {
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore */
    }
  }

  function captureFromVideo(video, quality) {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", quality);
  }

  /**
   * @param {object} opts
   * @param {string} [opts.title]
   * @param {(dataUrl: string) => void} opts.onCapture — image/jpeg en data URL
   * @param {() => void} [opts.onCancel]
   * @param {() => void} [opts.onPickFile] — ouvrir le sélecteur fichier à la place
   */
  function open(opts) {
    const title = opts.title || "Capture visage";
    const onCapture = opts.onCapture;
    const onCancel = opts.onCancel || (() => {});
    const onPickFile = opts.onPickFile;

    if (!onCapture || typeof onCapture !== "function") return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = new Error(
        "Caméra non disponible dans ce navigateur. Utilisez « fichier » ou un navigateur récent (Chrome, Edge, Firefox)."
      );
      if (opts.onError) opts.onError(err);
      else if (onPickFile) onPickFile();
      return;
    }

    const root = document.createElement("div");
    root.className = "ve-face-cam-modal";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.innerHTML = `
      <div class="ve-face-cam-dialog">
        <h3 class="ve-face-cam-title"></h3>
        <p class="ve-face-cam-hint">Placez votre visage dans le cadre, bon éclairage de face.</p>
        <div class="ve-face-cam-video-wrap">
          <video class="ve-face-cam-video" playsinline autoplay muted></video>
        </div>
        <p class="ve-face-cam-err" style="display:none;color:#fecaca;font-size:0.9rem;margin:8px 0 0;"></p>
        <div class="ve-face-cam-actions">
          <button type="button" class="ve-btn-primary ve-face-cam-shoot">Capturer</button>
          <button type="button" class="ve-cta-btn ve-face-cam-cancel">Annuler</button>
        </div>
        <div class="ve-face-cam-file-row"></div>
      </div>
    `;
    const titleEl = root.querySelector(".ve-face-cam-title");
    if (titleEl) titleEl.textContent = title;

    const fileRow = root.querySelector(".ve-face-cam-file-row");
    if (onPickFile && fileRow) {
      fileRow.innerHTML =
        '<button type="button" class="ve-face-cam-file-link">Choisir une photo sur l’appareil</button>';
    }

    const video = root.querySelector(".ve-face-cam-video");
    const errEl = root.querySelector(".ve-face-cam-err");
    const btnShoot = root.querySelector(".ve-face-cam-shoot");
    const btnCancel = root.querySelector(".ve-face-cam-cancel");
    const btnFile = root.querySelector(".ve-face-cam-file-link");

    let stream = null;

    function close() {
      stopStream(stream);
      stream = null;
      root.remove();
    }

    function fail(msg) {
      if (errEl) {
        errEl.style.display = "block";
        errEl.textContent = msg;
      }
    }

    document.body.appendChild(root);

    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((s) => {
        stream = s;
        video.srcObject = s;
        return video.play();
      })
      .catch((e) => {
        const msg =
          e && e.name === "NotAllowedError"
            ? "Accès à la caméra refusé. Autorisez la caméra pour ce site ou utilisez une photo."
            : e && e.message
              ? e.message
              : "Impossible d’ouvrir la caméra.";
        fail(msg);
        if (btnShoot) btnShoot.disabled = true;
      });

    btnCancel.addEventListener("click", () => {
      close();
      onCancel();
    });

    if (btnFile) {
      btnFile.addEventListener("click", () => {
        close();
        onPickFile();
      });
    }

    btnShoot.addEventListener("click", () => {
      const dataUrl = captureFromVideo(video, 0.88);
      if (!dataUrl) {
        fail("Vidéo pas prête. Patientez une seconde après l’ouverture de la caméra.");
        return;
      }
      close();
      onCapture(dataUrl);
    });

    root.addEventListener("click", (ev) => {
      if (ev.target === root) {
        close();
        onCancel();
      }
    });
  }

  global.FinanciaFaceCamera = { open };
})(window);
