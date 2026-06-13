import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border mt-20 bg-card/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <Logo size="sm" />
          <p className="text-sm text-text-muted mt-3 leading-relaxed">
            Premium IPTV streaming. Live news, sports, movies and entertainment from around the world.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Browse</h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li><Link href="/" className="hover:text-primary">Home</Link></li>
            <li><Link href="/category/news" className="hover:text-primary">News</Link></li>
            <li><Link href="/category/sports" className="hover:text-primary">Sports</Link></li>
            <li><Link href="/category/movies" className="hover:text-primary">Movies</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li><Link href="/search" className="hover:text-primary">Search</Link></li>
            <li><Link href="/sitemap.xml" className="hover:text-primary">Sitemap</Link></li>
            <li><Link href="/admin/login" className="hover:text-primary">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Disclaimer</h4>
          <p className="text-xs text-text-dim leading-relaxed">
            StreamZ HD does not host any streams. All content is aggregated from publicly available sources.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-text-dim">
        © {new Date().getFullYear()} StreamZ HD. All rights reserved.
      </div>
    </footer>
  );
}
