/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'http://localhost:8080/:path*', // Ajustez selon votre backend
          },
        ];
      },
};

export default nextConfig;
