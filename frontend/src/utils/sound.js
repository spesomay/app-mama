/**
 * Genera un sonido dulce y alegre de confirmación de carrito ("chime/ding")
 * utilizando la Web Audio API nativa del navegador (sin requerir descargas de archivos externos).
 */
export function playCartSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Reanudar contexto si el navegador lo pausó por políticas de interacción
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Primer tono: Campana ascendente suave (880Hz A5 -> 1046.5Hz C6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08);

    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.28);

    // Segundo tono: Resonancia armónica brillante (1318.5Hz E6 -> 1567.98Hz G6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, now + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.16);

    gain2.gain.setValueAtTime(0.22, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.07);
    osc2.stop(now + 0.48);

    // Feedback háptico en smartphones (vibración corta sutil)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 20, 50]);
    }
  } catch (err) {
    // Silencioso si el navegador restringe el audio
    console.debug('AudioContext no disponible:', err);
  }
}
