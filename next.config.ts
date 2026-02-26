import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/chat',
        destination: 'http://127.0.0.1:8000/chat',
      },
      {
        source: '/detect',
        destination: 'http://127.0.0.1:8000/detect',
      },
    ]
  },
}

export default nextConfig
