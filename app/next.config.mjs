/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/chat',
        destination: 'http://localhost:8000/chat',
      },
      {
        source: '/detect',
        destination: 'http://localhost:8000/detect',
      },
    ]
  },
}

export default nextConfig
