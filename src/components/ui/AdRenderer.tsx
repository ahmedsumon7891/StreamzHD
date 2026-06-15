"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  html: string;
  isGlobal?: boolean;
  position?: string;
}

export function AdRenderer({ html, isGlobal = false, position = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (hasRun) return;
    setHasRun(true);

    const container = containerRef.current;
    container.innerHTML = "";

    // 1. ADSTERRA BANNER PRESET (Dedicated loading according to Adsterra docs)
    if (html.includes("atOptions") && (html.includes("invoke.js") || html.includes("highperformanceformat.com") || html.includes("effectivecreativeformat.com"))) {
      try {
        const keyMatch = html.match(/'key'\s*:\s*'([^']+)'/) || html.match(/"key"\s*:\s*"([^"]+)"/);
        const formatMatch = html.match(/'format'\s*:\s*'([^']+)'/) || html.match(/"format"\s*:\s*"([^"]+)"/);
        const heightMatch = html.match(/'height'\s*:\s*(\d+)/) || html.match(/"height"\s*:\s*(\d+)/);
        const widthMatch = html.match(/'width'\s*:\s*(\d+)/) || html.match(/"width"\s*:\s*(\d+)/);
        const srcMatch = html.match(/src=["']([^"']+)["']/);

        if (keyMatch) {
          const key = keyMatch[1];
          const format = formatMatch ? formatMatch[1] : "iframe";
          const height = heightMatch ? parseInt(heightMatch[1]) : 250;
          const width = widthMatch ? parseInt(widthMatch[1]) : 300;
          const src = srcMatch ? srcMatch[1] : `https://www.highperformanceformat.com/${key}/invoke.js`;

          // Set global options key config
          (window as any).atOptions = {
            key,
            format,
            height,
            width,
            params: {}
          };

          // Append invocation script
          const script = document.createElement("script");
          script.type = "text/javascript";
          script.src = src.startsWith("//") ? `https:${src}` : src;
          container.appendChild(script);
          return;
        }
      } catch (err) {
        console.error("Adsterra dedicated renderer error, falling back:", err);
      }
    }

    // 2. PROPELLERADS & MONETAG POPUNDER PRESET (Dedicated popunder SDK loading)
    if (html.includes("sdk.js") && (html.includes("grosoegr.com") || html.includes("onclickalgo.com"))) {
      try {
        const zoneMatch = html.match(/sdk\.js',\s*(\d+)/) || html.match(/,\s*(\d+),\s*window/);
        if (zoneMatch) {
          const zoneId = zoneMatch[1];
          const sdkUrl = html.includes("onclickalgo.com") 
            ? "https://onclickalgo.com/sdk.js" 
            : "https://grosoegr.com/sdk.js";

          const script = document.createElement("script");
          script.src = sdkUrl;
          script.setAttribute("data-zone", zoneId);
          script.id = html.includes("onclickalgo.com") ? "monetag-popunder" : "propeller-popunder";
          document.body.appendChild(script);
          return;
        }
      } catch (err) {
        console.error("Popunder dedicated renderer error, falling back:", err);
      }
    }

    // 3. PROPELLERADS & MONETAG IN-PAGE PUSH / VIGNETTE PRESET (Dedicated tag loading)
    if (html.includes("tag.min.js")) {
      try {
        const zoneMatch = html.match(/z=(\d+)/) || html.match(/zone=(\d+)/) || html.match(/zone['"]?:\s*['"]?(\d+)/);
        if (zoneMatch) {
          const zoneId = zoneMatch[1];
          const tagUrl = html.includes("onclickalgo.com") 
            ? "https://onclickalgo.com/tag.min.js" 
            : "https://grosoegr.com/tag.min.js";

          const script = document.createElement("script");
          script.src = `${tagUrl}?z=${zoneId}`;
          script.setAttribute("data-zone", zoneId);
          script.async = true;
          document.body.appendChild(script);
          return;
        }
      } catch (err) {
        console.error("Tag dedicated renderer error, falling back:", err);
      }
    }

    // 4. FALLBACK: GENERAL PARSER AND MAIN DOCUMENT INJECTOR (For custom ad codes)
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const bodyNodes = Array.from(doc.body.childNodes);
      bodyNodes.forEach((node) => {
        if (node.nodeName !== "SCRIPT") {
          container.appendChild(node.cloneNode(true));
        }
      });

      const scripts = doc.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        const src = oldScript.getAttribute("src");
        if (src && src.startsWith("//")) {
          newScript.setAttribute("src", `https:${src}`);
        }
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }
        container.appendChild(newScript);
      });
    } catch (err) {
      console.error("General ad renderer error:", err);
    }
  }, [html, hasRun]);

  useEffect(() => {
    setHasRun(false);
  }, [html]);

  // For global scripts (popunders, push, vignette, site verifications), we render statically for crawlers
  if (isGlobal) {
    return (
      <div 
        ref={containerRef} 
        className="hidden w-0 h-0 pointer-events-none opacity-0" 
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Set appropriate min-height based on the position name to avoid Cumulative Layout Shift (CLS)
  let minHeightClass = "min-h-[250px]";
  if (position.includes("top") || position.includes("middle") || position.includes("footer")) {
    minHeightClass = "min-h-[90px]";
  }

  return (
    <div 
      ref={containerRef} 
      className={`w-full flex justify-center items-center overflow-hidden ${minHeightClass}`} 
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
