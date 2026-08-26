import type { NextConfig } from "next"

const backendOrigin = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://chatwave-backend-z7n1.onrender.com"
).replace(/\/$/, "")

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "55mb",
  },
  async rewrites() {
    return [
      {
        source: "/cw-api/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ]
  },
}

export default nextConfig
