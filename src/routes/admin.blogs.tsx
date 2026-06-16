import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blogs" as any)({
  head: () => ({
    meta: [
      { title: "Manage Blogs — Jimmy's Protein" },
      { name: "robots", content: "noindex, nofollow" }
    ],
  }),
  component: AdminBlogsPage,
});

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
};

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

function AdminBlogsPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category: "Nutrition",
  });

  // Handle auto slug creation from title
  const handleTitleChange = (title: string) => {
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove special chars
      .replace(/[\s_-]+/g, "-") // replace spaces
      .replace(/^-+|-+$/g, ""); // trim dashes
    
    setFormData({
      ...formData,
      title,
      slug: generatedSlug
    });
  };

  const handleCreateNew = () => {
    setEditingPost(null);
    setFormData({ title: "", slug: "", excerpt: "", category: "Nutrition" });
    setIsModalOpen(true);
  };

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

  const handleDeleteClick = (slug: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      setPosts(posts.filter((p) => p.slug !== slug));
      toast.success("Post deleted successfully!");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.excerpt) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (editingPost) {
      // Update
      setPosts(posts.map((p) => (p.slug === editingPost.slug ? { ...p, ...formData, date: p.date } : p)));
      toast.success("Post updated successfully!");
    } else {
      // Create
      if (posts.some((p) => p.slug === formData.slug)) {
        toast.error("An article with this URL slug already exists.");
        return;
      }
      
      const newPost: Post = {
        ...formData,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setPosts([newPost, ...posts]);
      toast.success("New blog post published!");
    }

    setIsModalOpen(false);
  };

  // Filter posts based on search & category filter dropdown
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-yellow-400 uppercase font-display flex items-center gap-2">
            <FileText className="h-6 w-6 stroke-[2]" /> Blog Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Create, update, and manage articles for Nutrin Journal.
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-yellow-400 text-zinc-950 hover:bg-yellow-500 font-bold uppercase tracking-wider text-xs px-4 py-2.5"
        >
          <Plus className="mr-1.5 h-4 w-4 stroke-[2.5]" /> Add New Post
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-zinc-900/20 p-4 rounded-xl border border-zinc-900">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:border-yellow-400 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Nutrition">Nutrition</option>
            <option value="Training">Training</option>
            <option value="Supplements">Supplements</option>
          </select>
        </div>
      </div>

      {/* Articles Table Grid */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900 text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Article Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Published Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr key={post.slug} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-zinc-100 font-semibold truncate">{post.title}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{post.excerpt}</div>
                      <div className="text-[10px] text-yellow-400/70 font-mono mt-1">/{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-yellow-400 border border-zinc-700/50">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400 whitespace-nowrap">{post.date}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(post)}
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(post.slug)}
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-950/20"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-xs uppercase tracking-wider">
                    No articles found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal Pop-up */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-black font-display text-yellow-400 uppercase tracking-wide mb-4">
              {editingPost ? "Edit Blog Post" : "Write Blog Post"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Post Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Creatine: 5 Common Myths Debunked"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
                  URL Slug (Auto generated)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[\s_]+/g, "-") })}
                  placeholder="e.g., creatine-myths"
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
                  Excerpt Summary
                </label>
                <textarea
                  rows={4}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Write a brief snapshot summary for card view previews..."
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
