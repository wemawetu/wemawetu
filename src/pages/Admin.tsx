import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, FileText, Bell, Phone, Image, 
  LogOut, Menu, X, Plus, Trash2, Edit, Eye, EyeOff,
  Loader2, Save, Upload, Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type TabType = "dashboard" | "blogs" | "announcements" | "contacts" | "submissions";

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

  // Form states
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(null);
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

    // Check if user is admin
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
    const [blogsRes, announcementsRes, contactsRes, submissionsRes] = await Promise.all([
      supabase.from("blogs").select("*").order("created_at", { ascending: false }),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_info").select("*").order("sort_order"),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false })
    ]);

    if (blogsRes.data) setBlogs(blogsRes.data);
    if (announcementsRes.data) setAnnouncements(announcementsRes.data);
    if (contactsRes.data) setContactInfo(contactsRes.data);
    if (submissionsRes.data) setSubmissions(submissionsRes.data);
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
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Blog updated successfully" });
      }
    } else {
      const { error } = await supabase.from("blogs").insert([{ title: blog.title!, slug: blog.slug!, content: blog.content!, excerpt: blog.excerpt, featured_image: blog.featured_image, published: blog.published }]);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Blog created successfully" });
      }
    }
    setSaving(false);
    setEditingBlog(null);
    loadData();
  }

  async function deleteBlog(id: string) {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted", description: "Blog removed" });
      loadData();
    }
  }

  async function toggleBlogPublished(id: string, published: boolean) {
    await supabase.from("blogs").update({ published: !published }).eq("id", id);
    loadData();
  }

  // Announcement handlers
  async function saveAnnouncement(announcement: Partial<Announcement>) {
    setSaving(true);
    if (announcement.id) {
      const { error } = await supabase.from("announcements").update(announcement).eq("id", announcement.id);
      if (!error) toast({ title: "Success", description: "Announcement updated" });
    } else {
      const { error } = await supabase.from("announcements").insert([{ title: announcement.title!, content: announcement.content!, active: announcement.active, priority: announcement.priority }]);
      if (!error) toast({ title: "Success", description: "Announcement created" });
    }
    setSaving(false);
    setEditingAnnouncement(null);
    loadData();
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    toast({ title: "Deleted" });
    loadData();
  }

  // Contact info handlers
  async function saveContactInfo(contact: Partial<ContactInfo>) {
    setSaving(true);
    if (contact.id) {
      await supabase.from("contact_info").update(contact).eq("id", contact.id);
    } else {
      await supabase.from("contact_info").insert([{ type: contact.type!, label: contact.label!, value: contact.value!, active: contact.active, sort_order: contact.sort_order }]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "blogs", label: "Blog Posts", icon: FileText },
    { id: "announcements", label: "Announcements", icon: Bell },
    { id: "contacts", label: "Contact Info", icon: Phone },
    { id: "submissions", label: "Messages", icon: Mail },
  ];

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
          
          <nav className="p-4 space-y-2">
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
                  <Phone className="h-8 w-8 text-sky-500 mb-4" />
                  <p className="text-3xl font-bold text-foreground">{contactInfo.length}</p>
                  <p className="text-muted-foreground">Contact Entries</p>
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
                  <input
                    type="text"
                    placeholder="Title"
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                  />
                  <input
                    type="text"
                    placeholder="Slug (url-friendly)"
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                  />
                  <input
                    type="text"
                    placeholder="Featured Image URL"
                    value={editingBlog.featured_image || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, featured_image: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                  />
                  <textarea
                    placeholder="Excerpt"
                    value={editingBlog.excerpt || ""}
                    onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background h-20"
                  />
                  <textarea
                    placeholder="Content"
                    value={editingBlog.content}
                    onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background h-40"
                  />
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
                      <Button size="sm" variant="ghost" onClick={() => setEditingBlog(blog)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteBlog(blog.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
                  <input
                    type="text"
                    placeholder="Title"
                    value={editingAnnouncement.title}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                  />
                  <textarea
                    placeholder="Content"
                    value={editingAnnouncement.content}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background h-32"
                  />
                  <select
                    value={editingAnnouncement.priority || "normal"}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <div className="flex gap-3">
                    <Button onClick={() => saveAnnouncement(editingAnnouncement)} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </Button>
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
                      <Button size="sm" variant="ghost" onClick={() => setEditingAnnouncement(ann)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteAnnouncement(ann.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {activeTab === "contacts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl font-bold text-foreground">Contact Info</h1>
                <Button onClick={() => setEditingContact({ id: "", type: "email", label: "", value: "", icon: null, sort_order: 0, active: true })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              {editingContact && (
                <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                  <h2 className="font-semibold text-foreground">{editingContact.id ? "Edit" : "New"} Contact</h2>
                  <select
                    value={editingContact.type}
                    onChange={(e) => setEditingContact({ ...editingContact, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="social">Social Media</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Label (e.g., Main Office)"
                    value={editingContact.label}
                    onChange={(e) => setEditingContact({ ...editingContact, label: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., info@example.com)"
                    value={editingContact.value}
                    onChange={(e) => setEditingContact({ ...editingContact, value: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                  />
                  <div className="flex gap-3">
                    <Button onClick={() => saveContactInfo(editingContact)} disabled={saving}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingContact(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {contactInfo.map((contact) => (
                  <div key={contact.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{contact.label}</h3>
                      <p className="text-sm text-muted-foreground">{contact.type}: {contact.value}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingContact(contact)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteContactInfo(contact.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                          {!sub.read && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">New</span>
                          )}
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
                        <Button size="sm" variant="ghost" onClick={() => deleteSubmission(sub.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No submissions yet</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
