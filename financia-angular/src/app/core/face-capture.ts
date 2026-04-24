/** Arrête tous les tracks d'un flux caméra / micro. */
export function stopMediaStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((t) => t.stop());
}

/**
 * Démarre la caméra frontale et l'affiche dans l'élément video (déjà dans le DOM).
 */
export async function startUserFacingCamera(
  video: HTMLVideoElement
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
    audio: false,
  });
  video.srcObject = stream;
  video.muted = true;
  video.setAttribute('playsinline', '');
  await video.play();
  return stream;
}

/** Capture une image JPEG (data URL) depuis la frame courante de la vidéo. */
export function captureVideoFrameAsJpegDataUrl(
  video: HTMLVideoElement,
  quality = 0.88
): string | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) {
    return null;
  }
  const maxW = 720;
  const scale = w > maxW ? maxW / w : 1;
  const outW = Math.max(1, Math.round(w * scale));
  const outH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }
  ctx.drawImage(video, 0, 0, w, h, 0, 0, outW, outH);
  return canvas.toDataURL('image/jpeg', quality);
}

export function cameraAccessErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return "Accès à la caméra refusé. Autorisez la caméra pour ce site dans les paramètres du navigateur.";
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return "Aucune caméra détectée.";
    }
  }
  return "Impossible d'ouvrir la caméra. Réessayez ou utilisez HTTPS / localhost.";
}
