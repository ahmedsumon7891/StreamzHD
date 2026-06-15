"use client";
import { useEffect, useRef } from "react";

export function AdRenderer({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any previously created dynamic scripts from this container
    const existingDynamicScripts = containerRef.current.querySelectorAll("script[data-dynamic-ad]");
    existingDynamicScripts.forEach((s) => s.remove());

    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      
      // Copy all attributes
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Mark as dynamic so we can track/clean
      newScript.setAttribute("data-dynamic-ad", "true");
      
      // Copy script code
      if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML;
      }
      
      // Replace in DOM to trigger execution
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}
