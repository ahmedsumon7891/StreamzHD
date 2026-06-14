import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") || "";
  if (!url) {
    return new Response("URL parameter is required", { status: 400 });
  }

  // Quick check: If the URL is clearly a video chunk/segment (.ts, .mp4, etc.) and not a playlist,
  // redirect immediately to the source to avoid downloading/proxying heavy binary data.
  const lowerUrl = url.toLowerCase();
  const isSegment = lowerUrl.includes(".ts") || lowerUrl.includes(".mp4") || lowerUrl.includes(".m4s") || lowerUrl.includes(".aac");
  if (isSegment && !lowerUrl.includes(".m3u8")) {
    return Response.redirect(url, 307);
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

    const isPlaylist = 
      contentType.includes("mpegurl") || 
      contentType.includes("application/x-mpegURL") || 
      url.endsWith(".m3u8") || 
      url.includes(".m3u8");

    // If it's an M3U8 playlist, rewrite only sub-playlist URLs (.m3u8) to use the proxy.
    // Keep segment URLs (.ts, etc.) pointing directly to the upstream server to save bandwidth.
    if (isPlaylist) {
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
              // Only proxy sub-playlists, not segment keys or other files
              if (absoluteSubUrl.includes(".m3u8")) {
                return `URI="/api/channels/proxy?url=${encodeURIComponent(absoluteSubUrl)}"`;
              }
              return `URI="${absoluteSubUrl}"`;
            });
          }
          return line;
        }

        // Absolute URL
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          if (trimmed.includes(".m3u8")) {
            return `/api/channels/proxy?url=${encodeURIComponent(trimmed)}`;
          }
          return trimmed; // Serve segments directly
        }

        // Relative URL
        let absoluteSegmentUrl = "";
        if (trimmed.startsWith("/")) {
          absoluteSegmentUrl = `${targetUrl.origin}${trimmed}`;
        } else {
          absoluteSegmentUrl = `${baseUrl}${trimmed}`;
        }

        if (absoluteSegmentUrl.includes(".m3u8")) {
          return `/api/channels/proxy?url=${encodeURIComponent(absoluteSegmentUrl)}`;
        }
        return absoluteSegmentUrl; // Serve segments directly
      });

      return new Response(rewrittenLines.join("\n"), {
        status: 200,
        headers,
      });
    }

    // Fallback: If it's not a playlist (e.g. video segments, images, etc.), redirect to avoid bandwidth usage
    return Response.redirect(url, 307);
  } catch (err) {
    console.error("Stream Proxy Error:", err);
    return new Response("Error connecting to stream source", { status: 502 });
  }
}
