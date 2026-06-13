"use client";
import { useEffect } from "react";

export function ViewIncrement({ slug }: { slug: string }) {
  useEffect(() => {
    fetch("/api/channels/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => undefined);
  }, [slug]);
  return null;
}
