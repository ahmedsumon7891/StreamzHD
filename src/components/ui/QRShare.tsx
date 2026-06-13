"use client";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/Toast";

export function QRShare({ url, label = "Share this channel" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast("Link copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "StreamZ HD",
          text: `Watch this live channel on StreamZ HD!`,
          url: url,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      copy();
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 w-full">
      <div className="bg-white p-2 rounded hidden sm:block">
        <QRCodeSVG value={url} size={88} bgColor="#fff" fgColor="#000" />
      </div>
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <div className="text-xs uppercase tracking-wider text-text-dim mb-1">{label}</div>
        <div className="text-xs text-text-muted break-all mb-3 truncate">{url}</div>
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 bg-bg border border-border hover:border-primary px-3 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-text transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Link"}
          </button>
          <button
            onClick={share}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
