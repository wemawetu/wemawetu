import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, FileText, Bell, Phone, 
  LogOut, Menu, X, Plus, Trash2, Edit, Eye, EyeOff,
  Loader2, Save, Mail, BarChart3, Coins, Image,
  CreditCard, ShoppingBag, Megaphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PaymentConfigTab } from "@/components/admin/PaymentConfigTab";
import { MerchandiseTab } from "@/components/admin/MerchandiseTab";
import { ContactInfoTab } from "@/components/admin/ContactInfoTab";
import CampaignsTab from "@/components/admin/CampaignsTab";

type TabType = "dashboard" | "blogs" | "announcements" | "contacts" | "submissions" | "impact" | "programs" | "crypto" | "payments" | "merchandise" | "campaigns";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  published: boolean;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  active: boolean;
  priority: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string | null;
  sort_order: number | null;
  active: boolean;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean | null;
  created_at: string;
}

interface ImpactStat {
  id: string;
  icon: string;
  value: string;
  label: string;
  color: string;
  sort_order: number | null;
  active: boolean;
}

interface Program {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  icon: string;
  link: string | null;
  sort_order: number | null;
  active: boolean;
}

interface CryptoConfig {
  id: string;
  coin_name: string;
  coin_symbol: string;
  contract_address: string;
  network: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  how_to_buy: string | null;
  active: boolean;
}

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data states
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [impactStats, setImpactStats] = useState<ImpactStat[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cryptoConfig, setCryptoConfig] = useState<CryptoConfig | null>(null);

  // Form states
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(null);
  const [editingImpact, setEditingImpact] = useState<ImpactStat | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingCrypto, setEditingCrypto] = useState<CryptoConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }
    
    setSession(session);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", session.user.id)
      .single();

    if (!profile?.is_admin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    loadData();
  }

  async function loadData() {
    const [blogsRes, announcementsRes, contactsRes, submissionsRes, impactRes, programsRes, cryptoRes] = await Promise.all([
      supabase.from("blogs").select("*").order("created_at", { ascending: false }),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_info").select("*").order("sort_order"),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("impact_stats").select("*").order("sort_order"),
      supabase.from("programs").select("*").order("sort_order"),
      supabase.from("crypto_config").select("*").limit(1).maybeSingle()
    ]);

    if (blogsRes.data) setBlogs(blogsRes.data);
    if (announcementsRes.data) setAnnouncements(announcementsRes.data);
    if (contactsRes.data) setContactInfo(contactsRes.data);
    if (submissionsRes.data) setSubmissions(submissionsRes.data);
    if (impactRes.data) setImpactStats(impactRes.data);
    if (programsRes.data) setPrograms(programsRes.data);
    if (cryptoRes.data) setCryptoConfig(cryptoRes.data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  // Blog handlers
  async function saveBlog(blog: Partial<Blog>) {
    setSaving(true);
    if (blog.id) {
      const { error } = await supabase.from("blogs").update(blog).eq("id", blog.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Success", description: "Blog updated" });
    } else {
      const { error } = await supabase.from("blogs").insert([{ 
        title: blog.title!, 
        slug: blog.slug!, 
        content: blog.content!, 
        excerpt: blog.excerpt, 
        featured_image: blog.featured_image, 
        published: blog.published 
      }]);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Success", description: "Blog created" });
    }
    setSaving(false);
    setEditingBlog(null);
    loadData();
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this blog?")) return;
    await supabase.from("blogs").delete().eq("id", id);
    toast({ title: "Deleted" });
    loadData();
  }

  async function toggleBlogPublished(id: string, published: boolean) {
    await supabase.from("blogs").update({ published: !published }).eq("id", id);
    loadData();
  }

  // Announcement handlers
  async function saveAnnouncement(announcement: Partial<Announcement>) {
    setSaving(true);
    if (announcement.id) {
      await supabase.from("announcements").update(announcement).eq("id", announcement.id);
    } else {
      await supabase.from("announcements").insert([{ 
        title: announcement.title!, 
        content: announcement.content!, 
        active: announcement.active, 
        priority: announcement.priority 
      }]);
    }
    setSaving(false);
    setEditingAnnouncement(null);
    loadData();
    toast({ title: "Saved" });
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    loadData();
  }

  // Contact info handlers
  async function saveContactInfo(contact: Partial<ContactInfo>) {
    setSaving(true);
    if (contact.id) {
      await supabase.from("contact_info").update(contact).eq("id", contact.id);
    } else {
      await supabase.from("contact_info").insert([{ 
        type: contact.type!, 
        label: contact.label!, 
        value: contact.value!, 
        active: contact.active, 
        sort_order: contact.sort_order 
      }]);
    }
    setSaving(false);
    setEditingContact(null);
    loadData();
    toast({ title: "Saved" });
  }

  async function deleteContactInfo(id: string) {
    if (!confirm("Delete this contact info?")) return;
    await supabase.from("contact_info").delete().eq("id", id);
    loadData();
  }

  // Submission handlers
  async function markSubmissionRead(id: string, read: boolean) {
    await supabase.from("contact_submissions").update({ read: !read }).eq("id", id);
    loadData();
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Delete this submission?")) return;
    await supabase.from("contact_submissions").delete().eq("id", id);
    loadData();
  }

  // Impact stats handlers
  async function saveImpactStat(stat: Partial<ImpactStat>) {
    setSaving(true);
    if (stat.id) {
      await supabase.from("impact_stats").update(stat).eq("id", stat.id);
    } else {
      await supabase.from("impact_stats").insert([{ 
        icon: stat.icon!, 
        value: stat.value!, 
        label: stat.label!, 
        color: stat.color || "text-primary",
        sort_order: stat.sort_order || 0,
        active: stat.active ?? true
      }]);
    }
    setSaving(false);
    setEditingImpact(null);
    loadData();
    toast({ title: "Saved" });
  }

  async function deleteImpactStat(id: string) {
    if (!confirm("Delete this stat?")) return;
    await supabase.from("impact_stats").delete().eq("id", id);
    loadData();
  }

  // Program handlers
  async function saveProgram(program: Partial<Program>) {
    setSaving(true);
    if (program.id) {
      await supabase.from("programs").update(program).eq("id", program.id);
    } else {
      await supabase.from("programs").insert([{ 
        title: program.title!, 
        description: program.description!, 
        icon: program.icon || "Heart",
        image_url: program.image_url,
        link: program.link || "/programs",
        sort_order: program.sort_order || 0,
        active: program.active ?? true
      }]);
    }
    setSaving(false);
    setEditingProgram(null);
    loadData();
    toast({ title: "Saved" });
  }

  async function deleteProgram(id: string) {
    if (!confirm("Delete this program?")) return;
    await supabase.from("programs").delete().eq("id", id);
    loadData();
  }

  // Crypto handlers
  async function saveCrypto(crypto: Partial<CryptoConfig>) {
    setSaving(true);
    if (crypto.id) {
      await supabase.from("crypto_config").update(crypto).eq("id", crypto.id);
    } else {
      await supabase.from("crypto_config").insert([{ 
        coin_name: crypto.coin_name!, 
        coin_symbol: crypto.coin_symbol!, 
        contract_address: crypto.contract_address!,
        network: crypto.network || "Solana",
        description: crypto.description,
        logo_url: crypto.logo_url,
        website_url: crypto.website_url,
        how_to_buy: crypto.how_to_buy,
        active: crypto.active ?? true
      }]);
    }
    setSaving(false);
    setEditingCrypto(null);
    loadData();
    toast({ title: "Saved" });
  }

  async function deleteCrypto(id: string) {
    if (!confirm("Delete crypto config?")) return;
    await supabase.from("crypto_config").delete().eq("id", id);
    setCryptoConfig(null);
    loadData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "campaigns", label: "Crowdfunding", icon: Megaphone },
    { id: "blogs", label: "Blog Posts", icon: FileText },
    { id: "announcements", label: "Announcements", icon: Bell },
    { id: "contacts", label: "Contact Info", icon: Phone },
    { id: "submissions", label: "Messages", icon: Mail },
    { id: "impact", label: "Impact Stats", icon: BarChart3 },
    { id: "programs", label: "Programs", icon: Image },
    { id: "crypto", label: "Crypto Coin", icon: Coins },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "merchandise", label: "Merchandise", icon: ShoppingBag },
  ];

  const iconOptions = ["Users", "Droplets", "Home", "TreePine", "GraduationCap", "Heart", "Leaf"];
  const colorOptions = ["text-primary", "text-secondary", "text-accent"];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <span className="font-display text-lg font-bold text-foreground">Admin Panel</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] lg:h-screen w-64 bg-card border-r border-border z-40
          transform transition-transform duration-300
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="p-6 border-b border-border hidden lg:block">
            <span className="font-display text-xl font-bold text-foreground">Admin Panel</span>
            <p className="text-sm text-muted-foreground">Wemawetu Foundation</p>
          </div>
          
          <nav className="p-4 space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${activeTab === item.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.id === "submissions" && submissions.filter(s => !s.read).length > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                    {submissions.filter(s => !s.read).length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 min-h-screen">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <FileText className="h-8 w-8 text-primary mb-4" />
                  <p className="text-3xl font-bold text-foreground">{blogs.length}</p>
                  <p className="text-muted-foreground">Blog Posts</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <Bell className="h-8 w-8 text-accent mb-4" />
                  <p className="text-3xl font-bold text-foreground">{announcements.filter(a => a.active).length}</p>
                  <p className="text-muted-foreground">Active Announcements</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <BarChart3 className="h-8 w-8 text-secondary mb-4" />
                  <p className="text-3xl font-bold text-foreground">{impactStats.length}</p>
                  <p className="text-muted-foreground">Impact Stats</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <Mail className="h-8 w-8 text-purple-500 mb-4" />
                  <p className="text-3xl font-bold text-foreground">{submissions.filter(s => !s.read).length}</p>
                  <p className="text-muted-foreground">Unread Messages</p>
                </div>
              </div>
            </div>
          )}

          {/* Blogs */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl font-bold text-foreground">Blog Posts</h1>
                <Button onClick={() => setEditingBlog({ id: "", title: "", slug: "", content: "", excerpt: null, featured_image: null, published: false, created_at: "" })}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>

              {editingBlog && (
                <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                  <h2 className="font-semibold text-foreground">{editingBlog.id ? "Edit" : "New"} Blog Post</h2>
                  <input type="text" placeholder="Title" value={editingBlog.title} onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <input type="text" placeholder="Slug (url-friendly)" value={editingBlog.slug} onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <input type="text" placeholder="Featured Image URL" value={editingBlog.featured_image || ""} onChange={(e) => setEditingBlog({ ...editingBlog, featured_image: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <textarea placeholder="Excerpt" value={editingBlog.excerpt || ""} onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background h-20" />
                  <textarea placeholder="Content" value={editingBlog.content} onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background h-40" />
                  <div className="flex gap-3">
                    <Button onClick={() => saveBlog(editingBlog)} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingBlog(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div key={blog.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground">/{blog.slug} · {format(new Date(blog.created_at), "MMM d, yyyy")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => toggleBlogPublished(blog.id, blog.published)}>
                        {blog.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingBlog(blog)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteBlog(blog.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements */}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl font-bold text-foreground">Announcements</h1>
                <Button onClick={() => setEditingAnnouncement({ id: "", title: "", content: "", active: true, priority: "normal", start_date: null, end_date: null, created_at: "" })}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </div>

              {editingAnnouncement && (
                <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                  <h2 className="font-semibold text-foreground">{editingAnnouncement.id ? "Edit" : "New"} Announcement</h2>
                  <input type="text" placeholder="Title" value={editingAnnouncement.title} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <textarea placeholder="Content" value={editingAnnouncement.content} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background h-32" />
                  <select value={editingAnnouncement.priority || "normal"} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, priority: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background">
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <div className="flex gap-3">
                    <Button onClick={() => saveAnnouncement(editingAnnouncement)} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
                    <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{ann.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ann.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {ann.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{ann.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingAnnouncement(ann)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteAnnouncement(ann.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {activeTab === "contacts" && (
            <ContactInfoTab contactInfo={contactInfo} onDataChange={loadData} />
          )}

          {/* Submissions */}
          {activeTab === "submissions" && (
            <div className="space-y-6">
              <h1 className="font-display text-3xl font-bold text-foreground">Contact Submissions</h1>
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className={`bg-card p-4 rounded-xl border ${sub.read ? "border-border" : "border-primary"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-foreground">{sub.name}</h3>
                          {!sub.read && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">New</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">{sub.email}</p>
                        {sub.subject && <p className="text-sm font-medium text-foreground mt-2">{sub.subject}</p>}
                        <p className="text-sm text-muted-foreground mt-1">{sub.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{format(new Date(sub.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => markSubmissionRead(sub.id, sub.read || false)}>
                          {sub.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteSubmission(sub.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && <p className="text-center text-muted-foreground py-8">No submissions yet</p>}
              </div>
            </div>
          )}

          {/* Impact Stats */}
          {activeTab === "impact" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl font-bold text-foreground">Impact Stats</h1>
                <Button onClick={() => setEditingImpact({ id: "", icon: "Heart", value: "", label: "", color: "text-primary", sort_order: 0, active: true })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stat
                </Button>
              </div>

              {editingImpact && (
                <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                  <h2 className="font-semibold text-foreground">{editingImpact.id ? "Edit" : "New"} Impact Stat</h2>
                  <select value={editingImpact.icon} onChange={(e) => setEditingImpact({ ...editingImpact, icon: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background">
                    {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                  <input type="text" placeholder="Value (e.g., 50,000+)" value={editingImpact.value} onChange={(e) => setEditingImpact({ ...editingImpact, value: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <input type="text" placeholder="Label (e.g., Lives Impacted)" value={editingImpact.label} onChange={(e) => setEditingImpact({ ...editingImpact, label: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <select value={editingImpact.color} onChange={(e) => setEditingImpact({ ...editingImpact, color: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background">
                    {colorOptions.map(color => <option key={color} value={color}>{color}</option>)}
                  </select>
                  <input type="number" placeholder="Sort Order" value={editingImpact.sort_order || 0} onChange={(e) => setEditingImpact({ ...editingImpact, sort_order: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editingImpact.active} onChange={(e) => setEditingImpact({ ...editingImpact, active: e.target.checked })} />
                    Active
                  </label>
                  <div className="flex gap-3">
                    <Button onClick={() => saveImpactStat(editingImpact)} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
                    <Button variant="outline" onClick={() => setEditingImpact(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {impactStats.map((stat) => (
                  <div key={stat.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                      <div>
                        <h3 className="font-medium text-foreground">{stat.label}</h3>
                        <p className="text-sm text-muted-foreground">Icon: {stat.icon} · Order: {stat.sort_order}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${stat.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {stat.active ? "Active" : "Inactive"}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => setEditingImpact(stat)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteImpactStat(stat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programs */}
          {activeTab === "programs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl font-bold text-foreground">Programs</h1>
                <Button onClick={() => setEditingProgram({ id: "", title: "", description: "", image_url: null, icon: "Heart", link: "/programs", sort_order: 0, active: true })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </div>

              {editingProgram && (
                <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                  <h2 className="font-semibold text-foreground">{editingProgram.id ? "Edit" : "New"} Program</h2>
                  <input type="text" placeholder="Title" value={editingProgram.title} onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <textarea placeholder="Description" value={editingProgram.description} onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background h-24" />
                  <input type="text" placeholder="Image URL" value={editingProgram.image_url || ""} onChange={(e) => setEditingProgram({ ...editingProgram, image_url: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <select value={editingProgram.icon} onChange={(e) => setEditingProgram({ ...editingProgram, icon: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background">
                    {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                  <input type="text" placeholder="Link" value={editingProgram.link || ""} onChange={(e) => setEditingProgram({ ...editingProgram, link: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <input type="number" placeholder="Sort Order" value={editingProgram.sort_order || 0} onChange={(e) => setEditingProgram({ ...editingProgram, sort_order: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editingProgram.active} onChange={(e) => setEditingProgram({ ...editingProgram, active: e.target.checked })} />
                    Active
                  </label>
                  <div className="flex gap-3">
                    <Button onClick={() => saveProgram(editingProgram)} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
                    <Button variant="outline" onClick={() => setEditingProgram(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{program.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{program.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${program.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {program.active ? "Active" : "Inactive"}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => setEditingProgram(program)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteProgram(program.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crypto Config */}
          {activeTab === "crypto" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl font-bold text-foreground">Crypto Coin</h1>
                {!cryptoConfig && (
                  <Button onClick={() => setEditingCrypto({ id: "", coin_name: "", coin_symbol: "", contract_address: "", network: "Solana", description: null, logo_url: null, website_url: null, how_to_buy: null, active: true })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Configure Coin
                  </Button>
                )}
              </div>

              {editingCrypto && (
                <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                  <h2 className="font-semibold text-foreground">{editingCrypto.id ? "Edit" : "Configure"} Crypto Coin</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Coin Name (e.g., Wemawetu Token)" value={editingCrypto.coin_name} onChange={(e) => setEditingCrypto({ ...editingCrypto, coin_name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                    <input type="text" placeholder="Symbol (e.g., WEMA)" value={editingCrypto.coin_symbol} onChange={(e) => setEditingCrypto({ ...editingCrypto, coin_symbol: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  </div>
                  <input type="text" placeholder="Contract Address" value={editingCrypto.contract_address} onChange={(e) => setEditingCrypto({ ...editingCrypto, contract_address: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background font-mono text-sm" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Network (e.g., Solana)" value={editingCrypto.network} onChange={(e) => setEditingCrypto({ ...editingCrypto, network: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                    <input type="text" placeholder="Logo URL" value={editingCrypto.logo_url || ""} onChange={(e) => setEditingCrypto({ ...editingCrypto, logo_url: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  </div>
                  <input type="text" placeholder="Website URL" value={editingCrypto.website_url || ""} onChange={(e) => setEditingCrypto({ ...editingCrypto, website_url: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background" />
                  <textarea placeholder="Description" value={editingCrypto.description || ""} onChange={(e) => setEditingCrypto({ ...editingCrypto, description: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background h-24" />
                  <textarea placeholder="How to Buy (each line = step)" value={editingCrypto.how_to_buy || ""} onChange={(e) => setEditingCrypto({ ...editingCrypto, how_to_buy: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-border bg-background h-32" />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editingCrypto.active} onChange={(e) => setEditingCrypto({ ...editingCrypto, active: e.target.checked })} />
                    Active (show on website)
                  </label>
                  <div className="flex gap-3">
                    <Button onClick={() => saveCrypto(editingCrypto)} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
                    <Button variant="outline" onClick={() => setEditingCrypto(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              {cryptoConfig && !editingCrypto && (
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {cryptoConfig.logo_url ? (
                        <img src={cryptoConfig.logo_url} alt={cryptoConfig.coin_name} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <Coins className="h-8 w-8 text-primary-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-display text-2xl font-bold text-foreground">{cryptoConfig.coin_name}</h3>
                        <p className="text-muted-foreground">${cryptoConfig.coin_symbol} on {cryptoConfig.network}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cryptoConfig.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {cryptoConfig.active ? "Active" : "Inactive"}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCrypto(cryptoConfig)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteCrypto(cryptoConfig.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
                    <code className="text-sm text-foreground font-mono break-all">{cryptoConfig.contract_address}</code>
                  </div>
                  {cryptoConfig.description && <p className="text-muted-foreground mb-4">{cryptoConfig.description}</p>}
                  {cryptoConfig.website_url && (
                    <a href={cryptoConfig.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      {cryptoConfig.website_url}
                    </a>
                  )}
                </div>
              )}

              {!cryptoConfig && !editingCrypto && (
                <div className="bg-card p-12 rounded-xl border border-dashed border-border text-center">
                  <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">No Crypto Configured</h3>
                  <p className="text-muted-foreground mb-4">Add your Solana token details to enable crypto contributions</p>
                  <Button onClick={() => setEditingCrypto({ id: "", coin_name: "", coin_symbol: "", contract_address: "", network: "Solana", description: null, logo_url: null, website_url: null, how_to_buy: null, active: true })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Configure Coin
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Payment Methods */}
          {activeTab === "payments" && <PaymentConfigTab />}

          {/* Merchandise */}
          {activeTab === "merchandise" && <MerchandiseTab />}

          {/* Campaigns / Crowdfunding */}
          {activeTab === "campaigns" && <CampaignsTab />}
        </main>
      </div>
    </div>
  );
}
