"use client";
import { QRCodeSVG } from "qrcode.react";

export function QRShare({ url, label = "Scan to share" }: { url: string; label?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 inline-flex items-center gap-4">
      <div className="bg-white p-2 rounded">
        <QRCodeSVG value={url} size={88} bgColor="#fff" fgColor="#000" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-text-dim mb-1">{label}</div>
        <div className="text-xs text-text-muted break-all max-w-[200px]">{url}</div>
      </div>
    </div>
  );
}
