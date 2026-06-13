"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { SliderImage } from "@/types";

export function HeroSlider({ slides }: { slides: SliderImage[] }) {
  const [i, setI] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % count), 6500);
    return () => clearInterval(id);
  }, [count]);

  if (!count) return null;
  const s = slides[i];

  return (
    <div className="relative aspect-[21/9] sm:aspect-[21/8] w-full max-w-[1600px] mx-auto rounded-xl overflow-hidden bg-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={s.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image src={s.image_url} alt={s.title} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-14 max-w-3xl">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold leading-tight mb-4">
              {s.title}
            </h2>
            {s.description && (
              <p className="text-text-muted text-base sm:text-lg max-w-xl leading-relaxed mb-6">
                {s.description}
              </p>
            )}
            {s.button_link && (
              <Link
                href={s.button_link}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-3 rounded-lg w-fit transition shadow-lg shadow-primary/40"
              >
                <Play className="h-5 w-5 fill-white" />
                {s.button_text || "Watch Live Now"}
              </Link>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button onClick={() => setI((p) => (p - 1 + count) % count)} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur flex items-center justify-center border border-white/10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setI((p) => (p + 1) % count)} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur flex items-center justify-center border border-white/10">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {slides.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`}
                className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-1.5 bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
