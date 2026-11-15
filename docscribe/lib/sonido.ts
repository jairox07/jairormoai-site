// Tonos generados con Web Audio (sin archivos). Usan el AudioContext de la grabación, que se crea
// dentro del toque del usuario (Safari lo exige). Van a la bocina, no al micrófono.
export function sonar(ctx: AudioContext | null, notas: number[]) {
  if (!ctx || ctx.state === "closed") return;
  ctx.resume().catch(() => {});
  notas.forEach((frecuencia, i) => {
    const t = ctx.currentTime + i * 0.14;
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();
    oscilador.type = "sine";
    oscilador.frequency.value = frecuencia;
    oscilador.connect(ganancia).connect(ctx.destination);
    ganancia.gain.setValueAtTime(0.0001, t);
    ganancia.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    oscilador.start(t);
    oscilador.stop(t + 0.13);
  });
}

// Inicio: sube. Fin: baja.
export const TONO_INICIO = [660, 990];
export const TONO_FIN = [990, 660];
