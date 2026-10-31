import type { NextConfig } from 'next';

const securityHeaders=[
  {key:'Content-Security-Policy',value:[
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://*.googletagmanager.com https://static.cloudflareinsights.com https://*.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: https://*.google-analytics.com https://*.googletagmanager.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com https://analytics.google.com https://*.analytics.google.com https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net https://www.google.com https://*.googletagmanager.com https://cloudflareinsights.com https://*.cloudflareinsights.com",
    "frame-src 'self' https://challenges.cloudflare.com https://www.paypal.com https://www.sandbox.paypal.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "media-src 'self' blob: https:",
    "upgrade-insecure-requests",
  ].join('; ')},
  {key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'},
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'SAMEORIGIN'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=(self)'},
  {key:'Cross-Origin-Opener-Policy',value:'same-origin-allow-popups'},
];

const nextConfig: NextConfig = {
  async headers(){return[{source:'/:path*',headers:securityHeaders},{source:'/',headers:securityHeaders}]},
};

export default nextConfig;
