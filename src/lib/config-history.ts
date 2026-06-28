import { useSyncExternalStore } from "react";

export interface ConfigSnapshot {
  id: string;
  timestamp: number;
  config: string; // serialized JSON config
}

const KEY = "caddyui:config-history";
const MAX = 20;

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}

function read(): ConfigSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ConfigSnapshot[]) : [];
  } catch {
    return [];
  }
}

/** Save a snapshot of a config (most-recent first, capped at MAX). */
export function addSnapshot(config: string): void {
  if (typeof window === "undefined" || !config) return;
  const snap: ConfigSnapshot = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    config,
  };
  const next = [snap, ...read()].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full / unavailable — non-fatal
  }
  emit();
}

export function clearSnapshots(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  emit();
}

// --- React binding (SSR-safe, no effect/setState) ---

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (typeof window !== "undefined") window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", cb);
  };
}

function getClientSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(KEY) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

export function useConfigHistory(): ConfigSnapshot[] {
  const raw = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  try {
    return JSON.parse(raw) as ConfigSnapshot[];
  } catch {
    return [];
  }
}
