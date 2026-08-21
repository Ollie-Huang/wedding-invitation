import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "冠禎 & 玟慧｜數位喜帖",
    short_name: "冠禎 & 玟慧",
    description: "冠禎與玟慧的互動式數位喜帖",
    start_url: ".",
    display: "standalone",
    background_color: "#294a43",
    theme_color: "#294a43",
    orientation: "any",
    icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
