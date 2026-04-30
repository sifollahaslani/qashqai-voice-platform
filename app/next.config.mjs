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
      {
        source: '/entries',
        destination: 'http://localhost:8000/entries',
      },
    ]
  },
}

export default nextConfig
