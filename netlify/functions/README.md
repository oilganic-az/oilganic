# Netlify Functions & Deployment Guide for Oilganic

This directory contains Netlify Serverless Functions and configuration guidelines for deploy environments on Netlify (including custom `.az` domain setup).

## SPA Routing Fix for `/admin`

Single Page Applications (SPA) built with Vite and React Router handle routing on the client side. When a user accesses direct URLs like `/admin` or `/admin/login`:
- Without SPA redirect rules, Netlify attempts to look up a static `/admin/index.html` file on the server, returning a `404 Not Found` error.
- With the configured `public/_redirects` and `netlify.toml` rules:
  `/* /index.html 200`
  Netlify serves `index.html` for all client-side routes, enabling React Router to render the `/admin` dashboard and login pages correctly.

## Declared Serverless Functions (`netlify/functions`)

1. **`health.ts`**: `/.netlify/functions/health` (or `/api/health` via proxy)
   - Returns site health status and timestamp.
2. **`admin-status.ts`**: `/.netlify/functions/admin-status` (or `/api/admin-status` via proxy)
   - Returns admin operational status and configuration summary.

## Custom Domain Setup (.az Domain)

When connecting a `.az` custom domain (e.g. `oilganic.az`) in Netlify Site Settings:
1. **Primary Domain**: Set `oilganic.az` or `www.oilganic.az` under Domain Management.
2. **DNS Records**:
   - ALIAS/ANAME record for `oilganic.az` pointing to `<site-name>.netlify.app`.
   - CNAME record for `www` pointing to `<site-name>.netlify.app`.
3. **SSL Certificate**: Netlify will automatically provision a free Let's Encrypt SSL certificate once DNS resolves to Netlify servers.
