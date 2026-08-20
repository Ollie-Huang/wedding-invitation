import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGitHubPages && repositoryName ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPages && repositoryName ? `/${repositoryName}/` : "",
};

export default nextConfig;
