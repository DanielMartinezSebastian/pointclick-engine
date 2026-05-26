import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.18.131"],
  turbopack: {
    root: path.join(__dirname, "../../"),
  },
};

export default nextConfig;
