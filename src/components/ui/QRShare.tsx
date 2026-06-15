"use client";
import { QRCodeCanvas } from "qrcode.react";
import { Share2, Copy, Check } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "@/components/ui/Toast";

export function QRShare({ url, label = "Share this channel" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast("Link copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (sharing) return;
    setSharing(true);
    
    try {
      const canvas = qrContainerRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
      if (canvas && navigator.share) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const file = new File([blob], "share-qr.png", { type: "image/png" });
              const shareData = {
                title: "StreamZ HD",
                text: `Watch live channel on StreamZ HD!`,
                url: url,
                files: [file]
              };
              
              // Verify if device can share files
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
              } else {
                // Fallback to text share
                await navigator.share({
                  title: "StreamZ HD",
                  text: `Watch live channel on StreamZ HD!`,
                  url: url
                });
              }
            } catch (err) {
              console.error("File sharing error, falling back:", err);
              // Fallback to text share
              await navigator.share({
                title: "StreamZ HD",
                text: `Watch live channel on StreamZ HD!`,
                url: url
              });
            }
          }
        }, "image/png");
      } else if (navigator.share) {
        await navigator.share({
          title: "StreamZ HD",
          text: `Watch live channel on StreamZ HD!`,
          url: url
        });
      } else {
        copy();
      }
    } catch (err) {
      console.error("Sharing error:", err);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5 w-full">
      {/* Canvas QR Code - always visible on all devices */}
      <div ref={qrContainerRef} className="bg-white p-2.5 rounded-lg shrink-0 shadow-sm">
        <QRCodeCanvas value={url} size={96} bgColor="#fff" fgColor="#000" />
      </div>
      
      <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-primary">{label}</div>
          <div className="text-xs text-text-muted break-all mt-1 truncate max-w-full">{url}</div>
        </div>
        
        <div className="flex items-center gap-2.5 justify-center sm:justify-start">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 bg-bg border border-border hover:border-primary px-3 py-2 rounded-lg text-xs font-semibold text-text-muted hover:text-text transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Link"}
          </button>
          
          <button
            onClick={share}
            disabled={sharing}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-md shadow-primary/20"
          >
            <Share2 className="h-3.5 w-3.5" />
            {sharing ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
