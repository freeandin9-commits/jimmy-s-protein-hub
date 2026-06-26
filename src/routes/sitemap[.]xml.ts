import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://jimmy-s-protein-hub.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split("T")[0];
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
          { path: "/products", changefreq: "weekly", priority: "0.9", lastmod: today },
          { path: "/about", changefreq: "monthly", priority: "0.6", lastmod: today },
          { path: "/contact", changefreq: "monthly", priority: "0.6", lastmod: today },
          { path: "/blog", changefreq: "weekly", priority: "0.6", lastmod: today },
          { path: "/track", changefreq: "monthly", priority: "0.4", lastmod: today },
          { path: "/orders", changefreq: "monthly", priority: "0.4", lastmod: today },
        ];

        // Add dynamic product pages
        try {
          const supabaseUrl = process.env.VITE_SUPABASE_URL;
          const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          if (supabaseUrl && supabaseKey) {
            const res = await fetch(
              `${supabaseUrl}/rest/v1/products?select=handle,updated_at`,
              {
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
              },
            );
            if (res.ok) {
              const products = (await res.json()) as Array<{ handle: string; updated_at?: string }>;
              for (const p of products) {
                if (!p.handle) continue;
                entries.push({
                  path: `/product/${p.handle}`,
                  changefreq: "weekly",
                  priority: "0.8",
                  lastmod: p.updated_at ? p.updated_at.split("T")[0] : today,
                });
              }
            }
          }
        } catch {
          // ignore dynamic fetch errors; static entries still ship
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
