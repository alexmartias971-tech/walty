/**
 * Lecteur de QR code du MODE CAISSE (Walty Caisse) : caméra allumée en continu, décodage le plus rapide disponible.
 *
 * - Décodeur natif du téléphone (BarcodeDetector : Android / Chrome, très rapide) quand il existe ;
 * - sinon ZXing (déjà livré avec html5-qrcode, chargé seulement si besoin) sur un carré central réduit à 640 px
 *   en niveaux de gris (iPhone / iPad, ordinateurs) : quelques dizaines de millisecondes par image.
 * - La caméra n'est jamais coupée entre deux clients ; les images sont lues au rythme de la vidéo
 *   (requestVideoFrameCallback quand il existe), sans jamais lancer deux décodages en même temps.
 * - Lampe (torche) et caméra avant / arrière quand l'appareil le permet.
 * Aucune image n'est envoyée ni gardée : tout se passe dans le téléphone.
 */

const MAX_SIDE = 640;

/** Le meilleur décodeur disponible sur cet appareil : { name, detect(video) → texte | null }. */
export async function createDecoder() {
  if (typeof window !== "undefined" && "BarcodeDetector" in window) {
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      if (formats.includes("qr_code")) {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        return {
          name: "natif",
          async detect(video) {
            const codes = await detector.detect(video);
            return codes.length ? codes[0].rawValue || null : null;
          },
        };
      }
    } catch {
      // décodeur natif présent mais inutilisable : ZXing
    }
  }
  const ZXing = await import("html5-qrcode/third_party/zxing-js.umd");
  const lib = ZXing.default && ZXing.default.QRCodeReader ? ZXing.default : ZXing;
  const reader = new lib.QRCodeReader();
  const hints = new Map();
  hints.set(lib.DecodeHintType.POSSIBLE_FORMATS, [lib.BarcodeFormat.QR_CODE]);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  return {
    name: "zxing",
    async detect(video) {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return null;
      // carré central (le cadre visé à l'écran), réduit à 640 px au plus
      const side = Math.floor(Math.min(vw, vh) * 0.86);
      const size = Math.min(side, MAX_SIDE);
      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
      }
      ctx.drawImage(video, Math.floor((vw - side) / 2), Math.floor((vh - side) / 2), side, side, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      const lum = new Uint8ClampedArray(size * size);
      for (let i = 0, j = 0; j < lum.length; i += 4, j++) lum[j] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
      try {
        const bitmap = new lib.BinaryBitmap(new lib.HybridBinarizer(new lib.RGBLuminanceSource(lum, size, size)));
        return reader.decode(bitmap, hints).getText() || null;
      } catch {
        return null; // pas de QR code dans cette image
      } finally {
        reader.reset?.();
      }
    },
  };
}

/** Ouvre la caméra (arrière par défaut). */
export async function openCamera(facing = "environment") {
  const video = {
    facingMode: { ideal: facing },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };
  const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video });
  const track = stream.getVideoTracks()[0];
  // mise au point continue quand c'est réglable (beaucoup d'Android)
  try {
    const caps = track.getCapabilities?.() || {};
    if (Array.isArray(caps.focusMode) && caps.focusMode.includes("continuous")) {
      await track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
    }
  } catch {
    // réglage refusé : sans importance
  }
  return stream;
}

/** La lampe est-elle réglable sur cette caméra ? */
export function hasTorch(stream) {
  try {
    const track = stream?.getVideoTracks()[0];
    return !!track?.getCapabilities?.().torch;
  } catch {
    return false;
  }
}

export async function setTorch(stream, on) {
  const track = stream?.getVideoTracks()[0];
  if (!track) return false;
  try {
    await track.applyConstraints({ advanced: [{ torch: !!on }] });
    return true;
  } catch {
    return false;
  }
}

/** Plusieurs caméras (avant / arrière) ? */
export async function countCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput").length;
  } catch {
    return 0;
  }
}

export function stopStream(stream) {
  for (const t of stream?.getTracks?.() || []) {
    try {
      t.stop();
    } catch {
      // déjà arrêtée
    }
  }
}

/**
 * Boucle de lecture : appelle onCode(texte, { at, decodeMs }) à chaque QR code lu.
 * Jamais deux décodages en même temps ; rythme adapté à la vitesse du décodeur (≈ 12 à 25 images par seconde).
 * Renvoie { stop(), stats } (stats : nombre d'images lues, temps moyen et maximal de décodage).
 */
export function startLoop(video, decoder, onCode) {
  let running = true;
  let handle = null;
  const stats = { decoder: decoder.name, frames: 0, totalMs: 0, maxMs: 0, avgMs: 0 };
  const minGap = decoder.name === "natif" ? 40 : 60;
  let last = 0;

  const schedule = () => {
    if (!running) return;
    if (typeof video.requestVideoFrameCallback === "function") handle = { v: video.requestVideoFrameCallback(tick) };
    else handle = { r: requestAnimationFrame(tick) };
  };
  async function tick() {
    if (!running) return;
    const now = performance.now();
    if (now - last < minGap || video.readyState < 2 || document.hidden) return schedule();
    last = now;
    let text = null;
    const t0 = performance.now();
    try {
      text = await decoder.detect(video);
    } catch {
      text = null;
    }
    const ms = performance.now() - t0;
    stats.frames++;
    stats.totalMs += ms;
    stats.maxMs = Math.max(stats.maxMs, ms);
    stats.avgMs = Math.round((stats.totalMs / stats.frames) * 10) / 10;
    if (!running) return;
    if (text) {
      try {
        onCode(text, { at: performance.now(), decodeMs: Math.round(ms) });
      } catch {
        // l'écran gère ses erreurs
      }
    }
    schedule();
  }
  schedule();
  return {
    stats,
    stop() {
      running = false;
      if (handle?.v && typeof video.cancelVideoFrameCallback === "function") video.cancelVideoFrameCallback(handle.v);
      if (handle?.r) cancelAnimationFrame(handle.r);
    },
  };
}
