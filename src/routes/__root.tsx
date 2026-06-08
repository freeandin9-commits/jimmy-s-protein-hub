import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import appCss from "../styles.css?url";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-primary">404</h1>
        <h2 className="mt-4 font-display text-2xl uppercase tracking-wider text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That page doesn't exist. Let's get you back to lifting.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Jimmy's Protein — Real Fuel. No Junk." },
      { name: "description", content: "Premium protein powder for athletes who train hard. Clean ingredients, bold flavors, real results." },
      { property: "og:title", content: "Jimmy's Protein — Real Fuel. No Junk." },
      { property: "og:description", content: "Premium protein powder for athletes who train hard. Clean ingredients, bold flavors, real results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Jimmy's Protein — Real Fuel. No Junk." },
      { name: "twitter:description", content: "Premium protein powder for athletes who train hard. Clean ingredients, bold flavors, real results." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a1d042ba-f197-43ca-85a6-cd2a06e686ec/id-preview-edf05c9f--a6dec7b2-1c45-4340-892d-dee33ed62e30.lovable.app-1777394069048.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a1d042ba-f197-43ca-85a6-cd2a06e686ec/id-preview-edf05c9f--a6dec7b2-1c45-4340-892d-dee33ed62e30.lovable.app-1777394069048.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Figtree:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  // Hide store chrome on admin/login routes
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = path.startsWith("/admin") || path === "/login";

  if (isAdminRoute) {
    return (
      <>
        <Outlet />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toaster richColors position="top-center" />
    </div>
  );
}
