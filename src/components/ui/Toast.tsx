"use client";
import { useEffect, useState } from "react";

type Toast = { id: number; message: string; kind: "success" | "error" | "info" };
const listeners = new Set<(t: Toast) => void>();
let nextId = 1;

export function toast(message: string, kind: Toast["kind"] = "info") {
  const t: Toast = { id: nextId++, message, kind };
  listeners.forEach((l) => l(t));
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const cb = (t: Toast) => {
      setItems((p) => [...p, t]);
      setTimeout(() => setItems((p) => p.filter((x) => x.id !== t.id)), 3500);
    };
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);
  return (
    <div className="fixed z-[60] bottom-6 right-6 flex flex-col gap-2">
      {items.map((t) => (
        <div key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium animate-pulse-slow ${
            t.kind === "success" ? "bg-success/15 border-success/40 text-success" :
            t.kind === "error" ? "bg-error/15 border-error/40 text-error" :
            "bg-card border-border text-white"
          }`}>{t.message}</div>
      ))}
    </div>
  );
}
