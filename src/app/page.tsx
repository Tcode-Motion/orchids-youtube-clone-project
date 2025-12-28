import Masthead from "@/components/sections/masthead";
import Sidebar from "@/components/sections/sidebar";
import VideoFeed from "@/components/sections/video-feed";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Masthead />
      <div className="flex flex-1 pt-[56px]">
        <Sidebar />
        <VideoFeed />
      </div>
    </div>
  );
}
