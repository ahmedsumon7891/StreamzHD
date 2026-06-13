"use client";
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(() => import("./VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black rounded-xl border border-border flex items-center justify-center text-text-muted">
      Loading player...
    </div>
  ),
});

interface Props {
  streamUrl: string;
  channelName: string;
  logoUrl?: string | null;
}

export function ClientVideoPlayer(props: Props) {
  return <VideoPlayer {...props} />;
}
