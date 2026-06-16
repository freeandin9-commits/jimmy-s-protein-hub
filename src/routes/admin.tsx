import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  BarChart3,
  LogOut,
  Dumbbell,
  ExternalLink,
  Megaphone,
  Tags,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Jimmy's Protein" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const navItems: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/hero", label: "Hero Section", icon: Sparkles },
  { to: "/admin/ads", label: "Ads", icon: Megaphone },
  { to: "/admin/shop-ads", label: "Shop Banners", icon: ImageIcon },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
};

// Initial mock data matching your blog page
const initialPosts: Post[] = [
  {
    slug: "whey-vs-isolate",
    title: "Whey Protein vs Isolate: Which One Should You Pick?",
    excerpt: "Understand the difference between whey concentrate and isolate, and choose the right one for your goals.",
    date: "Jun 2, 2026",
    category: "Nutrition",
  },
  {
    slug: "pre-workout-guide",
    title: "A Beginner's Guide to Pre-Workout Supplements",
    excerpt: "What ingredients actually matter, how to time your dose, and when you don't need a pre-workout at all.",
    date: "May 24, 2026",
    category: "Training",
  },
  {
    slug: "creatine-myths",
    title: "Creatine: 5 Common Myths Debunked",
    excerpt: "Creatine is one of the most researched supplements out there — here's what the science actually says.",
    date: "May 10, 2026",
    category: "Supplements",
  },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Blog management state
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category: "Nutrition",
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      toast.error("You are not authorized to access the admin panel.");
      navigate({ to: "/" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="h-8 w-8 text-yellow-400 animate-pulse" />
          <div className="text-sm tracking-widest uppercase font-medium text-zinc-400">Loading admin panel…</div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  // Open modal for creating a new post
  const handleCreateNew = () => {
    setEditingPost(null);
    setFormData({ title: "", slug: "", excerpt: "", category: "Nutrition" });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing post
  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
    });
    setIsModalOpen(true);
  };

  // Delete a post
  const handleDeleteClick = (slug: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setPosts(posts.filter((p) => p.slug !== slug));
      toast.success("Post deleted successfully!");
    }
  };

  // Handle Form Submit (Save / Update)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.excerpt) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (editingPost) {
      // Update existing
      setPosts(posts.map((p) => (p.slug === editingPost.slug ? { ...p, ...formData, date: p.date } : p)));
      toast.success("Post updated successfully!");
    } else {
      // Create new
      if (posts.some((p) => p.slug === formData.slug)) {
        toast.error("A post with this slug already exists.");
        return;
      }
      const newPost: Post = {
        ...formData,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setPosts([newPost, ...posts]);
      toast.success("Post created successfully!");
    }

    setIsModalOpen(false);
  };

  // Check if we are directly on the main admin path to show the blog manager dashboard
  const isMainAdminDashboard = location.pathname === "/admin";

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-yellow-400 selection:text-zinc-950">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-md md:flex">
        {/* Brand Header */}
        <div className="flex h-20 items-center gap-2.5 border-b border-zinc-800/80 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-400/10">
            <Dumbbell className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg tracking-wider text-yellow-400 leading-none">JIMMY'S</span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mt-0.5">
              Control Center
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 group ${
                  active
                    ? "bg-yellow-400 text-zinc-950 shadow-md shadow-yellow-400/10"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? "stroke-[2.5]" : "group-hover:scale-110"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="border-t border-zinc-800/80 p-4 space-y-2 bg-zinc-900/20">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-800/60 hover:text-yellow-400 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Live Storefront
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>

          <div className="mt-2 border-t border-zinc-800/50 pt-3 px-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-zinc-500 font-medium truncate flex-1" title={user.email ?? ""}>
              {user.email}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Structure */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-yellow-400 text-zinc-950">
              <Dumbbell className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="font-display font-black text-md tracking-wider text-yellow-400">JIMMY'S ADMIN</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 p-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Mobile Horizontal Navigation Track */}
        <nav className="flex gap-2 overflow-x-auto border-b border-zinc-800 bg-zinc-900/40 px-4 py-2.5 scrollbar-none md:hidden">
          {navItems.map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  active ? "bg-yellow-400 text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Main Interface Window */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-zinc-950">
          <div className="mx-auto max-w-7xl">
            {isMainAdminDashboard ? (
              /* Embedded Blog Management Section inside Dashboard View */
              <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-zinc-800 pb-5">
                  <div>
                    <h1 className="text-2xl font-black tracking-wider text-yellow-400 uppercase font-display flex items-center gap-2">
                      <FileText className="h-6 w-6 stroke-[2]" /> Blog Post Manager
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                      Create, edit and manage articles displayed on your Nutrin Journal storefront blog.
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateNew}
                    className="bg-yellow-400 text-zinc-950 hover:bg-yellow-500 font-bold uppercase tracking-wider text-xs px-4"
                  >
                    <Plus className="mr-1.5 h-4 w-4 stroke-[2.5]" /> Add New Post
                  </Button>
                </div>

                {/* Table list of articles */}
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-300">
                      <thead className="bg-zinc-900 text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="px-6 py-4">Title</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Date Added</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {posts.map((post) => (
                          <tr key={post.slug} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-6 py-4 font-medium">
                              <div className="text-zinc-100 font-semibold">{post.title}</div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">Slug: {post.slug}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-yellow-400 border border-zinc-700/50">
                                {post.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-400">{post.date}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(post)}
                                  className="h-8 w-8 p-0 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800"
                                  title="Edit Post"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(post.slug)}
                                  className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-950/20"
                                  title="Delete Post"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>

      {/* Dynamic Edit/Create Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm antialiased animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-black font-display text-yellow-400 uppercase tracking-wide mb-4">
              {editingPost ? "Edit Journal Article" : "Create New Journal Article"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Article Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Whey Protein vs Isolate"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, "-") })}
                  placeholder="e.g., whey-vs-isolate"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                >
                  <option value="Nutrition">Nutrition</option>
                  <option value="Training">Training</option>
                  <option value="Supplements">Supplements</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Excerpt / Brief Description
                </label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Write a catchy summary for the article preview card..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-100 font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-400 text-zinc-950 hover:bg-yellow-500 font-bold uppercase tracking-wider text-xs px-5"
                >
                  {editingPost ? "Save Changes" : "Publish Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
