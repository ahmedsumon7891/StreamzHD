import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") || "";
  if (!url) {
    return new Response("URL parameter is required", { status: 400 });
  }

  try {
    const targetUrl = new URL(url);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return new Response(`Failed to fetch upstream: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "";
    
    // Set headers with permissive CORS so browser players can decode the stream chunks
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "*");
    if (contentType) {
      headers.set("content-type", contentType);
    }

    // If it's an M3U8 playlist, we need to rewrite relative segment chunk URLs
    if (contentType.includes("mpegurl") || contentType.includes("application/x-mpegURL") || url.endsWith(".m3u8") || url.includes(".m3u8")) {
      const playlistText = await response.text();
      const baseUrl = targetUrl.origin + targetUrl.pathname.substring(0, targetUrl.pathname.lastIndexOf("/") + 1);

      const lines = playlistText.split(/\r?\n/);
      const rewrittenLines = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
          // Check for sub-playlists or keys inside tags that might contain URLs (e.g. URI="...")
          if (trimmed.includes("URI=")) {
            return line.replace(/URI="([^"]+)"/g, (match, subUrl) => {
              let absoluteSubUrl = subUrl;
              if (!subUrl.startsWith("http://") && !subUrl.startsWith("https://")) {
                if (subUrl.startsWith("/")) {
                  absoluteSubUrl = `${targetUrl.origin}${subUrl}`;
                } else {
                  absoluteSubUrl = `${baseUrl}${subUrl}`;
                }
              }
              return `URI="/api/channels/proxy?url=${encodeURIComponent(absoluteSubUrl)}"`;
            });
          }
          return line;
        }

        // Absolute URL
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          return `/api/channels/proxy?url=${encodeURIComponent(trimmed)}`;
        }

        // Relative URL
        let absoluteSegmentUrl = "";
        if (trimmed.startsWith("/")) {
          absoluteSegmentUrl = `${targetUrl.origin}${trimmed}`;
        } else {
          absoluteSegmentUrl = `${baseUrl}${trimmed}`;
        }

        return `/api/channels/proxy?url=${encodeURIComponent(absoluteSegmentUrl)}`;
      });

      return new Response(rewrittenLines.join("\n"), {
        status: 200,
        headers,
      });
    }

    // For raw video files/segments (.ts), pipe the binary stream directly
    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Stream Proxy Error:", err);
    return new Response("Error connecting to stream source", { status: 502 });
  }
}
