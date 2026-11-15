import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTiempo(segundos: number) {
  const m = Math.floor(segundos / 60).toString().padStart(2, "0");
  const s = (segundos % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export const LIMITE_FREE = 20;

export function periodoActual() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM (UTC), igual que en SQL
}
